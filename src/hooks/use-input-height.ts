import { useWindowDimensions } from 'react-native';

import { Typography } from '@/constants/typography';

/** Single-line fields: scaled body text, 12pt vertical padding, and 1pt borders. */
export function useInputHeight() {
  const { fontScale } = useWindowDimensions();

  return Math.max(48, Math.ceil(Typography.body.lineHeight * fontScale) + 26);
}
