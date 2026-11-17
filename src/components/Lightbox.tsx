import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type TouchEvent } from "react";
import type { Photo } from "../data/types";
import { ArrowLeft, ArrowRight, Close } from "./Icons";
import { Img } from "./Img";

interface Props {
  photos: Photo[];
  /** Index to show; null keeps the gallery closed. */
  index: number | null;
  onIndex: (i: number) => void;
  onClose: () => void;
  label: string;
}

/**
 * Full-screen gallery: native <dialog> (focus trap, Escape to close), previous/next buttons,
 * arrow keys, swipe, a photo counter, and click-to-zoom that follows the pointer.
 */
export function Lightbox({ photos, index, onIndex, onClose, label }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const touchX = useRef<number | null>(null);
  const open = index !== null;
  const i = index ?? 0;
  const n = photos.length;
  const photo = photos[i] ?? photos[0]!;
  // Portrait photos on a landscape screen: show a landscape cut around the car so it fills the screen.
  // "Whole photo" switches back to the uncropped frame.
  const [whole, setWhole] = useState(false);
  const [wideScreen, setWideScreen] = useState(true);
  useEffect(() => {
    if (open) setWideScreen(window.innerWidth > window.innerHeight * 1.1);
  }, [open]);
  const canCrop = photo.ratio < 1.2 && wideScreen;
  const aspect = canCrop && !whole ? 1.5 : undefined;

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
    if (!open) return;
    // Lock the page behind the gallery so it cannot scroll or show its scrollbar.
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = prev;
    };
  }, [open]);

  // A new photo always starts un-zoomed.
  useEffect(() => setZoom(false), [i, open]);

  const go = (step: number) => onIndex((i + step + n) % n);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight" && n > 1) { e.preventDefault(); go(1); }
    else if (e.key === "ArrowLeft" && n > 1) { e.preventDefault(); go(-1); }
    else if ((e.key === "+" || e.key === "=") && !zoom) setZoom(true);
    else if (e.key === "-" && zoom) setZoom(false);
  };

  const originFrom = (e: MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}% ${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`;
  };

  const onTouchStart = (e: TouchEvent) => { touchX.current = e.touches[0]?.clientX ?? null; };
  const onTouchEnd = (e: TouchEvent) => {
    const start = touchX.current;
    const end = e.changedTouches[0]?.clientX;
    touchX.current = null;
    if (zoom || start == null || end == null || n < 2) return;
    if (Math.abs(end - start) > 50) go(end < start ? 1 : -1);
  };

  const ctrl = "grid size-12 place-items-center rounded-full bg-white/10 text-paper backdrop-blur transition-colors hover:bg-white/20";

  return (
    <dialog
      ref={ref}
      aria-label={`${label}: photo gallery`}
      onClose={onClose}
      onKeyDown={onKeyDown}
      className="lightbox theme-dark m-0 h-[100dvh] max-h-none w-full max-w-none bg-ink p-0 text-paper"
    >
      {open && (
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <p className="text-sm text-paper/85" aria-live="polite">
              <span className="font-semibold text-paper">{i + 1}</span> / {n}
              <span className="ml-3 hidden text-paper/70 sm:inline">{photo.alt}</span>
            </p>
            <div className="flex items-center gap-2">
              {canCrop && (
                <button
                  type="button"
                  className="min-h-12 rounded-full bg-white/10 px-4 text-sm font-semibold text-paper backdrop-blur transition-colors hover:bg-white/20"
                  aria-pressed={whole}
                  onClick={() => setWhole((w) => !w)}
                >
                  {whole ? "Fit to screen" : "Whole photo"}
                </button>
              )}
              <button type="button" className={ctrl} onClick={() => setZoom((z) => !z)} aria-pressed={zoom} aria-label={zoom ? "Zoom out" : "Zoom in"}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                  <circle cx="11" cy="11" r="6.5" />
                  <path d="M16 16l4.5 4.5M8 11h6" />
                  {!zoom && <path d="M11 8v6" />}
                </svg>
              </button>
              <button type="button" className={ctrl} onClick={onClose} aria-label="Close gallery" autoFocus>
                <Close />
              </button>
            </div>
          </div>

          <div className="relative min-h-0 flex-1 overflow-hidden" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            <button
              type="button"
              className={`absolute inset-0 block h-full w-full ${zoom ? "cursor-zoom-out" : "cursor-zoom-in"}`}
              aria-label={zoom ? "Zoom out" : "Zoom in on this photo"}
              onClick={(e) => {
                setOrigin(originFrom(e));
                setZoom((z) => !z);
              }}
              onMouseMove={(e) => zoom && setOrigin(originFrom(e))}
            >
              <div
                className="h-full w-full transition-transform duration-300 ease-out motion-reduce:transition-none"
                style={{ transform: zoom ? "scale(2.2)" : "none", transformOrigin: origin }}
              >
                <Img
                  key={`${photo.id}-${aspect ?? "full"}`}
                  photo={photo}
                  sizes="100vw"
                  maxWidth={2560}
                  aspect={aspect}
                  style={{ objectFit: "contain", objectPosition: "50% 50%" }}
                />
              </div>
            </button>

            {n > 1 && (
              <>
                <button type="button" className={`${ctrl} absolute left-3 top-1/2 -translate-y-1/2 sm:left-6`} onClick={() => go(-1)} aria-label="Previous photo">
                  <ArrowLeft />
                </button>
                <button type="button" className={`${ctrl} absolute right-3 top-1/2 -translate-y-1/2 sm:right-6`} onClick={() => go(1)} aria-label="Next photo">
                  <ArrowRight />
                </button>
              </>
            )}
          </div>

          {n > 1 && (
            <ul className="flex justify-center gap-2 px-4 py-4" aria-label="Photos">
              {photos.map((p, k) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => onIndex(k)}
                    aria-label={`Show photo ${k + 1} of ${n}`}
                    aria-current={k === i}
                    className={`relative block aspect-[4/3] w-16 overflow-hidden bg-surface transition-opacity sm:w-20 ${
                      k === i ? "outline-2 outline-offset-2 outline-silver" : "opacity-75 hover:opacity-100"
                    }`}
                  >
                    <Img photo={p} sizes="80px" maxWidth={320} alt="" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </dialog>
  );
}
