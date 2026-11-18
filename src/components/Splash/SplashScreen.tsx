import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, ActivityIndicator, Animated, Easing, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassScreen, GlassSurface } from '@/components/glass-surface';
import { BrandLogo } from '@/components/brand-logo';

interface SplashScreenProps {
  onFinish: () => void;
}

const LIFE_HIGHLIGHTS = [
  { icon: 'sunny-outline', label: '发现美好' },
  { icon: 'leaf-outline', label: '享受日常' },
  { icon: 'people-outline', label: '相伴同乐' },
] as const;

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
            <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.artwork}>
              <BrandLogo />
            </View>

            <Text accessibilityRole="header" style={styles.title}>尽享美好生活</Text>
            <Text style={styles.description}>发现身边的美好，{'\n'}和志趣相投的人，一起热爱生活。</Text>

            <View style={styles.features}>
              {LIFE_HIGHLIGHTS.map(feature => (
                <View key={feature.label} style={styles.feature}>
                  <Ionicons accessible={false} name={feature.icon} size={19} color="#525252" />
                  <Text style={styles.featureLabel}>{feature.label}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          <View style={styles.footer}>
            <GlassSurface style={styles.loading} accessibilityRole="progressbar" accessibilityLabel="正在开启同乐" accessibilityState={{ busy: true }}>
              <ActivityIndicator size="small" color="#525252" accessible={false} />
              <Text style={styles.loadingLabel}>正在开启同乐</Text>
            </GlassSurface>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GlassScreen>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { flexGrow: 1, width: '100%', maxWidth: 480, alignSelf: 'center', paddingHorizontal: 28, paddingTop: 16, paddingBottom: 20 },
  main: { flexGrow: 1, flexShrink: 0, alignItems: 'center', justifyContent: 'center', paddingVertical: 32 },
  artwork: { width: 248, height: 200, alignItems: 'center', justifyContent: 'center' },
  title: { marginTop: 24, fontSize: 31, lineHeight: 44, fontWeight: '700', letterSpacing: -0.8, textAlign: 'center', color: '#171717' },
  description: { marginTop: 14, fontSize: 15, lineHeight: 25, textAlign: 'center', color: '#737373' },
  features: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 24, marginTop: 32 },
  feature: { alignItems: 'center', gap: 8 },
  featureLabel: { fontSize: 12, lineHeight: 18, color: '#525252' },
  footer: { alignItems: 'center' },
  loading: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 28, minHeight: 48, paddingHorizontal: 22, paddingVertical: 12 },
  loadingLabel: { fontSize: 13, lineHeight: 20, color: '#525252', fontWeight: '500' },
});
