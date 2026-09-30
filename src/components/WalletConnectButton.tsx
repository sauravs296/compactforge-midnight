"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Wallet } from "lucide-react";
import { useMidnightWallet } from "./WalletContext";

export function WalletConnectButton() {
  const { address, isConnecting, connect, disconnect } = useMidnightWallet();

  if (address) {
    return (
      <Button variant="outline" size="sm" onClick={disconnect} className="text-xs h-8 gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
        <Wallet className="h-3.5 w-3.5 text-primary" />
        <span className="font-mono text-primary">
          {address.slice(0, 8)}...{address.slice(-6)}
        </span>
      </Button>
    );
  }

  return (
    <Button variant="default" size="sm" onClick={connect} disabled={isConnecting} className="text-xs h-8 gap-1.5 shadow-[0_0_15px_rgba(100,50,255,0.2)]">
      {isConnecting ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Wallet className="h-3.5 w-3.5" />
      )}
      {isConnecting ? "Connecting..." : "Connect 1AM Wallet"}
    </Button>
  );
}
