import { Stack } from 'expo-router';

import { SCREEN_BACKGROUND } from '@/constants/colors';
import { useAuth } from '@/store/AuthContext';
import { CompanionSessionProvider } from '@/store/companion-session';

export default function CompanionsLayout() {
  const { user } = useAuth();

  return (
    <CompanionSessionProvider key={user?.id ?? 'guest'}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: SCREEN_BACKGROUND } }} />
    </CompanionSessionProvider>
  );
}
