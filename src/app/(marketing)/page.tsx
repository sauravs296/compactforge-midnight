import Link from "next/link";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
import {
  ArrowRight,
  Code2,
  Server,
  BarChart3,
  Shield,
  Zap,
  GitBranch,
  Terminal,
  CheckCircle2,
  Activity,
  Rocket,
  GitCommit,
  Lock,
} from "lucide-react";

/* ─── Static content arrays ───────────────────────────────────────────────── */
const PROBLEMS = [
  {
    icon: Code2,
    title: "No CI/CD for Compact",
    body: "Teams manually compile Compact contracts locally. Zero automation to catch regressions the moment they're pushed.",
  },
  {
    icon: BarChart3,
    title: "No Proof Benchmarking",
    body: "ZK proof generation times drift silently across commits. Nobody notices until a circuit doubles in proving time on Preprod.",
  },
  {
    icon: Server,
    title: "No Shared Infrastructure",
    body: "Every team spins up their own local Docker proof-server from scratch — burning hours before writing a single circuit.",
  },
];

const FEATURES = [
  {
    icon: GitBranch,
    label: "CI/CD Pipeline",
    title: "Compile on every push, automatically",
    body: "Three GitHub Actions workflows — contracts, frontend, typecheck — run in parallel on every commit. The Compact compiler catches circuit errors before they reach Preprod.",
    accentColor: "272",
  },
  {
    icon: BarChart3,
    label: "Proof Benchmarks",
    title: "Track proving time, per circuit, per commit",
    body: "Per-circuit proving times (k-value, constraint rows, milliseconds) measured on every CI run and stored in your Neon Postgres database — regressions visible instantly.",
    accentColor: "305",
  },
  {
    icon: Shield,
    label: "ZK Privacy Model",
    title: "disclose() enforced at compile time",
    body: "The bundled token_ledger.compact demonstrates Midnight's dual-state model with 6 circuits, witness-based private key auth, and a circuit breaker — correct disclose() usage throughout.",
    accentColor: "240",
  },
  {
    icon: Activity,
    label: "Live Dashboard",
    title: "Unified visibility across all your contracts",
    body: "Deployments, CI run history, benchmark charts, and contract details — all on a dark developer dashboard connected live to Neon Postgres. No stale data.",
    accentColor: "200",
  },
];

const STEPS = [
  { n: "01", icon: GitCommit, title: "Push Code",    body: "Commit your .compact file to GitHub. The webhook fires immediately." },
  { n: "02", icon: Terminal,  title: "CI Compiles",  body: "compact CLI compiles your circuits inside the GitHub Actions runner." },
  { n: "03", icon: BarChart3, title: "Benchmark",    body: "Proving times are measured per circuit and stored in the database." },
  { n: "04", icon: Activity,  title: "Dashboard",    body: "Results appear live on the CompactForge dashboard. No manual steps." },
];

