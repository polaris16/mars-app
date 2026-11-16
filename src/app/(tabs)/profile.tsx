

import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function ProfileScreen() {
  return (
    <ScrollView
      className="flex-1 bg-neutral-50"
      contentContainerClassName="flex-grow p-5"
    >
      {/* 页面标题 */}
      <View className="mb-6">
        <Text className="text-2xl font-bold text-neutral-900">
          我的
        </Text>
        <Text className="mt-1 text-sm text-neutral-400">
          个人中心
        </Text>
      </View>

      {/* 个人信息区域 */}
      <View className="mb-6 items-center rounded-2xl border border-neutral-200 bg-white p-6">
        <View className="h-20 w-20 items-center justify-center rounded-full bg-blue-50">
          <Ionicons
            name="person"
            size={38}
            color="#2563EB"
          />
        </View>

        <Text className="mt-3 text-base font-bold text-neutral-800">
          个人中心
        </Text>

        <Text className="mt-1 text-xs text-neutral-400">
          管理个人信息及应用设置
        </Text>
      </View>

      <TouchableOpacity
        className="mb-6 flex-row items-center rounded-xl border border-neutral-200 bg-white p-4 active:bg-neutral-100"
        activeOpacity={0.7}
        onPress={() => router.push('/recorder/list')}
      >
        <View className="h-11 w-11 items-center justify-center rounded-xl bg-neutral-100">
          <Ionicons name="mic-outline" size={22} color="#171717" />
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-sm font-semibold text-neutral-800">我的录音</Text>
          <Text className="mt-1 text-xs text-neutral-400">查看和管理已完成的录音</Text>
        </View>
        <Ionicons name="chevron-forward" size={19} color="#9CA3AF" />
      </TouchableOpacity>

      {/* 开发调试区域 */}
      {__DEV__ && (
        <View className="mb-6">
          <Text className="mb-3 text-sm font-bold text-neutral-500">
            开发调试
          </Text>

          <TouchableOpacity
            className="flex-row items-center rounded-xl border border-neutral-200 bg-white p-4 active:bg-neutral-100"
            activeOpacity={0.7}
            onPress={() => router.push('/debug/debug_store')}
          >
            <View className="h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
              <Ionicons
                name="server-outline"
                size={22}
                color="#2563EB"
              />
            </View>

            <View className="ml-3 flex-1">
              <Text className="text-sm font-semibold text-neutral-800">
                本地存储调试
              </Text>

              <Text className="mt-1 text-xs text-neutral-400">
                查看 SecureStore 数据及清理存储
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={19}
              color="#9CA3AF"
            />
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}
