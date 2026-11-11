import { useEffect, useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, Text, View, type TextInputInstance } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';

import { Button, ButtonText } from '@/components/ui/button';
import { Checkbox, CheckboxIcon, CheckboxIndicator } from '@/components/ui/checkbox';
import { ArrowRightIcon, CheckIcon, CloseCircleIcon, HelpCircleIcon, Icon } from '@/components/ui/icon';
import { Input, InputField } from '@/components/ui/input';
import { Modal, ModalBackdrop, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@/components/ui/modal';

const DEMO_CODE = '123456';
const RESEND_SECONDS = 60;
const CODE_LENGTH = 6;
const POLICIES = ['用户协议', '隐私政策', '登录政策'] as const;
type Feedback = { message: string; field?: 'phone' | 'code' | 'agreement'; error?: boolean };

export default function LoginScreen() {
  const phoneInput = useRef<TextInputInstance>(null);
  const codeInput = useRef<TextInputInstance>(null);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [requestedPhone, setRequestedPhone] = useState('');
  const [resendAt, setResendAt] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>();
  const [dialog, setDialog] = useState<{ title: string; message: string }>();
  const phoneValid = /^1[3-9]\d{9}$/.test(phone);
  const codeRequested = phone === requestedPhone && phoneValid;

  useEffect(() => {
    if (!resendAt) return;
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((resendAt - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendAt]);

  function validatePhone() {
    if (phoneValid) return true;
    setFeedback({ message: '请输入有效的中国大陆手机号码', field: 'phone', error: true });
    phoneInput.current?.focus();
    return false;
  }

  function requestCode() {
    if (!validatePhone() || Date.now() < resendAt) return;
    setRequestedPhone(phone);
    setResendAt(Date.now() + RESEND_SECONDS * 1000);
    setSecondsLeft(RESEND_SECONDS);
    setCode('');
    setFeedback({ message: `演示验证码为 ${DEMO_CODE}，暂不发送真实短信` });
    codeInput.current?.focus();
  }

  function submit() {
    if (!agreed) {
      setFeedback({ message: '请先阅读并同意用户协议、隐私政策及登录政策', field: 'agreement', error: true });
      return;
    }
    if (!validatePhone()) return;
    if (!codeRequested || code.length !== CODE_LENGTH) {
      setFeedback({ message: codeRequested ? '请输入6位短信验证码' : '请先获取验证码', field: 'code', error: true });
      codeInput.current?.focus();
      return;
    }
    if (code !== DEMO_CODE) {
      setFeedback({ message: '验证码不正确，请重新输入', field: 'code', error: true });
      codeInput.current?.focus();
      return;
    }
    Keyboard.dismiss();
    setFeedback({ message: '演示验证通过' });
  }

  function showHelp() {
    setDialog({
      title: '登录帮助',
      message: '请确认手机号码填写正确，并检查短信是否被拦截。如未收到验证码，可在倒计时结束后重新获取。\n\n当前为演示模式，不会发送真实短信。获取验证码后，输入 123456 可体验验证流程。',
    });
  }

  function changePhone(value: string) {
    setPhone(value.replace(/\D/g, '').slice(0, 11));
    setCode('');
    setFeedback(undefined);
  }

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : Platform.OS === 'android' ? 'height' : undefined}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false}>
            <View className="w-full max-w-[440px] flex-1 self-center justify-between px-5 pb-8" style={{ minHeight: 620 }}>
              <View className="h-11 flex-row items-center justify-end">
                <Button className="min-h-11 gap-1 px-0" variant="link" onPress={showHelp}>
                  <Icon as={HelpCircleIcon} size="sm" className="text-muted-foreground" />
                  <ButtonText className="text-sm font-medium text-muted-foreground">遇到问题</ButtonText>
                </Button>
              </View>

              <View className="items-center py-4">
                <View className="mb-4 h-20 w-20 items-center justify-center rounded-2xl bg-black" accessible={false}>
                  <Text className="text-[42px] font-semibold leading-[56px] text-white">同</Text>
                  <View className="absolute -bottom-1 -right-1 h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm">
                    <View className="h-2.5 w-2.5 rounded-full bg-primary" />
                  </View>
                </View>
                <Text accessibilityRole="header" className="mb-1 text-[22px] font-bold leading-7 tracking-[-0.44px] text-foreground">同乐</Text>
                <Text className="text-[13px] leading-[18px] text-muted-foreground">尽享精彩生活</Text>
              </View>

              <View className="gap-4 py-4">
                <View className="gap-1">
                  <Text className="text-xs font-medium leading-4 text-muted-foreground">手机号码</Text>
                  <Input className="h-12 gap-0 rounded-lg px-0 shadow-none" isInvalid={feedback?.field === 'phone'}>
                    <Button accessibilityLabel="国家或地区：中国大陆 +86" className="h-full gap-1 rounded-r-none pl-3 pr-2" variant="ghost" onPress={() => setDialog({ title: '国家或地区', message: '中国大陆（+86）\n\n目前仅支持中国大陆手机号码登录。' })}>
                      <ButtonText className="font-medium">+86</ButtonText>
                      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#737373" strokeWidth={2} accessible={false}><Path d="m7 10 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" /></Svg>
                    </Button>
                    <View className="h-5 w-px bg-border" />
                    <InputField
                      // The creator infers props as the ref type, but forwards a native TextInput.
                      ref={(input) => { phoneInput.current = input as unknown as TextInputInstance | null; }}
                      accessibilityLabel="手机号码，中国大陆 +86"
                      autoComplete="tel-national"
                      className="min-w-0 px-3 placeholder:text-[#a3a3a3]"
                      keyboardType="phone-pad"
                      maxLength={11}
                      onChangeText={changePhone}
                      placeholder="请输入手机号码"
                      value={phone}
                    />
                    {phone.length > 0 && (
                      <Button accessibilityLabel="清除手机号码" className="h-full min-w-11 px-3" variant="ghost" onPress={() => { changePhone(''); phoneInput.current?.focus(); }}>
                        <Icon as={CloseCircleIcon} size="md" className="text-[#a3a3a3]" />
                      </Button>
                    )}
                  </Input>
                </View>

                <View className="gap-1">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-xs font-medium leading-4 text-muted-foreground">短信验证码</Text>
                    <Button variant="link" onPress={showHelp} hitSlop={8} className="h-4 px-0 py-0">
                      <ButtonText className="text-xs font-medium leading-4 text-muted-foreground">收不到验证码？</ButtonText>
                    </Button>
                  </View>
                  <Input className="h-12 gap-0 rounded-lg pl-3 pr-1 shadow-none" isInvalid={feedback?.field === 'code'}>
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#a3a3a3" strokeWidth={1.8} accessible={false}>
                      <Path d="M12 3 3.5 6.5V12c0 5 4.5 8 8.5 9 4-1 8.5-4 8.5-9V6.5L12 3Z" strokeLinejoin="round" />
                      <Rect x={8.5} y={10} width={7} height={6} rx={1.5} /><Path d="M10 10V8a2 2 0 0 1 4 0v2" />
                    </Svg>
                    <InputField
                      ref={(input) => { codeInput.current = input as unknown as TextInputInstance | null; }}
                      accessibilityLabel="短信验证码"
                      autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
                      className="min-w-0 px-2 tracking-widest placeholder:text-[#a3a3a3]"
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
                    <Button className="min-h-8 shrink-0 rounded-md px-3 py-1.5" isDisabled={secondsLeft > 0} onPress={requestCode} variant="secondary" hitSlop={{ top: 6, bottom: 6 }}>
                      <ButtonText className="text-xs font-medium leading-4">{secondsLeft > 0 ? `${secondsLeft}s 后重新发送` : '获取验证码'}</ButtonText>
                    </Button>
                  </Input>
                </View>

                <Button className="mt-2 h-12 w-full rounded-lg shadow-sm" onPress={submit}>
                  <ButtonText className="text-sm font-semibold leading-5">立即登录</ButtonText>
                  <Icon as={ArrowRightIcon} size="md" className="text-primary-foreground" />
                </Button>
                {feedback && feedback.field !== 'agreement' && (
                  <Text accessibilityLiveRegion="polite" className={feedback.error ? 'text-[13px] leading-[18px] text-destructive' : 'text-[13px] leading-[18px] text-muted-foreground'}>{feedback.message}</Text>
                )}
              </View>

              <View className="mt-8 items-center gap-3 px-2 pb-3 pt-4">
                <View className="flex-row items-start justify-center gap-2">
                  <Checkbox accessibilityLabel="我已阅读并同意用户协议、隐私政策及登录政策" className="mt-0.5 min-h-5 min-w-5 items-center justify-center" hitSlop={10} isInvalid={feedback?.field === 'agreement'} isChecked={agreed} value="agreement" onChange={(checked) => { setAgreed(checked); if (feedback?.field === 'agreement') setFeedback(undefined); }}>
                    <CheckboxIndicator className="shadow-none"><CheckboxIcon as={CheckIcon} /></CheckboxIndicator>
                  </Checkbox>
                  <Text className="shrink text-center text-[13px] leading-[18px] text-muted-foreground">
                    我已阅读并同意{' '}
                    {POLICIES.map((policy, index) => (
                      <Text key={policy}>
                        {index > 0 ? (index === POLICIES.length - 1 ? ' 及 ' : '、') : ''}
                        <Text accessibilityRole="button" className="font-medium text-foreground underline decoration-border" onPress={() => setDialog({ title: policy, message: `当前为登录页面演示，正式《${policy}》尚未配置。上线前需接入完整的政策正文。` })}>《{policy}》</Text>
                      </Text>
                    ))}
                  </Text>
                </View>
                {feedback?.field === 'agreement' && <Text accessibilityLiveRegion="polite" className="text-center text-xs leading-[18px] text-destructive">{feedback.message}</Text>}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <Modal isOpen={!!dialog} onClose={() => setDialog(undefined)} size="sm">
        <ModalBackdrop />
        <ModalContent className="w-[90%] max-w-[360px] rounded-2xl">
          <ModalHeader><Text accessibilityRole="header" className="text-lg font-semibold text-foreground">{dialog?.title}</Text></ModalHeader>
          <ModalBody><Text className="text-sm leading-[22px] text-muted-foreground">{dialog?.message}</Text></ModalBody>
          <ModalFooter><Button className="min-h-11" onPress={() => setDialog(undefined)}><ButtonText>我知道了</ButtonText></Button></ModalFooter>
        </ModalContent>
      </Modal>
    </View>
  );
}
