import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { isSupabaseConfigured } from '@/src/lib/supabase';
import { campfireTheme } from '@/src/constants/theme';

const roadmap = [
  'Supabase Auth for student accounts and school affiliation.',
  'RLS-backed posts for class tips, housing, clubs, and events.',
  'Heat score ranking so popular posts glow red, orange, or yellow.',
  'Korean student association promotion tools for events and announcements.',
] as const;

export default function TabTwoScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.kicker}>Explore</Text>
        <Text style={styles.title}>The first scaffold is ready for product decisions.</Text>
        <Text style={styles.subtitle}>
          The app starts with Expo Router, TypeScript, and a Supabase client helper.
        </Text>
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.statusLabel}>Supabase</Text>
        <Text style={styles.statusTitle}>
          {isSupabaseConfigured ? 'Connected env detected' : 'Waiting for project keys'}
        </Text>
        <Text style={styles.statusCopy}>
          Add values from your Supabase project to a local .env file using env.example as the
          template.
        </Text>
      </View>

      <View style={styles.roadmap}>
        {roadmap.map((item) => (
          <View key={item} style={styles.roadmapItem}>
            <View style={styles.bullet} />
            <Text style={styles.roadmapText}>{item}</Text>
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
  header: {
    gap: 12,
    borderRadius: 36,
    backgroundColor: campfireTheme.colors.black,
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
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.8,
    lineHeight: 36,
  },
  subtitle: {
    color: '#F7E8FF',
    fontSize: 15,
    lineHeight: 22,
  },
  statusCard: {
    gap: 8,
    borderWidth: 1,
    borderColor: campfireTheme.colors.border,
    borderRadius: campfireTheme.radius.card,
    backgroundColor: campfireTheme.colors.card,
    padding: 20,
  },
  statusLabel: {
    color: campfireTheme.colors.hotPink,
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  statusTitle: {
    color: campfireTheme.colors.ink,
    fontSize: 20,
    fontWeight: '900',
  },
  statusCopy: {
    color: campfireTheme.colors.mutedInk,
    fontSize: 14,
    lineHeight: 21,
  },
  roadmap: {
    gap: 12,
  },
  roadmapItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderRadius: 22,
    backgroundColor: campfireTheme.colors.cardMuted,
    padding: 16,
  },
  bullet: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: campfireTheme.colors.emberOrange,
    marginTop: 5,
  },
  roadmapText: {
    flex: 1,
    color: campfireTheme.colors.ink,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
  },
});
