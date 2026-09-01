/**
 * api-validation.test.ts
 *
 * Tests for the request validation logic in our Next.js API routes.
 * We test the validation rules directly, without hitting a live database,
 * by re-implementing the same guard logic in pure functions.
 */

import { describe, it, expect } from "vitest";

// ─── Mirrors validation logic from /api/deployments POST ────────────────────

function validateDeploymentBody(body: unknown): { ok: true; data: { contractName: string; txHash: string; network: string; walletAddress?: string } } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Body must be a JSON object" };
  const { contractName, txHash, network = "preprod", walletAddress } = body as Record<string, unknown>;
  if (!contractName || typeof contractName !== "string") return { ok: false, error: "contractName and txHash are required" };
  if (!txHash || typeof txHash !== "string")             return { ok: false, error: "contractName and txHash are required" };
  return { ok: true, data: { contractName, txHash, network: (network as string) ?? "preprod", walletAddress: walletAddress as string | undefined } };
}

// ─── Mirrors validation logic from /api/benchmarks POST ─────────────────────

function validateBenchmarkBody(body: unknown): { ok: true; data: { commitSha: string; benchmarks: { circuit: string; provingTimeMs: number }[] } } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Body must be a JSON object" };
  const { commitSha, benchmarks } = body as Record<string, unknown>;
  if (!commitSha || typeof commitSha !== "string") return { ok: false, error: "commitSha and benchmarks[] are required" };
  if (!Array.isArray(benchmarks))                  return { ok: false, error: "commitSha and benchmarks[] are required" };
  return { ok: true, data: { commitSha, benchmarks: benchmarks as { circuit: string; provingTimeMs: number }[] } };
}

// ─── Mirrors validation logic from /api/ci-runs POST ────────────────────────

function validateCIRunBody(body: unknown): { ok: true; data: { commitSha: string; status: string } } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid body" };
  const { commitSha, status } = body as Record<string, unknown>;
  if (!commitSha || typeof commitSha !== "string") return { ok: false, error: "commitSha is required" };
  const valid = ["pending", "success", "failed"];
  if (!status || !valid.includes(status as string)) return { ok: false, error: "status must be pending|success|failed" };
  return { ok: true, data: { commitSha, status: status as string } };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("POST /api/deployments — validation", () => {
  it("accepts a valid deployment body", () => {
    const result = validateDeploymentBody({
      contractName: "token_ledger",
      txHash: "0xdeadbeef1234",
      network: "preprod",
      walletAddress: "0xabc",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.contractName).toBe("token_ledger");
      expect(result.data.network).toBe("preprod");
    }
  });

  it("defaults network to 'preprod' when not provided", () => {
    const result = validateDeploymentBody({ contractName: "token_ledger", txHash: "0xabc" });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.network).toBe("preprod");
  });

  it("rejects missing contractName", () => {
    const result = validateDeploymentBody({ txHash: "0xabc" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/required/);
  });

  it("rejects missing txHash", () => {
    const result = validateDeploymentBody({ contractName: "token_ledger" });
    expect(result.ok).toBe(false);
  });

  it("rejects null body", () => {
    expect(validateDeploymentBody(null).ok).toBe(false);
  });
});

describe("POST /api/benchmarks — validation", () => {
  const validBenchmarks = [
    { circuit: "deposit",  provingTimeMs: 1340 },
    { circuit: "transfer", provingTimeMs: 1810 },
    { circuit: "mint",     provingTimeMs: 1890 },
    { circuit: "burn",     provingTimeMs: 1120 },
    { circuit: "pause",    provingTimeMs: 750  },
    { circuit: "unpause",  provingTimeMs: 750  },
  ];

  it("accepts a valid benchmark payload with all 6 circuits", () => {
    const result = validateBenchmarkBody({ commitSha: "abc1234", benchmarks: validBenchmarks });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.commitSha).toBe("abc1234");
      expect(result.data.benchmarks).toHaveLength(6);
    }
  });

  it("rejects missing commitSha", () => {
    const result = validateBenchmarkBody({ benchmarks: validBenchmarks });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/required/);
  });

  it("rejects when benchmarks is not an array", () => {
    const result = validateBenchmarkBody({ commitSha: "abc1234", benchmarks: "not-an-array" });
    expect(result.ok).toBe(false);
  });

  it("accepts an empty benchmarks array (no circuits compiled yet)", () => {
    const result = validateBenchmarkBody({ commitSha: "abc1234", benchmarks: [] });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.benchmarks).toHaveLength(0);
  });
});

describe("POST /api/ci-runs — validation", () => {
  it("accepts a success status CI run", () => {
    const result = validateCIRunBody({ commitSha: "f1bf4b0", status: "success" });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.status).toBe("success");
  });

  it("accepts a failed status CI run", () => {
    const result = validateCIRunBody({ commitSha: "deadbeef", status: "failed" });
    expect(result.ok).toBe(true);
  });

  it("accepts a pending status CI run", () => {
    const result = validateCIRunBody({ commitSha: "abc", status: "pending" });
    expect(result.ok).toBe(true);
  });

  it("rejects an unrecognised status string", () => {
    const result = validateCIRunBody({ commitSha: "abc", status: "running" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/pending|success|failed/);
  });

  it("rejects missing commitSha", () => {
    const result = validateCIRunBody({ status: "success" });
    expect(result.ok).toBe(false);
  });
});
