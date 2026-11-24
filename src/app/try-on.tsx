import { ContentPressable } from '@/components/content-surface';
import { GlassBackToolbar } from '@/components/glass-back-toolbar';
import { GlassScreen } from '@/components/glass-surface';
import { SCREEN_BACKGROUND } from '@/constants/colors';
import { Typography } from '@/constants/typography';

import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StatusBar, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const garments = [
  { name: '极简落肩纯白 T 恤', detail: '重磅全棉 · 挺括日常', price: '¥199', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUNYUob3dqUrl_15oN_Fho6KhsQEwpdydZH_FJ6j3tTf5HcH_kUZjIpfIsMKbv3BdrGRsvPjRwUgrymRvYQ2PlQzzp01mgxwmUDrQM9F_wNPaQWJUexX5XjnyYDHITHB-9gZjLz0iLGbsCjofvAFS9wB5uY0uBUONe4Jh8Q3h02jH3ipT9HtCq8IM4kY3mCdkNUQUMI_7sCVIYQoM6a5EWsDdOOzMnRdbSb39GHqO' },
  { name: '黑白条纹针织', detail: '柔软微弹 · 轻松有型', price: '¥289', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCqyPdN98BAeSCUpFW3E0PlphzihqIrznokxn5PbAernx8scBz8XmC7Xx_kNTObMm0b_o5yMZhVSsstIN9VWPEVIYUVnkG49U_Trdf4TF3DVsKWv81PysvhgQQJsRy19NHSU3hSLvGxOdjvQZQbtOBzgFmmvfJoDBzK3Si06x-SRCjOP7IsPF2jw9h9jTURoqYWsNl5aH5DmCbSbDFt1nXfdqQj9zx5WWOr9wtDvxQs' },
  { name: '燕麦灰连帽卫衣', detail: '宽松廓形 · 柔软毛圈', price: '¥349', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuArydng_e1ZIhkaVkDB3CUJXF0DpzDS1eJUKIp4SbqlcMUiM-Vh7vmwWHVCYhD_O3D5iGpV9fi1XwL8E_u3AjsmIK8NeiQmGBW1ufBvqpzWdw8oIAgX2vate-AajOYcFKSp668BDEs9KwBrr9yCP79ZNaDE0ujZYTjrLb06UIeGfKdLNesqHJMmZt45JUMMphAR2jY2kWFSG2Lf_9OwSPSrSNMMPN0cdZ68atesvKGx' },
  { name: '薄荷绿轻薄开衫', detail: '凉感透气 · 轻盈防晒', price: '¥239', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAT2g5K__5rIB5pYHLcOuVHzbK7za0Qr1110zSl5QYBLPWuCUUUlhxV6eb_8KWLi61L6omxE7avEK5zX33wJtK_sgNuyqSgxs_tlNCj8UZtx3WsCDA2CxQDWmECFD9lZnYpJqiSUZ_kzKm35PotCn_2DH4Y2YTWrVY6nxk5Fq8KnKIX6QFqPjAaOgMZDNOPP2ZXXqCH9fcRJggQvGdpzLjdi1nKNoWk5vjLu3l7n2m7' },
  { name: '浅蓝阔腿牛仔裤', detail: '经典水洗 · 修饰腿型', price: '¥329', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPJdvdXECP3LoQoiN9OEYqk03v_DlsfcF7j27eFGBmE1mfHuPIAeud4VLC9QnRda1mObpf17yu2_OVemutRxo7u8az_rF5zrg4v2dj79s3dxOZtJnpepCW7gIVV_1x04v9gQw3xc0Zz4Stciw5X3KB3S29bO6ofT7Vy6KAMS8u6qeyOt3hviJbtoNZI1_WZP_RZiNt2Zmwj9qSfu-yUfM3R1ATAfUqttdtdLFsdNSp' },
  { name: '米白百褶短裙', detail: '学院风褶裥 · 轻盈百搭', price: '¥219', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBF3sns0y86DoaCTaHm-_0fO8nacarOmTmYv6Yvw2E4G9BpYoxSQxxB9xLcZokHjEUr0CB91W7jjSExn9y1qSc_wXWcxB0bBopYI8VtZSkF6huPE6Hq3zUB7yzVj4gQDf7t_MuOElkbRdeKkp0a963VsL8AV1xyQqnKPT4tPW4HyovpwsrZOCWpRp37KoWRIK2jtb7eiKCUyBrpPAcrYFgUaASx1X-RFGnwFr8JaVrC' },
];

const categories = ['精选上装', '潮流外套', '下装裤裙', '鞋履配饰', '整套搭配'];

export default function TryOnScreen() {
  const { width, fontScale } = useWindowDimensions();
  const [photo, setPhoto] = useState<string | null>(null);
  const [category, setCategory] = useState(categories[0]);
  const [size, setSize] = useState('S');
  const [selectedGarment, setSelectedGarment] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [isPickingPhoto, setIsPickingPhoto] = useState(false);
  const gap = 12;
  const useSingleColumn = fontScale >= 1.5 || width < 340;
  const cardWidth = useSingleColumn ? Math.min(width - 32, 560) : (Math.min(width - 32, 560) - gap) / 2;

  const pickPhoto = async () => {
    if (isPickingPhoto) return;
    setIsPickingPhoto(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });
      if (!result.canceled) setPhoto(result.assets[0]?.uri ?? null);
    } catch {
      Alert.alert('无法打开照片', '请稍后重试。');
    } finally {
      setIsPickingPhoto(false);
    }
  };

  return (
    <GlassScreen>
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.fill}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <GlassBackToolbar title="打扮" onBack={() => router.back()} />
          <ContentPressable
            accessibilityLabel="还原搭配"
            onPress={() => {
              setSelectedGarment(0);
              setSize('S');
              setFlipped(false);
              setZoomed(false);
            }}
            surfaceStyle={styles.resetButton}
          >
            <Ionicons name="refresh-outline" size={22} color="#404044" accessible={false} />
          </ContentPressable>
        </View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.modelCard}>
            <View style={[styles.modelCanvas, { height: Math.min(width * 1.05, 440) }]}>
              {photo ? (
                <Image source={{ uri: photo }} resizeMode="cover" style={[styles.modelImage, flipped && styles.flipped, zoomed && styles.zoomed]} />
              ) : (
                <Image source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3CSqh-z98QFINpSJO5D1ZzABS4Ovb6u0ONA99jIKJ4Puw2KD2rtkW4GsPoizy8m_HlIvFzGnT614nIBXbaiIYxDU7TGwWDHOs2DtEufbIuNMVyvZpwBV8jRPbMTyJvcitnRndDbOjwvc_InEqrzlpraTArITDkjGWikgbQBkiIeNF2lsJYAsf5yMwP1BqhK6iid0aSQKJJNZW_c2aHePK9TjpHqIyCZpBkUIlhEev' }} resizeMode="cover" style={[styles.modelImage, flipped && styles.flipped, zoomed && styles.zoomed]} />
              )}
              <View style={styles.readyBadge}><View style={styles.readyDot} /><Text style={styles.readyText}>{photo ? '已选择照片' : '示例模特'}</Text></View>
              <View style={styles.canvasControls}>
                <RoundControl label="对比原图" icon="git-compare-outline" onPress={() => Alert.alert('原图对比', '选择个人照片后可预览对比。')} />
                <RoundControl label="翻转视角" icon="sync-outline" onPress={() => setFlipped(value => !value)} />
                <RoundControl label="放大预览" icon="search-outline" onPress={() => setZoomed(value => !value)} />
              </View>
            </View>
            <View style={styles.bodyInfo}>
              <View style={styles.bodyIcon}><Ionicons name="body-outline" size={17} color="#45454A" /></View>
              <View style={styles.bodyCopy}><Text style={styles.bodyTitle}>选择个人照片进行试穿</Text></View>
              <Pressable onPress={pickPhoto} disabled={isPickingPhoto} accessibilityRole="button" accessibilityLabel={photo ? '更换照片' : '上传照片'} style={[styles.uploadButton, isPickingPhoto && styles.uploadPromptDisabled]}>
                {isPickingPhoto ? <ActivityIndicator size="small" color="#FFFFFF" /> : null}
                <Text style={styles.uploadButtonText}>{isPickingPhoto ? '正在打开…' : photo ? '更换照片' : '上传照片'}</Text>
              </Pressable>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
            {categories.map(item => <Pill key={item} label={item} active={category === item} onPress={() => setCategory(item)} />)}
          </ScrollView>

          <View style={styles.sizePanel}>
            <View style={styles.sizeTitle}><Ionicons name="color-palette-outline" size={16} color="#77777E" /><Text style={styles.sizeCaption}>搭配尺码</Text></View>
            <View style={styles.sizes}>{['XS', 'S', 'M', 'L'].map(value => <Pressable key={value} onPress={() => setSize(value)} style={[styles.sizeButton, size === value && styles.sizeButtonSelected]}><Text style={[styles.sizeText, size === value && styles.sizeTextSelected]}>{value}</Text></Pressable>)}</View>
          </View>

          <View style={styles.catalogHeading}><Text accessibilityRole="header" style={styles.catalogTitle}>单品试穿库</Text><Text style={styles.catalogNote}>选择单品预览搭配</Text></View>
          <View style={styles.grid}>
            {garments.map((item, index) => <View key={item.name} style={[styles.garmentCard, { width: cardWidth }]}>
              <Image source={{ uri: item.image }} resizeMode="contain" style={styles.garmentImage} />
              <Text style={styles.garmentName}>{item.name}</Text>
              <Text style={styles.garmentDetail}>{item.detail}</Text>
              <View style={styles.garmentBottom}><Text style={styles.price}>{item.price}</Text><Pressable onPress={() => setSelectedGarment(index)} accessibilityRole="button" accessibilityState={{ selected: selectedGarment === index }} accessibilityLabel={`${selectedGarment === index ? '已选择' : '选择'}${item.name}`} style={[styles.tryButton, selectedGarment === index && styles.tryButtonActive]}><Text style={[styles.tryButtonText, selectedGarment === index && styles.tryButtonTextActive]}>{selectedGarment === index ? '已选择' : '选择'}</Text></Pressable></View>
            </View>)}
          </View>
        </ScrollView>
      </SafeAreaView>
    </GlassScreen>
  );
}

function RoundControl({ label, icon, onPress }: { label: string; icon: React.ComponentProps<typeof Ionicons>['name']; onPress: () => void }) {
  return <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={styles.roundControl}><Ionicons name={icon} size={18} color="#26262A" accessible={false} /></Pressable>;
}

function Pill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: active }} style={[styles.pill, active && styles.pillActive]}><Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: SCREEN_BACKGROUND },
  header: { minHeight: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, gap: 8 },
  resetButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22 },
  content: { width: '100%', maxWidth: 592, alignSelf: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32, gap: 14 },
  modelCard: { overflow: 'hidden', borderWidth: 1, borderColor: '#E4E4E7', borderRadius: 22, backgroundColor: '#FFFFFF' },
  modelCanvas: { overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E9E8E7' },
  modelImage: { width: '100%', height: '100%' },
  flipped: { transform: [{ scaleX: -1 }] },
  zoomed: { transform: [{ scale: 1.18 }] },
  readyBadge: { position: 'absolute', top: 12, left: 12, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 11, paddingVertical: 8, borderRadius: 18, borderWidth: 1, borderColor: '#E4E4E7', backgroundColor: 'rgba(255,255,255,0.94)' },
  readyDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#22A06B' },
  readyText: { ...Typography.caption1Emphasized, color: '#27272A' },
  canvasControls: { position: 'absolute', top: 12, right: 12, gap: 8 },
  roundControl: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E4E4E7', borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.95)' },
  uploadButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 13, borderRadius: 22, backgroundColor: '#171717' },
  uploadButtonText: { ...Typography.footnoteEmphasized, color: '#FFFFFF' },
  uploadPromptDisabled: { opacity: 0.75 },
  bodyInfo: { minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14 },
  bodyIcon: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: '#F4F4F5' },
  bodyCopy: { flex: 1, gap: 2 },
  bodyTitle: { ...Typography.footnoteEmphasized, color: '#27272A' },
  categoryList: { gap: 8, paddingVertical: 2 },
  pill: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 15, borderWidth: 1, borderColor: '#E4E4E7', borderRadius: 22, backgroundColor: '#FFFFFF' },
  pillActive: { borderColor: '#111111', backgroundColor: '#111111' },
  pillText: { ...Typography.footnoteEmphasized, color: '#52525B' },
  pillTextActive: { color: '#FFFFFF' },
  sizePanel: { minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: '#E4E4E7', borderRadius: 16, backgroundColor: '#FFFFFF' },
  sizeTitle: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sizeCaption: { ...Typography.footnote, color: '#616161' },
  sizes: { flexDirection: 'row', gap: 6 },
  sizeButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#F4F4F5' },
  sizeButtonSelected: { backgroundColor: '#111111' },
  sizeText: { ...Typography.footnote, color: '#27272A' },
  sizeTextSelected: { color: '#FFFFFF', fontWeight: '600' },
  catalogHeading: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 2 },
  catalogTitle: { ...Typography.headline, color: '#171717' },
  catalogNote: { ...Typography.footnote, color: '#616161' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  garmentCard: { overflow: 'hidden', padding: 10, borderWidth: 1, borderColor: '#E4E4E7', borderRadius: 16, backgroundColor: '#FFFFFF' },
  garmentImage: { width: '100%', height: 150, borderRadius: 11, backgroundColor: '#F4F4F5' },
  garmentName: { ...Typography.footnoteEmphasized, color: '#18181B', marginTop: 9 },
  garmentDetail: { ...Typography.footnote, color: '#616161', marginTop: 3 },
  garmentBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 5, marginTop: 9 },
  price: { ...Typography.caption1Emphasized, color: '#18181B' },
  tryButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 10, borderRadius: 12, backgroundColor: '#F4F4F5' },
  tryButtonActive: { backgroundColor: '#111111' },
  tryButtonText: { ...Typography.footnoteEmphasized, color: '#27272A' },
  tryButtonTextActive: { color: '#FFFFFF' },
});
