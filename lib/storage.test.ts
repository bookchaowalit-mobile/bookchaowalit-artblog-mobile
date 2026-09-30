import { describe, expect, it } from "vitest";
import { bookmarkedPosts, SAMPLE_POSTS, toggleBookmark } from "./blog";
import { encodeEnvelope, isStringArray, valueCodec } from "./persist";

describe("bookmarks", () => {
  const [a, b] = SAMPLE_POSTS;

  it("toggles and keeps newest bookmark first", () => {
    const ids = toggleBookmark(toggleBookmark([], a.id), b.id);
    expect(ids).toEqual([b.id, a.id]);
    expect(toggleBookmark(ids, b.id)).toEqual([a.id]);
  });

  it("resolves bookmarked posts in order and skips unknown ids", () => {
    expect(bookmarkedPosts(SAMPLE_POSTS, [b.id, "gone", a.id]).map((p) => p.id)).toEqual([b.id, a.id]);
  });

  it("round-trips through storage and rejects malformed data", () => {
    const codec = valueCodec(isStringArray);
    expect(codec.decode(codec.encode([a.id]))).toEqual([a.id]);
    expect(codec.decode(encodeEnvelope("x"))).toBeUndefined();
  });
});
