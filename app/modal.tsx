import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
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

import { useAuth } from '@/src/contexts/AuthContext';
import {
  ALL_CAMPUSES,
  postCategories,
  schoolColors,
  type PostCategory,
  type School,
  type Visibility,
} from '@/src/constants/schools';
import { campfireTheme } from '@/src/constants/theme';
import { supabase } from '@/src/lib/supabase';

export default function PostComposerModal() {
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();
  const mySchool = profile?.school ?? null;
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<PostCategory | null>(null);
  const [visibility, setVisibility] = useState<Visibility>(ALL_CAMPUSES);
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canPost =
    title.trim().length > 0 &&
    body.trim().length > 0 &&
    category !== null &&
    !submitting &&
    !!user;

  const handlePost = async () => {
    if (!canPost || !user || !category) return;
    setSubmitting(true);
    const { error } = await supabase.from('posts').insert({
      author_id: user.id,
      title: title.trim(),
      body: body.trim(),
      category,
      visibility,
      anonymous,
    });
    setSubmitting(false);
    if (error) {
      Alert.alert('Could not post', error.message);
      return;
    }
    Alert.alert('Posted', `${category} • ${visibility}`, [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          accessibilityRole="button"
          hitSlop={10}
          onPress={() => router.back()}
          style={styles.headerBtn}>
          <Ionicons name="close" size={22} color={campfireTheme.colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>New post</Text>
        <Pressable
          accessibilityRole="button"
          disabled={!canPost}
          onPress={handlePost}
          style={[styles.postBtn, !canPost && styles.postBtnDisabled]}>
          <Text style={styles.postBtnText}>{submitting ? 'Posting…' : 'Post'}</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <TextInput
          maxLength={120}
          onChangeText={setTitle}
          placeholder="Title"
          placeholderTextColor={campfireTheme.colors.mutedInk}
          style={styles.titleInput}
          value={title}
        />

        <TextInput
          multiline
          onChangeText={setBody}
          placeholder="Share something with your campus…"
          placeholderTextColor={campfireTheme.colors.mutedInk}
          style={styles.bodyInput}
          textAlignVertical="top"
          value={body}
        />

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Category</Text>
          <View style={styles.chipRow}>
            {postCategories.map((c) => {
              const selected = category === c;
              return (
                <Pressable
                  accessibilityRole="button"
                  key={c}
                  onPress={() => setCategory(selected ? null : c)}
                  style={[styles.chip, selected && styles.chipSelected]}>
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{c}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Visible to</Text>
          <View style={styles.chipRow}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setVisibility(ALL_CAMPUSES)}
              style={[
                styles.chip,
                visibility === ALL_CAMPUSES && styles.visibilityChipSelected,
              ]}>
              <Text
                style={[
                  styles.chipText,
                  visibility === ALL_CAMPUSES && styles.visibilityChipTextSelected,
                ]}>
                All campuses
              </Text>
            </Pressable>

            {mySchool ? (
              (() => {
                const selected = visibility === mySchool;
                const color = schoolColors[mySchool as School];
                return (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setVisibility(mySchool as Visibility)}
                    style={[
                      styles.chip,
                      selected && {
                        backgroundColor: color.bg,
                        borderColor: color.bg,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.chipText,
                        selected && { color: color.fg },
                      ]}>
                      My school · {mySchool}
                    </Text>
                  </Pressable>
                );
              })()
            ) : (
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/pick-school')}
                style={[styles.chip, styles.chipMuted]}>
                <Text style={styles.chipMutedText}>Set your school</Text>
              </Pressable>
            )}
          </View>
        </View>

        <Pressable
          accessibilityRole="switch"
          accessibilityState={{ checked: anonymous }}
          onPress={() => setAnonymous((v) => !v)}
          style={styles.anonRow}>
          <View style={styles.anonLeft}>
            <Ionicons
              name={anonymous ? 'eye-off' : 'eye-off-outline'}
              size={20}
              color={anonymous ? campfireTheme.colors.hotPink : campfireTheme.colors.ink}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.anonLabel}>Post anonymously</Text>
              <Text style={styles.anonHint}>
                {anonymous
                  ? 'Shown as Anonymous to others.'
                  : 'Your name will be shown.'}
              </Text>
            </View>
          </View>
          <View style={[styles.toggle, anonymous && styles.toggleOn]}>
            <View style={[styles.toggleKnob, anonymous && styles.toggleKnobOn]} />
          </View>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: campfireTheme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: campfireTheme.colors.border,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: campfireTheme.colors.ink,
  },
  postBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: campfireTheme.radius.pill,
    backgroundColor: campfireTheme.colors.hotPink,
  },
  postBtnDisabled: {
    backgroundColor: campfireTheme.colors.border,
  },
  postBtnText: {
    color: campfireTheme.colors.card,
    fontSize: 14,
    fontWeight: '900',
  },
  content: {
    padding: 20,
    gap: 20,
    paddingBottom: 60,
  },
  titleInput: {
    fontSize: 22,
    fontWeight: '800',
    color: campfireTheme.colors.ink,
    paddingVertical: 8,
  },
  bodyInput: {
    minHeight: 160,
    fontSize: 16,
    lineHeight: 24,
    color: campfireTheme.colors.ink,
    backgroundColor: campfireTheme.colors.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: campfireTheme.colors.border,
  },
  section: {
    gap: 10,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: campfireTheme.colors.mutedInk,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: campfireTheme.radius.pill,
    backgroundColor: campfireTheme.colors.card,
    borderWidth: 1,
    borderColor: campfireTheme.colors.border,
  },
  chipSelected: {
    backgroundColor: campfireTheme.colors.hotPink,
    borderColor: campfireTheme.colors.hotPink,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '700',
    color: campfireTheme.colors.ink,
  },
  chipTextSelected: {
    color: campfireTheme.colors.card,
  },
  visibilityChipSelected: {
    backgroundColor: campfireTheme.colors.lavenderDeep,
    borderColor: campfireTheme.colors.lavenderDeep,
  },
  visibilityChipTextSelected: {
    color: campfireTheme.colors.card,
  },
  chipMuted: {
    backgroundColor: campfireTheme.colors.cardMuted,
    borderColor: campfireTheme.colors.border,
    borderStyle: 'dashed',
  },
  chipMutedText: {
    fontSize: 14,
    fontWeight: '700',
    color: campfireTheme.colors.mutedInk,
  },
  anonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: campfireTheme.colors.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: campfireTheme.colors.border,
    gap: 12,
  },
  anonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  anonLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: campfireTheme.colors.ink,
  },
  anonHint: {
    fontSize: 12,
    color: campfireTheme.colors.mutedInk,
    marginTop: 2,
  },
  toggle: {
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: campfireTheme.colors.border,
    padding: 3,
    justifyContent: 'center',
  },
  toggleOn: {
    backgroundColor: campfireTheme.colors.hotPink,
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: campfireTheme.colors.card,
  },
  toggleKnobOn: {
    transform: [{ translateX: 18 }],
  },
});
