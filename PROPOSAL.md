# 📄 PROJECT PROPOSAL

## CompactForge: The Developer Infrastructure Suite & CI/CD Pipeline for Midnight Network Compact Contracts

### 🎯 Overview
**CompactForge** was built for the Midnight Network Hackathon to solve a critical developer experience issue: the lack of robust CI/CD, deployment tooling, and proof benchmarking for Zero-Knowledge (ZK) smart contracts written in the Compact language. 

By providing automated builds, Postgres-backed performance tracking, and a one-click deployment interface integrated with the 1AM wallet, CompactForge accelerates the development lifecycle for all privacy-preserving DApps on the Midnight Network.

---

### 🧩 The Problem
When Web3 developers transition to building privacy-first applications, the learning curve is incredibly steep. Learning a new language like Compact is just the beginning. The real friction lies in the tooling:
1. **No Automation:** Teams manually compile `.compact` files locally. There is no standard CI/CD pipeline to verify that a pull request hasn't broken a ZK circuit.
2. **Blind Performance:** Generating ZK proofs is computationally heavy. Developers currently have no way to automatically track if a code change has made proof generation faster or slower.
3. **Deployment Friction:** Testing compiled contracts requires writing custom boilerplate deployment scripts and managing manual keys, drastically slowing down iteration speed.

---

### 💡 Our Solution
CompactForge provides a "Vercel-like" DevOps experience specifically tailored for Midnight smart contracts.

- **GitHub Actions Integration:** We built a CI/CD pipeline that automatically runs `compactc` on every commit. It compiles the code, generates the ZK IR (`.bzkir`), and produces the prover/verifier keys.
- **Proof Benchmarking:** Our CI pipeline times the exact execution speed of the ZK proof generation for every circuit and webhooks the data back to our Neon Postgres database. Teams can track performance regressions over time.
- **Web Dashboard:** A sleek, dark-mode Next.js dashboard that aggregates deployments, CI runs, and benchmarks.
- **1AM Wallet Integration:** A fully integrated web interface that allows developers to deploy contracts to the Preprod network and execute ZK circuits directly from the browser, abstracting away the complex SDK boilerplate.

---

### 🛠️ Technology Stack
- **Smart Contracts:** Compact (Midnight Network)
- **Frontend & API:** Next.js (App Router), React, Tailwind CSS, Shadcn UI
- **Database:** PostgreSQL (Neon) with Prisma ORM
- **CI/CD:** GitHub Actions
- **Wallet Integration:** 1AM Wallet & Midnight JS SDK
- **Testing:** Vitest

---

### 🚀 Impact
CompactForge sets the standard for how development teams building on Midnight will handle their release cycles. By standardizing CI/CD for ZK proofs, teams can build decentralized confidential ledgers, voting systems, and privacy-preserving identity systems with the confidence that every commit is mathematically verified and performance benchmarked before reaching production.
