export interface BiodiversityDataPoint {
  month: string;
  quarter: string;
  wildflowerArea: number; // m²
  activeHives: number;
  speciesDiversity: number; // average species per site
  pollinatorVisitsThousand: number; // thousands of counted visits
  stormwaterRetainedKL: number; // kL
  honeyCumulativeKg: number; // kg
  milestone?: string;
}

export const BIODIVERSITY_GROWTH_SERIES: BiodiversityDataPoint[] = [
  {
    month: 'Jan 2025',
    quarter: 'Q1 2025',
    wildflowerArea: 4120,
    activeHives: 52,
    speciesDiversity: 9.8,
    pollinatorVisitsThousand: 45,
    stormwaterRetainedKL: 180,
    honeyCumulativeKg: 0,
    milestone: 'Winter baseline & thermal survey across 14 initial roofs',
  },
  {
    month: 'Mar 2025',
    quarter: 'Q1 2025',
    wildflowerArea: 6450,
    activeHives: 74,
    speciesDiversity: 13.4,
    pollinatorVisitsThousand: 120,
    stormwaterRetainedKL: 310,
    honeyCumulativeKg: 0,
    milestone: 'Spring seed bomb dispersal across Southwark & Camden',
  },
  {
    month: 'May 2025',
    quarter: 'Q2 2025',
    wildflowerArea: 9800,
    activeHives: 108,
    speciesDiversity: 18.2,
    pollinatorVisitsThousand: 380,
    stormwaterRetainedKL: 490,
    honeyCumulativeKg: 420,
    milestone: 'First major wildflower bloom in City of London corridor',
  },
  {
    month: 'Jul 2025',
    quarter: 'Q3 2025',
    wildflowerArea: 12400,
    activeHives: 136,
    speciesDiversity: 21.0,
    pollinatorVisitsThousand: 710,
    stormwaterRetainedKL: 620,
    honeyCumulativeKg: 1150,
    milestone: 'Midsummer nectar peak & solitary bee nesting expansion',
  },
  {
    month: 'Sep 2025',
    quarter: 'Q3 2025',
    wildflowerArea: 14100,
    activeHives: 154,
    speciesDiversity: 21.9,
    pollinatorVisitsThousand: 840,
    stormwaterRetainedKL: 710,
    honeyCumulativeKg: 1820,
    milestone: 'Autumn honey collection & school observation hives active',
  },
  {
    month: 'Nov 2025',
    quarter: 'Q4 2025',
    wildflowerArea: 14950,
    activeHives: 162,
    speciesDiversity: 20.4,
    pollinatorVisitsThousand: 320,
    stormwaterRetainedKL: 810,
    honeyCumulativeKg: 1980,
    milestone: 'Winter hazel hurdle installations to protect high-altitude hives',
  },
  {
    month: 'Jan 2026',
    quarter: 'Q1 2026',
    wildflowerArea: 15400,
    activeHives: 170,
    speciesDiversity: 21.1,
    pollinatorVisitsThousand: 180,
    stormwaterRetainedKL: 860,
    honeyCumulativeKg: 2010,
    milestone: 'IoT solar acoustic sensors deployed on 30 core apiaries',
  },
  {
    month: 'Mar 2026',
    quarter: 'Q1 2026',
    wildflowerArea: 16350,
    activeHives: 182,
    speciesDiversity: 23.0,
    pollinatorVisitsThousand: 460,
    stormwaterRetainedKL: 910,
    honeyCumulativeKg: 2140,
    milestone: 'Western corridor linked: Hammersmith & Fulham school apiaries live',
  },
  {
    month: 'May 2026',
    quarter: 'Q2 2026',
    wildflowerArea: 17200,
    activeHives: 190,
    speciesDiversity: 24.2,
    pollinatorVisitsThousand: 950,
    stormwaterRetainedKL: 950,
    honeyCumulativeKg: 2410,
    milestone: 'Thames riverbank wildflower sanctuary network fully connected',
  },
  {
    month: 'Aug 2026',
    quarter: 'Q3 2026',
    wildflowerArea: 17889,
    activeHives: 194,
    speciesDiversity: 24.63,
    pollinatorVisitsThousand: 1280,
    stormwaterRetainedKL: 983,
    honeyCumulativeKg: 2668,
    milestone: '52 sanctuaries & 9.7M bees achieved across 11 London boroughs',
  },
];

export interface MetricStream {
  id: 'meadow' | 'hives' | 'diversity' | 'pollinators' | 'stormwater';
  label: string;
  shortLabel: string;
  dataKey: keyof BiodiversityDataPoint;
  unit: string;
  format: (v: number) => string;
  color: string;
  fillColor: string;
  gradientId: string;
  description: string;
}

export const METRIC_STREAMS: MetricStream[] = [
  {
    id: 'meadow',
    label: 'Wildflower Meadow Canopy',
    shortLabel: 'Canopy (m²)',
    dataKey: 'wildflowerArea',
    unit: ' m²',
    format: (v) => `${v.toLocaleString()} m²`,
    color: '#3B6A38',
    fillColor: '#5C9058',
    gradientId: 'grad-wildflower',
    description: 'Total living roof surface engineered with native flora soil strata across London.',
  },
  {
    id: 'hives',
    label: 'Active Hive Colonies',
    shortLabel: 'Hives',
    dataKey: 'activeHives',
    unit: ' hives',
    format: (v) => `${v} hives`,
    color: '#D49B28',
    fillColor: '#E9B949',
    gradientId: 'grad-hives',
    description: 'Thriving honeybee colonies monitored by certified urban apiarists.',
  },
  {
    id: 'diversity',
    label: 'Pollinator Species Index',
    shortLabel: 'Species / Site',
    dataKey: 'speciesDiversity',
    unit: ' species',
    format: (v) => `${v.toFixed(1)} spp`,
    color: '#38726C',
    fillColor: '#4FA39B',
    gradientId: 'grad-diversity',
    description: 'Average verified solitary bee, hoverfly, and butterfly species counted per rooftop.',
  },
  {
    id: 'pollinators',
    label: 'Pollinator Foraging Activity',
    shortLabel: 'Activity (k)',
    dataKey: 'pollinatorVisitsThousand',
    unit: 'k visits',
    format: (v) => `${v}k visits`,
    color: '#9B5B2E',
    fillColor: '#C47D48',
    gradientId: 'grad-pollinators',
    description: 'Estimated monthly pollinator visitation events across rooftop wildflower zones.',
  },
];
