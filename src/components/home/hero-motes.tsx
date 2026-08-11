/**
 * Airborne motes drifting through the hero.
 *
 * This exists because the *3D* mote field (`DepthField`, inside the R3F scene)
 * is gated to `quality.tier === "high"` — a second buffer upload and an extra
 * draw call are not free on a phone. That gate is correct, but it means the
 * particles the hero was designed around are invisible to every visitor on a
 * mid-range device, a software renderer, or anything the probe grades down.
 * Which is most of them.
 *
 * So this is the version that runs everywhere: sixteen absolutely-positioned
 * dots, one shared keyframe, no JS at all. It costs nothing to render and
 * nothing to animate — `transform` and `opacity` only, so the whole field
 * stays on the compositor.
 *
 * POSITIONS ARE HARD-CODED ON PURPOSE. This renders inside a Server Component,
 * and `Math.random()` here would produce different coordinates on the server
 * and on the client — a guaranteed hydration mismatch, and a particularly
 * annoying one to diagnose because the visual result looks fine either way.
 * Hand-placed also lets the field be *composed*: motes are biased toward the
 * lower two thirds and the outer thirds, keeping the middle of the frame — the
 * headline, and the vehicle's own glazing band — clear.
 */

type Mote = {
  /** Horizontal position, % from the left edge. */
  left: number;
  /** Vertical position, % from the bottom edge. */
  bottom: number;
  /** Diameter in px. Kept sub-pixel-ish; these are meant to be felt. */
  size: number;
  /** Sideways travel over one cycle. */
  dx: number;
  /** Seconds for one full rise. */
  duration: number;
  /** Negative, so the field starts mid-flight rather than all at the floor. */
  delay: number;
  /** Peak opacity. Varied so the field reads as having depth. */
  peak: number;
};

const MOTES: Mote[] = [
  { left: 6, bottom: 18, size: 2, dx: 10, duration: 19, delay: -3, peak: 0.34 },
  { left: 12, bottom: 44, size: 1.5, dx: -7, duration: 24, delay: -11, peak: 0.22 },
  { left: 17, bottom: 8, size: 2.5, dx: 12, duration: 16, delay: -7, peak: 0.4 },
  { left: 23, bottom: 62, size: 1.5, dx: 8, duration: 27, delay: -18, peak: 0.18 },
  { left: 29, bottom: 26, size: 2, dx: -9, duration: 21, delay: -1, peak: 0.3 },
  { left: 35, bottom: 12, size: 1.5, dx: 6, duration: 25, delay: -14, peak: 0.26 },
  { left: 42, bottom: 52, size: 1.5, dx: -6, duration: 29, delay: -22, peak: 0.16 },
  { left: 48, bottom: 6, size: 2, dx: 11, duration: 18, delay: -9, peak: 0.32 },
  { left: 55, bottom: 34, size: 1.5, dx: -8, duration: 23, delay: -5, peak: 0.24 },
  { left: 62, bottom: 14, size: 2.5, dx: 9, duration: 17, delay: -13, peak: 0.38 },
  { left: 68, bottom: 58, size: 1.5, dx: 7, duration: 26, delay: -20, peak: 0.18 },
  { left: 74, bottom: 22, size: 2, dx: -10, duration: 20, delay: -2, peak: 0.3 },
  { left: 80, bottom: 40, size: 1.5, dx: 8, duration: 28, delay: -16, peak: 0.2 },
  { left: 86, bottom: 10, size: 2.5, dx: -11, duration: 15, delay: -6, peak: 0.42 },
  { left: 91, bottom: 48, size: 1.5, dx: 6, duration: 22, delay: -10, peak: 0.22 },
  { left: 96, bottom: 28, size: 2, dx: -8, duration: 19, delay: -17, peak: 0.28 },
];

export function HeroMotes({ className }: { className?: string }) {
  return (
    <div aria-hidden className={className}>
      {MOTES.map((mote, index) => (
        <span
          key={index}
          className="absolute rounded-full will-change-transform"
          style={{
            left: `${mote.left}%`,
            bottom: `${mote.bottom}%`,
            width: mote.size,
            height: mote.size,
            // Warm core fading to nothing, so each dot reads as a point of
            // light rather than a hard circle at these sizes.
            background:
              "radial-gradient(circle, rgb(224 191 138 / 0.95), rgb(200 164 104 / 0) 70%)",
            animation: `mote-rise ${mote.duration}s ease-in-out ${mote.delay}s infinite`,
            // Consumed by the keyframe; see `mote-rise` in globals.css.
            ["--mote-dx" as string]: `${mote.dx}px`,
            ["--mote-peak" as string]: mote.peak,
          }}
        />
      ))}
    </div>
  );
}
