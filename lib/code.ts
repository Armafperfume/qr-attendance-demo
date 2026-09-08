import { createHmac, randomInt, timingSafeEqual } from "crypto";

/**
 * Stateless, signed check-in codes.
 *
 * Vercel serverless functions do not share memory between invocations, so an
 * in-memory store would be unreliable. Instead the server issues a 4-digit code
 * together with a signed token (expiry + HMAC of code:expiry). Verification
 * recomputes the HMAC, so any instance can verify a code any other instance
 * issued. The signing key is a fixed constant — this is a throwaway demo with
 * no real data, so that is acceptable and intentional.
 */

const DEMO_SIGNING_KEY = "armaf-qr-attendance-demo-2026-not-a-real-secret";

export const CODE_TTL_MS = 2 * 60 * 1000; // 2 minutes

function sign(code: string, exp: number): string {
  return createHmac("sha256", DEMO_SIGNING_KEY)
    .update(`${code}:${exp}`)
    .digest("base64url");
}

export type IssuedCode = { code: string; token: string; expiresAt: number };

export function issueCode(now: number = Date.now()): IssuedCode {
  const code = randomInt(0, 10000).toString().padStart(4, "0");
  const expiresAt = now + CODE_TTL_MS;
  return { code, token: `${expiresAt}.${sign(code, expiresAt)}`, expiresAt };
}

export type VerifyResult =
  | { ok: true }
  | { ok: false; reason: "wrong" | "expired" | "invalid" };

export function verifyCode(
  code: unknown,
  token: unknown,
  now: number = Date.now()
): VerifyResult {
  if (typeof token !== "string" || typeof code !== "string") {
    return { ok: false, reason: "invalid" };
  }
  const [expStr, sig] = token.split(".");
  const exp = Number(expStr);
  if (!expStr || !sig || !Number.isFinite(exp)) {
    return { ok: false, reason: "invalid" };
  }
  if (now > exp) return { ok: false, reason: "expired" };
  if (!/^\d{4}$/.test(code)) return { ok: false, reason: "wrong" };

  const expected = Buffer.from(sign(code, exp));
  const given = Buffer.from(sig);
  const match = expected.length === given.length && timingSafeEqual(expected, given);
  return match ? { ok: true } : { ok: false, reason: "wrong" };
}
