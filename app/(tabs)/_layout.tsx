import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { FloatingPostButton } from '@/components/floating-post-button';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Campfire',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="flame.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="schools"
          options={{
            title: 'Schools',
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="graduationcap.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="sparkles" color={color} />,
          }}
        />
      </Tabs>
      <FloatingPostButton />
    </View>
  );
}
