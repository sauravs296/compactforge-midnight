import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ExternalLink, LineChart } from "lucide-react";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

const GITHUB_REPO = "https://github.com/sauravs296/compactforge-midnight";

export default async function BenchmarksPage() {
  const circuits = await prisma.circuit.findMany({
    include: {
      benchmarks: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  });

  const BENCHMARKS = circuits.map(c => {
    const latest = c.benchmarks[0];
    return {
      circuit: c.name,
      provingMs: latest?.provingTimeMs || 0,
      commit: latest?.commitSha ? latest.commitSha.substring(0, 7) : 'unknown',
      commitUrl: latest?.commitSha ? `${GITHUB_REPO}/commit/${latest.commitSha}` : '#',
      date: latest?.createdAt ? new Date(latest.createdAt).toLocaleDateString() : 'N/A'
    };
  }).filter(b => b.provingMs > 0);

  const avgMs = BENCHMARKS.length > 0 ? Math.round(BENCHMARKS.reduce((s, b) => s + b.provingMs, 0) / BENCHMARKS.length) : 0;
  const maxMs = BENCHMARKS.length > 0 ? Math.max(...BENCHMARKS.map((b) => b.provingMs)) : 0;
  const minMs = BENCHMARKS.length > 0 ? Math.min(...BENCHMARKS.map((b) => b.provingMs)) : 0;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Proof Benchmarks</h1>
        <p className="text-muted-foreground">
          Per-circuit ZK proving times measured by the CompactForge CI pipeline.
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Proving Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{avgMs} ms</div>
            <p className="text-xs text-muted-foreground">across {BENCHMARKS.length} circuits</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Slowest Circuit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{maxMs} ms</div>
            <p className="text-xs text-muted-foreground font-mono">
              {BENCHMARKS.find((b) => b.provingMs === maxMs)?.circuit}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Fastest Circuit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{minMs} ms</div>
            <p className="text-xs text-muted-foreground font-mono">
              {BENCHMARKS.find((b) => b.provingMs === minMs)?.circuit}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Per-circuit proving bar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            Per-Circuit Proving Time
          </CardTitle>
          <CardDescription>
            Inline bar chart — width proportional to proving time relative to slowest circuit.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {BENCHMARKS.map((b) => (
            <div key={b.circuit} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-mono">{b.circuit}</span>
                <span className="text-muted-foreground">{b.provingMs} ms</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${(b.provingMs / maxMs) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Detailed table */}
      <Card>
        <CardHeader>
          <CardTitle>Circuit Parameters</CardTitle>
          <CardDescription>
            ZK circuit performance metrics tracked by the CompactForge CI pipeline.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Circuit</TableHead>
                <TableHead>Proving Time</TableHead>
                <TableHead>Commit</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {BENCHMARKS.map((b) => (
                <TableRow key={b.circuit}>
                  <TableCell className="font-mono">{b.circuit}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        b.provingMs === maxMs
                          ? "border-yellow-500/30 text-yellow-400"
                          : b.provingMs === minMs
                          ? "border-green-500/30 text-green-400"
                          : ""
                      }
                    >
                      {b.provingMs} ms
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{b.commit}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{b.date}</TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={b.commitUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs hover:underline"
                      style={{ color: "oklch(0.72 0.18 272)" }}
                    >
                      Verify
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
