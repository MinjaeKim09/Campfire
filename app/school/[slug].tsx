import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
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

import {
  ALL_CAMPUSES,
  getSchoolBySlug,
  postCategories,
  schoolNotes,
  type PostCategory,
} from '@/src/constants/schools';
import { useAuth } from '@/src/contexts/AuthContext';
import { supabase } from '@/src/lib/supabase';
import { campfireTheme } from '@/src/constants/theme';

type FeedPost = {
  id: string;
  author_id: string;
  title: string;
  body: string;
  category: string;
  visibility: string;
  created_at: string;
  like_count: number;
  comment_count: number;
  liked_by_me: boolean;
};

const formatRelative = (iso: string) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d`;
  return new Date(iso).toLocaleDateString();
};

export default function SchoolCommunityScreen() {
  const { slug } = useLocalSearchParams<{ slug?: string }>();
  const insets = useSafeAreaInsets();
  const school = getSchoolBySlug(slug);
  const { user } = useAuth();

  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<PostCategory | null>(null);

  const loadPosts = useCallback(async () => {
    if (!school) return;
    setLoading(true);

    const { data: postRows, error } = await supabase
      .from('posts')
      .select('id, author_id, title, body, category, visibility, created_at')
      .in('visibility', [school, ALL_CAMPUSES])
      .order('created_at', { ascending: false })
      .limit(100);

    if (error || !postRows) {
      setPosts([]);
      setLoading(false);
      return;
    }

    const ids = postRows.map((p) => p.id);
    const [{ data: likeRows }, { data: commentRows }] = await Promise.all([
      supabase.from('likes').select('post_id, user_id').in('post_id', ids),
      supabase.from('comments').select('post_id').in('post_id', ids),
    ]);

    const likeMap = new Map<string, { count: number; mine: boolean }>();
    (likeRows ?? []).forEach((row) => {
      const cur = likeMap.get(row.post_id) ?? { count: 0, mine: false };
      cur.count += 1;
      if (user && row.user_id === user.id) cur.mine = true;
      likeMap.set(row.post_id, cur);
    });

    const commentMap = new Map<string, number>();
    (commentRows ?? []).forEach((row) => {
      commentMap.set(row.post_id, (commentMap.get(row.post_id) ?? 0) + 1);
    });

    setPosts(
      postRows.map((p) => ({
        ...p,
        like_count: likeMap.get(p.id)?.count ?? 0,
        liked_by_me: likeMap.get(p.id)?.mine ?? false,
        comment_count: commentMap.get(p.id) ?? 0,
      }))
    );
    setLoading(false);
  }, [school, user]);

  useFocusEffect(
    useCallback(() => {
      loadPosts();
    }, [loadPosts])
  );

  const toggleLike = async (post: FeedPost) => {
    if (!user) {
      router.push('/sign-in');
      return;
    }
    if (post.liked_by_me) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? { ...p, liked_by_me: false, like_count: Math.max(0, p.like_count - 1) }
            : p
        )
      );
      await supabase.from('likes').delete().match({ post_id: post.id, user_id: user.id });
    } else {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id ? { ...p, liked_by_me: true, like_count: p.like_count + 1 } : p
        )
      );
      await supabase.from('likes').insert({ post_id: post.id, user_id: user.id });
    }
  };

  if (!school) {
    return (
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + campfireTheme.spacing.screen },
        ]}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back to Schools</Text>
        </Pressable>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>School not found</Text>
          <Text style={styles.emptyCopy}>Choose a school from the Schools tab.</Text>
        </View>
      </ScrollView>
    );
  }

  const filtered = filter ? posts.filter((p) => p.category === filter) : posts;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + campfireTheme.spacing.screen, paddingBottom: 120 },
      ]}
      showsVerticalScrollIndicator={false}>
      <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>Back to Schools</Text>
      </Pressable>

      <View style={styles.hero}>
        <Text style={styles.kicker}>{school} community</Text>
        <Text style={styles.title}>Gather around your school board.</Text>
        <Text style={styles.subtitle}>{schoolNotes[school]}</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.filterRow}>
          <Pressable
            onPress={() => setFilter(null)}
            style={[styles.filterChip, filter === null && styles.filterChipActive]}>
            <Text style={[styles.filterText, filter === null && styles.filterTextActive]}>All</Text>
          </Pressable>
          {postCategories.map((c) => {
            const active = filter === c;
            return (
              <Pressable
                key={c}
                onPress={() => setFilter(active ? null : c)}
                style={[styles.filterChip, active && styles.filterChipActive]}>
                <Text style={[styles.filterText, active && styles.filterTextActive]}>{c}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={campfireTheme.colors.hotPink} />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No posts yet</Text>
          <Text style={styles.emptyCopy}>
            Tap the + button to start the {school} board
            {filter ? ` in ${filter}` : ''}.
          </Text>
        </View>
      ) : (
        <View style={styles.feed}>
          {filtered.map((post) => (
            <Pressable
              key={post.id}
              onPress={() => router.push(`/post/${post.id}`)}
              style={({ pressed }) => [styles.postCard, pressed && { opacity: 0.85 }]}>
              <View style={styles.postMetaRow}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{post.category}</Text>
                </View>
                <Text style={styles.postMeta}>
                  {post.visibility === ALL_CAMPUSES ? 'All campuses' : post.visibility} ·{' '}
                  {formatRelative(post.created_at)}
                </Text>
              </View>
              <Text style={styles.postTitle}>{post.title}</Text>
              <Text style={styles.postBody} numberOfLines={3}>
                {post.body}
              </Text>
              <View style={styles.actionRow}>
                <Pressable
                  hitSlop={8}
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleLike(post);
                  }}
                  style={styles.action}>
                  <Ionicons
                    name={post.liked_by_me ? 'heart' : 'heart-outline'}
                    size={18}
                    color={
                      post.liked_by_me
                        ? campfireTheme.colors.hotPink
                        : campfireTheme.colors.mutedInk
                    }
                  />
                  <Text
                    style={[
                      styles.actionText,
                      post.liked_by_me && { color: campfireTheme.colors.hotPink },
                    ]}>
                    {post.like_count}
                  </Text>
                </Pressable>
                <View style={styles.action}>
                  <Ionicons
                    name="chatbubble-outline"
                    size={17}
                    color={campfireTheme.colors.mutedInk}
                  />
                  <Text style={styles.actionText}>{post.comment_count}</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: campfireTheme.colors.background },
  content: { gap: 18, padding: campfireTheme.spacing.screen },
  backButton: {
    alignSelf: 'flex-start',
    borderRadius: campfireTheme.radius.pill,
    backgroundColor: campfireTheme.colors.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backButtonText: {
    color: campfireTheme.colors.hotPink,
    fontSize: 14,
    fontWeight: '900',
  },
  hero: {
    gap: 14,
    overflow: 'hidden',
    borderRadius: 36,
    backgroundColor: campfireTheme.colors.backgroundDeep,
    padding: 24,
  },
  kicker: {
    alignSelf: 'flex-start',
    borderRadius: campfireTheme.radius.pill,
    backgroundColor: campfireTheme.colors.emberYellow,
    color: campfireTheme.colors.black,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    textTransform: 'uppercase',
    overflow: 'hidden',
  },
  title: {
    color: campfireTheme.colors.card,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  subtitle: { color: '#F7E8FF', fontSize: 15, lineHeight: 22 },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterChip: {
    borderRadius: campfireTheme.radius.pill,
    backgroundColor: campfireTheme.colors.card,
    borderWidth: 1,
    borderColor: campfireTheme.colors.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  filterChipActive: {
    backgroundColor: campfireTheme.colors.hotPink,
    borderColor: campfireTheme.colors.hotPink,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '700',
    color: campfireTheme.colors.ink,
  },
  filterTextActive: { color: campfireTheme.colors.card },
  loadingBox: { paddingVertical: 40, alignItems: 'center' },
  feed: { gap: 12 },
  postCard: {
    backgroundColor: campfireTheme.colors.card,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: campfireTheme.colors.border,
    gap: 8,
  },
  postMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  categoryBadge: {
    borderRadius: campfireTheme.radius.pill,
    backgroundColor: campfireTheme.colors.lavender,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: campfireTheme.colors.black,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  postMeta: {
    fontSize: 12,
    color: campfireTheme.colors.mutedInk,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
  postTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: campfireTheme.colors.ink,
    lineHeight: 22,
  },
  postBody: {
    fontSize: 14,
    lineHeight: 20,
    color: campfireTheme.colors.mutedInk,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    marginTop: 4,
  },
  action: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionText: { fontSize: 13, fontWeight: '700', color: campfireTheme.colors.mutedInk },
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
