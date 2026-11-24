import { Typography } from '@/constants/typography';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassScreen } from '@/components/glass-surface';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [entrance] = useState(() => new Animated.Value(0));

  useEffect(() => {
    let active = true;
    const animation = Animated.timing(entrance, {
      toValue: 1,
      duration: 650,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });

    const stopMotion = () => {
      animation.stop();
      entrance.setValue(1);
    };
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', reduced => {
      if (reduced) stopMotion();
    });

    void AccessibilityInfo.isReduceMotionEnabled().then(reduced => {
      if (!active) return;
      if (reduced) stopMotion();
      else animation.start();
    }).catch(() => {
      if (active) stopMotion();
    });

    return () => {
      active = false;
      subscription.remove();
      animation.stop();
    };
  }, [entrance]);

  useEffect(() => {
    const timer = setTimeout(onFinish, 2800);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <GlassScreen>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.fill}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.main, {
            opacity: entrance,
            transform: [{ translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
          }]}>
            <View style={styles.brandGroup}>
              <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.artwork}>
                <Image
                  source={require('@/assets/images/splash-logo.png')}
                  style={styles.logo}
                  contentFit="contain"
                  accessible={false}
                />
              </View>
              <Text dynamicTypeRamp="largeTitle" accessibilityRole="header" style={styles.brandName}>美刻</Text>
            </View>

            <View style={styles.copyGroup}>
              <Text dynamicTypeRamp="title3" style={styles.subtitle}>此刻，即美好</Text>
              <Text dynamicTypeRamp="subheadline" style={styles.description}>M · 陪伴 · 温暖 · 喜悦
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </GlassScreen>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { flexGrow: 1, width: '100%', maxWidth: 480, alignSelf: 'center', paddingHorizontal: 28, paddingTop: 16, paddingBottom: 20 },
  main: {
    flexGrow: 1,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    paddingBottom: 52,
  },
  brandGroup: { width: '100%', alignItems: 'center' },
  artwork: { width: 200, height: 160, alignItems: 'center', justifyContent: 'center' },
  logo: { width: '100%', height: '100%' },
  brandName: { ...Typography.largeTitle, width: '100%', textAlign: 'center', color: '#171717' },
  copyGroup: { width: '100%', alignItems: 'center', gap: 8, marginTop: 24 },
  subtitle: { ...Typography.title3, fontWeight: '400', width: '100%', textAlign: 'center', color: '#404040' },
  description: { ...Typography.subhead, width: '100%', textAlign: 'center', color: '#616161' },
});
