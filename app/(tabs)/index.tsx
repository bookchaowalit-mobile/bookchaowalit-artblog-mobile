import { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import {
  bookmarkedPosts,
  excerpt,
  filterPosts,
  readingTime,
  SAMPLE_POSTS,
  tagCounts,
  toggleBookmark,
} from "../../lib/blog";
import { isStringArray, valueCodec } from "../../lib/persist";
import { usePersistentState } from "../../lib/usePersistentState";

const TAGS = tagCounts(SAMPLE_POSTS);
const idsCodec = valueCodec(isStringArray);

export default function BlogScreen() {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = usePersistentState<string[]>("artblog.bookmarks.v1", [], idsCodec);
  const [savedOnly, setSavedOnly] = useState(false);

  const pool = savedOnly ? bookmarkedPosts(SAMPLE_POSTS, bookmarks) : SAMPLE_POSTS;
  const posts = filterPosts(pool, { query, tag });

  return (
    <FlatList
      style={styles.container}
      data={posts}
      keyExtractor={(p) => p.id}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View style={styles.filters}>
          <TextInput
            style={styles.input}
            placeholder="Search posts"
            value={query}
            onChangeText={setQuery}
            accessibilityLabel="Search posts"
          />
          <View style={styles.chips}>
            <Chip
              label={`★ Bookmarked (${bookmarks.length})`}
              a11yLabel={`Show bookmarked posts only, ${bookmarks.length} bookmarked`}
              active={savedOnly}
              onPress={() => setSavedOnly(!savedOnly)}
            />
            <Chip label="All" a11yLabel="All tags" active={tag === null} onPress={() => setTag(null)} />
            {TAGS.map(({ tag: t, count }) => (
              <Chip
                key={t}
                label={`${t} (${count})`}
                a11yLabel={`Tag ${t}, ${count} post${count === 1 ? "" : "s"}`}
                active={tag === t}
                onPress={() => setTag(tag === t ? null : t)}
              />
            ))}
          </View>
        </View>
      }
      ListEmptyComponent={
        <Text style={styles.empty}>{savedOnly && bookmarks.length === 0 ? "No bookmarks yet." : "No posts found."}</Text>
      }
      renderItem={({ item }) => {
        const expanded = open === item.id;
        const saved = bookmarks.includes(item.id);
        return (
          <Pressable
            style={styles.card}
            onPress={() => setOpen(expanded ? null : item.id)}
            accessibilityRole="button"
            accessibilityState={{ expanded }}
            accessibilityHint={expanded ? "Collapses the post" : "Reads the full post"}
          >
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.meta}>
              {item.author} · {item.publishedAt} · {readingTime(item.body)} min read
            </Text>
            <Text style={styles.body}>{expanded ? item.body : excerpt(item.body, 140)}</Text>
            <Text style={styles.tags}>{item.tags.map((t) => `#${t}`).join("  ")}</Text>
            <Pressable
              onPress={() => setBookmarks((ids) => toggleBookmark(ids, item.id))}
              style={styles.bookmark}
              accessibilityRole="button"
              accessibilityLabel={saved ? `Remove bookmark for ${item.title}` : `Bookmark ${item.title}`}
              accessibilityState={{ selected: saved }}
            >
              <Text style={styles.bookmarkText}>{saved ? "★ Bookmarked" : "☆ Bookmark"}</Text>
            </Pressable>
          </Pressable>
        );
      }}
    />
  );
}

function Chip({
  label,
  a11yLabel,
  active,
  onPress,
}: {
  label: string;
  a11yLabel?: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel ?? label}
      accessibilityState={{ selected: active }}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  filters: { padding: 16, gap: 10 },
  bookmark: { alignSelf: "flex-start", marginTop: 8, paddingVertical: 4 },
  bookmarkText: { color: "#1F5FA8", fontWeight: "600" },

  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, backgroundColor: "#E3ECF7" },
  chipActive: { backgroundColor: "#4A90D9" },
  chipText: { color: "#2A5A8C", fontWeight: "500" },
  chipTextActive: { color: "#fff" },
  empty: { textAlign: "center", color: "#777", marginTop: 32 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginHorizontal: 16, marginBottom: 12, gap: 6, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: "700", color: "#333" },
  meta: { fontSize: 12, color: "#888" },
  body: { fontSize: 15, color: "#444", lineHeight: 22 },
  tags: { fontSize: 13, color: "#4A90D9" },
});
