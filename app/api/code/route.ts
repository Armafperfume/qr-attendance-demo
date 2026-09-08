import { NextResponse } from "next/server";
import { issueCode } from "@/lib/code";

export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json(issueCode(), {
    headers: { "Cache-Control": "no-store" },
  });
}
