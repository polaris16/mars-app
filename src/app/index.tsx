import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import SplashScreen from '@/components/Splash/SplashScreen';
import { useAuth } from '@/store/AuthContext';

export default function Index() {
  const [splashFinished, setSplashFinished] = useState(false);
  const finishSplash = useCallback(() => setSplashFinished(true), []);
  const {
    initialized,
    token,
    user,
    roles,
    currentRole,
  } = useAuth();

  useEffect(() => {
    if (!splashFinished || !initialized) return;

    if (!token) {
      router.replace('/(auth)/login');
      return;
    }

    if (!user) {
      router.replace('/(auth)/login');
      return;
    }

    if (!user.profileCompleted) {
      router.replace('/(auth)/basic-info');
      return;
    }

    if (!user.interestsCompleted) {
      router.replace('/(auth)/interests');
      return;
    }

    if (roles.length > 1 && !currentRole) {
      router.replace('/(auth)/role-select');
      return;
    }

    router.replace('/(tabs)');
  }, [
    splashFinished,
    initialized,
    token,
    user,
    roles,
    currentRole,
  ]);

  return (
    <SplashScreen
      onFinish={finishSplash}
    />
  );
}
