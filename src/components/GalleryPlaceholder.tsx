/**
 * Branded card shown in a gallery slide until its TikTok player has loaded
 * (TikTok offers no thumbnail, so this replaces what would be a black pane).
 */
export function GalleryPlaceholder({ label, shimmer = true }: { label: string; shimmer?: boolean }) {
  return (
    <div
      data-testid="gallery-placeholder"
      className="absolute inset-0 flex flex-col items-center justify-center gap-4 overflow-hidden bg-gradient-to-b from-espresso via-[#3a2f22] to-espresso"
    >
      {shimmer && <div className="gallery-shimmer absolute inset-0" aria-hidden />}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.jpg"
        alt=""
        className="relative h-16 w-16 rounded-full border border-gold/60 object-cover shadow-md"
        draggable={false}
      />
      <p className="relative px-6 text-center text-xs uppercase tracking-[0.3em] text-gold">
        {label}
      </p>
    </div>
  );
}
