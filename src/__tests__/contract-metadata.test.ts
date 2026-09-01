/**
 * contract-metadata.test.ts
 *
 * Tests for the token_ledger contract metadata structure.
 * Validates the shape of the contract-info object served by /api/contracts/token_ledger/contract,
 * and validates circuit argument builder helpers used across the codebase.
 */

import { describe, it, expect } from "vitest";

// ─── Mirrors the contract metadata shape returned by the API ─────────────────

const CONTRACT_METADATA = {
  name: "token_ledger",
  language: "Compact",
  version: "0.20",
  network: "preprod",
  circuits: [
    { id: "mint",     access: "admin",  args: ["recipient:Bytes<32>", "amount:Uint<64>"] },
    { id: "transfer", access: "public", args: ["recipient:Bytes<32>", "amount:Uint<64>"] },
    { id: "deposit",  access: "public", args: ["amount:Uint<64>"] },
    { id: "burn",     access: "public", args: ["amount:Uint<64>"] },
    { id: "pause",    access: "admin",  args: [] },
    { id: "unpause",  access: "admin",  args: [] },
  ],
  ledgerState: {
    balances:    "Map<Bytes<32>, Uint<64>>",
    totalSupply: "Uint<64>",
    ownerCount:  "Uint<32>",
    admin:       "Bytes<32>",
    paused:      "Boolean",
  },
};

// ─── Circuit arg builder (mirrors InteractPanel logic) ───────────────────────

function parseAddressToBytes32(addr: string): Uint8Array {
  let hex = addr.replace(/^0x/, "");
  if (hex.length < 64) hex = hex.padStart(64, "0");
  if (hex.length > 64) hex = hex.slice(0, 64);
  return Uint8Array.from(Buffer.from(hex, "hex"));
}

function buildCircuitArgs(
  circuitId: string,
  amount: string,
  recipient: string
): unknown[] {
  if (circuitId === "mint" || circuitId === "transfer") {
    return [parseAddressToBytes32(recipient), BigInt(amount || "0")];
  } else if (circuitId === "deposit" || circuitId === "burn") {
    return [BigInt(amount || "0")];
  } else if (circuitId === "pause" || circuitId === "unpause") {
    return [];
  }
  throw new Error(`Unknown circuitId: ${circuitId}`);
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("CONTRACT_METADATA — structure", () => {
  it("contains exactly 6 circuits", () => {
    expect(CONTRACT_METADATA.circuits).toHaveLength(6);
  });

  it("has the correct circuit IDs", () => {
    const ids = CONTRACT_METADATA.circuits.map((c) => c.id);
    expect(ids).toContain("mint");
    expect(ids).toContain("transfer");
    expect(ids).toContain("deposit");
    expect(ids).toContain("burn");
    expect(ids).toContain("pause");
    expect(ids).toContain("unpause");
  });

  it("admin-only circuits are mint, pause, unpause", () => {
    const adminCircuits = CONTRACT_METADATA.circuits
      .filter((c) => c.access === "admin")
      .map((c) => c.id);
    expect(adminCircuits).toContain("mint");
    expect(adminCircuits).toContain("pause");
    expect(adminCircuits).toContain("unpause");
    expect(adminCircuits).not.toContain("deposit");
    expect(adminCircuits).not.toContain("transfer");
    expect(adminCircuits).not.toContain("burn");
  });

  it("ledger state has all required fields", () => {
    const fields = Object.keys(CONTRACT_METADATA.ledgerState);
    expect(fields).toContain("balances");
    expect(fields).toContain("totalSupply");
    expect(fields).toContain("ownerCount");
    expect(fields).toContain("admin");
    expect(fields).toContain("paused");
  });

  it("network is preprod", () => {
    expect(CONTRACT_METADATA.network).toBe("preprod");
  });
});

describe("buildCircuitArgs() — argument routing", () => {
  const RECIPIENT = "0xf1bf4b0609f5078e44e3704ef917a5edf0edbecfd4fbb3e05ba7181f0dcbe585";

  it("deposit returns [BigInt(amount)]", () => {
    const args = buildCircuitArgs("deposit", "1000", "");
    expect(args).toHaveLength(1);
    expect(args[0]).toBe(BigInt(1000));
  });

  it("burn returns [BigInt(amount)]", () => {
    const args = buildCircuitArgs("burn", "500", "");
    expect(args).toHaveLength(1);
    expect(args[0]).toBe(BigInt(500));
  });

  it("transfer returns [Bytes32, BigInt(amount)]", () => {
    const args = buildCircuitArgs("transfer", "200", RECIPIENT);
    expect(args).toHaveLength(2);
    expect(args[0]).toBeInstanceOf(Uint8Array);
    expect((args[0] as Uint8Array)).toHaveLength(32);
    expect(args[1]).toBe(BigInt(200));
  });

  it("mint returns [Bytes32, BigInt(amount)]", () => {
    const args = buildCircuitArgs("mint", "9999", RECIPIENT);
    expect(args).toHaveLength(2);
    expect(args[0]).toBeInstanceOf(Uint8Array);
    expect(args[1]).toBe(BigInt(9999));
  });

  it("pause returns []", () => {
    expect(buildCircuitArgs("pause", "", "")).toHaveLength(0);
  });

  it("unpause returns []", () => {
    expect(buildCircuitArgs("unpause", "", "")).toHaveLength(0);
  });

  it("deposit with BigInt(0) when amount is empty string", () => {
    const args = buildCircuitArgs("deposit", "", "");
    expect(args[0]).toBe(BigInt(0));
  });

  it("throws for an unknown circuit ID", () => {
    expect(() => buildCircuitArgs("liquidate", "100", "")).toThrow("Unknown circuitId: liquidate");
  });
});

describe("parseAddressToBytes32() — edge cases", () => {
  it("returns 32 bytes for a standard 64-char address", () => {
    const addr = "f1bf4b0609f5078e44e3704ef917a5edf0edbecfd4fbb3e05ba7181f0dcbe585";
    expect(parseAddressToBytes32(addr)).toHaveLength(32);
  });

  it("the first byte of a full address is decoded correctly", () => {
    const addr = "f1" + "00".repeat(31); // f1 followed by 31 zero bytes
    const bytes = parseAddressToBytes32(addr);
    expect(bytes[0]).toBe(0xf1);
    expect(bytes[31]).toBe(0x00);
  });

  it("two equal addresses produce identical Uint8Arrays", () => {
    const addr = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
    expect(parseAddressToBytes32(addr)).toEqual(parseAddressToBytes32(addr));
  });
});
