import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatDate, getBirthdayLimits, MIN_BIRTHDAY_YEAR } from '@/utils/profile-date';

const ROW_HEIGHT = 44;
const range = (start: number, end: number) => Array.from({ length: end - start + 1 }, (_, index) => start + index);

function DateColumn({ label, values, value, onChange }: {
  label: string;
  values: number[];
  value: number;
  onChange: (value: number) => void;
}) {
  return <View style={styles.column}>
    <Text style={styles.columnLabel}>{label}</Text>
    <FlatList
      data={values}
      extraData={value}
      keyExtractor={item => String(item)}
      initialScrollIndex={Math.max(0, values.indexOf(value) - 2)}
      initialNumToRender={7}
      getItemLayout={(_, index) => ({ length: ROW_HEIGHT, offset: ROW_HEIGHT * index, index })}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => <Pressable
        accessibilityRole="radio"
        accessibilityLabel={`${item}${label}`}
        accessibilityState={{ checked: item === value }}
        onPress={() => onChange(item)}
        style={[styles.option, item === value && styles.selectedOption]}
      >
        <Text style={[styles.optionText, item === value && styles.selectedText]}>{String(item).padStart(2, '0')}</Text>
      </Pressable>}
    />
  </View>;
}

export function BirthdayPicker({ value, onConfirm, onClose }: {
  value?: Date;
  onConfirm: (date: Date) => void;
  onClose: () => void;
}) {
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
  return <Modal transparent animationType="slide" onRequestClose={onClose}>
    <View style={styles.backdrop}>
      <Pressable accessibilityRole="button" accessibilityLabel="取消选择出生日期" onPress={onClose} style={StyleSheet.absoluteFill} />
      <SafeAreaView edges={['bottom']} style={styles.sheet}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" onPress={onClose} style={styles.action}><Text style={styles.cancel}>取消</Text></Pressable>
          <Text style={styles.title}>出生日期</Text>
          <Pressable accessibilityRole="button" onPress={() => onConfirm(date)} style={styles.action}><Text style={styles.confirm}>确定</Text></Pressable>
        </View>
        <Text accessibilityLiveRegion="polite" style={styles.preview}>{formatDate(date)}</Text>
        <View style={styles.columns}>
          <DateColumn label="年" values={range(MIN_BIRTHDAY_YEAR, today.getFullYear())} value={draft.year} onChange={value => updateDate('year', value)} />
          <DateColumn label="月" values={range(1, limits.maxMonth)} value={draft.month} onChange={value => updateDate('month', value)} />
          <DateColumn label="日" values={range(1, limits.maxDay)} value={draft.day} onChange={value => updateDate('day', value)} />
        </View>
      </SafeAreaView>
    </View>
  </Modal>;
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 16, paddingBottom: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8 },
  action: { minWidth: 56, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  cancel: { fontSize: 16, color: '#737373' },
  confirm: { fontSize: 16, fontWeight: '600', color: '#171717' },
  title: { fontSize: 17, fontWeight: '600', color: '#171717' },
  preview: { marginVertical: 12, textAlign: 'center', fontSize: 20, fontWeight: '600', color: '#171717' },
  columns: { flexDirection: 'row', gap: 12, paddingBottom: 16 },
  column: { flex: 1, height: ROW_HEIGHT * 5 + 32 },
  columnLabel: { height: 32, textAlign: 'center', fontSize: 13, color: '#737373' },
  option: { height: ROW_HEIGHT, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  selectedOption: { backgroundColor: '#171717' },
  optionText: { fontSize: 18, color: '#737373' },
  selectedText: { fontWeight: '600', color: '#FFFFFF' },
});
