"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import {
  ArrowLeft, ArrowRight, Terminal, GitBranch, Shield, BarChart3,
  Rocket, Zap, Code2, Server, AlertTriangle, CheckCircle2,
  ExternalLink, BookOpen, Lock, Activity, ChevronRight,
} from "lucide-react";

const BORDER = "oklch(0.22 0.013 265 / 0.55)";
const BG1 = "oklch(0.11 0.012 265)";
const BG2 = "oklch(0.145 0.013 265)";
const BG3 = "oklch(0.125 0.012 265)";
const MUTED = "oklch(0.48 0.01 265)";
const TEXT = "oklch(0.90 0.008 265)";
const ACCENT = "oklch(0.62 0.23 272)";
const YELLOW = "oklch(0.75 0.18 75)";
const GREEN = "oklch(0.65 0.22 145)";
const RED = "oklch(0.62 0.22 22)";

function CB({ code, lang = "bash" }: { code: string; lang?: string }) {
  return (
    <div className="rounded-xl overflow-hidden border text-sm my-4" style={{ borderColor: BORDER, background: "oklch(0.09 0.012 265)" }}>
      <div className="flex items-center px-4 py-2 border-b text-xs font-mono" style={{ borderColor: BORDER, background: BG3, color: MUTED }}>{lang}</div>
      <pre className="p-4 overflow-x-auto leading-relaxed" style={{ color: "oklch(0.78 0.03 265)" }}><code>{code}</code></pre>
    </div>
  );
}

function Note({ children, type = "note" }: { children: React.ReactNode; type?: "note" | "warning" | "tip" }) {
  const c = { note: { b: ACCENT, bg: "oklch(0.62 0.23 272 / 0.07)", icon: "💡", l: "Note" }, warning: { b: YELLOW, bg: "oklch(0.75 0.18 75 / 0.07)", icon: "⚠️", l: "Warning" }, tip: { b: GREEN, bg: "oklch(0.65 0.22 145 / 0.07)", icon: "✅", l: "Tip" } }[type];
  return (
    <div className="rounded-xl border px-5 py-4 my-4 flex gap-3 text-sm" style={{ borderColor: c.b, background: c.bg }}>
      <span className="text-base shrink-0 mt-0.5">{c.icon}</span>
      <div style={{ color: "oklch(0.80 0.012 265)" }}><span className="font-semibold" style={{ color: c.b }}>{c.l} </span>{children}</div>
    </div>
  );
}

function IC({ children }: { children: React.ReactNode }) {
  return <code className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ background: BG2, color: "oklch(0.80 0.12 272)", border: `1px solid ${BORDER}` }}>{children}</code>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="leading-7 my-3" style={{ color: "oklch(0.65 0.012 265)" }}>{children}</p>;
}

function H2({ id, icon: Icon, children }: { id: string; icon?: React.ElementType; children: React.ReactNode }) {
  return <h2 id={id} className="text-2xl font-bold tracking-tight mb-3 mt-14 flex items-center gap-3 scroll-mt-20" style={{ color: TEXT, fontFamily: "var(--font-syne, sans-serif)" }}>{Icon && <Icon className="h-6 w-6 shrink-0" style={{ color: ACCENT }} />}{children}</h2>;
}

function H3({ id, children }: { id: string; children: React.ReactNode }) {
  return <h3 id={id} className="text-lg font-semibold mt-8 mb-2 scroll-mt-20" style={{ color: "oklch(0.85 0.01 265)" }}>{children}</h3>;
}

