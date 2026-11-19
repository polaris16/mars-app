import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider } from '@/store/AuthContext';
import { GlassAccessibilityProvider } from '@/components/ui/liquid-glass';
import { SCREEN_BACKGROUND } from '@/constants/colors';
import { Colors } from '@/constants/theme';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';

const navigationTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: SCREEN_BACKGROUND, primary: Colors.light.accentBlue },
};

export default function RootLayout() {
  return (
    <GluestackUIProvider mode="light">
      <ThemeProvider value={navigationTheme}>
        <AuthProvider>
          <GlassAccessibilityProvider>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: SCREEN_BACKGROUND } }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="recorder" />
            </Stack>
          </GlassAccessibilityProvider>
        </AuthProvider>
      </ThemeProvider>
    </GluestackUIProvider>
  );
}
