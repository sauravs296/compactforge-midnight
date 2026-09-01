import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity, CheckCircle2, XCircle, Clock, ExternalLink } from "lucide-react";
import Link from "next/link";

import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// Your GitHub repo — used to build clickable commit + logs links
const GITHUB_REPO = "https://github.com/sauravs296/compactforge-midnight";

const STATUS_MAP: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
  success: {
    label: "Success",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    cls: "bg-green-500/10 text-green-500 border-green-500/20",
  },
  failed: {
    label: "Failed",
    icon: <XCircle className="h-3.5 w-3.5" />,
    cls: "bg-red-500/10 text-red-500 border-red-500/20",
  },
  pending: {
    label: "Running",
    icon: <Clock className="h-3.5 w-3.5" />,
    cls: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  },
};

export default async function CIRunsPage() {
  const runs = await prisma.cIRun.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const CI_RUNS = runs.map((run) => ({
    id: run.id,
    commitSha: run.commitSha,
    commit: run.commitSha.substring(0, 7),
    commitUrl: `${GITHUB_REPO}/commit/${run.commitSha}`,
    branch: "main",
    status: run.status,
    duration: run.duration || 45,
    circuits: 6,
    message: "CI Run on main branch",
    date: run.createdAt.toLocaleString(),
    logsUrl: run.logsUrl ?? `${GITHUB_REPO}/actions`,
  }));

  const successRate = CI_RUNS.length > 0
    ? Math.round((CI_RUNS.filter((r) => r.status === "success").length / CI_RUNS.length) * 100)
    : 100;

  const avgDuration = CI_RUNS.length > 0
    ? Math.round(CI_RUNS.reduce((s, r) => s + r.duration, 0) / CI_RUNS.length)
    : 0;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">CI Runs</h1>
        <p className="text-muted-foreground">
          GitHub Actions pipeline history for Compact contract compilation and testing.
        </p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{CI_RUNS.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400">{successRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {avgDuration}s
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Run history table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Run History
          </CardTitle>
          <CardDescription>
            Each row represents one execution of the <code>contracts.yml</code> GitHub Actions workflow.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Commit</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Circuits Compiled</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Logs</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {CI_RUNS.map((run) => {
                const s = STATUS_MAP[run.status] ?? STATUS_MAP.pending;
                return (
                  <TableRow key={run.id}>
                    <TableCell className="font-mono text-xs">
                      <Link
                        href={run.commitUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline flex items-center gap-1"
                        style={{ color: "oklch(0.72 0.18 272)" }}
                      >
                        {run.commit}
                        <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {run.branch}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm max-w-[220px] truncate">{run.message}</TableCell>
                    <TableCell>{run.circuits}</TableCell>
                    <TableCell>{run.duration}s</TableCell>
                    <TableCell>
                      <Badge className={`flex items-center gap-1 w-fit ${s.cls}`}>
                        {s.icon}
                        {s.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">{run.date}</TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={run.logsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs hover:underline"
                        style={{ color: "oklch(0.72 0.18 272)" }}
                      >
                        <ExternalLink className="h-3 w-3" />
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
