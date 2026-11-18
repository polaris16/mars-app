import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassPressable, GlassScreen, GlassSurface } from '@/components/glass-surface';

import { getRecommendedTopics } from '@/services/topicService';
import type { TopicItem } from '@/types/topic';

export type { TopicItem };

const TOPIC_ICON_MAP: Record<string, string> = {
  headphones: '♫',
  sun: '☀',
  cpu: '⌘',
  briefcase: '▣',
  smile: '☻',
  'book-open': '▤',
  // 标题兜底映射
  单曲循环: '♫',
  生活碎片: '☀',
  科技发现: '⌘',
  工作回忆: '▣',
  解压吐槽: '☻',
  深度阅读: '▤',
};

const DEFAULT_ICON_SET = ['⌘', '☻', '▤', '☀', '♫', '▣'];
const PAGE_SIZE = 10;

function getTopicIcon(topic: TopicItem, index: number): string {
  if (topic.icon_key && TOPIC_ICON_MAP[topic.icon_key]) {
    return TOPIC_ICON_MAP[topic.icon_key];
  }
  if (topic.title && TOPIC_ICON_MAP[topic.title]) {
    return TOPIC_ICON_MAP[topic.title];
  }
  return DEFAULT_ICON_SET[index % DEFAULT_ICON_SET.length];
}

function formatParticipantCount(count: number): string {
  if (typeof count !== 'number' || isNaN(count)) return '0人聊';
  if (count >= 10000) {
    const w = (count / 10000).toFixed(1).replace(/\.0$/, '');
    return `${w}w人聊`;
  }
  if (count >= 1000) {
    const k = (count / 1000).toFixed(1).replace(/\.0$/, '');
    return `${k}k人聊`;
  }
  return `${count}人聊`;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const openRecorder = (topic: string) => router.push({ pathname: '/recorder', params: { topic } });
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const onEndReachedCalledDuringMomentum = useRef(true);

  const fetchTopics = useCallback(
    (targetPage: number) => getRecommendedTopics(targetPage, PAGE_SIZE)
      .then(res => {
        const newItems = res?.items ?? [];
        const total = typeof res?.total === 'number' ? res.total : undefined;

        if (targetPage === 1) {
          setTopics(newItems);
          setPage(1);
          const reachedEnd =
            newItems.length === 0 ||
            newItems.length < PAGE_SIZE ||
            (total !== undefined && newItems.length >= total);
          setHasMore(!reachedEnd);
        } else {
          setTopics((prev) => {
            const existingIds = new Set(prev.map((i) => i.id));
            const uniqueNew = newItems.filter((i) => !existingIds.has(i.id));
            const updated = [...prev, ...uniqueNew];
            const reachedEnd =
              newItems.length === 0 ||
              newItems.length < PAGE_SIZE ||
              (total !== undefined && updated.length >= total);
            setHasMore(!reachedEnd);
            return updated;
          });
          setPage(targetPage);
        }
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : '获取推荐话题失败';
        if (targetPage === 1) {
          setError(message);
        } else {
          setLoadMoreError(message);
        }
      })
      .finally(() => {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }),
    []
  );

  const loadTopics = useCallback((targetPage: number, isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else if (targetPage === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    if (targetPage === 1) setError(null);
    setLoadMoreError(null);
    return fetchTopics(targetPage);
  }, [fetchTopics]);

  useEffect(() => {
    void fetchTopics(1);
  }, [fetchTopics]);

  const handleRefresh = useCallback(() => {
    loadTopics(1, true);
  }, [loadTopics]);

  const handleLoadMore = useCallback(() => {
    if (onEndReachedCalledDuringMomentum.current) {
      return;
    }
    if (
      isLoading ||
      isLoadingMore ||
      isRefreshing ||
      !hasMore ||
      topics.length === 0
    ) {
      return;
    }
    onEndReachedCalledDuringMomentum.current = true;
    loadTopics(page + 1);
  }, [
    isLoading,
    isLoadingMore,
    isRefreshing,
    hasMore,
    topics.length,
    page,
    loadTopics,
  ]);

  const renderFooter = () => {
    if (isLoadingMore) {
      return (
        <View className="flex-row items-center justify-center gap-2 py-5">
          <ActivityIndicator size="small" color="#737373" />
          <Text className="text-xs text-[#737373]">正在加载更多话题...</Text>
        </View>
      );
    }

    if (loadMoreError) {
      return (
        <Pressable
          onPress={() => {
            onEndReachedCalledDuringMomentum.current = false;
            handleLoadMore();
          }}
          className="items-center justify-center py-5"
        >
          <Text className="text-xs text-[#DC2626]">
            {loadMoreError}，点击重试
          </Text>
        </Pressable>
      );
    }

    if (!hasMore && topics.length > 0) {
      return (
        <View className="items-center justify-center py-6">
          <Text className="text-xs text-[#A3A3A3]">— 没有更多数据了 —</Text>
        </View>
      );
    }

    return null;
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View className="items-center justify-center py-20">
          <ActivityIndicator size="large" color="#171717" />
          <Text className="mt-3 text-xs text-[#737373]">正在获取推荐话题...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View className="items-center justify-center gap-3 py-16">
          <Ionicons name="alert-circle-outline" size={40} color="#DC2626" />
          <Text className="text-center text-sm text-[#737373] px-6">{error}</Text>
          <Pressable
            onPress={() => loadTopics(1)}
            className="mt-2 rounded-full bg-[#171717] px-5 py-2.5"
          >
            <Text className="text-xs font-semibold text-white">点击重试</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View className="items-center justify-center gap-2 py-16">
        <Text className="text-sm text-[#737373]">暂无推荐话题</Text>
        <Pressable onPress={() => loadTopics(1)} className="mt-2">
          <Text className="text-xs text-[#2563EB]">刷新试试</Text>
        </Pressable>
      </View>
    );
  };

  const renderItem = ({ item, index }: { item: TopicItem; index: number }) => (
    <GlassPressable
      accessibilityLabel={`选择话题：${item.title}`}
      onPress={() => openRecorder(item.title)}
      surfaceStyle={styles.topic}
    >
      <View style={styles.topicIcon}><Text style={styles.topicSymbol}>{getTopicIcon(item, index)}</Text></View>
      <View style={styles.topicContent}>
        <View style={styles.topicHeading}><Text style={styles.topicTitle}>{item.title}</Text><Text style={styles.topicCount}>{formatParticipantCount(item.participant_count)}</Text></View>
        <Text numberOfLines={2} style={styles.topicDescription}>{item.summary || item.prompt}</Text>
      </View>
      <Ionicons name="arrow-forward" size={18} color="#737373" />
    </GlassPressable>
  );

  return (
    <GlassScreen>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.fill} edges={['top', 'left', 'right']}>
        <FlatList
          data={topics}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          ItemSeparatorComponent={TopicSeparator}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.content, { paddingBottom: 110 + insets.bottom }]}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#737373" colors={['#171717']} />}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.2}
          onMomentumScrollBegin={() => { onEndReachedCalledDuringMomentum.current = false; }}
          ListHeaderComponent={<>
          <View style={styles.header}>
            <View style={styles.brand}>
              <View><Text style={styles.brandName}>同乐</Text><Text style={styles.caption}>尽享美好生活</Text></View>
            </View>
            <GlassPressable
              accessibilityLabel="录音列表"
              accessibilityRole="button"
              onPress={() => router.push('/recorder/list')}
              surfaceStyle={styles.recordingsButton}
            >
              <Ionicons name="list-outline" size={20} color="#404040" />
            </GlassPressable>
          </View>

          <GlassSurface style={styles.hero}>
            <Text style={styles.heroTitle}>你的生活，{'\n'}值得被听见。</Text>
            <Text style={styles.heroDescription}>不必准备，让想说的话自然发生。</Text>
            <View accessible={false} style={styles.wave}>
              {[12, 23, 16, 32, 20, 42, 28, 18, 34, 48, 30, 20, 38, 26, 16, 30, 44, 24, 14, 26, 18, 10].map((height, index) => <View key={index} style={[styles.waveBar, { height, backgroundColor: index > 7 && index < 15 ? '#171717' : '#D4D4D4' }]} />)}
            </View>
            <GlassPressable tone="dark" accessibilityLabel="说两句，开始自由畅聊" onPress={() => openRecorder('自由畅聊 / 即兴倾诉')} style={styles.recordAction} surfaceStyle={styles.recordButton}>
              <Ionicons name="mic-outline" size={21} color="#FFFFFF" /><Text style={styles.recordLabel}>说两句</Text>
            </GlassPressable>
          </GlassSurface>

          <View style={styles.sectionHeader}>
            <View><Text style={styles.sectionTitle}>推荐话题</Text><Text style={styles.sectionDescription}>选一个话题，留住此刻的灵感</Text></View>
            <GlassSurface tone="muted" style={styles.featured}><Text style={styles.badgeText}>今日精选</Text></GlassSurface>
          </View>
          </>}
        />
      </SafeAreaView>
    </GlassScreen>
  );
}

