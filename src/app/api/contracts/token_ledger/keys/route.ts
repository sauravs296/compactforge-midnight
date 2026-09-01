import { type NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

/**
 * GET /api/contracts/token_ledger/keys
 * Serves binary ZK prover/verifier keys from the committed artifacts directory.
 *
 * Query params:
 *   circuit  — circuit name (mint, transfer, deposit, burn, pause, unpause)
 *   type     — "prover" | "verifier"
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const circuit = searchParams.get("circuit");
  const type    = searchParams.get("type");

  if (!circuit || (type !== "prover" && type !== "verifier")) {
    return NextResponse.json(
      { error: "circuit and type (prover|verifier) query params required" },
      { status: 400 }
    );
  }

  const validCircuits = ["mint", "transfer", "deposit", "burn", "pause", "unpause"];
  if (!validCircuits.includes(circuit)) {
    return NextResponse.json({ error: "Unknown circuit" }, { status: 400 });
  }

  const filePath = path.resolve(
    process.cwd(),
    "contracts/token_ledger/build/token_ledger/keys",
    `${circuit}.${type}`
  );

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Key file not found" }, { status: 404 });
  }

  const data = fs.readFileSync(filePath);
  return new NextResponse(data, {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Length": String(data.length),
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
