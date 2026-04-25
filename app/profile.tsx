import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/src/contexts/AuthContext';
import { supabase } from '@/src/lib/supabase';
import { campfireTheme } from '@/src/constants/theme';

type Stats = { posts: number; comments: number; likes: number };

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, profile, signOut, setDisplayName } = useAuth();

  const [stats, setStats] = useState<Stats>({ posts: 0, comments: 0, likes: 0 });
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      const [postsRes, commentsRes, postsForLikesRes] = await Promise.all([
        supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .eq('author_id', user.id),
        supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('author_id', user.id),
        supabase.from('posts').select('id').eq('author_id', user.id),
      ]);

      let likeCount = 0;
      const postIds = (postsForLikesRes.data ?? []).map((p) => p.id);
      if (postIds.length) {
        const { count } = await supabase
          .from('likes')
          .select('*', { count: 'exact', head: true })
          .in('post_id', postIds);
        likeCount = count ?? 0;
      }

      if (active) {
        setStats({
          posts: postsRes.count ?? 0,
          comments: commentsRes.count ?? 0,
          likes: likeCount,
        });
      }
    })();
    return () => {
      active = false;
    };
  }, [user]);

  if (!user || !profile) {
    return (
      <View style={[styles.screen, styles.center]}>
        <Text style={styles.empty}>Sign in to view your profile.</Text>
      </View>
    );
  }

  const name = profile.display_name ?? profile.email?.split('@')[0] ?? 'User';
  const handle = name.replace(/\s/g, '_').toLowerCase();
  const initial = name.slice(0, 1).toUpperCase();

  const startEdit = () => {
    setDraftName(name);
    setEditing(true);
  };

  const saveName = async () => {
    if (!draftName.trim()) {
      setEditing(false);
      return;
    }
    setSaving(true);
    const { error } = await setDisplayName(draftName);
    setSaving(false);
    if (error) {
      Alert.alert('Could not update', error);
      return;
    }
    setEditing(false);
  };

  const confirmSignOut = () => {
    Alert.alert('Sign out?', '', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.back();
        },
      },
    ]);
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable hitSlop={10} onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="close" size={22} color={campfireTheme.colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>{initial}</Text>
          </View>

          {editing ? (
            <View style={styles.editRow}>
              <TextInput
                autoFocus
                maxLength={20}
                onChangeText={setDraftName}
                style={styles.editInput}
                value={draftName}
              />
              <Pressable disabled={saving} onPress={saveName} style={styles.editSave}>
                <Ionicons name="checkmark" size={18} color={campfireTheme.colors.card} />
              </Pressable>
              <Pressable onPress={() => setEditing(false)} style={styles.editCancel}>
                <Ionicons name="close" size={18} color={campfireTheme.colors.mutedInk} />
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={startEdit} style={styles.nameRow}>
              <Text style={styles.name}>{name}</Text>
              <Ionicons
                name="pencil"
                size={12}
                color={campfireTheme.colors.mutedInk}
                style={styles.pencil}
              />
            </Pressable>
          )}

          <Text style={styles.handle}>@{handle}</Text>
          <Text style={styles.email}>{profile.email}</Text>

          {profile.is_admin ? (
            <View style={[styles.badge, styles.badgeAdmin]}>
              <Ionicons name="shield-checkmark" size={12} color={campfireTheme.colors.card} />
              <Text style={styles.badgeAdminText}>Admin</Text>
            </View>
          ) : null}
        </View>

        <Pressable onPress={() => router.push('/pick-school')} style={styles.schoolRow}>
          <View style={styles.schoolLeft}>
            <Ionicons name="school-outline" size={20} color={campfireTheme.colors.ink} />
            <View>
              <Text style={styles.rowLabel}>My school</Text>
              <Text style={styles.rowValue}>{profile.school ?? 'Not set'}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={campfireTheme.colors.mutedInk} />
        </Pressable>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: campfireTheme.colors.lavender }]}>
              <Ionicons name="document-text-outline" size={18} color={campfireTheme.colors.black} />
            </View>
            <Text style={styles.statValue}>{stats.posts}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: campfireTheme.colors.cardMuted }]}>
              <Ionicons
                name="chatbubble-outline"
                size={18}
                color={campfireTheme.colors.emberOrange}
              />
            </View>
            <Text style={styles.statValue}>{stats.comments}</Text>
            <Text style={styles.statLabel}>Comments</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#FFE3CC' }]}>
              <Ionicons name="flame" size={18} color={campfireTheme.colors.emberOrange} />
            </View>
            <Text style={styles.statValue}>{stats.likes}</Text>
            <Text style={styles.statLabel}>Fires</Text>
          </View>
        </View>

        <Pressable onPress={confirmSignOut} style={styles.signOutBtn}>
          <Ionicons name="log-out-outline" size={20} color={campfireTheme.colors.emberRed} />
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: campfireTheme.colors.background },
  center: { alignItems: 'center', justifyContent: 'center' },
  empty: { color: campfireTheme.colors.mutedInk, fontSize: 15 },
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
  content: { padding: 20, gap: 14 },
  profileCard: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
    backgroundColor: campfireTheme.colors.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: campfireTheme.colors.border,
    gap: 6,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: campfireTheme.colors.hotPink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarLetter: {
    fontSize: 36,
    fontWeight: '900',
    color: campfireTheme.colors.card,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: { fontSize: 22, fontWeight: '900', color: campfireTheme.colors.ink },
  pencil: { marginTop: 2 },
  handle: { fontSize: 13, color: campfireTheme.colors.mutedInk },
  email: { fontSize: 12, color: campfireTheme.colors.mutedInk, marginTop: 2 },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    paddingHorizontal: 12,
  },
  editInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: campfireTheme.colors.background,
    borderWidth: 1,
    borderColor: campfireTheme.colors.border,
    fontSize: 16,
    color: campfireTheme.colors.ink,
  },
  editSave: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: campfireTheme.colors.hotPink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editCancel: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: campfireTheme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: campfireTheme.radius.pill,
    marginTop: 6,
  },
  badgeAdmin: { backgroundColor: campfireTheme.colors.lavenderDeep },
  badgeAdminText: {
    fontSize: 11,
    fontWeight: '900',
    color: campfireTheme.colors.card,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  schoolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: campfireTheme.colors.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: campfireTheme.colors.border,
  },
  schoolLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowLabel: { fontSize: 12, color: campfireTheme.colors.mutedInk, fontWeight: '700' },
  rowValue: { fontSize: 15, color: campfireTheme.colors.ink, fontWeight: '800', marginTop: 1 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: campfireTheme.colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: campfireTheme.colors.border,
    gap: 6,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: { fontSize: 20, fontWeight: '900', color: campfireTheme.colors.ink },
  statLabel: { fontSize: 11, fontWeight: '700', color: campfireTheme.colors.mutedInk },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: campfireTheme.colors.card,
    borderRadius: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: campfireTheme.colors.border,
  },
  signOutText: { fontSize: 15, fontWeight: '800', color: campfireTheme.colors.emberRed },
});
