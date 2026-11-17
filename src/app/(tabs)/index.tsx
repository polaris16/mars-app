import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';
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
  const router = useRouter();

  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);

  const onEndReachedCalledDuringMomentum = useRef(true);

  // 跳转到录音页面
  const openRecorder = (topic: string) => {
    router.push({
      pathname: '/recorder',
      params: {
        topic,
      },
    });
  };

  const loadTopics = useCallback(
    async (targetPage: number, isRefresh = false) => {
      if (isRefresh) {
        setIsRefreshing(true);
      } else if (targetPage === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      if (targetPage === 1) {
        setError(null);
      } else {
        setLoadMoreError(null);
      }

      try {
        const res = await getRecommendedTopics(targetPage, pageSize);
        const newItems = res?.items ?? [];
        const total = typeof res?.total === 'number' ? res.total : undefined;

        if (targetPage === 1) {
          setTopics(newItems);
          setPage(1);
          const reachedEnd =
            newItems.length === 0 ||
            newItems.length < pageSize ||
            (total !== undefined && newItems.length >= total);
          setHasMore(!reachedEnd);
        } else {
          setTopics((prev) => {
            const existingIds = new Set(prev.map((i) => i.id));
            const uniqueNew = newItems.filter((i) => !existingIds.has(i.id));
            const updated = [...prev, ...uniqueNew];
            const reachedEnd =
              newItems.length === 0 ||
              newItems.length < pageSize ||
              (total !== undefined && updated.length >= total);
            setHasMore(!reachedEnd);
            return updated;
          });
          setPage(targetPage);
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : '获取推荐话题失败';
        if (targetPage === 1) {
          setError(message);
        } else {
          setLoadMoreError(message);
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [pageSize]
  );

  useEffect(() => {
    loadTopics(1);
  }, [loadTopics]);

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

  const renderHeader = () => (
    <View className="mb-6 gap-2">
      <View className="flex-row flex-wrap items-center gap-2">
        <Text className="text-2xl font-bold tracking-tight text-[#0A0A0A]">
          推荐说点什么
        </Text>

        <View className="rounded-full border border-[#E5E5E5] bg-[#F5F5F5] px-2 py-1">
          <Text className="text-[11px] font-medium text-[#737373]">
            今日精选
          </Text>
        </View>
      </View>

      <Text className="text-[13px] leading-5 text-[#737373]">
        挑选一个灵感话题，开启今日随心畅聊
      </Text>
    </View>
  );

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
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`选择话题：${item.title}`}
      onPress={() => openRecorder(item.title)}
      className="flex-row items-center justify-between rounded-2xl border border-[#E5E5E5] bg-white p-4"
      style={{ transform: [{ scale: 0.985 }] }}
    >
      {/* 左侧内容 */}
      <View className="min-w-0 flex-1 flex-row items-center gap-3.5">
        {/* 图标 */}
        <View className="h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#E5E5E5]/60 bg-[#F5F5F5]">
          <Text className="text-[22px] font-semibold text-[#0A0A0A]">
            {getTopicIcon(item, index)}
          </Text>
        </View>

        {/* 话题信息 */}
        <View className="min-w-0 flex-1 gap-1">
          <View className="flex-row flex-wrap items-center gap-2">
            <Text
              numberOfLines={1}
              className="text-base font-semibold tracking-tight text-[#0A0A0A]"
            >
              {item.title}
            </Text>

            <View className="rounded-full bg-[#F5F5F5] px-2 py-0.5">
              <Text className="text-[11px] font-medium text-[#737373]">
                {formatParticipantCount(item.participant_count)}
              </Text>
            </View>
          </View>

          <Text
            numberOfLines={1}
            className="text-xs leading-5 text-[#737373]"
          >
            {item.summary || item.prompt}
          </Text>
        </View>
      </View>

      {/* 右侧操作 */}
      <View className="ml-2 shrink-0 flex-row items-center gap-1">
        <Text className="text-[12px] font-medium text-[#737373]">去说两句</Text>
        <Text className="text-base text-[#737373]">›</Text>
      </View>
    </Pressable>
  );

  return (
    <View
      className="flex-1 bg-[#F9F9FF]"
      style={{
        flex: 1,
        backgroundColor: '#F9F9FF',
      }}
    >
      <StatusBar style="dark" backgroundColor="#F9F9FF" />

      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: '#F9F9FF',
        }}
      >
        <View className="flex-1 bg-[#F9F9FF]">
          {/* 话题列表 */}
          <FlatList
            data={topics}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View className="h-3" />}
            ListHeaderComponent={renderHeader}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmpty}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: 110,
            }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor="#737373"
                colors={['#171717']}
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.2}
            onMomentumScrollBegin={() => {
              onEndReachedCalledDuringMomentum.current = false;
            }}
          />

          {/* 悬浮录音按钮 */}
          <View pointerEvents="box-none" className="absolute bottom-5 right-5">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="发起原声畅聊"
              onPress={() => openRecorder('自由畅聊 / 即兴倾诉')}
              className="h-14 w-14 items-center justify-center rounded-full border border-[#404040] bg-[#171717] shadow-lg"
              style={{ transform: [{ scale: 0.95 }] }}
            >
              <Ionicons name="mic-outline" size={22} color="#ffffff" />
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
