import { type NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

/**
 * GET /api/contracts/token_ledger/zkir/[circuit]
 * Serves binary ZKIR (Zero-Knowledge Intermediate Representation) files.
 */
export async function GET(req: NextRequest, { params }: { params: any }) {
  const { circuit } = await params;
  
  const validCircuits = ["mint", "transfer", "deposit", "burn", "pause", "unpause"];
  if (!validCircuits.includes(circuit)) {
    return NextResponse.json({ error: "Unknown circuit" }, { status: 400 });
  }

  const zkirDir = path.resolve(
    process.cwd(),
    "contracts/token_ledger/build/token_ledger/zkir"
  );

  // Prefer the binary .bzkir format, fall back to text .zkir
  const bzkir = path.join(zkirDir, `${circuit}.bzkir`);
  const zkir  = path.join(zkirDir, `${circuit}.zkir`);
  const filePath = fs.existsSync(bzkir) ? bzkir : zkir;

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "ZKIR file not found" }, { status: 404 });
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
