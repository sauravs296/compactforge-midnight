/**
 * utils.test.ts
 *
 * Unit tests for pure utility functions used throughout CompactForge.
 * These functions live in InteractPanel and DeployButton — extracted here for testability.
 */

import { describe, it, expect } from "vitest";

// ─── Pure utilities (copied to be testable without jsdom imports) ────────────

function fromHex(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  return Uint8Array.from(Buffer.from(clean, "hex"));
}

function parseAddressToBytes32(addr: string): Uint8Array {
  let hex = addr.replace(/^0x/, "");
  if (hex.length < 64) hex = hex.padStart(64, "0");
  if (hex.length > 64) hex = hex.slice(0, 64);
  return Uint8Array.from(Buffer.from(hex, "hex"));
}

function makeInMemoryPrivateStateProvider() {
  const states = new Map<string, unknown>();
  return {
    async set(id: string, state: unknown) { states.set(id, state); },
    async get(id: string) { return states.get(id) ?? null; },
    async remove(id: string) { states.delete(id); },
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("fromHex()", () => {
  it("converts a bare hex string to a Uint8Array", () => {
    const result = fromHex("deadbeef");
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result).toHaveLength(4);
    expect(result[0]).toBe(0xde);
    expect(result[3]).toBe(0xef);
  });

  it("strips 0x prefix before decoding", () => {
    const withPrefix = fromHex("0xdeadbeef");
    const without    = fromHex("deadbeef");
    expect(withPrefix).toEqual(without);
  });

  it("returns an empty Uint8Array for empty string", () => {
    expect(fromHex("")).toHaveLength(0);
    expect(fromHex("0x")).toHaveLength(0);
  });
});

describe("parseAddressToBytes32()", () => {
  it("returns exactly 32 bytes", () => {
    const addr = "0xf1bf4b0609f5078e44e3704ef917a5edf0edbecfd4fbb3e05ba7181f0dcbe585";
    const bytes = parseAddressToBytes32(addr);
    expect(bytes).toHaveLength(32);
  });

  it("strips 0x prefix", () => {
    const with0x = parseAddressToBytes32("0xaabbccdd");
    const without = parseAddressToBytes32("aabbccdd");
    expect(with0x).toEqual(without);
  });

  it("left-pads short addresses to 32 bytes with zeroes", () => {
    const bytes = parseAddressToBytes32("ff");
    expect(bytes).toHaveLength(32);
    // Last byte should be 0xff
    expect(bytes[31]).toBe(0xff);
    // First bytes should all be zero
    for (let i = 0; i < 31; i++) expect(bytes[i]).toBe(0x00);
  });

  it("truncates addresses that exceed 32 bytes (64 hex chars)", () => {
    // 33 bytes = 66 hex chars
    const oversized = "aa".repeat(33);
    const bytes = parseAddressToBytes32(oversized);
    expect(bytes).toHaveLength(32);
  });

  it("handles a full 64-char hex address (no padding needed)", () => {
    const hex64 = "ab".repeat(32); // exactly 32 bytes
    const bytes = parseAddressToBytes32(hex64);
    expect(bytes).toHaveLength(32);
    expect(bytes[0]).toBe(0xab);
    expect(bytes[31]).toBe(0xab);
  });
});

describe("makeInMemoryPrivateStateProvider()", () => {
  it("stores and retrieves a state by id", async () => {
    const provider = makeInMemoryPrivateStateProvider();
    await provider.set("circuit1", { key: "value" });
    const result = await provider.get("circuit1");
    expect(result).toEqual({ key: "value" });
  });

  it("returns null for unknown id", async () => {
    const provider = makeInMemoryPrivateStateProvider();
    expect(await provider.get("nonexistent")).toBeNull();
  });

  it("removes state after remove()", async () => {
    const provider = makeInMemoryPrivateStateProvider();
    await provider.set("id1", "data");
    await provider.remove("id1");
    expect(await provider.get("id1")).toBeNull();
  });

  it("each provider instance has isolated state", async () => {
    const p1 = makeInMemoryPrivateStateProvider();
    const p2 = makeInMemoryPrivateStateProvider();
    await p1.set("shared", "from-p1");
    expect(await p2.get("shared")).toBeNull();
  });
});
