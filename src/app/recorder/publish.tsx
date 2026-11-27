import { Typography } from '@/constants/typography';
import { ContentSurface } from '@/components/content-surface';
import { GlassBackToolbar } from '@/components/glass-back-toolbar';
import { SCREEN_BACKGROUND } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { useEffect, useMemo, useState } from 'react';
import { useVideoPlayer, VideoView } from 'expo-video';
import {
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  completeAndAttachRecordingAssets,
  deleteRecordingAttachment,
  getRecordingAttachments,
  requestAttachmentUploadAuthorizations,
} from '@/services/recordingService';
import type { AttachmentUploadAuthorizationItem, RecordingAttachment } from '@/types/recording';

type MediaItem = ImagePicker.ImagePickerAsset & { localId: string; contentType: string; mediaType: 'image' | 'video' | 'audio' };

function UploadedAttachmentTile({
  attachment,
  width,
  selected,
  onSelect,
  onPlayVideo,
  onRemove,
}: {
  attachment: RecordingAttachment;
  width: number;
  selected: boolean;
  onSelect: () => void;
  onPlayVideo: () => void;
  onRemove: () => void;
}) {
  const mediaType = attachment.asset?.media_type;
  const downloadUrl = attachment.asset?.download_url ?? null;
  const player = useVideoPlayer(mediaType === 'video' ? downloadUrl : null);
  const [thumbnail, setThumbnail] = useState<{ uri: string } | null>(null);

  useEffect(() => {
    if (mediaType !== 'video' || !downloadUrl) return;
    let active = true;
    player.generateThumbnailsAsync(0)
      .then(images => { if (active && images[0]) setThumbnail(images[0]); })
      .catch(() => undefined);
    return () => { active = false; };
  }, [downloadUrl, mediaType, player]);

  return (
    <View className="relative overflow-hidden rounded-xl bg-[#F5F5F5]" style={{ width, aspectRatio: 1 }}>
      <Pressable
        onPress={mediaType === 'video' ? onPlayVideo : onSelect}
        accessibilityRole="button"
        accessibilityLabel={`${mediaType === 'video' ? '播放视频' : '附件'}：${attachment.asset?.filename ?? `附件 ${attachment.id}`}`}
        style={{ flex: 1 }}
      >
        {mediaType === 'image' && downloadUrl
          ? <Image source={{ uri: downloadUrl }} className="h-full w-full" resizeMode="cover" />
          : mediaType === 'video' && thumbnail
            ? <Image source={thumbnail} className="h-full w-full" resizeMode="cover" />
            : <View className="h-full w-full items-center justify-center"><Ionicons name={mediaType === 'video' ? 'videocam-outline' : mediaType === 'audio' ? 'musical-notes-outline' : 'attach-outline'} size={38} color="#414753" /></View>}
        {mediaType === 'video' && <View pointerEvents="none" className="absolute inset-0 items-center justify-center"><View className="h-9 w-9 items-center justify-center rounded-full bg-black/60"><Ionicons name="play" size={18} color="white" /></View></View>}
        <View pointerEvents="none" className="absolute bottom-0 left-0 right-0 bg-black/80 px-1.5 py-1"><Text dynamicTypeRamp="caption1" style={Typography.caption1} numberOfLines={1} className="text-white">{attachment.asset?.filename ?? `附件 ${attachment.id}`}</Text></View>
      </Pressable>
      {selected && <Pressable onPress={onRemove} accessibilityRole="button" accessibilityLabel={`删除${attachment.asset?.filename ?? '附件'}`} style={{ position: 'absolute', right: 0, top: 0, width: 44, height: 44, zIndex: 1, alignItems: 'center', justifyContent: 'center' }}><View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' }}><Ionicons name="trash-outline" size={17} color="white" /></View></Pressable>}
      {mediaType === 'video' && downloadUrl && <VideoView player={player} style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }} />}
    </View>
  );
}

function resolveUploadUrl(uploadUrl: string): string {
  const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl;
  if (typeof apiBaseUrl !== 'string' || !apiBaseUrl) return uploadUrl;
  try {
    const signedUrl = new URL(uploadUrl);
    const apiUrl = new URL(apiBaseUrl);
    if (['127.0.0.1', 'localhost', '0.0.0.0'].includes(signedUrl.hostname)) {
      signedUrl.protocol = apiUrl.protocol;
      signedUrl.host = apiUrl.host;
    }
    return signedUrl.toString();
  } catch {
    return uploadUrl;
  }
}

function mediaTypeFor(contentType: string, filename: string): 'image' | 'video' | 'audio' {
  const type = contentType.split(';', 1)[0].toLowerCase();
  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('video/')) return 'video';
  if (type.startsWith('audio/')) return 'audio';
  const extension = filename.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif', 'bmp', 'avif'].includes(extension ?? '')) return 'image';
  if (['mp4', 'mov', 'm4v', 'webm', 'mkv', 'avi', '3gp'].includes(extension ?? '')) return 'video';
  return 'audio';
}

