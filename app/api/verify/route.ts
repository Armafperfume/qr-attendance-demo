import { NextResponse } from "next/server";
import { verifyCode } from "@/lib/code";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { code?: unknown; token?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    // fall through with empty body → "invalid"
  }
  const result = verifyCode(body.code, body.token);
  return NextResponse.json(result, {
    status: result.ok ? 200 : 400,
    headers: { "Cache-Control": "no-store" },
  });
}
