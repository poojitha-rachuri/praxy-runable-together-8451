import { Link } from "wouter";
import { useState, useEffect, useMemo } from "react";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/clerk-react";
import PraxyMascot from "../components/praxy-mascot";
import StatsBar from "../components/dashboard/StatsBar";
import SimulatorCard from "../components/dashboard/SimulatorCard";
import { getOrCreateUser, setClerkId } from "../lib/api";
import {
  getUserStats,
  getSimulatorProgress,
  type UserStats,
  type SimulatorProgressItem,
} from "../lib/api/dashboard";
import { SIMULATORS } from "../constants/simulators";

const Dashboard = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [simulatorProgress, setSimulatorProgress] = useState<SimulatorProgressItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncAndLoad = async () => {
      if (!isLoaded) return;

      setLoading(true);

      if (isSignedIn && user) {
        setClerkId(user.id);
        await getOrCreateUser(
          user.id,
          user.primaryEmailAddress?.emailAddress ?? undefined,
          user.fullName ?? user.firstName ?? undefined,
          user.imageUrl ?? undefined
        );

        const [stats, progress] = await Promise.all([
          getUserStats(user.id),
          getSimulatorProgress(user.id),
        ]);
        setUserStats(stats ?? null);
        setSimulatorProgress(progress ?? []);
      } else {
        setUserStats(null);
        setSimulatorProgress([]);
      }

      setLoading(false);
    };

    syncAndLoad();
  }, [isLoaded, isSignedIn, user]);

  const progressBySimulator = useMemo(() => {
    const map: Record<string, SimulatorProgressItem> = {};
    for (const p of simulatorProgress) {
      map[p.simulator] = p;
    }
    return map;
  }, [simulatorProgress]);

  const statsBarData = userStats
    ? {
        total_xp: userStats.total_xp,
        streak_days: userStats.streak_days,
        badges_count: userStats.badges_count,
        sessions_count: userStats.sessions_count,
      }
    : {
        total_xp: 0,
        streak_days: 0,
        badges_count: 0,
        sessions_count: 0,
      };

  const firstName = user?.firstName ?? undefined;
  const hasProgress =
    userStats && (userStats.sessions_count > 0 || userStats.badges_count > 0);
  const greetingText = hasProgress
    ? `Welcome back${firstName ? `, ${firstName}` : ""}! Let's keep going!`
    : `Hey${firstName ? ` ${firstName}` : ""}! Ready to decode some balance sheets today?`;

  return (
    <div className="min-h-screen bg-cream">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-coral/5 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-80 h-80 bg-yellow/10 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-1/3 w-72 h-72 bg-teal/5 rounded-full blur-3xl" />
      </div>

      <header className="relative py-4 px-6 md:px-12 border-b border-charcoal/10 bg-cream/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
              <PraxyMascot size={36} waving={false} />
              <span className="font-nunito font-700 text-xl text-coral">Praxy</span>
            </div>
          </Link>

          <div className="flex items-center gap-4 md:gap-6">
            <SignedIn>
              <StatsBar stats={statsBarData} loading={loading} />
              <UserButton
                appearance={{
                  elements: { avatarBox: "w-10 h-10" },
                }}
              />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="gradient-coral text-white font-inter font-600 px-6 py-2 rounded-[8px] shadow-warm hover:shadow-warm-lg transition-all">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </header>

      <main className="relative py-8 md:py-12 px-6 md:px-12 lg:px-20">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10 opacity-0 animate-fade-in-up">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="flex-shrink-0">
                <PraxyMascot size={48} waving={false} expression="happy" />
              </div>
              <div className="relative flex-1">
                <div className="gradient-coral rounded-[16px] p-4 md:p-5 shadow-warm">
                  <p className="font-inter font-500 text-white text-base md:text-lg">
                    {greetingText}
                  </p>
                </div>
                <div
                  className="absolute left-0 top-1/2 -translate-x-2 -translate-y-1/2 w-0 h-0"
                  style={{
                    borderTop: "8px solid transparent",
                    borderBottom: "8px solid transparent",
                    borderRight: "10px solid #FF6B6B",
                  }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6 opacity-0 animate-fade-in-up delay-200">
            {SIMULATORS.map((sim, i) => (
              <SimulatorCard
                key={sim.id}
                simulator={sim}
                progress={progressBySimulator[sim.slug]}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
