import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomSheet, BottomSheetForm } from '@/components/bottom-sheet';
import { ContentPressable, ContentSurface } from '@/components/content-surface';
import { GlassBackToolbar } from '@/components/glass-back-toolbar';
import { GlassScreen } from '@/components/glass-surface';
import { companions, type Companion } from '@/constants/companions';
import { Typography } from '@/constants/typography';
import { formatBookingTime, formatSlotTime, getBookingDays, serviceAddress, type BookingAddress, type BookingSlot } from '@/services/companion-booking';
import { useCompanionSession } from '@/store/companion-session';

const periods = ['上午时段', '下午时段', '晚间深度倾听'] as const;
const noteLimit = 200;

export default function ConfirmBookingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const companion = companions.find(item => item.id === id);

  const goBack = () => {
    Keyboard.dismiss();
    if (router.canGoBack()) router.back();
    else if (companion) router.replace({ pathname: '/companions/[id]', params: { id: companion.id } });
    else router.replace('/companions');
  };

  return (
    <GlassScreen>
      <SafeAreaView edges={['top', 'bottom', 'left', 'right']} style={styles.page}>
        <View style={styles.header}><GlassBackToolbar title="确认预约" onBack={goBack} /></View>
        {companion ? <BookingForm key={companion.id} companion={companion} onBack={goBack} /> : (
          <ContentSurface style={[styles.card, styles.missing]}>
            <Text dynamicTypeRamp="subheadline" style={styles.bodySecondary}>找不到这位青年伙伴。</Text>
          </ContentSurface>
        )}
      </SafeAreaView>
    </GlassScreen>
  );
}

