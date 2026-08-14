import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import {
  LONDON_POLLEN_CALENDAR_2026,
  MonthlyPollenData,
  POLLINATOR_SPECIES_FILTERS,
} from '../data/pollenCalendarData';
import { useTheme } from '../context/ThemeContext';
import {
  Calendar,
  Clock,
  Thermometer,
  Flower2,
  Bug,
  Sparkles,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import { defaultViewport, cardScrollTransition } from '../utils/motionVariants';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
    dataKey: string;
    payload: MonthlyPollenData;
  }>;
  label?: string;
  isDark: boolean;
}

const CustomPollenTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  isDark,
}) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;

  return (
    <div
      className={`p-4 rounded-2xl border shadow-xl backdrop-blur-xl transition-all duration-200 min-w-[260px] max-w-xs ${
        isDark
          ? 'bg-[#182417]/95 border-white/15 text-[#F4EFE6]'
          : 'bg-white/95 border-[#243324]/15 text-[#243324]'
      }`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-[#243324]/10 dark:border-white/10 pb-2 mb-2.5">
        <div>
          <span className="text-xs font-bold tracking-wider uppercase font-serif-display text-[#4A6D47] dark:text-[#A3C99F] block">
            {data.month} 2026
          </span>
          <span className="text-[11px] opacity-70">{data.season}</span>
        </div>
        <span className="text-[11px] px-2.5 py-1 rounded-full bg-[#E6AF2E]/15 text-[#9A7010] dark:text-[#F3CA65] font-semibold flex items-center gap-1">
          <Thermometer className="w-3 h-3" />
          {data.avgTempC}°C
        </span>
      </div>

      <div className="space-y-1.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-[#556950] dark:text-[#B3C4B0] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#D49B28]" />
            Honeybees:
          </span>
          <span className="font-semibold">{data.honeybees}% activity</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#556950] dark:text-[#B3C4B0] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#C06C47]" />
            Bumblebees:
          </span>
          <span className="font-semibold">{data.bumblebees}% activity</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#556950] dark:text-[#B3C4B0] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#38726C]" />
            Solitary Bees:
          </span>
          <span className="font-semibold">{data.solitaryBees}% activity</span>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-[#243324]/10 dark:border-white/10">
          <span className="text-[#4A6D47] dark:text-[#A3C99F] flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-[#6A994E]" />
            Nectar & Pollen Flow:
          </span>
          <span className="font-bold text-[#243324] dark:text-[#F4EFE6]">{data.floralNectarYield}% yield</span>
        </div>
      </div>

      <div className="mt-2.5 pt-2 border-t border-[#243324]/10 dark:border-white/10 flex items-center justify-between text-[11px] text-[#657351] dark:text-[#A3B59E]">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-[#E6AF2E]" /> {data.avgForageHours} hrs/day
        </span>
        <span className="italic font-medium">Click to inspect</span>
      </div>
    </div>
  );
};

export const LondonPollenCalendar: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(5); // Default to June (peak bloom)
  const [selectedCohort, setSelectedCohort] = useState<string>('all');
  const [seasonFilter, setSeasonFilter] = useState<string>('all');

  const selectedMonth = LONDON_POLLEN_CALENDAR_2026[selectedMonthIndex];

  // Filtered dataset according to seasonal button
  const displayData = useMemo(() => {
    if (seasonFilter === 'all') return LONDON_POLLEN_CALENDAR_2026;
    return LONDON_POLLEN_CALENDAR_2026.filter((d) => d.season === seasonFilter);
  }, [seasonFilter]);

  return (
    <motion.div
      id="london-pollen-calendar"
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={defaultViewport}
      transition={cardScrollTransition}
      className="w-full bg-[#F5F2EB]/90 dark:bg-[#182417]/90 rounded-[2.5rem] p-6 sm:p-8 lg:p-10 border border-[#243324]/10 dark:border-white/10 backdrop-blur-md shadow-lg"
    >
      {/* Header section with badge & title */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[#243324]/10 dark:border-white/10">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6AF2E]/15 text-[#9A7010] dark:text-[#F3CA65] text-xs font-semibold uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5" />
              Phenology & Nectar Flow 2026
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#3B6A38]/10 dark:bg-[#3B6A38]/30 text-[#3B6A38] dark:text-[#A3C99F] text-xs font-medium">
              <Sparkles className="w-3 h-3" />
              Rooftop Meadow Bloom
            </span>
          </div>

          <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-light text-[#1F2B1D] dark:text-[#F4EFE6] tracking-tight">
            London Pollen & Foraging Calendar
          </h3>
          <p className="text-sm sm:text-base text-[#4A5D44] dark:text-[#CBD7C7] max-w-2xl font-light">
            Interactive 12-month model tracking pollinator foraging flight intensity, rooftop flora bloom
            cycles, and nectar secretion velocity across London’s microclimate zones.
          </p>
        </div>

        {/* Season Quick Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#EAE5D9] dark:bg-[#141F13] p-1.5 rounded-2xl border border-[#243324]/5 dark:border-white/5">
          <button
            onClick={() => setSeasonFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all duration-200 cursor-pointer ${
              seasonFilter === 'all'
                ? 'bg-white dark:bg-[#243324] text-[#1F2B1D] dark:text-[#F4EFE6] shadow-xs'
                : 'text-[#556950] dark:text-[#9FB19D] hover:text-[#1F2B1D] dark:hover:text-white'
            }`}
          >
            All Year (12M)
          </button>
          <button
            onClick={() => setSeasonFilter('Spring Flush')}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all duration-200 cursor-pointer ${
              seasonFilter === 'Spring Flush'
                ? 'bg-[#3B6A38] text-white shadow-xs'
                : 'text-[#556950] dark:text-[#9FB19D] hover:text-[#1F2B1D] dark:hover:text-white'
            }`}
          >
            Spring Flush (Mar–May)
          </button>
          <button
            onClick={() => setSeasonFilter('Summer Zenith')}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all duration-200 cursor-pointer ${
              seasonFilter === 'Summer Zenith'
                ? 'bg-[#D49B28] text-white shadow-xs'
                : 'text-[#556950] dark:text-[#9FB19D] hover:text-[#1F2B1D] dark:hover:text-white'
            }`}
          >
            Summer Zenith (Jun–Aug)
          </button>
          <button
            onClick={() => setSeasonFilter('Autumn Sustenance')}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all duration-200 cursor-pointer ${
              seasonFilter === 'Autumn Sustenance'
                ? 'bg-[#A35032] text-white shadow-xs'
                : 'text-[#556950] dark:text-[#9FB19D] hover:text-[#1F2B1D] dark:hover:text-white'
            }`}
          >
            Autumn Ivy (Sep–Oct)
          </button>
          <button
            onClick={() => setSeasonFilter('Winter Cluster')}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all duration-200 cursor-pointer ${
              seasonFilter === 'Winter Cluster'
                ? 'bg-[#38726C] text-white shadow-xs'
                : 'text-[#556950] dark:text-[#9FB19D] hover:text-[#1F2B1D] dark:hover:text-white'
            }`}
          >
            Winter Cluster (Nov–Feb)
          </button>
        </div>
      </div>

      {/* Cohort Selectors / Legend Controls */}
      <div className="py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs text-[#556950] dark:text-[#A3B59E] font-medium">
          <Layers className="w-4 h-4 text-[#D49B28]" />
          <span>Active View Cohort:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {POLLINATOR_SPECIES_FILTERS.map((cohort) => {
            const isSelected = selectedCohort === cohort.id;
            return (
              <button
                key={cohort.id}
                onClick={() => setSelectedCohort(cohort.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border cursor-pointer ${
                  isSelected
                    ? 'bg-white dark:bg-[#243324] border-[#243324]/20 dark:border-white/20 text-[#1F2B1D] dark:text-[#F4EFE6] shadow-xs'
                    : 'bg-transparent border-[#243324]/10 dark:border-white/10 text-[#556950] dark:text-[#A3B59E] hover:border-[#243324]/30'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: cohort.color }}
                />
                <span>{cohort.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Recharts Visualizer */}
      <div className="relative pt-4 pb-2">
        {/* Peak Flow Reference Banner */}
        <div className="flex items-center justify-between text-xs text-[#556950] dark:text-[#A3B59E] mb-2 px-2">
          <span className="flex items-center gap-1 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-xs bg-[#E6AF2E]/40" /> May–July: Primary Lime & Meadow Flow
          </span>
          <span className="flex items-center gap-1 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-xs bg-[#88A884]/30" /> Sept–Oct: Hedera Ivy Pollen Buffer
          </span>
        </div>

        <div className="w-full h-72 sm:h-80 lg:h-88">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={displayData}
              margin={{ top: 15, right: 15, left: -20, bottom: 5 }}
              onClick={(e: unknown) => {
                const event = e as { activePayload?: Array<{ payload: MonthlyPollenData }> } | null;
                if (event?.activePayload && event.activePayload.length > 0) {
                  const clickedMonth = event.activePayload[0].payload;
                  const idx = LONDON_POLLEN_CALENDAR_2026.findIndex(
                    (m) => m.month === clickedMonth.month
                  );
                  if (idx !== -1) setSelectedMonthIndex(idx);
                }
              }}
            >
              <defs>
                <linearGradient id="pollenNectarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6A994E" stopOpacity={isDark ? 0.45 : 0.35} />
                  <stop offset="95%" stopColor="#6A994E" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="honeybeeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D49B28" stopOpacity={isDark ? 0.6 : 0.45} />
                  <stop offset="95%" stopColor="#D49B28" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="bumblebeeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C06C47" stopOpacity={isDark ? 0.5 : 0.35} />
                  <stop offset="95%" stopColor="#C06C47" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="solitaryGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38726C" stopOpacity={isDark ? 0.5 : 0.35} />
                  <stop offset="95%" stopColor="#38726C" stopOpacity={0.05} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(36,51,36,0.08)'}
              />

              {/* Reference Lines for Peak Seasons */}
              <ReferenceLine
                x="Jun"
                stroke="#E6AF2E"
                strokeDasharray="4 4"
                strokeWidth={1.5}
              />
              <ReferenceLine
                x="Sep"
                stroke="#6A994E"
                strokeDasharray="4 4"
                strokeWidth={1.5}
              />

              <XAxis
                dataKey="monthShort"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: isDark ? '#A3B59E' : '#556950',
                  fontSize: 12,
                  fontFamily: 'inherit',
                  fontWeight: 500,
                }}
              />

              <YAxis
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: isDark ? '#A3B59E' : '#556950',
                  fontSize: 11,
                  fontFamily: 'inherit',
                }}
                tickFormatter={(val) => `${val}%`}
              />

              <Tooltip content={<CustomPollenTooltip isDark={isDark} />} />

              {/* Render dynamic layers based on selected cohort */}
              {selectedCohort === 'all' && (
                <>
                  {/* Floral Nectar Yield Area */}
                  <Area
                    type="monotone"
                    dataKey="floralNectarYield"
                    name="Floral Nectar & Pollen Yield"
                    stroke="#6A994E"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#pollenNectarGrad)"
                  />

                  {/* Honeybee Activity Bars */}
                  <Bar
                    dataKey="honeybees"
                    name="Honeybee Activity"
                    fill="#D49B28"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={22}
                    opacity={isDark ? 0.85 : 0.75}
                  />

                  {/* Bumblebee Trendline */}
                  <Line
                    type="monotone"
                    dataKey="bumblebees"
                    name="Bumblebees"
                    stroke="#C06C47"
                    strokeWidth={2.2}
                    dot={{ r: 3.5, fill: '#C06C47', strokeWidth: 1.5, stroke: isDark ? '#182417' : '#FFFFFF' }}
                    activeDot={{ r: 6, fill: '#C06C47' }}
                  />

                  {/* Solitary Bees Trendline */}
                  <Line
                    type="monotone"
                    dataKey="solitaryBees"
                    name="Solitary & Mason Bees"
                    stroke="#38726C"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 3, fill: '#38726C', strokeWidth: 1.5, stroke: isDark ? '#182417' : '#FFFFFF' }}
                  />
                </>
              )}

              {selectedCohort === 'honeybees' && (
                <Area
                  type="monotone"
                  dataKey="honeybees"
                  name="Honeybees (Apis mellifera)"
                  stroke="#D49B28"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#honeybeeGrad)"
                />
              )}

              {selectedCohort === 'bumblebees' && (
                <Area
                  type="monotone"
                  dataKey="bumblebees"
                  name="Bumblebees (Bombus spp.)"
                  stroke="#C06C47"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#bumblebeeGrad)"
                />
              )}

              {selectedCohort === 'solitaryBees' && (
                <Area
                  type="monotone"
                  dataKey="solitaryBees"
                  name="Solitary & Mason Bees"
                  stroke="#38726C"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#solitaryGrad)"
                />
              )}

              {selectedCohort === 'floralNectarYield' && (
                <Area
                  type="monotone"
                  dataKey="floralNectarYield"
                  name="Rooftop Floral & Nectar Flow"
                  stroke="#6A994E"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#pollenNectarGrad)"
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Month Scrubber / Selector Pills */}
      <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 pt-2 pb-6 border-b border-[#243324]/10 dark:border-white/10">
        {LONDON_POLLEN_CALENDAR_2026.map((m, index) => {
          const isSelected = selectedMonthIndex === index;
          return (
            <button
              key={m.monthShort}
              onClick={() => setSelectedMonthIndex(index)}
              className={`p-2 rounded-xl text-center transition-all duration-200 cursor-pointer flex flex-col items-center gap-1 ${
                isSelected
                  ? 'bg-[#1F2B1D] dark:bg-[#F4EFE6] text-[#F4EFE6] dark:text-[#1F2B1D] shadow-md scale-105 z-10'
                  : 'bg-white/60 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-[#243324] dark:text-[#F4EFE6]/80'
              }`}
            >
              <span className="text-[11px] font-bold uppercase tracking-wider">{m.monthShort}</span>
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor:
                    m.floralNectarYield > 70
                      ? '#D49B28'
                      : m.floralNectarYield > 30
                      ? '#6A994E'
                      : '#38726C',
                }}
              />
              <span className="text-[10px] font-mono opacity-80">{m.honeybees}%</span>
            </button>
          );
        })}
      </div>

      {/* Interactive Month Detail Inspector Panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedMonth.month}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25 }}
          className="pt-6 grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          {/* Left Column: Month Overview & Climate Indices */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-2xl bg-white/80 dark:bg-white/5 border border-[#243324]/10 dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#657351] dark:text-[#A3B59E]">
                    Month In Focus
                  </span>
                  <h4 className="text-2xl font-display font-medium text-[#1F2B1D] dark:text-[#F4EFE6]">
                    {selectedMonth.month} 2026
                  </h4>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-[#3B6A38]/15 text-[#3B6A38] dark:text-[#A3C99F] font-semibold">
                  {selectedMonth.season}
                </span>
              </div>

              {/* Climate & Foraging Stats */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#243324]/10 dark:border-white/10">
                <div className="p-2.5 rounded-xl bg-[#F5F2EB] dark:bg-[#162315] space-y-0.5">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#657351] dark:text-[#A3B59E]">
                    <Clock className="w-3.5 h-3.5 text-[#E6AF2E]" />
                    <span>Flight Hours</span>
                  </div>
                  <p className="text-base font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">
                    {selectedMonth.avgForageHours} hrs/day
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-[#F5F2EB] dark:bg-[#162315] space-y-0.5">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#657351] dark:text-[#A3B59E]">
                    <Thermometer className="w-3.5 h-3.5 text-[#D46A43]" />
                    <span>Avg Temperature</span>
                  </div>
                  <p className="text-base font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">
                    {selectedMonth.avgTempC} °C
                  </p>
                </div>
              </div>

              {/* Pollen Diversity Pills */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-[#657351] dark:text-[#A3B59E] uppercase tracking-wide block">
                  Key Airborne Pollen Signature
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMonth.pollenTypes.map((p, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F5F2EB] dark:bg-[#1F2B1D] border border-[#243324]/10 dark:border-white/10 text-[#243324] dark:text-[#F4EFE6]"
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: p.color }}
                      />
                      <span>{p.name}</span>
                      <span className="text-[10px] opacity-60">({p.abundance})</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Phenology, Blooms, and Apiary Operations */}
          <div className="lg:col-span-8 space-y-4">
            {/* Flora in Bloom */}
            <div className="p-5 rounded-2xl bg-white/80 dark:bg-white/5 border border-[#243324]/10 dark:border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#3B6A38] dark:text-[#A3C99F]">
                <Flower2 className="w-4 h-4" />
                <span>Dominant Blooms on London Rooftops & Green Corridors</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {selectedMonth.dominantBlooms.map((bloom, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-xl text-xs font-medium bg-[#EFECE4] dark:bg-[#1E2E1D] text-[#1F2B1D] dark:text-[#F4EFE6] border border-[#243324]/5 dark:border-white/5 shadow-2xs"
                  >
                    🌸 {bloom}
                  </span>
                ))}
              </div>
            </div>

            {/* Hive State & Beekeeper Operations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/80 dark:bg-white/5 border border-[#243324]/10 dark:border-white/10 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#D49B28]">
                  <Bug className="w-4 h-4" />
                  <span>Colony Life Cycle & Hive Status</span>
                </div>
                <p className="text-xs sm:text-sm text-[#4A5D44] dark:text-[#CBD7C7] leading-relaxed">
                  {selectedMonth.hiveStatus}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/80 dark:bg-white/5 border border-[#243324]/10 dark:border-white/10 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#38726C]">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Beekeeper Management Focus</span>
                </div>
                <p className="text-xs sm:text-sm text-[#4A5D44] dark:text-[#CBD7C7] leading-relaxed">
                  {selectedMonth.beekeeperFocus}
                </p>
              </div>
            </div>

            {/* Urban Microclimate Ecological Insight */}
            <div className="p-4 rounded-2xl bg-[#E8EFE6] dark:bg-[#1A2D19] border border-[#3B6A38]/20 dark:border-[#3B6A38]/30 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[#3B6A38] dark:text-[#A3C99F] shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#3B6A38] dark:text-[#A3C99F] block">
                  London Microclimate Insight
                </span>
                <p className="text-xs sm:text-sm text-[#243324] dark:text-[#D5E0D2] leading-relaxed mt-0.5">
                  {selectedMonth.ecologicalHighlight}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};
