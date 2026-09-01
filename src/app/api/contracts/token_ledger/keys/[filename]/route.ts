import { type NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

/**
 * GET /api/contracts/token_ledger/keys/[filename]
 * Serves binary ZK prover/verifier keys from the committed artifacts directory.
 */
export async function GET(req: NextRequest, { params }: { params: any }) {
  const { filename } = await params; // e.g. "deposit.prover"

  // Try different extensions if it doesn't match directly
  let targetFile = filename;
  if (filename.endsWith(".pk")) targetFile = filename.replace(".pk", ".prover");
  if (filename.endsWith(".vk")) targetFile = filename.replace(".vk", ".verifier");

  const filePath = path.resolve(
    process.cwd(),
    "contracts/token_ledger/build/token_ledger/keys",
    targetFile
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
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
    },
  });
}
