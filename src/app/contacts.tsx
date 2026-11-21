import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { type ComponentRef, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Keyboard, Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContactsSheet, type ContactsPanel } from '@/components/contacts-sheet';
import { ContentPressable, ContentSurface } from '@/components/content-surface';
import { GlassBackToolbar } from '@/components/glass-back-toolbar';
import { GlassPressable, GlassScreen } from '@/components/glass-surface';
import { SCREEN_BACKGROUND } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { useTheme } from '@/hooks/use-theme';
import { createContactId, getContactLabel, organizeContacts, type Contact, type ContactDirectory } from '@/services/contacts';
import { loadContactDirectory, saveContactDirectory } from '@/services/contacts-storage';
import { useAuth } from '@/store/AuthContext';

type DirectoryRow =
  | { kind: 'heading'; key: string; title: string }
  | { kind: 'entry'; key: string; contact: Contact; first: boolean; last: boolean };

function buildRows(results: ReturnType<typeof organizeContacts>, searching: boolean) {
  const rows: DirectoryRow[] = [];
  const headings: number[] = [];

  const addSection = (key: string, title: string, contacts: Contact[]) => {
    if (!contacts.length) return;
    headings.push(rows.length);
    rows.push({ kind: 'heading', key, title });
    contacts.forEach((contact, index) => {
      rows.push({ kind: 'entry', key: `${key}-${contact.id}`, contact, first: index === 0, last: index === contacts.length - 1 });
    });
  };

  if (searching) {
    addSection('results', '联系人', results.contacts);
  } else {
    results.sections.forEach(({ letter, contacts }) => {
      addSection(letter, letter, contacts);
    });
  }

  return { rows, headings };
}

export default function ContactsScreen() {
  const { user } = useAuth();
  const accountId = user ? `user-${user.id}` : 'guest';
  return <ContactDirectoryScreen key={accountId} accountId={accountId} />;
}

