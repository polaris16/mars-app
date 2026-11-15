import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({
  onFinish,
}: SplashScreenProps) {
  // Logo 动画
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;

  // 品牌文字动画
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(20)).current;

  // 加载圆点动画
  const dots = useRef(
    Array.from({ length: 3 }, () => new Animated.Value(0.3))
  ).current;

  useEffect(() => {
    // Logo 缩放和淡入
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 5,
        tension: 45,
        useNativeDriver: true,
      }),
    ]).start();

    // 品牌文字延迟显示
    Animated.sequence([
      Animated.delay(500),
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(titleTranslateY, {
          toValue: 0,
          duration: 700,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // 加载圆点循环动画
    const dotAnimations = dots.map((dot, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 180),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      )
    );

    dotAnimations.forEach(animation => animation.start());

    // 开屏动画结束
    const timer = setTimeout(() => {
      onFinish();
    }, 2800);

    return () => {
      clearTimeout(timer);
      dotAnimations.forEach(animation => animation.stop());
    };
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
      />

      <LinearGradient
        colors={['#101D3A', '#172D55', '#101D3A']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* 背景装饰 */}
      <View style={styles.backgroundCircle1} />
      <View style={styles.backgroundCircle2} />

      {/* 中间 Logo 和品牌信息 */}
      <View style={styles.centerContent}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <LinearGradient
            colors={['#60A5FA', '#2563EB', '#1D4ED8']}
            style={styles.logo}
          >
            <Text style={styles.logoText}>✦</Text>
          </LinearGradient>
        </Animated.View>

        <Animated.View
          style={{
            opacity: titleOpacity,
            transform: [{ translateY: titleTranslateY }],
            alignItems: 'center',
          }}
        >
          <Text style={styles.appName}>同 乐</Text>

          <Text style={styles.appDescription}>
            为城市⽼年⼈驱散孤独的互联⽹平台
          </Text>
        </Animated.View>

        {/* 加载动画 */}
        <View style={styles.loadingContainer}>
          {dots.map((dot, index) => (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                { opacity: dot },
              ]}
            />
          ))}
        </View>
      </View>

      {/* 底部版本信息 */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          POWERED BY TECHNOLOGY
        </Text>
        <Text style={styles.versionText}>
          Version 1.0.0
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101D3A',
    justifyContent: 'center',
    alignItems: 'center',
  },

  backgroundCircle1: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    borderWidth: 1,
    borderColor: 'rgba(96,165,250,0.10)',
    top: '10%',
    right: '-35%',
  },

  backgroundCircle2: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 1,
    borderColor: 'rgba(96,165,250,0.08)',
    bottom: '10%',
    left: '-30%',
  },

  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoContainer: {
    marginBottom: 28,
  },

  logo: {
    width: 108,
    height: 108,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },

  logoText: {
    color: '#FFFFFF',
    fontSize: 58,
    fontWeight: 'bold',
  },

  appName: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 4,
  },

  appDescription: {
    color: '#A9B8D3',
    fontSize: 14,
    marginTop: 12,
    letterSpacing: 1,
  },

  loadingContainer: {
    flexDirection: 'row',
    marginTop: 45,
    gap: 9,
  },

  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#60A5FA',
  },

  footer: {
    position: 'absolute',
    bottom: 45,
    alignItems: 'center',
  },

  footerText: {
    color: '#8191AC',
    fontSize: 10,
    letterSpacing: 2,
  },

  versionText: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 10,
  },
});