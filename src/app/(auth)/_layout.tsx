import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { SCREEN_BACKGROUND } from '@/constants/colors';

export default function AuthLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: SCREEN_BACKGROUND },
        animation: 'slide_from_right',
      }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="basic-info" />
        <Stack.Screen name="interests" />
        <Stack.Screen name="role-select" />
      </Stack>
    </>
  );
}