function contentTypeFor(contentType: string | null | undefined, filename: string): string {
  if (contentType && contentType !== 'application/octet-stream') return contentType.split(';', 1)[0];
  const extension = filename.split('.').pop()?.toLowerCase();
  const known: Record<string, string> = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp', heic: 'image/heic', heif: 'image/heif',
    mp4: 'video/mp4', mov: 'video/quicktime', m4v: 'video/x-m4v', webm: 'video/webm', mkv: 'video/x-matroska', avi: 'video/x-msvideo',
    mp3: 'audio/mpeg', m4a: 'audio/mp4', aac: 'audio/aac', wav: 'audio/wav', flac: 'audio/flac', ogg: 'audio/ogg', opus: 'audio/opus',
  };
  return known[extension ?? ''] ?? 'application/octet-stream';
}

function createClientFileId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, character => {
    const random = Math.floor(Math.random() * 16);
    const value = character === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

export default function AudioPublishPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ sessionId?: string | string[] }>();
  const sessionIdParam = Array.isArray(params.sessionId) ? params.sessionId[0] : params.sessionId;
  const sessionId = sessionIdParam && /^\d+$/.test(sessionIdParam) ? sessionIdParam : null;
  const { width, fontScale } = useWindowDimensions();
  const [gridWidth, setGridWidth] = useState(() => Math.min(Math.max(width - 40, 0), 640));
  const columns = fontScale >= 2 || gridWidth < 300 ? 1 : fontScale >= 1.5 ? 2 : 3;
  const tileWidth = (gridWidth - (columns - 1) * 10) / columns;
  const addIconSize = 44 * Math.max(1, fontScale);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [attachments, setAttachments] = useState<RecordingAttachment[]>([]);
  const [removedAttachmentIds, setRemovedAttachmentIds] = useState<number[]>([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);
  const [playingVideo, setPlayingVideo] = useState<RecordingAttachment | null>(null);
  const photos = useMemo(() => media.filter(item => item.mediaType === 'image').length, [media]);
  const videos = useMemo(() => media.filter(item => item.mediaType === 'video').length, [media]);
  const audios = media.length - photos - videos;
  const visibleAttachments = attachments.filter(item => !removedAttachmentIds.includes(item.id));

  useEffect(() => {
    if (!sessionId) return;
    let active = true;
    getRecordingAttachments(sessionId)
      .then(items => { if (active) { setAttachments(items); setLoadingAttachments(false); } })
      .catch(error => { if (active) Alert.alert('加载附件失败', error instanceof Error ? error.message : '请稍后重试。'); })
      .finally(() => { if (active) setLoadingAttachments(false); });
    return () => { active = false; };
  }, [sessionId]);

  const addMedia = async () => {
    setSelectedMediaId(null);
    if (media.length + attachments.length - removedAttachmentIds.length >= 9) {
      Alert.alert('已达到上限', '最多可添加 9 项附件。');
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
      quality: 1,
    });
    if (!result.canceled) {
      setMedia(current => [
        ...current,
        ...result.assets.slice(0, Math.max(0, 9 - current.length - attachments.length + removedAttachmentIds.length)).map(asset => {
          const fileName = asset.fileName ?? `附件-${Date.now()}`;
          const contentType = contentTypeFor(asset.mimeType, fileName);
          return { ...asset, localId: createClientFileId(), contentType, mediaType: mediaTypeFor(contentType, fileName) };
        }),
      ]);
    }
  };

  const addFiles = async () => {
    setSelectedMediaId(null);
    if (media.length + attachments.length - removedAttachmentIds.length >= 9) {
      Alert.alert('已达到上限', '最多可添加 9 项附件。');
      return;
    }
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/*', 'video/*', 'audio/*'],
      multiple: true,
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;
    const remaining = Math.max(0, 9 - media.length - attachments.length + removedAttachmentIds.length);
    const picked = result.assets.slice(0, remaining).map(asset => {
      const contentType = contentTypeFor(asset.mimeType, asset.name);
      return {
        uri: asset.uri,
        fileName: asset.name,
        fileSize: asset.size,
        mimeType: contentType,
        type: mediaTypeFor(contentType, asset.name),
        localId: createClientFileId(),
        contentType,
        mediaType: mediaTypeFor(contentType, asset.name),
      } as MediaItem;
    });
    setMedia(current => [...current, ...picked]);
  };

  const saveAttachments = async () => {
    if (!sessionId) {
      Alert.alert('无法上传', '缺少录音会话 ID。请从录音会话进入附件页面后重试。');
      return;
    }
    if (saving) return;
    setSaving(true);
    try {
      if (media.length > 0) {
        const localFiles = media.map(item => {
          const file = new File(item.uri);
          if (!file.exists || file.size <= 0) throw new Error(`无法读取文件：${item.fileName ?? '未命名附件'}`);
          const filename = item.fileName || file.name || `attachment-${Date.now()}`;
          const contentType = contentTypeFor(item.contentType || item.mimeType, filename);
          return { item, file, filename, contentType, sizeBytes: item.fileSize || file.size };
        });
        const requestItems: AttachmentUploadAuthorizationItem[] = localFiles.map(({ item, filename, contentType, file }) => ({
          client_file_id: item.localId,
          filename,
          media_type: mediaTypeFor(contentType, filename),
          content_type: contentType,
          size_bytes: file.size,
        }));
        const authorizationResponse = await requestAttachmentUploadAuthorizations(sessionId, requestItems);
        const authorizationById = new Map(authorizationResponse.items.map(item => [item.client_file_id, item]));
        const completedItems: { client_file_id: string; asset_id: number }[] = [];
        for (const localFile of localFiles) {
          const authorization = authorizationById.get(localFile.item.localId);
          if (!authorization || !authorization.upload_url) throw new Error(`服务器未返回 ${localFile.filename} 的上传地址。`);
          const response = await localFile.file.upload(resolveUploadUrl(authorization.upload_url), {
            httpMethod: authorization.upload_method,
            mimeType: localFile.contentType,
            headers: authorization.required_headers,
          });
          if (response.status < 200 || response.status >= 300) {
            const detail = response.body?.trim();
            throw new Error(`${localFile.filename} 上传失败 (${response.status})${detail ? `：${detail.slice(0, 240)}` : ''}`);
          }
          completedItems.push({ client_file_id: localFile.item.localId, asset_id: authorization.asset_id });
        }
        await completeAndAttachRecordingAssets(sessionId, completedItems);
      }

      for (const attachmentId of removedAttachmentIds) await deleteRecordingAttachment(sessionId, attachmentId);
      const latest = await getRecordingAttachments(sessionId);
      setAttachments(latest);
      setRemovedAttachmentIds([]);
      setMedia([]);
      Alert.alert('保存成功', '附件已同步到录音会话。');
    } catch (error) {
      Alert.alert('保存失败', error instanceof Error ? error.message : '请稍后重试。');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: SCREEN_BACKGROUND }} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />

      <View style={{ minHeight: 64, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 }}>
        <GlassBackToolbar title="素材" onBack={() => router.back()} />
        <Pressable onPress={saveAttachments} disabled={saving || loadingAttachments} accessibilityRole="button" style={({ pressed }) => ({ marginLeft: 'auto', minHeight: 42, justifyContent: 'center', paddingHorizontal: 12, opacity: pressed || saving || loadingAttachments ? 0.55 : 1 })}>
          {saving ? <ActivityIndicator color="#171717" /> : <Text dynamicTypeRamp="headline" style={{ ...Typography.headline, color: '#171717' }}>上传</Text>}
        </Pressable>
      </View>

      <View style={{ flex: 1, width: '100%', maxWidth: 680, alignSelf: 'center', paddingHorizontal: 20, paddingBottom: 12 }}>
        <ScrollView
          onLayout={event => setGridWidth(event.nativeEvent.layout.width)}
          style={{ flex: 1, width: '100%' }}
          contentContainerStyle={{ flexGrow: 1, paddingTop: 8, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {(media.length > 0 || attachments.length > 0) && (
            <View style={{ marginBottom: 16, alignItems: 'flex-end' }}>
              <Text dynamicTypeRamp="caption1" style={{ ...Typography.caption1, color: '#616161' }}>{photos} 照片 · {videos} 视频 · {audios} 音频 · 已上传 {attachments.length - removedAttachmentIds.length}</Text>
            </View>
          )}

          {loadingAttachments && <View style={{ alignItems: 'center', paddingVertical: 16 }}><ActivityIndicator color="#616161" /></View>}

          {media.length === 0 && visibleAttachments.length === 0 ? (
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
                <Text dynamicTypeRamp="footnote" style={{ ...Typography.footnote, color: '#616161', flexShrink: 1 }}>最多可添加 9 项 · 支持图片、视频和音频</Text>
              </View>
              <Pressable onPress={addFiles} accessibilityRole="button" style={({ pressed }) => ({ marginTop: 20, minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 22, backgroundColor: '#F2F2F2', paddingHorizontal: 16, opacity: pressed ? 0.6 : 1 })}><Ionicons name="document-attach-outline" size={18} color="#171717" /><Text style={{ ...Typography.footnote, color: '#171717' }}>从文件中选择</Text></Pressable>
            </ContentSurface>
          ) : (
            <View className="flex-row flex-wrap gap-2.5">
              {visibleAttachments.map(item => (
                <UploadedAttachmentTile
                  key={`attachment-${item.id}`}
                  attachment={item}
                  width={tileWidth}
                  selected={selectedMediaId === `attachment-${item.id}`}
                  onSelect={() => setSelectedMediaId(current => current === `attachment-${item.id}` ? null : `attachment-${item.id}`)}
                  onPlayVideo={() => setPlayingVideo(item)}
                  onRemove={() => {
                    setRemovedAttachmentIds(current => [...current, item.id]);
                    setSelectedMediaId(null);
                  }}
                />
              ))}
              {media.map(item => (
                <View key={item.localId} className="relative overflow-hidden rounded-xl bg-[#F5F5F5]" style={{ width: tileWidth, aspectRatio: 1 }}>
                  <Pressable
                    onPress={() => setSelectedMediaId(current => current === item.localId ? null : item.localId)}
                    accessibilityRole="button"
                    accessibilityLabel={`${item.mediaType === 'video' ? '视频' : item.mediaType === 'audio' ? '音频' : '照片'}：${item.fileName ?? '未命名'}`}
                    accessibilityHint="点击显示或隐藏删除按钮"
                    accessibilityState={{ selected: selectedMediaId === item.localId }}
                    style={{ flex: 1 }}
                  >
                    {item.mediaType === 'image' ? <Image source={{ uri: item.uri }} className="h-full w-full" resizeMode="cover" /> : <View className="h-full w-full items-center justify-center"><Ionicons name={item.mediaType === 'video' ? 'videocam-outline' : 'musical-notes-outline'} size={38} color="#414753" /></View>}
                    {(item.mediaType === 'video' || item.mediaType === 'audio') && <View pointerEvents="none" className="absolute inset-0 items-center justify-center"><View className="h-9 w-9 items-center justify-center rounded-full bg-black/60"><Ionicons name={item.mediaType === 'video' ? 'play' : 'musical-notes'} size={18} color="white" /></View></View>}
                    <View pointerEvents="none" className="absolute bottom-0 left-0 right-0 bg-black/80 px-1.5 py-1"><Text dynamicTypeRamp="caption1" style={Typography.caption1} numberOfLines={1} className="text-white">{item.fileName ?? '附件'}</Text></View>
                  </Pressable>
                  {selectedMediaId === item.localId && (
                    <Pressable
                      onPress={() => {
                        setMedia(current => current.filter(entry => entry.localId !== item.localId));
                        setSelectedMediaId(null);
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`删除附件：${item.fileName ?? '未命名'}`}
                      style={({ pressed }) => ({ position: 'absolute', right: 0, top: 0, width: 44, height: 44, zIndex: 1, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}
                    >
                      <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="trash-outline" size={17} color="white" />
                      </View>
                    </Pressable>
                  )}
                </View>
              ))}
              {media.length + visibleAttachments.length < 9 && <View style={{ width: tileWidth, aspectRatio: 1, gap: 6 }}><Pressable onPress={addMedia} accessibilityRole="button" accessibilityLabel="添加照片或视频" className="flex-1 items-center justify-center rounded-xl bg-white active:opacity-60"><View style={{ width: addIconSize, height: addIconSize, borderRadius: addIconSize / 2, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' }}><Ionicons name="add" size={21 * Math.max(1, fontScale)} color="#414753" /></View><Text dynamicTypeRamp="caption1" style={Typography.caption1Emphasized} className="mt-1.5 text-[#616161]">添加照片/视频</Text></Pressable><Pressable onPress={addFiles} accessibilityRole="button" accessibilityLabel="从文件中选择附件" className="flex-row items-center justify-center gap-1 rounded-lg bg-white active:opacity-60"><Ionicons name="document-attach-outline" size={16} color="#414753" /><Text dynamicTypeRamp="caption1" style={Typography.caption1} className="text-[#616161]">文件</Text></Pressable></View>}
            </View>
          )}
        </ScrollView>
      </View>
      <Modal visible={Boolean(playingVideo)} transparent animationType="fade" onRequestClose={() => setPlayingVideo(null)}>
        <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.92)', padding: 16 }}>
          <Pressable onPress={() => setPlayingVideo(null)} accessibilityRole="button" accessibilityLabel="关闭视频" style={{ alignSelf: 'flex-end', padding: 12 }}><Ionicons name="close" size={28} color="white" /></Pressable>
          {playingVideo?.asset?.download_url && <AttachmentVideoPlayer key={playingVideo.id} uri={playingVideo.asset.download_url} />}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function AttachmentVideoPlayer({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, instance => { instance.play(); });
  return <VideoView player={player} style={{ width: '100%', aspectRatio: 16 / 9 }} contentFit="contain" fullscreenOptions={{ enable: true }} />;
}
