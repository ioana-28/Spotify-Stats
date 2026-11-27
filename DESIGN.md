---
name: Spotify Stats
description: A year-round, sticker-scrapbook view of your Spotify listening.
colors:
  near-black-canvas: "#0a0f05"
  sand: "#d9d1bd"
  deep-sand: "#cbc6b0"
  ink-soft: "#59594b"
  cream-canvas-text: "#d9d1bd"
  muted-cream: "#cbc6b0"
  rose: "#dd709f"
  matcha: "#b7d09a"
  gold: "#c2a76a"
  sage: "#8fae7c"
  lavender: "#ad95c9"
  teal: "#7fa8a1"
  olive: "#304a1e"
  olive-deep: "#1f2f13"
  olive-forest: "#253817"
  hairline: "rgba(10, 15, 5, 0.08)"
  canvas-dot: "rgba(217, 209, 189, 0.09)"
  skeleton: "#c9c2ae"
typography:
  display:
    fontFamily: "Fredoka, ui-rounded, 'Segoe UI', sans-serif"
    fontSize: "34px"
    fontWeight: 600
    lineHeight: 1.1
  headline:
    fontFamily: "Fredoka, ui-rounded, 'Segoe UI', sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.2
  title:
    fontFamily: "Fredoka, ui-rounded, 'Segoe UI', sans-serif"
    fontSize: "17px"
    fontWeight: 600
    lineHeight: 1.2
  body:
    fontFamily: "Nunito, ui-rounded, 'Segoe UI', sans-serif"
    fontSize: "14px"
    fontWeight: 700
    lineHeight: 1.5
  label:
    fontFamily: "Nunito, ui-rounded, 'Segoe UI', sans-serif"
    fontSize: "11px"
    fontWeight: 800
    lineHeight: 1.4
    letterSpacing: "1.1px"
rounded:
  chip: "8px"
  row: "12px"
  stat: "16px"
  art: "18px"
  card: "20px"
  card-lg: "24px"
  pill: "999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "7": "32px"
  "8": "40px"
components:
  button-cta:
    backgroundColor: "{colors.sage}"
    textColor: "{colors.near-black-canvas}"
    typography: "{typography.display}"
    rounded: "{rounded.pill}"
    padding: "14px 30px"
  button-icon:
    backgroundColor: "{colors.matcha}"
    textColor: "{colors.near-black-canvas}"
    rounded: "{rounded.pill}"
    width: "44px"
    height: "44px"
  nav-item:
    backgroundColor: "transparent"
    textColor: "{colors.ink-soft}"
    typography: "{typography.body}"
    rounded: "{rounded.row}"
    padding: "10px 15px"
  nav-item-active:
    backgroundColor: "{colors.olive}"
    textColor: "{colors.sand}"
    typography: "{typography.body}"
    rounded: "{rounded.row}"
    padding: "10px 15px"
  tab:
    backgroundColor: "{colors.deep-sand}"
    textColor: "{colors.near-black-canvas}"
    typography: "{typography.body}"
    rounded: "{rounded.row}"
    padding: "10px 20px"
  tab-active:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.near-black-canvas}"
    typography: "{typography.body}"
    rounded: "{rounded.row}"
    padding: "10px 20px"
  card-bento:
    backgroundColor: "{colors.sand}"
    rounded: "{rounded.card}"
    padding: "24px"
  list-row:
    backgroundColor: "{colors.deep-sand}"
    rounded: "{rounded.row}"
    padding: "10px 15px"
  chip-category:
    backgroundColor: "{colors.olive}"
    textColor: "{colors.sand}"
    rounded: "{rounded.chip}"
    width: "28px"
    height: "28px"
---

# Design System: Spotify Stats

## Overview

**Creative North Star: "Matcha Scrapbook"**

Spotify Stats reads like a personal listening scrapbook: sand-colored paper cards pinned onto a near-black page, outlined in ink, and lifted with hard olive sticker shadows. The system is playful but not childish — rounded Fredoka headlines sit next to tight Nunito labels, and every card feels physically placed rather than generated.

The voice is a playful print zine. Layout is dense and bento-like: a large "now playing" tile next to two ranked lists, all with the same paper stock, ink outline, and offset shadow. Color is deliberate and rare; rose marks live state and rank accents, olive anchors navigation, and matcha signals the single account action.

The world is warm, tactile, and slightly off-register. It is a dashboard first: scanning ranks, reading names, and checking now-playing outrank decoration. The sticker treatment is the decoration, applied consistently instead of loudly.

**Key Characteristics:**
- Sand paper surfaces on a near-black canvas.
- 2.5px ink outlines on every surface, with hard offset olive shadows (no blur).
- Rounded display type (Fredoka) paired with compact bold body type (Nunito).
- A cream-on-dark canvas; rose used sparingly for state and rank.
- Bento grid with 12 columns and deliberate empty gutters.

