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

import {
  ALL_CAMPUSES,
  postCategories,
  visibilityColor,
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

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user, profile, signOut } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<PostCategory | null>(null);

  const mySchool = profile?.school ?? null;

  const loadPosts = useCallback(async () => {
    setLoading(true);
    const targetVisibility = mySchool ?? ALL_CAMPUSES;

    const { data: postRows } = await supabase
      .from('posts')
      .select('id, author_id, title, body, category, visibility, created_at')
      .eq('visibility', targetVisibility)
      .order('created_at', { ascending: false })
      .limit(100);

    if (!postRows) {
      setPosts([]);
      setLoading(false);
      return;
    }

    const ids = postRows.map((p) => p.id);
    const [{ data: likeRows }, { data: commentRows }] = await Promise.all([
      ids.length
        ? supabase.from('likes').select('post_id, user_id').in('post_id', ids)
        : Promise.resolve({ data: [] as { post_id: string; user_id: string }[] }),
      ids.length
        ? supabase.from('comments').select('post_id').in('post_id', ids)
        : Promise.resolve({ data: [] as { post_id: string }[] }),
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
  }, [mySchool, user]);

  useFocusEffect(
    useCallback(() => {
      loadPosts();
    }, [loadPosts])
  );

  const visiblePosts = filter ? posts.filter((p) => p.category === filter) : posts;

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

  if (!user) {
    return (
      <View
        style={[
          styles.screen,
          styles.center,
          { paddingTop: insets.top + campfireTheme.spacing.screen },
        ]}>
        <Text style={styles.welcomeKicker}>Campfire</Text>
        <Text style={styles.welcomeTitle}>Sign in to see your feed.</Text>
        <Text style={styles.welcomeCopy}>
          Posts from your school and all campuses gather here.
        </Text>
        <Pressable onPress={() => router.push('/sign-in')} style={styles.signInBtn}>
          <Text style={styles.signInText}>Sign in</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 12, paddingBottom: 120 },
      ]}
      showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <Text style={styles.brand}>Campfire</Text>
        <View style={styles.headerActions}>
          <Pressable
            hitSlop={8}
            onPress={() => router.push('/profile')}
            style={styles.iconBtn}>
            <Ionicons name="person-circle-outline" size={24} color={campfireTheme.colors.ink} />
          </Pressable>
          <Pressable hitSlop={8} onPress={signOut} style={styles.iconBtn}>
            <Ionicons name="log-out-outline" size={20} color={campfireTheme.colors.mutedInk} />
          </Pressable>
        </View>
      </View>

      {(() => {
        const c = visibilityColor(mySchool ?? ALL_CAMPUSES);
        return (
          <Pressable
            onPress={() => router.push('/pick-school')}
            style={[styles.schoolPill, { backgroundColor: c.bg }]}>
            <Ionicons name="school-outline" size={16} color={c.fg} />
            <Text style={[styles.schoolPillText, { color: c.fg }]}>
              {mySchool ?? 'All campuses'}
            </Text>
            <Ionicons name="chevron-down" size={14} color={c.fg} />
          </Pressable>
        );
      })()}

      <Text style={styles.feedKicker}>
        {mySchool ? `${mySchool} only` : 'All campuses only'}
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.filterRow}>
          {postCategories.map((c) => {
            const isAll = c === 'All';
            const active = isAll ? filter === null : filter === c;
            return (
              <Pressable
                key={c}
                onPress={() => setFilter(isAll ? null : active ? null : c)}
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
      ) : visiblePosts.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No posts yet</Text>
          <Text style={styles.emptyCopy}>
            {filter
              ? `No ${filter} posts in this feed yet.`
              : 'Tap the + button to start the conversation.'}
          </Text>
        </View>
      ) : (
        <View style={styles.feed}>
          {visiblePosts.map((post) => {
            const vc = visibilityColor(post.visibility);
            return (
            <Pressable
              key={post.id}
              onPress={() => router.push(`/post/${post.id}`)}
              style={({ pressed }) => [
                styles.postCard,
                { borderLeftWidth: 4, borderLeftColor: vc.bg },
                pressed && { opacity: 0.85 },
              ]}>
              <View style={styles.postMetaRow}>
                <View style={[styles.categoryBadge, { backgroundColor: vc.bg }]}>
                  <Text style={[styles.categoryBadgeText, { color: vc.fg }]}>{post.category}</Text>
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
                    name={post.liked_by_me ? 'flame' : 'flame-outline'}
                    size={18}
                    color={
                      post.liked_by_me
                        ? campfireTheme.colors.emberOrange
                        : campfireTheme.colors.mutedInk
                    }
                  />
                  <Text
                    style={[
                      styles.actionText,
                      post.liked_by_me && { color: campfireTheme.colors.emberOrange },
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
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: campfireTheme.colors.background },
  content: { gap: 14, paddingHorizontal: campfireTheme.spacing.screen },
  center: { alignItems: 'center', justifyContent: 'center', flex: 1, gap: 10, paddingHorizontal: 32 },
  welcomeKicker: {
    borderRadius: campfireTheme.radius.pill,
    backgroundColor: campfireTheme.colors.lavender,
    color: campfireTheme.colors.black,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    textTransform: 'uppercase',
    overflow: 'hidden',
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: campfireTheme.colors.ink,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  welcomeCopy: {
    fontSize: 15,
    color: campfireTheme.colors.mutedInk,
    textAlign: 'center',
    lineHeight: 22,
  },
  signInBtn: {
    marginTop: 12,
    backgroundColor: campfireTheme.colors.hotPink,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: campfireTheme.radius.pill,
  },
  signInText: { color: campfireTheme.colors.card, fontWeight: '900', fontSize: 15 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  brand: {
    fontFamily: 'BagelFatOne_400Regular',
    fontSize: 32,
    color: '#F36907',
    letterSpacing: -0.5,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  schoolPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: campfireTheme.colors.lavender,
    borderRadius: campfireTheme.radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  schoolPillText: {
    fontSize: 14,
    fontWeight: '900',
    color: campfireTheme.colors.black,
  },
  feedKicker: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: campfireTheme.colors.mutedInk,
    marginTop: 4,
  },
  filterRow: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
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
  filterText: { fontSize: 13, fontWeight: '700', color: campfireTheme.colors.ink },
  filterTextActive: { color: campfireTheme.colors.card },
  loadingBox: { paddingVertical: 60, alignItems: 'center' },
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
  postBody: { fontSize: 14, lineHeight: 20, color: campfireTheme.colors.mutedInk },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 18, marginTop: 4 },
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
