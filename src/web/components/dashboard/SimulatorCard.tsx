import { Link } from "wouter";
import type { SimulatorMeta } from "@/constants/simulators";
import type { SimulatorProgressItem } from "@/lib/api/dashboard";

interface SimulatorCardProps {
  simulator: SimulatorMeta;
  progress: SimulatorProgressItem | undefined;
}

export default function SimulatorCard({ simulator, progress }: SimulatorCardProps) {
  const isActive = simulator.status === "active";
  const currentLevel = progress?.current_level ?? 1;
  const totalLevels = simulator.total_levels;
  const progressPercent = progress?.progress_percent ?? 0;
  const completedCount = progress?.completed_levels?.length ?? 0;

  const content = (
    <>
      <div className="flex items-start gap-4 mb-6">
        <div
          className={`text-5xl md:text-6xl flex-shrink-0 ${!isActive ? "grayscale opacity-70" : ""}`}
          aria-hidden
        >
          {simulator.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-nunito font-800 text-2xl md:text-3xl text-charcoal mb-2">
            {simulator.name}
          </h2>
          <p className="font-inter font-400 text-charcoal/70 text-base md:text-lg">
            {isActive
              ? `Learn in ${totalLevels} levels`
              : "Coming soon"}
          </p>
        </div>
        <span
          className={`inline-block px-3 py-1 text-xs font-inter font-600 rounded-full flex-shrink-0 ${
            isActive
              ? "bg-teal/20 text-teal"
              : "bg-yellow/80 text-charcoal"
          }`}
        >
          {isActive ? "LIVE" : "COMING SOON"}
        </span>
      </div>

      {isActive && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-inter font-600 text-charcoal text-sm">
              Level {currentLevel}/{totalLevels}
            </span>
            <span className="font-inter font-500 text-charcoal/60 text-sm">
              {progressPercent}% complete
            </span>
          </div>
          <div className="h-3 bg-charcoal/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-[#FF6B6B] to-[#FFD166]"
              style={{ width: `${progressPercent}%` }}
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      )}

      {isActive ? (
        <Link href={simulator.route}>
          <button
            type="button"
            className="w-full md:w-auto bg-gradient-to-r from-[#FF6B6B] to-[#FFD166] text-white font-inter font-600 text-lg px-8 py-4 rounded-[8px] shadow-warm hover:shadow-warm-lg transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98]"
          >
            {completedCount > 0 ? "Continue Learning →" : "Start Learning →"}
          </button>
        </Link>
      ) : (
        <button
          type="button"
          disabled
          className="w-full md:w-auto bg-charcoal/10 text-charcoal/50 font-inter font-600 text-lg px-8 py-4 rounded-[8px] cursor-not-allowed"
        >
          Coming Soon
        </button>
      )}
    </>
  );

  const cardClasses = `rounded-[16px] p-6 md:p-8 transition-all duration-300 block ${
    isActive
      ? "bg-white shadow-warm hover:shadow-warm-lg"
      : "bg-white/50 border border-charcoal/10 opacity-90"
  }`;

  return <div className={cardClasses}>{content}</div>;
}
