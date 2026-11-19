import { Typography } from '@/constants/typography';
import { GlassScreen } from '@/components/glass-surface';
import { ContentSurface } from '@/components/content-surface';
import { useAuth } from '@/store/AuthContext';
import { loginWithPhoneCode, sendPhoneCode } from '@/services/authService';
import { router } from 'expo-router';
import { useInputHeight } from '@/hooks/use-input-height';

import { useEffect, useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View, useWindowDimensions, type TextInputInstance } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';

import { Button, ButtonText } from '@/components/ui/button';
import { Checkbox, CheckboxIcon, CheckboxIndicator } from '@/components/ui/checkbox';
import { ArrowRightIcon, CheckIcon, CloseCircleIcon, HelpCircleIcon, Icon } from '@/components/ui/icon';
import { Input, InputField } from '@/components/ui/input';
import { Modal, ModalBackdrop, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@/components/ui/modal';
import { BrandLogo } from '@/components/brand-logo';

const CODE_LENGTH = 6;
const POLICIES = ['用户协议', '隐私政策', '登录政策'] as const;
type Feedback = { message: string; field?: 'phone' | 'code' | 'agreement'; error?: boolean };

export default function LoginScreen() {
  const inputHeight = useInputHeight();
  const { fontScale, width } = useWindowDimensions();
  const stackedCodeButton = fontScale >= 1.5 || width < 360;
  const phoneInput = useRef<TextInputInstance>(null);
  const codeInput = useRef<TextInputInstance>(null);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [requestedPhone, setRequestedPhone] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [sendingCode, setSendingCode] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>();
  const [dialog, setDialog] = useState<{ title: string; message: string }>();
  const { login } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const phoneValid = /^1[3-9]\d{9}$/.test(phone);
  const codeRequested = phone === requestedPhone && phoneValid;

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => {
      setSecondsLeft(current => Math.max(current - 1, 0));
    }, 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  function validatePhone() {
    if (phoneValid) return true;
    setFeedback({ message: '请输入有效的中国大陆手机号码', field: 'phone', error: true });
    phoneInput.current?.focus();
    return false;
  }

  async function requestCode() {
    if (!validatePhone() || sendingCode || secondsLeft > 0) return;
    try {
      setSendingCode(true);
      setFeedback(undefined);
      const response = await sendPhoneCode({ phone });
      setRequestedPhone(phone);
      setCode('');
      setSecondsLeft(response.expires_in);
      setFeedback({ message: response.message });
      codeInput.current?.focus();
    } catch (error) {
      setFeedback({
        message: error instanceof Error ? error.message : '验证码发送失败，请稍后重试',
        field: 'code',
        error: true,
      });
    } finally {
      setSendingCode(false);
    }
  }

  async function submit() {
    if (submitting) return;

    // 1. 检查协议
    if (!agreed) {
      Keyboard.dismiss();
      setFeedback({
        message: '请先阅读并同意用户协议、隐私政策及登录政策',
        field: 'agreement',
        error: true,
      });
      return;
    }

    // 2. 检查手机号
    if (!validatePhone()) return;

    // 3. 检查验证码请求状态
    if (!codeRequested || code.length !== CODE_LENGTH) {
      setFeedback({
        message: codeRequested
          ? '请输入6位短信验证码'
          : '请先获取验证码',
        field: 'code',
        error: true,
      });

      codeInput.current?.focus();
      return;
    }

    try {
      Keyboard.dismiss();
      setSubmitting(true);
      setFeedback(undefined);

      const response = await loginWithPhoneCode({ phone, code });
      await login({
        token: response.access_token,
        user: {
          id: String(response.user.id),
          nickname: response.user.display_name ?? `用户${phone.slice(-4)}`,
          avatar: response.user.avatar_url ?? '',
          profileCompleted: response.onboarding_completed,
          interestsCompleted: response.onboarding_completed,
          interests: [],
        },
        roles: [],
      });

      router.replace(response.onboarding_completed ? '/(tabs)' : '/(auth)/basic-info');

    } catch (error) {
      console.error('登录失败:', error);

      setFeedback({
        message: error instanceof Error ? error.message : '登录失败，请稍后重试',
        error: true,
      });
    } finally {
      setSubmitting(false);
    }
  }

  function showHelp() {
    setDialog({
      title: '登录帮助',
      message: '请确认手机号码填写正确后获取短信验证码。如未收到，请检查短信拦截设置，并在倒计时结束后重试。',
    });
  }

  function changePhone(value: string) {
    setPhone(value.replace(/\D/g, '').slice(0, 11));
    setCode('');
    setRequestedPhone('');
    setSecondsLeft(0);
    setFeedback(undefined);
  }

  const codeRequestButton = (
    <Button className="min-h-11 shrink-0 rounded-lg px-3 py-2" isDisabled={sendingCode || secondsLeft > 0} onPress={requestCode} variant="secondary">
      <ButtonText dynamicTypeRamp="footnote" style={Typography.footnoteEmphasized}>{sendingCode ? '发送中...' : secondsLeft > 0 ? `${secondsLeft}s 后重试` : '获取验证码'}</ButtonText>
    </Button>
  );

  return (
    <GlassScreen>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : Platform.OS === 'android' ? 'height' : undefined}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false}>
            <View className="w-full max-w-[440px] flex-1 self-center justify-between px-5 pb-8" style={{ minHeight: 620 }}>
              <View className="h-11 flex-row items-center justify-end">
                <Button className="min-h-11 gap-1 px-0" variant="link" onPress={showHelp}>
                  <Icon as={HelpCircleIcon} size="sm" className="text-muted-foreground" />
                  <ButtonText dynamicTypeRamp="subheadline" style={Typography.subheadEmphasized} className="text-muted-foreground">遇到问题</ButtonText>
                </Button>
              </View>

              <View className="items-center py-4">
                <View className="mb-4"><BrandLogo /></View>
                <Text dynamicTypeRamp="title1" style={Typography.title1} accessibilityRole="header" className="mb-1 text-foreground">美刻</Text>
                <Text dynamicTypeRamp="subheadline" style={Typography.subhead} className="text-muted-foreground">尽享精彩生活</Text>
              </View>

              <ContentSurface className="gap-4 p-5" style={{ borderRadius: 28 }}>
                <View className="gap-1">
                  <Text dynamicTypeRamp="subheadline" style={Typography.subhead} className="text-muted-foreground">手机号码</Text>
                  <Input style={{ height: inputHeight }} className="gap-0 rounded-2xl px-0 shadow-none" isInvalid={feedback?.field === 'phone'}>
                    <Button accessibilityLabel="国家或地区：中国大陆 +86" className="h-full gap-1 rounded-r-none pl-3 pr-2" variant="ghost" onPress={() => setDialog({ title: '国家或地区', message: '中国大陆（+86）\n\n目前仅支持中国大陆手机号码登录。' })}>
                      <ButtonText dynamicTypeRamp="body" style={Typography.body}>+86</ButtonText>
                      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#616161" strokeWidth={2} accessible={false}><Path d="m7 10 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" /></Svg>
                    </Button>
                    <View className="h-5 w-px bg-border" />
                    <InputField style={Typography.body}
                      // The creator infers props as the ref type, but forwards a native TextInput.
                      ref={(input) => { phoneInput.current = input as unknown as TextInputInstance | null; }}
                      accessibilityLabel="手机号码，中国大陆 +86"
                      autoComplete="tel-national"
                      className="min-w-0 px-3 placeholder:text-[#6B6B6B]"
                      keyboardType="phone-pad"
                      maxLength={11}
                      onChangeText={changePhone}
                      placeholder="请输入手机号码"
                      value={phone}
                    />
                    {phone.length > 0 && (
                      <Button accessibilityLabel="清除手机号码" className="h-full min-w-11 px-3" variant="ghost" onPress={() => { changePhone(''); phoneInput.current?.focus(); }}>
                        <Icon as={CloseCircleIcon} size="md" className="text-[#6B6B6B]" />
                      </Button>
                    )}
                  </Input>
                </View>

                <View className="gap-1">
                  <View className="flex-row flex-wrap items-center justify-between gap-x-2">
                    <Text dynamicTypeRamp="subheadline" style={Typography.subhead} className="text-muted-foreground">短信验证码</Text>
                    <Button variant="link" onPress={showHelp} className="min-h-11 px-0 py-2">
                      <ButtonText dynamicTypeRamp="footnote" style={Typography.footnoteEmphasized} className="text-muted-foreground">收不到验证码？</ButtonText>
                    </Button>
                  </View>
                  <Input style={{ height: inputHeight }} className="gap-0 rounded-2xl pl-3 pr-1 shadow-none" isInvalid={feedback?.field === 'code'}>
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth={1.8} accessible={false}>
                      <Path d="M12 3 3.5 6.5V12c0 5 4.5 8 8.5 9 4-1 8.5-4 8.5-9V6.5L12 3Z" strokeLinejoin="round" />
                      <Rect x={8.5} y={10} width={7} height={6} rx={1.5} /><Path d="M10 10V8a2 2 0 0 1 4 0v2" />
                    </Svg>
                    <InputField style={Typography.body}
                      ref={(input) => { codeInput.current = input as unknown as TextInputInstance | null; }}
                      accessibilityLabel="短信验证码"
                      autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
                      className="min-w-0 px-2 placeholder:text-[#6B6B6B]"
                      keyboardType="number-pad"
                      maxLength={CODE_LENGTH}
                      onChangeText={(value) => {
                        setCode(value.replace(/\D/g, '').slice(0, CODE_LENGTH));
                        setFeedback(undefined);
                      }}
                      onSubmitEditing={submit}
                      placeholder="请输入6位验证码"
                      value={code}
                    />
                    {!stackedCodeButton && codeRequestButton}
                  </Input>
                  {stackedCodeButton && codeRequestButton}
                </View>

                <Button
                  className="mt-2 min-h-[52px] w-full rounded-full py-3 shadow-sm"
                  onPress={submit}
                  isDisabled={submitting || code.length !== CODE_LENGTH}
                >
                  <ButtonText dynamicTypeRamp="headline" style={Typography.headline}>
                    {submitting ? '登录中...' : '立即登录'}
                  </ButtonText>

                  {!submitting && (
                    <Icon
                      as={ArrowRightIcon}
                      size="md"
                      className="text-primary-foreground"
                    />
                  )}
                </Button>
                {feedback && feedback.field !== 'agreement' && (
                  <Text dynamicTypeRamp="footnote" style={Typography.footnote} accessibilityLiveRegion="polite" className={feedback.error ? 'text-destructive' : 'text-muted-foreground'}>{feedback.message}</Text>
                )}
              </ContentSurface>

              <View className="mt-8 items-center gap-3 px-2 pb-3 pt-4">
                <View className="flex-row items-start justify-center gap-2">
                  <Checkbox accessibilityLabel="我已阅读并同意用户协议、隐私政策及登录政策" className="min-h-11 min-w-11 items-center justify-center" isInvalid={feedback?.field === 'agreement'} isChecked={agreed} value="agreement" onChange={(checked) => { setAgreed(checked); if (feedback?.field === 'agreement') setFeedback(undefined); }}>
                    <CheckboxIndicator className="shadow-none"><CheckboxIcon as={CheckIcon} /></CheckboxIndicator>
                  </Checkbox>
                  <View className="min-w-0 flex-1">
                    <Text dynamicTypeRamp="footnote" style={Typography.footnote} className="min-h-11 py-3 text-muted-foreground">我已阅读并同意</Text>
                    <View className="flex-row flex-wrap gap-x-2">
                      {POLICIES.map(policy => (
                        <Pressable key={policy} accessibilityRole="button" accessibilityLabel={`查看${policy}`} className="min-h-11 justify-center py-2 active:opacity-60" onPress={() => setDialog({ title: policy, message: `当前为登录页面演示，正式《${policy}》尚未配置。上线前需接入完整的政策正文。` })}>
                          <Text dynamicTypeRamp="footnote" style={Typography.footnoteEmphasized} className="text-foreground underline">《{policy}》</Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                </View>
                {feedback?.field === 'agreement' && <Text dynamicTypeRamp="footnote" style={Typography.footnote} accessibilityLiveRegion="polite" className="text-center text-destructive">{feedback.message}</Text>}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <Modal isOpen={!!dialog} onClose={() => setDialog(undefined)} size="sm">
        <ModalBackdrop />
        <ModalContent className="w-[90%] max-w-[360px] rounded-2xl">
          <ModalHeader><Text dynamicTypeRamp="headline" style={Typography.headline} accessibilityRole="header" className="text-foreground">{dialog?.title}</Text></ModalHeader>
          <ModalBody><Text dynamicTypeRamp="body" style={Typography.body} className="text-muted-foreground">{dialog?.message}</Text></ModalBody>
          <ModalFooter><Button className="min-h-11" onPress={() => setDialog(undefined)}><ButtonText dynamicTypeRamp="headline" style={Typography.headline}>我知道了</ButtonText></Button></ModalFooter>
        </ModalContent>
      </Modal>
    </GlassScreen>
  );
}
