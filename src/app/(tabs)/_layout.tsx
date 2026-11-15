
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

const ACTIVE_COLOR = '#171717';
const INACTIVE_COLOR = '#737373';
const TAB_BACKGROUND = '#FFFFFF';
const BORDER_COLOR = '#E5E5E5';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        sceneContainerStyle: {
          backgroundColor: '#F9F9FF',
        },

        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,

        tabBarStyle: {
          height: 64,
          paddingTop: 7,
          paddingBottom: 8,
          backgroundColor: TAB_BACKGROUND,
          borderTopWidth: 1,
          borderTopColor: BORDER_COLOR,
          elevation: 0,
          shadowOpacity: 0,
        },

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 2,
        },

        tabBarItemStyle: {
          paddingVertical: 0,
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
              color={color}
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
              color={color}
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
              color={color}
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
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
