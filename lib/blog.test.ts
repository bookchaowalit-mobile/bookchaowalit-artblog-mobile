import { describe, expect, it } from "vitest";
import { excerpt, filterPosts, readingTime, SAMPLE_POSTS, tagCounts, wordCount } from "./blog";

describe("wordCount / readingTime", () => {
  it("counts words across whitespace", () => {
    expect(wordCount("  one two\n three\tfour ")).toBe(4);
    expect(wordCount("")).toBe(0);
  });
  it("rounds up and has a 1-minute floor", () => {
    expect(readingTime("word")).toBe(1);
    expect(readingTime(Array(201).fill("w").join(" "))).toBe(2);
    expect(readingTime(Array(400).fill("w").join(" "), 100)).toBe(4);
    expect(() => readingTime("x", 0)).toThrow(RangeError);
  });
});

describe("excerpt", () => {
  it("keeps short text intact", () => {
    expect(excerpt("Short  text.", 50)).toBe("Short text.");
  });
  it("cuts at a word boundary with an ellipsis", () => {
    const e = excerpt("The quick brown fox jumps over the lazy dog", 20);
    expect(e).toBe("The quick brown fox…");
    expect(e.length).toBeLessThanOrEqual(21);
  });
});

describe("tagCounts", () => {
  it("counts and orders tags", () => {
    expect(tagCounts(SAMPLE_POSTS).slice(0, 2)).toEqual([
      { tag: "color", count: 2 },
      { tag: "drawing", count: 2 },
    ]);
  });
});

describe("filterPosts", () => {
  it("filters by tag newest first", () => {
    expect(filterPosts(SAMPLE_POSTS, { tag: "drawing" }).map((p) => p.id)).toEqual(["p2", "p4"]);
  });
  it("searches title, author and body", () => {
    expect(filterPosts(SAMPLE_POSTS, { query: "ploy" }).map((p) => p.id)).toEqual(["p3"]);
    expect(filterPosts(SAMPLE_POSTS, { query: "pressure" }).map((p) => p.id)).toEqual(["p4"]);
    expect(filterPosts(SAMPLE_POSTS, { query: "nothing-matches" })).toEqual([]);
  });
});

describe("pass 3 edge cases", () => {
  const hasLoneSurrogate = (s: string) => /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/.test(s);
  it("never splits an emoji into a lone surrogate", () => {
    const text = "🎨".repeat(10);
    for (let max = 1; max < 10; max++) {
      const out = excerpt(text, max);
      expect(hasLoneSurrogate(out)).toBe(false);
      expect(Array.from(out.replace("…", ""))).toHaveLength(max);
    }
  });
  it("counts emoji as one character when deciding whether to cut", () => {
    expect(excerpt("🎨🎨🎨", 3)).toBe("🎨🎨🎨");
  });
  it("drops a dangling zero-width joiner at the cut", () => {
    // family emoji: man ZWJ woman — cut right after the joiner
    expect(excerpt("ab \u{1F468}\u200D\u{1F469}", 5)).toBe("ab \u{1F468}…");
  });
});
