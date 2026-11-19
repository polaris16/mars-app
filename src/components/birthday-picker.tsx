import { Typography } from '@/constants/typography';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useGlassAccessibility } from '@/components/ui/liquid-glass';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatDate, getBirthdayLimits, MIN_BIRTHDAY_YEAR } from '@/utils/profile-date';

const range = (start: number, end: number) => Array.from({ length: end - start + 1 }, (_, index) => start + index);

function DateColumn({ label, values, value, onChange }: {
  label: string;
  values: number[];
  value: number;
  onChange: (value: number) => void;
}) {
  const { fontScale, height } = useWindowDimensions();
  const rowHeight = Math.max(44, Math.ceil(Typography.title3.lineHeight * fontScale + 16));
  const [initialIndex] = useState(() => Math.max(0, values.indexOf(value) - 2));
  return <View style={[styles.column, { flex: fontScale >= 1.5 ? undefined : 1, height: Math.min(rowHeight * 5 + 32, height * 0.45) }]}>
    <Text dynamicTypeRamp="footnote" style={styles.columnLabel}>{label}</Text>
    {/* Date options are bounded; avoid nesting a virtualized list inside the sheet. */}
    <ScrollView
      nestedScrollEnabled
      contentOffset={{ x: 0, y: initialIndex * rowHeight }}
      showsVerticalScrollIndicator={false}
    >
      {values.map(item => <Pressable
        key={item}
        accessibilityRole="radio"
        accessibilityLabel={`${item}${label}`}
        accessibilityState={{ checked: item === value }}
        onPress={() => onChange(item)}
        style={[styles.option, { height: rowHeight }, item === value && styles.selectedOption]}
      >
        <Text dynamicTypeRamp="title3" style={[styles.optionText, item === value && styles.selectedText]}>{String(item).padStart(2, '0')}</Text>
      </Pressable>)}
    </ScrollView>
  </View>;
}

export function BirthdayPicker({ value, onConfirm, onClose }: {
  value?: Date;
  onConfirm: (date: Date) => void;
  onClose: () => void;
}) {
  const { reduceMotion } = useGlassAccessibility();
  const { fontScale } = useWindowDimensions();
  const [today] = useState(() => new Date());
  const [draft, setDraft] = useState(() => {
    const initial = value && value >= new Date(MIN_BIRTHDAY_YEAR, 0, 1) && value <= today
      ? value
      : new Date(1998, 5, 15);
    return { year: initial.getFullYear(), month: initial.getMonth() + 1, day: initial.getDate() };
  });
  const limits = getBirthdayLimits(draft.year, draft.month, today);

  function updateDate(part: 'year' | 'month' | 'day', value: number) {
    setDraft(current => {
      const next = { ...current, [part]: value };
      const { month, maxDay } = getBirthdayLimits(next.year, next.month, today);
      return { ...next, month, day: Math.min(next.day, maxDay) };
    });
  }

  const date = new Date(draft.year, draft.month - 1, draft.day);
  return <Modal transparent animationType={reduceMotion ? 'none' : 'slide'} onRequestClose={onClose}>
    <View style={styles.backdrop}>
      <Pressable accessibilityRole="button" accessibilityLabel="取消选择出生日期" onPress={onClose} style={StyleSheet.absoluteFill} />
      <SafeAreaView accessibilityViewIsModal edges={['bottom']} style={styles.sheet}>
        <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled" style={{ flexGrow: 0 }}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" onPress={onClose} style={styles.action}><Text dynamicTypeRamp="body" style={styles.cancel}>取消</Text></Pressable>
          <Text dynamicTypeRamp="headline" style={styles.title}>出生日期</Text>
          <Pressable accessibilityRole="button" onPress={() => onConfirm(date)} style={styles.action}><Text dynamicTypeRamp="headline" style={styles.confirm}>确定</Text></Pressable>
        </View>
        <Text dynamicTypeRamp="title3" accessibilityLiveRegion="polite" style={styles.preview}>{formatDate(date)}</Text>
        <View style={[styles.columns, fontScale >= 1.5 && { flexDirection: 'column' }]}>
          <DateColumn label="年" values={range(MIN_BIRTHDAY_YEAR, today.getFullYear())} value={draft.year} onChange={value => updateDate('year', value)} />
          <DateColumn label="月" values={range(1, limits.maxMonth)} value={draft.month} onChange={value => updateDate('month', value)} />
          <DateColumn label="日" values={range(1, limits.maxDay)} value={draft.day} onChange={value => updateDate('day', value)} />
        </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  </Modal>;
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { maxHeight: '90%', backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 16, paddingBottom: 16 },
  header: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingTop: 8 },
  action: { minWidth: 56, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  cancel: { ...Typography.body, color: '#616161' },
  confirm: { ...Typography.headline, color: '#171717' },
  title: { ...Typography.headline, color: '#171717' },
  preview: { ...Typography.title3, marginVertical: 12, textAlign: 'center', color: '#171717' },
  columns: { flexDirection: 'row', gap: 12, paddingBottom: 16 },
  column: { minWidth: 0 },
  columnLabel: { ...Typography.footnote, minHeight: 32, textAlign: 'center', color: '#616161' },
  option: { borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  selectedOption: { backgroundColor: '#171717' },
  optionText: { ...Typography.title3, color: '#616161' },
  selectedText: { fontWeight: '600', color: '#FFFFFF' },
});
