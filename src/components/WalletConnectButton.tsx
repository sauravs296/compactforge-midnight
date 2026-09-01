"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

import { Loader2, Wallet } from "lucide-react";
import { connectWallet, getUnshieldedAddress } from "@/lib/midnight/wallet";
import { toast } from "sonner";

export function WalletConnectButton() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    // Check if we already connected in this session (mocking persistence for now)
    const saved = sessionStorage.getItem("midnight_wallet_address");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) setAddress(saved);
  }, []);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      const connected = await connectWallet();
      const addr = await getUnshieldedAddress(connected);
      setAddress(addr);
      sessionStorage.setItem("midnight_wallet_address", addr);
      toast.success("Wallet connected successfully!");
    } catch (error: unknown) {
      console.error(error);
      const msg = error instanceof Error ? error.message : "Failed to connect to 1AM Wallet";
      toast.error(msg);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setAddress(null);
    sessionStorage.removeItem("midnight_wallet_address");
    toast.info("Wallet disconnected");
  };

  if (address) {
    return (
      <Button variant="outline" size="sm" onClick={handleDisconnect} className="text-xs h-8 gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
        <Wallet className="h-3.5 w-3.5 text-primary" />
        <span className="font-mono text-primary">
          {address.slice(0, 8)}...{address.slice(-6)}
        </span>
      </Button>
    );
  }

  return (
    <Button variant="default" size="sm" onClick={handleConnect} disabled={isConnecting} className="text-xs h-8 gap-1.5 shadow-[0_0_15px_rgba(100,50,255,0.2)]">
      {isConnecting ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Wallet className="h-3.5 w-3.5" />
      )}
      {isConnecting ? "Connecting..." : "Connect 1AM Wallet"}
    </Button>
  );
}
