import { useState } from "react";
import { Link } from "wouter";
import PraxyMascot from "../components/praxy-mascot";

// Benefit Card Component
interface BenefitCardProps {
  emoji: string;
  title: string;
  description: string;
  delay: string;
}

const BenefitCard = ({ emoji, title, description, delay }: BenefitCardProps) => (
  <div 
    className={`bg-white rounded-[16px] p-6 shadow-warm hover:shadow-warm-lg transition-all duration-300 hover:-translate-y-1 opacity-0 animate-fade-in-up ${delay}`}
  >
    <div className="text-4xl mb-4">{emoji}</div>
    <h3 className="font-nunito font-700 text-xl text-charcoal mb-2">{title}</h3>
    <p className="font-inter font-400 text-muted-foreground leading-relaxed">{description}</p>
  </div>
);

// Coming Soon Card Component
interface ComingSoonCardProps {
  emoji: string;
  title: string;
  description: string;
}

const ComingSoonCard = ({ emoji, title, description }: ComingSoonCardProps) => (
  <div className="bg-white/50 rounded-[16px] p-6 border border-charcoal/10 opacity-60">
    <div className="text-3xl mb-3 grayscale">{emoji}</div>
    <h3 className="font-nunito font-700 text-lg text-charcoal/60 mb-1">{title}</h3>
    <p className="font-inter font-400 text-sm text-charcoal/40">{description}</p>
  </div>
);

const Index = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      setEmail("");
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-coral/5 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-80 h-80 bg-yellow/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/4 w-72 h-72 bg-teal/5 rounded-full blur-3xl" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-6 md:px-12 lg:px-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Mascot */}
          <div className="flex justify-center mb-8 opacity-0 animate-fade-in-up">
            <PraxyMascot size={120} waving />
          </div>

          {/* Heading */}
          <h1 className="font-nunito font-800 text-4xl md:text-5xl lg:text-[48px] text-charcoal leading-tight mb-6 opacity-0 animate-fade-in-up delay-100">
            Leetcode for Business Skills
          </h1>

          {/* Subheading */}
          <p className="font-inter font-400 text-lg md:text-xl text-charcoal/80 max-w-2xl mx-auto mb-4 opacity-0 animate-fade-in-up delay-200">
            Master balance sheets, cold calls, and root cause analysis with Praxy — your AI study buddy.
          </p>

          {/* Tagline */}
          <p className="font-inter font-500 text-lg italic text-teal mb-10 opacity-0 animate-fade-in-up delay-300">
            Even rocket science, we'll learn it together.
          </p>

          {/* CTA Button */}
          <div className="opacity-0 animate-fade-in-up delay-400">
            <Link href="/dashboard">
              <button className="gradient-coral text-white font-inter font-600 text-lg px-8 py-4 rounded-[8px] shadow-warm hover:shadow-warm-lg transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98]">
                Start with Balance Sheets →
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* What You'll Learn Section */}
      <section className="relative py-20 px-6 md:px-12 lg:px-20">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="font-nunito font-700 text-3xl md:text-4xl text-charcoal mb-4 opacity-0 animate-fade-in-up">
              Start with Balance Sheet Mastery
            </h2>
            <p className="font-inter font-400 text-lg text-charcoal/70 max-w-2xl mx-auto opacity-0 animate-fade-in-up delay-100">
              Learn to read financial statements like a pro. 10 levels from "Is this company alive?" to full financial health analysis.
            </p>
          </div>

          {/* Benefit Cards Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            <BenefitCard
              emoji="📊"
              title="Visual Learning"
              description="Color-coded breakdowns. See the health of a company at a glance."
              delay="delay-200"
            />
            <BenefitCard
              emoji="🎮"
              title="Gamified Progress"
              description="10 levels, badges, and XP. Learning that actually sticks."
              delay="delay-300"
            />
            <BenefitCard
              emoji="🏢"
              title="Real Companies"
              description="Practice with Tesla, Zomato, and more. Not boring textbook examples."
              delay="delay-400"
            />
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="relative py-20 px-6 md:px-12 lg:px-20 bg-gradient-to-b from-transparent to-white/30">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-10">
            <h2 className="font-nunito font-700 text-2xl md:text-3xl text-charcoal/80 mb-2">
              More simulators coming soon:
            </h2>
          </div>

          {/* Coming Soon Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <ComingSoonCard
              emoji="📞"
              title="Cold Call Hero"
              description="Practice selling to real companies"
            />
            <ComingSoonCard
              emoji="🔍"
              title="RCA Detective"
              description="Solve metric drops like a PM"
            />
          </div>

          {/* Waitlist Form */}
          <div className="text-center">
            <p className="font-inter font-500 text-charcoal/70 mb-4">
              Join the waitlist
            </p>
            
            {!isSubmitted ? (
              <form 
                onSubmit={handleWaitlistSubmit}
                className="flex flex-col sm:flex-row gap-3 justify-center items-center max-w-md mx-auto"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full sm:w-auto flex-1 px-5 py-3 rounded-[8px] bg-white border border-charcoal/10 text-charcoal font-inter placeholder:text-charcoal/40 focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral transition-all shadow-warm"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 bg-teal text-white font-inter font-600 rounded-[8px] hover:bg-teal/90 transition-all shadow-warm hover:shadow-warm-lg"
                >
                  Notify me
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-center gap-2 text-mint font-inter font-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                You're on the list! We'll notify you soon.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-6 md:px-12 lg:px-20 border-t border-charcoal/10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <PraxyMascot size={32} waving={false} />
            <span className="font-nunito font-700 text-xl text-charcoal">Praxy</span>
          </div>
          <p className="font-inter font-400 text-charcoal/60 mb-2">
            Built with <span className="text-coral">❤️</span> for Runable x ElevenLabs Hackathon
          </p>
          <p className="font-inter font-400 text-sm text-charcoal/40">
            © 2026 Praxy
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
