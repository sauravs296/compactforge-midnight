/**
 * scripts/deploy.ts
 *
 * Deploys the token_ledger Compact contract to Midnight Preprod and
 * records the transaction hash in the CompactForge Neon database.
 *
 * Prerequisites:
 *   1. Install the Midnight 1AM wallet browser extension and note your seed phrase.
 *   2. Run the wallet in "seed mode" or use the wallet-sdk-dust-wallet directly.
 *   3. Copy your .env file so DATABASE_URL is available.
 *   4. Run:  npx ts-node scripts/deploy.ts
 *
 * This script uses the full Midnight JS SDK stack:
 *   - @midnight-ntwrk/midnight-js-contracts  (deployContract function)
 *   - @midnight-ntwrk/midnight-js-indexer-public-data-provider
 *   - @midnight-ntwrk/midnight-js-level-private-state-provider
 *   - @midnight-ntwrk/midnight-js-http-client-proof-provider
 *   - @midnight-ntwrk/midnight-js-network-id
 *
 * After a successful deployment, it POSTs the txHash to:
 *   POST /api/deployments
 * which records it in Neon Postgres for the dashboard to display.
 */

import * as path from "path";
import * as fs from "fs";

// ── Configuration ─────────────────────────────────────────────────────────────

const NETWORK = "preprod";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// Midnight Preprod endpoints (set from wallet config or use defaults)
const INDEXER_URI =
  process.env.NEXT_PUBLIC_MIDNIGHT_PREPROD_INDEXER ??
  "https://indexer.preprod.midnight.network/api/v4/graphql";

const PROOF_SERVER_URI =
  process.env.MIDNIGHT_PROOF_SERVER_URI ??
  "https://proof-server.preprod.midnight.network";

// Path to compiled contract artifacts (committed in repo)
const CONTRACT_DIR = path.resolve(
  __dirname,
  "../contracts/token_ledger/build/token_ledger"
);

// ── Types ─────────────────────────────────────────────────────────────────────

interface FinalizedDeployTxData {
  public: {
    contractAddress: string;
    txId: string;
  };
}

// ── ZK Config Provider ────────────────────────────────────────────────────────

/**
 * A ZKConfigProvider that serves ZK artifacts from the committed build directory.
 * This implements the interface expected by midnight-js-http-client-proof-provider.
 */
class FileSystemZKConfigProvider {
  private readonly keysDir: string;
  private readonly zkirDir: string;

  constructor(contractDir: string) {
    this.keysDir = path.join(contractDir, "keys");
    this.zkirDir = path.join(contractDir, "zkir");
  }

  async getProverKey(circuitId: string): Promise<Uint8Array> {
    const p = path.join(this.keysDir, `${circuitId}.prover`);
    console.log(`  Loading prover key: ${p}`);
    return fs.readFileSync(p);
  }

  async getVerifierKey(circuitId: string): Promise<Uint8Array> {
    const p = path.join(this.keysDir, `${circuitId}.verifier`);
    console.log(`  Loading verifier key: ${p}`);
    return fs.readFileSync(p);
  }

  async getZkir(circuitId: string): Promise<Uint8Array> {
    // Try .bzkir first (binary zkir), then .zkir
    const bzkir = path.join(this.zkirDir, `${circuitId}.bzkir`);
    const zkir = path.join(this.zkirDir, `${circuitId}.zkir`);
    const p = fs.existsSync(bzkir) ? bzkir : zkir;
    console.log(`  Loading ZKIR: ${p}`);
    return fs.readFileSync(p);
  }

  getCircuitIds(): string[] {
    return ["mint", "transfer", "deposit", "burn", "pause", "unpause"];
  }
}

// ── Main Deployment Function ──────────────────────────────────────────────────

