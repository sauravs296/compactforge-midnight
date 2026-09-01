import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * POST /api/ci-runs
 * Called from GitHub Actions contracts.yml after each run.
 * Body: { commitSha: string, status: "success"|"failed"|"pending", duration?: number, logsUrl?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { commitSha, status, duration, logsUrl } = body;

    if (!commitSha || !status) {
      return NextResponse.json(
        { error: "commitSha and status are required" },
        { status: 400 }
      );
    }

    const run = await prisma.cIRun.create({
      data: {
        commitSha,
        status,
        duration: duration ? Number(duration) : null,
        logsUrl: logsUrl ?? null,
      },
    });

    return NextResponse.json(run, { status: 201 });
  } catch (err) {
    console.error("[POST /api/ci-runs]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /api/ci-runs
 * Returns all CI runs, newest first.
 */
export async function GET() {
  try {
    const runs = await prisma.cIRun.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json(runs);
  } catch (err) {
    console.error("[GET /api/ci-runs]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
