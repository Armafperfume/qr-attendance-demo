import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-12">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
        Armaf
      </p>
      <h1 className="font-display text-4xl leading-tight text-ink">
        QR attendance
        <br />
        prototype
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        A throwaway demo of the check-in flow. No accounts, no database, no
        photos leave the phone.
      </p>

      <div className="mt-8 grid gap-3">
        <Link
          href="/poster"
          className="group rounded-2xl border border-line bg-paper p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-sheet"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-display text-xl text-ink">Printable poster</div>
              <div className="mt-1 text-sm text-muted">
                A4 sheet with the QR code. Print it and stick it at the door.
              </div>
            </div>
            <span className="text-2xl text-accent transition group-hover:translate-x-0.5">
              →
            </span>
          </div>
        </Link>
        <Link
          href="/checkin"
          className="group rounded-2xl border border-line bg-paper p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-sheet"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-display text-xl text-ink">Check-in flow</div>
              <div className="mt-1 text-sm text-muted">
                What opens when someone scans the QR. Best on a phone.
              </div>
            </div>
            <span className="text-2xl text-accent transition group-hover:translate-x-0.5">
              →
            </span>
          </div>
        </Link>
      </div>

      <ol className="mt-10 space-y-2 text-xs text-muted">
        <li>1. Scan the poster → phone opens the check-in page.</li>
        <li>2. Phone shows a 4-digit code that expires in 2 minutes.</li>
        <li>3. Employee types the code back, picks their name.</li>
        <li>4. Front camera selfie → confirmation with IST time.</li>
      </ol>
    </main>
  );
}
