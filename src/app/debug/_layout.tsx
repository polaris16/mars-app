
import { Stack } from 'expo-router';
import { SCREEN_BACKGROUND } from '@/constants/colors';

export default function DebugLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: SCREEN_BACKGROUND,
        },
      }}
    />
  );
}
