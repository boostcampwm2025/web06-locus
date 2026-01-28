import type { Variants } from 'motion/react';

/**
 * 페이지 1 애니메이션 Variants
 */
export const cardVariants: Variants = {
  initial: { opacity: 0, scale: 0.8, rotate: 0, y: 20 },
  animate: (rotation: number) => ({
    opacity: 1,
    scale: 1,
    rotate: rotation,
    y: [0, -10, 0],
    transition: {
      opacity: { duration: 0.6 },
      scale: { duration: 0.6 },
      rotate: { duration: 0.6 },
      y: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
    },
  }),
};

/**
 * 페이지 2 애니메이션 Variants
 */
export const recordVariants: Variants = {
  initial: { opacity: 0, scale: 0.7, rotate: 0, y: 30 },
  animate: (rotation: number) => ({
    opacity: 1,
    scale: 1,
    rotate: rotation,
    y: [0, -8, 0],
    transition: {
      opacity: { duration: 0.6 },
      scale: { duration: 0.6 },
      rotate: { duration: 0.6 },
      y: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
    },
  }),
};

/**
 * 페이지 3 애니메이션 Variants
 */
export const listContainerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

export const stepVariants: Variants = {
  initial: {
    opacity: 0,
    y: -20,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

export const iconVariants: Variants = {
  initial: { rotate: -10, scale: 0.8 },
  animate: {
    rotate: 0,
    scale: 1,
    transition: { duration: 0.5 },
  },
};

/**
 * 페이지 4 애니메이션 Variants
 */
export const memoryVariants: Variants = {
  initial: { opacity: 0, scale: 0.6 },
  animate: (delay: number) => ({
    opacity: 1,
    scale: 1,
    y: [0, -6, 0],
    transition: {
      opacity: { duration: 0.5 },
      scale: { duration: 0.5 },
      y: {
        duration: 2.5 + delay * 0.5,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  }),
};
