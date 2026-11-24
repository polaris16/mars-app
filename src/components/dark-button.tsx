import { Pressable, StyleSheet, Text } from 'react-native';

import { Typography } from '@/constants/typography';

type DarkButtonProps = {
  label: string;
  accessibilityLabel?: string;
  disabled?: boolean;
  onPress?: () => void;
};

export function DarkButton({ label, accessibilityLabel, disabled, onPress }: DarkButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, (pressed || disabled) && styles.dimmed]}
    >
      <Text dynamicTypeRamp="subheadline" style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: 44, paddingHorizontal: 13, paddingVertical: 8, borderRadius: 22, backgroundColor: '#171717', alignItems: 'center', justifyContent: 'center' },
  label: { ...Typography.subheadEmphasized, color: '#FFFFFF', textAlign: 'center' },
  dimmed: { opacity: 0.65 },
});
