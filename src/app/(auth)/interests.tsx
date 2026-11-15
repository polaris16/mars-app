import { router } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, ButtonText } from '@/components/ui/button';
import { ArrowLeftIcon, ArrowRightIcon, Icon } from '@/components/ui/icon';
import { useAuth } from '@/store/AuthContext';

const MIN_SELECTION = 3;
const MAX_SELECTION = 5;

const INTEREST_OPTIONS = [
  '科技数码',
  '人工智能',
  '商业财经',
  '学习成长',
  '职场发展',
  '运动健身',
  '旅游户外',
  '美食',
  '时尚美妆',
  '影视娱乐',
  '游戏动漫',
  '音乐',
  '摄影',
  '阅读',
  '亲子家庭',
];

const DEFAULT_SELECTED = [
  '科技数码',
  '人工智能',
  '阅读',
];

export default function InterestsScreen() {
  const { user, roles, completeInterests } = useAuth();

  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    user?.interests?.length
      ? user.interests
      : DEFAULT_SELECTED
  );

  const [submitting, setSubmitting] = useState(false);

  const selectedCount = selectedInterests.length;

  const canContinue =
    selectedCount >= MIN_SELECTION &&
    selectedCount <= MAX_SELECTION &&
    !submitting;

  // 切换兴趣标签
  function toggleInterest(tag: string) {
    setSelectedInterests(current => {
      // 已选中：取消选择
      if (current.includes(tag)) {
        return current.filter(item => item !== tag);
      }

      // 最多选择 5 个
      if (current.length >= MAX_SELECTION) {
        return current;
      }

      // 添加标签
      return [...current, tag];
    });
  }

  // 提交兴趣设置
  function handleComplete() {
    if (!canContinue) return;

    try {
      setSubmitting(true);

      completeInterests(selectedInterests);

      // 根据角色数量决定下一步
      if (roles.length > 1) {
        router.replace('/(auth)/role-select');
      } else {
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('保存兴趣标签失败:', error);
      setSubmitting(false);
    }
  }

  // 返回基础资料页面
  function handleBack() {
    router.back();
  }

  return (
    <View className="flex-1 bg-background" style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>

          {/* 顶部导航 */}
          <View className="h-12 flex-row items-center justify-between px-5">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="返回"
              onPress={handleBack}
              className="-ml-2 h-10 w-10 items-center justify-center rounded-full"
            >
              <Icon
                as={ArrowLeftIcon}
                size="xl"
                className="text-foreground"
              />
            </Pressable>

            <View className="h-10 w-10" />
          </View>

          {/* 页面内容 */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: 24,
              paddingTop: 12,
              paddingBottom: 32,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >

            {/* 标题区域 */}
            <View className="mb-8 gap-2">
              <Text className="text-[26px] font-bold leading-9 tracking-tight text-foreground">
                挑选你感兴趣的领域
              </Text>

              <View className="flex-row items-center justify-between gap-2">
                <Text className="flex-1 text-sm leading-5 text-muted-foreground">
                  请选择 3-5 个标签，让我们更好地了解你
                </Text>

                <View className="flex-row items-center rounded-full border border-border bg-[#F5F5F5] px-3 py-1.5">
                  <Text className="text-xs font-bold text-foreground">
                    {selectedCount}
                  </Text>

                  <Text className="text-xs text-muted-foreground">
                    /{MAX_SELECTION}
                  </Text>
                </View>
              </View>
            </View>

            {/* 兴趣标签区域 */}
            <View className="flex-row flex-wrap gap-2.5">
              {INTEREST_OPTIONS.map(tag => {
                const selected = selectedInterests.includes(tag);

                return (
                  <Pressable
                    key={tag}
                    accessibilityRole="checkbox"
                    accessibilityState={{
                      checked: selected,
                    }}
                    onPress={() => toggleInterest(tag)}
                    className={`min-h-11 flex-row items-center justify-center gap-1.5 rounded-full border px-4 py-2.5 ${
                      selected
                        ? 'border-foreground bg-foreground'
                        : 'border-border bg-[#F5F5F5]'
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        selected
                          ? 'text-background'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {selected ? '✓' : '+'}
                    </Text>

                    <Text
                      className={`text-sm font-medium ${
                        selected
                          ? 'text-background'
                          : 'text-foreground'
                      }`}
                    >
                      {tag}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* 选择状态 */}
            <View className="mt-7 items-center gap-2">
              <Text className="text-xs font-medium text-muted-foreground">
                已选择 {selectedCount} 个标签
              </Text>

              {selectedCount < MIN_SELECTION && (
                <Text className="text-xs text-muted-foreground">
                  还需选择 {MIN_SELECTION - selectedCount} 个
                </Text>
              )}

              {selectedCount >= MIN_SELECTION &&
                selectedCount <= MAX_SELECTION && (
                  <Text className="text-xs font-medium text-foreground">
                    已满足推荐要求
                  </Text>
                )}

              {selectedCount > MAX_SELECTION && (
                <Text className="text-xs text-destructive">
                  请减少 {selectedCount - MAX_SELECTION} 个标签
                </Text>
              )}
            </View>

          </ScrollView>

          {/* 底部操作区域 */}
          <View className="px-6 pb-5 pt-3">
            <Button
              className="h-[52px] w-full rounded-full bg-[#171717]"
              onPress={handleComplete}
              isDisabled={!canContinue}
            >
              <ButtonText className="text-base font-semibold text-white">
                {submitting ? '保存中...' : '开启'}
              </ButtonText>

              {!submitting && (
                <Icon
                  as={ArrowRightIcon}
                  size="md"
                  className="text-white"
                />
              )}
            </Button>
          </View>

        </View>
      </SafeAreaView>
    </View>
  );
}
