"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Loader2, Zap, Send, PlusCircle, Flame, ShieldAlert, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const EXPLORER = "https://midnight-explorer.io/preprod/transaction/";

// Dummy private state provider (in-memory)
function makeInMemoryPrivateStateProvider() {
  const states = new Map<string, unknown>();
  return {
    async set(id: string, state: unknown) { states.set(id, state); },
    async get(id: string) { return states.get(id) ?? null; },
    async remove(id: string) { states.delete(id); },
  };
}

// ZK config provider (dummy)
function makeZKConfigProvider() {
  return {
    getZKIR: async (contractName: string) => {
      const res = await fetch(`/api/contracts/${contractName}/zkir`);
      return new Uint8Array(await res.arrayBuffer());
    },
    getProvingKey: async (contractName: string, circuitName: string) => {
      const res = await fetch(`/api/contracts/${contractName}/keys?circuit=${circuitName}&type=pk`);
      return new Uint8Array(await res.arrayBuffer());
    },
    getVerificationKey: async (contractName: string, circuitName: string) => {
      const res = await fetch(`/api/contracts/${contractName}/keys?circuit=${circuitName}&type=vk`);
      return new Uint8Array(await res.arrayBuffer());
    },
  };
}

function serializeTx(tx: unknown): string {
  if (typeof tx === "string") return tx;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (tx && typeof (tx as any).serialize === "function") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bytes = (tx as any).serialize();
    return Buffer.from(bytes).toString("hex");
  }
  return JSON.stringify(tx);
}

function fromHex(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  return Uint8Array.from(Buffer.from(clean, "hex"));
}

function parseAddressToBytes32(addr: string): Uint8Array {
  let hex = addr.replace(/^0x/, "");
  if (hex.length < 64) hex = hex.padStart(64, "0");
  if (hex.length > 64) hex = hex.slice(0, 64);
  return Uint8Array.from(Buffer.from(hex, "hex"));
}

