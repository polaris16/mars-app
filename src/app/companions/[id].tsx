import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomSheet, BottomSheetScrollView } from '@/components/bottom-sheet';
import { ContentPressable, ContentSurface } from '@/components/content-surface';
import { GlassBackToolbar } from '@/components/glass-back-toolbar';
import { GlassPressable, GlassScreen } from '@/components/glass-surface';
import { companions, type Companion, type CompanionFeedback } from '@/constants/companions';
import { Typography } from '@/constants/typography';
import { formatBookingTime } from '@/services/companion-booking';
import { useCompanionSession } from '@/store/companion-session';

export default function CompanionDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const companion = companions.find(item => item.id === id);
  const goBack = () => router.canGoBack() ? router.back() : router.replace('/companions');

  if (companion) return <CompanionDetails key={companion.id} companion={companion} onBack={goBack} />;

  return (
    <GlassScreen>
      <SafeAreaView style={styles.page}>
        <View style={styles.header}><GlassBackToolbar title="青年伙伴详情" onBack={goBack} /></View>
        <ContentSurface style={styles.unavailable}>
          <Text dynamicTypeRamp="body" style={styles.secondary}>找不到这位青年伙伴。</Text>
        </ContentSurface>
      </SafeAreaView>
    </GlassScreen>
  );
}

function CompanionDetails({ companion, onBack }: { companion: Companion; onBack: () => void }) {
  const router = useRouter();
  const { id, name, role, description, profile, availability, portrait, message, rating, reviews, skills } = companion;
  const { bookings, favorites, toggleFavorite } = useCompanionSession();
  const [panel, setPanel] = useState<'chat' | 'share' | null>(null);
  const booking = bookings[id];
  const favorite = favorites.includes(id);
  const shareMessage = `美刻青年伙伴 · ${name}\n${role} · ${description}\n擅长 ${skills.join('、')}`;

  const shareProfile = async () => {
    try {
      if (Platform.OS === 'web') {
        if (navigator.share) await navigator.share({ title: name, text: shareMessage });
        else setPanel('share');
      } else {
        await Share.share({ title: name, message: shareMessage });
      }
    } catch (error) {
      if (!(error instanceof Error && error.name === 'AbortError')) setPanel('share');
    }
  };

  return (
    <GlassScreen>
      <SafeAreaView style={styles.page} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.header}>
          <GlassBackToolbar title="青年伙伴详情" onBack={onBack} />
          <View style={styles.headerActions}>
            <GlassPressable accessibilityLabel={`分享${name}的资料`} onPress={shareProfile} surfaceStyle={styles.iconButton}>
              <Ionicons name="share-outline" size={22} color="#171717" accessible={false} />
            </GlassPressable>
            <GlassPressable accessibilityLabel={favorite ? '取消收藏' : '收藏伙伴'} accessibilityState={{ selected: favorite }} onPress={() => toggleFavorite(id)} surfaceStyle={styles.iconButton}>
              <Ionicons name={favorite ? 'bookmark' : 'bookmark-outline'} size={21} color="#171717" accessible={false} />
            </GlassPressable>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {booking && (
            <ContentSurface style={styles.messageCard}>
              <Text accessibilityLiveRegion="polite" accessibilityRole="header" dynamicTypeRamp="headline" style={styles.heading}>已记录预约意向（演示）</Text>
              <Text dynamicTypeRamp="subheadline" style={styles.secondary}>{formatBookingTime(booking)}</Text>
              <Text dynamicTypeRamp="subheadline" style={styles.secondary}>{booking.address.detail}</Text>
              {booking.note ? <Text dynamicTypeRamp="subheadline" style={styles.secondary}>留言 · {booking.note}</Text> : null}
            </ContentSurface>
          )}
          <View style={styles.portraitFrame}>
            <Image source={profile?.portrait ?? portrait} contentFit="cover" style={StyleSheet.absoluteFill} accessible={false} />
            <View style={styles.availability}>
              <View style={styles.availabilityDot} />
              <Text dynamicTypeRamp="caption1" style={styles.caption}>{availability}</Text>
            </View>
          </View>

          <View style={styles.identity}>
            <View style={styles.identityHeading}>
              <Text accessibilityRole="header" dynamicTypeRamp="title1" style={styles.name}>{name}</Text>
              <Text dynamicTypeRamp="footnote" style={styles.tag}>{role}</Text>
            </View>
            <Text dynamicTypeRamp="subheadline" style={styles.secondary}>{description}</Text>
          </View>

          <View style={styles.stats}>
            {profile && <Stat label="服务时长" value={profile.hours} />}
            <Stat label="好评评分" value={rating.toFixed(1)} icon="star" />
          </View>

          <View style={styles.section}>
            <Text accessibilityRole="header" dynamicTypeRamp="title2" style={styles.sectionTitle}>擅长领域</Text>
            <View style={styles.wrap}>
              {(profile?.skills ?? skills).map(skill => <Text key={skill} dynamicTypeRamp="footnote" style={styles.tag}>{skill}</Text>)}
            </View>
          </View>

          <ContentSurface style={styles.messageCard}>
            <View style={styles.inline}>
              <View style={styles.symbol}><Ionicons name="chatbubble-ellipses-outline" size={18} color="#404040" accessible={false} /></View>
              <Text accessibilityRole="header" dynamicTypeRamp="headline" style={styles.heading}>伙伴寄语</Text>
            </View>
            <Text dynamicTypeRamp="subheadline" style={styles.secondary}>{message}</Text>
          </ContentSurface>

          <View style={styles.section}>
            <View style={styles.sectionHeading}>
              <Text accessibilityRole="header" dynamicTypeRamp="title2" style={styles.sectionTitle}>交流反馈</Text>
              <Text dynamicTypeRamp="footnote" style={styles.caption}>{profile?.reviews ?? `${reviews}反馈`}</Text>
            </View>
            {profile ? profile.feedback.map(feedback => <FeedbackCard key={feedback.author} feedback={feedback} />) : (
              <Text dynamicTypeRamp="subheadline" style={styles.secondary}>暂无可展示的反馈详情</Text>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.footerActions}>
            <ContentPressable accessibilityLabel={`私聊${name}`} onPress={() => setPanel('chat')} tone="muted" surfaceStyle={styles.chatButton}>
              <Ionicons name="chatbubble-outline" size={21} color="#171717" accessible={false} />
              <Text dynamicTypeRamp="footnote" style={styles.actionLabel}>私聊</Text>
            </ContentPressable>
            <ContentPressable
              accessibilityLabel={booking ? '已记录预约意向' : `立即预约${name}`}
              disabled={Boolean(booking)}
              tone={booking ? 'muted' : 'dark'}
              onPress={() => router.push({ pathname: '/companions/booking/[id]', params: { id } })}
              style={styles.bookTarget}
              surfaceStyle={styles.bookButton}
            >
              <Text dynamicTypeRamp="headline" style={[styles.bookLabel, booking ? styles.bookLabelRecorded : undefined]}>{booking ? '已记录' : '立即预约'}</Text>
              <Ionicons name={booking ? 'checkmark' : 'calendar-outline'} size={19} color={booking ? '#616161' : '#FAFAFA'} accessible={false} />
            </ContentPressable>
          </View>
        </View>
      </SafeAreaView>

      <BottomSheet
        visible={panel !== null}
        title={panel === 'chat' ? '私聊咨询' : '分享伙伴资料'}
        onClose={() => setPanel(null)}
        closeLabel="关闭"
        closeVariant="glass-icon"
        dismissOnBackdropPress
      >
        {panel !== null && (
          <BottomSheetScrollView>
            <Text selectable={panel === 'share'} dynamicTypeRamp="body" style={styles.secondary}>
              {panel === 'chat' ? '私聊服务暂未开放。' : shareMessage}
            </Text>
          </BottomSheetScrollView>
        )}
      </BottomSheet>
    </GlassScreen>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: 'star' }) {
  return (
    <ContentSurface style={styles.stat}>
      <Text dynamicTypeRamp="footnote" style={styles.caption}>{label}</Text>
      <View style={styles.inline}>
        {icon && <Ionicons name={icon} size={16} color="#171717" accessible={false} />}
        <Text dynamicTypeRamp="title3" style={styles.statValue}>{value}</Text>
      </View>
    </ContentSurface>
  );
}

