# 🛠️ CompactForge

**The Missing Developer Infrastructure & CI/CD Suite for the Midnight Network**

[![Frontend CI](https://github.com/<YOUR_GITHUB_USERNAME>/CompactForge/actions/workflows/frontend.yml/badge.svg)](https://github.com/<YOUR_GITHUB_USERNAME>/CompactForge/actions/workflows/frontend.yml)
[![Contracts CI](https://github.com/<YOUR_GITHUB_USERNAME>/CompactForge/actions/workflows/contracts.yml/badge.svg)](https://github.com/<YOUR_GITHUB_USERNAME>/CompactForge/actions/workflows/contracts.yml)
[![TypeCheck](https://github.com/<YOUR_GITHUB_USERNAME>/CompactForge/actions/workflows/typecheck.yml/badge.svg)](https://github.com/<YOUR_GITHUB_USERNAME>/CompactForge/actions/workflows/typecheck.yml)

---

## 🔗 Live Links

| Resource | URL |
|---|---|
| 🚀 **Live App (Preprod)** | *(Add your Vercel URL after deployment)* |
| 🎥 **Demo Video** | *(Add your Loom / YouTube link after recording)* |
| 🐦 **X / Twitter** | *(Add your X profile link)* |
| 📦 **GitHub Repo** | https://github.com/<YOUR_GITHUB_USERNAME>/CompactForge |

---

## 📋 Preprod Contract

| Field | Value |
|---|---|
| **Contract Address** | *(Deploy via 1AM Wallet → paste here)* |
| **Deployment TxHash** | *(From wallet popup after deploy → paste here)* |
| **Explorer Link** | `https://explorer.preprod.midnight.network/contracts/<CONTRACT_ADDRESS>` |
| **Network** | Midnight Preprod |

---

## 💡 The Problem

Building on Midnight today means fighting friction that has nothing to do with the zero-knowledge logic developers actually want to write:

- **No CI/CD**: There is no standard way to automatically compile and test Compact contracts on every GitHub push.
- **No benchmarking**: Teams have no visibility into proof generation regressions across commits.
- **No shared infrastructure**: Every team spins up their own local Docker proof-server stack from scratch.
- **No dashboard**: There is nowhere to see deployment history, proof times, and CI runs in one place.

These are not edge cases — the Midnight ecosystem hackathon explicitly named these gaps as unmet needs.

---

## 🚀 The Solution

CompactForge is the developer infrastructure layer for Midnight — purpose-built for Compact's dual-state (public ledger + private witness) model.

### Features
- 🔄 **Automated CI/CD** — GitHub Actions pipeline compiles, tests, and benchmarks every Compact contract on every push. Proving-time regressions are caught before they reach Preprod.
- 📊 **Visibility Dashboard** — A Next.js dashboard shows deployment history, per-circuit proving times, and CI run logs in one unified interface.
- 🔒 **Privacy-Correct Smart Contract** — The bundled `token_ledger.compact` demonstrates all core Midnight patterns: `export ledger`, `witness`, `disclose()`, `assert()`, `Map` state, admin access control, and an emergency circuit breaker.
- ☁️ **Preprod-Native** — All endpoints, wallet connections, and contract deployments target the Midnight Preprod network.

---

## 🏗️ Architecture

- **Frontend**: Next.js 16 (App Router), Tailwind CSS v4, Shadcn/UI
- **Smart Contracts**: Compact (Midnight Network) — 6 ZK circuits
- **Database**: Neon Serverless Postgres, Prisma ORM v7
- **Wallet**: 1AM Wallet Extension (Preprod)
- **CI/CD**: GitHub Actions (3 workflows: `contracts.yml`, `frontend.yml`, `typecheck.yml`)
- **Hosting**: Vercel

---

## 📁 File Structure

```
CompactForge/
├── contracts/
│   └── token_ledger/
│       ├── token_ledger.compact          # Privacy-preserving token ledger (6 ZK circuits)
│       └── build/token_ledger/
│           ├── contract/                 # Compiler-generated TypeScript bindings
│           ├── keys/                     # Prover + verifier keys (.prover / .verifier)
│           └── zkir/                     # ZK intermediate representation (.zkir / .bzkir)
├── src/
│   ├── app/
│   │   ├── (marketing)/page.tsx          # Landing page
│   │   └── dashboard/                    # Dashboard pages (overview, contracts, deployments, benchmarks, ci-runs)
│   └── lib/
│       └── midnight/
│           ├── wallet.ts                 # 1AM Wallet connector (real DApp Connector API)
│           ├── wallet.test.ts            # Vitest tests for wallet utilities
│           └── network.ts               # Preprod endpoint config
├── .github/workflows/
│   ├── contracts.yml                     # Compact compile + benchmark + API post
│   ├── frontend.yml                      # TypeCheck → Lint → Test → Build
│   └── typecheck.yml                     # Strict TypeScript check
├── prisma/schema.prisma                  # DB models: Contract, Circuit, Benchmark, CIRun, Deployment
├── SETUP.md                              # Local dev setup guide
└── USAGE.md                              # App usage guide
```

---

## 🔒 Privacy Model (token_ledger.compact)

The `token_ledger.compact` contract separates **public on-chain state** from **private witness data**:

| Layer | Compact keyword | Visibility |
|---|---|---|
| Token balances (`Map<Bytes<32>, Uint<64>>`) | `export ledger` | **Public** — on-chain, readable by all |
| Total supply, owner count, admin, paused flag | `export ledger` | **Public** |
| Caller's secret key | `witness` | **Private** — never leaves the prover |
| ZK circuits (mint, deposit, transfer, burn, pause, unpause) | `export circuit` | Logic compiled to ZK proofs |

Every ledger mutation uses `disclose()` to explicitly declare public disclosure — the Compact compiler enforces this at compile time and rejects any circuit that leaks witness data without `disclose()`.

**Circuits:**
- `mint(recipient, amount)` — admin-only token creation
- `deposit(amount)` — self-funded top-up
- `transfer(recipient, amount)` — ZK-private ownership transfer
- `burn(amount)` — token destruction
- `pause()` / `unpause()` — emergency circuit breaker (admin-only)

---

## ⚡ Quick Start

```bash
git clone https://github.com/<YOUR_GITHUB_USERNAME>/CompactForge.git
cd CompactForge
npm install
cp .env.local.example .env   # fill in Neon DB credentials
npx prisma generate
npx prisma db push
npm run dev
```

See [SETUP.md](./SETUP.md) for full prerequisites and [USAGE.md](./USAGE.md) for day-to-day usage.

---

## 🧪 Tests & CI

```bash
npm test          # Vitest suite
npm run build     # Production build check
```

All three GitHub Actions workflows run on every push to `main`:

1. **`typecheck.yml`** — `tsc --strict --noEmit`
2. **`frontend.yml`** — TypeCheck → Lint → `npm test` → `next build`
3. **`contracts.yml`** — `compact compile` → benchmark → upload artifact → POST to dashboard API

---

*Built for the Midnight Network Hackathon — CompactForge aims to be the Infura + GitHub Actions of the Midnight ecosystem.*
