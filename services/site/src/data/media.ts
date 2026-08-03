/**
 * MEDIA INVENTORY — the single file to edit once the images are chosen.
 *
 * Every photograph on the site is referenced from this file, never from the
 * markup. When you have the final medias dataset, come here and fill in the
 * `src` / `src2x` of each entry (`null` keeps the placeholder panel), plus the
 * localized human copy if you want it shown as-is. Nothing else changes.
 *
 * Image pipeline:
 *   - `src`     : 800px-wide asset, e.g. "/photos/de-ingestion-800.webp".
 *   - `src2x`   : 1600px-wide asset, served as the retina `2x` srcset candidate.
 *   - `video`   : an .mp4 / .webm path. When set it WINS over `src` and plays
 *                 muted, looped and inline as a backdrop; `poster` (or `src`) is
 *                 the still shown before the first frame decodes and on
 *                 `prefers-reduced-motion`. A backdrop video is decoration, so
 *                 `MediaBackdrop` only downloads it on wide viewports and never
 *                 under `save-data` — always ship a `poster`, it is what phones
 *                 and metered connections actually get.
 *                 Keep the MASTER file out of `public/` (it would ship): put it
 *                 in `services/site/media-src/` and commit the web derivative:
 *                   ffmpeg -i media-src/de-hero-source.mp4 -an \
 *                     -vf "scale=1280:-2,fps=24" -c:v libx264 -crf 30 \
 *                     -preset slow -pix_fmt yuv420p -movflags +faststart \
 *                     public/video/de-hero-1280.mp4
 *                   ffmpeg -ss 1 -i media-src/de-hero-source.mp4 -frames:v 1 \
 *                     -vf scale=1280:-2 f.png
 *                   cwebp -q 74 f.png -o public/video/de-hero-poster-1280.webp
 *   - `ratio`   : CSS aspect ratio of the frame ("4/3", "3/4", "16/9"…). Keep it
 *                 stable between the placeholder and the final image so the
 *                 layout does not jump when the asset lands.
 *   - `corner`  : which corner the photo's chamfer is cut from (FramedPhoto).
 *
 * The `label` / `alt` / `placeholderTitle` / `note` fields are localized human
 * copy (French-first, English mirror) and can be rewritten freely. `note` is an
 * editorial brief shown on the placeholder panel so you remember what the slot
 * is for.
 */

import type { Locale } from "@i18n";

export type MediaCorner = "tl" | "tr" | "bl" | "br";

export type MediaItem = {
  /** Stable id; used by organisms to pick the media for a slot. */
  slug: string;
  /** 800px-wide asset. `null` renders the placeholder panel instead. */
  src: string | null;
  /** 1600px-wide asset for the retina `2x` srcset candidate. */
  src2x?: string;
  /** Video file for a moving backdrop. Wins over `src` when both are set. */
  video?: string | null;
  /** Still frame for the video (falls back to `src`). */
  poster?: string | null;
  corner: MediaCorner;
  /** CSS aspect-ratio for the frame, e.g. "4/3", "3/4", "16/9". */
  ratio: string;
  /** Real alt text, or "" when the photo is purely decorative. */
  alt: string;
  /** One-word thematic label revealed on hover once the photo is live. */
  label: string;
  /** Mono enum shown on the placeholder panel. */
  placeholderTitle: string;
  /** Editorial brief for the editor, shown on the placeholder panel. */
  note: string;
};

