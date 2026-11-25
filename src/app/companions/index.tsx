import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Keyboard, Platform, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ContentPressable, ContentSurface } from '@/components/content-surface';
import { GlassBackToolbar } from '@/components/glass-back-toolbar';
import { GlassPressable, GlassScreen } from '@/components/glass-surface';
import { companions, type Companion } from '@/constants/companions';
import { Typography } from '@/constants/typography';
import { useInputHeight } from '@/hooks/use-input-height';
import { useAuth } from '@/store/AuthContext';
import { useCompanionSession } from '@/store/companion-session';

const filters = ['全部', '今日可约', '高分推荐', '应用心理', '数码达人', '生活纪实'] as const;
type Filter = typeof filters[number];

const availabilityColors = {
  今日可约: '#6EE7B7',
  可约明天: '#FCD34D',
  可约本周: '#7DD3FC',
};

const contentMaxWidth = 680;
const pagePadding = 16;
const cardGap = 12;

function matchesFilter(companion: Companion, filter: Filter) {
  switch (filter) {
    case '全部': return true;
    case '今日可约': return companion.availability === filter;
    case '高分推荐': return companion.rating >= 5;
    default: return companion.topics.includes(filter);
  }
}

function searchableText(companion: Companion) {
  return [companion.name, companion.role, companion.description, ...companion.skills, ...companion.topics].join(' ').toLowerCase();
}

