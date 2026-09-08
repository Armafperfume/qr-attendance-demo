"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  onConfirm: (dataUrl: string) => void;
};

type CamState = "starting" | "live" | "preview" | "denied" | "unavailable";

export default function Camera({ onConfirm }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<CamState>("starting");
  const [photo, setPhoto] = useState<string | null>(null);
  const [errorDetail, setErrorDetail] = useState<string>("");

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const start = useCallback(async () => {
    setState("starting");
    setErrorDetail("");
    stop();
    if (!navigator.mediaDevices?.getUserMedia) {
      setState("unavailable");
      setErrorDetail("This browser does not support camera access.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: "user",
          width: { ideal: 720 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        // iOS Safari needs an explicit play() after srcObject is set.
        await video.play().catch(() => {});
      }
      setState("live");
    } catch (err) {
      const e = err as DOMException;
      if (e?.name === "NotAllowedError" || e?.name === "SecurityError") {
        setState("denied");
      } else {
        setState("unavailable");
        setErrorDetail(e?.message ?? String(err));
      }
    }
  }, [stop]);

  useEffect(() => {
    start();
    return stop;
  }, [start, stop]);

  const capture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const side = Math.min(video.videoWidth, video.videoHeight);
    const sx = (video.videoWidth - side) / 2;
    const sy = (video.videoHeight - side) / 2;
    const out = 640;
    const canvas = document.createElement("canvas");
    canvas.width = out;
    canvas.height = out;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Mirror so the saved selfie matches what the person saw on screen.
    ctx.translate(out, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sx, sy, side, side, 0, 0, out, out);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setPhoto(dataUrl);
    setState("preview");
    stop();
  };

  const retake = () => {
    setPhoto(null);
    start();
  };

  const failed = state === "denied" || state === "unavailable";

  return (
    <div className="flex flex-col items-center">
      <div className="relative aspect-square w-full max-w-[320px]">
        {/* Circular frame */}
        <div className="absolute inset-0 overflow-hidden rounded-full border-4 border-paper bg-ink shadow-sheet">
          {state === "preview" && photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="Your selfie" className="h-full w-full object-cover" />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="h-full w-full object-cover"
              style={{ transform: "scaleX(-1)" }}
            />
          )}
          {state === "starting" && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-paper/80">
              Starting camera…
            </div>
          )}
          {failed && (
            <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center text-sm text-paper">
              <span className="mb-1 text-2xl">📷</span>
              {state === "denied"
                ? "Camera permission was denied."
                : "Camera not available."}
            </div>
          )}
        </div>
        {/* Decorative ring */}
        <div
          aria-hidden
          className={`pointer-events-none absolute -inset-2 rounded-full border-2 ${
            state === "live" ? "border-accent/60" : "border-line"
          } transition-colors`}
        />
      </div>

      {state === "denied" && (
        <p className="mt-5 max-w-xs text-center text-sm text-muted">
          Allow camera access for this site in your browser settings, then tap
          retry.
        </p>
      )}
      {state === "unavailable" && (
        <p className="mt-5 max-w-xs text-center text-sm text-muted">
          {errorDetail || "Could not open the camera on this device."}
        </p>
      )}

      <div className="mt-7 flex w-full max-w-[320px] flex-col gap-3">
        {state === "live" && (
          <button type="button" onClick={capture} className="btn-primary">
            Capture
          </button>
        )}
        {state === "preview" && (
          <>
            <button
              type="button"
              onClick={() => photo && onConfirm(photo)}
              className="btn-primary"
            >
              Confirm
            </button>
            <button type="button" onClick={retake} className="btn-secondary">
              Retake
            </button>
          </>
        )}
        {failed && (
          <button type="button" onClick={start} className="btn-secondary">
            Retry camera
          </button>
        )}
      </div>
    </div>
  );
}
