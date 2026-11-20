import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContentSurface } from '@/components/content-surface';
import { useGlassAccessibility } from '@/components/ui/liquid-glass';
import { Typography } from '@/constants/typography';
import { useTheme } from '@/hooks/use-theme';
import { getContactLabel, normalizeContactPhone, type Contact, type ContactDirectory } from '@/services/contacts';

const sheetEntering = SlideInDown.duration(260);

export type ContactsPanel =
  | { kind: 'add' | 'requests' }
  | { kind: 'contact'; id: string };

type ContactsSheetProps = {
  panel: ContactsPanel;
  directory: ContactDirectory;
  onClose: () => void;
  onAdd: (phone: string, note: string) => void;
  onAccept: (contact: Contact) => void;
  onStar: (contact: Contact) => void;
  saveError: string;
};

export function ContactsSheet({ panel, directory, onClose, onAdd, onAccept, onStar, saveError }: ContactsSheetProps) {
  const { reduceMotion } = useGlassAccessibility();
  const { accentBlue } = useTheme();
  const contact = panel.kind === 'contact' ? directory.contacts.find(item => item.id === panel.id) : undefined;
  const titles = { add: '添加联系人', requests: '新的朋友', contact: '联系人详情' };
  const expanded = panel.kind === 'add' || panel.kind === 'requests';

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent navigationBarTranslucent onRequestClose={onClose}>
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessible={false} importantForAccessibility="no" />
        <KeyboardAvoidingView pointerEvents="box-none" behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboard}>
          <View pointerEvents="box-none" style={styles.sheetArea}>
            <Animated.View entering={reduceMotion ? undefined : sheetEntering} style={[styles.dock, expanded && styles.expandedDock]}>
              <ContentSurface accessibilityViewIsModal style={[styles.sheet, expanded && styles.expandedSheet]}>
                <SafeAreaView edges={['bottom']} style={styles.sheetContent}>
                  <View style={styles.header}>
                    <Text accessibilityRole="header" dynamicTypeRamp="title2" style={styles.title}>{titles[panel.kind]}</Text>
                    <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="关闭" style={styles.close}>
                      <Ionicons name="close" size={22} color="#404040" />
                    </Pressable>
                  </View>

                  <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.body} style={styles.scroll}>
                    {saveError ? <Text accessibilityLiveRegion="polite" dynamicTypeRamp="subheadline" style={styles.error}>{saveError}</Text> : null}
                    {panel.kind === 'add' && <ContactForm onSave={onAdd} />}
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
                    {contact && (
                      <>
                        <Text dynamicTypeRamp="title2" style={styles.title}>{getContactLabel(contact)}</Text>
                        {contact.note ? <Text dynamicTypeRamp="body" style={styles.note}>{contact.note}</Text> : null}
                        <Pressable accessibilityRole="button" onPress={() => onStar(contact)} style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
                          <Ionicons name={contact.starred ? 'star' : 'star-outline'} size={21} color={accentBlue} accessible={false} />
                          <Text dynamicTypeRamp="body" style={[styles.name, styles.requestInfo]}>{contact.starred ? '取消星标' : '设为星标朋友'}</Text>
                          <Ionicons name="chevron-forward" size={16} color="#616161" accessible={false} />
                        </Pressable>
                      </>
                    )}
                  </ScrollView>
                </SafeAreaView>
              </ContentSurface>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

function ContactForm({ onSave }: { onSave: (phone: string, note: string) => void }) {
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [hasBlurred, setHasBlurred] = useState(false);
  const normalizedPhone = normalizeContactPhone(phone);

  return (
    <>
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
      <Pressable
        accessibilityRole="button"
        disabled={!normalizedPhone}
        onPress={() => { if (normalizedPhone) onSave(normalizedPhone, note.trim()); }}
        style={[styles.save, !normalizedPhone && styles.disabled]}
      >
        <Text dynamicTypeRamp="headline" style={styles.saveLabel}>保存</Text>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(17,17,17,0.35)' },
  keyboard: { flex: 1 },
  sheetArea: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  dock: { width: '100%', maxWidth: 540, maxHeight: '92%', flexShrink: 1 },
  expandedDock: { minHeight: '48%' },
  sheet: { flexShrink: 1, borderRadius: 0, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  expandedSheet: { flexGrow: 1 },
  sheetContent: { flexShrink: 1, padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 },
  title: { ...Typography.title2, color: '#171717', flexShrink: 1 },
  close: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F2F2F7', alignItems: 'center', justifyContent: 'center' },
  scroll: { flexGrow: 0 },
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
  save: { minHeight: 48, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 24, backgroundColor: '#171717', alignItems: 'center', justifyContent: 'center' },
  saveLabel: { ...Typography.headline, color: '#FFFFFF', textAlign: 'center' },
  disabled: { opacity: 0.35 },
});
