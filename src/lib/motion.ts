import { MotionProps, Transition } from "framer-motion";

/** Easing curves (cubic-bezier) */
export const easing = {
  standard: [0.2, 0, 0, 1] as [number, number, number, number],
  emphasized: [0.2, 0, 0, 1], // tweak if you want a “snappier” feel
  entrance: [0.16, 1, 0.3, 1],
  exit: [0.7, 0, 0.84, 0],
};

/** Duration presets (seconds) */
export const dur = {
  xfast: 0.18,
  fast: 0.28,
  base: 0.36,
  slow: 0.5,
};

/** Transition presets */
export const t = {
  base: { duration: dur.base, ease: easing.standard } as Transition,
  fast: { duration: dur.fast, ease: easing.standard } as Transition,
  enter: { duration: dur.base, ease: easing.entrance } as Transition,
  exit: { duration: dur.fast, ease: easing.exit } as Transition,
  // Good for drawers/modals
  spring: { type: "spring", stiffness: 300, damping: 30 } as Transition,
};

/** Reusable variants */
export const variants = {
  fadeUp: {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: t.base },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: t.base },
  },
  card: {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: t.fast },
  },
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.05 },
    },
  },
};

/** Helper for one-off motion props — e.g., <motion.div {...fadeUp()} /> */
export const fadeUp = (): MotionProps => ({
  variants: variants.fadeUp,
  initial: "hidden",
  animate: "show",
});
export const fadeIn = (): MotionProps => ({
  variants: variants.fadeIn,
  initial: "hidden",
  animate: "show",
});
