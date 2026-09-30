"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { connectWallet, getUnshieldedAddress } from "@/lib/midnight/wallet";
import { toast } from "sonner";
import type { ConnectedAPI } from "@midnight-ntwrk/dapp-connector-api";

interface WalletContextType {
  address: string | null;
  isConnecting: boolean;
  walletApi: ConnectedAPI | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [walletApi, setWalletApi] = useState<ConnectedAPI | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== "undefined" && (window as unknown as { midnight: unknown }).midnight) {
        const saved = sessionStorage.getItem("midnight_wallet_address");
        if (saved) {
          try {
             const api = await connectWallet();
             setWalletApi(api);
             setAddress(saved);
          } catch(e) {
             console.error("Silent reconnect failed", e);
             sessionStorage.removeItem("midnight_wallet_address");
          }
        }
      }
    };
    checkConnection();
  }, []);

  const connect = async () => {
    try {
      setIsConnecting(true);
      const api = await connectWallet();
      const addr = await getUnshieldedAddress(api);
      setWalletApi(api);
      setAddress(addr);
      sessionStorage.setItem("midnight_wallet_address", addr);
      toast.success("Wallet connected successfully!");
    } catch (error: unknown) {
      console.error(error);
      const msg = error instanceof Error ? error.message : "Failed to connect to 1AM Wallet";
      toast.error(msg);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setWalletApi(null);
    sessionStorage.removeItem("midnight_wallet_address");
    toast.info("Wallet disconnected");
  };

  return (
    <WalletContext.Provider value={{ address, isConnecting, walletApi, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useMidnightWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useMidnightWallet must be used within a WalletProvider");
  }
  return context;
}
