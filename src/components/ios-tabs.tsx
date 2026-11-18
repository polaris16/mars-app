import { NativeTabs } from 'expo-router/native-tabs';

const contentStyle = { backgroundColor: '#F9F9FF' };

export default function IOSTabs() {
  return (
    <NativeTabs
      tintColor="#171717"
      iconColor={{ default: '#737373', selected: '#171717' }}
      labelStyle={{
        default: { color: '#737373', fontSize: 11, fontWeight: '500' },
        selected: { color: '#171717', fontSize: 11, fontWeight: '600' },
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
