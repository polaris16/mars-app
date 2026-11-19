
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassSurface } from '@/components/glass-surface';
import IOSTabs from '@/components/ios-tabs';
import { Typography } from '@/constants/typography';
import { SCREEN_BACKGROUND } from '@/constants/colors';
import { useTheme } from '@/hooks/use-theme';

const INACTIVE_COLOR = '#616161';

export default function TabLayout() {
  return Platform.OS === 'ios' ? <IOSTabs /> : <GlassTabs />;
}

function GlassTabs() {
  const insets = useSafeAreaInsets();
  const { accentBlue } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        sceneStyle: {
          backgroundColor: SCREEN_BACKGROUND,
        },

        tabBarActiveTintColor: accentBlue,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        tabBarActiveBackgroundColor: 'rgba(245,245,245,0.9)',
        tabBarHideOnKeyboard: true,
        tabBarBackground: () => <GlassSurface style={[StyleSheet.absoluteFill, { borderRadius: 30 }]} />,

        tabBarStyle: {
          position: 'absolute',
          bottom: Math.max(insets.bottom, 12),
          left: 20,
          right: 20,
          height: 68,
          borderRadius: 30,
          paddingTop: 8,
          paddingBottom: 8,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },

        tabBarLabelStyle: {
          ...Typography.caption2,
          marginTop: 2,
        },

        tabBarItemStyle: {
          paddingVertical: 0,
          borderRadius: 24,
          marginHorizontal: 4,
          marginVertical: 3,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '首页',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={22}
              color={typeof color === 'string' ? color : INACTIVE_COLOR}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="discover"
        options={{
          title: '发现',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'compass' : 'compass-outline'}
              size={22}
              color={typeof color === 'string' ? color : INACTIVE_COLOR}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="message"
        options={{
          title: '消息',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'chatbubbles' : 'chatbubbles-outline'}
              size={22}
              color={typeof color === 'string' ? color : INACTIVE_COLOR}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: '我的',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={22}
              color={typeof color === 'string' ? color : INACTIVE_COLOR}
            />
          ),
        }}
      />
    </Tabs>
  );
}
