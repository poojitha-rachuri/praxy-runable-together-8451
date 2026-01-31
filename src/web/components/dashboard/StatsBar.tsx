import { useState, useEffect, useRef } from "react";

export interface StatsBarData {
  total_xp: number;
  streak_days: number;
  badges_count: number;
  sessions_count: number;
}

interface StatsBarProps {
  stats: StatsBarData;
  loading?: boolean;
}

const DURATION_MS = 1200;
const EASING = (t: number) => 1 - Math.pow(1 - t, 3); // ease-out cubic

function useCountUp(end: number, enabled: boolean): number {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled || end === 0) {
      setValue(end);
      return () => {};
    }
    startRef.current = null;
    const tick = (timestamp: number) => {
      if (startRef.current == null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const t = Math.min(elapsed / DURATION_MS, 1);
      const eased = EASING(t);
      setValue(Math.round(eased * end));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [end, enabled]);

  return value;
}

function StatItem({
  icon,
  label,
  value,
  enabled,
}: {
  icon: string;
  label: string;
  value: number;
  enabled: boolean;
}) {
  const displayValue = useCountUp(value, enabled);
  return (
    <div className="flex items-center gap-2 bg-white/70 px-4 py-2.5 rounded-full shadow-warm">
      <span className="text-xl" aria-hidden>
        {icon}
      </span>
      <span className="font-inter font-600 text-charcoal text-sm md:text-base tabular-nums">
        {displayValue} {label}
      </span>
    </div>
  );
}

export default function StatsBar({ stats, loading = false }: StatsBarProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-wrap items-center gap-3 md:gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-10 w-24 md:w-28 bg-charcoal/10 rounded-full"
            aria-hidden
          />
        ))}
      </div>
    );
  }

  const enabled = mounted && !loading;
  return (
    <div className="flex flex-wrap items-center gap-3 md:gap-4">
      <StatItem
        icon="⭐"
        label="XP"
        value={stats.total_xp}
        enabled={enabled}
      />
      <StatItem
        icon="🔥"
        label="day streak"
        value={stats.streak_days}
        enabled={enabled}
      />
      <StatItem
        icon="🏆"
        label="badges"
        value={stats.badges_count}
        enabled={enabled}
      />
      <StatItem
        icon="🎯"
        label="sessions"
        value={stats.sessions_count}
        enabled={enabled}
      />
    </div>
  );
}
