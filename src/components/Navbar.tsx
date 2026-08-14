import React, { useState, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'motion/react';
import { Sun, Moon, Menu, X, Compass, FileDown, Loader2, CheckCircle2, Clock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { exportReportToPdf } from '../utils/pdfExport';
import { computeContainerReadingTime, ReadingTimeStats } from '../utils/readingTime';

interface NavSection {
  id: string;
  label: string;
  shortLabel?: string;
}

const NAV_SECTIONS: NavSection[] = [
  { id: 'overview-section', label: 'Overview', shortLabel: 'Overview' },
  { id: 'corridor-section', label: 'Corridors', shortLabel: 'Corridors' },
  { id: 'climate-section', label: 'Climate', shortLabel: 'Climate' },
  { id: 'sectors-section', label: 'Sectors', shortLabel: 'Sectors' },
  { id: 'food-sharing-section', label: 'Food Equity', shortLabel: 'Equity' },
  { id: 'education-section', label: 'Education', shortLabel: 'Education' },
  { id: 'roadmap-section', label: '2027 Vision', shortLabel: 'Vision' },
];

export const Navbar: React.FC = () => {
  const { scrollY } = useScroll();
  const { isDark, toggleTheme } = useTheme();
  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('hero-section');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [pdfStatus, setPdfStatus] = useState<string>('');
  const [pdfSuccess, setPdfSuccess] = useState(false);
  const [readingStats, setReadingStats] = useState<ReadingTimeStats>({
    wordCount: 1950,
    minutes: 10,
    formattedTime: '10 min read',
    wordsPerMinute: 200,
  });

  // Calculate dynamic reading time based on total report word count
  useEffect(() => {
    const updateStats = () => {
      const stats = computeContainerReadingTime('report-content');
      if (stats.wordCount > 0) {
        setReadingStats(stats);
      }
    };

    // Calculate after initial paint and DOM rendering
    const timer = setTimeout(updateStats, 500);

    // Re-verify if content updates
    window.addEventListener('resize', updateStats, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateStats);
    };
  }, []);

  // Monitor scroll for hero exit transition
  useMotionValueEvent(scrollY, 'change', (latest) => {
    const threshold = typeof window !== 'undefined' ? window.innerHeight * 0.5 : 450;
    setIsScrolledPastHero(latest >= threshold);
  });

  // Scroll Spy Implementation
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Bottom of page detection (activates the final section)
      if (scrollPosition + windowHeight >= documentHeight - 80) {
        setActiveSection('roadmap-section');
        return;
      }

      // Hero section active when near top
      if (scrollPosition < windowHeight * 0.4) {
        setActiveSection('hero-section');
        return;
      }

      // Check section bounding rects to determine current active view
      const triggerOffset = 180;
      let currentActive = NAV_SECTIONS[0].id;

      for (const section of NAV_SECTIONS) {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= triggerOffset) {
            currentActive = section.id;
          }
        }
      }

      setActiveSection(currentActive);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    if (sectionId === 'hero-section') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -30;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    }
  };

  const handleDownloadPdf = async () => {
    if (isPdfGenerating) return;
    setIsPdfGenerating(true);
    setPdfSuccess(false);
    setPdfStatus('Initializing PDF...');

    try {
      await exportReportToPdf({
        filename: 'London_Urban_Apiary_Impact_Report_2026.pdf',
        elementId: 'report-content',
        onProgress: (status) => setPdfStatus(status),
      });

      setPdfSuccess(true);
      setPdfStatus('Downloaded!');
      setTimeout(() => {
        setPdfSuccess(false);
        setPdfStatus('');
        setIsPdfGenerating(false);
      }, 3500);
    } catch (err) {
      console.warn('html2pdf generation encountered an issue, offering print fallback:', err);
      setPdfStatus('Opening print dialogue...');
      // Graceful fallback
      setTimeout(() => {
        window.print();
        setIsPdfGenerating(false);
        setPdfStatus('');
      }, 600);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-3 sm:py-4 px-3 sm:px-6 lg:px-10 transition-all duration-300 pointer-events-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Project Brand / Title & Reading Time */}
        <div className="pointer-events-auto flex items-center gap-2 sm:gap-2.5">
          <button
            onClick={() => scrollToSection('hero-section')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md transition-all duration-300 cursor-pointer ${
              isScrolledPastHero
                ? 'bg-white/80 dark:bg-[#162315]/85 border border-[#243324]/10 dark:border-white/10 text-[#1F2B1D] dark:text-[#F4EFE6] shadow-xs hover:bg-white dark:hover:bg-[#1A2C19]'
                : 'bg-black/25 hover:bg-black/40 border border-white/20 text-white shadow-xs'
            }`}
            aria-label="Scroll to top"
          >
            <Compass className="w-3.5 h-3.5 text-[#E6AF2E] shrink-0" />
            <span className="text-xs sm:text-sm font-semibold tracking-tight whitespace-nowrap font-serif-display">
              Urban Hive
            </span>
          </button>

          {/* Reading Time Pill Badge */}
          <div
            id="navbar-reading-time"
            title={`Estimated reading time: ${readingStats.formattedTime} (~${readingStats.wordCount.toLocaleString()} words at 200 words/min)`}
            className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border transition-all duration-300 text-xs font-medium backdrop-blur-md select-none ${
              isScrolledPastHero
                ? 'bg-white/80 dark:bg-[#162315]/85 border-[#243324]/10 dark:border-white/10 text-[#4A5D44] dark:text-[#CBD7C7]'
                : 'bg-black/25 border-white/20 text-white/90 shadow-xs'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-[#E6AF2E] shrink-0" />
            <span className="font-medium tracking-tight">{readingStats.formattedTime}</span>
            <span className="text-[10px] opacity-60 font-mono hidden xl:inline">
              ({readingStats.wordCount.toLocaleString()} words)
            </span>
          </div>
        </div>

        {/* Center: Desktop Scroll Spy Navigation Bar */}
        <nav
          role="navigation"
          aria-label="Report Sections Navigation"
          className="pointer-events-auto hidden md:flex items-center"
        >
          <div
            className={`flex items-center p-1 rounded-full backdrop-blur-md transition-all duration-300 ${
              isScrolledPastHero
                ? 'bg-[#FAF8F5]/90 dark:bg-[#142013]/90 border border-[#243324]/12 dark:border-white/12 shadow-sm'
                : 'bg-black/30 border border-white/20 text-white shadow-md'
            }`}
          >
            {NAV_SECTIONS.map((section) => {
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  id={`nav-link-${section.id}`}
                  onClick={() => scrollToSection(section.id)}
                  aria-current={isActive ? 'true' : undefined}
                  className={`relative px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide transition-colors duration-200 cursor-pointer select-none whitespace-nowrap ${
                    isActive
                      ? isScrolledPastHero
                        ? 'text-white dark:text-[#F4EFE6]'
                        : 'text-white'
                      : isScrolledPastHero
                        ? 'text-[#4A5D44] dark:text-[#CBD7C7] hover:text-[#1F2B1D] dark:hover:text-white'
                        : 'text-white/70 hover:text-white'
                  }`}
                >
                  {/* Fluid spring animated pill indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="active-scrollspy-pill"
                      className={`absolute inset-0 rounded-full z-0 shadow-xs ${
                        isScrolledPastHero
                          ? 'bg-[#243324] dark:bg-[#384E36]'
                          : 'bg-white/25 border border-white/30 backdrop-blur-xs'
                      }`}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{section.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Right Controls: PDF Download, Sun/Moon Theme Toggle, & Mobile Menu Toggle */}
        <div className="pointer-events-auto flex items-center gap-2 sm:gap-3">
          {/* Download PDF Report Button */}
          <button
            id="download-pdf-btn"
            type="button"
            onClick={handleDownloadPdf}
            disabled={isPdfGenerating}
            aria-label="Download 2026 Impact Report as PDF"
            title="Download full report as PDF for offline reading"
            className={`group relative flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-full border transition-all duration-200 cursor-pointer text-xs font-medium focus:outline-none focus:ring-2 select-none ${
              isPdfGenerating
                ? 'bg-amber-600/90 text-white border-amber-600 cursor-wait'
                : pdfSuccess
                ? 'bg-emerald-700 text-white border-emerald-600'
                : isScrolledPastHero
                ? 'bg-white/90 dark:bg-[#162315]/90 border-[#243324]/15 dark:border-white/15 text-[#243324] dark:text-[#F4EFE6] shadow-xs hover:bg-[#243324] hover:text-white dark:hover:bg-[#384E36] focus:ring-[#243324]/30'
                : 'border-white/30 bg-black/30 hover:bg-white/20 text-white focus:ring-white/50 backdrop-blur-md'
            }`}
          >
            {isPdfGenerating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0 text-amber-200" />
            ) : pdfSuccess ? (
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-200" />
            ) : (
              <FileDown className="w-3.5 h-3.5 shrink-0 text-[#E6AF2E] group-hover:scale-110 transition-transform" />
            )}
            <span className="hidden sm:inline whitespace-nowrap">
              {isPdfGenerating ? (pdfStatus || 'Generating PDF...') : pdfSuccess ? 'PDF Ready' : 'Download PDF'}
            </span>
            <span className="sm:hidden font-semibold">PDF</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            id="theme-toggle-btn"
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className={`p-2 sm:p-2.5 rounded-full border transition-all duration-200 cursor-pointer flex items-center justify-center focus:outline-none focus:ring-2 ${
              isScrolledPastHero
                ? 'bg-white/80 dark:bg-[#162315]/85 border-[#243324]/15 dark:border-white/15 text-[#243324] dark:text-[#F4EFE6] shadow-xs hover:bg-white dark:hover:bg-[#1E2E1D] focus:ring-[#243324]/30'
                : 'border-white/30 bg-black/25 hover:bg-black/40 text-white focus:ring-white/50'
            }`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isDark ? (
                <motion.div
                  key="sun-icon"
                  initial={{ rotate: -90, scale: 0.7, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: 90, scale: 0.7, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-center"
                >
                  <Sun className="w-4 h-4" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon-icon"
                  initial={{ rotate: 90, scale: 0.7, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: -90, scale: 0.7, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-center"
                >
                  <Moon className="w-4 h-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          {/* Mobile Menu Button */}
          <button
            id="mobile-nav-toggle"
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle section navigation"
            className={`md:hidden p-2 sm:p-2.5 rounded-full border transition-all duration-200 cursor-pointer flex items-center justify-center ${
              isScrolledPastHero
                ? 'bg-white/80 dark:bg-[#162315]/85 border-[#243324]/15 dark:border-white/15 text-[#243324] dark:text-[#F4EFE6] shadow-xs hover:bg-white dark:hover:bg-[#1E2E1D]'
                : 'border-white/30 bg-black/25 hover:bg-black/40 text-white'
            }`}
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="md:hidden pointer-events-auto mt-2 max-w-sm mx-auto w-full p-2.5 rounded-2xl bg-white/95 dark:bg-[#182617]/95 backdrop-blur-xl border border-[#243324]/15 dark:border-white/15 shadow-xl transition-colors"
          >
            <div className="px-3 py-1.5 mb-1 flex items-center justify-between border-b border-[#243324]/10 dark:border-white/10">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#657351] dark:text-[#A3B59E]">
                Report Navigation
              </span>
              <div className="flex items-center gap-1 text-[11px] text-[#4A6D47] dark:text-[#A3B59E] font-medium">
                <Clock className="w-3 h-3 text-[#E6AF2E]" />
                <span>{readingStats.formattedTime}</span>
              </div>
            </div>

            {/* Reading Time detail banner in Mobile Menu */}
            <div className="px-3 py-1.5 mb-1 bg-[#F5F2EB] dark:bg-[#1E2F1C] rounded-xl flex items-center justify-between text-[11px] text-[#243324] dark:text-[#F4EFE6]">
              <span className="text-[#657351] dark:text-[#CBD7C7]">Length: ~{readingStats.wordCount.toLocaleString()} words</span>
              <span className="font-medium text-[#4A6D47] dark:text-[#88A884]">Avg 200 wpm</span>
            </div>

            {/* Mobile PDF Download Button in Menu */}
            <div className="p-1">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleDownloadPdf();
                }}
                disabled={isPdfGenerating}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#243324] dark:bg-[#344732] text-white text-xs font-semibold shadow-xs cursor-pointer active:scale-98 transition-transform"
              >
                <FileDown className="w-3.5 h-3.5 text-[#E6AF2E]" />
                <span>{isPdfGenerating ? 'Generating PDF...' : 'Download Full PDF Report'}</span>
              </button>
            </div>

            <div className="flex flex-col gap-1 py-1 mt-1 border-t border-[#243324]/10 dark:border-white/10">
              {NAV_SECTIONS.map((section) => {
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-left transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#243324] dark:bg-[#384E36] text-white dark:text-[#F4EFE6] font-semibold'
                        : 'text-[#3B4D36] dark:text-[#CBD7C7] hover:bg-[#F5F2EB] dark:hover:bg-[#223321]'
                    }`}
                  >
                    <span>{section.label}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E6AF2E]" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

