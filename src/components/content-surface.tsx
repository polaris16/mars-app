import { Pressable, StyleSheet, View, type PressableProps, type ViewProps } from 'react-native';
import { useGlassAccessibility } from '@/components/ui/liquid-glass';

type Tone = 'light' | 'dark' | 'muted';
type SurfaceProps = ViewProps & { className?: string; tone?: Tone };

/** Opaque surfaces keep cards and forms in the content layer. */
export function ContentSurface({ tone = 'light', style, ...props }: SurfaceProps) {
  const { highContrast } = useGlassAccessibility();
  return <View {...props} style={[
    styles.surface,
    styles[tone],
    highContrast && { borderWidth: 1, borderColor: tone === 'dark' ? '#FFFFFF' : '#171717' },
    style,
  ]} />;
}

type ContentPressableProps = PressableProps & {
  className?: string;
  tone?: Tone;
  surfaceStyle?: ViewProps['style'];
  surfaceClassName?: string;
};

export function ContentPressable({ children, tone, surfaceStyle, surfaceClassName, style, ...props }: ContentPressableProps) {
  return <Pressable accessibilityRole="button" {...props} style={state => [
    styles.target,
    typeof style === 'function' ? style(state) : style,
    state.pressed && styles.pressed,
  ]}>
    {state => <ContentSurface tone={tone} className={surfaceClassName} style={surfaceStyle}>
      {typeof children === 'function' ? children(state) : children}
    </ContentSurface>}
  </Pressable>;
}

const styles = StyleSheet.create({
  surface: { borderRadius: 24 },
  light: { backgroundColor: '#FFFFFF' },
  dark: { backgroundColor: '#171717' },
  muted: { backgroundColor: '#F5F5F5' },
  target: { minHeight: 44 },
  pressed: { opacity: 0.7 },
});
