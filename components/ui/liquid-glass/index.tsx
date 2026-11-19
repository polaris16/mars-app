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
const GlassAccessibilityContext = createContext({ reduceTransparency: false, reduceMotion: false, highContrast: false });

export const useGlassAccessibility = () => useContext(GlassAccessibilityContext);

export function GlassAccessibilityProvider({ children }: React.PropsWithChildren) {
  const [reduceTransparency, setReduceTransparency] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  useEffect(() => {
    let active = true;
    const motion = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    void AccessibilityInfo.isReduceMotionEnabled().then(value => {
      if (active) setReduceMotion(value);
    }).catch(() => {});
    const transparency = Platform.OS === 'ios'
      ? AccessibilityInfo.addEventListener('reduceTransparencyChanged', setReduceTransparency) : null;
    const contrast = Platform.OS === 'ios'
      ? AccessibilityInfo.addEventListener('darkerSystemColorsChanged', setHighContrast)
      : Platform.OS === 'android'
        ? AccessibilityInfo.addEventListener('highTextContrastChanged', setHighContrast) : null;
    if (Platform.OS === 'ios') {
      void AccessibilityInfo.isReduceTransparencyEnabled().then(value => {
        if (active) setReduceTransparency(value);
      }).catch(() => {});
      void AccessibilityInfo.isDarkerSystemColorsEnabled().then(value => {
        if (active) setHighContrast(value);
      }).catch(() => {});
    } else if (Platform.OS === 'android') {
      void AccessibilityInfo.isHighTextContrastEnabled().then(value => {
        if (active) setHighContrast(value);
      }).catch(() => {});
    }
    return () => { active = false; motion.remove(); transparency?.remove(); contrast?.remove(); };
  }, []);
  return <GlassAccessibilityContext value={{ reduceTransparency, reduceMotion, highContrast }}>{children}</GlassAccessibilityContext>;
}

const StyledGlassView = styled(ExpoGlassView, { className: 'style' });
const StyledGlassContainer = styled(ExpoGlassContainer, { className: 'style' });
type Props = GlassViewProps & { className?: string; fallbackColor?: string };

export const GlassView = React.forwardRef<React.ComponentRef<typeof ExpoGlassView>, Props>(
  function GlassView({ className, style, fallbackColor, glassEffectStyle = 'regular', tintColor, isInteractive, colorScheme = 'light', ...props }, ref) {
    const { reduceTransparency, highContrast } = useGlassAccessibility();
    const opaque = reduceTransparency || highContrast;
    if (nativeGlassAvailable && !opaque) {
      return <StyledGlassView ref={ref} {...props} className={className} style={style} glassEffectStyle={glassEffectStyle} tintColor={tintColor} isInteractive={isInteractive} colorScheme={colorScheme} />;
    }
    const dark = colorScheme === 'dark';
    const webBlur = Platform.OS === 'web' ? {
      backdropFilter: 'blur(24px) saturate(140%)',
      WebkitBackdropFilter: 'blur(24px) saturate(140%)',
    } as ViewStyle : undefined;
    return <View ref={ref} {...props} className={className} style={[
      { backgroundColor: opaque ? (dark ? '#171717' : '#FFFFFF') : fallbackColor ?? (dark ? 'rgba(23,23,23,0.92)' : 'rgba(255,255,255,0.72)') },
      !opaque && webBlur,
      style,
      highContrast && { borderWidth: 1, borderColor: dark ? '#FFFFFF' : '#171717' },
    ]} />;
  },
);

export const GlassContainer = React.forwardRef<React.ComponentRef<typeof ExpoGlassContainer>, GlassContainerProps & { className?: string }>(
  function GlassContainer({ className, spacing, ...props }, ref) {
    const { reduceTransparency, highContrast } = useGlassAccessibility();
    return nativeGlassAvailable && !reduceTransparency && !highContrast
      ? <StyledGlassContainer ref={ref} {...props} className={className} spacing={spacing} />
      : <View ref={ref} {...props} className={className} />;
  },
);

export { isGlassEffectAPIAvailable, isLiquidGlassAvailable };
export type { GlassColorScheme, GlassContainerProps, GlassStyle, GlassViewProps } from 'expo-glass-effect';
