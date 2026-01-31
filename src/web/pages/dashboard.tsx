import { Link } from "wouter";
import PraxyMascot from "../components/praxy-mascot";

// Coming Soon Card Component
interface ComingSoonCardProps {
  emoji: string;
  title: string;
}

const ComingSoonCard = ({ emoji, title }: ComingSoonCardProps) => (
  <div className="bg-white/50 rounded-[16px] p-5 border border-charcoal/10 opacity-60 flex flex-col items-center text-center">
    <div className="text-3xl mb-3 grayscale">{emoji}</div>
    <h3 className="font-nunito font-700 text-base text-charcoal/60 mb-2">{title}</h3>
    <span className="inline-block px-3 py-1 bg-yellow/80 text-charcoal text-xs font-inter font-600 rounded-full">
      Coming Soon
    </span>
  </div>
);

const Dashboard = () => {
  // Static progress data
  const currentLevel = 1;
  const totalLevels = 10;
  const progressPercent = (currentLevel / totalLevels) * 100;
  const xpEarned = 0;
  const badges = 0;
  const sessions = 0;

  return (
    <div className="min-h-screen bg-cream">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-coral/5 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-80 h-80 bg-yellow/10 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-1/3 w-72 h-72 bg-teal/5 rounded-full blur-3xl" />
      </div>

      {/* Top Bar */}
      <header className="relative py-4 px-6 md:px-12 border-b border-charcoal/10 bg-cream/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo on left */}
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
              <PraxyMascot size={36} waving={false} />
              <span className="font-nunito font-700 text-xl text-coral">Praxy</span>
            </div>
          </Link>

          {/* Stats on right */}
          <div className="flex items-center gap-4 md:gap-6">
            <div className="flex items-center gap-2 bg-white/70 px-4 py-2 rounded-full shadow-warm">
              <span className="text-lg">⭐</span>
              <span className="font-inter font-600 text-charcoal text-sm md:text-base">450 XP</span>
            </div>
            <div className="flex items-center gap-2 bg-white/70 px-4 py-2 rounded-full shadow-warm">
              <span className="text-lg">🔥</span>
              <span className="font-inter font-600 text-charcoal text-sm md:text-base">3 day streak</span>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="relative py-8 md:py-12 px-6 md:px-12 lg:px-20">
        <div className="max-w-4xl mx-auto">
          
          {/* Praxy Greeting Card */}
          <div className="mb-10 opacity-0 animate-fade-in-up">
            <div className="flex items-center gap-4 md:gap-6">
              {/* Mascot Avatar */}
              <div className="flex-shrink-0">
                <PraxyMascot size={48} waving={false} />
              </div>
              
              {/* Speech Bubble */}
              <div className="relative flex-1">
                <div className="gradient-coral rounded-[16px] p-4 md:p-5 shadow-warm">
                  <p className="font-inter font-500 text-white text-base md:text-lg">
                    Hey! Ready to decode some balance sheets today?
                  </p>
                </div>
                {/* Speech bubble arrow */}
                <div 
                  className="absolute left-0 top-1/2 -translate-x-2 -translate-y-1/2 w-0 h-0"
                  style={{
                    borderTop: '8px solid transparent',
                    borderBottom: '8px solid transparent',
                    borderRight: '10px solid #FF6B6B',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Balance Sheet Mastery Card - Main CTA */}
          <div className="mb-10 opacity-0 animate-fade-in-up delay-200">
            <div className="bg-white rounded-[16px] p-6 md:p-8 shadow-warm hover:shadow-warm-lg transition-all duration-300">
              {/* Header row */}
              <div className="flex items-start gap-4 mb-6">
                <div className="text-5xl md:text-6xl">📊</div>
                <div className="flex-1">
                  <h2 className="font-nunito font-800 text-2xl md:text-3xl text-charcoal mb-2">
                    Balance Sheet Mastery
                  </h2>
                  <p className="font-inter font-400 text-charcoal/70 text-base md:text-lg">
                    Learn to read financial statements in 10 levels
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-inter font-600 text-charcoal text-sm">
                    Level {currentLevel}/{totalLevels}
                  </span>
                  <span className="font-inter font-500 text-charcoal/60 text-sm">
                    {progressPercent.toFixed(0)}% complete
                  </span>
                </div>
                <div className="h-3 bg-charcoal/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full gradient-coral rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex flex-wrap gap-4 md:gap-6 mb-8 py-4 border-t border-b border-charcoal/10">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⭐</span>
                  <span className="font-inter font-500 text-charcoal/80">{xpEarned} XP earned</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏆</span>
                  <span className="font-inter font-500 text-charcoal/80">{badges} badges</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">📚</span>
                  <span className="font-inter font-500 text-charcoal/80">{sessions} sessions</span>
                </div>
              </div>

              {/* CTA Button */}
              <Link href="/balance-sheet">
                <button className="w-full md:w-auto gradient-coral text-white font-inter font-600 text-lg px-8 py-4 rounded-[8px] shadow-warm hover:shadow-warm-lg transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98]">
                  Start Learning →
                </button>
              </Link>
            </div>
          </div>

          {/* Coming Soon Section */}
          <div className="opacity-0 animate-fade-in-up delay-400">
            <h3 className="font-nunito font-700 text-xl text-charcoal/70 mb-4 text-center">
              More coming soon...
            </h3>
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              <ComingSoonCard
                emoji="📞"
                title="Cold Call Hero"
              />
              <ComingSoonCard
                emoji="🔍"
                title="RCA Detective"
              />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;