const mediaFr: MediaItem[] = [
  {
    slug: "de-hero",
    /* Trail-running footage: the pace the copy talks about. `src` stays null —
       the poster is the still, and it is also all a phone downloads. */
    src: null,
    video: "/video/de-hero-1280.mp4",
    poster: "/video/de-hero-poster-1280.webp",
    corner: "br",
    ratio: "16/9",
    alt: "",
    label: "Données",
    placeholderTitle: "Vidéo · Hero ingénierie de données",
    note: "Plan large en boucle (mp4/webm, muet) ou photo 1600px : équipe au travail, salle machine, écrans de pipeline. Le texte du hero se pose par-dessus, donc prévoir une image sombre ou peu contrastée au centre.",
  },
  {
    slug: "de-overview-a",
    /* Stock, in place of the shoot: a Spark job's monitoring screen. Native
       1275×720, so `ratio` follows the file — cropping a dashboard hides the
       part that makes it readable. */
    src: "/photos/de-overview-spark-800.webp",
    src2x: "/photos/de-overview-spark-1275.webp",
    corner: "br",
    ratio: "16/9",
    alt: "Écran de supervision d'un job Spark : étapes, durées et volumes traités",
    label: "Pipelines",
    placeholderTitle: "Photo · Pipelines",
    note: "Shoot editorial : analyste ou ingénieure au travail sur un flux de données. Vue atelier, pas de pose.",
  },
  {
    slug: "de-overview-b",
    /* Stock: a whiteboard mid-design session. Native 966×684 ≈ 7/5. */
    src: "/photos/de-overview-whiteboard-800.webp",
    src2x: "/photos/de-overview-whiteboard-966.webp",
    corner: "tl",
    ratio: "7/5",
    alt: "Tableau blanc couvert d'un schéma de données en cours de discussion",
    label: "Cadrage",
    placeholderTitle: "Photo · Cadrage",
    note: "Shoot : deux ingénieurs devant un schéma de données, discussion sur un contrat.",
  },
  {
    slug: "de-team-1",
    src: null,
    corner: "br",
    ratio: "3/4",
    alt: "Membre de l'équipe Computeflux pendant une revue de pipeline",
    label: "Cadrage",
    placeholderTitle: "Photo · Cadrage",
    note: "Portrait d'équipe au travail : revue d'un pipeline, notes sur le tableau blanc.",
  },
  {
    slug: "de-team-2",
    src: null,
    corner: "tl",
    ratio: "3/4",
    alt: "Analyse expliquant une requête à l'écran",
    label: "Requêtes",
    placeholderTitle: "Photo · Requêtes",
    note: "Portrait : analyste expliquant une requête devant un écran de suivi.",
  },
  {
    slug: "de-team-3",
    src: null,
    corner: "br",
    ratio: "3/4",
    alt: "Ingénieur Computeflux validant une livraison en production",
    label: "Livraison",
    placeholderTitle: "Photo · Livraison",
    note: "Portrait : ingénieur validant une montée en production, vue ordinateur ouvert.",
  },
];

const mediaEn: MediaItem[] = [
  {
    slug: "de-hero",
    src: null,
    video: "/video/de-hero-1280.mp4",
    poster: "/video/de-hero-poster-1280.webp",
    corner: "br",
    ratio: "16/9",
    alt: "",
    label: "Data",
    placeholderTitle: "Video · Data engineering hero",
    note: "Looping wide shot (mp4/webm, muted) or a 1600px still: team at work, machine room, pipeline screens. The hero copy sits on top, so pick footage that stays dark or low-contrast in the centre.",
  },
  {
    slug: "de-overview-a",
    src: "/photos/de-overview-spark-800.webp",
    src2x: "/photos/de-overview-spark-1275.webp",
    corner: "br",
    ratio: "16/9",
    alt: "Spark job monitoring screen: stages, durations and processed volumes",
    label: "Pipelines",
    placeholderTitle: "Photo · Pipelines",
    note: "Editorial shot: an analyst or engineer at work on a data flow. Workshop view, not a pose.",
  },
  {
    slug: "de-overview-b",
    src: "/photos/de-overview-whiteboard-800.webp",
    src2x: "/photos/de-overview-whiteboard-966.webp",
    corner: "tl",
    ratio: "7/5",
    alt: "Whiteboard covered with a data schema under discussion",
    label: "Scoping",
    placeholderTitle: "Photo · Scoping",
    note: "Shot: two engineers in front of a data schema, reviewing a contract.",
  },
  {
    slug: "de-team-1",
    src: null,
    corner: "br",
    ratio: "3/4",
    alt: "Computeflux team member during a pipeline review",
    label: "Scoping",
    placeholderTitle: "Photo · Scoping",
    note: "Team portrait at work: reviewing a pipeline, notes on the whiteboard.",
  },
  {
    slug: "de-team-2",
    src: null,
    corner: "tl",
    ratio: "3/4",
    alt: "Analyst explaining a query on screen",
    label: "Queries",
    placeholderTitle: "Photo · Queries",
    note: "Portrait: analyst explaining a query in front of a monitoring screen.",
  },
  {
    slug: "de-team-3",
    src: null,
    corner: "br",
    ratio: "3/4",
    alt: "Computeflux engineer validating a production rollout",
    label: "Shipping",
    placeholderTitle: "Photo · Shipping",
    note: "Portrait: engineer validating a production rollout, laptop open.",
  },
];

const byLocale: Record<Locale, MediaItem[]> = {
  fr: mediaFr,
  en: mediaEn,
};

/** Badge shown on every slot still waiting for its asset. */
const pendingByLocale: Record<Locale, string> = {
  fr: "Médias à venir",
  en: "Media coming soon",
};

/** Media for a locale (falls back to French, the reference locale). */
export function getMedia(locale: Locale): MediaItem[] {
  return byLocale[locale] ?? mediaFr;
}

/** A single media entry by slug for a locale. */
export function getMediaItem(locale: Locale, slug: string): MediaItem | undefined {
  return getMedia(locale).find((m) => m.slug === slug);
}

/** Localized "media pending" badge, so components stay locale-agnostic. */
export function getMediaPending(locale: Locale): string {
  return pendingByLocale[locale] ?? pendingByLocale.fr;
}
