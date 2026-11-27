import { BottomSheet, BottomSheetScrollView } from '@/components/bottom-sheet';
import { GlassBackToolbar } from '@/components/glass-back-toolbar';
import { GlassPressable, GlassToolbar } from '@/components/glass-surface';
import { RecordingEmptyState } from '@/components/recording-empty-state';
import { useGlassAccessibility } from '@/components/ui/liquid-glass';
import { SCREEN_BACKGROUND } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { useTheme } from '@/hooks/use-theme';
import { getRecordingSessionDetail, uploadRecordingToSession } from '@/services/recordingService';

import type { RecordingSessionDetail } from '@/types/recording';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, usePreventRemove, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  AudioModule,
  createAudioPlayer,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';

import * as Sharing from 'expo-sharing';

interface RecordingItem {
  id: string;
  title: string;
  time: string;
  duration: string;
  durationMillis: number;
  quality: string;
  uri: string;
  waveform: number[];
}

type SessionLoadState =
  | { sessionId: string; status: 'loading' | 'loaded' }
  | { sessionId: string; status: 'error'; message: string };

const REST_WAVE = [
  8, 12, 8, 16, 8, 14, 20, 10, 16, 24,
  12, 20, 10, 26, 16, 12, 22, 9, 14, 8,
];

const CARD_WAVE = [
  8, 12, 20, 8, 16, 24, 12, 20, 8,
  16, 20, 12, 24, 16, 8, 16, 12,
];

const MAX_RECORDING_DURATION_MS = 10 * 60 * 1000;
const RECORDING_SAMPLE_RATE_HZ = 44_100;

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const formatDuration = (milliseconds: number) => {
  return formatTime(Math.floor(milliseconds / 1000));
};

const getCurrentTime = () => {
  const now = new Date();

  return `${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes()
  ).padStart(2, '0')}`;
};

