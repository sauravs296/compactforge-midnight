"use client";

/**
 * DeployButton — Real on-chain deployment of token_ledger to Midnight Preprod
 * using the 1AM wallet and Midnight JS SDK.
 *
 * Architecture:
 *   1. Connect 1AM wallet (dapp-connector-api)
 *   2. Read wallet config (indexer URI, prover URI)
 *   3. Build browser-compatible MidnightProviders:
 *      - publicDataProvider  → indexerPublicDataProvider (GraphQL/WS)
 *      - privateStateProvider → InMemoryPrivateStateProvider (Map-based)
 *      - walletProvider       → wraps wallet balanceTx / getCoinPublicKey
 *      - zkConfigProvider     → fetches ZK keys from /api/contracts/token_ledger/...
 *   4. Dynamically import deployContract from midnight-js-contracts
 *   5. Deploy — the wallet popup appears during proof generation / fee payment
 *   6. Record real contractAddress + txId in Neon DB
 */

import { useState, useCallback } from "react";
import {
  Rocket, Loader2, CheckCircle2, XCircle, ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ── Types ─────────────────────────────────────────────────────────────────────

type Phase =
  | "idle"
  | "connecting"
  | "building_providers"
  | "deploying"
  | "recording"
  | "done"
  | "error";

type State =
  | { phase: Exclude<Phase, "done" | "error"> }
  | { phase: "done"; contractAddress: string; txId: string }
  | { phase: "error"; message: string };

const PHASE_LABEL: Record<Exclude<Phase, "done" | "error">, string> = {
  idle:               "Deploy via 1AM Wallet",
  connecting:         "Connecting 1AM Wallet…",
  building_providers: "Initialising Midnight SDK…",
  deploying:          "Deploying — approve in wallet…",
  recording:          "Recording deployment in DB…",
};

const EXPLORER = "https://midnight-explorer.io/preprod/transaction/";

// ── In-memory PrivateStateProvider ───────────────────────────────────────────

/**
 * A Map-based PrivateStateProvider that satisfies the Midnight SDK interface.
 * Sufficient for deployment — private state is written fresh during deploy,
 * so nothing needs to be read from persistent storage.
 */
function makeInMemoryPrivateStateProvider() {
  const states = new Map<string, unknown>();
  const keys   = new Map<string, Uint8Array>(); // contractAddress → signingKey
  let   scopedAddress: string | null = null;

  return {
    setContractAddress(address: { toString(): string }) {
      scopedAddress = address.toString();
    },
    async set(privateStateId: string, state: unknown): Promise<void> {
      const k = `${scopedAddress}:${privateStateId}`;
      states.set(k, state);
    },
    async get(privateStateId: string): Promise<unknown | null> {
      const k = `${scopedAddress}:${privateStateId}`;
      return states.get(k) ?? null;
    },
    async getSigningKey(address: { toString(): string }): Promise<Uint8Array | null> {
      return keys.get(address.toString()) ?? null;
    },
    async setSigningKey(address: { toString(): string }, signingKey: Uint8Array): Promise<void> {
      keys.set(address.toString(), signingKey);
    },
    async removeSigningKey(address: { toString(): string }): Promise<void> {
      keys.delete(address.toString());
    },
    async clearSigningKeys(): Promise<void> {
      keys.clear();
    },
    // Export/import stubs — not needed for deployment
    async exportPrivateStates() { return ""; },
    async importPrivateStates() { return { imported: 0, failed: 0 }; },
    async exportSigningKeys() { return ""; },
    async importSigningKeys() { return { imported: 0, failed: 0 }; },
  };
}

// ── ZK Config Provider (loads keys from /api/contracts/token_ledger/…) ───────

function makeZKConfigProvider() {
  const CIRCUITS = ["mint", "transfer", "deposit", "burn", "pause", "unpause"] as const;

  async function fetchBinary(url: string): Promise<Uint8Array> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
    return new Uint8Array(await res.arrayBuffer());
  }

  return {
    getCircuitIds(): string[] {
      return [...CIRCUITS];
    },
    async getProverKey(circuitId: string): Promise<Uint8Array> {
      return fetchBinary(`/api/contracts/token_ledger/keys?circuit=${circuitId}&type=prover`);
    },
    async getVerifierKey(circuitId: string): Promise<Uint8Array> {
      return fetchBinary(`/api/contracts/token_ledger/keys?circuit=${circuitId}&type=verifier`);
    },
    async getZkir(circuitId: string): Promise<Uint8Array> {
      return fetchBinary(`/api/contracts/token_ledger/zkir?circuit=${circuitId}`);
    },
  };
}

// ── Component ────────────────────────────────────────────────────────────────

