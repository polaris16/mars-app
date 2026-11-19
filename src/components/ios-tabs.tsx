import { NativeTabs } from 'expo-router/native-tabs';
import { SCREEN_BACKGROUND } from '@/constants/colors';

const contentStyle = { backgroundColor: SCREEN_BACKGROUND };

export default function IOSTabs() {
  return (
    <NativeTabs
      tintColor="#005CB8"
      iconColor={{ default: '#616161', selected: '#005CB8' }}
      labelStyle={{
        default: { color: '#616161' },
        selected: { color: '#005CB8' },
      }}
      minimizeBehavior="never"
      disableTransparentOnScrollEdge
    >
      {/* Screens already manage their safe area and bottom content spacing. */}
      <NativeTabs.Trigger name="index" contentStyle={contentStyle} disableAutomaticContentInsets>
        <NativeTabs.Trigger.Label>首页</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} renderingMode="template" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="discover" contentStyle={contentStyle} disableAutomaticContentInsets>
        <NativeTabs.Trigger.Label>发现</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'safari', selected: 'safari.fill' }} renderingMode="template" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="message" contentStyle={contentStyle} disableAutomaticContentInsets>
        <NativeTabs.Trigger.Label>消息</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'bubble.left.and.bubble.right', selected: 'bubble.left.and.bubble.right.fill' }} renderingMode="template" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile" contentStyle={contentStyle} disableAutomaticContentInsets>
        <NativeTabs.Trigger.Label>我的</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'person', selected: 'person.fill' }} renderingMode="template" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
