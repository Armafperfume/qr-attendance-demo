"use client";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper shadow-card transition hover:bg-accent-deep active:scale-[0.98]"
    >
      Print
    </button>
  );
}
