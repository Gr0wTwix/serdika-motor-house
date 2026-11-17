import type { CSSProperties } from "react";
import type { Photo } from "../data/types";

const WIDTHS = [480, 768, 1080, 1440, 1920, 2560];

/**
 * Unsplash (imgix) URL. With `aspect`, the CDN crops to that shape around the photo's focus point,
 * e.g. a landscape cut of a portrait photo for full-screen viewing.
 */
export const photoUrl = (id: string, w: number, aspect?: number, focus?: string) => {
  let url = `https://images.unsplash.com/${id}?auto=format&fit=crop&q=70&w=${w}`;
  if (aspect) {
    const [x = "50%", y = "50%"] = (focus ?? "50% 50%").split(" ");
    const fp = (s: string) => Math.min(1, Math.max(0, parseFloat(s) / 100)).toFixed(2);
    url += `&ar=${Math.round(aspect * 100)}:100&crop=focalpoint&fp-x=${fp(x)}&fp-y=${fp(y)}`;
  }
  return url;
};

interface Props {
  photo: Photo;
  /** The `sizes` attribute, e.g. "(min-width: 1024px) 50vw, 100vw". */
  sizes: string;
  /** Largest width to offer; keep small for thumbnails. */
  maxWidth?: number;
  priority?: boolean;
  className?: string;
  style?: CSSProperties;
  alt?: string;
  /** Ask the CDN for this width/height ratio (cropped around the focus point). */
  aspect?: number;
}

/**
 * Responsive image. Unsplash serves AVIF/WebP via auto=format.
 * Width/height attributes reserve space; the parent frame usually fixes the aspect ratio.
 */
export function Img({ photo, sizes, maxWidth = 2560, priority, className = "", style, alt, aspect }: Props) {
  const widths = WIDTHS.filter((w) => w <= maxWidth);
  const largest = widths[widths.length - 1] ?? 1080;
  const url = (w: number) => photoUrl(photo.id, w, aspect, photo.focus);
  return (
    <img
      src={url(Math.min(1080, largest))}
      srcSet={widths.map((w) => `${url(w)} ${w}w`).join(", ")}
      sizes={sizes}
      alt={alt ?? photo.alt}
      width={1200}
      height={Math.round(1200 / (aspect ?? photo.ratio))}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      // React 18 types do not yet include fetchPriority on img
      {...({ fetchpriority: priority ? "high" : "auto" } as Record<string, string>)}
      className={`h-full w-full object-cover ${className}`}
      style={{ objectPosition: photo.focus ?? "50% 50%", ...style }}
    />
  );
}
