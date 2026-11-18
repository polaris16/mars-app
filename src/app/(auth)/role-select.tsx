import { Typography } from '@/constants/typography';
import { GlassScreen, GlassSurface, GlassPressable } from '@/components/glass-surface';
import { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { Button, ButtonText } from '@/components/ui/button';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  Icon,
} from '@/components/ui/icon';
import { useAuth } from '@/store/AuthContext';

export default function RoleSelectScreen() {
  const {
    roles,
    currentRole,
    selectRole,
  } = useAuth();

  const [selectedRoleId, setSelectedRoleId] = useState(
    currentRole?.id ?? roles[0]?.id ?? '',
  );

  const [submitting, setSubmitting] = useState(false);

  // 角色列表或当前角色发生变化时，更新默认选中项
  useEffect(() => {
    if (currentRole?.id) {
      setSelectedRoleId(currentRole.id);
    } else if (roles.length > 0) {
      setSelectedRoleId(roles[0].id);
    }
  }, [currentRole?.id, roles]);

  const selectedRole = roles.find(
    (role) => role.id === selectedRoleId,
  );

  const canContinue = Boolean(selectedRole) && !submitting;

  const handleSelectRole = (roleId: string) => {
    if (submitting) return;
    setSelectedRoleId(roleId);
  };

  const handleBack = () => {
    router.back();
  };

  const handleConfirm = () => {
    if (!selectedRole || submitting) return;

    setSubmitting(true);

    selectRole(selectedRole);

    router.replace('/(tabs)');
  };

  return (
    <GlassScreen
      style={{ flex: 1, backgroundColor: '#FFFFFF' }}
    >
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
              paddingTop: 20,
              paddingBottom: 32,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* 标题区域 */}
            <View className="mb-8">
              <Text dynamicTypeRamp="title1" style={Typography.title1} className="mb-3 text-foreground">
                选择你的角色
              </Text>

              <Text dynamicTypeRamp="subheadline" style={Typography.subhead} className="text-muted-foreground">
                根据你的使用需求，选择一个适合自己的角色，
                为你提供更精准的内容和服务。
              </Text>
            </View>

            {/* 角色列表 */}
            <View className="gap-3">
              {roles.map((role) => {
                const isSelected = selectedRoleId === role.id;

                return (
                  <GlassPressable
                    key={role.id}
                    accessibilityRole="radio"
                    accessibilityState={{
                      selected: isSelected,
                    }}
                    onPress={() => handleSelectRole(role.id)}
                    surfaceStyle={{ borderColor: isSelected ? '#171717' : '#FFFFFF', borderRadius: 24 }}
                    surfaceClassName="p-5"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="mr-4 flex-1">
                        <Text dynamicTypeRamp="headline" style={Typography.headline} className="mb-2 text-foreground">
                          {role.name}
                        </Text>

                        <Text dynamicTypeRamp="subheadline" style={Typography.subhead} className="text-muted-foreground">
                          {role.description || '根据该角色提供个性化服务'}
                        </Text>
                      </View>

                      {/* 选择状态 */}
                      <View
                        className={`h-5 w-5 items-center justify-center rounded-full border ${ isSelected ? 'border-[#171717] bg-[#171717]' : 'border-[#D4D4D4] bg-background' }`}
                      >
                        {isSelected && (
                          <View className="h-2 w-2 rounded-full bg-white" />
                        )}
                      </View>
                    </View>
                  </GlassPressable>
                );
              })}

              {roles.length === 0 && (
                <View className="items-center rounded-2xl border border-border px-5 py-10">
                  <Text dynamicTypeRamp="subheadline" style={Typography.subhead} className="text-muted-foreground">
                    暂无可选角色，请稍后重试
                  </Text>
                </View>
              )}
            </View>

            {/* 选择提示 */}
            {selectedRole && (
              <View className="mt-6">
                <Text dynamicTypeRamp="subheadline" style={Typography.subhead} className="text-muted-foreground">
                  当前选择：
                  <Text className="font-medium text-foreground">
                    {selectedRole.name}
                  </Text>
                </Text>
              </View>
            )}
          </ScrollView>

          {/* 底部固定按钮 */}
          <GlassSurface className="p-3" style={{ marginHorizontal: 16, marginBottom: 12, borderRadius: 38 }}>
            <Button
              className="min-h-[52px] w-full rounded-full py-3 bg-[#171717]"
              onPress={handleConfirm}
              isDisabled={!canContinue}
            >
              <ButtonText dynamicTypeRamp="headline" style={Typography.headline} className="text-white">
                {submitting ? '正在进入...' : '确认并进入'}
              </ButtonText>

              {!submitting && (
                <Icon
                  as={ArrowRightIcon}
                  size="md"
                  className="text-white"
                />
              )}
            </Button>
          </GlassSurface>

        </View>
      </SafeAreaView>
    </GlassScreen>
  );
}
