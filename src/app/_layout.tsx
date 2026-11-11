import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/src/global.css';

export default function RootLayout() {
  return (
    <GluestackUIProvider mode="light">
      <ThemeProvider value={DefaultTheme}>
        <StatusBar style="dark" />
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </GluestackUIProvider>
  );
}
