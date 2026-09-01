/**
 * zk-config.test.ts
 *
 * Tests for the ZK config provider pattern used in CompactForge.
 * Validates that getZKIR, getProverKey, and getVerifierKey build the correct
 * fetch URLs for each of the 6 token_ledger circuits.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── The custom zkConfigProvider factory ─────────────────────────────────────

function makeZkConfigProvider(baseURL: string, fetchFn: typeof fetch) {
  return {
    async getZKIR(circuitId: string): Promise<Uint8Array> {
      const res = await fetchFn(`${baseURL}/zkir/${circuitId}`);
      if (!res.ok) throw new Error(`Failed ZKIR ${circuitId}: ${res.status}`);
      return new Uint8Array(await res.arrayBuffer());
    },
    async getProverKey(circuitId: string): Promise<Uint8Array> {
      const res = await fetchFn(`${baseURL}/keys/${circuitId}.prover`);
      if (!res.ok) throw new Error(`Failed ProverKey ${circuitId}: ${res.status}`);
      return new Uint8Array(await res.arrayBuffer());
    },
    async getVerifierKey(circuitId: string): Promise<Uint8Array> {
      const res = await fetchFn(`${baseURL}/keys/${circuitId}.verifier`);
      if (!res.ok) throw new Error(`Failed VerifierKey ${circuitId}: ${res.status}`);
      return new Uint8Array(await res.arrayBuffer());
    },
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CIRCUITS = ["mint", "transfer", "deposit", "burn", "pause", "unpause"] as const;
const BASE_URL = "http://localhost:3000/api/contracts/token_ledger";

function makeMockFetch(responseBytes: Uint8Array = new Uint8Array([1, 2, 3, 4])) {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    arrayBuffer: async () => responseBytes.buffer,
  } as Partial<Response>);
}

function makeFailingFetch(status = 404) {
  return vi.fn().mockResolvedValue({ ok: false, status } as Partial<Response>);
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("makeZkConfigProvider() — URL construction", () => {
  let mockFetch: ReturnType<typeof makeMockFetch>;
  let provider: ReturnType<typeof makeZkConfigProvider>;

  beforeEach(() => {
    mockFetch = makeMockFetch();
    provider = makeZkConfigProvider(BASE_URL, mockFetch as unknown as typeof fetch);
  });

  it("getZKIR calls the correct /zkir/:circuit URL", async () => {
    await provider.getZKIR("deposit");
    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE_URL}/zkir/deposit`
    );
  });

  it("getProverKey calls the correct /keys/:circuit.prover URL", async () => {
    await provider.getProverKey("mint");
    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE_URL}/keys/mint.prover`
    );
  });

  it("getVerifierKey calls the correct /keys/:circuit.verifier URL", async () => {
    await provider.getVerifierKey("transfer");
    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE_URL}/keys/transfer.verifier`
    );
  });

  it("returns a Uint8Array from the response buffer", async () => {
    const result = await provider.getZKIR("burn");
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result[0]).toBe(1);
    expect(result[3]).toBe(4);
  });
});

describe("makeZkConfigProvider() — all 6 circuits are fetchable", () => {
  it.each(CIRCUITS)("getZKIR(%s) calls the correct URL", async (circuit) => {
    const mockFetch = makeMockFetch();
    const provider = makeZkConfigProvider(BASE_URL, mockFetch as unknown as typeof fetch);
    await provider.getZKIR(circuit);
    expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/zkir/${circuit}`);
  });

  it.each(CIRCUITS)("getProverKey(%s) calls the correct URL", async (circuit) => {
    const mockFetch = makeMockFetch();
    const provider = makeZkConfigProvider(BASE_URL, mockFetch as unknown as typeof fetch);
    await provider.getProverKey(circuit);
    expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/keys/${circuit}.prover`);
  });

  it.each(CIRCUITS)("getVerifierKey(%s) calls the correct URL", async (circuit) => {
    const mockFetch = makeMockFetch();
    const provider = makeZkConfigProvider(BASE_URL, mockFetch as unknown as typeof fetch);
    await provider.getVerifierKey(circuit);
    expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/keys/${circuit}.verifier`);
  });
});

describe("makeZkConfigProvider() — error handling", () => {
  it("throws on 404 from getZKIR", async () => {
    const provider = makeZkConfigProvider(BASE_URL, makeFailingFetch(404) as unknown as typeof fetch);
    await expect(provider.getZKIR("deposit")).rejects.toThrow("Failed ZKIR deposit: 404");
  });

  it("throws on 500 from getProverKey", async () => {
    const provider = makeZkConfigProvider(BASE_URL, makeFailingFetch(500) as unknown as typeof fetch);
    await expect(provider.getProverKey("mint")).rejects.toThrow("Failed ProverKey mint: 500");
  });

  it("throws on 403 from getVerifierKey", async () => {
    const provider = makeZkConfigProvider(BASE_URL, makeFailingFetch(403) as unknown as typeof fetch);
    await expect(provider.getVerifierKey("burn")).rejects.toThrow("Failed VerifierKey burn: 403");
  });
});