## Colors

A sand-and-olive palette warmed by rose, with dark fills reserved for navigation.

### Primary
- **Rose** (#dd709f): live indicator, brand mark, progress fill, rank and count accents. Used on ≤10% of a screen; it signals "this is active" rather than decorating.

### Secondary
- **Olive** (#304a1e): active navigation fill, category chips, and the color of every sticker shadow. Olive-deep (#1f2f13) and olive-forest (#253817) vary nav items without leaving the family.

### Tertiary
- **Matcha** (#b7d09a): the log-out action and other lightweight, positive utilities.
- **Gold** (#c2a76a): selected time-range tab and first-place podium accents.
- **Sage** (#8fae7c): primary connect/log-in call to action.
- **Lavender** (#ad95c9), **Teal** (#7fa8a1): categorical accents in genre pills and placeholder art.

### Neutral
- **Near-Black Canvas** (#0a0f05): page background, borders, and text on sand.
- **Sand** (#d9d1bd): cards, sidebar, and modals.
- **Deep Sand** (#cbc6b0): list rows, avatars, and secondary surfaces.
- **Ink Soft** (#59594b): metadata and muted text on sand.
- **Cream Text** (#d9d1bd): headings on the dark canvas. **Muted Cream** (#cbc6b0) for the supporting line beneath them.

### Named Rules
**The Sand-First Rule.** Content lives on sand surfaces. The dark canvas is a frame, not a place for body text; only page titles and their subtitle sit directly on it, in cream.

**The One Rose Rule.** Rose appears only for live/active state, rank accents, and progress. It never becomes a button fill or a large background.

**The No-Lavender-Text Rule.** Lavender is no longer a canvas text color. Use cream for headings on dark; keep lavender for categorical decoration only.

## Typography

**Display Font:** Fredoka (with ui-rounded, 'Segoe UI', sans-serif)
**Body Font:** Nunito (with ui-rounded, 'Segoe UI', sans-serif)

**Character:** Rounded and friendly at display sizes, tight and businesslike at small sizes. Fredoka carries titles, names, and numbers; Nunito carries labels, metadata, and descriptions. The pairing keeps the scrapbook playful without losing dashboard scanability.

### Hierarchy
- **Display** (Fredoka 600, 34px, 1.1): page titles such as "Overview" and "Top Artists"; shrinks to 28px on phones.
- **Headline** (Fredoka 700, 24–30px, 1.2): now-playing title, section titles, and capsule headings.
- **Title** (Fredoka 600, 17px, 1.2): card headings, list-row names, and podium names.
- **Body** (Nunito 700, 14px, 1.5): subtitles, descriptions, and metadata. Keep lines short inside cards.
- **Label** (Nunito 800, 11px, 1.1px tracking, uppercase): eyebrows, status labels, progress times, and counts.

### Named Rules
**The Two-Voice Rule.** Fredoka is for nouns and numbers (titles, names, ranks, counts). Nunito is for verbs and context (labels, subtitles, settings). Do not set long sentences in Fredoka.

## Layout

The app is a fixed left sidebar (232px) beside a centered content column. Dashboard content maxes at 1040px with 40px padding; stats pages max at 920px with 36px/40px padding. A 88px empty gutter is reserved at the right edge so the fixed log-out button never covers content.

The dashboard uses a 12-column bento grid with a 16px gap: the now-playing tile spans 6 columns over 2 rows (min-height 430px), and the artists and tracks lists each span the remaining 6 columns, stacked. At ≤1020px the now tile goes full width and the lists sit side by side; at ≤720px every tile is full width.

The sidebar collapses to a 64px icon rail at ≤720px, hiding labels and the footer. Dashboard top padding rises to 72px on phones so the fixed log-out button clears the header. Stats pages reflow at 680px (podium stacks) and 640px (timeline wraps).

Spacing follows a 4px base: 4, 8, 12, 16, 20, 24, 32, 40.

## Elevation & Depth

Depth is structural, not ambient: every raised surface is a sticker. Cards and buttons use a 2.5px ink border plus a hard, unblurred olive offset shadow. Hover lifts the element up-left by 1–2px and increases the shadow; pressing pushes it down-right and reduces it. There are no blurry drop shadows anywhere except the decorative login dots' small sticker shadow.

### Shadow Vocabulary
- **Sticker 2** (`2px 2px 0 var(--color-shadow)`): selected tabs, small chips, stat cards.
- **Sticker 3** (`3px 3px 0 var(--color-shadow)`): active nav items, icon buttons, badges.
- **Sticker 4** (`4px 4px 0 var(--color-shadow)`): cards, list rows, login CTA, error cards.
- **Sticker 6** (`6px 6px 0 var(--color-shadow)`): login card and the first-place podium card.
- **CTA Hover Ink** (`6px 6px 0 var(--color-ink)`): the one deliberate exception, used by the login CTA on hover.

### Named Rules
**The Hard-Shadow Rule.** Shadows are flat offsets in olive, never blurred, never translucent. If a surface has no offset shadow, it is either pressed, flat, or not a sticker.

**The Lift-On-Hover Rule.** Interactive stickers move up-left and gain shadow on hover; on press they move down-right and lose it. Nothing scales up without a corresponding shadow change.

## Shapes

The form language is rounded paper with a drawn outline. Every card, row, tab, and button has a 2.5px near-black border; icon chips use 2px. Corners range from 8px chips to 20px bento cards and 24px modals, with pills (999px) for CTAs, icon buttons, progress tracks, and badges. Avatars and medals are circles; album art is an 18px rounded square; track rows use 8px thumbnails.

Rotation is a signature: the brand mark sits at -4°, second/third podium cards tilt ±3°, rank badges twist -6° on hover, and the login background dots are individually rotated. Rotation stays small and never affects text legibility.

**The Ink-Outline Rule.** If a surface is raised or interactive, it gets an ink outline. Unbordered elements are typography or separators, nothing else.

## Components

### Buttons
- **Shape:** pill (999px), 2.5px ink border, hard olive shadow.
- **Primary CTA (login):** sage-mint fill with ink text, `14px 30px` padding, Fredoka 600/16px. Hover lifts -2px/-2px and swaps the shadow to a 6px ink offset; active presses to 1px/1px with scale 0.97.
- **Icon button (logout):** fixed top-right (20px/24px), 44px matcha circle with an 18px ink log-out icon, sticker-3. Only the icon shows; the accessible name lives in `aria-label` and `title`.
- **Hover / Focus:** every button lifts on hover and shows a 2.5px ink `focus-visible` ring with 2–3px offset.

### Chips
- **Style:** 28px squares, 8px radius, 2px ink border, olive fill with sand icon/text.
- **Use:** category markers on the Artists/Tracks cards. Not interactive; chips are labels, not filters.

### Cards / Containers
- **Corner Style:** 20px for bento cards and sections; 18px for album art and podium cards; 24px for the login card.
- **Background:** sand (#d9d1bd) with deep-sand rows inside.
- **Shadow Strategy:** sticker-4 by default; sticker-6 for hero/login and first place.
- **Border:** 2.5px near-black on all cards.
- **Internal Padding:** 24px for the now tile and bento cards; 16–20px for list tiles; 28px for stats sections.

### Navigation
- Sidebar items are full-width rows with a 2.5px ink border, 12px radius, and ink-soft text on sand. The active item fills with a dark olive/ink accent and switches to sand text, gaining sticker-3 and a -1px lift.
- Labels are Nunito 700/14px; icons are 20px. On ≤720px the rail shows icons only with `aria-label`/`title` retained.

### Now-Playing Tile (signature)
The bento hero: status dot plus uppercase label, "Updated" timestamp, centered artwork (200px; 120px on phones), title, artist · album, and an ink progress track with a rose fill and tabular time labels. The artwork is centered in both axes with the text directly beneath it.

### List Rows
Stats rows are deep-sand stickers with a circular ink-bordered avatar, a 42px rank badge, and title/subtitle text. Hover lifts the whole row -2px/-2px and scales the avatar 1.05. Dashboard rows are borderless dashed separators inside a single card, with a 20px rank number and 34px thumbnails.

### Podium
Top-three cards on the stats pages: deep-sand stickers, center-aligned, with a circular medal overlapping the top edge. First place is lifted -14px with sticker-6; second and third tilt -3° and 3°. On ≤680px they stack and flatten their rotation.

## Do's and Don'ts

### Do:
- **Do** put content on sand cards and keep the dark canvas for the frame and page title.
- **Do** give every raised surface a 2.5px ink border and a hard olive offset shadow.
- **Do** use rose only for live state, rank accents, and progress.
- **Do** use Fredoka for titles/names/numbers and Nunito for labels/metadata.
- **Do** reserve the 88px right gutter so the fixed log-out icon has an empty column.
- **Do** keep rotations small (≤4°) and flatten them on interaction or small screens.

### Don't:
- **Don't** use blurred, translucent, or colored-other-than-olive drop shadows (login CTA hover ink is the only exception).
- **Don't** set page headings on the dark canvas in lavender; use cream.
- **Don't** fill buttons or large areas with rose.
- **Don't** remove ink outlines from interactive stickers.
- **Don't** mix radii outside the scale (8/12/16/18/20/24/999).
- **Don't** set long prose in Fredoka or use uppercase for anything longer than a short label.
