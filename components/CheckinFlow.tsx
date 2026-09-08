"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Camera from "@/components/Camera";

type Step = "loading" | "show" | "enter" | "who" | "camera" | "done" | "failed";

const NAMES = ["Demo Employee 1", "Demo Employee 2", "Demo Employee 3", "Demo Employee 4"];

const istTime = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});
const istDate = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
});

function useNow(active: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [active]);
  return now;
}

export default function CheckinFlow() {
  const [step, setStep] = useState<Step>("loading");
  const [code, setCode] = useState("");
  const [token, setToken] = useState("");
  const [expiresAt, setExpiresAt] = useState(0);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(0);
  const [checking, setChecking] = useState(false);
  const [name, setName] = useState(NAMES[0]);
  const [photo, setPhoto] = useState<string | null>(null);
  const [markedAt, setMarkedAt] = useState<Date | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const timing = step === "show" || step === "enter";
  const now = useNow(timing);
  const expired = timing && expiresAt > 0 && now > expiresAt;
  const secondsLeft = Math.max(0, Math.ceil((expiresAt - now) / 1000));
  const countdown = useMemo(
    () => `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`,
    [secondsLeft]
  );

  // Step 1: request a code from the server.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/code", { method: "POST", cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { code: string; token: string; expiresAt: number };
        if (cancelled) return;
        setCode(data.code);
        setToken(data.token);
        setExpiresAt(data.expiresAt);
        setStep("show");
      } catch {
        if (!cancelled) setStep("failed");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (step === "enter") inputRef.current?.focus();
  }, [step]);

  const verify = useCallback(
    async (value: string) => {
      if (checking || value.length !== 4) return;
      setChecking(true);
      setError(null);
      try {
        const res = await fetch("/api/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: value, token }),
        });
        const result = (await res.json()) as
          | { ok: true }
          | { ok: false; reason: "wrong" | "expired" | "invalid" };
        if (result.ok) {
          setStep("who");
        } else if (result.reason === "expired") {
          setExpiresAt(0); // force the expired state
          setStep("enter");
        } else {
          setError("That code does not match. Check the digits and try again.");
          setInput("");
          setShake((n) => n + 1);
          inputRef.current?.focus();
        }
      } catch {
        setError("Could not reach the server. Try again.");
      } finally {
        setChecking(false);
      }
    },
    [checking, token]
  );

  const onInput = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 4);
    setInput(digits);
    setError(null);
    if (digits.length === 4) verify(digits);
  };

  const onPhoto = (dataUrl: string) => {
    setPhoto(dataUrl);
    setMarkedAt(new Date());
    setStep("done");
  };

  const showExpired = timing && (expired || expiresAt === 0);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pb-16 pt-10">
      <header className="mb-8 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Armaf · Attendance
        </p>
        <StepDots step={step} />
      </header>

      {step === "loading" && (
        <Card key="loading">
          <p className="text-center text-sm text-muted">Getting your code…</p>
        </Card>
      )}

      {step === "failed" && (
        <Card key="failed">
          <h1 className="font-display text-2xl">Could not get a code</h1>
          <p className="mt-2 text-sm text-muted">
            The server did not respond. Refresh to try again.
          </p>
          <button onClick={() => location.reload()} className="btn-primary mt-6">
            Refresh
          </button>
        </Card>
      )}

      {showExpired && (
        <Card key="expired">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-soft text-xl">
            ⏱
          </div>
          <h1 className="font-display text-center text-2xl">Code expired</h1>
          <p className="mt-2 text-center text-sm text-muted">
            Codes only last 2 minutes. Refresh to get a new one.
          </p>
          <button onClick={() => location.reload()} className="btn-primary mt-6">
            Refresh for a new code
          </button>
        </Card>
      )}

      {step === "show" && !showExpired && (
        <Card key="show">
          <p className="text-center text-sm text-muted">Your check-in code</p>
          <div className="mt-4 flex justify-center gap-3">
            {code.split("").map((d, i) => (
              <span
                key={i}
                className="font-display flex h-16 w-12 items-center justify-center rounded-xl border border-line bg-cream text-4xl text-ink shadow-inner"
              >
                {d}
              </span>
            ))}
          </div>
          <p className="mt-5 text-center text-xs text-muted">
            Expires in <span className="font-mono text-ink">{countdown}</span>
          </p>
          <button onClick={() => setStep("enter")} className="btn-primary mt-7">
            I&apos;ve noted it — continue
          </button>
        </Card>
      )}

      {step === "enter" && !showExpired && (
        <Card key="enter">
          <h1 className="font-display text-center text-2xl">Enter your 4-digit code</h1>
          <p className="mt-1 text-center text-xs text-muted">
            Expires in <span className="font-mono text-ink">{countdown}</span>
          </p>

          <div key={shake} className={`relative mt-6 ${shake ? "shake" : ""}`}>
            <div className="flex justify-center gap-3" aria-hidden>
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`font-display flex h-16 w-12 items-center justify-center rounded-xl border bg-paper text-4xl transition ${
                    error
                      ? "border-red text-red"
                      : i === input.length
                        ? "border-accent ring-2 ring-accent/20"
                        : "border-line"
                  }`}
                >
                  {input[i] ?? ""}
                </span>
              ))}
            </div>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => onInput(e.target.value)}
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              maxLength={4}
              aria-label="4-digit code"
              disabled={checking}
              className="absolute inset-0 h-full w-full cursor-text opacity-0"
            />
          </div>

          <p
            className={`mt-4 min-h-[1.25rem] text-center text-sm ${
              error ? "text-red" : "text-muted"
            }`}
            role="status"
          >
            {checking ? "Checking…" : error ?? "Tap the boxes to type."}
          </p>
        </Card>
      )}

      {step === "who" && (
        <Card key="who">
          <h1 className="font-display text-center text-2xl">Who are you?</h1>
          <p className="mt-1 text-center text-sm text-muted">
            Demo names only. Nothing is saved.
          </p>
          <div className="mt-6 grid gap-2">
            {NAMES.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setName(n)}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-base transition ${
                  name === n
                    ? "border-accent bg-cream text-ink ring-2 ring-accent/20"
                    : "border-line bg-paper text-ink/80 hover:border-accent/50"
                }`}
              >
                {n}
                {name === n && <span className="text-accent">●</span>}
              </button>
            ))}
          </div>
          <button onClick={() => setStep("camera")} className="btn-primary mt-7">
            Continue to selfie
          </button>
        </Card>
      )}

      {step === "camera" && (
        <Card key="camera">
          <h1 className="font-display text-center text-2xl">Take a quick selfie</h1>
          <p className="mb-6 mt-1 text-center text-sm text-muted">
            Stays on this phone. Nothing is uploaded.
          </p>
          <Camera onConfirm={onPhoto} />
        </Card>
      )}

      {step === "done" && markedAt && (
        <Card key="done" tone="green">
          <div className="pop mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green text-paper shadow-card">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
              <path
                className="check-path"
                d="M10 21 L17 28 L30 13"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="font-display mt-5 text-center text-3xl text-green">
            Attendance marked
          </h1>
          <p className="mt-2 text-center text-sm text-muted">
            {istDate.format(markedAt)} ·{" "}
            <span className="font-mono text-ink">{istTime.format(markedAt)} IST</span>
          </p>

          {photo && (
            <div className="mx-auto mt-6 h-36 w-36 overflow-hidden rounded-full border-4 border-paper shadow-sheet">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo} alt="Selfie" className="h-full w-full object-cover" />
            </div>
          )}
          <p className="mt-4 text-center text-lg text-ink">{name}</p>
          <p className="mt-1 text-center text-xs text-muted">
            Code <span className="font-mono">{code}</span> · verified
          </p>

          <button onClick={() => location.reload()} className="btn-secondary mt-8">
            Start over
          </button>
        </Card>
      )}
    </main>
  );
}

function Card({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone?: "green";
}) {
  return (
    <section
      className={`step-enter rounded-3xl border p-6 shadow-card ${
        tone === "green" ? "border-green/30 bg-green-soft/60" : "border-line bg-paper"
      }`}
    >
      {children}
    </section>
  );
}

function StepDots({ step }: { step: Step }) {
  const order: Step[] = ["show", "enter", "who", "camera", "done"];
  const idx = order.indexOf(step);
  return (
    <div className="flex gap-1.5" aria-hidden>
      {order.map((s, i) => (
        <span
          key={s}
          className={`h-1.5 rounded-full transition-all ${
            i <= idx ? "w-5 bg-accent" : "w-1.5 bg-line"
          }`}
        />
      ))}
    </div>
  );
}
