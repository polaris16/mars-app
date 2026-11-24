import { GlassBackToolbar } from '@/components/glass-back-toolbar';
import { GlassScreen } from '@/components/glass-surface';
import { SCREEN_BACKGROUND } from '@/constants/colors';
import { Typography } from '@/constants/typography';

import { router } from 'expo-router';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  return (
    <GlassScreen>
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.fill}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <GlassBackToolbar title="设置" onBack={() => router.back()} />
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <Text dynamicTypeRamp="subheadline" style={styles.placeholder}>设置选项即将开放</Text>
        </ScrollView>
      </SafeAreaView>
    </GlassScreen>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: SCREEN_BACKGROUND },
  header: { minHeight: 64, justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 8 },
  content: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  placeholder: { ...Typography.subhead, color: '#616161' },
});
