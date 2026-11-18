import { GlassBackdrop, GlassSurface, GlassPressable } from '@/components/glass-surface';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { saveRecording } from '@/services/recording-data';

type MediaItem = ImagePicker.ImagePickerAsset & { localId: string };

export default function AudioPublishPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    topic?: string;
    recordingUri?: string;
    duration?: string;
    recordingId?: string;
  }>();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const topic = typeof params.topic === 'string' ? params.topic : '语音记录';
  const recordingUri = typeof params.recordingUri === 'string' ? params.recordingUri : '';
  const duration = typeof params.duration === 'string' ? params.duration : '';
  const recordingId = typeof params.recordingId === 'string' ? params.recordingId : '';
  const photos = useMemo(() => media.filter(item => item.type !== 'video').length, [media]);
  const videos = media.length - photos;

  const addMedia = async () => {
    if (media.length >= 9) {
      Alert.alert('已达到上限', '最多可添加 9 项素材。');
      return;
    }
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('需要访问权限', '请允许访问照片图库后添加素材。');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsMultipleSelection: true,
      selectionLimit: 9 - media.length,
      quality: 0.9,
    });
    if (!result.canceled) {
      setMedia(current => [
        ...current,
        ...result.assets.slice(0, 9 - current.length).map(asset => ({ ...asset, localId: `${asset.uri}-${Date.now()}` })),
      ]);
    }
  };

  const finish = () => {
    saveRecording({
      id: recordingId || `${Date.now()}`,
      title: topic,
      time: `今天 ${new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })}`,
      duration: duration || '00:00',
      quality: '48 kHz',
      uri: recordingUri,
    });
    router.replace('/recorder/list');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9F9FF' }} edges={['top', 'bottom']}>
      <GlassBackdrop />
      <StatusBar barStyle="dark-content" />

      <View style={{ height: 64, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 }}>
        <Pressable onPress={() => router.back()} className="h-11 w-11 items-center justify-center" accessibilityLabel="返回">
          <Ionicons name="chevron-back" size={23} color="#181C22" />
        </Pressable>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 20, paddingBottom: 12 }}>
        <ScrollView
          style={{ flex: 1, width: '100%' }}
          contentContainerStyle={{ flexGrow: 1, paddingTop: 8, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ marginBottom: 24, paddingTop: 8 }}>
            <Text style={{ marginBottom: 6, fontSize: 22, fontWeight: '700', color: '#0A0A0A' }}>补充更多</Text>
            <Text style={{ fontSize: 13, lineHeight: 20, color: '#737373' }}>为语音记录添加真实照片与现场视频，沉淀更生动的多维记忆。</Text>
          </View>

          <View style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={{ fontSize: 17, fontWeight: '600', color: '#181C22' }}>素材库</Text>
              <View style={{ minWidth: 20, alignItems: 'center', borderRadius: 999, backgroundColor: '#171717', paddingHorizontal: 6, paddingVertical: 2 }}><Text style={{ fontSize: 11, fontWeight: '600', color: '#FFFFFF' }}>{media.length}</Text></View>
            </View>
            {media.length > 0 && <Text style={{ fontSize: 12, color: '#737373' }}>{photos} 照片 · {videos} 视频</Text>}
          </View>

          {media.length === 0 ? (
            <GlassSurface style={{ alignItems: 'center', borderRadius: 28, paddingHorizontal: 20, paddingVertical: 36 }}>
              <View style={{ marginBottom: 16, height: 64, width: 64, alignItems: 'center', justifyContent: 'center', borderRadius: 32, borderWidth: 1, borderColor: '#EBEBEB', backgroundColor: '#FAFAFA' }}>
                <Ionicons name="images-outline" size={27} color="#171717" />
                <View style={{ position: 'absolute', right: -2, top: -2, height: 20, width: 20, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: '#171717' }}><Ionicons name="add" size={14} color="white" /></View>
              </View>
              <Text style={{ marginTop: 4, marginBottom: 8, fontSize: 18, fontWeight: '700', color: '#0A0A0A' }}>暂无多媒体素材</Text>
              <Text style={{ maxWidth: 260, marginBottom: 20, textAlign: 'center', fontSize: 13, lineHeight: 20, color: '#737373' }}>为这条语音记录添加现场照片或视频片段，让回忆更加鲜活生动</Text>
              <Pressable onPress={addMedia} style={{ height: 44, flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 24, backgroundColor: '#171717', paddingHorizontal: 28 }}>
                <Ionicons name="add" size={18} color="white" /><Text style={{ fontSize: 14, fontWeight: '600', color: '#FAFAFA' }}>添加素材</Text>
              </Pressable>
              <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="shield-checkmark-outline" size={15} color="#A3A3A3" />
                <Text style={{ fontSize: 12, color: '#737373' }}>最多可添加 9 项 · 支持 JPG / PNG / MP4</Text>
              </View>
            </GlassSurface>
          ) : (
            <View className="flex-row flex-wrap gap-2.5">
              {media.map(item => (
                <View key={item.localId} className="relative w-[31.5%] overflow-hidden rounded-xl bg-[#E6E8F1]" style={{ aspectRatio: 1 }}>
                  <Image source={{ uri: item.uri }} className="h-full w-full" resizeMode="cover" />
                  {item.type === 'video' && <View className="absolute inset-0 items-center justify-center"><View className="h-9 w-9 items-center justify-center rounded-full bg-black/60"><Ionicons name="play" size={18} color="white" /></View></View>}
                  <View className="absolute bottom-0 left-0 right-0 bg-black/50 px-1.5 py-1"><Text numberOfLines={1} className="text-[10px] text-white">{item.fileName ?? (item.type === 'video' ? '视频' : '照片')}</Text></View>
                  <Pressable onPress={() => setMedia(current => current.filter(entry => entry.localId !== item.localId))} className="absolute right-1.5 top-1.5 h-6 w-6 items-center justify-center rounded-full bg-black/60"><Ionicons name="close" size={15} color="white" /></Pressable>
                </View>
              ))}
              {media.length < 9 && <Pressable onPress={addMedia} className="w-[31.5%] items-center justify-center rounded-xl bg-[#F1F3FC]" style={{ aspectRatio: 1 }}><View className="h-9 w-9 items-center justify-center rounded-full bg-[#E0E2EB]"><Ionicons name="add" size={21} color="#414753" /></View><Text className="mt-1.5 text-[11px] font-medium text-[#737373]">添加素材</Text></Pressable>}
            </View>
          )}

          <GlassSurface style={{ marginTop: 24, borderRadius: 24, padding: 16 }}>
            <View style={{ marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}><Ionicons name="musical-notes-outline" size={17} color="#525252" /><Text style={{ fontSize: 14, fontWeight: '600', color: '#181C22' }}>音频记录</Text></View>
            <Text numberOfLines={1} style={{ fontSize: 13, color: '#737373' }}>{topic}{duration ? ` · ${duration}` : ''}</Text>
            {!recordingUri && <Text style={{ marginTop: 4, fontSize: 12, color: '#A3A3A3' }}>尚未保存录音文件</Text>}
          </GlassSurface>
        </ScrollView>

        <View style={{ flexShrink: 0, paddingTop: 8 }}>
          <GlassPressable onPress={finish} tone="dark" surfaceClassName="h-[52px] flex-row items-center justify-center gap-2" surfaceStyle={{ borderRadius: 28 }}>
            <Text className="text-[15px] font-semibold text-white">完成</Text><Ionicons name="arrow-forward" size={18} color="white" />
          </GlassPressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
