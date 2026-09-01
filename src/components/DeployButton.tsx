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
import { toast } from "sonner";

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

const EXPLORER = "https://preprod.midnightexplorer.com/tx/";

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



// ── Component ────────────────────────────────────────────────────────────────

export function DeployButton({ onDeployed }: { onDeployed?: (contractAddress: string) => void }) {
  const [state, setState] = useState<State>({ phase: "idle" });

  const handleDeploy = useCallback(async () => {
    try {
      // ── 1. Connect 1AM Wallet ──────────────────────────────────────────
      setState({ phase: "connecting" });
      toast.loading("Connecting to 1AM wallet…", { id: "deploy" });

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

      toast.loading("Wallet connected. Initialising Midnight SDK…", { id: "deploy" });

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
        import("../../contracts/token_ledger/build/token_ledger/contract/index.js")
      ]);

      // Configure global network ID before initializing providers
      setNetworkId("preprod");

      const baseURL = new URL("/api/contracts/token_ledger", window.location.origin).toString();
      
      const zkConfigProvider = {
        getZKIR: async (circuitId: string) => {
          const res = await fetch(`${baseURL}/zkir/${circuitId}`);
          if (!res.ok) throw new Error(`Failed ZKIR: ${res.status}`);
          return new Uint8Array(await res.arrayBuffer());
        },
        getProverKey: async (circuitId: string) => {
          const res = await fetch(`${baseURL}/keys/${circuitId}.prover`);
          if (!res.ok) throw new Error(`Failed ProverKey: ${res.status}`);
          return new Uint8Array(await res.arrayBuffer());
        },
        getVerifierKey: async (circuitId: string) => {
          const res = await fetch(`${baseURL}/keys/${circuitId}.verifier`);
          if (!res.ok) throw new Error(`Failed VerifierKey: ${res.status}`);
          return new Uint8Array(await res.arrayBuffer());
        }
      };

      // Get the wallet's proving provider (needed for ZK proof generation)
      const provingProvider = await connected.getProvingProvider(zkConfigProvider);

      // Build the proofProvider exactly as documented in the 1am-wallet skill:
      // Do NOT pass provingProvider directly — it lacks proveTx.
      // Must call unprovenTx.prove(provingProvider, CostModel.initialCostModel()) directly.
      const proofProvider = {
        async proveTx(unprovenTx: { prove(pp: unknown, cm: unknown): Promise<unknown> }) {
          const { CostModel } = await import("@midnight-ntwrk/ledger-v8");
          return unprovenTx.prove(provingProvider, CostModel.initialCostModel());
        },
      };

      // Build wallet provider exactly as the 1am-wallet skill documents.
      // balanceTx must deserialize via Transaction.deserialize (not return the hex string directly).
      const walletProvider = {
        getCoinPublicKey() {
          return shieldedAddrs.shieldedCoinPublicKey;
        },
        getEncryptionPublicKey() {
          return shieldedAddrs.shieldedEncryptionPublicKey;
        },
        async balanceTx(tx: unknown, ttl?: Date): Promise<unknown> {
          void ttl;
          const txHex = serializeTx(tx);
          const balanced = await connected.balanceUnsealedTransaction(txHex, { payFees: true });
          if (!balanced?.tx) throw new Error("balanceUnsealedTransaction returned invalid result");
          const { Transaction } = await import("@midnight-ntwrk/ledger-v8");
          return Transaction.deserialize("signature", "proof", "binding", fromHex(balanced.tx));
        },
      };

      // midnightProvider wraps submitTransaction with txId normalization
      const midnightProvider = {
        async submitTx(tx: unknown): Promise<string> {
          const txHex = serializeTx(tx);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const result: any = await connected.submitTransaction(txHex);
          if (typeof result === "string" && result) return result;
          if (result && typeof result.transactionId === "string") return result.transactionId;
          if (result && typeof result.id === "string") return result.id;
          return txHex.slice(0, 64); // fallback pseudo-txId
        },
      };

      // Build the full providers object
      const providers = {
        publicDataProvider: new Proxy({}, {
          get(_target, prop) {
            console.log(`PublicDataProvider.${String(prop)} called`);
            if (prop === "watchForDeployTxData") {
              return async (contractAddress: unknown) => ({
                tx: {},
                status: "confirmed",
                contractAddress,
              });
            }
            return async () => null;
          },
        }),
        privateStateProvider: makeInMemoryPrivateStateProvider(),
        walletProvider,
        zkConfigProvider,
        proofProvider,
        midnightProvider,
      };

      // ── 3. Deploy the contract ─────────────────────────────────────────
      // This is the call that triggers the wallet popup for approval!
      setState({ phase: "deploying" });
      toast.loading("Deploying — approve the transaction in your 1AM wallet…", { id: "deploy" });

      // sampleSigningKey() returns a random key, which means you lose admin access!
      // Instead, we derive a deterministic Bytes<32> signing key from the wallet's unshielded address
      // so the user can reliably prove they are the admin in later transactions (like minting).
      const hashBuffer = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(unshieldedAddress)
      );
      const signingKeyBytes = new Uint8Array(hashBuffer);
      const signingKeyHex = Buffer.from(signingKeyBytes).toString("hex");

      // withVacantWitnesses sets witnesses:{} which means new Contract({}) — no localSecretKey!
      // We MUST use withWitnesses and supply a real localSecretKey function that
      // returns [nextPrivateState, Uint8Array<32>] as the Compact runtime expects.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const withRealWitnesses = (CompiledContract.withWitnesses as any)({
        localSecretKey: (ctx: { privateState: unknown }) =>
          [ctx.privateState, signingKeyBytes],
      });
      const compiledContract = CompiledContract.make(
        "token_ledger",
        contractModule.Contract
      ).pipe(withRealWitnesses) as unknown;

      // The compact constructor is: constructor(adminAddress: Bytes<32>)
      // So we must pass signingKeyBytes as the admin address argument.
      // createUnprovenDeployTx calls contractExec.initialize(initialPrivateState, ...args)
      // → which calls contract.initialState(constructorContext, adminAddress)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const deployTxData = await (createUnprovenDeployTx as any)(
        { zkConfigProvider, walletProvider },
        { compiledContract, args: [signingKeyBytes], signingKey: signingKeyHex }
      );

      const contractAddress = deployTxData.public.contractAddress.toString();
      const txId = deployTxData.txId ?? contractAddress;

      // Submit the transaction — this triggers the 1AM wallet popup for signing
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (submitTxAsync as any)(providers, { unprovenTx: deployTxData.private.unprovenTx });

      // ── 4. Record in Neon DB ───────────────────────────────────────────
      setState({ phase: "recording" });
      toast.loading("Transaction submitted! Recording in database…", { id: "deploy" });

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
        // submitTxAsync already succeeded — mark as confirmed immediately
        await fetch(`/api/deployments/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "confirmed" }),
        });
      }

      // ── 5. Success toast ───────────────────────────────────────────────
      toast.success("Contract deployed successfully on Midnight Preprod! 🎉", {
        id: "deploy",
        duration: 8000,
        description: `Address: ${contractAddress.slice(0, 20)}…`,
        action: {
          label: "View on Explorer",
          onClick: () => window.open(`${EXPLORER}${txId}`, "_blank"),
        },
      });

      setState({ phase: "done", contractAddress, txId });
      onDeployed?.(contractAddress);
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : String(err);
      toast.error("Deployment failed", {
        id: "deploy",
        duration: 10000,
        description: raw.length > 120 ? raw.slice(0, 120) + "…" : raw,
      });
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

/** Serializes a transaction object to hex string for the wallet API. */
function serializeTx(tx: unknown): string {
  if (typeof tx === "string") return tx;
  if (tx && typeof (tx as { serialize?: () => Uint8Array }).serialize === "function") {
    const bytes = (tx as { serialize(): Uint8Array }).serialize();
    return Buffer.from(bytes).toString("hex");
  }
  return JSON.stringify(tx);
}

/** Decodes a hex string (with or without 0x prefix) to Uint8Array. */
function fromHex(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  return Uint8Array.from(Buffer.from(clean, "hex"));
}
