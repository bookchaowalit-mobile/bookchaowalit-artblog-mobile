/** Pure logic for the art blog: reading time, excerpts, tag filtering and search. */

export type Post = {
  id: string;
  title: string;
  author: string;
  publishedAt: string; // ISO date
  tags: string[];
  body: string;
};

export function wordCount(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length;
}

/** Minutes to read at `wpm` words per minute, never less than 1. */
export function readingTime(text: string, wpm = 200): number {
  if (wpm <= 0) throw new RangeError("wpm must be positive");
  return Math.max(1, Math.ceil(wordCount(text) / wpm));
}

/**
 * Cut text at a word boundary to at most `max` characters, adding an ellipsis
 * when cut. Counts code points, not UTF-16 units, so an emoji is never split
 * into a lone surrogate (which renders as "\uFFFD"), and a dangling
 * zero-width joiner or variation selector is dropped with it.
 */
export function excerpt(text: string, max = 120): string {
  const clean = text.replace(/\s+/g, " ").trim();
  const chars = Array.from(clean);
  if (chars.length <= max) return clean;
  const cut = chars.slice(0, max).join("");
  const lastSpace = cut.lastIndexOf(" ");
  const head = lastSpace > cut.length * 0.5 ? cut.slice(0, lastSpace) : cut;
  return `${head.replace(/[\s.,;:!?\u200D\uFE0F-]+$/u, "")}…`;
}

export function tagCounts(posts: Post[]): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const p of posts) for (const t of p.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function filterPosts(posts: Post[], opts: { query?: string; tag?: string | null }): Post[] {
  const q = (opts.query ?? "").trim().toLowerCase();
  return posts
    .filter((p) => !opts.tag || p.tags.includes(opts.tag))
    .filter((p) => !q || [p.title, p.author, p.body].some((s) => s.toLowerCase().includes(q)))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export const SAMPLE_POSTS: Post[] = [
  {
    id: "p1",
    title: "Mixing Muted Greens in Gouache",
    author: "Chaowalit",
    publishedAt: "2025-06-02",
    tags: ["gouache", "color"],
    body:
      "Muted greens are the backbone of landscape painting. Start with a warm yellow and a cool blue, then knock the saturation down with a touch of the complementary red. Keep a swatch card next to your palette so you can compare values as the paint dries, because gouache shifts noticeably between wet and dry. Layer thinly, let each pass dry, and reserve your most saturated green for the focal point.",
  },
  {
    id: "p2",
    title: "Five-Minute Gesture Drawing Routine",
    author: "Chaowalit",
    publishedAt: "2025-05-20",
    tags: ["drawing", "practice"],
    body:
      "Set a timer and draw ten thirty-second poses, then five one-minute poses. Focus on the line of action before any contour. The goal is rhythm, not accuracy, so resist the eraser entirely. Do this every morning for a month and compare the first and last pages.",
  },
  {
    id: "p3",
    title: "Building a Limited Palette",
    author: "Guest: Ploy",
    publishedAt: "2025-04-11",
    tags: ["color", "watercolor"],
    body:
      "A limited palette forces harmony. Pick one warm and one cool of each primary, add a neutral like burnt sienna, and paint a full study using only those. You will learn more about mixing in a week than in a year of reaching for tube colors.",
  },
  {
    id: "p4",
    title: "Digital Brushes That Feel Like Ink",
    author: "Chaowalit",
    publishedAt: "2025-03-08",
    tags: ["digital", "drawing"],
    body:
      "Pressure curves matter more than the brush texture. Soften the start of the curve so light strokes stay thin, add a little stabilization, and turn off opacity jitter for clean inking.",
  },
];

/** Adds or removes a post id from the bookmark list (newest bookmark first). */
export function toggleBookmark(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((x) => x !== id) : [id, ...ids];
}

/** Keeps only posts that are bookmarked, in bookmark order; unknown ids are ignored. */
export function bookmarkedPosts(posts: Post[], ids: string[]): Post[] {
  const byId = new Map(posts.map((p) => [p.id, p]));
  return ids.map((id) => byId.get(id)).filter((p): p is Post => p !== undefined);
}
