import { GlassView } from '@/components/ui/liquid-glass';
import { Pressable, StyleSheet, View, type PressableProps, type ViewProps } from 'react-native';
import type { ComponentProps } from 'react';

type GlassSurfaceProps = ComponentProps<typeof GlassView> & { tone?: 'light' | 'dark' | 'muted' };

/** Shared glass material, using the existing monochrome palette. */
export function GlassSurface({ tone = 'light', style, ...props }: GlassSurfaceProps) {
  const dark = tone === 'dark';
  return <GlassView
    glassEffectStyle="regular"
    colorScheme={dark ? 'dark' : 'light'}
    tintColor={dark ? '#171717CC' : tone === 'muted' ? '#F5F5F540' : '#FFFFFF30'}
    fallbackColor={dark ? 'rgba(23,23,23,0.94)' : tone === 'muted' ? 'rgba(245,245,245,0.72)' : 'rgba(255,255,255,0.72)'}
    {...props}
    style={[styles.surface, dark && styles.dark, style]}
  />;
}

type GlassPressableProps = PressableProps & {
  className?: string;
  tone?: GlassSurfaceProps['tone'];
  surfaceStyle?: GlassSurfaceProps['style'];
  surfaceClassName?: string;
};

export function GlassPressable({ children, tone, surfaceStyle, surfaceClassName, style, ...props }: GlassPressableProps) {
  return <Pressable accessibilityRole="button" {...props} style={state => [
    typeof style === 'function' ? style(state) : style,
    state.pressed && { transform: [{ scale: 0.98 }] },
  ]}>
    {state => <GlassSurface isInteractive tone={tone} className={surfaceClassName} style={surfaceStyle}>
      {typeof children === 'function' ? children(state) : children}
    </GlassSurface>}
  </Pressable>;
}

export function GlassBackdrop() {
  return <View pointerEvents="none" accessible={false} style={styles.backdrop}>
    <View style={styles.light} />
    <View style={styles.shade} />
  </View>;
}

export function GlassScreen({ children, style, ...props }: ViewProps) {
  return <View {...props} style={[styles.screen, style]}><GlassBackdrop />{children}</View>;
}

const styles = StyleSheet.create({
  surface: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.95)',
    borderBottomColor: 'rgba(229,229,229,0.65)',
    shadowColor: '#171717',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.045,
    shadowRadius: 18,
  },
  dark: { borderColor: '#404040', borderTopColor: '#606060' },
  screen: { flex: 1, backgroundColor: '#F9F9FF' },
  backdrop: { ...StyleSheet.absoluteFill, overflow: 'hidden' },
  light: { position: 'absolute', top: -100, right: -100, width: 380, height: 380, borderRadius: 190, backgroundColor: '#FFFFFF' },
  shade: { position: 'absolute', top: 300, left: -180, width: 360, height: 500, borderRadius: 180, backgroundColor: 'rgba(229,229,229,0.24)', transform: [{ rotate: '-30deg' }] },
});
