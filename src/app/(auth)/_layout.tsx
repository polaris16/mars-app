import { Stack } from 'expo-router';

import { DefaultTheme, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/src/global.css';

export default function AuthLayout() {
  return (
    <GluestackUIProvider mode="light">
      <ThemeProvider value={DefaultTheme}>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="login" />
          <Stack.Screen name="basic-info" />
          <Stack.Screen name="interests" />
          <Stack.Screen name="role-select" />
        </Stack>
      </ThemeProvider>
    </GluestackUIProvider>
  );
}
