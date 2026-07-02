# Viriditas Murmuration + SEO Quick Wins — Design

**Date:** 2026-07-01
**Status:** Approved, implementing

## Goal

Two bundled changes to alexanderhonkala.com:
1. Restyle the homepage murmuration (boids) animation into the "Viriditas" green pastel palette with soft trails and light depth.
2. Fold in the low-cost SEO fixes already diagnosed (canonical tags, JSON-LD Person, real PNG social card) so the indexing work continues.

## 1. Palette & day/night modes (`src/boid.js`, `src/main.js`, `src/style.css`)

Each boid picks a "species" at spawn from a palette of green pairs plus a gold accent (~1 in 8):

| Species | Day (deepened, visible on light bg) | Night (true pastel) |
|---|---|---|
| Sage | `#8fbc8f` | `#bfd8b8` |
| Celadon | `#6dae8f` | `#a8d5ba` |
| Moss | `#a3c585` | `#cdebd8` |
| Gold thread | `#c9b458` | `#e4d9a0` |

Per-boid ±lightness jitter (as the current grey variation) keeps texture. Each boid stores both its day and night color; mode switching only changes which one draws. **This replaces the old night-mode inversion** (`255 - avg` math, which could clip past white).

Backgrounds: homepage day `#fafbf7` paper-white, night `#0f1b14` forest-ink (scoped to the homepage so content pages keep their existing navy).

## 2. Soft trails (`src/main.js`)

Replace the per-frame `clearRect` with a translucent background-colored `fillRect`. Trail persistence is one tunable alpha: **0.12 day, 0.07 night** (light backgrounds smear if fade is too slow). On a day↔night transition, do one opaque clear so old-color ghost trails don't linger. The CSS body background must match the fill color exactly. Canvas is painted opaque on init and resize to avoid flashes.

## 3. Light depth (`src/boid.js`)

Per-boid `depth ∈ [0,1]` folds into existing size variation:
- radius `0.5 + depth*2.0` (≈0.5–2.5px)
- alpha `0.35 + depth*0.65`
- maxSpeed scaled `0.75–1.15×` for parallax

Boids sort by depth once at spawn (far draw first). **No blur** — keeps 5000 boids at 60fps.

## 4. SEO quick wins (HTML heads + `scripts/prerender.js`)

- `<link rel="canonical">` on index/about/research/hyperfixations/thinking, and per-post via prerender (mirrors the existing `og:url` rewrite).
- JSON-LD `Person` schema on the homepage: name, url, jobTitle, `sameAs` → ORCID, LinkedIn, X, ResearchGate (all already-public real-name profiles; no pseudonym).
- Replace homepage/content-page `og:image` (currently `eye.svg`) with a real 1200×630 PNG card generated at build by the existing `generateCardSvg` path. Posts already generate their own `og.png`.

## 5. Testing

- `?mode=night` / `?mode=day` query override forces mode (disables time-based auto-update) so both looks are checkable any time of day.
- Perf check at 5000 boids in dev; visual check of both modes; `npm run build` then confirm prerendered pages carry the new head tags.

## Files touched

`src/boid.js`, `src/main.js`, `src/style.css`, `index.html`, `about.html`, `research.html`, `hyperfixations.html`, `thinking.html`, `post.html`, `scripts/prerender.js`.

## Privacy note

Git identity for this repo is `Alexander Honkala <Alexander.Honkala@gmail.com>`; history was scrubbed of the `viriditax` pseudonym on 2026-07-01. No pseudonym enters any commit, content, or `sameAs` link.
