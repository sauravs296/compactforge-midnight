import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity, CheckCircle2, XCircle, Clock } from "lucide-react";

import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

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
    commit: run.commitSha.substring(0, 7),
    branch: "main",
    status: run.status,
    duration: run.duration || 45,
    circuits: 6,
    message: "CI Run on main branch",
    date: run.createdAt.toLocaleString(),
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {CI_RUNS.map((run) => {
                const s = STATUS_MAP[run.status] ?? STATUS_MAP.pending;
                return (
                  <TableRow key={run.id}>
                    <TableCell className="font-mono text-xs">{run.commit}</TableCell>
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
