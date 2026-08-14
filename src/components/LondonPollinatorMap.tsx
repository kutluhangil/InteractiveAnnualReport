import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as d3 from 'd3';
import {
  X,
  Droplets,
  Building2,
  Sparkles,
  Search,
  Filter,
  Layers,
  ThermometerSnowflake,
  ExternalLink,
  ChevronRight,
  Maximize2,
  RotateCcw,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import {
  ACTIVE_BOROUGHS,
  RIVER_THAMES_PATH,
  ALL_ROOFTOP_SITES,
  MAP_DIMENSIONS,
  BOROUGH_METRICS,
  BoroughGeoData,
} from '../data/londonMapData';
import { RooftopSite } from '../types';

interface LondonPollinatorMapProps {
  selectedBoroughName?: string | null;
  onSelectBorough?: (boroughName: string | null) => void;
  onHoverBorough?: (boroughName: string | null) => void;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

type MetricSizeMode = 'hives' | 'area' | 'honey' | 'rainwater' | 'uniform';

const SECTOR_CATEGORIES = [
  { id: 'all', label: 'All 52 Apiaries', color: '#243324' },
  { id: 'office', label: 'Corporate Office', color: '#3B6A38' },
  { id: 'hotel', label: 'Hotels & Hospitality', color: '#D49B28' },
  { id: 'school', label: 'Schools & Unis', color: '#38726C' },
  { id: 'market', label: 'Public & Markets', color: '#9B5B2E' },
  { id: 'residential', label: 'Residential & Estates', color: '#657351' },
];

export const LondonPollinatorMap: React.FC<LondonPollinatorMapProps> = ({
  selectedBoroughName,
  onSelectBorough,
  onHoverBorough,
  zoomLevel: externalZoomLevel,
  onZoomIn,
  onZoomOut,
}) => {
  const { isDark } = useTheme();
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // State Management
  const [selectedBoroughId, setSelectedBoroughId] = useState<string | null>(
    selectedBoroughName
      ? ACTIVE_BOROUGHS.find(
          (b) => b.name.toLowerCase() === selectedBoroughName.toLowerCase()
        )?.id || null
      : null
  );

  const [hoveredBoroughId, setHoveredBoroughId] = useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState<RooftopSite | null>(null);
  const [hoveredSite, setHoveredSite] = useState<RooftopSite | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const [selectedSectorFilter, setSelectedSectorFilter] = useState<string>('all');
  const [sizeMode, setSizeMode] = useState<MetricSizeMode>('hives');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Sync internal borough ID with prop if controlled
  useEffect(() => {
    if (selectedBoroughName === null || selectedBoroughName === undefined) {
      setSelectedBoroughId(null);
    } else {
      const match = ACTIVE_BOROUGHS.find(
        (b) => b.name.toLowerCase() === selectedBoroughName.toLowerCase()
      );
      setSelectedBoroughId(match ? match.id : null);
    }
  }, [selectedBoroughName]);

  // D3 Scales for dynamic pin radius sizing
  const hiveRadiusScale = useMemo(() => {
    const maxHives = d3.max(ALL_ROOFTOP_SITES, (d) => d.hives) || 6;
    return d3.scaleSqrt().domain([1, maxHives]).range([3.0, 7.5]);
  }, []);

  const areaRadiusScale = useMemo(() => {
    const maxArea = d3.max(ALL_ROOFTOP_SITES, (d) => d.wildflowerAreaSqM) || 750;
    return d3.scaleSqrt().domain([50, maxArea]).range([3.0, 8.5]);
  }, []);

  const honeyRadiusScale = useMemo(() => {
    const maxHoney = d3.max(ALL_ROOFTOP_SITES, (d) => d.honeyHarvestKg) || 100;
    return d3.scaleSqrt().domain([5, maxHoney]).range([3.0, 8.0]);
  }, []);

  const rainwaterRadiusScale = useMemo(() => {
    const maxRain = d3.max(ALL_ROOFTOP_SITES, (d) => d.rainwaterL) || 40000;
    return d3.scaleSqrt().domain([2000, maxRain]).range([3.0, 8.0]);
  }, []);

  // Compute pin radius for a site based on current sizeMode
  const getSiteRadius = (site: RooftopSite, isSelected: boolean, isHovered: boolean) => {
    let base = 3.8;
    switch (sizeMode) {
      case 'hives':
        base = hiveRadiusScale(site.hives);
        break;
      case 'area':
        base = areaRadiusScale(site.wildflowerAreaSqM);
        break;
      case 'honey':
        base = honeyRadiusScale(site.honeyHarvestKg);
        break;
      case 'rainwater':
        base = rainwaterRadiusScale(site.rainwaterL);
        break;
      case 'uniform':
      default:
        base = 4.0;
        break;
    }
    if (isSelected) return base + 3.0;
    if (isHovered) return base + 2.0;
    return base;
  };

  // Helper for sector badge color
  const getSectorColor = (buildingType: string) => {
    const lower = buildingType.toLowerCase();
    if (lower.includes('office') || lower.includes('corporate') || lower.includes('hq')) {
      return { bg: '#3B6A38', border: '#2D522B', label: 'Corporate Office', text: '#E8F5E7' };
    }
    if (lower.includes('hotel') || lower.includes('venue') || lower.includes('hospitality')) {
      return { bg: '#D49B28', border: '#A67718', label: 'Hospitality & Venue', text: '#FFF8EA' };
    }
    if (lower.includes('school') || lower.includes('university') || lower.includes('college') || lower.includes('academy')) {
      return { bg: '#38726C', border: '#26544F', label: 'School / Academic', text: '#E6F7F5' };
    }
    if (lower.includes('market') || lower.includes('library') || lower.includes('arts') || lower.includes('public')) {
      return { bg: '#9B5B2E', border: '#784420', label: 'Civic & Market', text: '#FDF1E8' };
    }
    return { bg: '#5C7456', border: '#43563F', label: 'Residential / Mixed', text: '#F4F8F3' };
  };

  // Filtered sites based on borough selection & sector filter & search
  const filteredSites = useMemo(() => {
    return ALL_ROOFTOP_SITES.filter((site) => {
      // Borough filter
      if (selectedBoroughId) {
        const selectedBorough = ACTIVE_BOROUGHS.find((b) => b.id === selectedBoroughId);
        if (selectedBorough && site.borough.toLowerCase() !== selectedBorough.name.toLowerCase()) {
          return false;
        }
      }

      // Sector filter
      if (selectedSectorFilter !== 'all') {
        const bType = site.buildingType.toLowerCase();
        if (selectedSectorFilter === 'office' && !bType.includes('office') && !bType.includes('corporate') && !bType.includes('hq')) {
          return false;
        }
        if (selectedSectorFilter === 'hotel' && !bType.includes('hotel') && !bType.includes('venue') && !bType.includes('hospitality')) {
          return false;
        }
        if (selectedSectorFilter === 'school' && !bType.includes('school') && !bType.includes('uni') && !bType.includes('college') && !bType.includes('academy')) {
          return false;
        }
        if (selectedSectorFilter === 'market' && !bType.includes('market') && !bType.includes('arts') && !bType.includes('public') && !bType.includes('library')) {
          return false;
        }
        if (selectedSectorFilter === 'residential' && !bType.includes('residential') && !bType.includes('estate') && !bType.includes('housing')) {
          return false;
        }
      }

      // Search Query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = site.name.toLowerCase().includes(query);
        const matchBorough = site.borough.toLowerCase().includes(query);
        const matchType = site.buildingType.toLowerCase().includes(query);
        const matchAddress = site.addressSnippet?.toLowerCase().includes(query);
        if (!matchName && !matchBorough && !matchType && !matchAddress) {
          return false;
        }
      }

      return true;
    });
  }, [selectedBoroughId, selectedSectorFilter, searchQuery]);

  // Aggregate stats for the currently visible sites
  const visibleStats = useMemo(() => {
    const totalSites = filteredSites.length;
    const totalHives = filteredSites.reduce((acc, s) => acc + s.hives, 0);
    const totalMeadow = filteredSites.reduce((acc, s) => acc + s.wildflowerAreaSqM, 0);
    const totalHoney = filteredSites.reduce((acc, s) => acc + s.honeyHarvestKg, 0);
    const totalJars = filteredSites.reduce((acc, s) => acc + s.jarsDonated, 0);
    const totalRain = filteredSites.reduce((acc, s) => acc + s.rainwaterL, 0);
    const estimatedBees = totalHives * 50000;

    return {
      totalSites,
      totalHives,
      totalMeadow,
      totalHoney,
      totalJars,
      totalRain,
      estimatedBees,
    };
  }, [filteredSites]);

  const handleBoroughClick = (borough: BoroughGeoData) => {
    if (selectedBoroughId === borough.id) {
      setSelectedBoroughId(null);
      setSelectedSite(null);
      if (onSelectBorough) onSelectBorough(null);
    } else {
      setSelectedBoroughId(borough.id);
      setSelectedSite(null);
      if (onSelectBorough) onSelectBorough(borough.name);
    }
  };

  const handleBoroughMouseEnter = (borough: BoroughGeoData) => {
    setHoveredBoroughId(borough.id);
    if (onHoverBorough) onHoverBorough(borough.name);
  };

  const handleBoroughMouseLeave = () => {
    setHoveredBoroughId(null);
    if (onHoverBorough) onHoverBorough(null);
  };

  const handleSiteMouseEnter = (site: RooftopSite, event: React.MouseEvent) => {
    setHoveredSite(site);
    if (mapContainerRef.current) {
      const rect = mapContainerRef.current.getBoundingClientRect();
      setHoverPos({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    }
    if (onHoverBorough) onHoverBorough(site.borough);
  };

  const handleSiteMouseMove = (event: React.MouseEvent) => {
    if (mapContainerRef.current && hoveredSite) {
      const rect = mapContainerRef.current.getBoundingClientRect();
      setHoverPos({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    }
  };

  const handleSiteMouseLeave = () => {
    setHoveredSite(null);
    setHoverPos(null);
    if (hoveredBoroughId) {
      const b = ACTIVE_BOROUGHS.find((item) => item.id === hoveredBoroughId);
      if (b && onHoverBorough) {
        onHoverBorough(b.name);
        return;
      }
    }
    if (onHoverBorough) onHoverBorough(null);
  };

  const hoveredBoroughData = useMemo(() => {
    if (!hoveredBoroughId) return null;
    const b = ACTIVE_BOROUGHS.find((item) => item.id === hoveredBoroughId);
    if (!b) return null;
    const metric = BOROUGH_METRICS[b.rawName.toLowerCase()] || BOROUGH_METRICS[b.name.toLowerCase()];
    return {
      borough: b,
      metric,
    };
  }, [hoveredBoroughId]);

  return (
    <div
      ref={mapContainerRef}
      className="relative w-full h-[620px] sm:h-[680px] lg:h-[720px] bg-[#FBF9F5] dark:bg-[#152014] overflow-hidden select-none flex flex-col transition-colors duration-400"
    >
      {/* Top Floating Map Toolbar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Sector Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-white/90 dark:bg-[#1C2B1B]/90 backdrop-blur-md border border-[#243324]/12 dark:border-white/15 shadow-sm pointer-events-auto max-w-[85vw] overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-[#657351] dark:text-[#A3B59E] shrink-0">
            <Filter className="w-3 h-3" />
            <span className="hidden sm:inline">Sector:</span>
          </div>
          {SECTOR_CATEGORIES.map((cat) => {
            const isSelected = selectedSectorFilter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedSectorFilter(cat.id)}
                className={`px-2.5 py-1 rounded-xl text-xs font-medium tracking-tight transition-all cursor-pointer select-none shrink-0 ${
                  isSelected
                    ? 'bg-[#243324] dark:bg-[#344732] text-white dark:text-[#F4EFE6] shadow-2xs font-semibold'
                    : 'text-[#4A5D44] dark:text-[#CBD7C7] hover:bg-[#F5F2EB] dark:hover:bg-[#253723]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Right Action Tools: Size Metric & Search Toggle */}
        <div className="flex items-center gap-2 pointer-events-auto shrink-0">
          {/* Size Metric Selector */}
          <div className="hidden md:flex items-center bg-white/90 dark:bg-[#1C2B1B]/90 backdrop-blur-md rounded-2xl border border-[#243324]/12 dark:border-white/15 p-1 shadow-sm gap-1">
            <div className="flex items-center gap-1 px-2 text-[11px] font-semibold text-[#657351] dark:text-[#A3B59E]">
              <Layers className="w-3 h-3" />
              <span>Pin Size:</span>
            </div>
            {(['hives', 'area', 'honey', 'uniform'] as MetricSizeMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setSizeMode(mode)}
                className={`px-2 py-0.5 rounded-lg text-xs capitalize transition-all cursor-pointer ${
                  sizeMode === mode
                    ? 'bg-[#243324] dark:bg-[#384E36] text-white font-medium'
                    : 'text-[#4A5D44] dark:text-[#CBD7C7] hover:bg-[#F5F2EB] dark:hover:bg-[#253723]'
                }`}
              >
                {mode === 'area' ? 'Canopy m²' : mode}
              </button>
            ))}
          </div>

          {/* Quick Search Button */}
          <div className="relative">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`p-2 rounded-2xl bg-white/90 dark:bg-[#1C2B1B]/90 backdrop-blur-md border border-[#243324]/12 dark:border-white/15 shadow-sm text-[#243324] dark:text-[#F4EFE6] hover:bg-[#F5F2EB] dark:hover:bg-[#253723] transition-colors cursor-pointer flex items-center gap-1.5 ${
                isSearchOpen || searchQuery ? 'ring-2 ring-[#3B6A38]' : ''
              }`}
              title="Search 52 Rooftops"
            >
              <Search className="w-4 h-4" />
              {searchQuery && (
                <span className="text-xs max-w-[80px] truncate text-[#3B6A38] dark:text-[#A8D3A5] font-medium">
                  {searchQuery}
                </span>
              )}
            </button>

            {/* Search Popover */}
            <AnimatePresence>
              {isSearchOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute right-0 top-12 w-72 bg-white dark:bg-[#1A2819] rounded-2xl border border-[#243324]/15 dark:border-white/15 shadow-2xl p-3 space-y-2 z-40"
                >
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search rooftop, borough, sector..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                      className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-[#F5F2EB] dark:bg-[#131F12] border border-[#243324]/10 dark:border-white/10 text-xs text-[#1F2B1D] dark:text-[#F4EFE6] focus:outline-none focus:ring-1 focus:ring-[#3B6A38]"
                    />
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#657351] dark:text-[#A3B59E]" />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-2 text-[#657351] dark:text-[#A3B59E] hover:text-[#1F2B1D] cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#657351] dark:text-[#A3B59E] px-1">
                    <span>{filteredSites.length} sites matched</span>
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setIsSearchOpen(false);
                        }}
                        className="text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                      >
                        Clear filter
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* SVG Map Canvas Container */}
      <div
        className="w-full h-full flex items-center justify-center transition-transform duration-300 ease-out origin-center p-2 sm:p-4"
        style={{
          transform: `scale(${externalZoomLevel})`,
        }}
      >
        <svg
          viewBox={MAP_DIMENSIONS.viewBox}
          className="w-full h-full"
          style={{ overflow: 'visible' }}
        >
          <defs>
            {/* Soft Drop Shadow for Active Borough Polygons */}
            <filter id="boroughShadow" x="-5%" y="-5%" width="110%" height="110%">
              <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity={isDark ? 0.25 : 0.05} />
            </filter>
            <filter id="activeShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={isDark ? '#000000' : '#243324'} floodOpacity={isDark ? 0.45 : 0.18} />
            </filter>
            {/* Glow for Selected Pins */}
            <filter id="pinGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 1. Borough Fill Polygons & Boundary Lines */}
          <g id="london-active-boroughs">
            {ACTIVE_BOROUGHS.map((borough) => {
              const isSelected = selectedBoroughId === borough.id;
              const isHovered = hoveredBoroughId === borough.id;

              const fillStyle = isDark
                ? isSelected
                  ? '#3D5439'
                  : isHovered
                  ? '#2B3D28'
                  : '#1E2C1C'
                : isSelected
                ? '#243324'
                : isHovered
                ? '#E5EDE2'
                : '#FBF9F5';

              const strokeStyle = isDark
                ? isSelected
                  ? '#85E7B7'
                  : isHovered
                  ? '#506B4D'
                  : '#334731'
                : isSelected
                ? '#142013'
                : '#243324';

              const strokeWidthVal = isSelected ? 1.2 : isHovered ? 0.95 : 0.75;

              return (
                <motion.path
                  key={borough.id}
                  d={borough.svgPath}
                  initial={false}
                  animate={{
                    scale: isHovered ? 1.028 : isSelected ? 1.018 : 1,
                    opacity: hoveredBoroughId
                      ? isHovered || isSelected
                        ? 1
                        : 0.52
                      : hoveredSite
                      ? borough.name.toLowerCase() === hoveredSite.borough.toLowerCase()
                        ? 1
                        : 0.65
                      : 1,
                    fill: fillStyle,
                    stroke: strokeStyle,
                    strokeWidth: strokeWidthVal,
                  }}
                  whileHover={{
                    scale: 1.032,
                    transition: { type: 'spring', stiffness: 420, damping: 22 },
                  }}
                  whileTap={{
                    scale: 0.985,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 350,
                    damping: 24,
                    mass: 0.7,
                  }}
                  style={{
                    transformOrigin: `${borough.labelPos.x}px ${borough.labelPos.y}px`,
                  }}
                  className="cursor-pointer"
                  filter={isSelected ? 'url(#activeShadow)' : isHovered ? 'url(#activeShadow)' : 'url(#boroughShadow)'}
                  onMouseEnter={() => handleBoroughMouseEnter(borough)}
                  onMouseLeave={handleBoroughMouseLeave}
                  onClick={() => handleBoroughClick(borough)}
                />
              );
            })}
          </g>

          {/* 2. River Thames Ribbon (Continuous, unbroken, constant uniform 6px thickness across entire map) */}
          <g id="river-thames" className="pointer-events-none select-none">
            <path
              d={RIVER_THAMES_PATH}
              fill="none"
              stroke={isDark ? '#4D6B4A' : '#829c80'}
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>

          {/* 3. Borough Titles */}
          <g id="borough-titles" className="pointer-events-none select-none">
            {ACTIVE_BOROUGHS.map((borough) => {
              const isSelected = selectedBoroughId === borough.id;
              const isHovered = hoveredBoroughId === borough.id;

              const displayName =
                borough.name === 'Hammersmith and Fulham'
                  ? 'Hammersmith & Fulham'
                  : borough.name;

              const textStroke = isDark
                ? isSelected
                  ? '#1E2C1C'
                  : '#152014'
                : isSelected
                ? '#243324'
                : '#FBF9F5';

              const textFill = isDark
                ? isSelected
                  ? '#FFFFFF'
                  : isHovered
                  ? '#FFFFFF'
                  : '#DCE8D9'
                : isSelected
                ? '#FFFFFF'
                : isHovered
                ? '#142013'
                : '#243324';

              return (
                <motion.text
                  key={`title-${borough.id}`}
                  x={borough.labelPos.x}
                  y={borough.labelPos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  stroke={textStroke}
                  strokeWidth={isSelected ? '0' : '1.5'}
                  strokeLinejoin="round"
                  paintOrder="stroke fill"
                  initial={false}
                  animate={{
                    scale: isHovered ? 1.15 : isSelected ? 1.08 : 1,
                    opacity: hoveredBoroughId ? (isHovered || isSelected ? 1 : 0.45) : 0.92,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 350,
                    damping: 24,
                  }}
                  className={`font-semibold tracking-tight select-none pointer-events-none ${
                    isSelected
                      ? 'text-[7.6px] font-bold'
                      : isHovered
                      ? 'text-[7.4px] font-bold'
                      : 'text-[6.8px]'
                  }`}
                  style={{
                    transformOrigin: `${borough.labelPos.x}px ${borough.labelPos.y}px`,
                    fill: textFill,
                  }}
                >
                  {displayName}
                </motion.text>
              );
            })}
          </g>

          {/* 4. 52 Rooftop Site Pins with D3 Scaling & Sector Badging */}
          <g id="rooftop-site-pins">
            {filteredSites.map((site) => {
              const isSelected = selectedSite?.id === site.id;
              const isHovered = hoveredSite?.id === site.id;
              const isParentBoroughHovered =
                hoveredBoroughData &&
                site.borough.toLowerCase() === hoveredBoroughData.borough.name.toLowerCase();
              const radius = getSiteRadius(site, isSelected, isHovered);
              const sector = getSectorColor(site.buildingType);

              const pinOpacity = hoveredSite
                ? isHovered
                  ? 1
                  : 0.45
                : hoveredBoroughId
                ? isParentBoroughHovered
                  ? 1
                  : 0.35
                : 1;

              return (
                <motion.g
                  key={site.id}
                  transform={`translate(${site.x}, ${site.y})`}
                  initial={false}
                  animate={{
                    scale: isHovered ? 1.45 : isSelected ? 1.25 : isParentBoroughHovered ? 1.15 : 1,
                    opacity: pinOpacity,
                  }}
                  whileHover={{
                    scale: 1.5,
                    transition: { type: 'spring', stiffness: 450, damping: 18 },
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 380,
                    damping: 22,
                  }}
                  className="cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSite(site);
                    const b = ACTIVE_BOROUGHS.find(
                      (item) => item.name.toLowerCase() === site.borough.toLowerCase()
                    );
                    if (b) {
                      setSelectedBoroughId(b.id);
                      if (onSelectBorough) onSelectBorough(b.name);
                    }
                  }}
                  onMouseEnter={(e) => handleSiteMouseEnter(site, e)}
                  onMouseMove={handleSiteMouseMove}
                  onMouseLeave={handleSiteMouseLeave}
                >
                  {/* Subtle Radiating Halo for Key Stories or Selected Pin */}
                  {(isSelected || site.isKeyStory) && (
                    <circle
                      r={radius + 4}
                      fill={sector.bg}
                      fillOpacity={0.25}
                      className="animate-pulse"
                    />
                  )}

                  {/* Stationary Outer Selection / Focus Ring */}
                  {isSelected && (
                    <circle
                      r={radius + 2.5}
                      fill="none"
                      stroke={isDark ? '#85E7B7' : '#243324'}
                      strokeWidth="1.2"
                      className="opacity-90"
                    />
                  )}

                  {/* Main Location Pin Circle */}
                  <circle
                    r={radius}
                    fill={isDark ? (isSelected ? '#85E7B7' : sector.bg) : (isSelected ? '#1F2B1D' : sector.bg)}
                    stroke={isDark ? '#152014' : '#FFFFFF'}
                    strokeWidth={isSelected ? 1.5 : 1.0}
                    className="transition-all duration-150"
                  />

                  {/* Inner Center Honey Glow Dot */}
                  <circle
                    r={Math.max(1.0, radius * 0.35)}
                    fill={isSelected ? (isDark ? '#152014' : '#FFFFFF') : '#FFFFFF'}
                    className="pointer-events-none"
                  />
                </motion.g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Floating Bottom Corridor Aggregate Ticker */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="flex items-center gap-3 sm:gap-6 px-4 py-2 rounded-2xl bg-white/90 dark:bg-[#182617]/90 backdrop-blur-md border border-[#243324]/12 dark:border-white/15 shadow-sm text-xs pointer-events-auto">
          <div>
            <span className="text-[#657351] dark:text-[#A3B59E] block text-[10px] uppercase font-semibold">
              {selectedBoroughId ? `${ACTIVE_BOROUGHS.find(b => b.id === selectedBoroughId)?.name} Corridors` : 'Corridor Total'}
            </span>
            <span className="font-display text-sm sm:text-base font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">
              {visibleStats.totalSites} Apiary Havens
            </span>
          </div>

          <div className="h-6 w-px bg-[#243324]/10 dark:bg-white/10" />

          <div>
            <span className="text-[#657351] dark:text-[#A3B59E] block text-[10px] uppercase font-semibold">Active Hives</span>
            <span className="font-display text-sm sm:text-base font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">
              {visibleStats.totalHives} Colonies
            </span>
          </div>

          <div className="h-6 w-px bg-[#243324]/10 dark:bg-white/10 hidden sm:block" />

          <div className="hidden sm:block">
            <span className="text-[#657351] dark:text-[#A3B59E] block text-[10px] uppercase font-semibold">Meadow Area</span>
            <span className="font-display text-sm sm:text-base font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">
              {visibleStats.totalMeadow.toLocaleString()} m²
            </span>
          </div>

          <div className="h-6 w-px bg-[#243324]/10 dark:bg-white/10 hidden md:block" />

          <div className="hidden md:block">
            <span className="text-[#657351] dark:text-[#A3B59E] block text-[10px] uppercase font-semibold">Honey Harvest</span>
            <span className="font-display text-sm sm:text-base font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">
              {visibleStats.totalHoney.toFixed(1)} kg
            </span>
          </div>
        </div>

        {/* Reset Selection / Reset View Button */}
        {(selectedBoroughId || selectedSite || selectedSectorFilter !== 'all' || searchQuery) && (
          <button
            onClick={() => {
              setSelectedBoroughId(null);
              setSelectedSite(null);
              setSelectedSectorFilter('all');
              setSearchQuery('');
              if (onSelectBorough) onSelectBorough(null);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#243324] dark:bg-[#344732] text-white text-xs font-medium shadow-sm hover:bg-[#182318] transition-colors cursor-pointer pointer-events-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Map Filter</span>
          </button>
        )}
      </div>

      {/* Cursor-Anchored Interactive Hover Tooltip for Sites */}
      <AnimatePresence>
        {hoveredSite && !selectedSite && hoverPos && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute pointer-events-none z-30 bg-[#162315]/95 dark:bg-[#0D150C]/95 backdrop-blur-xl text-white px-4 py-3 rounded-2xl text-xs shadow-2xl border border-white/20 min-w-[260px] max-w-xs space-y-2.5"
            style={{
              left: Math.min(Math.max(hoverPos.x, 140), (mapContainerRef.current?.clientWidth || 500) - 140),
              top: Math.max(hoverPos.y - 12, 40),
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-white/15 text-[#85E7B7]">
                  {hoveredSite.buildingType}
                </span>
                <span className="text-[11px] text-[#A8D3A5] font-medium">
                  {hoveredSite.borough}
                </span>
              </div>
              <h4 className="font-display text-sm font-semibold text-white leading-snug">
                {hoveredSite.name}
              </h4>
            </div>

            {/* Impact Metrics Row */}
            <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-white/10 text-center">
              <div className="p-1.5 rounded-xl bg-white/5">
                <div className="font-display text-sm font-semibold text-white">
                  {hoveredSite.hives}
                </div>
                <div className="text-[9px] text-[#CBD7C7]">Hives</div>
              </div>
              <div className="p-1.5 rounded-xl bg-white/5">
                <div className="font-display text-sm font-semibold text-white">
                  {hoveredSite.wildflowerAreaSqM} <span className="text-[8px] font-sans font-light">m²</span>
                </div>
                <div className="text-[9px] text-[#CBD7C7]">Meadow</div>
              </div>
              <div className="p-1.5 rounded-xl bg-white/5">
                <div className="font-display text-sm font-semibold text-white">
                  {hoveredSite.honeyHarvestKg} <span className="text-[8px] font-sans font-light">kg</span>
                </div>
                <div className="text-[9px] text-[#CBD7C7]">Honey</div>
              </div>
            </div>

            {/* Micro Co-Benefit Callout */}
            <div className="flex items-center justify-between text-[10px] text-[#A8D3A5] pt-0.5">
              <span className="flex items-center gap-1">
                <Droplets className="w-3 h-3 text-emerald-400" />
                {hoveredSite.rainwaterL.toLocaleString()} L rain absorbed
              </span>
              <span className="text-[9px] text-white/60">Click to expand</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Borough Polygon Hover Quick Stats Pill (when not hovering a site) */}
      <AnimatePresence>
        {hoveredBoroughData && !hoveredSite && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-20 left-4 z-20 pointer-events-none bg-white/95 dark:bg-[#1C2B1B]/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-[#243324]/15 dark:border-white/15 shadow-lg text-xs space-y-0.5"
          >
            <div className="font-semibold text-[#1F2B1D] dark:text-[#F4EFE6] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#3B6A38]" />
              <span>{hoveredBoroughData.borough.name}</span>
            </div>
            {hoveredBoroughData.metric ? (
              <div className="text-[11px] text-[#657351] dark:text-[#A3B59E] flex items-center gap-2">
                <span>{hoveredBoroughData.metric.sites} Sites</span>
                <span>•</span>
                <span>{hoveredBoroughData.metric.hives} Hives</span>
                <span>•</span>
                <span>{hoveredBoroughData.metric.wildflowerAreaSqM.toLocaleString()} m² Meadow</span>
              </div>
            ) : (
              <div className="text-[11px] text-[#657351] dark:text-[#A3B59E]">
                Active pollination zone
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Detailed Site Dossier Drawer (when a site is selected) */}
      <AnimatePresence>
        {selectedSite && (
          <motion.div
            initial={{ opacity: 0, x: 30, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 30, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="absolute top-4 right-4 bottom-16 sm:bottom-4 w-[92%] sm:w-[360px] z-30 bg-white/95 dark:bg-[#1C291B]/95 backdrop-blur-md rounded-3xl border border-[#243324]/12 dark:border-white/15 shadow-2xl p-5 overflow-y-auto flex flex-col space-y-4 transition-colors duration-400"
          >
            {/* Header & Close Icon */}
            <div className="flex items-start justify-between gap-2 border-b border-[#243324]/10 dark:border-white/10 pb-3">
              <div className="space-y-1">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-[#3B4D36]/10 dark:bg-white/10 text-[#3B4D36] dark:text-[#85E7B7]">
                  {selectedSite.buildingType}
                </span>
                <h4 className="font-display text-xl text-[#1F2B1D] dark:text-[#F4EFE6] font-normal leading-snug">
                  {selectedSite.name}
                </h4>
                {selectedSite.addressSnippet && (
                  <p className="text-xs text-[#657351] dark:text-[#A3B59E] font-light">
                    {selectedSite.addressSnippet} • {selectedSite.borough}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedSite(null)}
                className="p-1.5 rounded-full hover:bg-[#243324]/8 dark:hover:bg-white/10 text-[#657351] dark:text-[#A3B59E] cursor-pointer shrink-0 transition-colors"
                aria-label="Close site details"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 4-Stat Core Impact Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-2xl bg-[#FBF9F5] dark:bg-[#141E13] border border-[#243324]/6 dark:border-white/10">
                <div className="font-display text-2xl text-[#1F2B1D] dark:text-[#F4EFE6] font-normal">
                  {selectedSite.hives}
                </div>
                <div className="text-[11px] text-[#657351] dark:text-[#A3B59E]">
                  Active Colonies (~{(selectedSite.hives * 50).toLocaleString()}k Bees)
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-[#FBF9F5] dark:bg-[#141E13] border border-[#243324]/6 dark:border-white/10">
                <div className="font-display text-2xl text-[#1F2B1D] dark:text-[#F4EFE6] font-normal">
                  {selectedSite.wildflowerAreaSqM}{' '}
                  <span className="text-xs font-sans font-light">m²</span>
                </div>
                <div className="text-[11px] text-[#657351] dark:text-[#A3B59E]">Wildflower Canopy</div>
              </div>
              <div className="p-3 rounded-2xl bg-[#FBF9F5] dark:bg-[#141E13] border border-[#243324]/6 dark:border-white/10">
                <div className="font-display text-2xl text-[#1F2B1D] dark:text-[#F4EFE6] font-normal">
                  {selectedSite.honeyHarvestKg}{' '}
                  <span className="text-xs font-sans font-light">kg</span>
                </div>
                <div className="text-[11px] text-[#657351] dark:text-[#A3B59E]">Raw Honey Harvest</div>
              </div>
              <div className="p-3 rounded-2xl bg-[#FBF9F5] dark:bg-[#141E13] border border-[#243324]/6 dark:border-white/10">
                <div className="font-display text-2xl text-[#1F2B1D] dark:text-[#F4EFE6] font-normal">
                  {selectedSite.jarsDonated}
                </div>
                <div className="text-[11px] text-[#657351] dark:text-[#A3B59E]">Jars to Food Banks</div>
              </div>
            </div>

            {/* Environmental Co-Benefit: Stormwater Retention */}
            <div className="p-3.5 rounded-2xl bg-[#E8EFE6]/70 dark:bg-[#233421] border border-[#3B4D36]/15 dark:border-white/10 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white dark:bg-[#141E13] text-[#3B4D36] dark:text-[#85E7B7] shadow-2xs shrink-0">
                <Droplets className="w-4 h-4 text-emerald-700 dark:text-[#85E7B7]" />
              </div>
              <div className="text-xs">
                <div className="font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">
                  {selectedSite.rainwaterL.toLocaleString()} Litres
                </div>
                <div className="text-[#657351] dark:text-[#CBD7C7]">
                  Stormwater absorbed & diverted from Thames overflow
                </div>
              </div>
            </div>

            {/* Thermal & Climate Resilience Highlight */}
            <div className="p-3.5 rounded-2xl bg-[#FBF9F5] dark:bg-[#141E13] border border-[#243324]/6 dark:border-white/10 flex items-center gap-3 text-xs">
              <div className="p-2 rounded-xl bg-white dark:bg-[#1A2819] text-[#D49B28] shadow-2xs shrink-0">
                <ThermometerSnowflake className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">
                  Microclimate Buffer
                </div>
                <div className="text-[#657351] dark:text-[#A3B59E]">
                  Reduces summer rooftop surface heat by up to 3.8°C
                </div>
              </div>
            </div>

            {/* Narrative Story Note (if available) */}
            {selectedSite.storyNote && (
              <div className="p-3.5 rounded-2xl bg-[#F5F2EB] dark:bg-[#162415] border border-[#243324]/10 dark:border-white/10 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#3B6A38] dark:text-[#A8D3A5]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Field Note</span>
                </div>
                <p className="text-xs text-[#4A5D44] dark:text-[#D2CBBF] font-light leading-relaxed">
                  {selectedSite.storyNote}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
