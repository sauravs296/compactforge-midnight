import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * PATCH /api/deployments/[id]
 * Updates the status of a deployment (called by DeployButton after submitTxAsync succeeds).
 * Body: { status: "confirmed" | "failed" }
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!status || !["confirmed", "failed", "pending"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const deployment = await prisma.deployment.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(deployment);
  } catch (err) {
    console.error("[PATCH /api/deployments/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /api/deployments/[id]
 * Returns a single deployment by ID.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deployment = await prisma.deployment.findUnique({
      where: { id },
      include: { contract: true },
    });
    if (!deployment) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(deployment);
  } catch (err) {
    console.error("[GET /api/deployments/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

