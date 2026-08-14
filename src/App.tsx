/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { OverviewSection } from './components/OverviewSection';
import { BoroughCorridorSection } from './components/BoroughCorridorSection';
import { StormwaterClimateSection } from './components/StormwaterClimateSection';
import { SectorImpactSection } from './components/SectorImpactSection';
import { FoodSharingSection } from './components/FoodSharingSection';
import { EducationSection } from './components/EducationSection';
import { RoadmapGratitudeSection } from './components/RoadmapGratitudeSection';
import { SocialShareWidget } from './components/SocialShareWidget';
import { BackToTopButton } from './components/BackToTopButton';

function MainContent() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001,
  });

  const printDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="relative min-h-screen bg-[#FBF9F5] dark:bg-[#131D12] text-[#243324] dark:text-[#F4EFE6] font-sans antialiased selection:bg-[#E8DCC4] dark:selection:bg-[#384F35] selection:text-[#1F2B1D] dark:selection:text-[#F4EFE6] transition-colors duration-400">
      {/* Top Floating Navigation with Sun/Moon Toggle */}
      <Navbar />

      {/* Print-Only Header Banner for PDF / Physical Printing */}
      <div
        id="print-document-header"
        className="print-include w-full pt-4 pb-6 mb-8 border-b-2 border-[#1F2B1D]"
      >
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display tracking-tight text-[#1F2B1D]">
              The Urban Hive Project - 2026 Annual Report
            </h1>
            <p className="text-xs text-[#4A6D47] font-medium tracking-wide uppercase mt-1">
              Skyline Rewilding & Urban Pollinator Corridors • London, UK • Charity No. 1198420
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#657351] block">
              Document Date
            </span>
            <span className="text-sm font-medium text-[#1F2B1D]">
              {printDate}
            </span>
          </div>
        </div>
      </div>

      {/* Top Reading Progress Bar */}
      <motion.div
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 h-1 bg-[#3B4D36] dark:bg-[#4A6D47] origin-left z-50 pointer-events-none transition-colors duration-300"
      />

      {/* Main Report Flow */}
      <main id="report-content" className="w-full overflow-x-hidden">
        <HeroSection />
        <OverviewSection />
        <BoroughCorridorSection />
        <StormwaterClimateSection />
        <SectorImpactSection />
        <FoodSharingSection />
        <EducationSection />
        <RoadmapGratitudeSection />
      </main>

      {/* Persistent Floating Social Sharing Widget */}
      <SocialShareWidget />

      {/* Floating Back to Top Button */}
      <BackToTopButton />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainContent />
    </ThemeProvider>
  );
}