function FeedbackCard({ feedback }: { feedback: CompanionFeedback }) {
  return (
    <ContentSurface style={styles.messageCard}>
      <View style={styles.inline}>
        <View style={styles.symbol}><Ionicons name="person-outline" size={18} color="#404040" accessible={false} /></View>
        <View style={styles.feedbackAuthor}>
          <Text dynamicTypeRamp="headline" style={styles.heading}>{feedback.author}</Text>
          <Text dynamicTypeRamp="caption1" style={styles.caption}>{feedback.context}</Text>
        </View>
      </View>
      <Text dynamicTypeRamp="subheadline" style={styles.secondary}>{feedback.message}</Text>
    </ContentSurface>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, width: '100%', maxWidth: 680, alignSelf: 'center' },
  header: { minHeight: 64, paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  headerActions: { flexDirection: 'row', gap: 6 },
  iconButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20, gap: 18 },
  portraitFrame: { aspectRatio: 4 / 3, maxHeight: 370, borderRadius: 24, overflow: 'hidden', backgroundColor: '#E9E9EE' },
  availability: { position: 'absolute', top: 12, right: 12, maxWidth: '85%', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 18, backgroundColor: '#FFFFFF' },
  availabilityDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#171717' },
  identity: { gap: 4 },
  identityHeading: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  name: { ...Typography.title1, color: '#171717', flexShrink: 1 },
  tag: { ...Typography.footnote, color: '#404040', backgroundColor: '#E9E9EE', borderRadius: 18, paddingHorizontal: 10, paddingVertical: 5, flexShrink: 1 },
  secondary: { ...Typography.subhead, color: '#404040' },
  caption: { ...Typography.footnote, color: '#616161', flexShrink: 1 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stat: { flexBasis: 124, flexGrow: 1, borderRadius: 18, alignItems: 'center', justifyContent: 'center', padding: 12, gap: 4 },
  statValue: { ...Typography.title3, color: '#171717', flexShrink: 1, textAlign: 'center' },
  section: { gap: 8 },
  sectionTitle: { ...Typography.title2, color: '#171717' },
  sectionHeading: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  messageCard: { padding: 14, borderRadius: 20, gap: 8 },
  symbol: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
  heading: { ...Typography.headline, color: '#171717', flexShrink: 1 },
  feedbackAuthor: { flex: 1 },
  footer: { paddingHorizontal: 16, paddingVertical: 8, gap: 6, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E5E5E5' },
  footerActions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  chatButton: { minHeight: 48, minWidth: 48, paddingHorizontal: 10, paddingVertical: 6, gap: 2, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { ...Typography.footnoteEmphasized, color: '#171717' },
  bookTarget: { flexGrow: 1 },
  bookButton: { minHeight: 48, paddingHorizontal: 16, paddingVertical: 10, flexWrap: 'wrap', flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center' },
  bookLabel: { ...Typography.headline, color: '#FAFAFA', flexShrink: 1, textAlign: 'center' },
  bookLabelRecorded: { color: '#616161' },
  unavailable: { marginHorizontal: 16, padding: 16 },
});
