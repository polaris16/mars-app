import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassPressable, GlassScreen, GlassSurface } from '@/components/glass-surface';
import { useAuth } from '@/store/AuthContext';

export default function ProfileScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  return <GlassScreen>
    <SafeAreaView style={styles.fill} edges={['top', 'left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: 110 + insets.bottom }]}>
        <Text style={styles.title}>我的</Text>
        <Text style={styles.subtitle}>收藏声音，也收藏生活</Text>
        <GlassSurface style={styles.profile}>
          <View style={styles.avatar}>
            {user?.avatar ? <Image source={{ uri: user.avatar }} style={styles.avatarImage} /> : <Ionicons name="person" size={38} color="#2563EB" />}
          </View>
          <Text style={styles.name}>{user?.nickname || '个人中心'}</Text>
          <Text style={styles.description}>管理个人信息及应用设置</Text>
          <View style={styles.divider} />
          <View style={styles.note}><Ionicons name="headset-outline" size={16} color="#737373" /><Text style={styles.description}>每一个平凡日常，都值得留声</Text></View>
        </GlassSurface>
        <Text style={styles.sectionTitle}>我的空间</Text>
        <GlassPressable onPress={() => router.push('/recorder/list')} surfaceStyle={styles.row}>
          <View style={styles.icon}><Ionicons name="mic-outline" size={22} color="#171717" /></View>
          <View style={styles.rowContent}><Text style={styles.rowTitle}>我的录音</Text><Text style={styles.description}>查看和管理已完成的录音</Text></View>
          <Ionicons name="chevron-forward" size={17} color="#737373" />
        </GlassPressable>
        {__DEV__ && <>
          <Text style={[styles.sectionTitle, { marginTop: 28 }]}>开发调试</Text>
          <GlassPressable onPress={() => router.push('/debug/debug_store')} surfaceStyle={styles.row}>
            <View style={[styles.icon, { backgroundColor: '#EFF6FF' }]}><Ionicons name="server-outline" size={22} color="#2563EB" /></View>
            <View style={styles.rowContent}><Text style={styles.rowTitle}>本地存储调试</Text><Text style={styles.description}>查看 SecureStore 数据及清理存储</Text></View>
            <Ionicons name="chevron-forward" size={17} color="#737373" />
          </GlassPressable>
        </>}
      </ScrollView>
    </SafeAreaView>
  </GlassScreen>;
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { padding: 24, maxWidth: 640, width: '100%', alignSelf: 'center' },
  title: { fontSize: 28, fontWeight: '700', color: '#0A0A0A' },
  subtitle: { marginTop: 6, marginBottom: 28, fontSize: 13, color: '#737373' },
  profile: { padding: 28, alignItems: 'center', marginBottom: 30, borderRadius: 28 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 3, borderColor: '#FFFFFF' },
  avatarImage: { width: 80, height: 80 },
  name: { fontSize: 20, fontWeight: '700', marginTop: 16, marginBottom: 6, color: '#171717' },
  description: { fontSize: 12, lineHeight: 19, color: '#737373' },
  divider: { width: '100%', height: 1, backgroundColor: '#E5E5E5', marginVertical: 20 },
  note: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#737373', marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 18, borderRadius: 22 },
  rowContent: { flex: 1, gap: 4 },
  rowTitle: { fontSize: 15, fontWeight: '600', color: '#171717' },
  icon: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
});
