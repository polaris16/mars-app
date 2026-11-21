import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { BottomSheet, BottomSheetForm, BottomSheetScrollView } from '@/components/bottom-sheet';
import { Typography } from '@/constants/typography';
import { useTheme } from '@/hooks/use-theme';
import { getContactLabel, normalizeContactPhone, type Contact, type ContactDirectory } from '@/services/contacts';

export type ContactsPanel =
  | { kind: 'add' | 'requests' }
  ;

type ContactsSheetProps = {
  visible: boolean;
  panel: ContactsPanel;
  directory: ContactDirectory;
  onClose: () => void;
  onAdd: (phone: string, note: string) => void;
  onAccept: (contact: Contact) => void;
  saveError: string;
};

export function ContactsSheet({ visible, panel, directory, onClose, onAdd, onAccept, saveError }: ContactsSheetProps) {
  const titles = { add: '添加联系人', requests: '新的朋友' };

  return (
    <BottomSheet
      visible={visible}
      title={titles[panel.kind]}
      onClose={onClose}
      closeLabel={panel.kind === 'add' ? '取消' : '关闭'}
      closeVariant="glass-icon"
      dismissOnBackdropPress
      avoidKeyboard={panel.kind === 'add'}
      expanded={panel.kind === 'requests'}
    >
      {panel.kind === 'add' ? (
        <ContactForm onSave={onAdd} saveError={saveError} />
      ) : (
        <BottomSheetScrollView contentContainerStyle={styles.body}>
          {saveError ? <Text accessibilityLiveRegion="polite" dynamicTypeRamp="subheadline" style={styles.error}>{saveError}</Text> : null}
          {panel.kind === 'requests' && (
            directory.requests.length === 0
              ? <Text dynamicTypeRamp="body" style={styles.note}>暂无好友申请</Text>
              : directory.requests.map(request => {
                const label = getContactLabel(request);
                return (
                  <View key={request.id} style={styles.request}>
                    <View style={styles.requestInfo}>
                      <Text dynamicTypeRamp="headline" style={styles.name}>{label}</Text>
                      <Text dynamicTypeRamp="subheadline" style={styles.note}>{request.note}</Text>
                    </View>
                    <Pressable onPress={() => onAccept(request)} accessibilityRole="button" accessibilityLabel={`接受 ${label}`} style={styles.accept}>
                      <Text dynamicTypeRamp="subheadline" style={styles.acceptLabel}>接受</Text>
                    </Pressable>
                  </View>
                );
              })
          )}
        </BottomSheetScrollView>
      )}
    </BottomSheet>
  );
}

function ContactForm({ onSave, saveError }: { onSave: (phone: string, note: string) => void; saveError: string }) {
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [hasBlurred, setHasBlurred] = useState(false);
  const normalizedPhone = normalizeContactPhone(phone);

  return (
    <BottomSheetForm
      submitLabel="保存"
      submitDisabled={!normalizedPhone}
      onSubmit={() => { if (normalizedPhone) onSave(normalizedPhone, note.trim()); }}
    >
      {saveError ? <Text accessibilityLiveRegion="polite" dynamicTypeRamp="subheadline" style={styles.error}>{saveError}</Text> : null}
      <TextInput
        value={phone}
        onChangeText={setPhone}
        onBlur={() => setHasBlurred(true)}
        accessibilityLabel="手机号"
        placeholder="手机号"
        placeholderTextColor="#616161"
        keyboardType="phone-pad"
        autoComplete="tel"
        style={styles.input}
      />
      {hasBlurred && phone.trim() && !normalizedPhone ? (
        <Text accessibilityLiveRegion="polite" dynamicTypeRamp="subheadline" style={styles.error}>请输入有效的手机号。</Text>
      ) : null}
      <TextInput value={note} onChangeText={setNote} accessibilityLabel="备注（选填）" placeholder="备注（选填）" placeholderTextColor="#616161" maxLength={120} style={styles.input} />
    </BottomSheetForm>
  );
}

const styles = StyleSheet.create({
  contactName: { ...Typography.title2, color: '#171717' },
  body: { gap: 12, paddingBottom: 4 },
  action: { minHeight: 52, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 16, backgroundColor: '#F5F5F5', flexDirection: 'row', alignItems: 'center', gap: 12 },
  pressed: { opacity: 0.65 },
  request: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  requestInfo: { flex: 1, minWidth: 0 },
  name: { ...Typography.headline, color: '#171717' },
  note: { ...Typography.subhead, color: '#616161' },
  error: { ...Typography.subhead, color: '#B42318' },
  accept: { minHeight: 44, minWidth: 54, paddingHorizontal: 12, borderRadius: 16, backgroundColor: '#171717', alignItems: 'center', justifyContent: 'center' },
  acceptLabel: { ...Typography.subheadEmphasized, color: '#FFFFFF' },
  input: { ...Typography.body, color: '#171717', backgroundColor: '#F2F2F7', minHeight: 48, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
});
