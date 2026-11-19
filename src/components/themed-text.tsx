import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, ThemeColor } from '@/constants/theme';
import { Typography } from '@/constants/typography';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return <Text dynamicTypeRamp={ramps[type]} style={[{ color: theme[themeColor ?? 'text'] }, styles[type], style]} {...rest} />;
}

const ramps = {
  small: 'subheadline', smallBold: 'subheadline', default: 'body', title: 'largeTitle',
  subtitle: 'title1', link: 'body', linkPrimary: 'body', code: 'footnote',
} as const;

const styles = StyleSheet.create({
  small: {
    ...Typography.subhead,
  },
  smallBold: {
    ...Typography.subheadEmphasized,
  },
  default: {
    ...Typography.body,
  },
  title: {
    ...Typography.largeTitle,
  },
  subtitle: {
    ...Typography.title1,
  },
  link: {
    ...Typography.body,
  },
  linkPrimary: {
    ...Typography.body,
    color: '#005CB8',
  },
  code: {
    fontFamily: Fonts.mono,
    ...Typography.footnote,
    fontWeight: Platform.select({ android: '600' as const }) ?? '400',
  },
});