export default function CompanionsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { bookings } = useCompanionSession();
  const insets = useSafeAreaInsets();
  const { width, fontScale } = useWindowDimensions();
  const inputHeight = useInputHeight();
  const [filter, setFilter] = useState<Filter>('全部');
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [recommendedId, setRecommendedId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(noticeTimer.current), []);

  const availableWidth = Math.min(contentMaxWidth, width - insets.left - insets.right) - pagePadding * 2;
  const singleColumn = fontScale >= 1.5 || availableWidth < 300;
  const cardWidth = singleColumn ? availableWidth : (availableWidth - cardGap) / 2;
  const keyword = query.trim().toLowerCase();
  const visibleCompanions = companions.filter(companion => matchesFilter(companion, filter) && searchableText(companion).includes(keyword));
  const recommended = visibleCompanions.find(companion => companion.id === recommendedId);
  const orderedCompanions = recommended
    ? [recommended, ...visibleCompanions.filter(companion => companion.id !== recommended.id)]
    : visibleCompanions;

  const showNotice = (message: string) => {
    clearTimeout(noticeTimer.current);
    setNotice(message);
    if (Platform.OS === 'ios') AccessibilityInfo.announceForAccessibility(message);
    noticeTimer.current = setTimeout(() => setNotice(''), 3200);
  };

  const recommendCompanion = () => {
    Keyboard.dismiss();
    const interests = (user?.interests ?? []).map(interest => interest.trim().toLowerCase()).filter(Boolean);
    const matches = visibleCompanions
      .filter(companion => !bookings[companion.id])
      .map(companion => ({ companion, overlap: interests.filter(interest => searchableText(companion).includes(interest)).length }))
      .sort((left, right) => right.overlap - left.overlap || right.companion.rating - left.companion.rating);
    const match = matches[0]?.companion;
    setRecommendedId(match?.id ?? null);
    showNotice(match ? `演示推荐 · ${match.name}` : '当前筛选下暂无可推荐的伙伴');
  };

  const openCompanion = (id: string) => {
    Keyboard.dismiss();
    router.push({ pathname: '/companions/[id]', params: { id } });
  };

  return (
    <GlassScreen>
      <SafeAreaView style={styles.fill} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.page}>
          <View style={styles.header}>
            <GlassBackToolbar title="预约青年伙伴" onBack={() => router.canGoBack() ? router.back() : router.replace('/benefits')} />
            <GlassPressable
              accessibilityLabel={searchOpen ? '关闭搜索' : '搜索伙伴'}
              onPress={() => {
                if (searchOpen) {
                  Keyboard.dismiss();
                  setQuery('');
                }
                setSearchOpen(!searchOpen);
              }}
              surfaceStyle={styles.searchButton}
            >
              <Ionicons name={searchOpen ? 'close' : 'search-outline'} size={22} color="#171717" accessible={false} />
            </GlassPressable>
          </View>

          {searchOpen && (
            <ContentSurface style={styles.searchField}>
              <Ionicons name="search-outline" size={19} color="#616161" accessible={false} />
              <TextInput
                autoFocus
                accessibilityLabel="搜索伙伴姓名、专业或技能"
                placeholder="搜索姓名、专业或技能"
                placeholderTextColor="#616161"
                autoCorrect={false}
                returnKeyType="search"
                value={query}
                onChangeText={setQuery}
                style={[styles.input, { minHeight: inputHeight }]}
              />
            </ContentSurface>
          )}

          <ScrollView
            style={styles.fill}
            contentContainerStyle={styles.content}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <ContentSurface tone="dark" style={[styles.banner, singleColumn && styles.bannerStacked]}>
              <Text accessibilityRole="header" dynamicTypeRamp="headline" style={styles.bannerTitle}>找到志趣相投的青年伙伴</Text>
              <ContentPressable onPress={recommendCompanion} surfaceStyle={styles.matchButton}>
                <Ionicons name="sparkles" size={16} color="#8A5300" accessible={false} />
                <Text dynamicTypeRamp="footnote" style={styles.matchLabel}>AI 选伙伴</Text>
              </ContentPressable>
            </ContentSurface>

            <ScrollView horizontal keyboardShouldPersistTaps="handled" showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
              {filters.map(item => (
                <ContentPressable
                  key={item}
                  tone={item === filter ? 'dark' : 'light'}
                  accessibilityState={{ selected: item === filter }}
                  onPress={() => setFilter(item)}
                  surfaceStyle={styles.filter}
                >
                  <Text dynamicTypeRamp="footnote" style={[styles.filterLabel, item === filter && styles.inverse]}>{item}</Text>
                </ContentPressable>
              ))}
            </ScrollView>

            {orderedCompanions.length ? (
              <View style={styles.grid}>
                {orderedCompanions.map(companion => (
                  <CompanionCard
                    key={companion.id}
                    companion={companion}
                    width={cardWidth}
                    booked={Boolean(bookings[companion.id])}
                    onOpen={() => openCompanion(companion.id)}
                  />
                ))}
              </View>
            ) : (
              <ContentSurface style={styles.empty}>
                <Text dynamicTypeRamp="headline" style={styles.name}>没有符合条件的伙伴</Text>
                <ContentPressable
                  onPress={() => { setQuery(''); setFilter('全部'); }}
                  tone="muted"
                  surfaceStyle={styles.filter}
                >
                  <Text dynamicTypeRamp="footnote" style={styles.filterLabel}>查看全部伙伴</Text>
                </ContentPressable>
              </ContentSurface>
            )}
          </ScrollView>

          <View pointerEvents="none" accessibilityLiveRegion="polite" style={styles.noticeDock}>
            {notice ? (
              <ContentSurface tone="dark" style={styles.notice}>
                <Text dynamicTypeRamp="footnote" style={[styles.secondary, styles.inverse]}>{notice}</Text>
              </ContentSurface>
            ) : null}
          </View>
        </View>
      </SafeAreaView>
    </GlassScreen>
  );
}

