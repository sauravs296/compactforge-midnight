import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * POST /api/deployments
 * Records a new contract deployment. Called from the client-side DeployButton
 * after the 1AM wallet submits the deployment transaction to Midnight Preprod.
 *
 * Body: { contractName: string, txHash: string, network: string, walletAddress?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contractName, txHash, network = "preprod", walletAddress } = body;

    if (!contractName || !txHash) {
      return NextResponse.json(
        { error: "contractName and txHash are required" },
        { status: 400 }
      );
    }

    // Find or create the contract record
    let contract = await prisma.contract.findFirst({
      where: { name: contractName },
    });

    if (!contract) {
      // Auto-create the contract record from the compiled artifact metadata
      // and link it to a default project/org
      let org = await prisma.organization.findFirst();
      if (!org) {
        org = await prisma.organization.create({
          data: { name: "CompactForge Demo" },
        });
      }

      let project = await prisma.project.findFirst({
        where: { organizationId: org.id },
      });
      if (!project) {
        project = await prisma.project.create({
          data: {
            name: "token_ledger",
            repository: "https://github.com/sauravs296/CompactForge",
            organizationId: org.id,
          },
        });
      }

      contract = await prisma.contract.create({
        data: {
          name: contractName,
          projectId: project.id,
        },
      });

      // Auto-seed circuits from the compiled contract-info.json
      const circuits = ["mint", "transfer", "deposit", "burn", "pause", "unpause"];
      await prisma.circuit.createMany({
        data: circuits.map((name) => ({
          name,
          contractId: contract!.id,
        })),
        skipDuplicates: true,
      });
    }

    const deployment = await prisma.deployment.create({
      data: {
        txHash,
        network,
        status: "pending",
        contractId: contract.id,
      },
    });

    // Optionally record the wallet that performed the deployment
    if (walletAddress) {
      let org = await prisma.organization.findFirst();
      if (org) {
        let user = await prisma.user.findFirst({ where: { organizationId: org.id } });
        if (user) {
          await prisma.wallet.upsert({
            where: { address: walletAddress },
            update: {},
            create: { address: walletAddress, userId: user.id },
          });
        }
      }
    }

    return NextResponse.json({ id: deployment.id, txHash, status: "pending" }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/deployments]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /api/deployments
 * Returns recent deployments from the database.
 */
export async function GET() {
  try {
    const deployments = await prisma.deployment.findMany({
      include: { contract: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json(deployments);
  } catch (err) {
    console.error("[GET /api/deployments]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
