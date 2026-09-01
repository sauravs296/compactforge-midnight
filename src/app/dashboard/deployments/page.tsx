import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Rocket, ExternalLink, Zap } from "lucide-react";
import Link from "next/link";

import prisma from "@/lib/prisma";
import { DeployButton } from "@/components/DeployButton";

export const dynamic = 'force-dynamic';

const EXPLORER_TX = "https://explorer.1am.xyz/tx/";

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-green-500/10 text-green-500 border-green-500/20",
  pending:   "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  failed:    "bg-red-500/10 text-red-500 border-red-500/20",
};

export default async function DeploymentsPage() {
  const dbDeployments = await prisma.deployment.findMany({
    include: { contract: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const totalConfirmed = dbDeployments.filter(d => d.status === "confirmed").length;
  const totalPending   = dbDeployments.filter(d => d.status === "pending").length;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deployments</h1>
          <p className="text-muted-foreground mt-1">
            On-chain contract deployments on the Midnight Preprod network.
          </p>
        </div>

        {/* ── Deploy action card ─────────────────────────────────────────── */}
        <Card className="w-full sm:w-auto sm:min-w-[320px] shrink-0">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4" style={{ color: "oklch(0.72 0.18 272)" }} />
              Deploy token_ledger
            </CardTitle>
            <CardDescription className="text-xs">
              Connect your 1AM wallet to deploy the compiled ZK token ledger contract
              to Midnight Preprod. The tx hash will be recorded here automatically.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DeployButton />
          </CardContent>
        </Card>
      </div>

      {/* ── Stats ──────────────────────────────────────────────────────── */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Deployments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dbDeployments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{totalConfirmed}</div>
          </CardContent>
        </Card>
        <Card className="col-span-2 md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-500">{totalPending}</div>
          </CardContent>
        </Card>
      </div>

      {/* ── Deployments table ──────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            Preprod Deployment History
          </CardTitle>
          <CardDescription>
            Every row is a real on-chain deployment transaction. Click the tx hash to
            view it on the Midnight block explorer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dbDeployments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Rocket className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-sm">No deployments yet.</p>
              <p className="text-xs mt-1">
                Use the &quot;Deploy token_ledger&quot; panel above to make your first on-chain deployment.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract</TableHead>
                    <TableHead>Network</TableHead>
                    <TableHead>Tx Hash</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Deployed At</TableHead>
                    <TableHead className="text-right">Explorer</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dbDeployments.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-mono font-medium">{d.contract.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{d.network}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs max-w-[160px]">
                        <Link
                          href={`${EXPLORER_TX}${d.txHash}?network=preprod`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block truncate hover:underline"
                          style={{ color: "oklch(0.72 0.18 272)" }}
                          title={d.txHash}
                        >
                          {d.txHash}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_STYLES[d.status] ?? "border text-muted-foreground"}>
                          {d.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {d.createdAt.toLocaleDateString()} {d.createdAt.toLocaleTimeString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`${EXPLORER_TX}${d.txHash}?network=preprod`}
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
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
