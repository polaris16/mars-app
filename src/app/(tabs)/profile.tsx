import { Typography } from '@/constants/typography';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassScreen } from '@/components/glass-surface';
import { ContentPressable, ContentSurface } from '@/components/content-surface';
import { useAuth } from '@/store/AuthContext';
import { DEFAULT_AVATAR_SOURCE } from '@/constants/avatar';
import { useTheme } from '@/hooks/use-theme';

export default function ProfileScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { accentBlue, accentBlueSubtle } = useTheme();
  return <GlassScreen>
    <SafeAreaView style={styles.fill} edges={['top', 'left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: 110 + insets.bottom }]}>
        <Text accessibilityRole="header" dynamicTypeRamp="largeTitle" style={styles.title}>我的</Text>
        <Text dynamicTypeRamp="subheadline" style={styles.subtitle}>收藏声音，也收藏生活</Text>
        <ContentSurface style={styles.profile}>
          <View style={[styles.avatar, { backgroundColor: accentBlueSubtle }]}>
            <Image source={user?.avatar ? { uri: user.avatar } : DEFAULT_AVATAR_SOURCE} style={styles.avatarImage} />
          </View>
          <Text dynamicTypeRamp="title2" style={styles.name}>{user?.nickname || '个人中心'}</Text>
        </ContentSurface>
        <Text dynamicTypeRamp="footnote" style={styles.sectionTitle}>我的空间</Text>
        <ContentPressable accessibilityLabel="联系人" onPress={() => router.navigate('/contacts')} surfaceStyle={styles.row}>
          <View style={[styles.icon, { backgroundColor: accentBlueSubtle }]}><Ionicons name="people-outline" size={22} color={accentBlue} /></View>
          <View style={styles.rowContent}><Text dynamicTypeRamp="headline" style={styles.rowTitle}>联系人</Text><Text dynamicTypeRamp="subheadline" style={styles.description}>查找和管理联系人</Text></View>
          <Ionicons name="chevron-forward" size={17} color="#616161" />
        </ContentPressable>
        <ContentPressable accessibilityLabel="权益" onPress={() => router.navigate('/benefits')} style={styles.nextRow} surfaceStyle={styles.row}>
          <View style={[styles.icon, { backgroundColor: accentBlueSubtle }]}><Ionicons name="gift-outline" size={22} color={accentBlue} /></View>
          <View style={styles.rowContent}><Text dynamicTypeRamp="headline" style={styles.rowTitle}>权益</Text><Text dynamicTypeRamp="subheadline" style={styles.description}>查看专属服务与权益</Text></View>
          <Ionicons name="chevron-forward" size={17} color="#616161" />
        </ContentPressable>
        {__DEV__ && <>
          <Text dynamicTypeRamp="footnote" style={[styles.sectionTitle, { marginTop: 28 }]}>开发调试</Text>
          <ContentPressable onPress={() => router.push('/debug/debug_store')} surfaceStyle={styles.row}>
            <View style={[styles.icon, { backgroundColor: accentBlueSubtle }]}><Ionicons name="server-outline" size={22} color={accentBlue} /></View>
            <View style={styles.rowContent}><Text dynamicTypeRamp="headline" style={styles.rowTitle}>本地存储调试</Text><Text dynamicTypeRamp="subheadline" style={styles.description}>查看 SecureStore 数据及清理存储</Text></View>
            <Ionicons name="chevron-forward" size={17} color="#616161" />
          </ContentPressable>
        </>}
      </ScrollView>
    </SafeAreaView>
  </GlassScreen>;
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 16, maxWidth: 640, width: '100%', alignSelf: 'center' },
  title: { ...Typography.largeTitle, color: '#0A0A0A' },
  subtitle: { ...Typography.subhead, marginTop: 6, marginBottom: 28, color: '#616161' },
  profile: { padding: 28, alignItems: 'center', marginBottom: 30, borderRadius: 28 },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 3, borderColor: '#FFFFFF' },
  avatarImage: { width: 80, height: 80 },
  name: { ...Typography.title2, marginTop: 16, color: '#171717', textAlign: 'center' },
  description: { ...Typography.subhead, color: '#616161' },
  sectionTitle: { ...Typography.footnoteEmphasized, color: '#616161', marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 18, borderRadius: 22 },
  nextRow: { marginTop: 12 },
  rowContent: { flex: 1, gap: 4 },
  rowTitle: { ...Typography.headline, color: '#171717' },
  icon: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
});
