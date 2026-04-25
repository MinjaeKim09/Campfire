import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { communitySections, getSchoolBySlug, schoolNotes } from '@/src/constants/schools';
import { campfireTheme } from '@/src/constants/theme';

const samplePosts = [
  'Share a class tip or professor recommendation.',
  'Ask about housing, roommates, or neighborhood leads.',
  'Promote a meetup, club event, or student announcement.',
] as const;

export default function SchoolCommunityScreen() {
  const { slug } = useLocalSearchParams<{ slug?: string }>();
  const insets = useSafeAreaInsets();
  const school = getSchoolBySlug(slug);

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
          <Text style={styles.emptyCopy}>Choose a school from the Schools tab to open its community.</Text>
        </View>
      </ScrollView>
    );
  }

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

      <View style={styles.hero}>
        <Text style={styles.kicker}>{school} community</Text>
        <Text style={styles.title}>Gather around your school board.</Text>
        <Text style={styles.subtitle}>{schoolNotes[school]}</Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Community sections</Text>
        <Text style={styles.sectionCaption}>Start with the core boards students can use at {school}.</Text>
      </View>

      <View style={styles.sectionList}>
        {communitySections.map((section) => (
          <View key={section.title} style={styles.sectionCard}>
            <Text style={styles.cardTitle}>{section.title}</Text>
            <Text style={styles.cardDescription}>{section.description}</Text>
          </View>
        ))}
      </View>

      <View style={styles.postCard}>
        <Text style={styles.postKicker}>Latest activity preview</Text>
        {samplePosts.map((post) => (
          <View key={post} style={styles.postRow}>
            <View style={styles.postDot} />
            <Text style={styles.postText}>{post}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: campfireTheme.colors.background,
  },
  content: {
    gap: 22,
    padding: campfireTheme.spacing.screen,
    paddingBottom: 40,
  },
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
  },
  title: {
    color: campfireTheme.colors.card,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.8,
    lineHeight: 38,
  },
  subtitle: {
    color: '#F7E8FF',
    fontSize: 16,
    lineHeight: 24,
  },
  sectionHeader: {
    gap: 4,
  },
  sectionTitle: {
    color: campfireTheme.colors.ink,
    fontSize: 22,
    fontWeight: '900',
  },
  sectionCaption: {
    color: campfireTheme.colors.mutedInk,
    fontSize: 14,
    lineHeight: 20,
  },
  sectionList: {
    gap: 10,
  },
  sectionCard: {
    borderWidth: 1,
    borderColor: campfireTheme.colors.border,
    borderRadius: campfireTheme.radius.card,
    backgroundColor: campfireTheme.colors.card,
    padding: 18,
  },
  cardTitle: {
    color: campfireTheme.colors.ink,
    fontSize: 17,
    fontWeight: '900',
  },
  cardDescription: {
    color: campfireTheme.colors.mutedInk,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  postCard: {
    gap: 12,
    borderRadius: 28,
    backgroundColor: campfireTheme.colors.cardMuted,
    padding: 18,
  },
  postKicker: {
    color: campfireTheme.colors.ink,
    fontSize: 17,
    fontWeight: '900',
  },
  postRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  postDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: campfireTheme.colors.hotPink,
    marginTop: 5,
  },
  postText: {
    flex: 1,
    color: campfireTheme.colors.mutedInk,
    fontSize: 14,
    lineHeight: 20,
  },
  emptyCard: {
    gap: 8,
    borderRadius: campfireTheme.radius.card,
    backgroundColor: campfireTheme.colors.card,
    padding: 22,
  },
  emptyTitle: {
    color: campfireTheme.colors.ink,
    fontSize: 22,
    fontWeight: '900',
  },
  emptyCopy: {
    color: campfireTheme.colors.mutedInk,
    fontSize: 15,
    lineHeight: 22,
  },
});
