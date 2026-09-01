import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * POST /api/deployments/[id]/confirm
 * Called after the Midnight indexer confirms the transaction on-chain.
 * Updates the deployment status to "confirmed".
 *
 * Body: { contractAddress?: string }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { contractAddress } = body as { contractAddress?: string };

    const deployment = await prisma.deployment.update({
      where: { id },
      data: {
        status: "confirmed",
        // Store contract address in txHash field if provided (schema limitation)
        ...(contractAddress ? { txHash: contractAddress } : {}),
      },
    });

    return NextResponse.json({ id: deployment.id, status: "confirmed" });
  } catch (err) {
    console.error("[POST /api/deployments/[id]/confirm]", err);
    return NextResponse.json({ error: "Not found or update failed" }, { status: 404 });
  }
}
