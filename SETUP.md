# SETUP.md — CompactForge Local Development

This guide gets you from zero to a running CompactForge dev environment targeting the **Midnight Preprod network**.

## Prerequisites

| Tool | Purpose |
|---|---|
| Windows 10/11 with WSL2 Ubuntu | Compact compiler lives in Linux |
| Node.js v20 LTS | Next.js app |
| Git | Version control |
| Neon account | Serverless Postgres (free tier works) |
| 1AM Wallet browser extension | Signing Preprod transactions |
| GitHub account | CI/CD |
| Vercel account | Hosting |

---

## 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/CompactForge.git
cd CompactForge
npm install
```

---

## 2. Environment Variables

Copy the example file and fill in your Neon credentials:

```bash
cp .env.local.example .env
```

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Neon → your project → **Pooled connection string** |
| `DIRECT_URL` | Neon → your project → **Direct connection string** |
| `NEXT_PUBLIC_MIDNIGHT_PREPROD_RPC` | `https://rpc.preprod.midnight.network` |
| `NEXT_PUBLIC_MIDNIGHT_PREPROD_INDEXER` | `https://indexer.preprod.midnight.network/api/v4/graphql` |

---

## 3. Database Setup

```bash
npx prisma generate
npx prisma db push
```

Optionally seed demo data:
```bash
npx prisma db seed
```

Inspect with:
```bash
npx prisma studio
```

---

## 4. Run the App

```bash
npm run dev
```

Visit `http://localhost:3000`. The landing page loads without a wallet. Connect 1AM to access the full dashboard.

---

## 5. Compile the Compact Contract (WSL)

Open your WSL Ubuntu terminal and run:

```bash
cd /mnt/d/Coding\ Only/Projects/MIDNIGHT/SAURAV/CompactForge

# Compile — downloads public ZK parameters if missing (~24 KB for k=7)
compact compile \
  contracts/token_ledger/token_ledger.compact \
  contracts/token_ledger/build/token_ledger
```

Expected output:
```
Compiling 2 circuits:
  circuit "deposit"  (k=7, rows=92)
  circuit "transfer" (k=9, rows=114)
  circuit "mint"     (k=9, rows=128)
  circuit "burn"     (k=8, rows=105)
  circuit "pause"    (k=7, rows=88)
  circuit "unpause"  (k=7, rows=88)
Overall progress [====================] 6/6
```

This produces prover/verifier keys in `contracts/token_ledger/build/token_ledger/keys/`.

---

## 6. Run the CI Pipeline Locally

```bash
# Inside WSL:
bash scripts/compile-and-test.sh
```

This mirrors what `contracts.yml` GitHub Actions runs on every push to `main`.

---

## 7. Connect 1AM Wallet on Preprod

1. Install the **1AM Wallet** browser extension.
2. Switch the wallet network to **Preprod**.
3. Get test funds from the Midnight Preprod faucet.
4. Click **Connect Wallet** in the CompactForge dashboard.

---

## 8. Run Tests

```bash
npm test          # Vitest suite — wallet.test.ts + utils
npm run build     # Final production build check
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `compact: command not found` in WSL | Ensure the Compact toolchain is on your `$PATH` — add the bin directory to `~/.bashrc` |
| `prisma generate` fails | Run `npm install` first; Prisma 7 needs `@prisma/adapter-pg` |
| Wallet won't connect | Check extension is set to **Preprod**, not Mainnet or Undeployed |
| Build fails with WASM errors | Midnight SDK WASM files require Node 20 — check `node --version` |
| `DIRECT_URL` vs `DATABASE_URL` | Use **pooled** URL for `DATABASE_URL` (runtime), **direct** for `DIRECT_URL` (migrations) |
