import { Typography } from '@/constants/typography';
import { SCREEN_BACKGROUND } from '@/constants/colors';
import { BottomSlideModal } from '@/components/bottom-slide-modal';
import { GlassBackToolbar } from '@/components/glass-back-toolbar';
import { GlassPressable, GlassToolbar } from '@/components/glass-surface';
import { useTheme } from '@/hooks/use-theme';

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Pressable,
    ScrollView,
    StatusBar,
    Text,
    View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

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

const REST_WAVE = [
  8, 12, 8, 16, 8, 14, 20, 10, 16, 24,
  12, 20, 10, 26, 16, 12, 22, 9, 14, 8,
];

const CARD_WAVE = [
  8, 12, 20, 8, 16, 24, 12, 20, 8,
  16, 20, 12, 24, 16, 8, 16, 12,
];

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
  seconds,
  waveHeights,
  onClose,
  onStop,
}: {
  visible: boolean;
  isRecording: boolean;
  seconds: number;
  waveHeights: number[];
  onClose: () => void;
  onStop: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { accentBlue, accentBlueMuted } = useTheme();
  return (
    <BottomSlideModal visible={visible} onClose={onClose}>
      <View className="flex-1 justify-end">
        {/* 背景遮罩 */}
        <Pressable
          className="absolute inset-0 bg-black/40"
          pointerEvents="none"
        />

        {/* 弹层主体 */}
        <ScrollView
          accessibilityViewIsModal
          style={{ flexGrow: 0, maxHeight: '90%', backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32 }}
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: Math.max(insets.bottom, 16) + 16 }}
        >
          {/* 拖动指示条 */}
          <View className="h-3 w-full items-center justify-center">
            <View className="h-1 w-10 rounded-full bg-neutral-300" />
          </View>

          {/* 计时器 */}
          <Text dynamicTypeRamp="largeTitle" className="my-3 text-center" style={{ ...Typography.largeTitle, fontVariant: ['tabular-nums'], color: '#111111' }}>
            {formatTime(seconds)}
          </Text>

          {/* 动态波形 */}
          <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" className="h-14 w-full flex-row items-center justify-center gap-[4px] overflow-hidden px-3">
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

          {/* 录音参数 */}
          <View className="mt-4 flex-row flex-wrap items-center justify-center gap-4">
            <View className="flex-row items-center gap-1.5">
              <Ionicons
                name="stats-chart-outline"
                size={15}
                color="#616161"
              />
              <Text dynamicTypeRamp="footnote" style={{ ...Typography.footnote, color: '#4B5563' }}>
                48.0 kHz
              </Text>
            </View>

            <Text dynamicTypeRamp="footnote" style={Typography.footnote} className="text-neutral-300">•</Text>

            <View className="flex-row items-center gap-1.5">
              <Ionicons
                name="mic-outline"
                size={15}
                color="#616161"
              />
              <Text dynamicTypeRamp="footnote" style={{ ...Typography.footnote, color: '#4B5563' }}>
                智能降噪开启
              </Text>
            </View>
          </View>

          {/* 主操作按钮 */}
          <View className="mt-7 w-full">
            <Pressable
              onPress={onStop}
              accessibilityRole="button"
              accessibilityLabel="停止录音并保存"
              className="min-h-[52px] w-full flex-row items-center justify-center gap-2 rounded-full bg-neutral-900 px-4 py-3 active:bg-neutral-700"
            >
              <View className="h-3.5 w-3.5 rounded-sm bg-white" />
              <Text dynamicTypeRamp="headline" style={Typography.headline} className="text-white">
                停止录音
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </BottomSlideModal>
  );
}

// =====================================================
// 录音页面
// =====================================================

