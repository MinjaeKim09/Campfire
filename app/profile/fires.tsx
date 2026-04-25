import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ALL_CAMPUSES, visibilityColor } from '@/src/constants/schools';
import { campfireTheme } from '@/src/constants/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { supabase } from '@/src/lib/supabase';

type FirePost = {
  id: string;
  title: string;
  body: string;
  category: string;
  visibility: string;
  created_at: string;
  fire_count: number;
};

const formatRelative = (iso: string) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d`;
  return new Date(iso).toLocaleDateString();
};

export default function ProfileFiresScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [posts, setPosts] = useState<FirePost[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFires = useCallback(async () => {
    if (!user) {
      setPosts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data: postRows } = await supabase
      .from('posts')
      .select('id, title, body, category, visibility, created_at')
      .eq('author_id', user.id)
      .order('created_at', { ascending: false });

    if (!postRows?.length) {
      setPosts([]);
      setLoading(false);
      return;
    }

    const ids = postRows.map((post) => post.id);
    const { data: likeRows } = await supabase.from('likes').select('post_id').in('post_id', ids);
    const fireMap = new Map<string, number>();
    (likeRows ?? []).forEach((row) => {
      fireMap.set(row.post_id, (fireMap.get(row.post_id) ?? 0) + 1);
    });

    setPosts(
      postRows
        .map((post) => ({
          ...post,
          fire_count: fireMap.get(post.id) ?? 0,
        }))
        .filter((post) => post.fire_count > 0)
        .sort((a, b) => b.fire_count - a.fire_count || b.created_at.localeCompare(a.created_at))
    );
    setLoading(false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadFires();
    }, [loadFires])
  );

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable hitSlop={10} onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={24} color={campfireTheme.colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>My Fires</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!user ? (
          <Text style={styles.emptyText}>Sign in to view your fires.</Text>
        ) : loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={campfireTheme.colors.hotPink} />
          </View>
        ) : posts.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No fires yet</Text>
            <Text style={styles.emptyCopy}>Fires your posts receive will show up here.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {posts.map((post) => {
              const vc = visibilityColor(post.visibility);
              return (
                <Pressable
                  key={post.id}
                  onPress={() => router.push(`/post/${post.id}`)}
                  style={({ pressed }) => [
                    styles.card,
                    { borderLeftColor: campfireTheme.colors.emberOrange },
                    pressed && styles.cardPressed,
                  ]}>
                  <View style={styles.metaRow}>
                    <View style={[styles.categoryBadge, { backgroundColor: vc.bg }]}>
                      <Text style={[styles.categoryBadgeText, { color: vc.fg }]}>
                        {post.category}
                      </Text>
                    </View>
                    <Text style={styles.metaText}>
                      {post.visibility === ALL_CAMPUSES ? 'All campuses' : post.visibility} ·{' '}
                      {formatRelative(post.created_at)}
                    </Text>
                  </View>
                  <Text style={styles.title}>{post.title}</Text>
                  <Text style={styles.body} numberOfLines={2}>
                    {post.body}
                  </Text>
                  <View style={styles.fireRow}>
                    <View style={styles.fireBadge}>
                      <Ionicons name="flame" size={18} color={campfireTheme.colors.emberOrange} />
                      <Text style={styles.fireText}>
                        {post.fire_count} {post.fire_count === 1 ? 'fire' : 'fires'}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={campfireTheme.colors.mutedInk}
                    />
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: campfireTheme.colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: campfireTheme.colors.border,
  },
  headerBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '900', color: campfireTheme.colors.ink },
  content: { padding: 20, paddingBottom: 40 },
  loadingBox: { paddingVertical: 60, alignItems: 'center' },
  list: { gap: 12 },
  card: {
    gap: 8,
    borderRadius: 22,
    backgroundColor: campfireTheme.colors.card,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderColor: campfireTheme.colors.border,
    padding: 16,
  },
  cardPressed: { opacity: 0.85 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  categoryBadge: {
    borderRadius: campfireTheme.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  metaText: {
    flexShrink: 1,
    color: campfireTheme.colors.mutedInk,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
  title: { color: campfireTheme.colors.ink, fontSize: 17, fontWeight: '900', lineHeight: 22 },
  body: { color: campfireTheme.colors.mutedInk, fontSize: 14, lineHeight: 20 },
  fireRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  fireBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: campfireTheme.radius.pill,
    backgroundColor: campfireTheme.colors.cardMuted,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  fireText: { color: campfireTheme.colors.emberOrange, fontSize: 13, fontWeight: '900' },
  emptyText: { color: campfireTheme.colors.mutedInk, fontSize: 15, textAlign: 'center' },
  emptyCard: {
    gap: 8,
    borderRadius: campfireTheme.radius.card,
    backgroundColor: campfireTheme.colors.card,
    padding: 22,
    borderWidth: 1,
    borderColor: campfireTheme.colors.border,
  },
  emptyTitle: { color: campfireTheme.colors.ink, fontSize: 20, fontWeight: '900' },
  emptyCopy: { color: campfireTheme.colors.mutedInk, fontSize: 14, lineHeight: 20 },
});
