
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { Ionicons } from '@expo/vector-icons';
import {
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface TopicItem {
  id: string;
  title: string;
  count: string;
  description: string;
  icon: string;
}

const TOPIC_LIST: TopicItem[] = [
  {
    id: 'technology',
    title: '科技发现',
    count: '1.2k讨论',
    description: '聊聊最近惊艳你的前沿技术或数码新玩意',
    icon: '⌘',
  },
  {
    id: 'relax',
    title: '解压吐槽',
    count: '856人聊',
    description: '把积压的烦闷一吐为快，听友们陪你倾听',
    icon: '☻',
  },
  {
    id: 'reading',
    title: '深度阅读',
    count: '640人聊',
    description: '分享一本曾触动你心灵或改变观念的好书',
    icon: '▤',
  },
  {
    id: 'life',
    title: '生活碎片',
    count: '1.5k人聊',
    description: '记录街角日落、热气腾腾的咖啡或微小感动',
    icon: '☀',
  },
  {
    id: 'music',
    title: '单曲循环',
    count: '2.1k人聊',
    description: '分享最近反复播放的旋律与背后的独家记忆',
    icon: '♫',
  },
  {
    id: 'work',
    title: '工作回忆',
    count: '930人聊',
    description: '职场蜕变、团队共事或那些印象深刻的挑战',
    icon: '▣',
  },
];

export default function HomeScreen() {
  const router = useRouter();

  // 跳转到录音页面
  const openRecorder = (topic: string) => {
    router.push({
      pathname: '/recorder',
      params: {
        topic,
      },
    });
  };

  return (
    <View
      className="flex-1 bg-[#F9F9FF]"
      style={{
        flex: 1,
        backgroundColor: '#F9F9FF',
      }}
    >
      <StatusBar
        style="dark"
        backgroundColor="#F9F9FF"
      />

      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: '#F9F9FF',
        }}
      >
        <View className="flex-1 bg-[#F9F9FF]">

          {/* 首页内容 */}

          <ScrollView
            className="bg-[#F9F9FF]"
            style={{
              flex: 1,
              backgroundColor: '#F9F9FF',
            }}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: 110,
            }}
            showsVerticalScrollIndicator={false}
          >
            {/* 标题区域 */}

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

            {/* 话题卡片列表 */}

            <View className="gap-3">
              {TOPIC_LIST.map((topic) => (
                <Pressable
                  key={topic.id}
                  accessibilityRole="button"
                  accessibilityLabel={`选择话题：${topic.title}`}
                  onPress={() => openRecorder(topic.title)}
                  className="flex-row items-center justify-between rounded-2xl border border-[#E5E5E5] bg-white p-4"
                  style={{ transform: [{ scale: 0.985 }] }}
                >
                  {/* 左侧内容 */}

                  <View className="min-w-0 flex-1 flex-row items-center gap-3.5">

                    {/* 图标 */}

                    <View className="h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#E5E5E5]/60 bg-[#F5F5F5]">
                      <Text className="text-[22px] font-semibold text-[#0A0A0A]">
                        {topic.icon}
                      </Text>
                    </View>

                    {/* 话题信息 */}

                    <View className="min-w-0 flex-1 gap-1">
                      <View className="flex-row flex-wrap items-center gap-2">
                        <Text
                          numberOfLines={1}
                          className="text-base font-semibold tracking-tight text-[#0A0A0A]"
                        >
                          {topic.title}
                        </Text>

                        <View className="rounded-full bg-[#F5F5F5] px-2 py-0.5">
                          <Text className="text-[11px] font-medium text-[#737373]">
                            {topic.count}
                          </Text>
                        </View>
                      </View>

                      <Text
                        numberOfLines={1}
                        className="text-xs leading-5 text-[#737373]"
                      >
                        {topic.description}
                      </Text>
                    </View>
                  </View>

                  {/* 右侧操作 */}

                  <View className="ml-2 shrink-0 flex-row items-center gap-1">
                    <Text className="text-[12px] font-medium text-[#737373]">
                      去说两句
                    </Text>

                    <Text className="text-base text-[#737373]">
                      ›
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          {/* 悬浮录音按钮 */}

          <View
            pointerEvents="box-none"
            className="absolute bottom-5 right-5"
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="发起原声畅聊"
              onPress={() =>
                openRecorder('自由畅聊 / 即兴倾诉')
              }
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
