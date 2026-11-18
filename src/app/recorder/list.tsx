import { GlassBackdrop, GlassSurface } from '@/components/glass-surface';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getRecordings, renameRecording, type SavedRecording } from '@/services/recording-data';

export default function RecordingListPage() {
  const router = useRouter();
  const [recordings, setRecordings] = useState<SavedRecording[]>(getRecordings());
  const [editing, setEditing] = useState<SavedRecording | null>(null);
  const [title, setTitle] = useState('');

  useFocusEffect(useCallback(() => {
    setRecordings([...getRecordings()]);
  }, []));

  const openRename = (recording: SavedRecording) => {
    setEditing(recording);
    setTitle(recording.title);
  };

  const commitRename = () => {
    const nextTitle = title.trim();
    if (!editing || !nextTitle) return;
    renameRecording(editing.id, nextTitle);
    setRecordings([...getRecordings()]);
    setEditing(null);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FBF9F9' }} edges={['top', 'bottom']}>
      <GlassBackdrop />
      <StatusBar barStyle="dark-content" />
      <View style={{ height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }}>
        <Pressable onPress={() => router.back()} accessibilityLabel="返回" style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="chevron-back" size={23} color="#1B1C1C" />
        </Pressable>
        <Text style={{ marginLeft: 4, fontSize: 20, fontWeight: '700', color: '#1B1C1C' }}>录音列表</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <View style={{ marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 }}>
          <Text style={{ fontSize: 12, color: '#747878' }}>共 {recordings.length} 条录音</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><Text style={{ fontSize: 12, color: '#1B1C1C' }}>按时间</Text><Ionicons name="swap-vertical" size={16} color="#1B1C1C" /></View>
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
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text numberOfLines={1} style={{ flexShrink: 1, fontSize: 17, fontWeight: '600', color: '#0A0A0A' }}>{recording.title}</Text>
                  <View style={{ borderRadius: 4, backgroundColor: '#EFEDED', paddingHorizontal: 6, paddingVertical: 3 }}><Text style={{ fontSize: 10, color: '#737373' }}>{recording.quality}</Text></View>
                </View>
                <Text style={{ marginTop: 6, fontSize: 12, color: '#737373' }}>{recording.time} · {recording.duration}</Text>
              </View>
              <Pressable onPress={() => openRename(recording)} hitSlop={8} accessibilityLabel="重命名" style={{ width: 32, height: 32, marginTop: -6, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="ellipsis-horizontal" size={20} color="#747878" />
              </Pressable>
            </View>
            </GlassSurface>
          </Pressable>
        ))}
      </ScrollView>

      <Modal visible={Boolean(editing)} transparent animationType="fade" onRequestClose={() => setEditing(null)}>
        <View style={{ flex: 1, justifyContent: 'center', padding: 28, backgroundColor: 'rgba(0,0,0,0.38)' }}>
          <GlassSurface style={{ borderRadius: 28, padding: 24 }}>
            <Text style={{ marginBottom: 14, fontSize: 17, fontWeight: '700', color: '#1B1C1C' }}>重命名录音</Text>
            <TextInput value={title} onChangeText={setTitle} autoFocus selectTextOnFocus maxLength={60} returnKeyType="done" onSubmitEditing={commitRename} style={{ borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: '#1B1C1C' }} />
            <View style={{ marginTop: 18, flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
              <Pressable onPress={() => setEditing(null)} style={{ paddingHorizontal: 14, paddingVertical: 10 }}><Text style={{ color: '#737373' }}>取消</Text></Pressable>
              <Pressable onPress={commitRename} style={{ borderRadius: 999, backgroundColor: '#171717', paddingHorizontal: 18, paddingVertical: 10 }}><Text style={{ fontWeight: '600', color: '#FFFFFF' }}>保存</Text></Pressable>
            </View>
          </GlassSurface>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
