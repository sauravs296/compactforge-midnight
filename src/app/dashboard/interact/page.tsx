import { InteractPanel } from "@/components/InteractPanel";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function InteractPage() {
  // Fetch the latest confirmed deployment to pre-fill the contract address
  const latestDeployment = await prisma.deployment.findFirst({
    where: { status: "confirmed" },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Contract Interaction</h1>
        <p className="text-muted-foreground">
          Directly call smart contract circuits using your 1AM wallet.
        </p>
      </div>

      <InteractPanel defaultAddress={latestDeployment?.txHash || ""} />
    </div>
  );
}
