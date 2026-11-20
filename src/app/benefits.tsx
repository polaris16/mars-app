import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { type ReactNode, useEffect, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomSlideModal } from '@/components/bottom-slide-modal';
import { ContentSurface } from '@/components/content-surface';
import { GlassBackToolbar } from '@/components/glass-back-toolbar';
import { GlassPressable, GlassScreen } from '@/components/glass-surface';
import { Typography } from '@/constants/typography';
import { useTheme } from '@/hooks/use-theme';
import { demoBenefitPlans, demoCodePlan, demoServiceCode, loadDemoBinding, saveDemoBinding, type Benefit, type BenefitManager, type BenefitPlan } from '@/services/benefits';
import { useAuth } from '@/store/AuthContext';

type BenefitsPanel = { kind: 'binding' } | { kind: 'manager'; manager: BenefitManager };

export default function BenefitsScreen() {
  const { user } = useAuth();
  const accountId = user ? `user-${user.id}` : 'guest';
  return <BenefitsPage key={accountId} accountId={accountId} />;
}

function BenefitsPage({ accountId }: { accountId: string }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(demoBenefitPlans[0].id);
  const [hasBinding, setHasBinding] = useState(false);
  const [bindingLoaded, setBindingLoaded] = useState(false);
  const [panel, setPanel] = useState<BenefitsPanel | null>(null);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let active = true;
    void loadDemoBinding(accountId)
      .then(bound => { if (active) setHasBinding(bound); })
      .catch(() => { if (active) setNotice('无法读取本机的服务码绑定记录。'); })
      .finally(() => { if (active) setBindingLoaded(true); });
    return () => { active = false; };
  }, [accountId]);

  const plans = hasBinding ? [...demoBenefitPlans, demoCodePlan] : demoBenefitPlans;
  const selected = plans.find(plan => plan.id === selectedId) ?? plans[0];

  const bindServiceCode = (code: string) => {
    if (code.trim().toUpperCase() !== demoServiceCode) return '服务码无效，请检查后重试。';
    if (hasBinding) return '该服务码已绑定。';

    try {
      saveDemoBinding(accountId);
    } catch {
      return '暂时无法保存绑定记录，请重试。';
    }

    setHasBinding(true);
    setSelectedId(demoCodePlan.id);
    setNotice('已绑定美刻体验计划。');
    Keyboard.dismiss();
    setPanel(null);
    return '';
  };

  return (
    <GlassScreen>
      <SafeAreaView edges={['top', 'bottom', 'left', 'right']} style={styles.fill}>
        <View style={styles.container}>
          <View style={styles.header}>
            <GlassBackToolbar title="权益" onBack={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')} />
            <GlassPressable disabled={!bindingLoaded} accessibilityLabel="添加" onPress={() => setPanel({ kind: 'binding' })} surfaceStyle={styles.bindingButton}>
              <Ionicons name="add" size={20} color="#171717" accessible={false} />
              <Text dynamicTypeRamp="subheadline" style={styles.actionLabel}>添加</Text>
            </GlassPressable>
          </View>

          <ScrollView style={styles.fill} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
              {plans.map(plan => {
                const active = plan.id === selected.id;
                return (
                  <Pressable
                    key={plan.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={`${plan.institution}，${plan.benefits.length} 项权益`}
                    onPress={() => { setSelectedId(plan.id); setNotice(''); }}
                    style={({ pressed }) => [styles.filter, active && styles.filterActive, pressed && styles.pressed]}
                  >
                    <Text dynamicTypeRamp="subheadline" style={[styles.actionLabel, active && styles.inverse]}>{plan.institution}</Text>
                    <Text dynamicTypeRamp="footnote" style={[styles.secondary, active && styles.inverse]}>{plan.benefits.length} 项</Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {notice ? <Text accessibilityLiveRegion="polite" dynamicTypeRamp="subheadline" style={styles.notice}>{notice}</Text> : null}

            <PlanCard
              plan={selected}
              onUse={benefit => router.push({ pathname: '/recorder', params: { topic: `${benefit.title} · ${selected.institution}` } })}
              onContact={manager => setPanel({ kind: 'manager', manager })}
            />
          </ScrollView>
        </View>
      </SafeAreaView>

      {panel?.kind === 'binding' && (
        <BenefitSheet title="添加" onClose={() => setPanel(null)}>
          <BindingForm onBind={bindServiceCode} />
        </BenefitSheet>
      )}
      {panel?.kind === 'manager' && (
        <BenefitSheet title="联系客户经理" onClose={() => setPanel(null)}>
          <Text dynamicTypeRamp="title3" style={styles.title}>{panel.manager.name} · {panel.manager.role}</Text>
          <Text dynamicTypeRamp="body" style={styles.secondary}>{panel.manager.description}</Text>
          <Text dynamicTypeRamp="subheadline" style={styles.secondary}>这是演示联系人，暂无可用联系方式。</Text>
          <DarkButton label="完成" onPress={() => setPanel(null)} />
        </BenefitSheet>
      )}
    </GlassScreen>
  );
}

function PlanCard({ plan, onUse, onContact }: { plan: BenefitPlan; onUse: (benefit: Benefit) => void; onContact: (manager: BenefitManager) => void }) {
  const { accentBlue, accentBlueSubtle } = useTheme();
  const usedCount = plan.benefits.filter(benefit => benefit.used).length;
  const year = new Date().getFullYear();

  return (
    <ContentSurface style={styles.plan}>
      <View style={styles.planHeading}>
        <View style={[styles.icon, { backgroundColor: accentBlueSubtle }]}>
          <Ionicons name="shield-checkmark-outline" size={25} color={accentBlue} accessible={false} />
        </View>
        <View style={styles.textColumn}>
          <Text dynamicTypeRamp="footnote" style={styles.secondary}>{plan.institution}</Text>
          <Text accessibilityRole="header" dynamicTypeRamp="title2" style={[styles.title, Typography.title2]}>{plan.title}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <Text accessibilityRole="header" dynamicTypeRamp="headline" style={styles.itemTitle}>专属权益（{plan.benefits.length} 项）</Text>
          <Text dynamicTypeRamp="footnote" style={styles.secondary}>已使用 {usedCount} 项 · 剩余 {plan.benefits.length - usedCount} 项</Text>
        </View>

        {plan.benefits.map(benefit => (
          <View key={benefit.id} style={styles.item}>
            <View style={styles.itemHeading}>
              <View style={styles.smallIcon}><Ionicons name="mic-outline" size={20} color="#404040" accessible={false} /></View>
              <View style={styles.textColumn}>
                <Text dynamicTypeRamp="headline" style={styles.itemTitle}>{benefit.title}</Text>
              </View>
            </View>
            <Text dynamicTypeRamp="subheadline" style={styles.description}>{benefit.description}</Text>
            <View style={styles.itemFooter}>
              <Text dynamicTypeRamp="footnote" style={styles.validity}>有效期 {year}.01.01 至 {year}.12.31</Text>
              <DarkButton
                label={benefit.used ? '已使用' : '去使用'}
                accessibilityLabel={`${benefit.title}，${benefit.used ? '已使用' : '去使用'}`}
                disabled={benefit.used}
                onPress={benefit.used ? undefined : () => onUse(benefit)}
              />
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <Text accessibilityRole="header" dynamicTypeRamp="headline" style={styles.itemTitle}>客户经理{plan.managers.length > 0 ? `（${plan.managers.length} 人）` : ''}</Text>
          {plan.managers.length > 0 && <Text dynamicTypeRamp="footnote" style={styles.secondary}>一对一支持</Text>}
        </View>
        {plan.managers.length === 0 && <Text dynamicTypeRamp="subheadline" style={styles.secondary}>暂未分配客户经理</Text>}
        {plan.managers.map(manager => (
          <View key={manager.name} style={[styles.item, styles.manager]}>
            <View style={[styles.smallIcon, { backgroundColor: accentBlueSubtle }]}>
              <Ionicons name="person-outline" size={18} color={accentBlue} accessible={false} />
            </View>
            <View style={styles.textColumn}>
              <Text dynamicTypeRamp="headline" style={styles.itemTitle}>{manager.name}</Text>
              <Text dynamicTypeRamp="footnote" style={styles.secondary}>{manager.role} · {manager.description}</Text>
            </View>
            <DarkButton label="联系" accessibilityLabel={`联系${manager.name}`} onPress={() => onContact(manager)} />
          </View>
        ))}
      </View>
    </ContentSurface>
  );
}

function DarkButton({ label, accessibilityLabel, disabled, onPress }: { label: string; accessibilityLabel?: string; disabled?: boolean; onPress?: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, (pressed || disabled) && styles.pressed]}
    >
      <Text dynamicTypeRamp="subheadline" style={[styles.actionLabel, styles.inverse]}>{label}</Text>
    </Pressable>
  );
}

function BenefitSheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <BottomSlideModal onClose={onClose}>
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessible={false} importantForAccessibility="no" />
        <KeyboardAvoidingView pointerEvents="box-none" behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.sheetArea}>
          <ContentSurface accessibilityViewIsModal style={styles.sheet}>
            <SafeAreaView edges={['bottom']} style={styles.sheetContent}>
              <View style={styles.sectionHeading}>
                <Text accessibilityRole="header" dynamicTypeRamp="title2" style={[styles.title, Typography.title2]}>{title}</Text>
                <Pressable accessibilityRole="button" accessibilityLabel="关闭" onPress={onClose} style={styles.close}>
                  <Ionicons name="close" size={22} color="#404040" />
                </Pressable>
              </View>
              <ScrollView keyboardShouldPersistTaps="handled" style={styles.sheetScroll} contentContainerStyle={styles.section}>
                {children}
              </ScrollView>
            </SafeAreaView>
          </ContentSurface>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </BottomSlideModal>
  );
}

function BindingForm({ onBind }: { onBind: (code: string) => string }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const submit = () => {
    if (code.trim()) setError(onBind(code));
  };

  return (
    <>
      <TextInput
        value={code}
        onChangeText={value => { setCode(value); setError(''); }}
        onSubmitEditing={submit}
        accessibilityLabel="服务码"
        placeholder="请输入服务码"
        placeholderTextColor="#616161"
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={40}
        returnKeyType="done"
        style={styles.input}
      />
      <Text dynamicTypeRamp="footnote" style={styles.secondary}>演示服务码 {demoServiceCode}</Text>
      {error ? <Text accessibilityLiveRegion="polite" dynamicTypeRamp="subheadline" style={styles.error}>{error}</Text> : null}
      <DarkButton label="绑定" disabled={!code.trim()} onPress={submit} />
    </>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  container: { flex: 1, alignSelf: 'center', width: '100%', maxWidth: 680 },
  header: { minHeight: 64, paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  bindingButton: { minHeight: 44, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, borderRadius: 24 },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32, gap: 12 },
  filters: { gap: 8, paddingVertical: 4, paddingRight: 2 },
  filter: { minHeight: 44, borderRadius: 24, paddingHorizontal: 13, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#FFFFFF', borderWidth: StyleSheet.hairlineWidth, borderColor: '#D4D4D4' },
  filterActive: { backgroundColor: '#171717', borderColor: '#171717' },
  pressed: { opacity: 0.65 },
  actionLabel: { ...Typography.subheadEmphasized, color: '#171717', textAlign: 'center' },
  inverse: { color: '#FFFFFF' },
  secondary: { ...Typography.footnote, color: '#616161' },
  notice: { ...Typography.subhead, color: '#404040' },
  plan: { padding: 16, gap: 22, borderRadius: 26 },
  planHeading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  textColumn: { flex: 1, minWidth: 0, gap: 3 },
  title: { ...Typography.title3, color: '#171717', flexShrink: 1 },
  icon: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  section: { gap: 10 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 },
  item: { backgroundColor: '#F5F5F7', borderRadius: 17, padding: 12, gap: 8 },
  itemHeading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  smallIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#E9E9EE', alignItems: 'center', justifyContent: 'center' },
  itemTitle: { ...Typography.headline, color: '#171717' },
  description: { ...Typography.subhead, color: '#404040' },
  itemFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 },
  validity: { ...Typography.footnote, color: '#616161', flexShrink: 1 },
  manager: { flexDirection: 'row', alignItems: 'center' },
  button: { minHeight: 44, paddingHorizontal: 13, paddingVertical: 8, borderRadius: 22, backgroundColor: '#171717', alignItems: 'center', justifyContent: 'center' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheetArea: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  sheet: { width: '100%', maxWidth: 540, maxHeight: '90%', flexShrink: 1, borderRadius: 0, borderTopLeftRadius: 32, borderTopRightRadius: 32 },
  sheetContent: { flexShrink: 1, padding: 20, gap: 12 },
  sheetScroll: { flexGrow: 0 },
  close: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F2F2F7', alignItems: 'center', justifyContent: 'center' },
  input: { ...Typography.body, minHeight: 48, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16, backgroundColor: '#F2F2F7', color: '#171717' },
  error: { ...Typography.subhead, color: '#B42318' },
});
