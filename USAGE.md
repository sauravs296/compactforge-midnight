# 📖 USAGE GUIDE

**CompactForge** is designed to streamline the lifecycle of Midnight Compact smart contracts. This guide will walk you through deploying contracts, generating ZK proofs, and analyzing CI/CD metrics.

## 1. Connecting Your Wallet
1. Ensure the **1AM Wallet** extension is installed in your browser.
2. Switch the wallet network to **Midnight Preprod**.
3. In CompactForge, click **"Deploy & Interact"** on the dashboard.
4. If prompted, grant CompactForge permission to connect to your wallet.

---

## 2. Deploying a Contract
The platform comes pre-configured with a compiled `token_ledger` ZK contract. 
1. Navigate to the **Deploy & Interact** tab.
2. Click the **"Deploy token_ledger"** button.
3. The 1AM wallet will pop up. It will securely pull the Zero-Knowledge Prover keys (`.prover`) and Verifier keys (`.verifier`) from the local CompactForge API server.
4. Approve the transaction in the wallet.
5. Once confirmed on the Preprod network, the contract address will be displayed, and the deployment will be logged in the database.

---

## 3. Interacting with ZK Circuits
After deployment, the **Interact Panel** will unlock, revealing the 6 available ZK circuits: `mint`, `transfer`, `deposit`, `burn`, `pause`, and `unpause`.

1. Select a circuit from the tabs (e.g., **Deposit**).
2. Enter the required arguments (e.g., Amount: `1000`).
3. Click **Execute**.
4. CompactForge will generate the unproven transaction and send it to your 1AM Wallet.
5. The 1AM Wallet Proof Station will generate the cryptographic Zero-Knowledge proof locally and submit the proven transaction to the Preprod ledger.

> **Privacy Note:** Your `localSecretKey` is provided automatically by your wallet environment. Because this is a Zero-Knowledge transaction, the network verifies the state change without ever knowing your secret key!

---

## 4. Viewing CI/CD Metrics
CompactForge acts as a DevOps hub for your contracts:
- **CI Runs Tab:** View live history of GitHub Actions runs. See exactly when a push failed type-checking or if a deployment was skipped.
- **Benchmarks Tab:** Every time code is pushed, the CI pipeline compiles the `.compact` files and measures exactly how many milliseconds it takes to generate ZK proofs for each circuit. You can view these metrics to identify performance regressions over time.
