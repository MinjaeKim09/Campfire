import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Platform, Pressable, StyleSheet } from 'react-native';

import { useAuth } from '@/src/contexts/AuthContext';
import { campfireTheme } from '@/src/constants/theme';

const TAB_BAR_OFFSET = Platform.select({ ios: 96, android: 88, default: 88 });

export function FloatingPostButton() {
  const { session } = useAuth();

  const onPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push(session ? '/modal' : '/sign-in');
  };

  return (
    <Pressable
      accessibilityLabel="Create a new post"
      accessibilityRole="button"
      hitSlop={10}
      onPress={onPress}
      style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}>
      <Ionicons name="add" size={32} color={campfireTheme.colors.card} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: TAB_BAR_OFFSET,
    height: 60,
    width: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: campfireTheme.colors.hotPink,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  fabPressed: {
    transform: [{ scale: 0.94 }],
    opacity: 0.92,
  },
});
