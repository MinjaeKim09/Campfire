import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ALL_CAMPUSES, visibilityColor } from '@/src/constants/schools';
import { useAuth } from '@/src/contexts/AuthContext';
import { supabase } from '@/src/lib/supabase';
import { campfireTheme } from '@/src/constants/theme';

type Post = {
  id: string;
  author_id: string;
  title: string;
  body: string;
  category: string;
  visibility: string;
  created_at: string;
  anonymous: boolean;
};

type Comment = {
  id: string;
  author_id: string;
  body: string;
  created_at: string;
  author_name: string | null;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();
  const isAdmin = !!profile?.is_admin;

  const [post, setPost] = useState<Post | null>(null);
  const [authorName, setAuthorName] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [likeCount, setLikeCount] = useState(0);
  const [likedByMe, setLikedByMe] = useState(false);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [posting, setPosting] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);

    const { data: postRow } = await supabase
      .from('posts')
      .select('id, author_id, title, body, category, visibility, created_at, anonymous')
      .eq('id', id)
      .maybeSingle();

    if (!postRow) {
      setPost(null);
      setLoading(false);
      return;
    }
    setPost(postRow as Post);

    const [{ data: authorRow }, { data: commentRows }, { data: likeRows }] = await Promise.all([
      supabase.from('profiles').select('display_name, email').eq('id', postRow.author_id).maybeSingle(),
      supabase
        .from('comments')
        .select('id, author_id, body, created_at')
        .eq('post_id', id)
        .order('created_at', { ascending: true }),
      supabase.from('likes').select('user_id').eq('post_id', id),
    ]);

    setAuthorName(authorRow?.display_name ?? authorRow?.email ?? null);
    setLikeCount(likeRows?.length ?? 0);
    setLikedByMe(!!user && !!likeRows?.some((r) => r.user_id === user.id));

    if (commentRows && commentRows.length > 0) {
      const authorIds = Array.from(new Set(commentRows.map((c) => c.author_id)));
      const { data: profileRows } = await supabase
        .from('profiles')
        .select('id, display_name, email')
        .in('id', authorIds);
      const nameMap = new Map<string, string>();
      (profileRows ?? []).forEach((p) => {
        nameMap.set(p.id, p.display_name ?? p.email ?? 'Unknown');
      });
      setComments(
        commentRows.map((c) => ({
          ...c,
          author_name: nameMap.get(c.author_id) ?? null,
        }))
      );
    } else {
      setComments([]);
    }

    setLoading(false);
  }, [id, user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const toggleLike = async () => {
    if (!user) {
      router.push('/sign-in');
      return;
    }
    if (!post) return;
    if (likedByMe) {
      setLikedByMe(false);
      setLikeCount((c) => Math.max(0, c - 1));
      await supabase.from('likes').delete().match({ post_id: post.id, user_id: user.id });
    } else {
      setLikedByMe(true);
      setLikeCount((c) => c + 1);
      await supabase.from('likes').insert({ post_id: post.id, user_id: user.id });
    }
  };

  const submitComment = async () => {
    if (!user) {
      router.push('/sign-in');
      return;
    }
    if (!post) return;
    const trimmed = draft.trim();
    if (!trimmed) return;
    setPosting(true);
    const { error } = await supabase.from('comments').insert({
      post_id: post.id,
      author_id: user.id,
      body: trimmed,
    });
    setPosting(false);
    if (error) return;
    setDraft('');
    load();
  };

  const confirmDeletePost = () => {
    if (!post) return;
    Alert.alert('Delete post?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.from('posts').delete().eq('id', post.id);
          if (error) {
            Alert.alert('Could not delete', error.message);
            return;
          }
          router.back();
        },
      },
    ]);
  };

  const confirmDeleteComment = (commentId: string) => {
    Alert.alert('Delete comment?', '', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setComments((prev) => prev.filter((c) => c.id !== commentId));
          const { error } = await supabase.from('comments').delete().eq('id', commentId);
          if (error) {
            Alert.alert('Could not delete', error.message);
            load();
          }
        },
      },
    ]);
  };

  const canDeletePost = !!user && !!post && (user.id === post.author_id || isAdmin);

  if (loading && !post) {
    return (
      <View style={[styles.screen, styles.center]}>
        <ActivityIndicator color={campfireTheme.colors.hotPink} />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={[styles.screen, styles.center]}>
        <Text style={styles.notFound}>Post not found.</Text>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
      style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable hitSlop={10} onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={24} color={campfireTheme.colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {post.category}
        </Text>
        {canDeletePost ? (
          <Pressable hitSlop={10} onPress={confirmDeletePost} style={styles.headerBtn}>
            <Ionicons name="trash-outline" size={22} color={campfireTheme.colors.emberRed} />
          </Pressable>
        ) : (
          <View style={styles.headerBtn} />
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.postBlock}>
          {(() => {
            const vc = visibilityColor(post.visibility);
            return (
              <View style={styles.metaRow}>
                <View style={[styles.categoryBadge, { backgroundColor: vc.bg }]}>
                  <Text style={[styles.categoryBadgeText, { color: vc.fg }]}>
                    {post.category}
                  </Text>
                </View>
                <Text style={styles.metaText}>
                  {post.visibility === ALL_CAMPUSES ? 'All campuses' : post.visibility}
                </Text>
              </View>
            );
          })()}

          <Text style={styles.title}>{post.title}</Text>

          <View style={styles.authorRow}>
            <View style={[styles.avatar, post.anonymous && styles.avatarAnon]}>
              <Ionicons
                name={post.anonymous ? 'person' : 'person-outline'}
                size={post.anonymous ? 20 : 0}
                color={campfireTheme.colors.card}
                style={post.anonymous ? undefined : { display: 'none' }}
              />
              {!post.anonymous ? (
                <Text style={styles.avatarText}>
                  {(authorName ?? '?').slice(0, 1).toUpperCase()}
                </Text>
              ) : null}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.authorName}>
                {post.anonymous ? 'Anonymous' : (authorName ?? 'Unknown')}
              </Text>
              <Text style={styles.dateText}>{formatDate(post.created_at)}</Text>
            </View>
          </View>

          <Text style={styles.body}>{post.body}</Text>

          <Pressable onPress={toggleLike} style={styles.likeBtn}>
            <Ionicons
              name={likedByMe ? 'flame' : 'flame-outline'}
              size={20}
              color={likedByMe ? campfireTheme.colors.emberOrange : campfireTheme.colors.mutedInk}
            />
            <Text
              style={[
                styles.likeText,
                likedByMe && { color: campfireTheme.colors.emberOrange },
              ]}>
              {likeCount} {likeCount === 1 ? 'fire' : 'fires'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.commentsHeader}>
          <Text style={styles.commentsTitle}>
            Comments {comments.length > 0 ? `(${comments.length})` : ''}
          </Text>
        </View>

        {comments.length === 0 ? (
          <Text style={styles.emptyComments}>Be the first to comment.</Text>
        ) : (
          <View style={styles.commentList}>
            {comments.map((c) => {
              const canDelete = !!user && (c.author_id === user.id || isAdmin);
              return (
                <View key={c.id} style={styles.commentRow}>
                  <View style={styles.commentAvatar}>
                    <Text style={styles.commentAvatarText}>
                      {(c.author_name ?? '?').slice(0, 1).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.commentAuthor}>
                      {c.author_name ?? 'Unknown'}{' '}
                      <Text style={styles.commentDate}>· {formatDate(c.created_at)}</Text>
                    </Text>
                    <Text style={styles.commentBody}>{c.body}</Text>
                  </View>
                  {canDelete ? (
                    <Pressable
                      hitSlop={8}
                      onPress={() => confirmDeleteComment(c.id)}
                      style={styles.commentDeleteBtn}>
                      <Ionicons
                        name="trash-outline"
                        size={16}
                        color={campfireTheme.colors.mutedInk}
                      />
                    </Pressable>
                  ) : null}
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TextInput
          editable={!!user}
          onChangeText={setDraft}
          placeholder={user ? 'Write a comment…' : 'Sign in to comment'}
          placeholderTextColor={campfireTheme.colors.mutedInk}
          style={styles.composerInput}
          value={draft}
        />
        <Pressable
          accessibilityRole="button"
          disabled={!draft.trim() || posting}
          onPress={submitComment}
          style={[
            styles.composerBtn,
            (!draft.trim() || posting) && styles.composerBtnDisabled,
          ]}>
          <Ionicons
            name="arrow-up"
            size={20}
            color={campfireTheme.colors.card}
          />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: campfireTheme.colors.background },
  center: { alignItems: 'center', justifyContent: 'center' },
  notFound: { color: campfireTheme.colors.ink, fontSize: 16, marginBottom: 12 },
  backBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: campfireTheme.radius.pill,
    backgroundColor: campfireTheme.colors.card,
  },
  backBtnText: { color: campfireTheme.colors.hotPink, fontWeight: '900' },
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
  headerTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: campfireTheme.colors.ink,
    flex: 1,
    textAlign: 'center',
  },
  content: { padding: 20, paddingBottom: 100, gap: 16 },
  postBlock: {
    gap: 12,
    borderRadius: 22,
    backgroundColor: campfireTheme.colors.card,
    borderWidth: 1,
    borderColor: campfireTheme.colors.border,
    padding: 18,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
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
  metaText: { fontSize: 12, fontWeight: '700', color: campfireTheme.colors.mutedInk },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: campfireTheme.colors.ink,
    lineHeight: 28,
  },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: campfireTheme.colors.hotPink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: campfireTheme.colors.card, fontWeight: '900', fontSize: 14 },
  avatarAnon: { backgroundColor: campfireTheme.colors.mutedInk },
  authorName: { fontSize: 14, fontWeight: '800', color: campfireTheme.colors.ink },
  dateText: { fontSize: 12, color: campfireTheme.colors.mutedInk },
  body: { fontSize: 16, lineHeight: 24, color: campfireTheme.colors.ink, marginTop: 4 },
  likeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: campfireTheme.radius.pill,
    backgroundColor: campfireTheme.colors.background,
  },
  likeText: { fontSize: 13, fontWeight: '800', color: campfireTheme.colors.mutedInk },
  commentsHeader: { paddingHorizontal: 4 },
  commentsTitle: { fontSize: 16, fontWeight: '900', color: campfireTheme.colors.ink },
  emptyComments: {
    paddingVertical: 16,
    paddingHorizontal: 4,
    color: campfireTheme.colors.mutedInk,
    fontSize: 14,
  },
  commentList: { gap: 14 },
  commentRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 4 },
  commentAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: campfireTheme.colors.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentAvatarText: { color: campfireTheme.colors.black, fontWeight: '900', fontSize: 12 },
  commentAuthor: { fontSize: 13, fontWeight: '800', color: campfireTheme.colors.ink },
  commentDate: { fontWeight: '500', color: campfireTheme.colors.mutedInk },
  commentBody: { fontSize: 14, lineHeight: 20, color: campfireTheme.colors.ink, marginTop: 2 },
  commentDeleteBtn: { paddingHorizontal: 6, paddingVertical: 4 },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: campfireTheme.colors.card,
    borderTopWidth: 1,
    borderTopColor: campfireTheme.colors.border,
  },
  composerInput: {
    flex: 1,
    backgroundColor: campfireTheme.colors.background,
    borderRadius: campfireTheme.radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: campfireTheme.colors.ink,
    borderWidth: 1,
    borderColor: campfireTheme.colors.border,
  },
  composerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: campfireTheme.colors.hotPink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  composerBtnDisabled: { backgroundColor: campfireTheme.colors.border },
});
