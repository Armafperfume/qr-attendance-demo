# QR Attendance Prototype (demo)

Throwaway demo of a QR-based attendance check-in for management review.
**Not production.** No database, no auth, no storage, no real employee data.

## Pages

| Route      | What it is |
|------------|------------|
| `/`        | Landing hub linking to the two pages below |
| `/poster`  | A4-styled printable poster with a QR that encodes `{this host}/checkin` |
| `/checkin` | The flow the QR opens: code → enter code → pick name → selfie → confirmation (IST) |

## How the code works

`/api/code` issues a random 4-digit code plus a signed token (`expiry.HMAC(code:expiry)`),
valid for 2 minutes. `/api/verify` recomputes the HMAC, so it is stateless and works on
Vercel serverless where memory is not shared between invocations. The signing key is a
fixed constant in `lib/code.ts` — fine for a demo, not for anything real.

The selfie is captured with `getUserMedia` (front camera) into a canvas and kept as a
data URL in React state only. Nothing is uploaded.

## Run locally

```bash
npm install
npm run dev
```

Camera access needs HTTPS or `localhost`. To test on a phone against your laptop, use a
tunnel (e.g. `npx localtunnel --port 3000`) or just deploy to Vercel.

## Deploy

```bash
npx vercel
```

No environment variables required.
