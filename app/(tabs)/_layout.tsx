import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { FloatingPostButton } from '@/components/floating-post-button';

export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}>
        <Tabs.Screen name="index" />
      </Tabs>
      <FloatingPostButton />
    </View>
  );
}