function BookingForm({ companion, onBack }: { companion: Companion; onBack: () => void }) {
  const { width, fontScale } = useWindowDimensions();
  const { bookings, recordBooking } = useCompanionSession();
  const [days, setDays] = useState(() => getBookingDays(companion.availability));
  const [dateKey, setDateKey] = useState<number | null>(null);
  const [start, setStart] = useState<number | null>(null);
  const [address, setAddress] = useState(serviceAddress);
  const [note, setNote] = useState('');
  const [editingAddress, setEditingAddress] = useState(false);
  const [slotExpired, setSlotExpired] = useState(false);
  const booking = bookings[companion.id];
  const day = days.find(item => item.availableCount > 0 && item.dateKey === dateKey)
    ?? days.find(item => item.availableCount > 0);
  const selectedSlot = day?.slots.find(slot => slot.start === start && !slot.unavailableReason);
  const stackSlots = width < 360 || fontScale >= 1.4;

  const confirm = () => {
    if (!day || !selectedSlot || booking) return;
    const updatedDays = getBookingDays(companion.availability);
    const updatedDay = updatedDays.find(item => item.dateKey === day.dateKey);
    const available = updatedDay?.slots.some(slot => slot.start === selectedSlot.start && !slot.unavailableReason);
    if (!available) {
      setDays(updatedDays);
      setStart(null);
      setSlotExpired(true);
      return;
    }

    recordBooking(companion.id, { start: selectedSlot.start, end: selectedSlot.end, address, note: note.trim() });
    onBack();
  };

  if (booking) {
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <ContentSurface style={styles.card}>
          <Text accessibilityRole="header" dynamicTypeRamp="headline" style={styles.heading}>已记录预约意向（演示）</Text>
          <Text dynamicTypeRamp="subheadline" style={styles.bodySecondary}>{formatBookingTime(booking)}</Text>
          <Text dynamicTypeRamp="subheadline" style={styles.bodySecondary}>{booking.address.detail}</Text>
          {booking.note ? <Text dynamicTypeRamp="subheadline" style={styles.bodySecondary}>留言 · {booking.note}</Text> : null}
        </ContentSurface>
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.fill}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <ContentSurface style={styles.card}>
          <View style={styles.addressHeading}>
            <SectionTitle icon="location-outline" title="预约地址" />
            <ContentPressable onPress={() => { Keyboard.dismiss(); setEditingAddress(true); }} surfaceStyle={styles.changeAddress}>
              <Text dynamicTypeRamp="footnote" style={styles.actionText}>更换地址</Text>
              <Ionicons name="chevron-forward" size={16} color="#616161" accessible={false} />
            </ContentPressable>
          </View>
          <View style={styles.addressCard}>
            {address.name ? (
              <View style={styles.addressName}>
                <Text dynamicTypeRamp="subheadline" style={styles.addressTitle}>{address.name}</Text>
                <Text dynamicTypeRamp="caption1" style={styles.addressBadge}>服务网点</Text>
              </View>
            ) : null}
            <Text dynamicTypeRamp="subheadline" style={styles.bodySecondary}>{address.detail}</Text>
          </View>
        </ContentSurface>

        <ContentSurface style={styles.card}>
          <SectionTitle icon="calendar-outline" title="选择预约时段" subtitle={`与${companion.name}交流 · 北京时间`} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.dates}>
            {days.map(item => {
              const active = item.dateKey === day?.dateKey;
              const disabled = item.availableCount === 0;
              const status = disabled ? '暂无时段' : `可约 ${item.availableCount} 个`;
              return (
                <ContentPressable
                  key={item.dateKey}
                  tone={active ? 'dark' : 'muted'}
                  disabled={disabled}
                  accessibilityLabel={`${item.title} ${item.dateLabel}，${status}`}
                  accessibilityState={{ selected: active, disabled }}
                  onPress={() => {
                    if (active) return;
                    setDateKey(item.dateKey);
                    setStart(null);
                    setSlotExpired(false);
                  }}
                  surfaceStyle={styles.dateButton}
                >
                  <Text dynamicTypeRamp="caption1" style={[styles.caption, active && styles.inverse]}>{item.title}</Text>
                  <Text dynamicTypeRamp="subheadline" style={[styles.addressTitle, active && styles.inverse]}>{item.dateLabel}</Text>
                  <Text dynamicTypeRamp="caption1" style={[styles.caption, active && styles.inverse]}>{status}</Text>
                </ContentPressable>
              );
            })}
          </ScrollView>

          {slotExpired && <Text accessibilityLiveRegion="polite" dynamicTypeRamp="footnote" style={styles.error}>所选时段已不可预约，请重新选择。</Text>}
          {day ? periods.map(period => (
            <View key={period} style={styles.slotSection}>
              <Text accessibilityRole="header" dynamicTypeRamp="subheadline" style={styles.addressTitle}>{period}</Text>
              <View style={[styles.slotGroup, !stackSlots && styles.slotRow]}>
                {day.slots.filter(slot => slot.period === period).map(slot => (
                  <SlotButton
                    key={slot.start}
                    slot={slot}
                    selected={start === slot.start}
                    inRow={!stackSlots}
                    onPress={() => { setStart(slot.start); setSlotExpired(false); }}
                  />
                ))}
              </View>
            </View>
          )) : <Text dynamicTypeRamp="subheadline" style={styles.bodySecondary}>暂无可预约的时段。</Text>}
        </ContentSurface>

        <ContentSurface style={styles.card}>
          <SectionTitle icon="chatbubble-outline" title="预约留言与心愿嘱托" subtitle="可以告诉伙伴您想聊的话题，或需要协助的生活小事。" />
          <View style={styles.noteField}>
            <TextInput
              accessibilityLabel="预约留言，选填"
              multiline
              maxLength={noteLimit}
              value={note}
              onChangeText={setNote}
              placeholder="例如，想和您一起翻翻旧相册。"
              placeholderTextColor="#616161"
              style={styles.noteInput}
            />
            <Text dynamicTypeRamp="caption1" style={styles.counter}>{note.length}/{noteLimit} 字</Text>
          </View>
        </ContentSurface>
      </ScrollView>

      <View style={styles.footer}>
        <Text dynamicTypeRamp="caption1" style={styles.footerNote}>本页仅记录演示预约意向</Text>
        <ContentPressable
          tone={selectedSlot ? 'dark' : 'muted'}
          disabled={!selectedSlot}
          onPress={confirm}
          surfaceStyle={styles.confirmButton}
        >
          <Text dynamicTypeRamp="headline" style={[styles.heading, selectedSlot ? styles.inverse : styles.captionColor]}>确定</Text>
        </ContentPressable>
      </View>

      <BottomSheet visible={editingAddress} title="更换地址" closeVariant="glass-icon" avoidKeyboard dismissOnBackdropPress onClose={() => { Keyboard.dismiss(); setEditingAddress(false); }}>
        {editingAddress && <AddressForm initialAddress={address} onSelect={value => {
          Keyboard.dismiss();
          setAddress(value);
          setEditingAddress(false);
        }} />}
      </BottomSheet>
    </KeyboardAvoidingView>
  );
}