function ContactDirectoryScreen({ accountId }: { accountId: string }) {
  const router = useRouter();
  const { fontScale } = useWindowDimensions();
  const { accentBlue, accentBlueSubtle } = useTheme();
  const [directory, setDirectory] = useState<ContactDirectory | null>(null);
  const [query, setQuery] = useState('');
  const [showDictationHint, setShowDictationHint] = useState(false);
  const [sheet, setSheet] = useState<{ panel: ContactsPanel; visible: boolean } | null>(null);
  const [error, setError] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [loadAttempt, setLoadAttempt] = useState(0);
  const directoryRef = useRef<ContactDirectory | null>(null);
  const searchRef = useRef<ComponentRef<typeof TextInput>>(null);
  const listRef = useRef<FlatList<DirectoryRow>>(null);
  const searching = query.trim().length > 0;

  useEffect(() => {
    let active = true;
    void loadContactDirectory(accountId).then(loaded => {
      if (!active) return;
      directoryRef.current = loaded;
      setDirectory(loaded);
    }).catch(() => {
      if (active) setError(true);
    });
    return () => { active = false; };
  }, [accountId, loadAttempt]);

  const list = useMemo(() => (
    directory ? buildRows(organizeContacts(directory, query), searching) : null
  ), [directory, query, searching]);
  const entryHeight = Math.max(64, Math.ceil(46 * fontScale) + 16);
  const headingHeight = Math.max(40, Math.ceil(22 * fontScale) + 12);
  const itemLayout = useMemo(() => {
    let offset = 0;
    return list?.rows.map((row, index) => {
      const length = row.kind === 'heading' ? headingHeight : entryHeight;
      const layout = { length, offset, index };
      offset += length;
      return layout;
    }) ?? [];
  }, [entryHeight, headingHeight, list]);

  const openPanel = (next: ContactsPanel) => {
    Keyboard.dismiss();
    setSaveError('');
    setSheet({ panel: next, visible: true });
  };

  const closePanel = () => {
    Keyboard.dismiss();
    setSheet(current => current && { ...current, visible: false });
  };

  const changeQuery = (value: string) => {
    setQuery(value);
    setShowDictationHint(false);
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  };

  const updateDirectory = (update: (current: ContactDirectory) => ContactDirectory) => {
    const current = directoryRef.current;
    if (!current) return false;

    const next = update(current);
    try {
      saveContactDirectory(accountId, next);
    } catch {
      setSaveError('保存失败，请重试。');
      return false;
    }
    directoryRef.current = next;
    setDirectory(next);
    setSaveError('');
    return true;
  };

  const addContact = (phone: string, note: string) => {
    const contact: Contact = { id: createContactId(), phone, note };
    if (updateDirectory(current => ({ ...current, contacts: [...current.contacts, contact] }))) {
      openPanel({ kind: 'contact', id: contact.id });
    }
  };

  const acceptContact = (contact: Contact) => {
    updateDirectory(current => ({
      ...current,
      contacts: current.contacts.some(item => item.id === contact.id) ? current.contacts : [...current.contacts, contact],
      requests: current.requests.filter(item => item.id !== contact.id),
    }));
  };

  const toggleStar = (contact: Contact) => {
    updateDirectory(current => ({
      ...current,
      contacts: current.contacts.map(item => item.id === contact.id ? { ...item, starred: !item.starred } : item),
    }));
  };

  return (
    <GlassScreen>
      <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.fill}>
        <View style={styles.container}>
          <View style={styles.header}>
            <GlassBackToolbar title="联系人" onBack={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')} />
            <GlassPressable accessibilityLabel="添加联系人" disabled={!directory} onPress={() => openPanel({ kind: 'add' })} surfaceStyle={styles.addButton}>
              <Ionicons name="add" size={24} color={directory ? '#171717' : '#8E8E93'} />
            </GlassPressable>
          </View>

          <View style={styles.searchArea}>
            <ContentSurface style={styles.search}>
              <Ionicons name="search-outline" size={21} color="#616161" accessible={false} />
              <TextInput
                ref={searchRef}
                value={query}
                onChangeText={changeQuery}
                onBlur={() => setShowDictationHint(false)}
                onSubmitEditing={Keyboard.dismiss}
                accessibilityLabel="搜索联系人"
                placeholder="搜索联系人"
                placeholderTextColor="#616161"
                returnKeyType="search"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.searchInput}
              />
              {query ? (
                <Pressable accessibilityRole="button" accessibilityLabel="清除搜索" onPress={() => changeQuery('')} style={styles.searchAction}>
                  <Ionicons name="close-circle" size={20} color="#616161" />
                </Pressable>
              ) : (
                <Pressable accessibilityRole="button" accessibilityLabel="使用键盘语音搜索" onPress={() => { searchRef.current?.focus(); setShowDictationHint(true); }} style={styles.searchAction}>
                  <Ionicons name="mic-outline" size={21} color="#616161" />
                </Pressable>
              )}
            </ContentSurface>
            {showDictationHint && <Text accessibilityLiveRegion="polite" dynamicTypeRamp="footnote" style={styles.hint}>可使用键盘上的麦克风，输入姓名或手机号。</Text>}
          </View>

          {directory && !searching && (
            <ContentPressable style={styles.requestsOuter} surfaceStyle={styles.requests} accessibilityLabel={`新的朋友，${directory.requests.length} 条好友申请`} onPress={() => {}}>
              <View style={[styles.requestIcon, { backgroundColor: accentBlueSubtle }]}>
                <Ionicons name="person-add-outline" size={22} color={accentBlue} accessible={false} />
              </View>
              <View style={styles.rowText}>
                <Text dynamicTypeRamp="headline" style={styles.name}>新的朋友</Text>
                <Text dynamicTypeRamp="subheadline" style={styles.note}>查看好友申请</Text>
              </View>
              {directory.requests.length > 0 && (
                <View style={styles.badge}><Text dynamicTypeRamp="caption1" style={styles.badgeLabel}>{directory.requests.length}</Text></View>
              )}
              <Ionicons name="chevron-forward" size={17} color="#616161" accessible={false} />
            </ContentPressable>
          )}

          {directory && list ? (
            <FlatList
              ref={listRef}
              style={styles.fill}
              data={list.rows}
              keyExtractor={item => item.key}
              getItemLayout={(_, index) => itemLayout[index]}
              stickyHeaderIndices={list.headings}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => item.kind === 'heading' ? (
                <View style={[styles.sectionHeading, { height: headingHeight }]}>
                  <Text accessibilityRole="header" dynamicTypeRamp="footnote" style={styles.sectionLabel}>{item.title}</Text>
                </View>
              ) : (
                <DirectoryEntry row={item} height={entryHeight} onPress={() => {}} />
              )}
              ListEmptyComponent={(
                <ContentSurface style={styles.empty}>
                  <Ionicons name={searching ? 'search-outline' : 'people-outline'} size={30} color={accentBlue} accessible={false} />
                  <Text dynamicTypeRamp="headline" style={styles.name}>{searching ? '没有找到匹配的结果' : '还没有联系人'}</Text>
                  <Text dynamicTypeRamp="subheadline" style={styles.emptyNote}>{searching ? '试试其他姓名、手机号、备注或拼音。' : '添加联系人后，就可以在这里查找。'}</Text>
                  {!searching && (
                    <Pressable accessibilityRole="button" onPress={() => openPanel({ kind: 'add' })} style={styles.emptyButton}>
                      <Text dynamicTypeRamp="headline" style={styles.emptyButtonLabel}>添加联系人</Text>
                    </Pressable>
                  )}
                </ContentSurface>
              )}
              ListFooterComponent={searching ? undefined : (
                <Text dynamicTypeRamp="footnote" style={styles.footer}>
                  {directory.contacts.length} 位联系人
                </Text>
              )}
            />
          ) : (
            <View style={styles.status}>
              {error ? (
                <>
                  <Text dynamicTypeRamp="body" style={styles.emptyNote}>无法读取本机联系人。</Text>
                  <Pressable accessibilityRole="button" onPress={() => { setError(false); setLoadAttempt(value => value + 1); }} style={styles.emptyButton}>
                    <Text dynamicTypeRamp="headline" style={styles.emptyButtonLabel}>重试</Text>
                  </Pressable>
                </>
              ) : <ActivityIndicator accessibilityLabel="正在加载联系人" color={accentBlue} />}
            </View>
          )}
        </View>

        {directory && sheet && (
          <ContactsSheet
            visible={sheet.visible}
            panel={sheet.panel}
            directory={directory}
            onClose={closePanel}
            onAdd={addContact}
            onAccept={acceptContact}
            onStar={toggleStar}
            saveError={saveError}
          />
        )}
      </SafeAreaView>
    </GlassScreen>
  );
}

