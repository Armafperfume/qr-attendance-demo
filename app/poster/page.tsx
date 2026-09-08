import { headers } from "next/headers";
import QRCode from "qrcode";
import PrintButton from "@/components/PrintButton";

export const dynamic = "force-dynamic";

function checkinUrl(): string {
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}/checkin`;
}

export default async function PosterPage() {
  const url = checkinUrl();
  const svg = await QRCode.toString(url, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 0,
    color: { dark: "#2a2118", light: "#00000000" },
  });

  return (
    <main className="flex min-h-dvh flex-col items-center px-4 py-8 print:p-0">
      <div className="no-print mb-6 flex w-full max-w-[210mm] items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Poster
          </p>
          <p className="text-sm text-muted">
            A4 · encodes <span className="font-mono text-ink">{url}</span>
          </p>
        </div>
        <PrintButton />
      </div>

      <section
        className="poster-sheet relative flex aspect-[210/297] w-full max-w-[210mm] flex-col items-center bg-white text-center shadow-sheet"
        style={{ padding: "8% 8% 7%" }}
      >
        <div
          aria-hidden
          className="absolute inset-[5%] rounded-[6px] border border-line"
        />

        <p className="mt-2 text-[clamp(11px,1.4vw,14px)] font-semibold uppercase tracking-[0.35em] text-accent">
          Armaf
        </p>
        <h1 className="font-display mt-[4%] text-[clamp(28px,5.5vw,56px)] leading-[1.05] text-ink">
          Scan to mark
          <br />
          your attendance
        </h1>
        <p className="mt-[3%] max-w-[70%] text-[clamp(11px,1.6vw,16px)] leading-relaxed text-muted">
          Open your phone camera, point it at the code, and follow the steps on
          screen.
        </p>

        <div
          className="mt-auto mb-auto w-[62%] max-w-[420px]"
          dangerouslySetInnerHTML={{ __html: svg }}
        />

        <p className="font-mono text-[clamp(9px,1.2vw,12px)] tracking-wide text-muted">
          {url.replace(/^https?:\/\//, "")}
        </p>
        <p className="mt-[2%] text-[clamp(9px,1.1vw,11px)] uppercase tracking-[0.25em] text-muted/70">
          Prototype · not for production use
        </p>
      </section>
    </main>
  );
}
