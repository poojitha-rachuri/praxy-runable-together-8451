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
    name: 'SheetSmart',
    slug: 'balance-sheet',
    status: 'active',
    total_levels: 10,
    icon: '📊',
    route: '/balance-sheet',
  },
  {
    id: 'cold-call',
    name: 'I Will Find You',
    slug: 'cold-call',
    status: 'active',
    total_levels: 10,
    icon: '📞',
    route: '/cold-call',
  },
  {
    id: 'rca',
    name: 'Get to the Bottom',
    slug: 'rca',
    status: 'active',
    total_levels: 10,
    icon: '🔍',
    route: '/rca',
  },
];

export function getSimulatorBySlug(slug: string): SimulatorMeta | undefined {
  return SIMULATORS.find((s) => s.slug === slug);
}
