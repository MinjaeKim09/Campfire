import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { schoolColors, schools, type School } from '@/src/constants/schools';
import { useAuth } from '@/src/contexts/AuthContext';
import { campfireTheme } from '@/src/constants/theme';

export default function PickSchoolScreen() {
  const insets = useSafeAreaInsets();
  const { profile, setSchool } = useAuth();
  const current = profile?.school ?? null;

  const choose = async (school: string | null) => {
    await setSchool(school);
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable hitSlop={10} onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="close" size={22} color={campfireTheme.colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Choose your school</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>
          Your home feed shows posts from your school plus All campuses.
        </Text>

        <Pressable onPress={() => choose(null)} style={styles.row}>
          <Text style={styles.rowText}>None (All campuses only)</Text>
          {current === null && (
            <Ionicons name="checkmark" size={20} color={campfireTheme.colors.hotPink} />
          )}
        </Pressable>

        {schools.map((s) => {
          const selected = current === s;
          const color = schoolColors[s as School];
          return (
            <Pressable
              key={s}
              onPress={() => choose(s)}
              style={[
                styles.row,
                selected && { backgroundColor: color.bg, borderColor: color.bg },
              ]}>
              <Text style={[styles.rowText, selected && { color: color.fg }]}>{s}</Text>
              {selected && (
                <Ionicons name="checkmark" size={20} color={color.fg} />
              )}
            </Pressable>
          );
        })}
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
  content: { padding: 20, gap: 4 },
  subtitle: {
    fontSize: 14,
    color: campfireTheme.colors.mutedInk,
    lineHeight: 20,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: campfireTheme.colors.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: campfireTheme.colors.border,
    marginBottom: 8,
  },
  rowText: { fontSize: 16, fontWeight: '700', color: campfireTheme.colors.ink },
});
