import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#94A3B8',

        tabBarStyle: {
          height: 62,
          paddingTop: 6,
          paddingBottom: 8,
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E7EB',
        },

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '首页',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={22}
              color={String(focused ? '#2563EB' : '#94A3B8') as any}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="discover"
        options={{
          title: '发现',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'compass' : 'compass-outline'}
              size={22}
              color={String(focused ? '#2563EB' : '#94A3B8') as any}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="message"
        options={{
          title: '消息',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'chatbubbles' : 'chatbubbles-outline'}
              size={22}
              color={String(focused ? '#2563EB' : '#94A3B8') as any}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: '我的',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={22}
              color={String(focused ? '#2563EB' : '#94A3B8') as any}
            />
          ),
        }}
      />
    </Tabs>
  );
}