/**
 * Simulator metadata for dashboard and navigation.
 * Status: 'active' = playable, 'coming_soon' = greyed out, not clickable.
 */

export interface SimulatorMeta {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'coming_soon';
  total_levels: number;
  icon: string;
  route: string;
}

export const SIMULATORS: SimulatorMeta[] = [
  {
    id: 'balance-sheet',
    name: 'Balance Sheet Mastery',
    slug: 'balance-sheet',
    status: 'active',
    total_levels: 10,
    icon: '📊',
    route: '/balance-sheet',
  },
  {
    id: 'cold-call',
    name: 'Cold Call Hero',
    slug: 'cold-call',
    status: 'coming_soon',
    total_levels: 10,
    icon: '📞',
    route: '#',
  },
  {
    id: 'rca',
    name: 'RCA Detective',
    slug: 'rca',
    status: 'coming_soon',
    total_levels: 10,
    icon: '🔍',
    route: '#',
  },
];

export function getSimulatorBySlug(slug: string): SimulatorMeta | undefined {
  return SIMULATORS.find((s) => s.slug === slug);
}
