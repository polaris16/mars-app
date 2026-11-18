import {
  GlassContainer as ExpoGlassContainer,
  GlassView as ExpoGlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
  type GlassContainerProps,
  type GlassViewProps,
} from 'expo-glass-effect';
import { styled } from 'nativewind';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AccessibilityInfo, Platform, View, type ViewStyle } from 'react-native';

// gluestack-ui v5 LiquidGlass, with capability checks for Expo SDK 58.
const nativeGlassAvailable = Platform.OS === 'ios'
  && isGlassEffectAPIAvailable() && isLiquidGlassAvailable();
const ReduceTransparencyContext = createContext(false);

export function GlassAccessibilityProvider({ children }: React.PropsWithChildren) {
  const [reduceTransparency, setReduceTransparency] = useState(false);
  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    let active = true;
    void AccessibilityInfo.isReduceTransparencyEnabled().then(value => {
      if (active) setReduceTransparency(value);
    }).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceTransparencyChanged', setReduceTransparency);
    return () => { active = false; subscription.remove(); };
  }, []);
  return <ReduceTransparencyContext value={reduceTransparency}>{children}</ReduceTransparencyContext>;
}

const StyledGlassView = styled(ExpoGlassView, { className: 'style' });
const StyledGlassContainer = styled(ExpoGlassContainer, { className: 'style' });
type Props = GlassViewProps & { className?: string; fallbackColor?: string };

export const GlassView = React.forwardRef<React.ComponentRef<typeof ExpoGlassView>, Props>(
  function GlassView({ className, style, fallbackColor, glassEffectStyle = 'regular', tintColor, isInteractive, colorScheme = 'light', ...props }, ref) {
    const reduceTransparency = useContext(ReduceTransparencyContext);
    if (nativeGlassAvailable && !reduceTransparency) {
      return <StyledGlassView ref={ref} {...props} className={className} style={style} glassEffectStyle={glassEffectStyle} tintColor={tintColor} isInteractive={isInteractive} colorScheme={colorScheme} />;
    }
    const dark = colorScheme === 'dark';
    const webBlur = Platform.OS === 'web' ? {
      backdropFilter: 'blur(24px) saturate(140%)',
      WebkitBackdropFilter: 'blur(24px) saturate(140%)',
    } as ViewStyle : undefined;
    return <View ref={ref} {...props} className={className} style={[
      { backgroundColor: reduceTransparency ? (dark ? '#171717' : '#FFFFFF') : fallbackColor ?? (dark ? 'rgba(23,23,23,0.92)' : 'rgba(255,255,255,0.72)') },
      !reduceTransparency && webBlur,
      style,
    ]} />;
  },
);

export const GlassContainer = React.forwardRef<React.ComponentRef<typeof ExpoGlassContainer>, GlassContainerProps & { className?: string }>(
  function GlassContainer({ className, spacing, ...props }, ref) {
    const reduceTransparency = useContext(ReduceTransparencyContext);
    return nativeGlassAvailable && !reduceTransparency
      ? <StyledGlassContainer ref={ref} {...props} className={className} spacing={spacing} />
      : <View ref={ref} {...props} className={className} />;
  },
);

export { isGlassEffectAPIAvailable, isLiquidGlassAvailable };
export type { GlassColorScheme, GlassContainerProps, GlassStyle, GlassViewProps } from 'expo-glass-effect';
