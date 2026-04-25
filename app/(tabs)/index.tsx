import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { communitySections } from '@/src/constants/schools';
import { campfireTheme, heatScale } from '@/src/constants/theme';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.heroTopRow}>
          <Text style={styles.kicker}>Campfire beta</Text>
          <Text style={styles.marshmallow}>M</Text>
        </View>
        <Text style={styles.title}>A cozy campus board for Korean students in NYC.</Text>
        <Text style={styles.subtitle}>
          학교별 꿀수업, 커뮤니티, 룸메이트, 동아리, 행사 소식을 한 곳에 모아요.
        </Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Campfire heat</Text>
        <Text style={styles.sectionCaption}>Popularity can glow from cozy to hot.</Text>
      </View>
      <View style={styles.heatRow}>
        {heatScale.map((level) => (
          <View key={level.label} style={styles.heatCard}>
            <View style={[styles.heatDot, { backgroundColor: level.color }]} />
            <Text style={styles.heatLabel}>{level.label}</Text>
            <Text style={styles.heatDescription}>{level.description}</Text>
          </View>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>What students can find</Text>
        <Text style={styles.sectionCaption}>A first pass at the core community surfaces.</Text>
      </View>
      <View style={styles.grid}>
        {communitySections.map((section) => (
          <View key={section.title} style={styles.card}>
            <Text style={styles.cardTitle}>{section.title}</Text>
            <Text style={styles.cardDescription}>{section.description}</Text>
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
    gap: 24,
    padding: campfireTheme.spacing.screen,
    paddingBottom: 40,
  },
  hero: {
    gap: 18,
    overflow: 'hidden',
    borderRadius: 36,
    backgroundColor: campfireTheme.colors.backgroundDeep,
    padding: 24,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kicker: {
    alignSelf: 'flex-start',
    borderRadius: campfireTheme.radius.pill,
    backgroundColor: campfireTheme.colors.lavender,
    color: campfireTheme.colors.black,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    textTransform: 'uppercase',
  },
  marshmallow: {
    borderRadius: 18,
    backgroundColor: campfireTheme.colors.card,
    color: campfireTheme.colors.hotPink,
    fontSize: 24,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  title: {
    color: campfireTheme.colors.card,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1,
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
  },
  heatRow: {
    gap: 12,
  },
  heatCard: {
    borderWidth: 1,
    borderColor: campfireTheme.colors.border,
    borderRadius: campfireTheme.radius.card,
    backgroundColor: campfireTheme.colors.card,
    padding: 18,
  },
  heatDot: {
    height: 12,
    width: 54,
    borderRadius: campfireTheme.radius.pill,
    marginBottom: 14,
  },
  heatLabel: {
    color: campfireTheme.colors.ink,
    fontSize: 18,
    fontWeight: '800',
  },
  heatDescription: {
    color: campfireTheme.colors.mutedInk,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  grid: {
    gap: 8,
  },
  card: {
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
});