/* ─── Hero product mockup (inline HTML component — no image needed) ────────── */
function ProductMockup({ recentRuns }: { recentRuns: { sha: string; status: string }[] }) {
  return (
    <div className="relative w-full max-w-[580px] mx-auto">
      {/* Glow behind the mockup */}
      <div
        className="absolute -inset-4 rounded-3xl blur-3xl pointer-events-none"
        style={{ background: "oklch(0.62 0.23 272 / 0.15)" }}
      />

      {/* Browser chrome */}
      <div
        className="relative rounded-2xl border overflow-hidden shadow-2xl"
        style={{
          borderColor: "oklch(0.28 0.013 265 / 0.7)",
          background: "oklch(0.10 0.012 265)",
        }}
      >
        {/* Browser toolbar */}
        <div
          className="flex items-center gap-2 px-4 py-3 border-b"
          style={{
            background: "oklch(0.125 0.012 265)",
            borderColor: "oklch(0.22 0.013 265 / 0.6)",
          }}
        >
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "oklch(0.62 0.22 22)" }} />
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "oklch(0.75 0.18 75)" }} />
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "oklch(0.65 0.22 145)" }} />
          <div
            className="flex-1 mx-3 h-5 rounded flex items-center px-3"
            style={{ background: "oklch(0.16 0.012 265)" }}
          >
            <span className="text-xs font-mono" style={{ color: "oklch(0.45 0.01 265)" }}>
              compactforge.vercel.app/dashboard
            </span>
          </div>
        </div>

        {/* App layout */}
        <div className="flex h-[340px]">

          {/* Sidebar */}
          <div
            className="hidden sm:flex w-44 flex-col border-r py-3 gap-0.5 shrink-0"
            style={{
              background: "oklch(0.115 0.012 265)",
              borderColor: "oklch(0.22 0.013 265 / 0.5)",
            }}
          >
            {/* Logo in sidebar */}
            <div className="px-3 pb-3 flex items-center gap-2">
              <div
                className="w-5 h-5 rounded"
                style={{ background: "oklch(0.62 0.23 272)" }}
              />
              <span className="text-xs font-semibold" style={{ color: "oklch(0.82 0.012 265)" }}>
                CompactForge
              </span>
            </div>

            {/* Nav items */}
            {[
              { label: "Overview", active: true },
              { label: "Contracts", active: false },
              { label: "Deployments", active: false },
              { label: "Benchmarks", active: false },
              { label: "CI Runs", active: false },
            ].map(({ label, active }) => (
              <div
                key={label}
                className="mx-2 px-2 py-1.5 rounded text-xs flex items-center gap-2"
                style={{
                  background: active ? "oklch(0.62 0.23 272 / 0.12)" : "transparent",
                  color: active ? "oklch(0.90 0.008 265)" : "oklch(0.48 0.01 265)",
                  borderLeft: active ? "2px solid oklch(0.62 0.23 272)" : "2px solid transparent",
                }}
              >
                <div
                  className="w-2.5 h-2.5 rounded-sm"
                  style={{ background: active ? "oklch(0.62 0.23 272 / 0.6)" : "oklch(0.30 0.012 265)" }}
                />
                {label}
              </div>
            ))}
          </div>

          {/* Main content */}
          <div className="flex-1 p-4 overflow-hidden flex flex-col gap-3">
            {/* Top row: 4 stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: "Contracts", value: "1",     sub: "6 circuits" },
                { label: "Deployments", value: "—",   sub: "Preprod pending" },
                { label: "Avg Proof Time", value: "1.3s", sub: "across circuits" },
                { label: "CI Runs", value: "3",       sub: "100% success" },
              ].map(({ label, value, sub }) => (
                <div
                  key={label}
                  className="rounded-lg p-2.5 flex flex-col gap-0.5"
                  style={{ background: "oklch(0.145 0.013 265)", border: "1px solid oklch(0.22 0.013 265 / 0.6)" }}
                >
                  <span className="text-[9px]" style={{ color: "oklch(0.48 0.01 265)" }}>{label}</span>
                  <span className="text-base font-bold leading-tight" style={{ color: "oklch(0.90 0.008 265)", fontFamily: "var(--font-syne, sans-serif)" }}>{value}</span>
                  <span className="text-[8px]" style={{ color: "oklch(0.42 0.01 265)" }}>{sub}</span>
                </div>
              ))}
            </div>

            {/* Proof benchmark bar chart */}
            <div
              className="flex-1 rounded-lg p-3 flex flex-col gap-2"
              style={{ background: "oklch(0.145 0.013 265)", border: "1px solid oklch(0.22 0.013 265 / 0.6)" }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-semibold" style={{ color: "oklch(0.82 0.008 265)" }}>Proof Generation by Circuit</span>
                <span
                  className="text-[8px] px-1.5 py-0.5 rounded-full"
                  style={{ background: "oklch(0.65 0.22 145 / 0.12)", color: "oklch(0.65 0.22 145)" }}
                >
                  6 circuits
                </span>
              </div>
              <div className="flex flex-col gap-1.5 mt-1">
                {[
                  { name: "mint",     pct: 100 },
                  { name: "transfer", pct: 96 },
                  { name: "deposit",  pct: 74 },
                  { name: "burn",     pct: 79 },
                  { name: "pause",    pct: 55 },
                  { name: "unpause",  pct: 55 },
                ].map(({ name, pct }) => (
                  <div key={name} className="flex items-center gap-2">
                    <span className="w-14 text-[8px] font-mono shrink-0" style={{ color: "oklch(0.58 0.01 265)" }}>{name}</span>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "oklch(0.20 0.013 265)" }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          background: "linear-gradient(90deg, oklch(0.62 0.23 272), oklch(0.62 0.27 305))",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CI run list */}
            <div
              className="rounded-lg p-3 flex flex-col gap-1.5"
              style={{ background: "oklch(0.145 0.013 265)", border: "1px solid oklch(0.22 0.013 265 / 0.6)" }}
            >
              <span className="text-[9px] font-semibold mb-0.5" style={{ color: "oklch(0.82 0.008 265)" }}>Recent CI Runs</span>
              {recentRuns.map(({ sha, status }) => (
                <div key={sha} className="flex items-center gap-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: status === "success" ? "oklch(0.65 0.22 145)" : "oklch(0.62 0.22 22)" }}
                  />
                  <span className="text-[8px] font-mono" style={{ color: "oklch(0.55 0.01 265)" }}>{sha}</span>
                  <span
                    className="ml-auto text-[7px] px-1 py-0.5 rounded"
                    style={{
                      background: status === "success" ? "oklch(0.65 0.22 145 / 0.12)" : "oklch(0.62 0.22 22 / 0.12)",
                      color: status === "success" ? "oklch(0.65 0.22 145)" : "oklch(0.62 0.22 22)",
                    }}
                  >
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────────────────────── */
export default async function MarketingPage() {
  // Fetch real CI runs for the product mockup hero widget
  let mockupRuns: { sha: string; status: string }[] = [
    { sha: "a3f9c2d", status: "success" },
    { sha: "9b1e4fa", status: "success" },
    { sha: "c82d7e0", status: "success" },
  ];
  try {
    const { PrismaClient } = await import("@prisma/client");
    const p = new PrismaClient();
    const runs = await p.cIRun.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      select: { commitSha: true, status: true },
    });
    await p.$disconnect();
    if (runs.length > 0) {
      mockupRuns = runs.map((r) => ({ sha: r.commitSha.substring(0, 7), status: r.status }));
    }
  } catch {
    // Keep static fallback if DB is unavailable
  }
  return (
    <div className="flex flex-col min-h-screen text-foreground bg-background">

      {/* ══ Navbar ═══════════════════════════════════════════════════════════ */}
      <header
        className="fixed top-0 inset-x-0 z-50"
        style={{
          background: "oklch(0.11 0.012 265 / 0.80)",
          backdropFilter: "blur(20px) saturate(1.4)",
          WebkitBackdropFilter: "blur(20px) saturate(1.4)",
          borderBottom: "1px solid oklch(0.22 0.013 265 / 0.5)",
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-[60px]">

          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <Image src="/logo.png" width={26} height={26} alt="CompactForge" className="rounded-md" />
            <span
              className="font-heading text-[15px] tracking-tight font-bold"
              style={{ color: "oklch(0.95 0.005 260)" }}
            >
              CompactForge
            </span>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { href: "#problem",  label: "Problem"    },
              { href: "#features", label: "Features"   },
              { href: "#how",      label: "How it Works"},
              { href: "#contract", label: "Contract"   },
              { href: "/docs",     label: "Docs"       },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-3.5 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* CTA group */}
          <div className="flex items-center gap-2.5">
            {/* Live indicator */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full" style={{ background: "oklch(0.65 0.22 145 / 0.10)", border: "1px solid oklch(0.65 0.22 145 / 0.2)" }}>
              <span className="live-dot w-1.5 h-1.5 rounded-full block" style={{ background: "oklch(0.65 0.22 145)" }} />
              <span style={{ color: "oklch(0.65 0.22 145)" }}>Preprod Live</span>
            </div>

            <Link
              href="https://github.com/sauravs296/CompactForge"
              target="_blank"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              GitHub
            </Link>
            <Link
              href="/dashboard"
              className={buttonVariants({ size: "sm" })}
            >
              Dashboard <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">

        {/* ══ Hero ════════════════════════════════════════════════════════════ */}
        <section
          className="relative pt-32 pb-24 overflow-hidden dot-grid"
          style={{ minHeight: "100vh", display: "flex", alignItems: "center" }}
        >
          {/* Top glow */}
          <div className="absolute inset-0 glow-overlay pointer-events-none" />
          {/* Bottom glow */}
          <div className="absolute bottom-0 left-0 right-0 pointer-events-none hero-glow" style={{ height: "40%" }} />
          {/* Bottom fade-out */}
          <div
            className="absolute bottom-0 inset-x-0 h-40 pointer-events-none"
            style={{ background: "linear-gradient(to bottom, transparent, oklch(0.11 0.012 265))" }}
          />

          <div className="relative max-w-6xl mx-auto px-6 w-full">
            <div className="grid lg:grid-cols-2 gap-16 items-center">

              {/* Left: copy */}
              <div className="flex flex-col gap-7">
                {/* Eyebrow badge */}
                <div className="animate-fade-up fade-delay-0 w-fit inline-flex items-center gap-2 rounded-full border shimmer-badge px-3.5 py-1.5 text-xs font-semibold tracking-wide uppercase"
                  style={{ borderColor: "oklch(0.62 0.23 272 / 0.35)", color: "oklch(0.72 0.18 272)" }}>
                  <Zap className="h-3 w-3" />
                  Built for Midnight Network Hackathon
                </div>

                {/* Headline */}
                <h1 className="animate-fade-up fade-delay-1 text-[clamp(2.4rem,5.5vw,3.75rem)] font-heading font-bold leading-[1.06] tracking-tight">
                  Developer infrastructure<br />
                  for{" "}
                  <span className="gradient-text-animated">Compact contracts</span>
                </h1>

                {/* Sub-headline */}
                <p
                  className="animate-fade-up fade-delay-2 text-lg leading-relaxed max-w-xl"
                  style={{ color: "oklch(0.58 0.012 260)" }}
                >
                  CompactForge gives every Midnight team the CI/CD pipeline,
                  proof benchmarking, and real-time dashboard they need — without the friction.
                </p>

                {/* ⚠️ Local-run notice */}
                <div
                  className="animate-fade-up fade-delay-2 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm"
                  style={{
                    borderColor: "oklch(0.75 0.18 75 / 0.35)",
                    background: "oklch(0.75 0.18 75 / 0.06)",
                  }}
                >
                  <span className="text-base mt-0.5 shrink-0">⚠️</span>
                  <div style={{ color: "oklch(0.75 0.15 75)" }}>
                    <span className="font-semibold">Deploy &amp; Interact require local setup.</span>{" "}
                    <span style={{ color: "oklch(0.62 0.10 75)" }}>
                      ZK proving keys are served from your local disk and the 1AM Wallet proof station calls back to your server —
                      these features cannot run on Vercel or any hosted deployment.
                    </span>{" "}
                    <a
                      href="https://github.com/sauravs296/CompactForge#getting-started"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold underline underline-offset-2"
                      style={{ color: "oklch(0.80 0.18 75)" }}
                    >
                      Clone &amp; run locally →
                    </a>
                  </div>
                </div>

                {/* CTA buttons */}
                <div className="animate-fade-up fade-delay-3 flex flex-wrap gap-3">
                  <Link
                    href="/dashboard"
                    className={buttonVariants({ size: "lg" })}
                    style={{ paddingInline: "2rem", fontSize: "0.95rem", height: "2.85rem" }}
                  >
                    Open Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  <Link
                    href="https://github.com/sauravs296/CompactForge"
                    target="_blank"
                    className={buttonVariants({ variant: "outline", size: "lg" })}
                    style={{ paddingInline: "2rem", fontSize: "0.95rem", height: "2.85rem" }}
                  >
                    View on GitHub
                  </Link>
                </div>

                {/* Trust strip */}
                <div
                  className="animate-fade-up fade-delay-4 flex flex-wrap gap-x-5 gap-y-2 pt-1 text-sm"
                  style={{ color: "oklch(0.48 0.01 260)" }}
                >
                  {[
                    "6 compiled ZK circuits",
                    "3 CI/CD workflows",
                    "Preprod-native",
                    "disclose() enforced",
                  ].map((item) => (
                    <span key={item} className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color: "oklch(0.62 0.23 272)" }} />
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right: Product Mockup */}
              <div className="animate-fade-up fade-delay-2 hidden lg:block">
                <ProductMockup recentRuns={mockupRuns} />
              </div>
            </div>
          </div>
        </section>

        {/* ══ Stats bar ══════════════════════════════════════════════════════ */}
        <div
          className="border-y py-10"
          style={{ borderColor: "oklch(0.22 0.013 265 / 0.5)", background: "oklch(0.13 0.012 265)" }}
        >
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: "6",    label: "ZK Circuits Compiled"  },
                { value: "3",    label: "GitHub Actions Workflows" },
                { value: "< 2s", label: "Average Proving Time"  },
                { value: "100%", label: "Preprod Native"         },
              ].map(({ value, label }) => (
                <div key={label} className="flex flex-col gap-1.5">
                  <span
                    className="text-3xl font-heading font-bold tracking-tight gradient-text"
                  >
                    {value}
                  </span>
                  <span className="text-sm" style={{ color: "oklch(0.50 0.01 260)" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ Problem ════════════════════════════════════════════════════════ */}
        <section id="problem" className="py-28" style={{ background: "oklch(0.11 0.012 265)" }}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16 flex flex-col items-center gap-4">
              <span className="section-label">The Problem</span>
              <h2 className="text-3xl md:text-[2.5rem] font-heading tracking-tight leading-tight max-w-2xl">
                Building on Midnight means fighting friction<br className="hidden md:block" />
                that has nothing to do with ZK logic
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {PROBLEMS.map(({ icon: Icon, title, body }) => (
                <div
                  key={title}
                  className="rounded-2xl p-7 flex flex-col gap-5 glow-border transition-all"
                  style={{
                    background: "oklch(0.145 0.013 265)",
                    border: "1px solid oklch(0.22 0.013 265 / 0.7)",
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{
                      background: "oklch(0.62 0.23 272 / 0.10)",
                      border: "1px solid oklch(0.62 0.23 272 / 0.22)",
                    }}
                  >
                    <Icon className="h-5 w-5" style={{ color: "oklch(0.72 0.18 272)" }} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="font-heading text-[1.05rem] font-semibold tracking-tight">{title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: "oklch(0.55 0.01 260)" }}>{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ Features — bento layout ══════════════════════════════════════════ */}
        <section
          id="features"
          className="py-28"
          style={{ background: "oklch(0.13 0.012 265)" }}
        >
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16 flex flex-col items-center gap-4">
              <span className="section-label">Features</span>
              <h2 className="text-3xl md:text-[2.5rem] font-heading tracking-tight">
                Everything a Midnight team needs
              </h2>
            </div>

            {/* Bento: large top 2, small bottom 2 */}
            <div className="grid md:grid-cols-2 gap-5">
              {FEATURES.map(({ icon: Icon, label, title, body, accentColor }) => (
                <div
                  key={title}
                  className="rounded-2xl p-8 flex flex-col gap-5 glow-border transition-all group"
                  style={{
                    background: "oklch(0.145 0.013 265)",
                    border: "1px solid oklch(0.22 0.013 265 / 0.7)",
                  }}
                >
                  {/* Top: icon + label */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        background: `oklch(0.62 0.23 ${accentColor} / 0.10)`,
                        border: `1px solid oklch(0.62 0.23 ${accentColor} / 0.22)`,
                      }}
                    >
                      <Icon className="h-4.5 w-4.5" style={{ color: `oklch(0.72 0.18 ${accentColor})` }} />
                    </div>
                    <span
                      className="text-[0.68rem] font-semibold tracking-[0.1em] uppercase"
                      style={{ color: `oklch(0.62 0.23 ${accentColor})` }}
                    >
                      {label}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-heading text-xl font-semibold tracking-tight leading-snug">{title}</h3>

                  {/* Body */}
                  <p className="text-sm leading-relaxed" style={{ color: "oklch(0.55 0.01 260)" }}>{body}</p>

                  {/* Bottom accent bar */}
                  <div
                    className="h-px w-0 group-hover:w-full transition-all duration-500 rounded-full mt-2"
                    style={{ background: `oklch(0.62 0.23 ${accentColor} / 0.45)` }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ How it works ═══════════════════════════════════════════════════ */}
        <section id="how" className="py-28" style={{ background: "oklch(0.11 0.012 265)" }}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16 flex flex-col items-center gap-4">
              <span className="section-label">How It Works</span>
              <h2 className="text-3xl md:text-[2.5rem] font-heading tracking-tight">
                From commit to dashboard in 4 steps
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 relative">
              {/* Connector line */}
              <div
                className="absolute top-[2.2rem] left-[14%] right-[14%] h-px hidden lg:block"
                style={{ background: "linear-gradient(90deg, transparent, oklch(0.62 0.23 272 / 0.35), oklch(0.62 0.27 305 / 0.35), transparent)" }}
              />

              {STEPS.map(({ n, title, body }) => (
                <div
                  key={n}
                  className="rounded-2xl p-7 flex flex-col gap-4 glow-border transition-all relative"
                  style={{
                    background: "oklch(0.145 0.013 265)",
                    border: "1px solid oklch(0.22 0.013 265 / 0.7)",
                  }}
                >
                  {/* Step circle */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold font-heading z-10 ring-2 ring-background"
                      style={{
                        background: "oklch(0.62 0.23 272 / 0.14)",
                        border: "1px solid oklch(0.62 0.23 272 / 0.32)",
                        color: "oklch(0.72 0.18 272)",
                      }}
                    >
                      {n}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="font-heading text-base font-semibold">{title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: "oklch(0.52 0.01 260)" }}>{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ Contract / Privacy Model ════════════════════════════════════════ */}
        <section
          id="contract"
          className="py-28"
          style={{ background: "oklch(0.13 0.012 265)" }}
        >
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-start">

              {/* Left: text + circuit grid */}
              <div className="flex flex-col gap-7">
                <div className="flex flex-col gap-4">
                  <span className="section-label w-fit">Privacy Model</span>
                  <h2 className="text-3xl md:text-[2.5rem] font-heading tracking-tight leading-tight">
                    6 ZK circuits.<br />
                    <span className="gradient-text">disclose() on every ledger write.</span>
                  </h2>
                  <p className="text-base leading-relaxed" style={{ color: "oklch(0.55 0.01 260)" }}>
                    The bundled{" "}
                    <code
                      className="text-sm font-mono px-1.5 py-0.5 rounded"
                      style={{ background: "oklch(0.19 0.013 265)", color: "oklch(0.82 0.008 265)" }}
                    >
                      token_ledger.compact
                    </code>{" "}
                    demonstrates Midnight&#39;s full dual-state model — witness-based caller auth,
                    a Map ledger, admin-controlled mint, ZK-private transfers, and an emergency circuit breaker.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: "mint(recipient, amount)",    note: "admin only"   },
                    { label: "deposit(amount)",            note: "self-funded"  },
                    { label: "transfer(recipient, amount)", note: "ZK-private"  },
                    { label: "burn(amount)",               note: "owner only"   },
                    { label: "pause()",                    note: "emergency"    },
                    { label: "unpause()",                  note: "emergency"    },
                  ].map(({ label, note }) => (
                    <div
                      key={label}
                      className="flex items-start gap-2.5 p-3.5 rounded-xl transition-colors glow-border"
                      style={{
                        background: "oklch(0.155 0.012 265)",
                        border: "1px solid oklch(0.22 0.013 265 / 0.65)",
                      }}
                    >
                      <Terminal className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: "oklch(0.62 0.23 272)" }} />
                      <div>
                        <p className="font-mono text-xs" style={{ color: "oklch(0.87 0.005 260)" }}>{label}</p>
                        <p className="text-xs mt-0.5" style={{ color: "oklch(0.48 0.01 260)" }}>{note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: dual-state architecture card */}
              <div
                className="rounded-2xl border overflow-hidden glow-border"
                style={{
                  background: "oklch(0.145 0.013 265)",
                  border: "1px solid oklch(0.22 0.013 265 / 0.7)",
                }}
              >
                <div
                  className="px-6 py-5 border-b flex items-center justify-between"
                  style={{ borderColor: "oklch(0.22 0.013 265 / 0.5)" }}
                >
                  <div>
                    <p className="font-heading text-sm font-semibold">Dual-State Architecture</p>
                    <p className="text-xs mt-0.5" style={{ color: "oklch(0.48 0.01 260)" }}>
                      Compact language — public ledger vs private witness
                    </p>
                  </div>
                  <Lock className="h-4 w-4" style={{ color: "oklch(0.62 0.23 272)" }} />
                </div>

                <div className="divide-y" style={{ borderColor: "oklch(0.22 0.013 265 / 0.4)" }}>
                  {[
                    { layer: "balances: Map<Bytes<32>, Uint<64>>", kw: "export ledger", vis: "Public",   hue: "22"  },
                    { layer: "totalSupply, admin, paused",         kw: "export ledger", vis: "Public",   hue: "22"  },
                    { layer: "localSecretKey() → Bytes<32>",       kw: "witness",       vis: "Private",  hue: "145" },
                    { layer: "mint / transfer / burn / …",         kw: "export circuit", vis: "ZK proof", hue: "272" },
                    { layer: "disclose(value)",                    kw: "required",      vis: "Enforced", hue: "65"  },
                  ].map(({ layer, kw, vis, hue }) => (
                    <div
                      key={layer}
                      className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-accent/40"
                    >
                      <div>
                        <code className="text-xs font-mono" style={{ color: "oklch(0.87 0.005 260)" }}>{layer}</code>
                        <p className="text-[11px] mt-0.5 font-mono" style={{ color: "oklch(0.45 0.01 260)" }}>{kw}</p>
                      </div>
                      <span
                        className="shrink-0 text-[10px] font-medium px-2.5 py-1 rounded-full"
                        style={{
                          background: `oklch(0.62 0.22 ${hue} / 0.12)`,
                          color: `oklch(0.72 0.18 ${hue})`,
                          border: `1px solid oklch(0.62 0.22 ${hue} / 0.28)`,
                        }}
                      >
                        {vis}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ Terminal CI log section ════════════════════════════════════════ */}
        <section className="py-20" style={{ background: "oklch(0.11 0.012 265)" }}>
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-10 flex flex-col items-center gap-3">
              <span className="section-label">CI Pipeline</span>
              <h2 className="text-2xl md:text-3xl font-heading tracking-tight">
                What your CI run looks like
              </h2>
            </div>

            {/* Terminal */}
            <div
              className="rounded-2xl overflow-hidden glow-border"
              style={{
                border: "1px solid oklch(0.24 0.013 265 / 0.7)",
                background: "oklch(0.09 0.011 265)",
              }}
            >
              {/* Window chrome */}
              <div
                className="flex items-center gap-2 px-4 py-3 border-b"
                style={{
                  background: "oklch(0.115 0.012 265)",
                  borderColor: "oklch(0.22 0.013 265 / 0.5)",
                }}
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: "oklch(0.62 0.22 22)" }} />
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: "oklch(0.75 0.18 75)" }} />
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: "oklch(0.65 0.22 145)" }} />
                <span
                  className="ml-4 text-xs font-mono"
                  style={{ color: "oklch(0.40 0.01 265)" }}
                >
                  contracts.yml — compile-and-benchmark
                </span>
              </div>

              {/* Terminal body */}
              <div className="p-6 font-mono text-sm leading-7 overflow-x-auto">
                <p style={{ color: "oklch(0.45 0.01 265)" }}>
                  $ compact compile contracts/token_ledger/token_ledger.compact contracts/token_ledger/build/token_ledger
                </p>
                <p className="mt-2" style={{ color: "oklch(0.72 0.18 272)" }}>Compiling 6 circuits:</p>
                {[
                  { name: "deposit",  k: 7, rows: 92  },
                  { name: "transfer", k: 9, rows: 114 },
                  { name: "mint",     k: 9, rows: 128 },
                  { name: "burn",     k: 8, rows: 105 },
                  { name: "pause",    k: 7, rows: 88  },
                  { name: "unpause",  k: 7, rows: 88  },
                ].map((c) => (
                  <p key={c.name} style={{ color: "oklch(0.82 0.006 260)" }}>
                    {"  "}circuit{" "}
                    <span
                      style={{
                        background: "linear-gradient(135deg, oklch(0.82 0.12 270), oklch(0.62 0.27 305))",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        fontWeight: 600,
                      }}
                    >
                      &quot;{c.name}&quot;
                    </span>
                    {" "}(k={c.k}, rows={c.rows})
                  </p>
                ))}
                <p className="mt-2" style={{ color: "oklch(0.45 0.01 265)" }}>
                  Overall progress{" "}
                  <span style={{ color: "oklch(0.65 0.22 145)" }}>[====================]</span>
                  {" "}6/6
                </p>
                <p style={{ color: "oklch(0.65 0.22 145)" }}>✓ Benchmark written → contracts/token_ledger/build/benchmark.json</p>
                <p style={{ color: "oklch(0.65 0.22 145)" }}>✓ Posted to CompactForge Dashboard API — CI run recorded</p>
                <p className="mt-2" style={{ color: "oklch(0.82 0.006 260)" }}>
                  ${" "}<span className="cursor-blink">▋</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ══ CTA Banner ══════════════════════════════════════════════════════ */}
        <section
          className="py-28 relative overflow-hidden dot-grid"
        >
          <div className="absolute inset-0 glow-overlay pointer-events-none" />
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 70% at 50% 50%, oklch(0.62 0.23 272 / 0.09), transparent)" }} />

          <div className="relative max-w-3xl mx-auto px-6 text-center flex flex-col items-center gap-7">
            <span className="section-label">Get Started</span>
            <h2 className="text-4xl md:text-[3rem] font-heading tracking-tight leading-[1.05]">
              Ready to build on Midnight<br />
              <span className="gradient-text-animated">without the friction?</span>
            </h2>
            <p className="text-lg" style={{ color: "oklch(0.55 0.01 260)" }}>
              Open the dashboard, connect your 1AM Wallet on Preprod, and watch your
              contract&#39;s ZK circuits get benchmarked live.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/dashboard"
                className={buttonVariants({ size: "lg" })}
                style={{ paddingInline: "2.5rem", fontSize: "1rem", height: "3rem" }}
              >
                Open CompactForge <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="https://github.com/sauravs296/CompactForge"
                target="_blank"
                className={buttonVariants({ variant: "outline", size: "lg" })}
                style={{ paddingInline: "2.5rem", fontSize: "1rem", height: "3rem" }}
              >
                View on GitHub
              </Link>
            </div>

            {/* Feature icons below CTA */}
            <div
              className="flex flex-wrap justify-center gap-6 pt-4 text-sm"
              style={{ color: "oklch(0.45 0.01 260)" }}
            >
              {[
                { icon: Rocket,    label: "Midnight Preprod"   },
                { icon: Shield,    label: "ZK Privacy"         },
                { icon: GitBranch, label: "GitHub Actions"     },
                { icon: BarChart3, label: "Proof Benchmarks"   },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5" style={{ color: "oklch(0.62 0.23 272)" }} />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* ══ Footer ═══════════════════════════════════════════════════════════ */}
      <footer
        className="border-t py-10"
        style={{
          background: "oklch(0.10 0.011 265)",
          borderColor: "oklch(0.22 0.013 265 / 0.45)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">

            <div className="flex items-center gap-2.5">
              <Image src="/logo.png" width={22} height={22} alt="CompactForge" className="rounded-md opacity-85" />
              <span className="font-heading text-sm font-semibold" style={{ color: "oklch(0.75 0.006 265)" }}>
                CompactForge
              </span>
            </div>

            <div className="flex items-center gap-7 text-xs" style={{ color: "oklch(0.45 0.01 260)" }}>
              {[
                { href: "/dashboard",                                  label: "Dashboard" },
                { href: "https://github.com/sauravs296/CompactForge", label: "GitHub"    },
                { href: "#",                                           label: "SETUP.md"  },
                { href: "#",                                           label: "USAGE.md"  },
              ].map(({ href, label }) => (
                <Link
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  className="transition-colors hover:text-foreground"
                >
                  {label}
                </Link>
              ))}
            </div>

            <p className="text-xs" style={{ color: "oklch(0.38 0.008 265)" }}>
              Built for Midnight Network Hackathon © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
