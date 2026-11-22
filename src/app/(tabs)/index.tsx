import { Typography } from '@/constants/typography';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassPressable, GlassScreen } from '@/components/glass-surface';
import { ContentPressable, ContentSurface } from '@/components/content-surface';
import { useTheme } from '@/hooks/use-theme';

import { getRecommendedTopics } from '@/services/topicService';
import { createRecordingSession } from '@/services/recordingService';
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
  const { accentBlue, accentBlueMuted } = useTheme();
  const { fontScale } = useWindowDimensions();
  const largeText = fontScale >= 1.5;
  const openRecorder = async (topic: string, topicId?: number) => {
    if (!topicId) {
      router.push({ pathname: '/recorder', params: { topic } });
      return;
    }

    try {
      const session = await createRecordingSession({
        topic_id: topicId,
        title: '未命名',
        visibility: 'public',
      });
      router.push({ pathname: '/recorder', params: { topic, recordingId: String(session.id) } });
    } catch (error) {
      Alert.alert('无法开始录音', error instanceof Error ? error.message : '创建录音会话失败，请稍后重试。');
    }
  };
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
          <ActivityIndicator size="small" color="#616161" />
          <Text dynamicTypeRamp="caption1" style={Typography.caption1} className="text-[#616161]">正在加载更多话题...</Text>
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
          <Text dynamicTypeRamp="footnote" style={Typography.footnote} className="text-[#B42318]">
            {loadMoreError}，点击重试
          </Text>
        </Pressable>
      );
    }

    if (!hasMore && topics.length > 0) {
      return (
        <View className="items-center justify-center py-6">
          <Text dynamicTypeRamp="caption1" style={Typography.caption1} className="text-[#6B6B6B]">— 没有更多数据了 —</Text>
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
          <Text dynamicTypeRamp="caption1" style={Typography.caption1} className="mt-3 text-[#616161]">正在获取推荐话题...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View className="items-center justify-center gap-3 py-16">
          <Ionicons name="alert-circle-outline" size={40} color="#B42318" />
          <Text dynamicTypeRamp="subheadline" style={Typography.subhead} className="text-center text-[#616161] px-6">{error}</Text>
          <Pressable
            onPress={() => loadTopics(1)}
            accessibilityRole="button"
            className="mt-2 min-h-11 items-center justify-center rounded-full bg-[#171717] px-5 py-2.5"
          >
            <Text dynamicTypeRamp="headline" style={Typography.headline} className="text-white">点击重试</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View className="items-center justify-center gap-2 py-16">
        <Text dynamicTypeRamp="body" style={Typography.body} className="text-[#616161]">暂无推荐话题</Text>
        <Pressable onPress={() => loadTopics(1)} className="mt-2 min-h-11 justify-center" accessibilityRole="button">
          <Text dynamicTypeRamp="body" style={[Typography.body, { color: accentBlue }]}>刷新试试</Text>
        </Pressable>
      </View>
    );
  };

  const renderItem = ({ item, index }: { item: TopicItem; index: number }) => (
    <ContentPressable
      accessibilityLabel={`选择话题：${item.title}`}
      onPress={() => void openRecorder(item.title, item.id)}
      surfaceStyle={[styles.topic, largeText && { flexDirection: 'column', alignItems: 'stretch' }]}
    >
      <View accessible={false} style={[styles.topicIcon, { width: 44 * Math.max(1, fontScale), minHeight: 48 * Math.max(1, fontScale) }]}><Text dynamicTypeRamp="title2" style={styles.topicSymbol}>{getTopicIcon(item, index)}</Text></View>
      <View style={styles.topicContent}>
        <View style={styles.topicHeading}><Text dynamicTypeRamp="headline" style={styles.topicTitle}>{item.title}</Text><Text dynamicTypeRamp="caption1" style={styles.topicCount}>{formatParticipantCount(item.participant_count)}</Text></View>
        <Text dynamicTypeRamp="subheadline" style={styles.topicDescription}>{item.summary || item.prompt}</Text>
      </View>
      <Ionicons accessible={false} name="arrow-forward" size={18 * Math.max(1, fontScale)} color="#616161" />
    </ContentPressable>
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
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#616161" colors={['#171717']} />}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.2}
          onMomentumScrollBegin={() => { onEndReachedCalledDuringMomentum.current = false; }}
          ListHeaderComponent={<>
          <View style={styles.header}>
            <View style={[styles.brand, { flex: 1, minWidth: 0 }]}>
              <View style={{ flex: 1 }}><Text accessibilityRole="header" dynamicTypeRamp="largeTitle" style={styles.brandName}>美刻</Text><Text dynamicTypeRamp="subheadline" style={styles.caption}>此刻，即美好</Text></View>
            </View>
            <GlassPressable
              accessibilityLabel="录音列表"
              onPress={() => router.push('/recorder/list')}
              surfaceStyle={styles.recordingsButton}
            >
              <Ionicons name="list-outline" size={20} color="#404040" />
            </GlassPressable>
          </View>

          <ContentSurface style={styles.hero}>
            <Text dynamicTypeRamp="title1" style={styles.heroTitle}>用声音，{'\n'}收藏生活</Text>
            <Text dynamicTypeRamp="subheadline" style={styles.heroDescription}>不必准备，让想说的话自然发生</Text>
            <View accessible={false} style={styles.wave}>
              {[12, 23, 16, 32, 20, 42, 28, 18, 34, 48, 30, 20, 38, 26, 16, 30, 44, 24, 14, 26, 18, 10].map((height, index) => (
                <View key={index} style={[styles.waveBar, { height, backgroundColor: index > 7 && index < 15 ? accentBlue : accentBlueMuted }]} />
              ))}
            </View>
            <ContentPressable tone="dark" accessibilityLabel="说两句，开始自由畅聊" onPress={() => openRecorder('自由畅聊 / 即兴倾诉')} style={styles.recordAction} surfaceStyle={styles.recordButton}>
              <Ionicons name="mic-outline" size={21} color="#FFFFFF" /><Text dynamicTypeRamp="headline" style={styles.recordLabel}>说两句</Text>
            </ContentPressable>
          </ContentSurface>

          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeading}><Text dynamicTypeRamp="title2" style={styles.sectionTitle}>推荐话题</Text><Text dynamicTypeRamp="subheadline" style={styles.sectionDescription}>选一个话题，留住此刻的灵感</Text></View>
            <ContentSurface tone="muted" style={styles.featured}><Text dynamicTypeRamp="caption1" style={styles.badgeText}>今日精选</Text></ContentSurface>
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
  recordingsButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  brandName: { ...Typography.largeTitle, color: '#0A0A0A' },
  caption: { ...Typography.subhead, marginTop: 6, color: '#616161' },
  hero: { padding: 22, borderRadius: 28, marginBottom: 30 },
  badgeText: { ...Typography.caption1, color: '#616161' },
  heroTitle: { ...Typography.title1, color: '#0A0A0A' },
  heroDescription: { ...Typography.subhead, color: '#616161', marginTop: 9 },
  wave: { flexDirection: 'row', height: 76, alignItems: 'center', justifyContent: 'space-between', marginTop: 12, gap: 4 },
  waveBar: { width: 4, borderRadius: 3 },
  sectionHeader: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 },
  sectionHeading: { flexGrow: 1, flexShrink: 1, flexBasis: 220 },
  sectionTitle: { ...Typography.title2, color: '#0A0A0A' },
  sectionDescription: { ...Typography.subhead, color: '#616161', marginTop: 6 },
  featured: { borderRadius: 20, paddingHorizontal: 11, paddingVertical: 7 },
  topicSeparator: { height: 12 },
  topic: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 22 },
  topicIcon: { width: 44, minHeight: 48, backgroundColor: '#F5F5F5', borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  topicSymbol: { ...Typography.title2, color: '#171717' },
  topicContent: { flex: 1, gap: 6 },
  topicHeading: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  topicTitle: { ...Typography.headline, flexShrink: 1, color: '#0A0A0A' },
  topicCount: { ...Typography.caption1, color: '#616161' },
  topicDescription: { ...Typography.subhead, color: '#616161' },
  recordAction: { width: '100%', marginTop: 8 },
  recordButton: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 22, paddingVertical: 14, borderRadius: 18 },
  recordLabel: { ...Typography.headline, color: '#FFFFFF' },
});
