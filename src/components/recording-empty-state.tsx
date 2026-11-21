import { Typography } from '@/constants/typography';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

export function RecordingEmptyState({ icon, description }: {
  icon: 'mic-outline' | 'document-text-outline';
  description?: string;
}) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={34} color="#616161" accessible={false} importantForAccessibility="no" />
      <Text accessibilityRole="header" dynamicTypeRamp="headline" style={styles.title}>暂无记录</Text>
      {description ? <Text dynamicTypeRamp="subheadline" style={styles.description}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingTop: 24, paddingBottom: 64 },
  title: { ...Typography.headline, color: '#1B1C1C', textAlign: 'center', marginTop: 12 },
  description: { ...Typography.subhead, color: '#616161', textAlign: 'center', marginTop: 4 },
});
