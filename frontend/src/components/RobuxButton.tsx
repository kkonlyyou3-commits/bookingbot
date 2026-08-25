import { motion } from 'framer-motion';
import { PropsWithChildren } from 'react';
import { haptic } from '../lib/telegram';

interface RobuxButtonProps extends PropsWithChildren {
  onClick?: () => void;
  variant?: 'robux' | 'ghost';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export function RobuxButton({
  children,
  onClick,
  variant = 'robux',
  className = '',
  disabled,
  type = 'button',
}: RobuxButtonProps) {
  const base =
    variant === 'robux'
      ? 'bg-robux-gradient text-base-950 shadow-robux'
      : 'glass text-robux-300';

  return (
    <motion.button
      type={type}
      whileTap={{ scale: 0.97 }}
      onClick={() => {
        if (disabled) return;
        haptic('medium');
        onClick?.();
      }}
      disabled={disabled}
      className={`w-full rounded-2xl py-4 font-semibold text-base transition-opacity disabled:opacity-40 ${base} ${className}`}
    >
      {children}
    </motion.button>
  );
}
