import type { TextStyle } from 'react-native';

/** Apple HIG text styles at the default (Large) content size. */
export const Typography = {
  largeTitle: { fontSize: 34, lineHeight: 41, fontWeight: '700' },
  title1: { fontSize: 28, lineHeight: 34, fontWeight: '700' },
  title2: { fontSize: 22, lineHeight: 28, fontWeight: '700' },
  title3: { fontSize: 20, lineHeight: 25, fontWeight: '600' },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '600' },
  body: { fontSize: 17, lineHeight: 22, fontWeight: '400' },
  callout: { fontSize: 16, lineHeight: 21, fontWeight: '400' },
  subhead: { fontSize: 15, lineHeight: 20, fontWeight: '400' },
  subheadEmphasized: { fontSize: 15, lineHeight: 20, fontWeight: '600' },
  footnote: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
  footnoteEmphasized: { fontSize: 13, lineHeight: 18, fontWeight: '600' },
  caption1: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
  caption1Emphasized: { fontSize: 12, lineHeight: 16, fontWeight: '600' },
  // Reserved for tab labels; page content uses caption1 or larger.
  caption2: { fontSize: 11, lineHeight: 13, fontWeight: '500' },
} as const satisfies Record<string, TextStyle>;