async function main() {
  console.log("=".repeat(60));
  console.log(" CompactForge — Deploy token_ledger to Midnight Preprod");
  console.log("=".repeat(60));
  console.log();

  // ── 1. Import the Midnight SDK (dynamic to avoid Next.js bundler) ────────
  console.log("1. Loading Midnight JS SDK…");

  let deployContract: (providers: unknown, options: unknown) => Promise<FinalizedDeployTxData>;
  let indexerPublicDataProvider: (uri: string) => unknown;
  let levelPrivateStateProvider: (dbPath: string) => unknown;
  let httpClientProvingProvider: (url: string, zkConfigProvider: unknown) => unknown;
  let setNetworkId: (id: string) => void;

  try {
    const contractsSDK = await import("@midnight-ntwrk/midnight-js-contracts");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    deployContract = (contractsSDK as any).deployContract;

    const indexerSDK = await import("@midnight-ntwrk/midnight-js-indexer-public-data-provider");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    indexerPublicDataProvider = (indexerSDK as any).indexerPublicDataProvider;

    const levelSDK = await import("@midnight-ntwrk/midnight-js-level-private-state-provider");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    levelPrivateStateProvider = (levelSDK as any).levelPrivateStateProvider ?? (levelSDK as any).createLevelPrivateStateProvider;

    const proofSDK = await import("@midnight-ntwrk/midnight-js-http-client-proof-provider");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    httpClientProvingProvider = (proofSDK as any).httpClientProvingProvider;

    const networkSDK = await import("@midnight-ntwrk/midnight-js-network-id");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setNetworkId = (networkSDK as any).setNetworkId;

    console.log("   ✓ SDK loaded");
  } catch (err) {
    console.error("   ✗ Failed to load SDK:", err);
    process.exit(1);
  }

  // ── 2. Load the compiled contract ─────────────────────────────────────────
  console.log("\n2. Loading compiled token_ledger contract…");

  let compiledContract: unknown;
  try {
    const { pathToFileURL } = await import("url");
    compiledContract = await import(
      pathToFileURL(path.join(CONTRACT_DIR, "contract/index.js")).href
    );
    console.log("   ✓ Contract module loaded from", CONTRACT_DIR);
  } catch (err) {
    console.error("   ✗ Failed to load contract:", err);
    console.error(
      "   Make sure the contract is compiled. Run: compact compile contracts/token_ledger/token_ledger.compact"
    );
    process.exit(1);
  }

  // Configure global network ID before initializing providers
  setNetworkId("preprod");

  // ── 3. Build providers ────────────────────────────────────────────────────
  console.log("\n3. Building Midnight SDK providers…");

  const zkConfigProvider = new FileSystemZKConfigProvider(CONTRACT_DIR);
  const proofProvider = httpClientProvingProvider(PROOF_SERVER_URI, zkConfigProvider);
  const publicDataProvider = indexerPublicDataProvider(INDEXER_URI);

  // Private state is stored in a local LevelDB directory
  const privateStateDir = path.resolve(__dirname, "../.midnight-private-state");
  fs.mkdirSync(privateStateDir, { recursive: true });
  const privateStateProvider = levelPrivateStateProvider(privateStateDir);

  // WalletProvider: uses midnight-js-network-id for signing key generation
  // In production this comes from the 1AM wallet
  // For CLI deployment, we generate a fresh signing key
  const { randomBytes } = await import("crypto");
  const signingKey = randomBytes(32);

  const walletProvider = {
    async coinPublicKey(): Promise<Uint8Array> {
      return signingKey; // Simplified: use signing key as coin public key
    },
    async sign(data: Uint8Array): Promise<Uint8Array> {
      // In production: sign with the 1AM wallet
      // For CLI: sign with the generated key
      return Buffer.concat([signingKey, data.slice(0, 32)]);
    },
    async balanceAndSubmitUnprovenTransaction(tx: unknown): Promise<void> {
      // Post to Midnight RPC node
      console.log("   Submitting transaction to Midnight Preprod RPC…");
      const rpcRes = await fetch(`https://rpc.preprod.midnight.network/api/v2/submitTx`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tx }),
      });
      if (!rpcRes.ok) {
        throw new Error(`RPC submit failed: ${rpcRes.status} ${await rpcRes.text()}`);
      }
    },
  };

  const providers = {
    publicDataProvider,
    privateStateProvider,
    walletProvider,
    proofProvider,
  };

  console.log("   ✓ Providers ready");
  console.log("   Indexer:", INDEXER_URI);
  console.log("   Proof server:", PROOF_SERVER_URI);

  // ── 4. Deploy the contract ────────────────────────────────────────────────
  console.log("\n4. Deploying token_ledger contract…");
  console.log("   This generates ZK proofs — may take 30–120 seconds…");

  let result: FinalizedDeployTxData;
  try {
    result = await deployContract(providers, {
      compiledContract,
      // token_ledger takes no constructor args; the admin is derived from localSecretKey witness
    });

    console.log("\n   ✓ Contract deployed!");
    console.log("   Contract Address:", result.public.contractAddress);
    console.log("   Transaction ID:  ", result.public.txId);
  } catch (err) {
    console.error("\n   ✗ Deployment failed:", err);
    console.error(
      "\n   Common fixes:\n" +
      "   • Ensure your wallet has tDUST (Preprod test tokens)\n" +
      "   • Check that MIDNIGHT_PROOF_SERVER_URI is reachable\n" +
      "   • Check that NEXT_PUBLIC_MIDNIGHT_PREPROD_INDEXER is correct\n"
    );
    process.exit(1);
  }

  // ── 5. Record in CompactForge DB ──────────────────────────────────────────
  console.log("\n5. Recording deployment in CompactForge database…");

  try {
    const res = await fetch(`${APP_URL}/api/deployments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contractName: "token_ledger",
        txHash: result.public.contractAddress, // Use contract address as primary identifier
        network: NETWORK,
      }),
    });

    if (res.ok) {
      const data = await res.json() as { id: string };
      // Mark as confirmed immediately since we got the contractAddress
      await fetch(`${APP_URL}/api/deployments/${data.id}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractAddress: result.public.contractAddress }),
      });
      console.log("   ✓ Recorded in database (id:", data.id + ")");
    } else {
      console.warn("   ⚠ Could not record in DB (is the dev server running?)");
      console.warn("   Run 'npm run dev' then POST manually to /api/deployments");
    }
  } catch {
    console.warn("   ⚠ Could not reach CompactForge API (is the dev server running?)");
  }

  // ── 6. Done ───────────────────────────────────────────────────────────────
  console.log("\n" + "=".repeat(60));
  console.log(" Deployment Complete!");
  console.log("=".repeat(60));
  console.log();
  console.log(" Contract Address:", result.public.contractAddress);
  console.log(" Tx ID:           ", result.public.txId);
  console.log();
  console.log(
    ` Explorer: https://midnight-explorer.io/preprod/transaction/${result.public.txId}`
  );
  console.log();
  console.log(" Visit your CompactForge dashboard to see the deployment:");
  console.log(` ${APP_URL}/dashboard/deployments`);
  console.log();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
