"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import {
  LayoutDashboard,
  Code2,
  Rocket,
  LineChart,
  Activity,
  Zap,
  ChevronRight,
  Menu,
  Home,
} from "lucide-react";

const NAV = [
  { href: "/dashboard",             icon: LayoutDashboard, label: "Overview"         },
  { href: "/dashboard/contracts",   icon: Code2,           label: "Contracts"        },
  { href: "/dashboard/deployments", icon: Rocket,          label: "Deployments"      },
  { href: "/dashboard/benchmarks",  icon: LineChart,       label: "Proof Benchmarks" },
  { href: "/dashboard/ci-runs",     icon: Activity,        label: "CI Runs"          },
];

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <>
      {NAV.map(({ href, icon: Icon, label }) => {
        const isActive =
          href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all relative"
            style={{
              background: isActive ? "oklch(0.62 0.23 272 / 0.12)" : "transparent",
              color: isActive ? "oklch(0.93 0.006 260)" : "oklch(0.50 0.011 260)",
              borderLeft: isActive
                ? "2px solid oklch(0.62 0.23 272)"
                : "2px solid transparent",
              fontWeight: isActive ? 500 : 400,
            }}
          >
            <Icon
              className="h-4 w-4 shrink-0"
              style={{ color: isActive ? "oklch(0.72 0.18 272)" : "oklch(0.42 0.01 265)" }}
            />
            <span>{label}</span>
            {isActive && (
              <ChevronRight
                className="ml-auto h-3.5 w-3.5"
                style={{ color: "oklch(0.62 0.23 272 / 0.7)" }}
              />
            )}
          </Link>
        );
      })}
    </>
  );
}

function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden md:flex w-60 flex-col border-r shrink-0"
      style={{
        background: "oklch(0.125 0.012 265)",
        borderColor: "oklch(0.22 0.013 265 / 0.55)",
      }}
    >
      <nav className="flex flex-col gap-0.5 p-3 flex-1 pt-4">
        <p
          className="px-3 pb-2 text-[10px] font-semibold tracking-widest uppercase"
          style={{ color: "oklch(0.38 0.01 265)" }}
        >
          Navigation
        </p>
        <NavLinks pathname={pathname} />
      </nav>

      {/* Sidebar footer */}
      <div className="p-3 border-t" style={{ borderColor: "oklch(0.22 0.013 265 / 0.4)" }}>
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-all"
        >
          <Home className="h-3.5 w-3.5" />
          Back to Home
        </Link>
      </div>
    </aside>
  );
}

function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        {/* @base-ui SheetTrigger uses render prop, not asChild */}
        <SheetTrigger
          render={
            <button
              className="flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-accent/60 shrink-0"
              aria-label="Toggle navigation"
            >
              <Menu className="h-5 w-5" style={{ color: "oklch(0.88 0.006 265)" }} />
            </button>
          }
        />
        <SheetContent
          side="left"
          className="w-64 p-0"
          style={{
            background: "oklch(0.125 0.012 265)",
            borderRight: "1px solid oklch(0.22 0.013 265 / 0.55)",
          }}
        >
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <SheetDescription className="sr-only">Dashboard navigation links</SheetDescription>

          <div className="flex flex-col h-full">
            {/* Mobile sheet header */}
            <div
              className="p-4 border-b"
              style={{ borderColor: "oklch(0.22 0.013 265 / 0.55)" }}
            >
              <Link
                href="/"
                className="flex items-center gap-2.5 font-heading font-semibold text-[13.5px] tracking-tight"
                style={{ color: "oklch(0.88 0.006 265)" }}
                onClick={() => setOpen(false)}
              >
                <Image src="/logo.png" width={22} height={22} alt="CompactForge Logo" className="rounded-md" />
                CompactForge
              </Link>
            </div>

            {/* Mobile nav links */}
            <nav className="flex flex-col gap-0.5 p-3 flex-1">
              <p
                className="px-3 pb-2 text-[10px] font-semibold tracking-widest uppercase"
                style={{ color: "oklch(0.38 0.01 265)" }}
              >
                Navigation
              </p>
              <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
            </nav>

            <div className="p-3 border-t" style={{ borderColor: "oklch(0.22 0.013 265 / 0.4)" }}>
              <Link
                href="/"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-all"
                onClick={() => setOpen(false)}
              >
                <Home className="h-3.5 w-3.5" />
                Back to Home
              </Link>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col" style={{ background: "oklch(0.11 0.012 265)" }}>

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b px-4 md:px-5"
        style={{
          background: "oklch(0.125 0.012 265 / 0.92)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderColor: "oklch(0.22 0.013 265 / 0.55)",
        }}
      >
        {/* Hamburger — mobile only */}
        <MobileNav />

        {/* Logo — desktop only */}
        <Link
          href="/"
          className="hidden md:flex items-center gap-2.5 md:w-56 font-heading font-semibold text-[13.5px] tracking-tight shrink-0 transition-opacity hover:opacity-80"
          style={{ color: "oklch(0.88 0.006 265)" }}
        >
          <Image src="/logo.png" width={22} height={22} alt="CompactForge Logo" className="rounded-md" />
          CompactForge
        </Link>

        {/* Divider */}
        <div className="hidden md:block w-px h-5 shrink-0" style={{ background: "oklch(0.25 0.013 265)" }} />

        {/* Network badge */}
        <div className="flex items-center gap-2 flex-1">
          <Badge
            variant="outline"
            className="hidden sm:flex gap-1.5 text-[11px] font-medium py-0.5"
            style={{
              background: "oklch(0.62 0.23 272 / 0.08)",
              color: "oklch(0.72 0.18 272)",
              borderColor: "oklch(0.62 0.23 272 / 0.25)",
            }}
          >
            <Zap className="h-2.5 w-2.5" />
            Midnight Preprod
          </Badge>
          <Badge
            variant="outline"
            className="flex sm:hidden gap-1.5 text-[11px] font-medium py-0.5"
            style={{
              background: "oklch(0.62 0.23 272 / 0.08)",
              color: "oklch(0.72 0.18 272)",
              borderColor: "oklch(0.62 0.23 272 / 0.25)",
            }}
          >
            <Zap className="h-2.5 w-2.5" />
            Preprod
          </Badge>
        </div>

        {/* Wallet connect */}
        <div className="flex items-center gap-2 shrink-0">
          <WalletConnectButton />
        </div>
      </header>

      <div className="flex flex-1">
        <Sidebar />

        {/* ── Main content ─────────────────────────────────────────────── */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