export default function RecordingPage() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    topic?: string;
  }>();

  const topic =
    typeof params.topic === 'string' ? params.topic : '语音记录';

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
  const [sheetVisible, setSheetVisible] = useState(false);
  const [recordings, setRecordings] = useState<RecordingItem[]>([]);
  const [waveHeights, setWaveHeights] = useState(REST_WAVE);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [recordingControlsHeight, setRecordingControlsHeight] = useState(160);

  const playerRef = useRef<ReturnType<typeof createAudioPlayer> | null>(null);

  // 动态波形
  useEffect(() => {
    if (!isRecording || !sheetVisible) {
      setWaveHeights(REST_WAVE);
      return;
    }

    const interval = setInterval(() => {
      setWaveHeights(
        Array.from(
          { length: 20 },
          () => Math.floor(Math.random() * 40) + 8
        )
      );
    }, 120);

    return () => clearInterval(interval);
  }, [isRecording, sheetVisible]);

  // 清理播放器
  useEffect(() => {
    return () => {
      playerRef.current?.remove();
      playerRef.current = null;
    };
  }, []);

  // 开始录音
  const startRecording = async () => {
    try {
      const permission =
        await AudioModule.requestRecordingPermissionsAsync();

      if (!permission.granted) {
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

      setSheetVisible(true);
    } catch (error) {
      console.error('开始录音失败：', error);
      Alert.alert('录音失败', '无法启动麦克风，请检查设备权限。');
    }
  };

  // 暂停与继续
  const pauseResumeRecording = () => {
    try {
      if (isRecording) {
        recorder.pause();
      } else {
        recorder.record();
      }
    } catch (error) {
      console.error('录音状态切换失败：', error);
      Alert.alert('操作失败', '无法切换录音状态。');
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

  // 停止并保存
  const stopRecording = async () => {
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
      }

      setSheetVisible(false);
      setWaveHeights(REST_WAVE);
    } catch (error) {
      console.error('保存录音失败：', error);
      Alert.alert('保存失败', '音频文件未能成功保存。');
    }
  };

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
    if (isRecording || sheetVisible) {
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
        } : {}),
      },
    });
  };

  // 中央录音按钮
  const handleMasterButton = () => {
    if (isRecording) {
      stopRecording();
    } else if (sheetVisible) {
      pauseResumeRecording();
    } else {
      startRecording();
    }
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
            {/* 列表标题 */}
            <View className="mb-4 min-h-8 flex-row items-center justify-between px-1">
              <Text dynamicTypeRamp="caption1" style={{ ...Typography.caption1, color: '#616161' }}>共 {recordings.length} 条</Text>
            </View>

            {/* 录音卡片列表 */}
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

              {/* 空状态 */}
              {recordings.length === 0 && (
                <View
                  className="items-center justify-center px-5 py-12"
                  style={{ borderRadius: 28, backgroundColor: '#FFFFFF' }}
                >
                  <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <Ionicons
                      name="mic-outline"
                      size={28}
                      color="#6B6B6B"
                    />
                  </View>

                  <Text dynamicTypeRamp="headline" style={{ ...Typography.headline, color: '#111111' }}>
                    暂无记录
                  </Text>

                  <Text dynamicTypeRamp="subheadline" className="mt-2 text-center" style={{ ...Typography.subhead, color: '#4B5563' }}>
                    随心记录灵感与心声
                  </Text>
                </View>
              )}
            </View>
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
                onPress={handleMasterButton}
                accessibilityLabel={isRecording ? '停止录音并保存' : sheetVisible ? '继续录音' : '开始录音'}
                surfaceClassName="h-20 w-20 items-center justify-center"
                surfaceStyle={{ borderRadius: 40 }}
              >
                <Ionicons
                  name={isRecording ? 'stop' : 'mic'}
                  size={34}
                  color="#171717"
                />
              </GlassPressable>
            </View>

            {/* 录音状态提示 */}
            {/*{(isRecording || sheetVisible) && (
              <View pointerEvents="none" className="flex-row flex-wrap items-center justify-center gap-1.5">
                <Ionicons
                  name="information-circle-outline"
                  size={15}
                  color="#616161"
                />
              </View>
            )}*/}
          </View>
        </View>

        {/* ================================= */}
        {/* 录音弹层 */}
        {/* ================================= */}

        <RecordingSheet
          visible={sheetVisible}
          isRecording={isRecording}
          seconds={seconds}
          waveHeights={waveHeights}
          onClose={() => setSheetVisible(false)}
          onStop={stopRecording}
        />

      </View>
    </SafeAreaView>
  );
}
