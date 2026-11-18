import { Typography } from '@/constants/typography';
import { GlassBackdrop, GlassSurface } from '@/components/glass-surface';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
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

type MediaItem = ImagePicker.ImagePickerAsset & { localId: string };

export default function AudioPublishPage() {
  const router = useRouter();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);
  const photos = useMemo(() => media.filter(item => item.type !== 'video').length, [media]);
  const videos = media.length - photos;

  const addMedia = async () => {
    setSelectedMediaId(null);
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9F9FF' }} edges={['top', 'bottom']}>
      <GlassBackdrop />
      <StatusBar barStyle="dark-content" />

      <View style={{ minHeight: 64, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 }}>
        <Pressable onPress={() => router.back()} className="h-11 w-11 shrink-0 items-center justify-center" accessibilityRole="button" accessibilityLabel="返回">
          <Ionicons name="chevron-back" size={23} color="#181C22" />
        </Pressable>
        <Text
          accessibilityRole="header"
          dynamicTypeRamp="headline"
          style={{ ...Typography.headline, marginLeft: 4, flexShrink: 1, color: '#1B1C1C' }}
        >
          更多
        </Text>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 20, paddingBottom: 12 }}>
        <ScrollView
          style={{ flex: 1, width: '100%' }}
          contentContainerStyle={{ flexGrow: 1, paddingTop: 8, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {media.length > 0 && (
            <View style={{ marginBottom: 16, alignItems: 'flex-end' }}>
              <Text dynamicTypeRamp="caption1" style={{ ...Typography.caption1, color: '#737373' }}>{photos} 照片 · {videos} 视频</Text>
            </View>
          )}

          {media.length === 0 ? (
            <GlassSurface style={{ alignItems: 'center', borderRadius: 28, paddingHorizontal: 20, paddingVertical: 36 }}>
              <Pressable
                onPress={addMedia}
                accessibilityRole="button"
                accessibilityLabel="添加照片或视频"
                style={({ pressed }) => ({ alignItems: 'center', opacity: pressed ? 0.6 : 1 })}
              >
                <View style={{ marginBottom: 16, height: 64, width: 64, alignItems: 'center', justifyContent: 'center', borderRadius: 32, borderWidth: 1, borderColor: '#EBEBEB', backgroundColor: '#FAFAFA' }}>
                  <Ionicons name="images-outline" size={27} color="#171717" />
                  <View style={{ position: 'absolute', right: -2, top: -2, height: 20, width: 20, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: '#171717' }}><Ionicons name="add" size={14} color="white" /></View>
                </View>
                <Text dynamicTypeRamp="headline" style={{ ...Typography.headline, marginTop: 4, color: '#0A0A0A' }}>点击添加照片或视频</Text>
              </Pressable>
              <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="shield-checkmark-outline" size={15} color="#A3A3A3" />
                <Text dynamicTypeRamp="footnote" style={{ ...Typography.footnote, color: '#737373' }}>最多可添加 9 项 · 支持 JPG / PNG / MP4</Text>
              </View>
            </GlassSurface>
          ) : (
            <View className="flex-row flex-wrap gap-2.5">
              {media.map(item => (
                <View key={item.localId} className="relative w-[31.5%] overflow-hidden rounded-xl bg-[#E6E8F1]" style={{ aspectRatio: 1 }}>
                  <Pressable
                    onPress={() => setSelectedMediaId(current => current === item.localId ? null : item.localId)}
                    accessibilityRole="button"
                    accessibilityLabel={`${item.type === 'video' ? '视频' : '照片'}：${item.fileName ?? '未命名'}`}
                    accessibilityHint="点击显示或隐藏删除按钮"
                    accessibilityState={{ selected: selectedMediaId === item.localId }}
                    style={{ flex: 1 }}
                  >
                    <Image source={{ uri: item.uri }} className="h-full w-full" resizeMode="cover" />
                    {item.type === 'video' && <View pointerEvents="none" className="absolute inset-0 items-center justify-center"><View className="h-9 w-9 items-center justify-center rounded-full bg-black/60"><Ionicons name="play" size={18} color="white" /></View></View>}
                    <View pointerEvents="none" className="absolute bottom-0 left-0 right-0 bg-black/50 px-1.5 py-1"><Text dynamicTypeRamp="caption1" style={Typography.caption1} numberOfLines={1} className="text-white">{item.fileName ?? (item.type === 'video' ? '视频' : '照片')}</Text></View>
                  </Pressable>
                  {selectedMediaId === item.localId && (
                    <Pressable
                      onPress={() => {
                        setMedia(current => current.filter(entry => entry.localId !== item.localId));
                        setSelectedMediaId(null);
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`删除${item.type === 'video' ? '视频' : '照片'}：${item.fileName ?? '未命名'}`}
                      style={({ pressed }) => ({ position: 'absolute', right: 0, top: 0, width: 44, height: 44, zIndex: 1, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}
                    >
                      <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="trash-outline" size={17} color="white" />
                      </View>
                    </Pressable>
                  )}
                </View>
              ))}
              {media.length < 9 && <Pressable onPress={addMedia} className="w-[31.5%] items-center justify-center rounded-xl bg-[#F1F3FC]" style={{ aspectRatio: 1 }}><View className="h-9 w-9 items-center justify-center rounded-full bg-[#E0E2EB]"><Ionicons name="add" size={21} color="#414753" /></View><Text dynamicTypeRamp="caption1" style={Typography.caption1Emphasized} className="mt-1.5 text-[#737373]">添加</Text></Pressable>}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