function CompanionCard({ companion, width, booked, onOpen }: { companion: Companion; width: number; booked: boolean; onOpen: () => void }) {
  const { name, portrait, role, description, skills, availability, rating, reviews } = companion;
  const summary = [name, role, description, availability, ...skills, `评分 ${rating.toFixed(1)}，评价 ${reviews}`];
  if (booked) summary.push('已记录预约意向');

  return (
    <ContentPressable
      accessibilityLabel={summary.join('，')}
      accessibilityHint="打开伙伴详情"
      onPress={onOpen}
      style={{ width }}
      surfaceStyle={styles.card}
    >
      <View style={styles.portraitFrame}>
        <Image source={portrait} style={styles.portrait} contentFit="cover" accessible={false} />
        <View style={styles.availability}>
          <View style={[styles.dot, { backgroundColor: availabilityColors[availability] }]} />
          <Text dynamicTypeRamp="caption1" style={styles.availabilityLabel}>{availability}</Text>
        </View>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.cardHeading}>
          <Text dynamicTypeRamp="headline" style={styles.name}>{name}</Text>
          <Text dynamicTypeRamp="caption1" style={styles.caption}>{role}</Text>
        </View>
        <Text dynamicTypeRamp="footnote" style={styles.secondary}>{description}</Text>
        <View style={styles.tags}>
          {skills.map(skill => (
            <Text key={skill} dynamicTypeRamp="caption1" style={[styles.caption, styles.tag]}>{skill}</Text>
          ))}
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.rating}>
          <Ionicons name="star" size={14} color="#9A5B00" accessible={false} />
          <Text dynamicTypeRamp="footnote" style={styles.ratingLabel}>{rating.toFixed(1)}</Text>
          <Text dynamicTypeRamp="caption1" style={styles.caption}>({reviews})</Text>
        </View>
        <View style={styles.cardIndicator}>
          {booked && <Text dynamicTypeRamp="caption1" style={styles.caption}>已记录</Text>}
          <Ionicons name="chevron-forward" size={16} color="#616161" accessible={false} />
        </View>
      </View>
    </ContentPressable>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  page: { flex: 1, width: '100%', maxWidth: contentMaxWidth, alignSelf: 'center' },
  header: { minHeight: 64, paddingHorizontal: pagePadding, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  searchButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  searchField: { marginHorizontal: pagePadding, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 8, borderRadius: 16 },
  input: { ...Typography.body, color: '#171717', flex: 1, minWidth: 0, paddingVertical: 12 },
  content: { paddingHorizontal: pagePadding, paddingTop: 8, paddingBottom: 32, gap: 12 },
  banner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: 14, borderRadius: 20 },
  bannerStacked: { flexDirection: 'column', alignItems: 'flex-start' },
  bannerTitle: { ...Typography.headline, color: '#FFFFFF', flexShrink: 1 },
  matchButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6 },
  matchLabel: { ...Typography.footnoteEmphasized, color: '#171717' },
  filters: { gap: 7, paddingVertical: 2 },
  filter: { minHeight: 44, paddingHorizontal: 14, paddingVertical: 8, justifyContent: 'center', alignItems: 'center' },
  filterLabel: { ...Typography.footnoteEmphasized, color: '#404040', textAlign: 'center' },
  inverse: { color: '#FFFFFF' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: cardGap },
  card: { flexGrow: 1, padding: 12, gap: 10 },
  portraitFrame: { aspectRatio: 4 / 5, borderRadius: 16, backgroundColor: '#EBEBEF', overflow: 'hidden' },
  portrait: { width: '100%', height: '100%' },
  availability: { position: 'absolute', top: 8, left: 8, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 16, backgroundColor: '#262626', maxWidth: '90%' },
  availabilityLabel: { ...Typography.caption1Emphasized, color: '#FFFFFF', flexShrink: 1 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  cardDetails: { flexGrow: 1, gap: 5 },
  cardHeading: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'baseline', gap: 4 },
  name: { ...Typography.headline, color: '#171717', flexShrink: 1 },
  secondary: { ...Typography.footnote, color: '#616161' },
  caption: { ...Typography.caption1, color: '#616161', flexShrink: 1 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  tag: { backgroundColor: '#F5F5F5', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 5 },
  cardFooter: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 6, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E5E5E5' },
  rating: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 3 },
  ratingLabel: { ...Typography.footnoteEmphasized, color: '#171717' },
  cardIndicator: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  empty: { padding: 20, gap: 10, alignItems: 'center' },
  noticeDock: { position: 'absolute', bottom: 12, left: pagePadding, right: pagePadding, alignItems: 'center' },
  notice: { maxWidth: '100%', borderRadius: 18, paddingHorizontal: 16, paddingVertical: 10 },
});
