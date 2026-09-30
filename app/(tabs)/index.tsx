import { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { excerpt, filterPosts, readingTime, SAMPLE_POSTS, tagCounts } from "../../lib/blog";

const TAGS = tagCounts(SAMPLE_POSTS);

export default function BlogScreen() {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  const posts = filterPosts(SAMPLE_POSTS, { query, tag });

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
            <Chip label="All" active={tag === null} onPress={() => setTag(null)} />
            {TAGS.map(({ tag: t, count }) => (
              <Chip key={t} label={`${t} (${count})`} active={tag === t} onPress={() => setTag(tag === t ? null : t)} />
            ))}
          </View>
        </View>
      }
      ListEmptyComponent={<Text style={styles.empty}>No posts found.</Text>}
      renderItem={({ item }) => {
        const expanded = open === item.id;
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
          </Pressable>
        );
      }}
    />
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  filters: { padding: 16, gap: 10 },
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
