/**
 * Device capability tiering for the 3D scene.
 *
 * "Cinematic" and "60fps on mid-range" are in tension, so rather than picking
 * one setting and hoping, the scene ships two grades and probes for which the
 * device can afford. Probing is cheap, synchronous and errs conservative —
 * being wrong costs a slightly plainer render, never a dropped frame budget.
 */

export type QualityTier = "high" | "low" | "none";

export type QualitySettings = {
  tier: QualityTier;
  /** Device pixel ratio clamp. */
  dpr: [number, number];
  /** Cube-map resolution for the local studio environment. */
  envResolution: number;
  /** Bloom + vignette. The single biggest "cinematic" lever, and the priciest. */
  postProcessing: boolean;
  /** Real-time shadow map from the key light. */
  shadows: boolean;
  /** Contact shadow render target size. */
  contactShadowResolution: number;
};

const HIGH: QualitySettings = {
  tier: "high",
  dpr: [1, 2],
  envResolution: 256,
  postProcessing: true,
  shadows: true,
  contactShadowResolution: 512,
};

const LOW: QualitySettings = {
  tier: "low",
  dpr: [1, 1.5],
  envResolution: 128,
  postProcessing: false,
  shadows: false,
  contactShadowResolution: 256,
};

const NONE: QualitySettings = { ...LOW, tier: "none" };

/** GPU strings that reliably indicate software or very weak hardware. */
const WEAK_RENDERER = /swiftshader|llvmpipe|software|mesa offscreen|microsoft basic/i;

function readRenderer(gl: WebGLRenderingContext): string {
  try {
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    if (!info) return "";
    return String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL) ?? "");
  } catch {
    return "";
  }
}

export function detectQuality(): QualitySettings {
  if (typeof window === "undefined") return NONE;

  // Motion sensitivity outranks everything: no canvas at all.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return NONE;

  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  if (cores <= 2 || memory <= 2) return NONE;

  let canvas: HTMLCanvasElement | null = null;
  try {
    canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl2") ??
      canvas.getContext("webgl")) as WebGLRenderingContext | null;

    if (!gl) return NONE;

    const renderer = readRenderer(gl);
    if (WEAK_RENDERER.test(renderer)) return LOW;

    // Mobile GPUs handle the base scene fine but not a full-res bloom pass.
    const isMobile =
      /android|iphone|ipad|ipod/i.test(navigator.userAgent) ||
      (navigator.maxTouchPoints > 1 && window.innerWidth < 900);

    if (isMobile || cores <= 4 || memory <= 4) return LOW;

    return HIGH;
  } catch {
    return NONE;
  } finally {
    // Release the probe context immediately — browsers cap simultaneous
    // WebGL contexts, and a leaked one can starve the real canvas.
    if (canvas) {
      const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
      (gl as WebGL2RenderingContext | null)
        ?.getExtension("WEBGL_lose_context")
        ?.loseContext();
    }
  }
}