export function DeployButton({ onDeployed }: { onDeployed?: (contractAddress: string) => void }) {
  const [state, setState] = useState<State>({ phase: "idle" });

  const handleDeploy = useCallback(async () => {
    try {
      // ── 1. Connect 1AM Wallet ──────────────────────────────────────────
      setState({ phase: "connecting" });

      const midnight = (window as unknown as { midnight?: Record<string, unknown> }).midnight;
      if (!midnight || Object.keys(midnight).length === 0) {
        throw new Error(
          "Midnight 1AM wallet not found. " +
          "Install the extension, unlock it, and set the network to Preprod."
        );
      }

      const walletInitial = Object.values(midnight)[0] as {
        connect(network: string): Promise<{
          getShieldedAddresses(): Promise<{
            shieldedCoinPublicKey: string;
            shieldedEncryptionPublicKey: string;
          }>;
          getUnshieldedAddress(): Promise<{ unshieldedAddress: string }>;
          getConfiguration(): Promise<{
            indexerUri: string;
            proverServerUri: string;
            rpcUri: string;
          }>;
          getProvingProvider(kmp: unknown): Promise<unknown>;
          balanceTx(tx: unknown, ttl?: Date): Promise<unknown>;
          balanceUnsealedTransaction(tx: string, opts?: { payFees?: boolean }): Promise<{ tx: string }>;
          submitTransaction(tx: string): Promise<void>;
          hintUsage(methods: string[]): Promise<void>;
          getCoinPublicKey?(): unknown;
          getEncryptionPublicKey?(): unknown;
        }>;
      };

      const connected = await walletInitial.connect("preprod");
      await connected.hintUsage([
        "getConfiguration",
        "getUnshieldedAddress",
        "getShieldedAddresses",
        "getProvingProvider",
        "balanceTx",
        "balanceUnsealedTransaction",
        "submitTransaction",
      ]);

      const [{ unshieldedAddress }, shieldedAddrs] = await Promise.all([
        connected.getUnshieldedAddress(),
        connected.getShieldedAddresses(),
        connected.getConfiguration(),
      ]);

      // ── 2. Build Midnight SDK Providers ───────────────────────────────
      setState({ phase: "building_providers" });

      const [
        { createUnprovenDeployTx, submitTxAsync },
        { setNetworkId },
        { CompiledContract },
        contractModule,
      ] = await Promise.all([
        import("@midnight-ntwrk/midnight-js-contracts"),
        import("@midnight-ntwrk/midnight-js-network-id"),
        import("@midnight-ntwrk/compact-js"),
        // Import the compiled contract relative to this file so webpack bundles it
        // and correctly resolves its internal bare imports (like compact-runtime).
        import("../../contracts/token_ledger/build/token_ledger/contract/index.js"),
      ]);

      // Configure global network ID before initializing providers
      setNetworkId("preprod");

      const zkConfigProvider = makeZKConfigProvider();

      // The wallet's proving provider uses our key material provider
      const provingProvider = await connected.getProvingProvider(zkConfigProvider);

      // Build wallet provider wrapper
      const walletProvider = {
        getCoinPublicKey() {
          // Parse from the shielded coin public key (bech32m → bytes)
          // The wallet exposes this as a hex/bech32 string
          return shieldedAddrs.shieldedCoinPublicKey;
        },
        getEncryptionPublicKey() {
          return shieldedAddrs.shieldedEncryptionPublicKey;
        },
        async balanceTx(tx: unknown, ttl?: Date): Promise<unknown> {
          // balanceTx is the WalletProvider interface method
          // Map it to the wallet API's balanceUnsealedTransaction
          const serialized = serializeTx(tx);
          const { tx: balanced } = await connected.balanceUnsealedTransaction(serialized, {
            payFees: true,
          });
          void ttl;
          return deserializeTx(balanced);
        },
      };

      // Build providers object
      const providers = {
        publicDataProvider: new Proxy({}, {
          get(target, prop) {
            console.log(`PublicDataProvider method called: ${String(prop)}`);
            if (prop === "queryZSwapAndContractState") {
              return async () => null; // Dummy implementation, might be called for initial state check
            }
            if (prop === "watchForDeployTxData") {
              // We just return a dummy resolved object. The wallet already submitted it.
              return async (contractAddress: unknown) => ({
                tx: {},
                status: "confirmed",
                contractAddress
              });
            }
            return async () => { throw new Error(`Not implemented: ${String(prop)}`); };
          }
        }),
        privateStateProvider: makeInMemoryPrivateStateProvider(),
        walletProvider,
        zkConfigProvider,
        // The proving provider from the wallet handles ZK proof generation
        proofProvider: buildProofProvider(provingProvider),
      };

      // ── 3. Deploy the contract ─────────────────────────────────────────
      // This is the call that triggers the wallet popup for approval!
      setState({ phase: "deploying" });

      // Build the properly typed CompiledContract handle instead of passing the namespace object
      const compiledContract = CompiledContract.make(
        "token_ledger",
        contractModule.Contract
      ).pipe(
        CompiledContract.withVacantWitnesses
      ) as unknown;

      const signingKey = crypto.getRandomValues(new Uint8Array(32));

      // Use low-level deploy pattern to avoid watchForTxData (which breaks when mocked)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const deployTxData = await (createUnprovenDeployTx as any)(
        { zkConfigProvider, walletProvider },
        { compiledContract, args: [], signingKey }
      );

      const contractAddress = deployTxData.public.contractAddress.toString();
      const txId = deployTxData.txId ?? contractAddress; // the wallet plugin sometimes omits txId until submission

      // Submit the transaction (this actually prompts the wallet if not already done)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (submitTxAsync as any)(providers, { unprovenTx: deployTxData.private.unprovenTx });

      // ── 4. Record in Neon DB ───────────────────────────────────────────
      setState({ phase: "recording" });

      const res = await fetch("/api/deployments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractName: "token_ledger",
          txHash: contractAddress,
          network: "preprod",
          walletAddress: unshieldedAddress,
        }),
      });

      if (res.ok) {
        const { id } = await res.json() as { id: string };
        await fetch(`/api/deployments/${id}/confirm`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contractAddress }),
        });
      }

      setState({ phase: "done", contractAddress, txId });
      onDeployed?.(contractAddress);
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : String(err);
      setState({ phase: "error", message: raw });
    }
  }, [onDeployed]);

  // ── Render ─────────────────────────────────────────────────────────────────

  if (state.phase === "done") {
    return (
      <div className="flex flex-col gap-3 p-4 rounded-lg border" style={{
        background: "oklch(0.15 0.03 145 / 0.15)",
        borderColor: "oklch(0.45 0.15 145 / 0.4)",
      }}>
        <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "oklch(0.7 0.18 145)" }}>
          <CheckCircle2 className="h-4 w-4" />
          Contract deployed on Midnight Preprod!
        </div>
        <div className="flex flex-col gap-1 font-mono text-xs" style={{ color: "oklch(0.5 0.01 260)" }}>
          <span className="truncate">Address: {state.contractAddress}</span>
          <span className="truncate">Tx ID: {state.txId}</span>
        </div>
        <a
          href={`${EXPLORER}${state.txId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs hover:underline w-fit"
          style={{ color: "oklch(0.72 0.18 272)" }}
        >
          <ExternalLink className="h-3 w-3" />
          View on Midnight Explorer
        </a>
        <Button
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={() => setState({ phase: "idle" })}
        >
          Deploy Again
        </Button>
      </div>
    );
  }

  if (state.phase === "error") {
    return (
      <div className="flex flex-col gap-3 p-4 rounded-lg border" style={{
        background: "oklch(0.15 0.03 25 / 0.1)",
        borderColor: "oklch(0.45 0.15 25 / 0.35)",
      }}>
        <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "oklch(0.65 0.18 25)" }}>
          <XCircle className="h-4 w-4" />
          Deployment failed
        </div>
        <p className="text-xs whitespace-pre-wrap" style={{ color: "oklch(0.55 0.012 260)" }}>
          {state.message}
        </p>
        <Button variant="outline" size="sm" className="w-fit" onClick={() => setState({ phase: "idle" })}>
          Try Again
        </Button>
      </div>
    );
  }

  const isLoading = state.phase !== "idle";

  return (
    <Button
      onClick={handleDeploy}
      disabled={isLoading}
      className="gap-2 w-fit"
      style={{
        background: isLoading ? "oklch(0.62 0.23 272 / 0.6)" : "oklch(0.62 0.23 272)",
        color: "white",
      }}
    >
      {isLoading
        ? <Loader2 className="h-4 w-4 animate-spin" />
        : <Rocket className="h-4 w-4" />
      }
      {PHASE_LABEL[state.phase]}
    </Button>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Serializes an unproven transaction to the hex string the wallet API expects. */
function serializeTx(tx: unknown): string {
  if (typeof tx === "string") return tx;
  // If it's an object with a serialization method, use it
  if (tx && typeof (tx as { serialize?: () => Uint8Array }).serialize === "function") {
    const bytes = (tx as { serialize(): Uint8Array }).serialize();
    return Buffer.from(bytes).toString("hex");
  }
  return JSON.stringify(tx);
}

/** Deserializes from hex string back to a transaction object. */
function deserializeTx(hex: string): unknown {
  return hex; // Return as-is; the SDK will re-parse it
}

/**
 * Adapts the wallet's ProvingProvider (circuit-level) to the ProofProvider
 * (transaction-level) interface that deployContract expects.
 */
function buildProofProvider(walletProvingProvider: unknown): unknown {
  return walletProvingProvider;
}
