import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

/**
 * GET /api/contracts/token_ledger/contract
 * Serves the compiled Compact contract as JavaScript.
 * The client fetches this, creates a blob URL, and dynamically imports it.
 */
export async function GET() {
  const filePath = path.resolve(
    process.cwd(),
    "contracts/token_ledger/build/token_ledger/contract/index.js"
  );

  if (!fs.existsSync(filePath)) {
    return NextResponse.json(
      { error: "Compiled contract not found. Run: compact compile contracts/token_ledger/token_ledger.compact" },
      { status: 404 }
    );
  }

  const js = fs.readFileSync(filePath, "utf-8");
  return new NextResponse(js, {
    status: 200,
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
