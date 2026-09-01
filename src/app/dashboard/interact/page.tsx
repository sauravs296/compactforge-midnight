import { InteractPanel } from "@/components/InteractPanel";

export default function InteractPage() {
  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Contract Interaction</h1>
        <p className="text-muted-foreground">
          Directly call smart contract circuits using your 1AM wallet.
        </p>
      </div>

      <InteractPanel defaultAddress="" />
    </div>
  );
}
