import countiesToWards from './iebc-counties-wards.json';

export type IebcCounty = keyof typeof countiesToWards;

function norm(s: string) {
  return (s || '').trim().toLowerCase();
}

// Common aliases from user input / older data.
const COUNTY_ALIASES: Record<string, string> = {
  "murang'a": 'Murang’a',
  'muranga': 'Murang’a',
  'taita taveta': 'Taita/Taveta',
  'taita/taveta': 'Taita/Taveta',
  'nairobi': 'Nairobi City',
  'nairobi city': 'Nairobi City',
};

export function listIebcCounties(): string[] {
  return Object.keys(countiesToWards).sort((a, b) => a.localeCompare(b));
}

export function resolveIebcCounty(input: string): string {
  const direct = Object.keys(countiesToWards).find((c) => norm(c) === norm(input));
  if (direct) return direct;
  const alias = COUNTY_ALIASES[norm(input)];
  if (alias) return alias;
  return input;
}

export function listIebcWards(county: string): string[] {
  const c = resolveIebcCounty(county);
  const wards = (countiesToWards as Record<string, string[]>)[c] || [];
  return [...wards].sort((a, b) => a.localeCompare(b));
}

