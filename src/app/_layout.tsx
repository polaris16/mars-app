import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider } from '@/store/AuthContext';
import { GlassAccessibilityProvider } from '@/components/ui/liquid-glass';
import '@/global.css';


export default function RootLayout() {
  return (
    <AuthProvider>
      <GlassAccessibilityProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="recorder" />
        </Stack>
      </GlassAccessibilityProvider>
    </AuthProvider>
  );
}
