import { Ionicons } from '@expo/vector-icons';
import type { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View, type ScrollViewProps } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { BottomSlideModal } from '@/components/bottom-slide-modal';
import { ContentSurface } from '@/components/content-surface';
import { GlassPressable } from '@/components/glass-surface';
import { Typography } from '@/constants/typography';

const headerControlSize = 44;

type BottomSheetProps = PropsWithChildren<{
  visible: boolean;
  title?: string;
  onClose?: () => void;
  closeLabel?: string;
  closeVariant?: 'text' | 'glass-icon';
  dismissOnBackdropPress?: boolean;
  avoidKeyboard?: boolean;
  expanded?: boolean;
}>;

export function BottomSheet({
  visible,
  title,
  onClose,
  closeLabel = '关闭',
  closeVariant = 'text',
  dismissOnBackdropPress = false,
  avoidKeyboard = false,
  expanded = false,
  children,
}: BottomSheetProps) {
  return (
    <BottomSlideModal visible={visible} onClose={onClose} navigationBarTranslucent>
      <SafeAreaProvider>
        <SafeAreaView edges={['top', 'left', 'right']} style={styles.overlay}>
          {onClose && dismissOnBackdropPress && (
            <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessible={false} importantForAccessibility="no" />
          )}
          <KeyboardAvoidingView
            pointerEvents="box-none"
            enabled={avoidKeyboard && Platform.OS === 'ios'}
            behavior="padding"
            style={styles.dock}
          >
            <ContentSurface accessibilityViewIsModal onAccessibilityEscape={onClose} style={[styles.sheet, expanded && styles.expanded]}>
              <SafeAreaView edges={['bottom']} style={styles.content}>
                {(title || onClose) && (
                  <View style={[styles.header, !title && styles.headerWithoutTitle]}>
                    {title ? (
                      <View style={styles.titleSlot}>
                        <Text accessibilityRole="header" dynamicTypeRamp="headline" style={styles.title}>{title}</Text>
                      </View>
                    ) : null}
                    {onClose && (closeVariant === 'glass-icon' ? (
                      <GlassPressable accessibilityLabel={closeLabel} onPress={onClose} surfaceStyle={styles.glassClose}>
                        <Ionicons name="close" size={22} color="#171717" accessible={false} />
                      </GlassPressable>
                    ) : (
                      <Pressable
                        accessibilityRole="button"
                        onPress={onClose}
                        style={({ pressed }) => [styles.close, pressed && styles.pressed]}
                      >
                        <Text dynamicTypeRamp="body" style={styles.closeLabel}>{closeLabel}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
                {children}
              </SafeAreaView>
            </ContentSurface>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </SafeAreaProvider>
    </BottomSlideModal>
  );
}

export function BottomSheetScrollView({ style, ...props }: ScrollViewProps) {
  return <ScrollView keyboardShouldPersistTaps="handled" {...props} style={[styles.scroll, style]} />;
}

type BottomSheetFormProps = PropsWithChildren<{
  submitLabel: string;
  submitDisabled: boolean;
  onSubmit: () => void;
}>;

export function BottomSheetForm({ submitLabel, submitDisabled, onSubmit, children }: BottomSheetFormProps) {
  return (
    <>
      <BottomSheetScrollView
        automaticallyAdjustContentInsets={false}
        bounces={false}
        overScrollMode="never"
        contentContainerStyle={styles.fields}
      >
        {children}
      </BottomSheetScrollView>
      <Pressable
        accessibilityRole="button"
        disabled={submitDisabled}
        onPress={onSubmit}
        style={({ pressed }) => [styles.submit, pressed && styles.pressed, submitDisabled && styles.disabled]}
      >
        <Text dynamicTypeRamp="headline" style={styles.submitLabel}>{submitLabel}</Text>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(17,17,17,0.35)' },
  dock: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  sheet: { width: '100%', maxWidth: 540, maxHeight: '92%', flexShrink: 1, borderRadius: 0, borderTopLeftRadius: 32, borderTopRightRadius: 32, overflow: 'hidden' },
  expanded: { minHeight: '48%' },
  content: { flexShrink: 1, padding: 20, paddingTop: 12, gap: 12 },
  header: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  headerWithoutTitle: { justifyContent: 'flex-end' },
  titleSlot: { minHeight: headerControlSize, flexShrink: 1, justifyContent: 'center' },
  title: { ...Typography.headline, color: '#171717' },
  glassClose: { width: headerControlSize, height: headerControlSize, borderRadius: headerControlSize / 2, alignItems: 'center', justifyContent: 'center' },
  close: { minWidth: headerControlSize, minHeight: headerControlSize, paddingHorizontal: 12, paddingVertical: 8, borderRadius: headerControlSize / 2, backgroundColor: '#F2F2F7', alignItems: 'center', justifyContent: 'center' },
  closeLabel: { ...Typography.body, color: '#171717' },
  pressed: { opacity: 0.65 },
  scroll: { flexGrow: 0, flexShrink: 1 },
  fields: { gap: 12 },
  submit: { minHeight: 48, flexShrink: 0, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 24, backgroundColor: '#171717', alignItems: 'center', justifyContent: 'center' },
  submitLabel: { ...Typography.headline, color: '#FFFFFF', textAlign: 'center' },
  disabled: { opacity: 0.35 },
});
