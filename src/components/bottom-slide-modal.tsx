import type { PropsWithChildren } from 'react';
import { Modal } from 'react-native';

import { useGlassAccessibility } from '@/components/ui/liquid-glass';

type BottomSlideModalProps = PropsWithChildren<{
  visible?: boolean;
  onClose: () => void;
}>;

export function BottomSlideModal({ visible = true, onClose, children }: BottomSlideModalProps) {
  const { reduceMotion } = useGlassAccessibility();

  return (
    <Modal
      visible={visible}
      transparent
      animationType={reduceMotion ? 'none' : 'slide'}
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {children}
    </Modal>
  );
}
