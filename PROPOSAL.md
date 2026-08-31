# PROPOSAL.md — CompactForge

**Developer Infrastructure & CI/CD Suite for Midnight**

## The Problem

Building on Midnight today means fighting friction that has nothing to do with the actual privacy logic developers want to write. There is no mature CI/CD integration to automatically compile and test Compact contracts on every code push, no easy-to-use block explorer or dashboard to inspect proof verification, contract state, or transaction activity during development, and no shared proof-server infrastructure — every team is left to stand up local Docker environments and manual benchmarking on their own. Midnight's own ecosystem hackathon has explicitly named these gaps as unmet needs, meaning teams are currently shipping without the safety net that mature ecosystems like Ethereum and Solana have long taken for granted.

## The Product

CompactForge becomes the developer infrastructure suite that plugs directly into how teams already build:

- **CI/CD:** A GitHub Action automatically compiles, tests, and benchmarks Compact contracts on every commit, catching proving-time regressions before they reach production.
- **Hosted infrastructure:** A hosted proof-server and Preview-network RPC/indexer service removes the need for developers to run their own local infrastructure just to test a contract.
- **Visibility:** A dashboard visualizes contract deployments, proof generation times, and verification results across a team's projects in one place.

In effect, CompactForge aims to become the quiet, essential layer that Infura and Alchemy became for Ethereum — purpose-built for Compact and Midnight's dual-state model.

## Why This, Why Now

- **First-mover on acknowledged gaps.** The ecosystem itself has already named these as missing pieces, rather than this being a speculative bet on an unvalidated need.
- **No new adoption cost.** It integrates natively into CI/CD workflows teams already use (GitHub Actions), rather than asking them to learn a new tool.
- **Removes real setup friction.** Local proof-server hosting and manual benchmarking are genuine, currently-unsolved pain points for every Midnight team.
- **Debugging aid, not a cosmetic dashboard.** Proof generation time is one of the real bottlenecks in zero-knowledge development; surfacing it per-circuit, per-commit gives teams something they can act on.

## Business Model

A freemium structure mirroring how Infura, Alchemy, and Vercel built durable businesses — give away the on-ramp, charge for scale and reliability:

- **Free:** individual developers and small open-source projects, shared proof-server capacity, limited CI minutes.
- **Team / Enterprise:** private hosted infrastructure, higher throughput, priority access, SLA-backed uptime, priority support.

## Example Workflow

A small team building a confidential DeFi application on Midnight pushes a change to their Compact contract. CompactForge's GitHub Action automatically compiles the contract, runs the test suite, and reports how long proof generation takes for the modified circuit — catching a performance regression before it ever reaches production. The team then checks CompactForge's dashboard to review recent Preview-network deployments and verification activity across all of their active contracts, without needing to run their own block explorer or maintain their own proof server.

## Roadmap

| Phase | Deliverable | Model |
|---|---|---|
| 1 | GitHub Action: compile + test on push, benchmarks in CI log | Free, open source — builds trust |
| 2 | Hosted proof server + Preview-network RPC endpoint | First paid tier |
| 3 | Dashboard: deployments, verification history, proof-performance trends | Included in paid tier |
| 4 | Extended integrations: wallet-connector testing helpers, basic block explorer, formal-verification hooks | Paid tier, hackathon-flagged need |
| 5 | Enterprise tier: dedicated infrastructure, SLA uptime, priority support | Enterprise |

## Architecture Overview

1. Developer pushes code → triggers the CompactForge CI pipeline (compile, test, benchmark).
2. A hosted proof server and RPC endpoint stand ready on demand — no local setup required.
3. A dashboard visualizes deployments, verification results, and performance trends over time.
4. The team monitors every project from a single place, catching regressions before they reach production.

Throughout, CompactForge targets the **Midnight Preview network**, matching the network stage most active Compact development currently happens on.

## Reference Implementation

A working reference build follows the accompanying `IMPLEMENTATION_PLAN.md`: Next.js/TypeScript/shadcn dashboard, Neon+Prisma data layer, 1AM wallet integration, Compact contracts compiled and key-generated via a WSL Ubuntu toolchain, GitHub Actions for both frontend and contract CI, and production hosting on Vercel.

## Ask

Guidance from the Midnight team on proof-server hosting best practices and any existing CI/CD integration standards would be genuinely welcome, as would the opportunity to explore ecosystem grant or partnership support to help accelerate this work.
