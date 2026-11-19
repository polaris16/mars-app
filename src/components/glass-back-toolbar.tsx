import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { GlassToolbar } from '@/components/glass-surface';
import { Typography } from '@/constants/typography';

type GlassBackToolbarProps = {
  title: string;
  onBack: () => void;
};

export function GlassBackToolbar({ title, onBack }: GlassBackToolbarProps) {
  return (
    <GlassToolbar accessibilityLabel={`${title}页导航`} style={styles.toolbar}>
      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="返回"
        className="h-11 w-11 shrink-0 items-center justify-center rounded-full active:bg-neutral-900/10"
      >
        <Ionicons name="chevron-back" size={23} color="#181C22" />
      </Pressable>
      <Text accessibilityRole="header" dynamicTypeRamp="headline" style={styles.title}>
        {title}
      </Text>
    </GlassToolbar>
  );
}

const styles = StyleSheet.create({
  toolbar: { minWidth: 0, flexShrink: 1 },
  title: { ...Typography.headline, marginStart: 4, marginEnd: 12, flexShrink: 1, color: '#1B1C1C' },
});
