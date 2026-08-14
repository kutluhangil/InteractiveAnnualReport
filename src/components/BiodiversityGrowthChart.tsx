import React, { useState, useRef, useMemo } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'motion/react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  BIODIVERSITY_GROWTH_SERIES,
  METRIC_STREAMS,
  BiodiversityDataPoint,
} from '../data/biodiversityData';
import { useTheme } from '../context/ThemeContext';
import { Sparkles, TrendingUp, Layers, Compass } from 'lucide-react';
import { defaultViewport, cardScrollTransition } from '../utils/motionVariants';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
    dataKey: string;
    payload: BiodiversityDataPoint;
  }>;
  label?: string;
  isDark: boolean;
}

const CustomAreaTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  isDark,
}) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;

  return (
    <div
      className={`p-4 rounded-2xl border shadow-xl backdrop-blur-xl transition-all duration-200 min-w-[240px] max-w-xs ${
        isDark
          ? 'bg-[#182417]/95 border-white/15 text-[#F4EFE6]'
          : 'bg-white/95 border-[#243324]/15 text-[#243324]'
      }`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-[#243324]/10 dark:border-white/10 pb-2 mb-2.5">
        <span className="text-xs font-bold tracking-wider uppercase font-serif-display text-[#5C7E58] dark:text-[#A3C99F]">
          {label}
        </span>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#E6AF2E]/15 text-[#9A7010] dark:text-[#F3CA65] font-semibold">
          {data.quarter}
        </span>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-[#556950] dark:text-[#B3C4B0] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#3B6A38]" />
            Wildflower Canopy:
          </span>
          <span className="font-semibold">{data.wildflowerArea.toLocaleString()} m²</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#556950] dark:text-[#B3C4B0] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#D49B28]" />
            Active Hives:
          </span>
          <span className="font-semibold">{data.activeHives} hives</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#556950] dark:text-[#B3C4B0] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#38726C]" />
            Species Diversity:
          </span>
          <span className="font-semibold">{data.speciesDiversity.toFixed(1)} / site</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#556950] dark:text-[#B3C4B0] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#9B5B2E]" />
            Pollinator Visits:
          </span>
          <span className="font-semibold">{data.pollinatorVisitsThousand}k visits</span>
        </div>
      </div>

      {data.milestone && (
        <div className="mt-3 pt-2.5 border-t border-[#243324]/10 dark:border-white/10">
          <p className="text-[11px] leading-relaxed italic text-[#4A5D44] dark:text-[#D5E0D2]">
            🌱 {data.milestone}
          </p>
        </div>
      )}
    </div>
  );
};

export const BiodiversityGrowthChart: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();

  const [selectedMetricId, setSelectedMetricId] = useState<string>('all');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const [scrollProgressPercent, setScrollProgressPercent] = useState<number>(0);

  // Scroll Progress Tracking for Chart Reveal
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 85%', 'end 35%'],
  });

  // Calculate reveal width and scroll index
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const clamped = Math.max(0, Math.min(1, latest));
    setScrollProgressPercent(Math.round(clamped * 100));
  });

  const activeIndexFromScroll = useMemo(() => {
    const rawIdx = Math.floor((scrollProgressPercent / 100) * BIODIVERSITY_GROWTH_SERIES.length);
    return Math.min(BIODIVERSITY_GROWTH_SERIES.length - 1, Math.max(0, rawIdx));
  }, [scrollProgressPercent]);

  const activeDataPoint = useMemo(() => {
    const targetIdx = hoveredPointIndex !== null ? hoveredPointIndex : activeIndexFromScroll;
    return BIODIVERSITY_GROWTH_SERIES[targetIdx] || BIODIVERSITY_GROWTH_SERIES[BIODIVERSITY_GROWTH_SERIES.length - 1];
  }, [hoveredPointIndex, activeIndexFromScroll]);

  // Framer motion transforms for smooth visual reveals
  const revealClipWidth = useTransform(scrollYProgress, [0, 0.85], ['10%', '100%']);
  const meterScaleX = useTransform(scrollYProgress, [0, 1], [0.05, 1]);

  const selectedStream = METRIC_STREAMS.find((s) => s.id === selectedMetricId);

  // Colors adapted to theme
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(36, 51, 36, 0.08)';
  const tickColor = isDark ? '#A3B59E' : '#657351';

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={defaultViewport}
      transition={cardScrollTransition}
      className="w-full mt-14 pt-10 border-t border-[#243324]/12 dark:border-white/12 space-y-8"
    >
      {/* Header & Metric Controller */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3B6A38]/10 dark:bg-[#4A7D46]/25 text-[#3B6A38] dark:text-[#A8D3A5] text-xs font-semibold tracking-wide">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>2025 – 2026 Longitudinal Trajectory</span>
          </div>
          <h3 className="font-display text-2xl sm:text-4xl text-[#1F2B1D] dark:text-[#F4EFE6] font-light leading-tight">
            Ecological Corridor Expansion & Bloom Dynamics
          </h3>
          <p className="text-sm sm:text-base text-[#4A5D44] dark:text-[#CBD7C7] font-light leading-relaxed">
            Scroll down to watch London’s bio-canopy expand from early 2025 pilot installations to 52 interconnected rooftop wildflower sanctuaries in August 2026.
          </p>
        </div>

        {/* Live Scroll Progress Meter */}
        <div className="flex items-center gap-3 self-start lg:self-end px-4 py-2.5 rounded-2xl bg-white/80 dark:bg-[#162415]/90 border border-[#243324]/10 dark:border-white/10 shadow-xs">
          <Compass className="w-4 h-4 text-[#D49B28] animate-spin-slow" />
          <div className="text-xs">
            <div className="text-[#657351] dark:text-[#A3B59E] font-medium">Timeline Scrubber</div>
            <div className="font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">
              {activeDataPoint.month} <span className="text-[#D49B28]">({scrollProgressPercent}% revealed)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metric View Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-1">
        <button
          onClick={() => setSelectedMetricId('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all cursor-pointer select-none flex items-center gap-1.5 ${
            selectedMetricId === 'all'
              ? 'bg-[#243324] dark:bg-[#384E36] text-white shadow-xs font-semibold'
              : 'bg-white/60 dark:bg-[#1A2818]/60 text-[#4A5D44] dark:text-[#CBD7C7] hover:bg-white dark:hover:bg-[#20301E] border border-[#243324]/10 dark:border-white/10'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Ecological Layers</span>
        </button>

        {METRIC_STREAMS.map((stream) => {
          const isSelected = selectedMetricId === stream.id;
          return (
            <button
              key={stream.id}
              onClick={() => setSelectedMetricId(stream.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all cursor-pointer select-none flex items-center gap-1.5 ${
                isSelected
                  ? 'text-white shadow-xs font-semibold'
                  : 'bg-white/60 dark:bg-[#1A2818]/60 text-[#4A5D44] dark:text-[#CBD7C7] hover:bg-white dark:hover:bg-[#20301E] border border-[#243324]/10 dark:border-white/10'
              }`}
              style={{
                backgroundColor: isSelected ? stream.color : undefined,
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: isSelected ? '#FFFFFF' : stream.color }}
              />
              <span>{stream.shortLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Recharts Card */}
      <div className="relative p-5 sm:p-8 rounded-3xl sm:rounded-[2.5rem] bg-white dark:bg-[#182617] border border-[#243324]/10 dark:border-white/12 shadow-lg overflow-hidden transition-colors duration-400">
        {/* Animated Scroll Progress Header Bar */}
        <div className="w-full bg-[#243324]/5 dark:bg-white/5 h-1.5 rounded-full overflow-hidden mb-6">
          <motion.div
            style={{ scaleX: meterScaleX }}
            className="h-full bg-gradient-to-r from-[#3B6A38] via-[#D49B28] to-[#38726C] origin-left"
          />
        </div>

        {/* Milestone Callout Ribbon for Active Timeline Position */}
        <div className="mb-6 p-3.5 sm:p-4 rounded-2xl bg-[#F5F2EB]/90 dark:bg-[#1F2F1D]/90 border border-[#243324]/8 dark:border-white/8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#3B6A38]/15 text-[#3B6A38] dark:text-[#A8D3A5] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider font-semibold text-[#657351] dark:text-[#A3B59E]">
                {activeDataPoint.month} Milestone Focus
              </div>
              <div className="text-sm font-medium text-[#1F2B1D] dark:text-[#F4EFE6]">
                {activeDataPoint.milestone}
              </div>
            </div>
          </div>
          <div className="text-right sm:text-right shrink-0">
            <span className="text-xs text-[#657351] dark:text-[#A3B59E] block">Cumulative Hives</span>
            <span className="font-display text-lg sm:text-xl text-[#1F2B1D] dark:text-[#F4EFE6] font-semibold">
              {activeDataPoint.activeHives} hives across {Math.round(activeDataPoint.wildflowerArea).toLocaleString()} m²
            </span>
          </div>
        </div>

        {/* Area Chart Container with Responsive Motion Reveal */}
        <motion.div
          style={{ clipPath: `polygon(0 0, ${scrollProgressPercent > 5 ? scrollProgressPercent : 100}% 0, ${scrollProgressPercent > 5 ? scrollProgressPercent : 100}% 100%, 0 100%)` }}
          className="h-[300px] sm:h-[380px] w-full relative transition-all duration-300"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={BIODIVERSITY_GROWTH_SERIES}
              margin={{ top: 15, right: 15, left: -10, bottom: 0 }}
              onMouseMove={(e) => {
                if (e && e.activeTooltipIndex !== undefined) {
                  setHoveredPointIndex(e.activeTooltipIndex);
                }
              }}
              onMouseLeave={() => setHoveredPointIndex(null)}
            >
              <defs>
                {/* Botanical Emerald Gradient */}
                <linearGradient id="grad-wildflower" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B6A38" stopOpacity={isDark ? 0.7 : 0.55} />
                  <stop offset="95%" stopColor="#3B6A38" stopOpacity={0.0} />
                </linearGradient>

                {/* Honey Gold Gradient */}
                <linearGradient id="grad-hives" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D49B28" stopOpacity={isDark ? 0.75 : 0.6} />
                  <stop offset="95%" stopColor="#D49B28" stopOpacity={0.0} />
                </linearGradient>

                {/* Riverbank Teal Gradient */}
                <linearGradient id="grad-diversity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38726C" stopOpacity={isDark ? 0.7 : 0.55} />
                  <stop offset="95%" stopColor="#38726C" stopOpacity={0.0} />
                </linearGradient>

                {/* Warm Amber Pollinator Gradient */}
                <linearGradient id="grad-pollinators" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9B5B2E" stopOpacity={isDark ? 0.65 : 0.5} />
                  <stop offset="95%" stopColor="#9B5B2E" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />

              <XAxis
                dataKey="month"
                stroke={tickColor}
                tick={{ fontSize: 11, fill: tickColor }}
                tickLine={false}
                axisLine={{ stroke: gridColor }}
                dy={10}
              />

              <YAxis
                stroke={tickColor}
                tick={{ fontSize: 11, fill: tickColor }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => {
                  if (selectedMetricId === 'diversity') return `${val} spp`;
                  if (selectedMetricId === 'hives') return `${val}`;
                  if (selectedMetricId === 'pollinators') return `${val}k`;
                  return `${(val / 1000).toFixed(0)}k`;
                }}
              />

              <Tooltip
                content={<CustomAreaTooltip isDark={isDark} />}
                cursor={{ stroke: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(36,51,36,0.2)', strokeWidth: 1.5, strokeDasharray: '4 4' }}
              />

              {/* Multi-Layer Stack or Selected Stream */}
              {selectedMetricId === 'all' ? (
                <>
                  <Area
                    type="monotone"
                    dataKey="wildflowerArea"
                    name="Wildflower Area (m²)"
                    stroke="#3B6A38"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#grad-wildflower)"
                    isAnimationActive={true}
                    animationDuration={1200}
                  />
                  <Area
                    type="monotone"
                    dataKey="pollinatorVisitsThousand"
                    name="Visits (k)"
                    stroke="#9B5B2E"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#grad-pollinators)"
                    isAnimationActive={true}
                    animationDuration={1200}
                  />
                </>
              ) : selectedStream ? (
                <Area
                  type="monotone"
                  dataKey={selectedStream.dataKey as string}
                  name={selectedStream.label}
                  stroke={selectedStream.color}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill={`url(#${selectedStream.gradientId})`}
                  isAnimationActive={true}
                  animationDuration={1000}
                />
              ) : null}
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Bottom Timeline Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 mt-6 border-t border-[#243324]/10 dark:border-white/10">
          <div className="p-3 rounded-xl bg-[#F5F2EB]/60 dark:bg-[#1D2B1C]/60">
            <span className="text-[11px] text-[#657351] dark:text-[#A3B59E] block">Canopy Coverage</span>
            <span className="font-display text-lg sm:text-xl font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">
              {activeDataPoint.wildflowerArea.toLocaleString()} m²
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#F5F2EB]/60 dark:bg-[#1D2B1C]/60">
            <span className="text-[11px] text-[#657351] dark:text-[#A3B59E] block">Active Colonies</span>
            <span className="font-display text-lg sm:text-xl font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">
              {activeDataPoint.activeHives} Hives
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#F5F2EB]/60 dark:bg-[#1D2B1C]/60">
            <span className="text-[11px] text-[#657351] dark:text-[#A3B59E] block">Pollinator Index</span>
            <span className="font-display text-lg sm:text-xl font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">
              {activeDataPoint.speciesDiversity.toFixed(1)} Spp / Site
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#F5F2EB]/60 dark:bg-[#1D2B1C]/60">
            <span className="text-[11px] text-[#657351] dark:text-[#A3B59E] block">Foraging Events</span>
            <span className="font-display text-lg sm:text-xl font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">
              {activeDataPoint.pollinatorVisitsThousand}k Visits
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
