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

import { visibilityColor } from '@/src/constants/schools';
import { campfireTheme } from '@/src/constants/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { supabase } from '@/src/lib/supabase';

type CommentRow = {
  id: string;
  post_id: string;
  body: string;
  created_at: string;
};

type ParentPost = {
  id: string;
  title: string;
  category: string;
  visibility: string;
};

type ProfileComment = CommentRow & {
  post: ParentPost | null;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

export default function ProfileCommentsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [comments, setComments] = useState<ProfileComment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadComments = useCallback(async () => {
    if (!user) {
      setComments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data: commentRows } = await supabase
      .from('comments')
      .select('id, post_id, body, created_at')
      .eq('author_id', user.id)
      .order('created_at', { ascending: false });

    if (!commentRows?.length) {
      setComments([]);
      setLoading(false);
      return;
    }

    const postIds = Array.from(new Set(commentRows.map((comment) => comment.post_id)));
    const { data: postRows } = await supabase
      .from('posts')
      .select('id, title, category, visibility')
      .in('id', postIds);

    const postMap = new Map<string, ParentPost>();
    (postRows ?? []).forEach((post) => {
      postMap.set(post.id, post as ParentPost);
    });

    setComments(
      commentRows.map((comment) => ({
        ...comment,
        post: postMap.get(comment.post_id) ?? null,
      }))
    );
    setLoading(false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadComments();
    }, [loadComments])
  );

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable hitSlop={10} onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={24} color={campfireTheme.colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>My Comments</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!user ? (
          <Text style={styles.emptyText}>Sign in to view your comments.</Text>
        ) : loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={campfireTheme.colors.hotPink} />
          </View>
        ) : comments.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No comments yet</Text>
            <Text style={styles.emptyCopy}>Comments you write will show up here.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {comments.map((comment) => {
              const vc = comment.post ? visibilityColor(comment.post.visibility) : null;
              return (
                <Pressable
                  key={comment.id}
                  disabled={!comment.post}
                  onPress={() => comment.post && router.push(`/post/${comment.post.id}`)}
                  style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
                  <View style={styles.commentHeader}>
                    <Ionicons
                      name="chatbubble-outline"
                      size={18}
                      color={campfireTheme.colors.emberOrange}
                    />
                    <Text style={styles.commentDate}>{formatDate(comment.created_at)}</Text>
                  </View>
                  <Text style={styles.commentBody}>{comment.body}</Text>
                  <View style={styles.postContext}>
                    {comment.post && vc ? (
                      <>
                        <View style={[styles.categoryBadge, { backgroundColor: vc.bg }]}>
                          <Text style={[styles.categoryBadgeText, { color: vc.fg }]}>
                            {comment.post.category}
                          </Text>
                        </View>
                        <Text style={styles.postTitle} numberOfLines={1}>
                          {comment.post.title}
                        </Text>
                      </>
                    ) : (
                      <Text style={styles.missingPost}>Original post unavailable</Text>
                    )}
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
    gap: 10,
    borderRadius: 22,
    backgroundColor: campfireTheme.colors.card,
    borderWidth: 1,
    borderColor: campfireTheme.colors.border,
    padding: 16,
  },
  cardPressed: { opacity: 0.85 },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  commentDate: { color: campfireTheme.colors.mutedInk, fontSize: 12, fontWeight: '700' },
  commentBody: { color: campfireTheme.colors.ink, fontSize: 15, lineHeight: 22 },
  postContext: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: campfireTheme.colors.border,
    paddingTop: 10,
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
  postTitle: {
    flex: 1,
    color: campfireTheme.colors.ink,
    fontSize: 14,
    fontWeight: '800',
  },
  missingPost: { color: campfireTheme.colors.mutedInk, fontSize: 13, fontWeight: '700' },
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
