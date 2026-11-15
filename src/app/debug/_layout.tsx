
import { Stack } from 'expo-router';

export default function DebugLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: '#F5F5F5',
        },
      }}
    />
  );
}