export function InteractPanel({ defaultAddress }: { defaultAddress: string }) {
  const [contractAddress, setContractAddress] = useState(defaultAddress);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [isCalling, setIsCalling] = useState(false);

  const handleCall = useCallback(async (circuitId: string) => {
    if (!contractAddress) {
      toast.error("Please enter a deployed contract address.");
      return;
    }
    try {
      setIsCalling(true);
      toast.loading(`Calling ${circuitId}... Connecting to 1AM wallet`, { id: "interact" });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const midnight = (window as any).midnight;
      if (!midnight?.["1am"]) {
        throw new Error("Midnight 1AM wallet not found.");
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const walletInitial = Object.values(midnight)[0] as any;
      const connected = await walletInitial.connect("preprod");
      await connected.hintUsage([
        "getConfiguration", "getUnshieldedAddress", "getShieldedAddresses",
        "getProvingProvider", "balanceTx", "balanceUnsealedTransaction", "submitTransaction"
      ]);

      const [{ unshieldedAddress }, shieldedAddrs, config] = await Promise.all([
        connected.getUnshieldedAddress(),
        connected.getShieldedAddresses(),
        connected.getConfiguration(),
      ]);

      toast.loading(`Wallet connected. Initialising SDK for ${circuitId}...`, { id: "interact" });

      const [
        { createUnprovenCallTx, submitTxAsync },
        { setNetworkId },
        { CompiledContract },
        contractModule,
        { ContractState }
      ] = await Promise.all([
        import("@midnight-ntwrk/midnight-js-contracts"),
        import("@midnight-ntwrk/midnight-js-network-id"),
        import("@midnight-ntwrk/compact-js"),
        // Import the compiled contract relative to this file
        import("../../contracts/token_ledger/build/token_ledger/contract/index.js"),
        import("@midnight-ntwrk/compact-runtime")
      ]);

      setNetworkId("preprod");
      const zkConfigProvider = makeZKConfigProvider();
      const provingProvider = await connected.getProvingProvider(zkConfigProvider);

      const proofProvider = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async proveTx(unprovenTx: any) {
          const { CostModel } = await import("@midnight-ntwrk/ledger-v8");
          return unprovenTx.prove(provingProvider, CostModel.initialCostModel());
        },
      };

      const walletProvider = {
        getCoinPublicKey: () => shieldedAddrs.shieldedCoinPublicKey,
        getEncryptionPublicKey: () => shieldedAddrs.shieldedEncryptionPublicKey,
        async balanceTx(tx: unknown) {
          const txHex = serializeTx(tx);
          const balanced = await connected.balanceUnsealedTransaction(txHex, { payFees: true });
          if (!balanced?.tx) throw new Error("balanceUnsealedTransaction failed");
          const { Transaction } = await import("@midnight-ntwrk/ledger-v8");
          return Transaction.deserialize("signature", "proof", "binding", fromHex(balanced.tx));
        },
      };

      const midnightProvider = {
        async submitTx(tx: unknown): Promise<string> {
          const txHex = serializeTx(tx);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const result: any = await connected.submitTransaction(txHex);
          if (typeof result === "string" && result) return result;
          if (result?.transactionId) return result.transactionId;
          if (result?.id) return result.id;
          return txHex.slice(0, 64);
        },
      };

      // Implement public data provider purely via fetch to avoid isomorphic-ws turbopack crash
      const publicDataProvider = {
        async queryContractState(address: string) {
          const res = await fetch(config.indexerUri, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              query: `query LATEST_CONTRACT_STATE($address: HexEncoded!) { contractAction(address: $address) { state } }`,
              variables: { address }
            })
          });
          if (!res.ok) throw new Error(`Indexer error ${res.status}`);
          const payload = await res.json();
          const action = payload.data?.contractAction;
          return action ? ContractState.deserialize(fromHex(action.state)) : null;
        },
        async queryZSwapAndContractState() {
          return null; // Only needed if using ZSwap
        }
      };

      const providers = {
        publicDataProvider,
        privateStateProvider: makeInMemoryPrivateStateProvider(),
        walletProvider,
        zkConfigProvider,
        proofProvider,
        midnightProvider,
      };

      toast.loading(`Proving transaction (${circuitId}) and requesting wallet signature...`, { id: "interact" });

      // Derive deterministic admin/caller key exactly as DeployButton does
      const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(unshieldedAddress));
      const signingKeyBytes = new Uint8Array(hashBuffer);

      // We MUST use withWitnesses and supply a real localSecretKey function
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const withRealWitnesses = (CompiledContract.withWitnesses as any)({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        localSecretKey: (ctx: any) => [ctx.privateState, signingKeyBytes],
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const compiledContract = CompiledContract.make(
        "token_ledger",
        contractModule.Contract
      ).pipe(withRealWitnesses) as any;

      // Parse args based on circuit
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let args: any[] = [];
      if (circuitId === "mint" || circuitId === "transfer") {
        args = [parseAddressToBytes32(recipient), BigInt(amount || "0")];
      } else if (circuitId === "deposit" || circuitId === "burn") {
        args = [BigInt(amount || "0")];
      } else if (circuitId === "pause" || circuitId === "unpause") {
        args = [];
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const callTxData = await (createUnprovenCallTx as any)(providers, {
        compiledContract,
        contractAddress,
        circuitId,
        args,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const txId = await (submitTxAsync as any)(providers, {
        unprovenTx: callTxData.private.unprovenTx,
        circuitId,
      });

      toast.success(`${circuitId} transaction successful! 🎉`, {
        id: "interact",
        duration: 8000,
        description: `Tx Hash: ${txId.slice(0, 20)}…`,
        action: {
          label: "View Explorer",
          onClick: () => window.open(`${EXPLORER}${txId}`, "_blank"),
        },
      });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      toast.error(`Transaction failed`, {
        id: "interact",
        duration: 10000,
        description: String(err.message || err).slice(0, 150),
      });
    } finally {
      setIsCalling(false);
    }
  }, [contractAddress, recipient, amount]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" style={{ color: "oklch(0.72 0.18 272)" }} />
          Interact with token_ledger
        </CardTitle>
        <CardDescription>
          Call public and admin circuits on your deployed contract.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Label>Deployed Contract Address</Label>
          <Input 
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
            placeholder="0x..."
            className="font-mono text-xs"
          />
        </div>

        <Tabs defaultValue="deposit" className="w-full">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-4 h-auto">
            <TabsTrigger value="deposit">Deposit</TabsTrigger>
            <TabsTrigger value="transfer">Transfer</TabsTrigger>
            <TabsTrigger value="mint">Mint</TabsTrigger>
            <TabsTrigger value="burn">Burn</TabsTrigger>
            <TabsTrigger value="pause">Pause</TabsTrigger>
            <TabsTrigger value="unpause">Unpause</TabsTrigger>
          </TabsList>

          {/* DEPOSIT */}
          <TabsContent value="deposit" className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">Add tokens to your own balance (Public).</p>
            <div className="grid gap-2">
              <Label>Amount</Label>
              <Input type="number" placeholder="1000" value={amount} onChange={e => setAmount(e.target.value)} />
            </div>
            <Button onClick={() => handleCall("deposit")} disabled={isCalling} className="w-full">
              {isCalling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <PlusCircle className="h-4 w-4 mr-2" />}
              Call deposit()
            </Button>
          </TabsContent>

          {/* TRANSFER */}
          <TabsContent value="transfer" className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">Transfer tokens to another address securely (Public/ZK).</p>
            <div className="grid gap-2">
              <Label>Recipient Address (Hex)</Label>
              <Input placeholder="0x..." value={recipient} onChange={e => setRecipient(e.target.value)} className="font-mono text-xs" />
            </div>
            <div className="grid gap-2">
              <Label>Amount</Label>
              <Input type="number" placeholder="100" value={amount} onChange={e => setAmount(e.target.value)} />
            </div>
            <Button onClick={() => handleCall("transfer")} disabled={isCalling} className="w-full">
              {isCalling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Call transfer()
            </Button>
          </TabsContent>

          {/* MINT */}
          <TabsContent value="mint" className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">Create new tokens (Admin only).</p>
            <div className="grid gap-2">
              <Label>Recipient Address (Hex)</Label>
              <Input placeholder="0x..." value={recipient} onChange={e => setRecipient(e.target.value)} className="font-mono text-xs" />
            </div>
            <div className="grid gap-2">
              <Label>Amount</Label>
              <Input type="number" placeholder="5000" value={amount} onChange={e => setAmount(e.target.value)} />
            </div>
            <Button onClick={() => handleCall("mint")} disabled={isCalling} className="w-full">
              {isCalling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <PlusCircle className="h-4 w-4 mr-2" />}
              Call mint()
            </Button>
          </TabsContent>

          {/* BURN */}
          <TabsContent value="burn" className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">Destroy your own tokens (Public).</p>
            <div className="grid gap-2">
              <Label>Amount</Label>
              <Input type="number" placeholder="50" value={amount} onChange={e => setAmount(e.target.value)} />
            </div>
            <Button onClick={() => handleCall("burn")} disabled={isCalling} className="w-full" variant="destructive">
              {isCalling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Flame className="h-4 w-4 mr-2" />}
              Call burn()
            </Button>
          </TabsContent>

          {/* PAUSE */}
          <TabsContent value="pause" className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">Emergency freeze all operations (Admin only).</p>
            <Button onClick={() => handleCall("pause")} disabled={isCalling} className="w-full" variant="secondary">
              {isCalling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldAlert className="h-4 w-4 mr-2 text-yellow-500" />}
              Call pause()
            </Button>
          </TabsContent>

          {/* UNPAUSE */}
          <TabsContent value="unpause" className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">Resume normal operations (Admin only).</p>
            <Button onClick={() => handleCall("unpause")} disabled={isCalling} className="w-full" variant="secondary">
              {isCalling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldCheck className="h-4 w-4 mr-2 text-green-500" />}
              Call unpause()
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