function DirectoryEntry({ row, height, onPress }: { row: Extract<DirectoryRow, { kind: 'entry' }>; height: number; onPress: () => void }) {
  const { accentBlue, accentBlueSubtle } = useTheme();
  const { name, note } = row.contact;
  const label = getContactLabel(row.contact);
  const avatar = name ? Array.from(name.trim())[0]?.toUpperCase() : undefined;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={note ? `${label}，${note}` : label}
      onPress={onPress}
      style={({ pressed }) => [styles.entry, { height }, row.first && styles.entryFirst, row.last ? styles.entryLast : styles.entryDivider, pressed && styles.entryPressed]}
    >
      <View style={[styles.avatar, { backgroundColor: accentBlueSubtle }]} accessible={false}>
        {avatar
          ? <Text allowFontScaling={false} style={styles.avatarLabel}>{avatar}</Text>
          : <Ionicons name="call-outline" size={19} color={accentBlue} accessible={false} />}
      </View>
      <View style={styles.rowText}>
        <Text numberOfLines={1} dynamicTypeRamp="headline" style={styles.name}>{label}</Text>
        {note ? <Text numberOfLines={1} dynamicTypeRamp="subheadline" style={styles.note}>{note}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={16} color="#616161" accessible={false} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  container: { flex: 1, alignSelf: 'center', width: '100%', maxWidth: 680, paddingHorizontal: 16 },
  header: { minHeight: 64, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  addButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  searchArea: { marginTop: 6, marginBottom: 12, gap: 6 },
  search: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 18, paddingStart: 14, paddingEnd: 4 },
  searchInput: { ...Typography.body, flex: 1, minWidth: 0, paddingVertical: 12, color: '#171717' },
  searchAction: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  hint: { ...Typography.footnote, color: '#616161', paddingHorizontal: 6 },
  requestsOuter: { marginBottom: 8 },
  requests: { minHeight: 66, borderRadius: 20, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, gap: 11 },
  requestIcon: { width: 42, height: 42, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  badge: { minWidth: 21, minHeight: 21, borderRadius: 12, paddingHorizontal: 5, backgroundColor: '#B42318', alignItems: 'center', justifyContent: 'center' },
  badgeLabel: { ...Typography.caption1Emphasized, color: '#FFFFFF' },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 8, backgroundColor: SCREEN_BACKGROUND },
  sectionLabel: { ...Typography.footnoteEmphasized, color: '#404040' },
  entry: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 10, backgroundColor: '#FFFFFF' },
  entryFirst: { borderTopLeftRadius: 18, borderTopRightRadius: 18 },
  entryLast: { borderBottomLeftRadius: 18, borderBottomRightRadius: 18 },
  entryDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E5E5' },
  entryPressed: { backgroundColor: '#EDEDF2' },
  avatar: { width: 42, height: 42, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  avatarLabel: { ...Typography.headline, color: '#171717' },
  rowText: { flex: 1, minWidth: 0, gap: 3 },
  name: { ...Typography.headline, color: '#171717' },
  note: { ...Typography.subhead, color: '#616161' },
  footer: { ...Typography.footnote, color: '#616161', textAlign: 'center', paddingVertical: 22 },
  empty: { marginTop: 8, padding: 20, alignItems: 'center', gap: 10 },
  emptyNote: { ...Typography.subhead, color: '#616161', textAlign: 'center' },
  emptyButton: { minHeight: 44, borderRadius: 22, paddingHorizontal: 18, justifyContent: 'center', backgroundColor: '#171717' },
  emptyButtonLabel: { ...Typography.headline, color: '#FFFFFF' },
  status: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
});