function TopicSeparator() {
  return <View style={styles.topicSeparator} />;
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 16, width: '100%', maxWidth: 640, alignSelf: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  recordingsButton: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  brandName: { fontSize: 20, fontWeight: '700', color: '#0A0A0A' },
  caption: { fontSize: 11, color: '#737373', lineHeight: 18 },
  hero: { padding: 22, borderRadius: 28, marginBottom: 30 },
  badgeText: { color: '#737373', fontSize: 11, fontWeight: '500' },
  heroTitle: { color: '#0A0A0A', fontSize: 27, lineHeight: 38, fontWeight: '700', letterSpacing: -0.8 },
  heroDescription: { color: '#737373', fontSize: 13, marginTop: 9, lineHeight: 21 },
  wave: { flexDirection: 'row', height: 76, alignItems: 'center', justifyContent: 'space-between', marginTop: 12, gap: 4 },
  waveBar: { width: 4, borderRadius: 3 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 16 },
  sectionTitle: { color: '#0A0A0A', fontSize: 21, fontWeight: '700' },
  sectionDescription: { color: '#737373', fontSize: 12, marginTop: 6, lineHeight: 18 },
  featured: { borderRadius: 20, paddingHorizontal: 11, paddingVertical: 7 },
  topicSeparator: { height: 12 },
  topic: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 22 },
  topicIcon: { width: 44, height: 48, backgroundColor: 'rgba(245,245,245,0.85)', borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  topicSymbol: { fontSize: 23, color: '#171717' },
  topicContent: { flex: 1, gap: 6 },
  topicHeading: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  topicTitle: { fontSize: 15, fontWeight: '600', color: '#0A0A0A' },
  topicCount: { fontSize: 10, color: '#737373' },
  topicDescription: { fontSize: 11, lineHeight: 17, color: '#737373' },
  recordAction: { width: '100%', marginTop: 8 },
  recordButton: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 22, paddingVertical: 14, borderRadius: 18 },
  recordLabel: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
});
