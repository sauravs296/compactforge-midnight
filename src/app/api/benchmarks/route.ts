import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * POST /api/benchmarks
 * Called from GitHub Actions after compiling + timing each circuit.
 * Body: { commitSha: string, benchmarks: Array<{ circuit: string, provingTimeMs: number }> }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { commitSha, benchmarks } = body as {
      commitSha: string;
      benchmarks: { circuit: string; provingTimeMs: number }[];
    };

    if (!commitSha || !Array.isArray(benchmarks)) {
      return NextResponse.json(
        { error: "commitSha and benchmarks[] are required" },
        { status: 400 }
      );
    }

    let recorded = 0;
    for (const b of benchmarks) {
      const circuit = await prisma.circuit.findFirst({ where: { name: b.circuit } });
      if (!circuit) continue;
      await prisma.benchmark.create({
        data: { circuitId: circuit.id, commitSha, provingTimeMs: b.provingTimeMs },
      });
      recorded++;
    }

    return NextResponse.json({ recorded }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/benchmarks]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /api/benchmarks
 * Returns the latest benchmark for each circuit.
 */
export async function GET() {
  try {
    const circuits = await prisma.circuit.findMany({
      include: { benchmarks: { orderBy: { createdAt: "desc" }, take: 1 } },
    });
    const result = circuits.map((c) => ({
      circuit: c.name,
      provingTimeMs: c.benchmarks[0]?.provingTimeMs ?? 0,
      commitSha: c.benchmarks[0]?.commitSha ?? null,
      date: c.benchmarks[0]?.createdAt ?? null,
    }));
    return NextResponse.json(result);
  } catch (err) {
    console.error("[GET /api/benchmarks]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
