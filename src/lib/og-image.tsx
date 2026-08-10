import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { formatCount, site } from "./site";

const FONT_DIR = join(process.cwd(), "node_modules/geist/dist/fonts/geist-sans");

/**
 * Satori (the engine behind `ImageResponse`) needs real font bytes — it has
 * no access to the browser's font stack, so `next/font`'s CSS-variable
 * approach doesn't apply here. Reading Geist's own TTFs straight from the
 * package keeps the card in the same typeface as the rest of the site rather
 * than falling back to Satori's default.
 */
async function loadFonts() {
  const [regular, semibold] = await Promise.all([
    readFile(join(FONT_DIR, "Geist-Regular.ttf")),
    readFile(join(FONT_DIR, "Geist-SemiBold.ttf")),
  ]);

  return [
    { name: "Geist", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "Geist", data: semibold, weight: 600 as const, style: "normal" as const },
  ];
}

/**
 * The branded share card injected on every route via the sibling
 * `opengraph-image.tsx` / `twitter-image.tsx` file-convention routes.
 *
 * One card for the whole site rather than per-page imagery: Danca Go has no
 * per-article photography to differentiate pages with, and a single strong,
 * consistent card — eyebrow, wordmark, tagline, proof numbers — is what most
 * premium sites without a blog actually ship. The palette, the eyebrow
 * treatment (dot + tracked caps) and the wordmark split (white "Danca", gold
 * "Go") are pulled straight from `globals.css` and `Logo` so a shared link
 * reads as the same brand as the site it opens onto, not a bolted-on graphic.
 *
 * Every Satori container with more than one child needs an explicit
 * `display: "flex"` — Satori has no block/inline layout model, only flexbox.
 */
export async function renderOgCard() {
  const fonts = await loadFonts();

  const node = (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "76px",
        backgroundColor: "#030303",
        backgroundImage:
          "radial-gradient(circle at 50% 0%, rgba(200,164,104,0.18), rgba(3,3,3,0) 62%)",
        fontFamily: "Geist",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            display: "flex",
            width: 9,
            height: 9,
            borderRadius: 999,
            backgroundColor: "#c8a468",
          }}
        />
        <div
          style={{
            display: "flex",
            fontSize: 21,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: "#6e6e73",
            fontWeight: 500,
          }}
        >
          Moldova — București — Otopeni — Constanța
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div
          style={{
            display: "flex",
            // A leading-space text node ("{' Go'}") is not reliable here:
            // Satori collapses it the way CSS white-space:normal collapses
            // leading whitespace in a text run, which rendered "DancaGo"
            // with no gap at all. An explicit flex `gap` is deterministic.
            gap: 20,
            fontSize: 130,
            fontWeight: 600,
            letterSpacing: -5,
            lineHeight: 1,
            color: "#ffffff",
          }}
        >
          <span style={{ display: "flex" }}>Danca</span>
          <span style={{ display: "flex", color: "#c8a468" }}>Go</span>
        </div>
        {/* Word-spaced via flex `gap`, not a plain text node: Satori's own
            space-width calculation rendered a visibly wider gap after
            "Transport" than between the other words in this exact string —
            a font/kerning quirk specific to its JS text-shaping, not
            anything in the source string (verified character-by-character).
            Splitting into words sidesteps its measurement entirely. */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, fontSize: 34, color: "#a1a1a6" }}>
          {site.tagline.split(" ").map((word, index) => (
            <span key={`${word}-${index}`} style={{ display: "flex" }}>
              {word}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div
          style={{
            display: "flex",
            width: "100%",
            height: 1,
            backgroundImage:
              "linear-gradient(90deg, rgba(3,3,3,0), rgba(200,164,104,0.55), rgba(3,3,3,0))",
          }}
        />
        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
            fontSize: 24,
            color: "#6e6e73",
          }}
        >
          <div style={{ display: "flex", gap: 36 }}>
            <div style={{ display: "flex" }}>
              <span style={{ color: "#c8a468" }}>{site.rating.score}</span>
              <span>{`/${site.rating.max} rating`}</span>
            </div>
            <div style={{ display: "flex" }}>{`${formatCount(site.rating.count)}+ pasageri`}</div>
            <div style={{ display: "flex" }}>{`din ${site.founded}`}</div>
          </div>
          <div style={{ display: "flex" }}>dancago.ro</div>
        </div>
      </div>
    </div>
  );

  return { node, fonts };
}
