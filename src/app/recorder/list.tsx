import { ContentSurface } from '@/components/content-surface';
import { GlassBackToolbar } from '@/components/glass-back-toolbar';
import { RecordingEmptyState } from '@/components/recording-empty-state';
import { SCREEN_BACKGROUND } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { getRecordingSessions } from '@/services/recordingService';
import type { RecordingSession } from '@/types/recording';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PAGE_SIZE = 10;

function formatRecordingDate(value: string | null): string {
  if (!value) return '尚未录制';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('zh-CN', {
    month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function formatRecordingDuration(durationMs: number): string {
  const seconds = Math.floor(durationMs / 1000);
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

export default function RecordingListPage() {
  const router = useRouter();
  const [recordings, setRecordings] = useState<RecordingSession[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const pageRef = useRef(0);
  const totalRef = useRef(0);
  const loadingRef = useRef(false);
  const requestIdRef = useRef(0);

  const loadFirstPage = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError('');
    pageRef.current = 0;
    try {
      const response = await getRecordingSessions(1, PAGE_SIZE);
      if (requestId !== requestIdRef.current) return;
      setRecordings(response.items);
      setTotal(response.total);
      totalRef.current = response.total;
      pageRef.current = response.page;
    } catch (loadError) {
      if (requestId === requestIdRef.current) {
        setError(loadError instanceof Error ? loadError.message : '加载记录失败，请稍后重试。');
      }
    } finally {
      if (requestId === requestIdRef.current) {
        loadingRef.current = false;
        setLoading(false);
      }
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || pageRef.current === 0 || recordings.length >= totalRef.current) return;
    loadingRef.current = true;
    const requestId = requestIdRef.current;
    setLoadingMore(true);
    setError('');
    try {
      const response = await getRecordingSessions(pageRef.current + 1, PAGE_SIZE);
      if (requestId !== requestIdRef.current) return;
      setRecordings(current => {
        const existingIds = new Set(current.map(item => item.id));
        return [...current, ...response.items.filter(item => !existingIds.has(item.id))];
      });
      setTotal(response.total);
      totalRef.current = response.total;
      pageRef.current = response.page;
    } catch (loadError) {
      if (requestId === requestIdRef.current) {
        setError(loadError instanceof Error ? loadError.message : '加载更多失败，请稍后重试。');
      }
    } finally {
      if (requestId === requestIdRef.current) {
        loadingRef.current = false;
        setLoadingMore(false);
      }
    }
  }, [recordings.length]);

  useFocusEffect(useCallback(() => {
    void loadFirstPage();
  }, [loadFirstPage]));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: SCREEN_BACKGROUND }} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      <View className="min-h-16 flex-row items-center px-4 py-2">
        <GlassBackToolbar title="历史" onBack={() => router.back()} />
      </View>

      {loading && recordings.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size="large" color="#616161" /></View>
      ) : error && recordings.length === 0 ? (
        <Pressable onPress={() => void loadFirstPage()} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text dynamicTypeRamp="body" style={{ ...Typography.body, textAlign: 'center', color: '#B42318' }}>{error} 点击重试</Text>
        </Pressable>
      ) : recordings.length === 0 ? (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          <RecordingEmptyState icon="document-text-outline" />
        </ScrollView>
      ) : <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 80) void loadMore();
        }}
        scrollEventThrottle={250}
      >
        <View style={{ marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 }}>
          <Text dynamicTypeRamp="caption1" style={{ ...Typography.caption1, color: '#616161' }}>共 {total} 条</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><Text dynamicTypeRamp="subheadline" style={{ ...Typography.subhead, color: '#1B1C1C' }}>按时间</Text><Ionicons name="swap-vertical" size={16} color="#1B1C1C" /></View>
        </View>

        {recordings.map(recording => (
          <Pressable
            key={recording.id}
            accessibilityRole="button"
            accessibilityLabel={`打开录音：${recording.title}`}
            onPress={() => router.push({ pathname: '/recorder', params: { topic: recording.topic_title ?? recording.title, recordingId: String(recording.id) } })}
            style={{ marginBottom: 12 }}
          >
            <ContentSurface style={{ padding: 20, borderRadius: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
                  <Text dynamicTypeRamp="headline" style={{ ...Typography.headline, flexShrink: 1, color: '#0A0A0A' }}>{recording.title + " . " + recording.topic_title}</Text>
                  <View style={{ borderRadius: 4, backgroundColor: '#EFEDED', paddingHorizontal: 6, paddingVertical: 3 }}><Text dynamicTypeRamp="caption1" style={{ ...Typography.caption1, color: '#616161' }}>{recording.fragment_count} 段</Text></View>
                </View>
                <Text dynamicTypeRamp="footnote" style={{ ...Typography.footnote, marginTop: 6, color: '#616161' }}>{formatRecordingDate(recording.last_recorded_at ?? recording.created_at)} · {formatRecordingDuration(recording.duration_ms)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#616161" style={{ width: 44, height: 44, marginTop: -6, textAlign: 'center', textAlignVertical: 'center' }} />
            </View>
            </ContentSurface>
          </Pressable>
        ))}
        {loadingMore ? <ActivityIndicator style={{ paddingVertical: 16 }} color="#616161" /> : null}
        {error ? <Pressable onPress={() => void loadMore()}><Text dynamicTypeRamp="caption1" style={{ ...Typography.caption1, paddingVertical: 16, textAlign: 'center', color: '#B42318' }}>{error} 点击重试</Text></Pressable> : null}
        {recordings.length >= total ? <Text dynamicTypeRamp="caption1" style={{ ...Typography.caption1, paddingVertical: 16, textAlign: 'center', color: '#616161' }}>没有更多数据了</Text> : null}
      </ScrollView>}
    </SafeAreaView>
  );
}
