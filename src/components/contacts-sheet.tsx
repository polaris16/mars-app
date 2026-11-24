import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { BottomSheet, BottomSheetForm, BottomSheetScrollView } from '@/components/bottom-sheet';
import { SCREEN_BACKGROUND } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { getContactLabel, normalizeContactPhone, type ContactDirectory, type ContactRequestItem } from '@/services/contacts';
import type { ContactSearchResult } from '@/services/contacts-api';

export type ContactsPanel =
  | { kind: 'add' | 'requests' }
  ;

type ContactsSheetProps = {
  visible: boolean;
  panel: ContactsPanel;
  directory: ContactDirectory;
  onClose: () => void;
  onSearch: (phone: string) => Promise<ContactSearchResult[]>;
  onSendRequest: (user: ContactSearchResult, message: string) => Promise<void>;
  onResolveRequest: (request: ContactRequestItem, action: 'accept' | 'reject') => Promise<void>;
  requests: ContactRequestItem[];
  busy: boolean;
  saveError: string;
};

export function ContactsSheet({ visible, panel, directory, onClose, onSearch, onSendRequest, onResolveRequest, requests, busy, saveError }: ContactsSheetProps) {
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
      sheetStyle={styles.contactsSheet}
    >
      {panel.kind === 'add' ? (
        <ContactForm onSearch={onSearch} onSendRequest={onSendRequest} busy={busy} saveError={saveError} />
      ) : (
        <BottomSheetScrollView contentContainerStyle={styles.body}>
          {saveError ? <Text accessibilityLiveRegion="polite" dynamicTypeRamp="subheadline" style={styles.error}>{saveError}</Text> : null}
          {panel.kind === 'requests' && (
            requests.length === 0
              ? <Text dynamicTypeRamp="body" style={styles.note}>暂无好友申请</Text>
              : requests.map(request => {
                const label = getContactLabel(request);
                return (
                  <View key={request.id} style={styles.request}>
                    <View style={styles.requestInfo}>
                      <Text dynamicTypeRamp="headline" style={styles.name}>{label}</Text>
                      <Text dynamicTypeRamp="subheadline" style={styles.note}>{request.note || '请求添加你为好友'}</Text>
                    </View>
                    <Pressable disabled={busy} onPress={() => void onResolveRequest(request, 'reject')} accessibilityRole="button" accessibilityLabel={`拒绝 ${label}`} style={styles.reject}>
                      <Text dynamicTypeRamp="subheadline" style={styles.rejectLabel}>拒绝</Text>
                    </Pressable>
                    <Pressable disabled={busy} onPress={() => void onResolveRequest(request, 'accept')} accessibilityRole="button" accessibilityLabel={`接受 ${label}`} style={styles.accept}>
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

function ContactForm({ onSearch, onSendRequest, busy, saveError }: {
  onSearch: (phone: string) => Promise<ContactSearchResult[]>;
  onSendRequest: (user: ContactSearchResult, message: string) => Promise<void>;
  busy: boolean;
  saveError: string;
}) {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [hasBlurred, setHasBlurred] = useState(false);
  const [results, setResults] = useState<ContactSearchResult[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [sendingId, setSendingId] = useState<number | null>(null);
  const [localError, setLocalError] = useState('');
  const normalizedPhone = normalizeContactPhone(phone);

  const search = async () => {
    if (!normalizedPhone || searching) return;
    setSearching(true);
    setResults(null);
    try {
      setResults(await onSearch(normalizedPhone));
      setLocalError('');
    } catch (cause) {
      setResults([]);
      setLocalError(cause instanceof Error ? cause.message : '搜索用户失败。');
    } finally {
      setSearching(false);
    }
  };

  return (
    <BottomSheetForm
      submitLabel={results ? '重新搜索' : '搜索用户'}
      submitDisabled={!normalizedPhone || searching || busy}
      onSubmit={() => { void search(); }}
    >
      {saveError || localError ? <Text accessibilityLiveRegion="polite" dynamicTypeRamp="subheadline" style={saveError.includes('已发送') ? styles.success : styles.error}>{saveError || localError}</Text> : null}
      <TextInput
        value={phone}
        onChangeText={value => { setPhone(value); setResults(null); setLocalError(''); }}
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
      {searching ? <ActivityIndicator color="#276EF1" /> : null}
      {results?.length === 0 ? <Text dynamicTypeRamp="subheadline" style={styles.note}>没有找到该手机号对应的用户。</Text> : null}
      {results?.map(user => (
        <View key={user.id} style={styles.result}>
          <View style={styles.requestInfo}><Text dynamicTypeRamp="headline" style={styles.name}>{user.display_name || `用户 ${user.id}`}</Text><Text dynamicTypeRamp="subheadline" style={styles.note}>手机号匹配</Text></View>
          <Pressable disabled={busy || sendingId === user.id} onPress={async () => { setSendingId(user.id); await onSendRequest(user, message.trim()); setSendingId(null); }} accessibilityRole="button" accessibilityLabel={`添加 ${user.display_name || user.id}`} style={styles.accept}>
            <Text dynamicTypeRamp="subheadline" style={styles.acceptLabel}>{sendingId === user.id ? '发送中' : '添加'}</Text>
          </Pressable>
        </View>
      ))}
      {results && results.length > 0 ? <TextInput value={message} onChangeText={setMessage} accessibilityLabel="好友申请留言（选填）" placeholder="申请留言（选填）" placeholderTextColor="#616161" maxLength={120} style={styles.input} /> : null}
    </BottomSheetForm>
  );
}

const styles = StyleSheet.create({
  contactName: { ...Typography.title2, color: '#171717' },
  body: { gap: 12, paddingBottom: 4 },
  action: { minHeight: 52, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 16, backgroundColor: '#F5F5F5', flexDirection: 'row', alignItems: 'center', gap: 12 },
  pressed: { opacity: 0.65 },
  request: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 18, backgroundColor: '#FFFFFF' },
  requestInfo: { flex: 1, minWidth: 0 },
  name: { ...Typography.headline, color: '#171717' },
  note: { ...Typography.subhead, color: '#616161' },
  error: { ...Typography.subhead, color: '#B42318' },
  success: { ...Typography.subhead, color: '#18794E' },
  accept: { minHeight: 44, minWidth: 54, paddingHorizontal: 12, borderRadius: 16, backgroundColor: '#171717', alignItems: 'center', justifyContent: 'center' },
  reject: { minHeight: 44, minWidth: 54, paddingHorizontal: 12, borderRadius: 16, backgroundColor: '#F2F2F7', alignItems: 'center', justifyContent: 'center' },
  rejectLabel: { ...Typography.subheadEmphasized, color: '#171717' },
  result: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 18, backgroundColor: '#FFFFFF' },
  acceptLabel: { ...Typography.subheadEmphasized, color: '#FFFFFF' },
  input: { ...Typography.body, color: '#171717', backgroundColor: '#FFFFFF', minHeight: 48, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  contactsSheet: { backgroundColor: SCREEN_BACKGROUND },
});
