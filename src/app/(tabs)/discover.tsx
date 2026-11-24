import { ContentPressable } from '@/components/content-surface';
import { GlassScreen } from '@/components/glass-surface';
import { SCREEN_BACKGROUND } from '@/constants/colors';
import { Typography } from '@/constants/typography';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();

  return (
    <GlassScreen>
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.fill}>
        <StatusBar barStyle="dark-content" />
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 110 + insets.bottom }]} showsVerticalScrollIndicator={false}>
          <Text accessibilityRole="header" dynamicTypeRamp="largeTitle" style={styles.title}>发现</Text>
          <Text dynamicTypeRamp="subheadline" style={styles.subtitle}>探索更多有趣玩法</Text>

          <ContentPressable accessibilityLabel="打扮，虚拟换装入口" onPress={() => router.push('/try-on')} surfaceStyle={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconBadge}>
                <Ionicons name="shirt-outline" size={23} color="#171717" accessible={false} />
              </View>
              <View style={styles.cardCopy}>
                <Text accessibilityRole="header" dynamicTypeRamp="title2" style={styles.cardTitle}>打扮</Text>
                <Text dynamicTypeRamp="subheadline" style={styles.description}>上传照片或视频，试试不同穿搭</Text>
              </View>
            </View>
            <View style={styles.cardArtwork} accessible={false} importantForAccessibility="no-hide-descendants">
              <View style={styles.artworkGlow} />
              <View style={styles.artworkTileBack}>
                <Ionicons name="sparkles" size={20} color="#9275C8" />
              </View>
              <View style={styles.artworkTileFront}>
                <Ionicons name="shirt-outline" size={38} color="#5B4A80" />
              </View>
              <View style={styles.artworkTag}><Ionicons name="images-outline" size={14} color="#65538A" /><Text style={styles.artworkTagText}>照片 · 视频</Text></View>
            </View>
            <View style={styles.cardFooter}>
              <View style={styles.arrowCircle}><Ionicons name="arrow-forward" size={17} color="#FFFFFF" accessible={false} /></View>
            </View>
          </ContentPressable>
        </ScrollView>
      </SafeAreaView>
    </GlassScreen>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: SCREEN_BACKGROUND },
  content: { padding: 24, width: '100%', maxWidth: 640, alignSelf: 'center' },
  title: { ...Typography.largeTitle, color: '#0A0A0A' },
  subtitle: { ...Typography.subhead, color: '#616161', marginTop: 6, marginBottom: 28 },
  card: { padding: 20, borderRadius: 28, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBadge: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: '#F2F2F7' },
  cardCopy: { flex: 1, minWidth: 0, gap: 4 },
  cardTitle: { ...Typography.title2, color: '#171717' },
  description: { ...Typography.subhead, color: '#616161' },
  cardArtwork: { height: 188, marginTop: 18, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: '#F5F1FB' },
  artworkGlow: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: '#E9DFF8' },
  artworkTileBack: { position: 'absolute', top: 28, right: '26%', width: 68, height: 88, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 11, borderRadius: 20, backgroundColor: '#E3D9F2', transform: [{ rotate: '12deg' }] },
  artworkTileFront: { width: 94, height: 116, alignItems: 'center', justifyContent: 'center', borderRadius: 24, backgroundColor: '#FFFFFF', shadowColor: '#53416E', shadowOpacity: 0.12, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 3 },
  artworkTag: { position: 'absolute', left: 14, bottom: 14, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 11, paddingVertical: 8, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.9)' },
  artworkTagText: { ...Typography.caption1, color: '#65538A' },
  cardFooter: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 },
  arrowCircle: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18, backgroundColor: '#171717' },
});
