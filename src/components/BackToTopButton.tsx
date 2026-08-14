import React, { useState } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'motion/react';
import { ArrowUp } from 'lucide-react';

export const BackToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const heroThreshold = typeof window !== 'undefined' ? window.innerHeight * 0.65 : 600;
    if (latest > heroThreshold) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  });

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <aside
      aria-label="Scroll back to top"
      className="fixed bottom-6 left-6 z-40 print:hidden"
    >
      <AnimatePresence>
        {isVisible && (
          <motion.button
            id="back-to-top-btn"
            type="button"
            onClick={scrollToTop}
            aria-label="Scroll back to the top of the report"
            initial={{ opacity: 0, scale: 0.5, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 24, transition: { duration: 0.2 } }}
            transition={{
              type: 'spring',
              stiffness: 280,
              damping: 22,
              mass: 0.8,
            }}
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.92 }}
            className="group flex items-center gap-2 px-3.5 py-3 sm:px-4 sm:py-3 rounded-full bg-[#FBF9F5]/90 dark:bg-[#1A2819]/90 hover:bg-[#F5F2EB] dark:hover:bg-[#233522] text-[#243324] dark:text-[#F4EFE6] border border-[#243324]/15 dark:border-white/15 shadow-lg backdrop-blur-md transition-colors duration-200 cursor-pointer"
          >
            <div className="p-1 rounded-full bg-[#243324]/10 dark:bg-white/10 group-hover:bg-[#243324] dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-[#1A2819] transition-colors duration-200">
              <ArrowUp className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 duration-200" />
            </div>
            <span className="text-xs font-medium tracking-wide font-display hidden sm:inline-block">
              Back to Top
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </aside>
  );
};