const NAV = [
  { id: "overview", label: "Overview", icon: BookOpen },
  { id: "prerequisites", label: "Prerequisites", icon: CheckCircle2 },
  { id: "installation", label: "Installation", icon: Terminal },
  { id: "architecture", label: "Architecture", icon: Server },
  { id: "contract", label: "The Contract", icon: Code2 },
  { id: "circuits", label: "Circuits Reference", icon: Shield },
  { id: "cicd", label: "CI/CD Pipeline", icon: GitBranch },
  { id: "dashboard", label: "Dashboard", icon: Activity },
  { id: "deploy-interact", label: "Deploy & Interact", icon: Rocket },
  { id: "benchmarks", label: "Benchmarks", icon: BarChart3 },
  { id: "api-reference", label: "API Reference", icon: Zap },
  { id: "local-only", label: "Why Local Only?", icon: Lock },
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("overview");

  return (
    <div className="min-h-screen flex flex-col" style={{ background: BG1, color: TEXT }}>
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 h-[58px] border-b" style={{ background: "oklch(0.11 0.012 265 / 0.92)", backdropFilter: "blur(20px)", borderColor: BORDER }}>
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.png" width={24} height={24} alt="CompactForge" className="rounded-md" />
            <span className="font-bold text-[14px]" style={{ color: TEXT, fontFamily: "var(--font-syne, sans-serif)" }}>CompactForge</span>
          </Link>
          <span className="hidden sm:flex items-center gap-1 text-xs" style={{ color: MUTED }}><ChevronRight className="h-3 w-3" /> Docs</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="https://github.com/sauravs296/CompactForge" target="_blank" className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border hover:text-white" style={{ borderColor: BORDER, color: MUTED }}>
            <ExternalLink className="h-3 w-3" /> GitHub
          </Link>
          <Link href="/dashboard" className={buttonVariants({ size: "sm" })}>Dashboard <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Link>
        </div>
      </header>

      <div className="flex flex-1 pt-[58px]">
        <aside className="hidden lg:flex flex-col w-60 shrink-0 fixed top-[58px] bottom-0 overflow-y-auto border-r px-3 py-6 gap-0.5" style={{ background: BG3, borderColor: BORDER }}>
          <p className="px-3 mb-3 text-[10px] font-semibold tracking-widest uppercase" style={{ color: MUTED }}>Documentation</p>
          {NAV.map(({ id, label, icon: Icon }) => (
            <a key={id} href={"#" + id} onClick={() => setActiveSection(id)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm hover:text-white" style={{ color: activeSection === id ? TEXT : MUTED, background: activeSection === id ? "oklch(0.62 0.23 272 / 0.10)" : "transparent" }}>
              <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: ACCENT }} />{label}
            </a>
          ))}
          <div className="mt-6 pt-4 border-t" style={{ borderColor: BORDER }}>
            <p className="px-3 mb-2 text-[10px] font-semibold tracking-widest uppercase" style={{ color: MUTED }}>Quick Links</p>
            <a href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:text-white" style={{ color: MUTED }}><Activity className="h-3.5 w-3.5" style={{ color: ACCENT }} /> Dashboard</a>
            <a href="/dashboard/interact" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:text-white" style={{ color: MUTED }}><Zap className="h-3.5 w-3.5" style={{ color: ACCENT }} /> Interact</a>
          </div>
        </aside>

        <main className="flex-1 lg:ml-60 px-6 py-10 pb-32 max-w-none lg:max-w-4xl">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm mb-8 hover:text-white" style={{ color: MUTED }}><ArrowLeft className="h-4 w-4" /> Back to homepage</Link>

          <div className="mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold tracking-wide uppercase mb-4" style={{ borderColor: "oklch(0.62 0.23 272 / 0.35)", color: "oklch(0.72 0.18 272)" }}><BookOpen className="h-3 w-3" /> Developer Documentation</div>
            <h1 className="text-4xl font-bold tracking-tight mb-3" style={{ color: TEXT, fontFamily: "var(--font-syne, sans-serif)" }}>CompactForge Docs</h1>
            <p className="text-lg leading-relaxed max-w-2xl" style={{ color: MUTED }}>Everything you need to build, compile, deploy, and interact with Compact smart contracts on the Midnight Network.</p>
          </div>

          <H2 id="overview" icon={BookOpen}>Overview</H2>
          <div className="rounded-xl border p-5 my-4" style={{ borderColor: BORDER, background: BG2 }}>
            <ul className="space-y-2.5 text-sm" style={{ color: MUTED }}>
              {[["CI/CD Pipeline","GitHub Actions that compile Compact circuits on every push"],["Proof Benchmarking","Per-circuit proving times in Neon Postgres"],["Live Dashboard","Deployments, CI runs, charts — wired to a real database"],["Deploy & Interact","One-click deployment and circuit invocation via 1AM wallet"],["token_ledger","Reference Compact contract with 6 ZK circuits"]].map(([t, d]) => (
                <li key={t as string} className="flex items-start gap-2.5"><CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" style={{ color: ACCENT }} /><span><strong style={{ color: TEXT }}>{t}</strong> — {d}</span></li>
              ))}
            </ul>
          </div>

          <H2 id="prerequisites" icon={CheckCircle2}>Prerequisites</H2>
          <P>Install these before running locally:</P>
          <div className="grid sm:grid-cols-2 gap-3 my-4">
            {[["Node.js >= 18","LTS recommended"],["npm >= 9","or pnpm/yarn"],["Git","for webhooks & CI"],["1AM Wallet","Chrome extension — required for Deploy/Interact"],["Neon Postgres","Free tier; provides DATABASE_URL"],["Compact CLI >= 0.20","For contract compilation in CI"]].map(([n, note]) => (
              <div key={n as string} className="rounded-lg border px-4 py-3 flex items-start gap-3" style={{ borderColor: BORDER, background: BG2 }}>
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" style={{ color: GREEN }} />
                <div><p className="text-sm font-semibold" style={{ color: TEXT }}>{n}</p><p className="text-xs" style={{ color: MUTED }}>{note}</p></div>
              </div>
            ))}
          </div>
          <Note type="warning">The <strong>1AM Wallet Chrome extension</strong> is mandatory for Deploy and Interact. Install from <a href="https://1am.xyz" target="_blank" className="underline" style={{ color: YELLOW }}>1am.xyz</a></Note>

          <H2 id="installation" icon={Terminal}>Installation</H2>
          <H3 id="clone">1. Clone the repository</H3>
          <CB lang="bash" code={"git clone https://github.com/sauravs296/CompactForge.git\ncd CompactForge"} />
          <H3 id="env">2. Environment variables</H3>
          <P>Create a <IC>.env</IC> file:</P>
          <CB lang=".env" code={"DATABASE_URL=\"postgresql://user:pass@host/db?sslmode=require\"\nGITHUB_WEBHOOK_SECRET=\"your_secret\"\nGITHUB_TOKEN=\"ghp_xxxxx\""} />
          <H3 id="setup">3. Install & setup database</H3>
          <CB lang="bash" code={"npm install\nnpx prisma generate\nnpx prisma db push"} />
          <H3 id="run">4. Start dev server</H3>
          <CB lang="bash" code={"npm run dev\n# → http://localhost:3000"} />
          <Note type="tip">Dev server uses <strong>webpack mode</strong> for Midnight SDK WASM compatibility. Already configured in <IC>package.json</IC>.</Note>

          <H2 id="architecture" icon={Server}>Architecture</H2>
          <CB lang="plaintext" code={"CompactForge/\n├── src/\n│   ├── app/\n│   │   ├── (marketing)/page.tsx      ← Landing page\n│   │   ├── docs/page.tsx             ← This docs page\n│   │   ├── dashboard/\n│   │   │   ├── page.tsx              ← Overview (KPIs + charts)\n│   │   │   ├── contracts/page.tsx    ← Contract details\n│   │   │   ├── deployments/page.tsx  ← Deployment history\n│   │   │   ├── benchmarks/page.tsx   ← Proof benchmark table\n│   │   │   ├── ci-runs/page.tsx      ← CI run log\n│   │   │   └── interact/page.tsx     ← Deploy + Interact panel\n│   │   └── api/\n│   │       ├── contracts/token_ledger/\n│   │       │   ├── contract/         ← Metadata endpoint\n│   │       │   ├── zkir/[circuit]/   ← Serves .bzkir ZK IR\n│   │       │   └── keys/[filename]/  ← Serves .prover/.verifier\n│   │       ├── deployments/          ← CRUD for deployments\n│   │       ├── benchmarks/           ← Benchmark data\n│   │       └── ci-runs/              ← Webhook receiver\n│   └── components/\n│       ├── DeployButton.tsx          ← One-click deployment\n│       ├── InteractPanel.tsx         ← 6-circuit interaction\n│       └── WalletConnectButton.tsx   ← 1AM wallet connect\n├── contracts/token_ledger/\n│   ├── token_ledger.compact          ← Compact source\n│   └── build/token_ledger/\n│       ├── contract/index.js         ← Compiled JS module\n│       ├── keys/*.prover             ← ZK prover keys (2-10 MB)\n│       ├── keys/*.verifier           ← ZK verifier keys (~2 KB)\n│       └── zkir/*.bzkir              ← ZK intermediate repr\n├── prisma/schema.prisma              ← DB schema\n└── .github/workflows/                ← 3 CI/CD workflows"} />

          <H2 id="contract" icon={Code2}>The Contract</H2>
          <P><IC>token_ledger.compact</IC> — privacy-preserving token ledger demonstrating the full Midnight ZK model:</P>
          <div className="grid sm:grid-cols-2 gap-3 my-4">
            {[["Public Ledger State","balances, totalSupply, ownerCount, admin, paused — all on-chain"],["Private Witnesses","localSecretKey() — caller key, never touches the chain"],["disclose() calls","Every ledger write wrapped in disclose() as Compact requires"],["ZK-safe arithmetic","Explicit as Uint<64> casts to prevent circuit overflow"],["assert() guards","Access control at compile-time"],["Circuit breaker","pause() / unpause() — admin-only emergency freeze"]].map(([t, d]) => (
              <div key={t as string} className="rounded-lg border px-4 py-3" style={{ borderColor: BORDER, background: BG2 }}>
                <p className="text-sm font-semibold mb-1" style={{ color: TEXT }}>{t}</p><p className="text-xs leading-relaxed" style={{ color: MUTED }}>{d}</p>
              </div>
            ))}
          </div>
          <H3 id="contract-source">Ledger declaration</H3>
          <CB lang="compact" code={"pragma language_version >= 0.20;\nimport CompactStandardLibrary;\n\nexport ledger balances: Map<Bytes<32>, Uint<64>>;\nexport ledger totalSupply: Uint<64>;\nexport ledger ownerCount: Uint<32>;\nexport ledger admin: Bytes<32>;\nexport ledger paused: Boolean;\n\nwitness localSecretKey(): Bytes<32>;\n\nconstructor(adminAddress: Bytes<32>) {\n    admin       = disclose(adminAddress);\n    totalSupply = disclose(0 as Uint<64>);\n    ownerCount  = disclose(0 as Uint<32>);\n    paused      = disclose(false);\n}"} />

          <H2 id="circuits" icon={Shield}>Circuits Reference</H2>
          <P>6 circuits, each with its own ZK prover/verifier keypair:</P>
          <div className="space-y-4 my-4">
            {[
              { name:"deposit",  sig:"deposit(amount: Uint<64>): []",                       access:"Public",     desc:"Adds tokens to caller's own balance via localSecretKey() identity.",    args:[{n:"amount",t:"Uint<64>",note:"Must be > 0"}] },
              { name:"transfer", sig:"transfer(recipient: Bytes<32>, amount: Uint<64>): []", access:"Public",     desc:"ZK-private: proves sender has balance without revealing identity.",     args:[{n:"recipient",t:"Bytes<32>",note:"32-byte public address"},{n:"amount",t:"Uint<64>",note:"<= sender balance"}] },
              { name:"mint",     sig:"mint(recipient: Bytes<32>, amount: Uint<64>): []",     access:"Admin only", desc:"Creates tokens assigned to recipient. Admin key checked in circuit.",   args:[{n:"recipient",t:"Bytes<32>",note:"Address receiving tokens"},{n:"amount",t:"Uint<64>",note:"Must be > 0"}] },
              { name:"burn",     sig:"burn(amount: Uint<64>): []",                          access:"Public",     desc:"Destroys caller's tokens. Reduces totalSupply permanently.",           args:[{n:"amount",t:"Uint<64>",note:"<= caller balance"}] },
              { name:"pause",    sig:"pause(): []",                                         access:"Admin only", desc:"Sets paused=true. All other circuits assert(!paused) and revert.",     args:[] },
              { name:"unpause",  sig:"unpause(): []",                                       access:"Admin only", desc:"Clears paused flag, resuming operations.",                             args:[] },
            ].map((c) => (
              <div key={c.name} className="rounded-xl border overflow-hidden" style={{ borderColor: BORDER }}>
                <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: BORDER, background: BG3 }}>
                  <code className="text-sm font-mono font-bold" style={{ color: ACCENT }}>{c.sig}</code>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: c.access === "Admin only" ? `${RED}22` : `${GREEN}22`, color: c.access === "Admin only" ? RED : GREEN }}>{c.access}</span>
                </div>
                <div className="px-5 py-4" style={{ background: BG2 }}>
                  <p className="text-sm mb-3" style={{ color: MUTED }}>{c.desc}</p>
                  {c.args.length > 0 ? (
                    <table className="w-full text-xs"><thead><tr style={{ color: MUTED }}><th className="text-left pb-1 font-medium">Arg</th><th className="text-left pb-1 font-medium">Type</th><th className="text-left pb-1 font-medium">Note</th></tr></thead>
                    <tbody>{c.args.map((a) => (<tr key={a.n} style={{ borderTop: `1px solid ${BORDER}` }}><td className="py-1.5 pr-4 font-mono" style={{ color: "oklch(0.78 0.12 272)" }}>{a.n}</td><td className="py-1.5 pr-4 font-mono" style={{ color: "oklch(0.70 0.15 305)" }}>{a.t}</td><td className="py-1.5" style={{ color: MUTED }}>{a.note}</td></tr>))}</tbody></table>
                  ) : <p className="text-xs italic" style={{ color: MUTED }}>No arguments required.</p>}
                </div>
              </div>
            ))}
          </div>

          <H2 id="cicd" icon={GitBranch}>CI/CD Pipeline</H2>
          <P>3 GitHub Actions workflows on every push to <IC>main</IC>:</P>
          <div className="space-y-3 my-4">
            {[{f:".github/workflows/contracts.yml",d:"Compiles all Compact circuits. POSTs benchmark data to /api/benchmarks on success."},{f:".github/workflows/frontend.yml",d:"Runs next build — fails fast on TypeScript errors."},{f:".github/workflows/typecheck.yml",d:"Runs tsc --noEmit for strict type-checking."}].map((w) => (
              <div key={w.f} className="rounded-xl border px-5 py-4" style={{ borderColor: BORDER, background: BG2 }}>
                <code className="text-xs font-mono" style={{ color: ACCENT }}>{w.f}</code>
                <p className="text-sm mt-1" style={{ color: MUTED }}>{w.d}</p>
              </div>
            ))}
          </div>
          <H3 id="webhook">GitHub Webhook</H3>
          <CB lang="bash" code={"# GitHub repo → Settings → Webhooks\nPayload URL:   https://your-domain.com/api/ci-runs\nContent type:  application/json\nSecret:        <GITHUB_WEBHOOK_SECRET from .env>\nEvents:        push"} />

          <H2 id="dashboard" icon={Activity}>Dashboard</H2>
          <div className="grid sm:grid-cols-2 gap-3 my-4">
            {[["/dashboard","KPI overview: contracts, deployments, avg proof time, CI success rate"],["/dashboard/contracts","Contract details, circuits, benchmark data"],["/dashboard/deployments","History with contract address + 1AM Explorer links"],["/dashboard/benchmarks","Per-circuit proving times with commit verify links"],["/dashboard/ci-runs","GitHub Actions run log"],["/dashboard/interact","Deploy and call any of the 6 circuits"]].map(([r, d]) => (
              <div key={r as string} className="rounded-lg border px-4 py-3" style={{ borderColor: BORDER, background: BG2 }}>
                <a href={r as string} className="flex items-center gap-1.5 text-sm font-mono font-semibold mb-1 hover:underline" style={{ color: ACCENT }}>{r} <ExternalLink className="h-3 w-3" /></a>
                <p className="text-xs" style={{ color: MUTED }}>{d}</p>
              </div>
            ))}
          </div>

          <H2 id="deploy-interact" icon={Rocket}>Deploy & Interact</H2>
          <Note type="warning">Requires the <strong>1AM Wallet Chrome extension</strong> and a <strong>locally running</strong> instance. See <a href="#local-only" className="underline" style={{ color: YELLOW }}>Why Local Only?</a></Note>
          <H3 id="deploying">Deployment flow</H3>
          <ol className="my-3 space-y-2 text-sm ml-4" style={{ color: MUTED }}>
            {["1AM Wallet opens permission prompt — click Approve","App fetches your wallet address and shielded keys in parallel","createUnprovenDeployTx builds the unproven deployment transaction","1AM ProofStation generates the ZK proof (downloads keys from /api/contracts/token_ledger/keys/)","balanceUnsealedTransaction adds dust fees via the 1AM server wallet (you pay 0 NIGHT)","submitTransaction broadcasts to Midnight Preprod network","Contract address shown in toast — copy for Interact panel","Deployment saved to database automatically"].map((step, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center mt-0.5" style={{ background: `${ACCENT}22`, color: ACCENT }}>{i + 1}</span>{step}
              </li>
            ))}
          </ol>
          <H3 id="circuit-args">Circuit arguments</H3>
          <div className="rounded-xl border overflow-hidden my-4" style={{ borderColor: BORDER }}>
            <table className="w-full text-sm"><thead><tr style={{ background: BG3, color: MUTED }}><th className="text-left px-4 py-2.5 font-medium">Circuit</th><th className="text-left px-4 py-2.5 font-medium">Args</th></tr></thead>
            <tbody>{[["deposit","[BigInt(amount)]"],["burn","[BigInt(amount)]"],["transfer","[parseAddressToBytes32(recipient), BigInt(amount)]"],["mint","[parseAddressToBytes32(recipient), BigInt(amount)]"],["pause","[]"],["unpause","[]"]].map(([c, a], i) => (
              <tr key={c} style={{ borderTop: `1px solid ${BORDER}`, background: i % 2 === 0 ? BG2 : "transparent" }}><td className="px-4 py-2.5 font-mono" style={{ color: ACCENT }}>{c}</td><td className="px-4 py-2.5 font-mono text-xs" style={{ color: "oklch(0.70 0.08 265)" }}>{a}</td></tr>
            ))}</tbody></table>
          </div>

          <H2 id="benchmarks" icon={BarChart3}>Benchmarks</H2>
          <CB lang="bash" code={"curl -X POST https://your-domain/api/benchmarks \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\n    \"commitSha\": \"abc1234\",\n    \"benchmarks\": [\n      { \"circuit\": \"deposit\",  \"provingMs\": 1340 },\n      { \"circuit\": \"transfer\", \"provingMs\": 1810 },\n      { \"circuit\": \"mint\",     \"provingMs\": 1890 },\n      { \"circuit\": \"burn\",     \"provingMs\": 1120 },\n      { \"circuit\": \"pause\",    \"provingMs\": 750  },\n      { \"circuit\": \"unpause\",  \"provingMs\": 750  }\n    ]\n  }'"} />

          <H2 id="api-reference" icon={Zap}>API Reference</H2>
          <div className="space-y-3 my-4">
            {[["GET","/api/deployments","List all deployments"],["POST","/api/deployments","Record a deployment { contractAddress, txId, network }"],["GET","/api/deployments/[id]","Get single deployment"],["GET","/api/benchmarks","List benchmark records"],["POST","/api/benchmarks","Record CI benchmark data { commitSha, benchmarks[] }"],["GET","/api/ci-runs","List CI run history"],["POST","/api/ci-runs","GitHub webhook receiver"],["GET","/api/contracts/token_ledger/contract","Contract metadata"],["GET","/api/contracts/token_ledger/zkir/[circuit]","Streams .bzkir ZK IR file"],["GET","/api/contracts/token_ledger/keys/[filename]","Streams .prover or .verifier key"]].map(([m, p, d]) => (
              <div key={`${m}-${p}`} className="rounded-lg border px-4 py-3 flex items-start gap-3" style={{ borderColor: BORDER, background: BG2 }}>
                <span className="text-xs px-2 py-0.5 rounded font-mono font-bold shrink-0 mt-0.5" style={{ background: m === "GET" ? `${ACCENT}22` : `${GREEN}22`, color: m === "GET" ? ACCENT : GREEN }}>{m}</span>
                <div><code className="text-xs font-mono" style={{ color: TEXT }}>{p}</code><p className="text-xs mt-0.5" style={{ color: MUTED }}>{d}</p></div>
              </div>
            ))}
          </div>

          <H2 id="local-only" icon={Lock}>Why Local Only?</H2>
          <div className="rounded-xl border px-5 py-5 my-4 flex items-start gap-4" style={{ borderColor: YELLOW, background: "oklch(0.75 0.18 75 / 0.06)" }}>
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" style={{ color: YELLOW }} />
            <div>
              <p className="text-sm font-semibold mb-3" style={{ color: YELLOW }}>Deploy & Interact cannot run on Vercel or any hosted deployment.</p>
              <ul className="space-y-3 text-sm" style={{ color: "oklch(0.65 0.08 75)" }}>
                <li className="flex items-start gap-2"><span className="shrink-0 mt-1 font-bold" style={{ color: YELLOW }}>1.</span><span><strong style={{ color: YELLOW }}>ZK proving keys read from disk</strong> — <IC>.prover</IC> and <IC>.verifier</IC> files (2-10 MB each) are served via API routes from <IC>contracts/token_ledger/build/token_ledger/keys/</IC>. Vercel serverless functions have size limits that prevent serving large binaries this way.</span></li>
                <li className="flex items-start gap-2"><span className="shrink-0 mt-1 font-bold" style={{ color: YELLOW }}>2.</span><span><strong style={{ color: YELLOW }}>1AM ProofStation calls back to your server</strong> — the cloud ProofStation tries to download key files from the URL you configured. It cannot reach <IC>localhost:3000</IC>. The app must be publicly accessible — OR the custom inline provider we use forces key fetching in the browser extension (works only locally).</span></li>
              </ul>
            </div>
          </div>
          <H3 id="workaround">Production workaround</H3>
          <ol className="my-3 space-y-2 text-sm ml-4" style={{ color: MUTED }}>
            {["Host .prover / .verifier key files on CDN (Cloudflare R2, AWS S3) with CORS: *","Use FetchZkConfigProvider with the CDN URL as base","The 1AM ProofStation can fetch keys from the public CDN","The Next.js frontend can run on Vercel — only key files need a CDN"].map((step, i) => (
              <li key={i} className="flex items-start gap-2.5"><span className="flex-shrink-0 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center mt-0.5" style={{ background: `${ACCENT}22`, color: ACCENT }}>{i + 1}</span>{step}</li>
            ))}
          </ol>
          <Note type="tip">For the hackathon demo, running locally is perfectly fine. Clone the repo, run <IC>npm install && npm run dev</IC>, and everything works end-to-end.</Note>

          <div className="mt-16 pt-6 border-t flex items-center justify-between text-sm" style={{ borderColor: BORDER, color: MUTED }}>
            <Link href="/" className="flex items-center gap-1.5 hover:text-white"><ArrowLeft className="h-4 w-4" /> Homepage</Link>
            <Link href="/dashboard" className="flex items-center gap-1.5 hover:text-white">Dashboard <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </main>
      </div>
    </div>
  );
}
