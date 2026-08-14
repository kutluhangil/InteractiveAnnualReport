import { Transition } from 'motion/react';

export const smoothEase = [0.22, 1, 0.36, 1] as const;

export const defaultViewport = {
  once: false,
  amount: 0.15,
  margin: '-40px 0px -40px 0px',
};

export const gentleViewport = {
  once: false,
  amount: 0.08,
  margin: '-20px 0px -20px 0px',
};

export const defaultScrollTransition: Transition = {
  duration: 0.7,
  ease: [0.22, 1, 0.36, 1],
};

export const cardScrollTransition: Transition = {
  duration: 0.75,
  ease: [0.22, 1, 0.36, 1],
};

export const springScrollTransition: Transition = {
  type: 'spring',
  stiffness: 110,
  damping: 20,
};

export const scrollFadeUpVariants = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
};

export const scrollFadeScaleVariants = {
  initial: { opacity: 0, scale: 0.96, y: 24 },
  whileInView: { opacity: 1, scale: 1, y: 0 },
};

export const scrollSlideLeftVariants = {
  initial: { opacity: 0, x: -30 },
  whileInView: { opacity: 1, x: 0 },
};

export const scrollSlideRightVariants = {
  initial: { opacity: 0, x: 30 },
  whileInView: { opacity: 1, x: 0 },
};
