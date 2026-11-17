import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, ButtonText } from '@/components/ui/button';
import { CalendarDaysIcon, CameraIcon, Icon } from '@/components/ui/icon';
import { useAuth } from '@/store/AuthContext';
import { updateMyProfile } from '@/services/userService';

type Gender = 'male' | 'female';

const MAX_NICKNAME_LENGTH = 20;
const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export default function BasicInfoScreen() {
  const { user, completeBasicInfo } = useAuth();

  const [avatar, setAvatar] = useState(user?.avatar ?? '');
  const [nickname, setNickname] = useState(user?.nickname ?? '');
  const [gender, setGender] = useState<Gender | undefined>(
    user?.gender
  );

  const [birthday, setBirthday] = useState(
    user?.birthday ? new Date(user.birthday) : undefined
  );

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    nickname?: string;
    gender?: string;
    birthday?: string;
  }>({});

  // 选择头像
  async function handleChooseAvatar() {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert('需要相册权限', '请允许应用访问相册，以便选择头像。');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const asset = result.assets[0];

      if (asset.fileSize && asset.fileSize > MAX_AVATAR_SIZE) {
        Alert.alert('图片过大', '请选择小于 5MB 的图片。');
        return;
      }

      setAvatar(asset.uri);
    } catch (error) {
      console.error('选择头像失败:', error);
      Alert.alert('操作失败', '暂时无法选择头像，请重试。');
    }
  }

  // 选择出生日期
  function handleDateChange(
    event: { type: string },
    selectedDate?: Date
  ) {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (event.type === 'dismissed' || !selectedDate) {
      return;
    }

    setBirthday(selectedDate);
    setErrors(prev => ({
      ...prev,
      birthday: undefined,
    }));
  }

  // 性别选择
  function handleSelectGender(value: Gender) {
    setGender(value);

    setErrors(prev => ({
      ...prev,
      gender: undefined,
    }));
  }

  // 表单验证
  function validateForm() {
    const nextErrors: typeof errors = {};

    if (!nickname.trim()) {
      nextErrors.nickname = '请输入姓名或昵称';
    } else if (nickname.trim().length > MAX_NICKNAME_LENGTH) {
      nextErrors.nickname = '昵称最多20个字符';
    }

    if (!gender) {
      nextErrors.gender = '请选择性别';
    }

    if (!birthday) {
      nextErrors.birthday = '请选择出生日期';
    } else if (birthday.getTime() > Date.now()) {
      nextErrors.birthday = '出生日期不能晚于今天';
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  // 提交资料
  async function handleNextStep() {
    if (submitting) return;

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      await updateMyProfile({
        display_name: nickname.trim(),
        sex: gender === 'male' ? 1 : 2,
        birth_date: formatDate(birthday!),
      });

      completeBasicInfo({
        nickname: nickname.trim(),
        avatar,
        gender,
        birthday: birthday ? formatDate(birthday) : undefined,
      });

      router.replace('/(auth)/interests');
    } catch (error) {
      console.error('保存基础资料失败:', error);
      Alert.alert('保存失败', error instanceof Error ? error.message : '请稍后重试。');
      setSubmitting(false);
    }
  }

  return (
    <View className="flex-1 bg-background" style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={{ flex: 1 }}>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{
                flexGrow: 1,
                paddingHorizontal: 20,
                paddingBottom: 24,
              }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* 顶部区域 */}
              <View className="h-11" />

              {/* 页面标题 */}
              <View className="mb-7 gap-1.5">
                <Text className="text-2xl font-bold tracking-tight text-foreground">
                  完善个人资料
                </Text>

                <Text className="text-sm leading-5 text-muted-foreground">
                  完善资料，让我们更好地了解你
                </Text>
              </View>

              {/* 头像上传 */}
              <View className="mb-8 items-center">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="选择个人头像"
                  onPress={handleChooseAvatar}
                  className="relative"
                >
                  <View className="h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-border bg-background">
                    {avatar ? (
                      <Image
                        source={{ uri: avatar }}
                        className="h-full w-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <Text className="text-5xl text-muted-foreground">
                        ◉
                      </Text>
                    )}
                  </View>

                  <View className="absolute bottom-0 right-0 h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-foreground">
                    <Icon
                      as={CameraIcon}
                      size="xs"
                      className="text-background"
                    />
                  </View>
                </Pressable>

                <Text className="mt-3 text-sm font-semibold text-foreground">
                  点击上传真实头像
                </Text>

                <Text className="mt-1 text-xs text-muted-foreground">
                  支持 JPG、PNG、WebP，最大 5MB
                </Text>
              </View>

              {/* 表单 */}
              <View className="gap-5">
                {/* 昵称 */}
                <View className="gap-2">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm font-medium text-foreground">
                      姓名 / 昵称
                      <Text className="text-destructive"> *</Text>
                    </Text>

                    <Text className="text-xs text-muted-foreground">
                      {nickname.length}/{MAX_NICKNAME_LENGTH}
                    </Text>
                  </View>

                  <TextInput
                    value={nickname}
                    onChangeText={value => {
                      setNickname(
                        value.slice(0, MAX_NICKNAME_LENGTH)
                      );

                      setErrors(prev => ({
                        ...prev,
                        nickname: undefined,
                      }));
                    }}
                    placeholder="请输入你的名字或好记的昵称"
                    placeholderTextColor="#A3A3A3"
                    maxLength={MAX_NICKNAME_LENGTH}
                    returnKeyType="done"
                    className={`h-12 rounded-xl border bg-white px-3.5 text-sm text-foreground ${
                      errors.nickname
                        ? 'border-destructive'
                        : 'border-border'
                    }`}
                  />

                  {errors.nickname && (
                    <Text className="text-xs text-destructive">
                      {errors.nickname}
                    </Text>
                  )}
                </View>

                {/* 性别 */}
                <View className="gap-2">
                  <Text className="text-sm font-medium text-foreground">
                    性别
                    <Text className="text-destructive"> *</Text>
                  </Text>

                  <View className="flex-row gap-3">
                    {([
                      { value: 'male', label: '男', symbol: '♂' },
                      { value: 'female', label: '女', symbol: '♀' },
                    ] as const).map(item => {
                      const selected = gender === item.value;

                      return (
                        <Pressable
                          key={item.value}
                          accessibilityRole="radio"
                          accessibilityState={{ checked: selected }}
                          onPress={() => handleSelectGender(item.value)}
                          className={`h-12 flex-1 flex-row items-center justify-center gap-2 rounded-xl border ${
                            selected
                              ? 'border-foreground bg-foreground'
                              : 'border-border bg-[#F5F5F5]'
                          }`}
                        >
                          <Text
                            className={`text-lg ${
                              selected
                                ? 'text-background'
                                : 'text-foreground'
                            }`}
                          >
                            {item.symbol}
                          </Text>

                          <Text
                            className={`text-sm font-medium ${
                              selected
                                ? 'text-background'
                                : 'text-foreground'
                            }`}
                          >
                            {item.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  {errors.gender && (
                    <Text className="text-xs text-destructive">
                      {errors.gender}
                    </Text>
                  )}
                </View>

                {/* 出生日期 */}
                <View className="gap-2">
                  <Text className="text-sm font-medium text-foreground">
                    出生日期
                    <Text className="text-destructive"> *</Text>
                  </Text>

                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setShowDatePicker(true)}
                    className={`h-12 flex-row items-center justify-between rounded-xl border bg-white px-3.5 ${
                      errors.birthday
                        ? 'border-destructive'
                        : 'border-border'
                    }`}
                  >
                    <Text
                      className={`text-sm ${
                        birthday
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {birthday
                        ? formatDate(birthday)
                        : '请选择出生日期'}
                    </Text>

                    <Icon
                      as={CalendarDaysIcon}
                      size="sm"
                      className="text-muted-foreground"
                    />
                  </Pressable>

                  {errors.birthday && (
                    <Text className="text-xs text-destructive">
                      {errors.birthday}
                    </Text>
                  )}

                  {showDatePicker && (
                    <DateTimePicker
                      value={birthday ?? new Date(1998, 5, 15)}
                      mode="date"
                      display={
                        Platform.OS === 'ios' ? 'spinner' : 'default'
                      }
                      maximumDate={new Date()}
                      minimumDate={new Date(1900, 0, 1)}
                      onChange={handleDateChange}
                    />
                  )}

                  {Platform.OS === 'ios' && showDatePicker && (
                    <Pressable
                      onPress={() => setShowDatePicker(false)}
                      className="self-end rounded-lg bg-foreground px-5 py-2"
                    >
                      <Text className="text-sm font-medium text-background">
                        确定
                      </Text>
                    </Pressable>
                  )}
                </View>
              </View>
            </ScrollView>

            {/* 底部按钮 */}
            <View className="px-5 pb-5 pt-3">
              <Button
                className="h-[52px] w-full rounded-full bg-[#171717]"
                onPress={handleNextStep}
                isDisabled={submitting}
              >
                <ButtonText className="text-base font-semibold text-white">
                  {submitting ? '保存中...' : '下一步 →'}
                </ButtonText>
              </Button>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
