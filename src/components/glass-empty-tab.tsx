import { Typography } from '@/constants/typography';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassScreen, GlassSurface } from './glass-surface';

export function GlassEmptyTab({ title, subtitle, icon, message }: {
  title: string;
  subtitle: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  message: string;
}) {
  const insets = useSafeAreaInsets();
  return <GlassScreen><SafeAreaView style={styles.fill} edges={['top', 'left', 'right']}>
    <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 110 + insets.bottom }]}>
      <Text dynamicTypeRamp="largeTitle" style={styles.title}>{title}</Text>
      <Text dynamicTypeRamp="subheadline" style={styles.subtitle}>{subtitle}</Text>
      <GlassSurface style={styles.empty}>
        <View style={styles.icon}><Ionicons name={icon} size={34} color="#171717" /></View>
        <Text dynamicTypeRamp="body" style={styles.message}>{message}</Text>
      </GlassSurface>
    </ScrollView>
  </SafeAreaView></GlassScreen>;
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { padding: 24, width: '100%', maxWidth: 640, alignSelf: 'center' },
  title: { ...Typography.largeTitle, color: '#0A0A0A' },
  subtitle: { ...Typography.subhead, color: '#737373', marginTop: 6, marginBottom: 36 },
  empty: { alignItems: 'center', justifyContent: 'center', minHeight: 300, padding: 28, gap: 24, borderRadius: 28 },
  icon: { width: 80, height: 80, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F5' },
  message: { ...Typography.body, color: '#737373', textAlign: 'center' },
});