function SectionTitle({ icon, title, subtitle }: { icon: 'location-outline' | 'calendar-outline' | 'chatbubble-outline'; title: string; subtitle?: string }) {
  return (
    <View style={styles.sectionTitle}>
      <Ionicons name={icon} size={21} color="#171717" accessible={false} />
      <View style={styles.sectionText}>
        <Text accessibilityRole="header" dynamicTypeRamp="headline" style={styles.heading}>{title}</Text>
        {subtitle ? <Text dynamicTypeRamp="footnote" style={styles.secondary}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

function SlotButton({ slot, selected, inRow, onPress }: { slot: BookingSlot; selected: boolean; inRow: boolean; onPress: () => void }) {
  const time = formatSlotTime(slot.start, slot.end);
  const disabled = Boolean(slot.unavailableReason);
  const status = slot.unavailableReason ?? (selected ? '已选择' : '可预约');

  return (
    <ContentPressable
      tone={selected ? 'dark' : 'muted'}
      disabled={disabled}
      accessibilityLabel={`${time}，${status}`}
      accessibilityState={{ selected, disabled }}
      onPress={onPress}
      style={inRow && styles.slotTarget}
      surfaceStyle={styles.slotButton}
    >
      <View style={styles.slotHeading}>
        <Text dynamicTypeRamp="subheadline" style={[styles.addressTitle, selected && styles.inverse, disabled && styles.captionColor]}>{time}</Text>
        {selected && <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" accessible={false} />}
        {disabled && <Ionicons name="lock-closed-outline" size={15} color="#616161" accessible={false} />}
      </View>
      <Text dynamicTypeRamp="caption1" style={[styles.caption, selected && styles.inverse]}>{status}</Text>
    </ContentPressable>
  );
}

function AddressForm({ initialAddress, onSelect }: { initialAddress: BookingAddress; onSelect: (address: BookingAddress) => void }) {
  const [draft, setDraft] = useState(initialAddress.name ? '' : initialAddress.detail);
  const detail = draft.trim();

  return (
    <BottomSheetForm submitLabel="使用此地址" submitDisabled={!detail} onSubmit={() => onSelect({ detail })}>
      <TextInput
        accessibilityLabel="详细地址"
        multiline
        maxLength={160}
        value={draft}
        onChangeText={setDraft}
        placeholder="请输入详细地址"
        placeholderTextColor="#616161"
        style={[styles.noteInput, styles.addressInput]}
      />
      <ContentPressable tone="muted" onPress={() => onSelect(serviceAddress)} surfaceStyle={styles.confirmButton}>
        <Text dynamicTypeRamp="subheadline" style={styles.addressTitle}>使用服务网点地址</Text>
      </ContentPressable>
    </BottomSheetForm>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  page: { flex: 1, width: '100%', maxWidth: 680, alignSelf: 'center' },
  header: { minHeight: 64, justifyContent: 'center', alignItems: 'flex-start', paddingHorizontal: 16, paddingVertical: 8 },
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16, gap: 12 },
  card: { padding: 16, borderRadius: 22, gap: 12 },
  missing: { marginHorizontal: 16 },
  heading: { ...Typography.headline, color: '#171717' },
  secondary: { ...Typography.footnote, color: '#616161' },
  bodySecondary: { ...Typography.subhead, color: '#404040' },
  caption: { ...Typography.caption1, color: '#616161' },
  captionColor: { color: '#616161' },
  inverse: { color: '#FFFFFF' },
  error: { ...Typography.footnote, color: '#B42318' },
  sectionTitle: { flexDirection: 'row', alignItems: 'flex-start', flexShrink: 1, gap: 8 },
  sectionText: { flexShrink: 1, gap: 3 },
  addressHeading: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 4 },
  changeAddress: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 3 },
  actionText: { ...Typography.footnoteEmphasized, color: '#404040' },
  addressCard: { backgroundColor: '#F5F5F5', padding: 12, borderRadius: 14, gap: 6 },
  addressName: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  addressTitle: { ...Typography.subheadEmphasized, color: '#171717', flexShrink: 1 },
  addressBadge: { ...Typography.caption1Emphasized, color: '#FFFFFF', backgroundColor: '#171717', borderRadius: 14, paddingHorizontal: 8, paddingVertical: 4 },
  dates: { gap: 8, paddingVertical: 2 },
  dateButton: { minWidth: 76, paddingHorizontal: 8, paddingVertical: 9, borderRadius: 14, alignItems: 'center', gap: 3 },
  slotSection: { gap: 6 },
  slotGroup: { gap: 8 },
  slotRow: { flexDirection: 'row' },
  slotTarget: { flex: 1, minWidth: 0 },
  slotButton: { flexGrow: 1, minHeight: 66, padding: 10, borderRadius: 14, justifyContent: 'center', gap: 4 },
  slotHeading: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 4 },
  noteField: { backgroundColor: '#F5F5F5', borderRadius: 14, padding: 12, gap: 4 },
  noteInput: { ...Typography.body, minHeight: 90, padding: 0, textAlignVertical: 'top', color: '#171717' },
  addressInput: { backgroundColor: '#F5F5F5', borderRadius: 14, padding: 12 },
  counter: { ...Typography.caption1, color: '#616161', textAlign: 'right' },
  footer: { paddingHorizontal: 16, paddingVertical: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E5E5E5', gap: 6 },
  footerNote: { ...Typography.caption1, color: '#616161', textAlign: 'center' },
  confirmButton: { minHeight: 48, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
});
