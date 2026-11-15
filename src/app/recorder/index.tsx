
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Modal,
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

import {
    Button,
    ButtonText,
} from '@/components/ui/button';

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
  color = '#A3A3A3',
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
    <View className="w-full rounded-xl border bg-[#F9F9FF] p-4 shadow-sm" style={{ borderColor: '#E5E7EB' }}>
      {/* 标题区域 */}
      <View className="flex-row items-start gap-2">
        <View className="min-w-0 flex-1 gap-1">
          <View className="flex-row items-center gap-2">
            <Text
              className="flex-1 text-sm font-bold"
              numberOfLines={1}
              style={{ color: '#111111' }}
            >
              {item.title}
            </Text>

            <View
              className="shrink-0 rounded-md border px-1.5 py-0.5"
              style={{ backgroundColor: '#F3F4F6', borderColor: '#E5E7EB' }}
            >
              <Text className="text-[10px] font-medium" style={{ color: '#4B5563' }}>
                已转文字
              </Text>
            </View>
          </View>

          <View className="flex-row flex-wrap items-center gap-2">
            <Text className="text-xs" style={{ color: '#4B5563' }}>
              {item.time}
            </Text>

            <Text className="text-xs" style={{ color: '#4B5563' }}>•</Text>

            <Text className="text-xs font-medium" style={{ color: '#2b2b2b' }}>
              {item.duration}
            </Text>

            <Text className="text-xs" style={{ color: '#4B5563' }}>•</Text>

            <Text className="text-xs" style={{ color: '#4B5563' }}>
              {item.quality}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={onMore}
          className="h-8 w-8 shrink-0 items-center justify-center rounded-full active:bg-muted"
          hitSlop={8}
        >
          <Ionicons
            name="ellipsis-vertical"
            size={18}
            color="#A3A3A3"
          />
        </Pressable>
      </View>

      {/* 播放区域 */}
      <View className="mt-3 flex-row items-center gap-3 border-t pt-3" style={{ borderTopColor: '#E5E7EB' }}>
        <Pressable
          onPress={onPlay}
          className="h-8 w-8 items-center justify-center rounded-full active:opacity-60"
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
          className="h-8 w-8 items-center justify-center active:opacity-60"
        >
          <Ionicons
            name="share-outline"
            size={17}
            color="#A3A3A3"
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
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        {/* 背景遮罩 */}
        <Pressable
          className="absolute inset-0 bg-black/40" 
          onPress={onClose}
        />

        {/* 弹层主体 */}
        <View
          className="w-full rounded-t-[28px] border border-b-0 bg-[#F9F9FF] px-6 pb-8 pt-3"
          style={{ borderColor: '#E5E7EB' }}
        >
          {/* 拖动指示条 */}
          <Pressable
            onPress={onClose}
            className="h-3 w-full items-center justify-center"
          >
            <View className="h-1 w-10 rounded-full bg-neutral-300" />
          </Pressable>

          {/* 状态栏 */}
          <View className="mt-4 w-full flex-row items-center justify-between">
            <View
              className="flex-row items-center gap-2 rounded-full border px-3 py-2"
              style={{ backgroundColor: '#F3F4F6', borderColor: '#E5E7EB' }}
            >
              <View
                className={`h-2 w-2 rounded-full ${
                  isRecording ? 'bg-red-600' : 'bg-neutral-400'
                }`}
              />

              <Text className="text-xs font-semibold" style={{ color: '#4B5563' }}>
                {isRecording ? '正在录制...' : '录音已暂停'}
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              className="h-8 w-8 items-center justify-center rounded-full"
            >
              <Ionicons
                name="chevron-down"
                size={23}
                color="#737373"
              />
            </Pressable>
          </View>

          {/* 计时器 */}
          <Text className="my-3 text-center text-[44px] font-bold tracking-tight" style={{ color: '#111111' }}>
            {formatTime(seconds)}
          </Text>

          {/* 动态波形 */}
          <View className="h-14 w-full flex-row items-center justify-center gap-[4px] overflow-hidden px-3">
            {waveHeights.map((height, index) => (
              <View
                key={index}
                style={{
                  width: 3,
                  height,
                  backgroundColor: isRecording ? '#005CB8' : '#AEC7F7',
                  borderRadius: 4,
                }}
              />
            ))}
          </View>

          {/* 录音参数 */}
          <View className="mt-4 flex-row items-center justify-center gap-4">
            <View className="flex-row items-center gap-1.5">
              <Ionicons
                name="stats-chart-outline"
                size={15}
                color="#737373"
              />
              <Text className="text-xs font-medium" style={{ color: '#4B5563' }}>
                48.0 kHz
              </Text>
            </View>

            <Text className="text-neutral-300">•</Text>

            <View className="flex-row items-center gap-1.5">
              <Ionicons
                name="mic-outline"
                size={15}
                color="#737373"
              />
              <Text className="text-xs font-medium" style={{ color: '#4B5563' }}>
                智能降噪开启
              </Text>
            </View>
          </View>

          {/* 主操作按钮 */}
          <View className="mt-7 w-full">
            <Pressable
              onPress={onStop}
              className="h-[52px] w-full flex-row items-center justify-center gap-2 rounded-full bg-neutral-900 active:bg-neutral-700"
            >
              <View className="h-3.5 w-3.5 rounded-sm bg-white" />
              <Text className="text-sm font-semibold text-white">
                停止录音
              </Text>
            </Pressable>
          </View>

          <Text className="mt-3 text-center text-xs" style={{ color: '#4B5563' }}>
            录音结束后将自动保存到列表中
          </Text>
        </View>
      </View>
    </Modal>
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
        dialogTitle: '分享录音',
      });
    } catch (error) {
      console.error('分享录音失败：', error);
      Alert.alert('分享失败', '无法分享该录音文件。');
    }
  };

  // 更多操作
  const showMoreActions = (item: RecordingItem) => {
    Alert.alert(
      '录音操作',
      item.title,
      [
        {
          text: '分享录音',
          onPress: () => shareRecording(item),
        },
        {
          text: '删除录音',
          style: 'destructive',
          onPress: () => {
            if (playingId === item.id) {
              playerRef.current?.remove();
              playerRef.current = null;
              setPlayingId(null);
            }

            setRecordings(previous =>
              previous.filter(record => record.id !== item.id)
            );
          },
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

  // 下一步
  const handleNext = () => {
    if (isRecording) {
      Alert.alert('提示', '请先完成或暂停当前录音。');
      return;
    }

    // 在此接入下一步业务页面
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
      style={{ flex: 1, backgroundColor: '#FFFFFF' }}
      edges={['top', 'bottom']}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F9F9FF"
      />

      <View style={{ flex: 1, backgroundColor: '#F9F9FF' }}>

        {/* ================================= */}
        {/* 顶部导航 */}
        {/* ================================= */}

        <View className="h-16 flex-row items-center justify-between px-2">
          <Pressable
            onPress={handleBack}
            className="h-11 w-11 items-center justify-center active:opacity-60"
          >
            <Ionicons
              name="chevron-back"
              size={23}
              color="#181C22"
            />
          </Pressable>

          <Button
            size="sm"
            className="h-9 rounded-full bg-neutral-900 px-4 active:bg-neutral-700"
            onPress={handleNext}
          >
            <ButtonText className="text-[13px] font-medium text-white">
              下一步
            </ButtonText>
            <Ionicons
              name="arrow-forward"
              size={15}
              color="#FFFFFF"
            />
          </Button>
        </View>

        {/* ================================= */}
        {/* 页面主体 */}
        {/* ================================= */}

        <View style={{ flex: 1, backgroundColor: '#F9F9FF', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>

          {/* 已完成录音列表 */}
          <ScrollView
            style={{ flex: 1, backgroundColor: '#F9F9FF' }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: 16,
            }}
          >
            {/* 列表标题 */}
            <View className="mb-4 h-8 flex-row items-center justify-between px-1">
              <View className="flex-row items-center gap-2">
                <Text className="text-base font-bold tracking-tight" style={{ color: '#111111' }}>
                  已完成录音
                </Text>

                <View
                  className="rounded-full border px-2 py-0.5"
                  style={{ backgroundColor: '#F3F4F6', borderColor: '#E5E7EB' }}
                >
                  <Text className="text-[11px] font-medium" style={{ color: '#4B5563' }}>
                    {recordings.length}
                  </Text>
                </View>
              </View>
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
                  className="items-center justify-center rounded-xl border py-10"
                  style={{ backgroundColor: '#F9F9FF', borderColor: '#E5E7EB' }}
                >
                  <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <Ionicons
                      name="mic-outline"
                      size={28}
                      color="#A3A3A3"
                    />
                  </View>

                  <Text className="text-sm font-medium" style={{ color: '#111111' }}>
                    暂无录音
                  </Text>

                  <Text className="mt-2 text-xs" style={{ color: '#4B5563' }}>
                    随心记录灵感、对话与心声，支持自动生成文字与智能降噪
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* ================================= */}
          {/* 底部录音控制区 */}
          {/* ================================= */}

          <View className="items-center justify-center gap-4 pb-4 pt-3" style={{ backgroundColor: '#F9F9FF' }}>

            {/* 主录音按钮 */}
            <View className="h-24 w-full items-center justify-center">
              <Pressable
                onPress={handleMasterButton}
                className="h-20 w-20 items-center justify-center rounded-full bg-neutral-900 shadow-md"
                style={{ transform: [{ scale: 0.95 }] }}
              >
                <Ionicons
                  name={isRecording ? 'stop' : 'mic'}
                  size={34}
                  color="#FFFFFF"
                />
              </Pressable>
            </View>

            {/* 提示文字 */}
            <View className="flex-row items-center gap-1.5">
              <Ionicons
                name="information-circle-outline"
                size={15}
                color="#737373"
              />

              <Text className="text-xs text-muted-foreground">
                {isRecording
                  ? '录音中，再次点击停止并保存'
                  : sheetVisible
                    ? '录音已暂停，可继续或重录'
                    : '点击中心按钮开启录音'}
              </Text>
            </View>
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
