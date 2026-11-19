import { Typography } from '@/constants/typography';
import { GlassScreen } from '@/components/glass-surface';
import { ContentSurface } from '@/components/content-surface';
import { BirthdayPicker } from '@/components/birthday-picker';
import { DEFAULT_AVATAR_SOURCE } from '@/constants/avatar';
import { useInputHeight } from '@/hooks/use-input-height';
import { formatDate, MIN_BIRTHDAY_YEAR, parseBirthday } from '@/utils/profile-date';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Image,
  Keyboard,
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

export default function BasicInfoScreen() {
  const inputHeight = useInputHeight();
  const { user, completeBasicInfo } = useAuth();

  const [avatar, setAvatar] = useState(user?.avatar ?? '');
  const [nickname, setNickname] = useState(user?.nickname ?? '');
  const [gender, setGender] = useState<Gender | undefined>(
    user?.gender === 'male' || user?.gender === 'female' ? user.gender : undefined
  );

  const [birthday, setBirthday] = useState(
    () => parseBirthday(user?.birthday)
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
  function handleDateConfirm(selectedDate: Date) {
    setBirthday(selectedDate);
    setShowDatePicker(false);
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

    if (gender !== 'male' && gender !== 'female') {
      nextErrors.gender = '请选择性别';
    }

    if (!birthday || Number.isNaN(birthday.getTime())) {
      nextErrors.birthday = '请选择出生日期';
    } else if (birthday.getFullYear() < MIN_BIRTHDAY_YEAR) {
      nextErrors.birthday = `出生日期不能早于${MIN_BIRTHDAY_YEAR}年`;
    } else if (birthday.getTime() > Date.now()) {
      nextErrors.birthday = '出生日期不能晚于今天';
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  // 提交资料
  async function handleNextStep() {
    if (submitting) return;
    Keyboard.dismiss();

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
    <GlassScreen>
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
                <Text dynamicTypeRamp="title1" style={Typography.title1} className="text-foreground">
                  完善个人资料
                </Text>

                <Text dynamicTypeRamp="subheadline" style={Typography.subhead} className="text-muted-foreground">
                  让我们更好地了解你
                </Text>
              </View>

              {/* 头像上传 */}
              <View className="mb-8 items-center">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="选择个人头像"
                  onPress={handleChooseAvatar}
                  className="relative"
                  style={({ pressed }) => ({ borderRadius: 48, backgroundColor: '#DBEAFE', opacity: pressed ? 0.7 : 1 })}
                >
                  <View className="h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-border" style={{ backgroundColor: '#DBEAFE' }}>
                    <Image
                      source={avatar ? { uri: avatar } : DEFAULT_AVATAR_SOURCE}
                      className="h-full w-full"
                      resizeMode="cover"
                    />
                  </View>

                  <View className="absolute bottom-0 right-0 h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-foreground">
                    <Icon
                      as={CameraIcon}
                      size="xs"
                      className="text-background"
                    />
                  </View>
                </Pressable>

                <Text dynamicTypeRamp="subheadline" style={Typography.subheadEmphasized} className="mt-3 text-foreground">
                  点击更换头像
                </Text>

                <Text dynamicTypeRamp="caption1" style={Typography.caption1} className="mt-1 text-muted-foreground">
                  支持 JPG、PNG、WebP，最大 5MB
                </Text>
              </View>

              {/* 表单 */}
              <ContentSurface className="gap-5 p-5">
                {/* 昵称 */}
                <View className="gap-2">
                  <View className="flex-row items-center justify-between">
                    <Text dynamicTypeRamp="subheadline" style={Typography.subhead} className="text-foreground">
                      姓名 / 昵称
                      <Text className="text-destructive"> *</Text>
                    </Text>

                    <Text dynamicTypeRamp="caption1" style={Typography.caption1} className="text-muted-foreground">
                      {nickname.length}/{MAX_NICKNAME_LENGTH}
                    </Text>
                  </View>

                  <TextInput style={[Typography.body, { minHeight: inputHeight }]}
                    accessibilityLabel="姓名或昵称，必填"
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
                    placeholderTextColor="#6B6B6B"
                    maxLength={MAX_NICKNAME_LENGTH}
                    returnKeyType="done"
                    className={`min-h-12 rounded-xl border bg-white px-3.5 py-3 text-foreground ${ errors.nickname ? 'border-destructive' : 'border-[#8E8E93]' }`}
                  />

                  {errors.nickname && (
                    <Text dynamicTypeRamp="footnote" style={Typography.footnote} className="text-destructive">
                      {errors.nickname}
                    </Text>
                  )}
                </View>

                {/* 性别 */}
                <View className="gap-2">
                  <Text dynamicTypeRamp="subheadline" style={Typography.subhead} className="text-foreground">
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
                          className={`min-h-12 py-3 flex-1 flex-row items-center justify-center gap-2 rounded-xl border ${ selected ? 'border-foreground bg-foreground' : 'border-border bg-[#F5F5F5]' }`}
                        >
                          <Text dynamicTypeRamp="title3" style={Typography.title3}
                            className={`${ selected ? 'text-background' : 'text-foreground' }`}
                          >
                            {item.symbol}
                          </Text>

                          <Text dynamicTypeRamp="body" style={Typography.body}
                            className={`${ selected ? 'text-background' : 'text-foreground' }`}
                          >
                            {item.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  {errors.gender && (
                    <Text dynamicTypeRamp="footnote" style={Typography.footnote} accessibilityLiveRegion="polite" className="text-destructive">
                      {errors.gender}
                    </Text>
                  )}
                </View>

                {/* 出生日期 */}
                <View className="gap-2">
                  <Text dynamicTypeRamp="subheadline" style={Typography.subhead} className="text-foreground">
                    出生日期
                    <Text className="text-destructive"> *</Text>
                  </Text>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={birthday ? `出生日期：${formatDate(birthday)}` : '选择出生日期'}
                    onPress={() => { Keyboard.dismiss(); setShowDatePicker(true); }}
                    style={{ minHeight: inputHeight }}
                    className={`min-h-12 py-3 flex-row items-center justify-between rounded-xl border bg-white px-3.5 ${ errors.birthday ? 'border-destructive' : 'border-[#8E8E93]' }`}
                  >
                    <Text dynamicTypeRamp="body" style={Typography.body}
                      className={`${ birthday ? 'text-foreground' : 'text-muted-foreground' }`}
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
                    <Text dynamicTypeRamp="footnote" style={Typography.footnote} accessibilityLiveRegion="polite" className="text-destructive">
                      {errors.birthday}
                    </Text>
                  )}

                </View>
              </ContentSurface>
            </ScrollView>

            {/* 底部按钮 */}
            <ContentSurface className="p-3" style={{ marginHorizontal: 16, marginBottom: 12, borderRadius: 38 }}>
              <Button
                className="min-h-[52px] w-full rounded-full py-3 bg-[#171717]"
                onPress={handleNextStep}
                isDisabled={submitting}
              >
                <ButtonText dynamicTypeRamp="headline" style={Typography.headline} className="text-white">
                  {submitting ? '保存中...' : '下一步 →'}
                </ButtonText>
              </Button>
            </ContentSurface>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
      {showDatePicker && (
        <BirthdayPicker value={birthday} onConfirm={handleDateConfirm} onClose={() => setShowDatePicker(false)} />
      )}
    </GlassScreen>
  );
}
