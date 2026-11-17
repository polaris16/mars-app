import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, ButtonText } from '@/components/ui/button';
import { ArrowLeftIcon, ArrowRightIcon, Icon } from '@/components/ui/icon';
import { useAuth } from '@/store/AuthContext';
import { getInterests, updateMyInterests } from '@/services/userService';
import type { InterestOption } from '@/types/user';

const MIN_SELECTION = 3;
const MAX_SELECTION = 5;

export default function InterestsScreen() {
  const { user, roles, completeInterests } = useAuth();
  const [interestOptions, setInterestOptions] = useState<InterestOption[]>([]);
  const [selectedInterestIds, setSelectedInterestIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    getInterests()
      .then(options => {
        if (!active) return;
        const sortedOptions = [...options].sort((a, b) => a.sort_order - b.sort_order);
        setInterestOptions(sortedOptions);
        const existingNames = user?.interests ?? [];
        setSelectedInterestIds(sortedOptions
          .filter(option => existingNames.includes(option.name))
          .map(option => option.id));
      })
      .catch(error => {
        if (!active) return;
        setLoadError(error instanceof Error ? error.message : '兴趣列表加载失败，请重试。');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [reloadKey, user?.interests]);

  const selectedCount = selectedInterestIds.length;
  const minSelection = Math.min(MIN_SELECTION, interestOptions.length || MIN_SELECTION);
  const maxSelection = Math.min(MAX_SELECTION, interestOptions.length || MAX_SELECTION);

  const canContinue =
    selectedCount >= minSelection &&
    selectedCount <= maxSelection &&
    interestOptions.length > 0 &&
    !submitting &&
    !loading &&
    !loadError;

  // 切换兴趣标签
  function toggleInterest(id: number) {
    setSelectedInterestIds(current => {
      // 已选中：取消选择
      if (current.includes(id)) {
        return current.filter(item => item !== id);
      }

      // 最多选择 5 个
      if (current.length >= maxSelection) {
        return current;
      }

      // 添加标签
      return [...current, id];
    });
  }

  // 提交兴趣设置
  async function handleComplete() {
    if (!canContinue) return;

    try {
      setSubmitting(true);

      await updateMyInterests({ interest_ids: selectedInterestIds });
      completeInterests(interestOptions
        .filter(option => selectedInterestIds.includes(option.id))
        .map(option => option.name));

      // 根据角色数量决定下一步
      if (roles.length > 1) {
        router.replace('/(auth)/role-select');
      } else {
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('保存兴趣标签失败:', error);
      Alert.alert('保存失败', error instanceof Error ? error.message : '请稍后重试。');
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
                  请选择 {minSelection}-{maxSelection} 个标签，让我们更好地了解你
                </Text>

                <View className="flex-row items-center rounded-full border border-border bg-[#F5F5F5] px-3 py-1.5">
                  <Text className="text-xs font-bold text-foreground">
                    {selectedCount}
                  </Text>

                  <Text className="text-xs text-muted-foreground">
                    /{maxSelection}
                  </Text>
                </View>
              </View>
            </View>

            {/* 兴趣标签区域 */}
            <View className="flex-row flex-wrap gap-2.5">
              {loading ? (
                <View className="w-full items-center py-10">
                  <ActivityIndicator size="small" color="#171717" />
                  <Text className="mt-3 text-sm text-muted-foreground">正在加载兴趣领域...</Text>
                </View>
              ) : loadError ? (
                <View className="w-full items-center py-8">
                  <Text className="text-sm text-destructive">{loadError}</Text>
                  <Pressable onPress={() => { setLoadError(null); setLoading(true); setReloadKey(key => key + 1); }} className="mt-3 rounded-full bg-foreground px-5 py-2.5">
                    <Text className="text-sm font-medium text-background">重试</Text>
                  </Pressable>
                </View>
              ) : interestOptions.length === 0 ? (
                <Text className="w-full py-8 text-center text-sm text-muted-foreground">暂无可选兴趣领域</Text>
              ) : interestOptions.map(option => {
                const selected = selectedInterestIds.includes(option.id);

                return (
                  <Pressable
                    key={option.id}
                    accessibilityRole="checkbox"
                    accessibilityState={{
                      checked: selected,
                    }}
                    onPress={() => toggleInterest(option.id)}
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
                      {option.name}
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

              {selectedCount < minSelection && interestOptions.length > 0 && (
                <Text className="text-xs text-muted-foreground">
                  还需选择 {minSelection - selectedCount} 个
                </Text>
              )}

              {selectedCount >= minSelection &&
                selectedCount <= maxSelection && interestOptions.length > 0 && (
                  <Text className="text-xs font-medium text-foreground">
                    已满足推荐要求
                  </Text>
                )}

              {selectedCount > maxSelection && (
                <Text className="text-xs text-destructive">
                  请减少 {selectedCount - maxSelection} 个标签
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
