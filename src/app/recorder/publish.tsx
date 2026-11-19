import { Typography } from '@/constants/typography';
import { ContentSurface } from '@/components/content-surface';
import { GlassBackToolbar } from '@/components/glass-back-toolbar';
import { SCREEN_BACKGROUND } from '@/constants/colors';
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
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type MediaItem = ImagePicker.ImagePickerAsset & { localId: string };

export default function AudioPublishPage() {
  const router = useRouter();
  const { width, fontScale } = useWindowDimensions();
  const [gridWidth, setGridWidth] = useState(() => Math.min(Math.max(width - 40, 0), 640));
  const columns = fontScale >= 2 || gridWidth < 300 ? 1 : fontScale >= 1.5 ? 2 : 3;
  const tileWidth = (gridWidth - (columns - 1) * 10) / columns;
  const addIconSize = 44 * Math.max(1, fontScale);
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
    <SafeAreaView style={{ flex: 1, backgroundColor: SCREEN_BACKGROUND }} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />

      <View style={{ minHeight: 64, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 }}>
        <GlassBackToolbar title="素材" onBack={() => router.back()} />
      </View>

      <View style={{ flex: 1, width: '100%', maxWidth: 680, alignSelf: 'center', paddingHorizontal: 20, paddingBottom: 12 }}>
        <ScrollView
          onLayout={event => setGridWidth(event.nativeEvent.layout.width)}
          style={{ flex: 1, width: '100%' }}
          contentContainerStyle={{ flexGrow: 1, paddingTop: 8, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {media.length > 0 && (
            <View style={{ marginBottom: 16, alignItems: 'flex-end' }}>
              <Text dynamicTypeRamp="caption1" style={{ ...Typography.caption1, color: '#616161' }}>{photos} 照片 · {videos} 视频</Text>
            </View>
          )}

          {media.length === 0 ? (
            <ContentSurface style={{ alignItems: 'center', borderRadius: 28, paddingHorizontal: 20, paddingVertical: 36 }}>
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
              <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', gap: 6, maxWidth: '100%' }}>
                <Ionicons name="shield-checkmark-outline" size={15} color="#6B6B6B" />
                <Text dynamicTypeRamp="footnote" style={{ ...Typography.footnote, color: '#616161', flexShrink: 1 }}>最多可添加 9 项 · 支持 JPG / PNG / MP4</Text>
              </View>
            </ContentSurface>
          ) : (
            <View className="flex-row flex-wrap gap-2.5">
              {media.map(item => (
                <View key={item.localId} className="relative overflow-hidden rounded-xl bg-[#F5F5F5]" style={{ width: tileWidth, aspectRatio: 1 }}>
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
                    <View pointerEvents="none" className="absolute bottom-0 left-0 right-0 bg-black/80 px-1.5 py-1"><Text dynamicTypeRamp="caption1" style={Typography.caption1} numberOfLines={1} className="text-white">{item.fileName ?? (item.type === 'video' ? '视频' : '照片')}</Text></View>
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
              {media.length < 9 && <Pressable onPress={addMedia} accessibilityRole="button" accessibilityLabel="添加照片或视频" className="items-center justify-center rounded-xl bg-white active:opacity-60" style={{ width: tileWidth, aspectRatio: 1 }}><View style={{ width: addIconSize, height: addIconSize, borderRadius: addIconSize / 2, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' }}><Ionicons name="add" size={21 * Math.max(1, fontScale)} color="#414753" /></View><Text dynamicTypeRamp="caption1" style={Typography.caption1Emphasized} className="mt-1.5 text-[#616161]">添加</Text></Pressable>}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