const formatRecordedAt = (value: string | null) => {
  if (!value) return '录音时间未知';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `今天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
};

function mapSessionToRecordings(session: RecordingSessionDetail): RecordingItem[] {
  const fragments = Array.isArray(session.fragments) ? session.fragments : [];
  return fragments.map(fragment => {
    const asset = fragment.source_asset;
    const durationMillis = asset?.duration_ms ?? 0;
    return {
      id: String(fragment.id),
      title: asset?.filename || session.title || session.topic_title || '录音',
      time: formatRecordedAt(fragment.recorded_at ?? asset?.created_at ?? null),
      duration: formatDuration(durationMillis),
      durationMillis,
      quality: asset?.sample_rate_hz ? `${(asset.sample_rate_hz / 1000).toFixed(1)} kHz` : '音频',
      uri: asset?.download_url ?? '',
      waveform: CARD_WAVE,
    };
  });
}

// =====================================================
// 波形组件
// =====================================================

function Waveform({
  data,
  color = '#6B6B6B',
  barWidth = 2,
}: {
  data: number[];
  color?: string;
  barWidth?: number;
}) {
  return (
    <View className="h-6 w-full flex-row items-center justify-around gap-[3px] overflow-hidden">
      {data.map((height, index) => (
        <View
          key={index}
          style={{
            width: barWidth,
            height,
            backgroundColor: color,
            borderRadius: 4,
          }}
        />
      ))}
    </View>
  );
}

// =====================================================
// 已完成录音卡片
// =====================================================

function RecordingCard({
  item,
  onPlay,
  onShare,
  onMore,
  playing,
}: {
  item: RecordingItem;
  onPlay: () => void;
  onShare: () => void;
  onMore: () => void;
  playing: boolean;
}) {
  return (
    <View className="w-full p-5" style={{ borderRadius: 24, backgroundColor: '#FFFFFF' }}>
      {/* 标题区域 */}
      <View className="flex-row items-start gap-2">
        <View className="min-w-0 flex-1 gap-1">
          <View className="flex-row flex-wrap items-center gap-2">
            <Text dynamicTypeRamp="headline"
              className="flex-1"
              style={{ ...Typography.headline, color: '#111111' }}
            >
              {item.title}
            </Text>

            <View
              className="shrink-0 rounded-md border px-1.5 py-0.5"
              style={{ backgroundColor: '#F3F4F6', borderColor: '#E5E7EB' }}
            >
              <Text dynamicTypeRamp="caption1" style={{ ...Typography.caption1, color: '#4B5563' }}>
                已转文字
              </Text>
            </View>
          </View>

          <View className="flex-row flex-wrap items-center gap-2">
            <Text dynamicTypeRamp="footnote" style={{ ...Typography.footnote, color: '#4B5563' }}>
              {item.time}
            </Text>

            <Text dynamicTypeRamp="footnote" style={{ ...Typography.footnote, color: '#4B5563' }}>•</Text>

            <Text dynamicTypeRamp="footnote" style={{ ...Typography.footnoteEmphasized, color: '#2b2b2b' }}>
              {item.duration}
            </Text>

            <Text dynamicTypeRamp="footnote" style={{ ...Typography.footnote, color: '#4B5563' }}>•</Text>

            <Text dynamicTypeRamp="footnote" style={{ ...Typography.footnote, color: '#4B5563' }}>
              {item.quality}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={onMore}
          accessibilityRole="button"
          accessibilityLabel="更多录音操作"
          className="h-11 w-11 shrink-0 items-center justify-center rounded-full active:bg-muted"
          hitSlop={8}
        >
          <Ionicons
            name="ellipsis-vertical"
            size={18}
            color="#6B6B6B"
          />
        </Pressable>
      </View>

      {/* 播放区域 */}
      <View className="mt-3 flex-row items-center gap-3 border-t pt-3" style={{ borderTopColor: '#E5E7EB' }}>
        <Pressable
          onPress={onPlay}
          accessibilityRole="button"
          accessibilityLabel={playing ? '暂停播放' : '播放录音'}
          className="h-11 w-11 items-center justify-center rounded-full active:opacity-60"
          style={{ backgroundColor: '#F3F4F6' }}
        >
          <Ionicons
            name={playing ? 'pause' : 'play'}
            size={17}
            color="#525252"
          />
        </Pressable>

        <View className="flex-1 overflow-hidden opacity-70">
          <Waveform data={item.waveform} />
        </View>

        <Pressable
          onPress={onShare}
          accessibilityRole="button"
          accessibilityLabel="分享录音"
          className="h-11 w-11 items-center justify-center active:opacity-60"
        >
          <Ionicons
            name="share-outline"
            size={17}
            color="#6B6B6B"
          />
        </Pressable>
      </View>
    </View>
  );
}

// =====================================================
// 录音底部弹层
// =====================================================

function RecordingSheet({
  visible,
  isRecording,
  isStopping,
  seconds,
  waveHeights,
  onStop,
}: {
  visible: boolean;
  isRecording: boolean;
  isStopping: boolean;
  seconds: number;
  waveHeights: number[];
  onStop: () => void;
}) {
  const { accentBlue, accentBlueMuted } = useTheme();
  const elapsed = formatTime(seconds);

  return (
    <BottomSheet visible={visible}>
      <BottomSheetScrollView
        automaticallyAdjustContentInsets={false}
        alwaysBounceVertical={false}
        contentContainerStyle={{ gap: 12, paddingTop: 12, paddingBottom: 4 }}
      >
        <Text
          accessibilityLabel={`录音时长 ${elapsed}`}
          dynamicTypeRamp="largeTitle"
          className="text-center"
          style={{ ...Typography.largeTitle, fontVariant: ['tabular-nums'], color: '#111111' }}
        >
          {elapsed}
        </Text>

        <View
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          className="h-16 flex-row items-center justify-center gap-1 overflow-hidden rounded-2xl bg-[#F3F4F6]"
        >
          {waveHeights.map((height, index) => (
            <View
              key={index}
              style={{
                width: 3,
                height,
                backgroundColor: isRecording ? accentBlue : accentBlueMuted,
                borderRadius: 4,
              }}
            />
          ))}
        </View>

        <View className="flex-row flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <View className="flex-row items-center gap-1.5">
            <Ionicons name="stats-chart-outline" size={15} color="#616161" accessible={false} />
            <Text dynamicTypeRamp="footnote" style={{ ...Typography.footnote, color: '#4B5563' }}>48.0 kHz</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <Ionicons name="mic-outline" size={15} color="#616161" accessible={false} />
            <Text dynamicTypeRamp="footnote" style={{ ...Typography.footnote, color: '#4B5563' }}>智能降噪开启</Text>
          </View>
        </View>
      </BottomSheetScrollView>

      <Pressable
        onPress={onStop}
        disabled={isStopping}
        accessibilityRole="button"
        className="min-h-[52px] shrink-0 flex-row items-center justify-center gap-2 rounded-full bg-neutral-900 px-4 py-3 active:bg-neutral-700 disabled:opacity-50"
      >
        <View className="h-3.5 w-3.5 shrink-0 rounded-sm bg-white" />
        <Text dynamicTypeRamp="headline" style={Typography.headline} className="shrink text-center text-white">
          {isStopping ? '正在上传并保存…' : '停止并保存'}
        </Text>
      </Pressable>
    </BottomSheet>
  );
}

// =====================================================
// 录音页面
// =====================================================

export default function RecordingPage() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    topic?: string;
    recordingId?: string | string[];
  }>();

  const topic =
    typeof params.topic === 'string' ? params.topic : '语音记录';
  const recordingIdParam = Array.isArray(params.recordingId) ? params.recordingId[0] : params.recordingId;
  const recordingId = recordingIdParam?.trim();
  const recordingSessionId = recordingId && /^\d+$/.test(recordingId) ? Number(recordingId) : null;

  // Expo Audio 录音器
  const recorder = useAudioRecorder({
    ...RecordingPresets.HIGH_QUALITY,
    directory: 'document',
  });

  const recorderState = useAudioRecorderState(recorder, 250);

  const isRecording = recorderState.isRecording;
  const seconds = Math.floor(
    (recorderState.durationMillis || 0) / 1000
  );

  // 页面状态
  const [recordingPhase, setRecordingPhase] = useState<'idle' | 'starting' | 'active' | 'stopping'>('idle');
  const [recordings, setRecordings] = useState<RecordingItem[]>([]);
  const [sessionLoadState, setSessionLoadState] = useState<SessionLoadState | null>(null);
  const [sessionRetry, setSessionRetry] = useState(0);
  const currentSessionLoadState = sessionLoadState?.sessionId === recordingId ? sessionLoadState : null;
  const sessionLoading = Boolean(recordingId && (!currentSessionLoadState || currentSessionLoadState.status === 'loading'));
  const sessionLoadError = currentSessionLoadState?.status === 'error' ? currentSessionLoadState.message : null;
  const [waveHeights, setWaveHeights] = useState(REST_WAVE);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [recordingControlsHeight, setRecordingControlsHeight] = useState(160);
  const { reduceMotion } = useGlassAccessibility();
  const recordingInProgress = recordingPhase !== 'idle';
  const sheetVisible = recordingPhase === 'active' || recordingPhase === 'stopping';
  const animateWaveform = isRecording && sheetVisible && !reduceMotion;

  const playerRef = useRef<ReturnType<typeof createAudioPlayer> | null>(null);
  const stopInProgressRef = useRef(false);

  usePreventRemove(recordingInProgress);

  // 动态波形
  useEffect(() => {
    if (!animateWaveform) return;

    const interval = setInterval(() => {
      setWaveHeights(
        Array.from(
          { length: 20 },
          () => Math.floor(Math.random() * 40) + 8
        )
      );
    }, 120);

    return () => clearInterval(interval);
  }, [animateWaveform]);

  // 清理播放器
  useEffect(() => {
    return () => {
      playerRef.current?.remove();
      playerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!recordingId) return;
    let active = true;
    getRecordingSessionDetail(recordingId)
      .then(session => {
        if (!active) return;
        if (!Array.isArray(session.fragments)) {
          throw new Error('录音详情未返回片段数据。');
        }
        const sessionRecordings = mapSessionToRecordings(session);
        setRecordings(sessionRecordings);
        setSessionLoadState({ sessionId: recordingId, status: 'loaded' });
      })
      .catch(error => {
        if (!active) return;
        console.error('获取录音会话详情失败：', error);
        setSessionLoadState({
          sessionId: recordingId,
          status: 'error',
          message: error instanceof Error ? error.message : '无法加载录音详情，请稍后重试。',
        });
      });
    return () => {
      active = false;
    };
  }, [recordingId, sessionRetry]);

  // 开始录音
  const startRecording = async () => {
    if (recordingInProgress) return;
    setRecordingPhase('starting');
    try {
      const permission =
        await AudioModule.requestRecordingPermissionsAsync();

      if (!permission.granted) {
        setRecordingPhase('idle');
        Alert.alert(
          '麦克风权限',
          '请在系统设置中允许应用访问麦克风。'
        );
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      await recorder.prepareToRecordAsync();
      recorder.record();

      setRecordingPhase('active');
    } catch (error) {
      setRecordingPhase('idle');
      console.error('开始录音失败：', error);
      Alert.alert('录音失败', '无法启动麦克风，请检查设备权限。');
    }
  };

  // 重录
  const restartRecording = async () => {
    try {
      if (isRecording || recorder.uri) {
        await recorder.stop();
      }

      await recorder.prepareToRecordAsync();
      recorder.record();

      setWaveHeights(REST_WAVE);
    } catch (error) {
      console.error('重录失败：', error);
      Alert.alert('重录失败', '无法重新开始录音。');
    }
  };

  const retryRecordingUpload = useCallback(async (item: RecordingItem) => {
    if (!recordingSessionId) return;
    try {
      const fragment = await uploadRecordingToSession({
        sessionId: recordingSessionId,
        fileUri: item.uri,
        durationMs: item.durationMillis,
        sampleRateHz: RECORDING_SAMPLE_RATE_HZ,
      });
      setRecordings(previous => previous.map(recording => recording.id === item.id
        ? { ...item, id: String(fragment.id) }
        : recording));
    } catch (error) {
      Alert.alert('上传失败', error instanceof Error ? error.message : '请稍后重试。');
    }
  }, [recordingSessionId]);

  const uploadRecording = useCallback(async (item: RecordingItem) => {
    if (!recordingSessionId) {
      Alert.alert('录音未关联会话', '录音已保存在本机。请从具体话题进入录音页后，才能上传到服务器。');
      return;
    }

    try {
      const fragment = await uploadRecordingToSession({
        sessionId: recordingSessionId,
        fileUri: item.uri,
        durationMs: item.durationMillis,
        sampleRateHz: RECORDING_SAMPLE_RATE_HZ,
        recordedAt: new Date().toISOString(),
      });
      setRecordings(previous => previous.map(recording => recording.id === item.id
        ? { ...item, id: String(fragment.id) }
        : recording));
    } catch (error) {
      const message = error instanceof Error ? error.message : '上传录音失败，请稍后重试。';
      Alert.alert('上传失败', `录音已保存在本机。${message}`, [
        { text: '稍后重试', style: 'cancel' },
        { text: '立即重试', onPress: () => void retryRecordingUpload(item) },
      ]);
    }
  }, [recordingSessionId, retryRecordingUpload]);

  // 停止并保存
  const stopRecording = useCallback(async () => {
    if (recordingPhase !== 'active' || stopInProgressRef.current) return;
    stopInProgressRef.current = true;
    setRecordingPhase('stopping');
    try {
      const durationMillis = recorderState.durationMillis || 0;

      await recorder.stop();

      const uri = recorder.uri;

      if (uri) {
        const newRecording: RecordingItem = {
          id: `${Date.now()}`,
          title: topic,
          time: `今天 ${getCurrentTime()}`,
          duration: formatDuration(durationMillis),
          durationMillis,
          quality: '48 kHz',
          uri,
          waveform: CARD_WAVE,
        };

        setRecordings(previous => [
          newRecording,
          ...previous,
        ]);
        await uploadRecording(newRecording);
      }

      setRecordingPhase('idle');
      setWaveHeights(REST_WAVE);
      stopInProgressRef.current = false;
    } catch (error) {
      setRecordingPhase(recorder.uri ? 'idle' : 'active');
      stopInProgressRef.current = false;
      console.error('保存录音失败：', error);
      Alert.alert('保存失败', error instanceof Error ? error.message : '音频文件未能成功保存。');
    }
  }, [recordingPhase, recorder, recorderState.durationMillis, topic, uploadRecording]);

  useEffect(() => {
    if (recordingPhase === 'active' && recorderState.durationMillis >= MAX_RECORDING_DURATION_MS) {
      const timeout = setTimeout(() => void stopRecording(), 0);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [recordingPhase, recorderState.durationMillis, stopRecording]);

  // 播放与暂停
  const playRecording = (item: RecordingItem) => {
    try {
      if (playingId === item.id && playerRef.current) {
        playerRef.current.pause();
        setPlayingId(null);
        return;
      }

      playerRef.current?.remove();

      const player = createAudioPlayer(item.uri);
      playerRef.current = player;

      player.addListener('playbackStatusUpdate', status => {
        if (status.didJustFinish) {
          setPlayingId(null);
        }
      });

      player.play();
      setPlayingId(item.id);
    } catch (error) {
      console.error('播放录音失败：', error);
      Alert.alert('播放失败', '无法播放该录音文件。');
    }
  };

  // 分享录音
  const shareRecording = async (item: RecordingItem) => {
    try {
      const available = await Sharing.isAvailableAsync();

      if (!available) {
        Alert.alert('提示', '当前设备不支持文件分享。');
        return;
      }

      await Sharing.shareAsync(item.uri, {
        mimeType: 'audio/m4a',
        dialogTitle: '分享',
      });
    } catch (error) {
      console.error('分享录音失败：', error);
      Alert.alert('分享失败', '无法分享该录音文件。');
    }
  };

  const removeRecording = (item: RecordingItem) => {
    if (playingId === item.id) {
      playerRef.current?.remove();
      playerRef.current = null;
      setPlayingId(null);
    }

    setRecordings(previous => previous.filter(record => record.id !== item.id));
  };

  // 更多操作
  const showMoreActions = (item: RecordingItem) => {
    Alert.alert(
      '',
      undefined,
      [
        {
          text: '分享',
          onPress: () => shareRecording(item),
        },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => removeRecording(item),
        },
        {
          text: '取消',
          style: 'cancel',
        },
      ]
    );
  };

  // 返回
  const handleBack = () => {
    router.back();
  };

  const handleOpenMedia = () => {
    if (recordingInProgress) {
      Alert.alert('提示', '请先结束当前录音。');
      return;
    }

    const recording = recordings[0];
    router.push({
      pathname: '/recorder/publish',
      params: {
        topic,
        ...(recording?.uri ? {
          recordingUri: recording.uri,
          duration: recording.duration,
          recordingId: recording.id,
          sessionId: recordingSessionId ? String(recordingSessionId) : undefined,
        } : {}),
      },
    });
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: SCREEN_BACKGROUND }}
      edges={['top', 'bottom']}
    >
      <StatusBar
        barStyle="dark-content"
      />

      <View style={{ flex: 1, backgroundColor: SCREEN_BACKGROUND }}>
        {/* ================================= */}
        {/* 顶部导航 */}
        {/* ================================= */}

        <View className="min-h-16 flex-row items-center justify-between gap-3 px-4 py-2">
          <GlassBackToolbar title="记录" onBack={handleBack} />

          <GlassToolbar accessibilityLabel="录音工具栏" style={{ columnGap: 8 }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="添加照片或视频"
              onPress={handleOpenMedia}
              className="h-11 w-11 items-center justify-center rounded-full active:bg-neutral-900/10"
            >
              <Ionicons name="images-outline" size={24} color="#171717" />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="更多操作"
              className="h-11 w-11 items-center justify-center rounded-full active:bg-neutral-900/10"
            >
              <Ionicons name="ellipsis-horizontal" size={24} color="#171717" />
            </Pressable>
          </GlassToolbar>
        </View>

        {/* ================================= */}
        {/* 页面主体 */}
        {/* ================================= */}

        <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>

          {/* 已完成录音列表 */}
          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              flexGrow: 1,
              // 留出浮动控制区及间距，让最后一条录音可以滚动到按钮上方。
              paddingBottom: recordingControlsHeight + 24,
            }}
          >
            {recordings.length === 0 ? (
              sessionLoading ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 32 }}>
                  <Text dynamicTypeRamp="body" style={{ ...Typography.body, color: '#616161' }}>正在加载录音记录…</Text>
                </View>
              ) : sessionLoadError ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    if (!recordingId) return;
                    setSessionLoadState({ sessionId: recordingId, status: 'loading' });
                    setSessionRetry(value => value + 1);
                  }}
                  style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 32 }}
                >
                  <Text dynamicTypeRamp="body" style={{ ...Typography.body, textAlign: 'center', color: '#B42318' }}>
                    {sessionLoadError} 点击重试
                  </Text>
                </Pressable>
              ) : (
              <RecordingEmptyState icon="mic-outline" description="点按下方麦克风开始录音" />
              )
            ) : (
              <>
                <View className="mb-4 min-h-8 flex-row items-center justify-between px-1">
                  <Text dynamicTypeRamp="caption1" style={{ ...Typography.caption1, color: '#616161' }}>共 {recordings.length} 条</Text>
                </View>
                <View className="gap-3">
                  {recordings.map(item => (
                    <RecordingCard
                      key={item.id}
                      item={item}
                      playing={playingId === item.id}
                      onPlay={() => playRecording(item)}
                      onShare={() => shareRecording(item)}
                      onMore={() => showMoreActions(item)}
                    />
                  ))}
                </View>
              </>
            )}
          </ScrollView>

          {/* ================================= */}
          {/* 底部录音控制区 */}
          {/* ================================= */}

          <View
            pointerEvents="box-none"
            onLayout={event => setRecordingControlsHeight(event.nativeEvent.layout.height)}
            className="items-center justify-center gap-4 pb-4 pt-3"
            style={{ position: 'absolute', left: 20, right: 20, bottom: 8 }}
          >

            {/* 主录音按钮 */}
            <View pointerEvents="box-none" className="h-24 w-full items-center justify-center">
              <GlassPressable
                onPress={startRecording}
                disabled={recordingInProgress}
                accessibilityLabel="开始录音"
                surfaceClassName="h-20 w-20 items-center justify-center"
                surfaceStyle={{ borderRadius: 40 }}
              >
                <Ionicons
                  name="mic"
                  size={34}
                  color="#171717"
                  accessible={false}
                />
              </GlassPressable>
            </View>

          </View>
        </View>

        {/* ================================= */}
        {/* 录音弹层 */}
        {/* ================================= */}

        <RecordingSheet
          visible={sheetVisible}
          isRecording={isRecording}
          isStopping={recordingPhase === 'stopping'}
          seconds={seconds}
          waveHeights={animateWaveform ? waveHeights : REST_WAVE}
          onStop={stopRecording}
        />

      </View>
    </SafeAreaView>
  );
}
