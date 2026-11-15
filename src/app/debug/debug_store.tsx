
import { useCallback, useEffect, useState } from 'react';

import {
    Alert,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

import { useAuth } from '@/store/AuthContext';

const TOKEN_KEY = 'access_token';
const SESSION_KEY = 'auth_session';

interface StorageData {
  token: string | null;
  session: string | null;
}

interface SessionInfo {
  user?: {
    id?: string;
    nickname?: string;
    profileCompleted?: boolean;
    interestsCompleted?: boolean;
    interests?: string[];
  };
  roles?: {
    id: string;
    name: string;
    description?: string;
  }[];
  currentRoleId?: string | null;
}

export default function StorageDebugPage() {
  const { logout } = useAuth();

  const [data, setData] = useState<StorageData>({
    token: null,
    session: null,
  });

  const [loading, setLoading] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [expanded, setExpanded] = useState(true);

  // 读取 SecureStore
  const loadStorage = useCallback(async () => {
    setLoading(true);

    try {
      const [token, session] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(SESSION_KEY),
      ]);

      setData({ token, session });
    } catch (error) {
      console.error('读取 SecureStore 失败:', error);
      Alert.alert('错误', '读取本地存储失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStorage();
  }, [loadStorage]);

  // 解析 Session
  const sessionInfo: SessionInfo | null = (() => {
    try {
      return data.session ? JSON.parse(data.session) : null;
    } catch {
      return null;
    }
  })();

  // JSON 格式化
  const formatJSON = (value: string | null) => {
    if (!value) return '暂无数据';

    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  };

  // 删除指定 Key
  const deleteItem = (key: string, title: string) => {
    Alert.alert(
      '删除确认',
      `确定删除 ${title} 吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              await SecureStore.deleteItemAsync(key);
              await loadStorage();
            } catch {
              Alert.alert('错误', '删除失败');
            }
          },
        },
      ],
    );
  };

  // 清空全部认证数据
  const clearAll = () => {
    Alert.alert(
      '清空全部数据',
      '确定退出登录并清空所有认证信息吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确认清空',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);

            try {
              await logout();

              setData({
                token: null,
                session: null,
              });

              setShowToken(false);
              setExpanded(true);

              Alert.alert('完成', '认证信息已清空');
            } catch (error) {
              console.error(error);
              Alert.alert('错误', '清空失败');
              await loadStorage();
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  // 状态标签
  const StatusTag = ({ exists }: { exists: boolean }) => (
    <View
      className={`rounded-md px-2.5 py-1 ${
        exists ? 'bg-emerald-100' : 'bg-neutral-100'
      }`}
    >
      <Text
        className={`text-xs font-semibold ${
          exists ? 'text-emerald-700' : 'text-neutral-400'
        }`}
      >
        {exists ? '已存储' : '不存在'}
      </Text>
    </View>
  );

  // 信息行
  const InfoRow = ({
    label,
    value,
  }: {
    label: string;
    value: string;
  }) => (
    <View className="min-h-11 flex-row items-center justify-between border-b border-neutral-100">
      <Text className="text-sm text-neutral-400">{label}</Text>
      <Text className="max-w-[65%] text-right text-sm font-semibold text-neutral-700">
        {value}
      </Text>
    </View>
  );

  // 操作按钮
  const ActionButton = ({
    title,
    icon,
    onPress,
    danger = false,
    disabled = false,
  }: {
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    danger?: boolean;
    disabled?: boolean;
  }) => (
    <TouchableOpacity
      className="flex-row items-center gap-1.5 rounded-lg px-3 py-2 active:bg-neutral-100"
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Ionicons
        name={icon}
        size={16}
        color={danger ? '#EF4444' : '#2563EB'}
      />
      <Text
        className={`text-xs font-semibold ${
          danger ? 'text-red-500' : 'text-blue-600'
        } ${disabled ? 'opacity-40' : ''}`}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-neutral-50">
      <Stack.Screen
        options={{
          title: '本地存储调试',
          headerShown: true,
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerTintColor: '#111827',
          headerTitleStyle: { fontWeight: '700' },
        }}
      />

      {/* 标题 */}
      <View className="flex-row items-center justify-between px-5 pb-5 pt-5">
        <View>
          <Text className="text-2xl font-bold text-neutral-900">
            Storage Debug
          </Text>
          <Text className="mt-1 text-xs text-neutral-400">
            SecureStore 本地存储调试
          </Text>
        </View>

        <TouchableOpacity
          className="h-11 w-11 items-center justify-center rounded-xl bg-blue-600"
          onPress={loadStorage}
          disabled={loading}
        >
          <Ionicons name="refresh" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-10"
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadStorage}
          />
        }
      >
        {/* 统计信息 */}
        <View className="mb-6 flex-row rounded-2xl bg-white p-5">
          <View className="flex-1 items-center">
            <Text className="text-2xl font-bold text-neutral-900">
              {[data.token, data.session].filter(Boolean).length}
            </Text>
            <Text className="mt-1 text-xs text-neutral-400">
              已存储项目
            </Text>
          </View>

          <View className="w-px bg-neutral-100" />

          <View className="flex-1 items-center">
            <Text className="text-2xl font-bold text-neutral-900">
              2
            </Text>
            <Text className="mt-1 text-xs text-neutral-400">
              认证存储 Key
            </Text>
          </View>
        </View>

        {/* 用户会话信息 */}
        <View className="mb-6">
          <Text className="mb-3 text-base font-bold text-neutral-800">
            用户会话信息
          </Text>

          <View className="rounded-xl bg-white px-4">
            <InfoRow label="用户 ID" value={sessionInfo?.user?.id ?? '--'} />
            <InfoRow label="用户昵称" value={sessionInfo?.user?.nickname ?? '--'} />
            <InfoRow
              label="角色数量"
              value={String(sessionInfo?.roles?.length ?? 0)}
            />
            <InfoRow
              label="当前角色"
              value={
                sessionInfo?.roles?.find(
                  role => role.id === sessionInfo.currentRoleId,
                )?.name ?? '--'
              }
            />
            <InfoRow
              label="基础资料"
              value={sessionInfo?.user?.profileCompleted ? '已完成' : '未完成'}
            />
            <InfoRow
              label="兴趣标签"
              value={sessionInfo?.user?.interestsCompleted ? '已完成' : '未完成'}
            />
          </View>
        </View>

        {/* Access Token */}
        <View className="mb-6">
          <View className="mb-3 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Ionicons name="key-outline" size={20} color="#2563EB" />
              <Text className="text-base font-bold text-neutral-800">
                Access Token
              </Text>
            </View>

            <StatusTag exists={!!data.token} />
          </View>

          <View className="rounded-xl bg-white p-4">
            <Text className="mb-3 font-mono text-xs text-neutral-400">
              {TOKEN_KEY}
            </Text>

            <Text
              selectable
              className="py-2 text-sm leading-6 text-neutral-700"
            >
              {!data.token
                ? '暂无 Token'
                : showToken
                  ? data.token
                  : '••••••••••••••••••••••••'}
            </Text>

            <View className="mt-3 flex-row justify-end border-t border-neutral-100 pt-2">
              <ActionButton
                title={showToken ? '隐藏' : '显示'}
                icon={showToken ? 'eye-off-outline' : 'eye-outline'}
                onPress={() => setShowToken(!showToken)}
                disabled={!data.token}
              />

              <ActionButton
                title="删除"
                icon="trash-outline"
                danger
                onPress={() => deleteItem(TOKEN_KEY, 'Access Token')}
                disabled={!data.token}
              />
            </View>
          </View>
        </View>

        {/* Auth Session */}
        <View className="mb-6">
          <View className="mb-3 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Ionicons
                name="person-circle-outline"
                size={21}
                color="#2563EB"
              />
              <Text className="text-base font-bold text-neutral-800">
                Auth Session
              </Text>
            </View>

            <StatusTag exists={!!data.session} />
          </View>

          <View className="rounded-xl bg-white p-4">
            <Text className="mb-3 font-mono text-xs text-neutral-400">
              {SESSION_KEY}
            </Text>

            <TouchableOpacity
              className="flex-row items-center justify-between rounded-lg bg-blue-50 px-3 py-3"
              onPress={() => setExpanded(!expanded)}
            >
              <Text className="text-sm font-semibold text-blue-600">
                {expanded ? '收起完整数据' : '查看完整数据'}
              </Text>

              <Ionicons
                name={expanded ? 'chevron-up' : 'chevron-down'}
                size={18}
                color="#2563EB"
              />
            </TouchableOpacity>

            {expanded && (
              <ScrollView
                horizontal
                nestedScrollEnabled
                className="mt-3 max-h-72 rounded-lg bg-neutral-900 p-3"
              >
                <Text
                  selectable
                  className="font-mono text-xs leading-5 text-emerald-300"
                >
                  {formatJSON(data.session)}
                </Text>
              </ScrollView>
            )}

            <View className="mt-3 flex-row justify-end border-t border-neutral-100 pt-2">
              <ActionButton
                title="删除 Session"
                icon="trash-outline"
                danger
                onPress={() => deleteItem(SESSION_KEY, 'Auth Session')}
                disabled={!data.session}
              />
            </View>
          </View>
        </View>

        {/* 清空全部 */}
        <TouchableOpacity
          className="h-12 flex-row items-center justify-center gap-2 rounded-xl bg-red-500 active:bg-red-600"
          onPress={clearAll}
          disabled={loading || (!data.token && !data.session)}
        >
          <Ionicons name="trash-outline" size={19} color="#FFFFFF" />
          <Text className="text-sm font-bold text-white">
            清空全部认证数据
          </Text>
        </TouchableOpacity>

        <View className="mt-4 flex-row items-start gap-2 px-1">
          <Ionicons
            name="information-circle-outline"
            size={16}
            color="#9CA3AF"
          />
          <Text className="flex-1 text-xs leading-5 text-neutral-400">
            清空认证数据将同时退出登录，并清除内存中的用户及角色状态。
            此功能仅建议在开发调试环境使用。
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
