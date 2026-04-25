import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { communitySections, schools } from '@/src/constants/schools';
import { campfireTheme } from '@/src/constants/theme';

const schoolNotes: Record<(typeof schools)[number], string> = {
  Columbia: 'Morningside study spots, core classes, and KSA events.',
  SVA: 'Studio critiques, portfolio help, and creative housing leads.',
  NYU: 'Downtown classes, clubs, and student life across buildings.',
  'Cooper Union': 'Tight-knit engineering, art, and architecture threads.',
  FIT: 'Fashion, business, and design communities around Chelsea.',
  Parsons: 'Design studios, critiques, and Lower Manhattan meetups.',
};

export default function SchoolsScreen() {
  const insets = useSafeAreaInsets();
  const [selectedSchool, setSelectedSchool] = useState<(typeof schools)[number]>(schools[0]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + campfireTheme.spacing.screen },
      ]}>
      <View style={styles.header}>
        <Text style={styles.kicker}>School communities</Text>
        <Text style={styles.title}>Start local, then gather around the main fire.</Text>
        <Text style={styles.subtitle}>
          Each school can have its own board for classes, events, housing, and club posts.
        </Text>
      </View>

      <View style={styles.schoolList}>
        {schools.map((school, index) => {
          const isSelected = school === selectedSchool;

          return (
            <Pressable
              key={school}
              accessibilityHint={`Show ${school} community sections`}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => setSelectedSchool(school)}
              style={({ pressed }) => [
                styles.schoolCard,
                isSelected && styles.schoolCardSelected,
                pressed && styles.schoolCardPressed,
              ]}>
              <View style={[styles.schoolBadge, isSelected && styles.schoolBadgeSelected]}>
                <Text style={styles.schoolBadgeText}>{index + 1}</Text>
              </View>
              <View style={styles.schoolCopy}>
                <Text style={styles.schoolName}>{school}</Text>
                <Text style={styles.schoolNote}>{schoolNotes[school]}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.selectedBoard}>
        <View style={styles.selectedHeader}>
          <Text style={styles.selectedEyebrow}>{selectedSchool} board</Text>
          <Text style={styles.selectedTitle}>Explore what students can post here.</Text>
        </View>

        <View style={styles.sectionList}>
          {communitySections.map((section) => (
            <View key={section.title} style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionDescription}>{section.description}</Text>
            </View>
          ))}
        </View>
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
    backgroundColor: campfireTheme.colors.cardMuted,
    padding: 24,
  },
  kicker: {
    alignSelf: 'flex-start',
    borderRadius: campfireTheme.radius.pill,
    backgroundColor: campfireTheme.colors.neonPink,
    color: campfireTheme.colors.card,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    textTransform: 'uppercase',
  },
  title: {
    color: campfireTheme.colors.ink,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.8,
    lineHeight: 36,
  },
  subtitle: {
    color: campfireTheme.colors.mutedInk,
    fontSize: 15,
    lineHeight: 22,
  },
  schoolList: {
    gap: 12,
  },
  schoolCard: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: campfireTheme.colors.border,
    borderRadius: campfireTheme.radius.card,
    backgroundColor: campfireTheme.colors.card,
    padding: 18,
  },
  schoolCardSelected: {
    borderColor: campfireTheme.colors.hotPink,
    backgroundColor: '#FFF5FB',
  },
  schoolCardPressed: {
    opacity: 0.78,
  },
  schoolBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: campfireTheme.colors.lavender,
  },
  schoolBadgeSelected: {
    backgroundColor: campfireTheme.colors.emberYellow,
  },
  schoolBadgeText: {
    color: campfireTheme.colors.black,
    fontSize: 16,
    fontWeight: '900',
  },
  schoolCopy: {
    flex: 1,
    gap: 4,
  },
  schoolName: {
    color: campfireTheme.colors.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  schoolNote: {
    color: campfireTheme.colors.mutedInk,
    fontSize: 14,
    lineHeight: 20,
  },
  selectedBoard: {
    gap: 14,
    borderRadius: 32,
    backgroundColor: campfireTheme.colors.backgroundDeep,
    padding: 20,
  },
  selectedHeader: {
    gap: 6,
  },
  selectedEyebrow: {
    color: campfireTheme.colors.emberYellow,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  selectedTitle: {
    color: campfireTheme.colors.card,
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 28,
  },
  sectionList: {
    gap: 10,
  },
  sectionCard: {
    borderRadius: 22,
    backgroundColor: campfireTheme.colors.card,
    padding: 16,
  },
  sectionTitle: {
    color: campfireTheme.colors.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  sectionDescription: {
    color: campfireTheme.colors.mutedInk,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 5,
  },
});
