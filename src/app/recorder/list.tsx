import { Typography } from '@/constants/typography';
import { GlassBackdrop, GlassSurface } from '@/components/glass-surface';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useCallback, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { deleteRecording, getRecordings, renameRecording, type SavedRecording } from '@/services/recording-data';

export default function RecordingListPage() {
  const router = useRouter();
  const [recordings, setRecordings] = useState<SavedRecording[]>(getRecordings());
  const [selected, setSelected] = useState<SavedRecording | null>(null);
  const [dialogMode, setDialogMode] = useState<'actions' | 'rename' | 'delete'>('actions');
  const [title, setTitle] = useState('');
  const [sharing, setSharing] = useState(false);
  const [shareError, setShareError] = useState('');

  useFocusEffect(useCallback(() => {
    setRecordings([...getRecordings()]);
  }, []));

  const openActions = (recording: SavedRecording) => {
    setSelected(recording);
    setDialogMode('actions');
    setTitle(recording.title);
    setShareError('');
  };

  const closeDialog = () => {
    if (!sharing) setSelected(null);
  };

  const commitRename = () => {
    const nextTitle = title.trim();
    if (!selected || !nextTitle) return;
    renameRecording(selected.id, nextTitle);
    setRecordings([...getRecordings()]);
    setSelected(null);
  };

  const commitDelete = () => {
    if (!selected) return;
    deleteRecording(selected.id);
    setRecordings([...getRecordings()]);
    setSelected(null);
  };

  const shareRecording = async () => {
    if (!selected || sharing) return;
    setShareError('');
    if (!selected.uri) {
      setShareError('这条记录尚无音频文件，暂时无法分享。');
      return;
    }
    if (Platform.OS === 'web') {
      setShareError('请在手机 App 中分享录音文件。');
      return;
    }

    setSharing(true);
    try {
      if (!await Sharing.isAvailableAsync()) {
        setShareError('当前设备不支持文件分享。');
        return;
      }
      await Sharing.shareAsync(selected.uri, {
        mimeType: 'audio/m4a',
        dialogTitle: '分享',
      });
    } catch (error) {
      console.error('分享录音失败：', error);
      setShareError('无法分享该录音文件，请稍后重试。');
    } finally {
      setSharing(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FBF9F9' }} edges={['top', 'bottom']}>
      <GlassBackdrop />
      <StatusBar barStyle="dark-content" />
      <View style={{ minHeight: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8 }}>
        <Pressable onPress={() => router.back()} accessibilityLabel="返回" style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="chevron-back" size={23} color="#1B1C1C" />
        </Pressable>
        <Text accessibilityRole="header" dynamicTypeRamp="headline" style={{ ...Typography.headline, marginLeft: 4, flexShrink: 1, color: '#1B1C1C' }}>历史</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <View style={{ marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 }}>
          <Text dynamicTypeRamp="caption1" style={{ ...Typography.caption1, color: '#747878' }}>共 {recordings.length} 条</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><Text dynamicTypeRamp="subheadline" style={{ ...Typography.subhead, color: '#1B1C1C' }}>按时间</Text><Ionicons name="swap-vertical" size={16} color="#1B1C1C" /></View>
        </View>

        {recordings.map(recording => (
          <Pressable
            key={recording.id}
            onPress={() => router.push({ pathname: '/recorder', params: { topic: recording.title, recordingId: recording.id } })}
            style={{ marginBottom: 12 }}
          >
            <GlassSurface style={{ padding: 20, borderRadius: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
                  <Text dynamicTypeRamp="headline" style={{ ...Typography.headline, flexShrink: 1, color: '#0A0A0A' }}>{recording.title}</Text>
                  <View style={{ borderRadius: 4, backgroundColor: '#EFEDED', paddingHorizontal: 6, paddingVertical: 3 }}><Text dynamicTypeRamp="caption1" style={{ ...Typography.caption1, color: '#737373' }}>{recording.quality}</Text></View>
                </View>
                <Text dynamicTypeRamp="footnote" style={{ ...Typography.footnote, marginTop: 6, color: '#737373' }}>{recording.time} · {recording.duration}</Text>
              </View>
              <Pressable onPress={event => { event.stopPropagation(); openActions(recording); }} hitSlop={8} accessibilityRole="button" accessibilityLabel={`更多录音操作：${recording.title}`} style={{ width: 44, height: 44, marginTop: -6, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="ellipsis-horizontal" size={20} color="#747878" />
              </Pressable>
            </View>
            </GlassSurface>
          </Pressable>
        ))}
      </ScrollView>

      <Modal visible={Boolean(selected)} transparent animationType="fade" onRequestClose={closeDialog}>
        <View style={{ flex: 1, justifyContent: 'center', padding: 28, backgroundColor: 'rgba(0,0,0,0.38)' }}>
          <GlassSurface style={{ borderRadius: 28, padding: 24 }}>
            {dialogMode === 'actions' ? (
              <>
                <Pressable accessibilityRole="button" disabled={sharing} onPress={() => setDialogMode('rename')} style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Ionicons name="pencil-outline" size={20} color="#1B1C1C" /><Text dynamicTypeRamp="body" style={{ ...Typography.body, color: '#1B1C1C' }}>重命名</Text>
                </Pressable>
                <Pressable accessibilityRole="button" disabled={sharing} onPress={shareRecording} style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Ionicons name="share-outline" size={20} color="#1B1C1C" /><Text dynamicTypeRamp="body" style={{ ...Typography.body, color: '#1B1C1C' }}>{sharing ? '正在分享…' : '分享'}</Text>
                </Pressable>
                {shareError ? <Text dynamicTypeRamp="footnote" accessibilityLiveRegion="polite" style={{ ...Typography.footnote, marginBottom: 8, color: '#B42318' }}>{shareError}</Text> : null}
                <Pressable accessibilityRole="button" disabled={sharing} onPress={() => setDialogMode('delete')} style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Ionicons name="trash-outline" size={20} color="#B42318" /><Text dynamicTypeRamp="body" style={{ ...Typography.body, color: '#B42318' }}>删除</Text>
                </Pressable>
                <Pressable accessibilityRole="button" disabled={sharing} onPress={closeDialog} style={{ minHeight: 48, marginTop: 8, alignItems: 'center', justifyContent: 'center' }}><Text dynamicTypeRamp="body" style={{ ...Typography.body, color: '#737373' }}>取消</Text></Pressable>
              </>
            ) : dialogMode === 'delete' ? (
              <>
                <Text dynamicTypeRamp="headline" style={{ ...Typography.headline, marginBottom: 14, color: '#1B1C1C' }}>删除</Text>
                <Text dynamicTypeRamp="body" style={{ ...Typography.body, color: '#737373' }}>确定删除「{selected?.title}」吗？删除后无法恢复。</Text>
                <View style={{ marginTop: 18, flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
                  <Pressable accessibilityRole="button" onPress={closeDialog} style={{ minHeight: 44, paddingHorizontal: 14, justifyContent: 'center' }}><Text dynamicTypeRamp="body" style={{ ...Typography.body, color: '#737373' }}>取消</Text></Pressable>
                  <Pressable accessibilityRole="button" onPress={commitDelete} style={{ minHeight: 44, borderRadius: 999, backgroundColor: '#B42318', paddingHorizontal: 18, justifyContent: 'center' }}><Text dynamicTypeRamp="headline" style={{ ...Typography.headline, color: '#FFFFFF' }}>删除</Text></Pressable>
                </View>
              </>
            ) : (
              <>
                <Text dynamicTypeRamp="headline" style={{ ...Typography.headline, marginBottom: 14, color: '#1B1C1C' }}>重命名</Text>
                <TextInput value={title} onChangeText={setTitle} autoFocus selectTextOnFocus maxLength={60} returnKeyType="done" onSubmitEditing={commitRename} style={{ ...Typography.body, borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: '#1B1C1C' }} />
                <View style={{ marginTop: 18, flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
                  <Pressable onPress={closeDialog} style={{ paddingHorizontal: 14, paddingVertical: 10 }}><Text dynamicTypeRamp="body" style={{ ...Typography.body, color: '#737373' }}>取消</Text></Pressable>
                  <Pressable onPress={commitRename} style={{ borderRadius: 999, backgroundColor: '#171717', paddingHorizontal: 18, paddingVertical: 10 }}><Text dynamicTypeRamp="headline" style={{ ...Typography.headline, color: '#FFFFFF' }}>保存</Text></Pressable>
                </View>
              </>
            )}
          </GlassSurface>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
