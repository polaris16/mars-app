import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

export function BrandLogo() {
  return (
    <View style={styles.frame} accessible={false}>
      <LinearGradient
        colors={['#FFF5DF', '#F7EAE5', '#EBF2E9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.logo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    padding: 10,
    borderRadius: 44,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDEDF0',
    shadowColor: '#171717',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
  },
  logo: { width: 112, height: 112, borderRadius: 34 },
});
