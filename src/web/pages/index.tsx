import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/clerk-react";

// Asset paths
const LOGO_PLAIN = "./b410fb24-613a-4b49-9715-bc63abde36c6.png";
const VIDEO_ANIMATION = "./9ed78f3e-e99f-45c1-a3f3-48154d28c334.mp4";

// Practice arena data with routes
const ARENAS = [
  {
    badge: "LIVE",
    category: "Finance & Accounting",
    icon: "📊",
    title: "SheetSmart",
    tagline: "Breakdown and understand balance sheets",
    description: "Learn to read financial statements like a pro. 10 levels from current ratio basics to full company analysis.",
    tags: ["Tesla", "Zomato", "FailCorp"],
    levels: "10 Levels",
    borderColor: "border-l-coral",
    categoryColor: "text-teal",
    route: "/balance-sheet",
  },
  {
    badge: "LIVE",
    category: "Sales & Communication",
    icon: "📞",
    title: "I Will Find You",
    tagline: "Master the art of cold calling",
    description: "Practice sales conversations with AI voice roleplay. Real scenarios, realistic personas, instant feedback.",
    tags: ["Stripe", "Shopify", "Startups"],
    levels: "5 Levels",
    borderColor: "border-l-teal",
    categoryColor: "text-coral",
    route: "/cold-call",
  },
  {
    badge: "LIVE",
    category: "Consulting & Case Prep",
    icon: "🔍",
    title: "Get to the Bottom",
    tagline: "Crack root cause analysis like a consultant",
    description: "Master RCA with real startup scenarios. 5 Whys, Fishbone diagrams, data requests — the full toolkit.",
    tags: ["DAU Drops", "Revenue Dips", "Churn Spikes"],
    levels: "5 Levels",
    borderColor: "border-l-yellow",
    categoryColor: "text-teal",
    route: "/rca",
  },
];

const COMING_SOON = [
  { icon: "💼", title: "Case Interview Prep", status: "In Development" },
  { icon: "📈", title: "Financial Modeling", status: "Planned" },
  { icon: "🎤", title: "Pitch Perfect", status: "Planned" },
  { icon: "📊", title: "SQL for PMs", status: "Gathering Interest" },
];

const WHY_PRAXY = [
  { icon: "🏢", title: "He coaches you", description: "Praxy starts with scenarios, reasons with you to understand your learning style and helps you find your strong areas." },
  { icon: "🤖", title: "Relatable Data", description: "Paste URLs, upload documents, or choose from 1000+ preloaded real-world data sets for easy learning." },
  { icon: "🌙", title: "Always Available", description: "2 AM before an interview? Praxy's ready. Practice whenever you need, as much as you need." },
];

function Index() {
  const [showNav, setShowNav] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    skill: "",
    category: "",
    reason: "",
  });
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const heroBottom = heroRef.current.getBoundingClientRect().bottom;
        setShowNav(heroBottom < 0);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Thank you for your request! We'll review it soon.");
    setFormData({ name: "", email: "", skill: "", category: "", reason: "" });
  };

  const scrollToArenas = () => {
    document.getElementById("arenas")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Sticky Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 h-[60px] bg-white/90 backdrop-blur-md border-b border-charcoal/10 transition-all duration-300 ${
          showNav ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <img src={LOGO_PLAIN} alt="Praxy" className="h-8" />
          <div className="flex items-center gap-6">
            <a href="#arenas" className="text-charcoal/70 hover:text-charcoal text-sm font-medium transition-colors">
              Practice Arenas
            </a>
            <a href="#request" className="text-charcoal/70 hover:text-charcoal text-sm font-medium transition-colors">
              Request Course
            </a>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-charcoal/70 hover:text-charcoal text-sm font-medium transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="praxy-gradient text-white px-5 py-2 rounded-full text-sm font-semibold hover:scale-[1.02] transition-transform">
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <button className="praxy-gradient text-white px-5 py-2 rounded-full text-sm font-semibold hover:scale-[1.02] transition-transform">
                  Dashboard
                </button>
              </Link>
              <UserButton appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="min-h-screen bg-cream flex flex-col">
        {/* Hero Header */}
        <header className="py-4 px-6 md:px-12">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={LOGO_PLAIN} alt="Praxy" className="h-10" />
              <span className="font-nunito font-700 text-xl text-coral">Praxy</span>
            </div>
            <div className="flex items-center gap-3">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="font-inter font-500 text-charcoal hover:text-coral transition-all duration-300 px-4 py-2 hover:scale-105">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="gradient-coral text-white font-inter font-600 px-5 py-2 rounded-[8px] shadow-warm hover:shadow-warm-lg transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98]">
                    Sign Up
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard">
                  <button className="font-inter font-500 text-charcoal hover:text-coral transition-colors px-4 py-2">
                    Dashboard
                  </button>
                </Link>
                <UserButton appearance={{ elements: { avatarBox: "w-10 h-10" } }} />
              </SignedIn>
            </div>
          </div>
        </header>

        <div className="flex-1 flex items-center">
          <div className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Column */}
            <div className="order-2 lg:order-1">
              <h1
                className="text-[clamp(2.5rem,6vw,5rem)] font-extrabold text-charcoal leading-[1.1] tracking-tight animate-fade-in-up"
                style={{ fontFamily: "var(--font-nunito)" }}
              >
                So what if it's rocket science?!
              </h1>
              <p
                className="text-[clamp(1.5rem,3vw,2.5rem)] font-semibold text-coral mt-4 animate-fade-in-up animate-delay-200"
                style={{ fontFamily: "var(--font-nunito)" }}
              >
                We'll learn it together.
              </p>
              <p className="text-lg text-charcoal/80 mt-6 max-w-xl leading-relaxed animate-fade-in-up animate-delay-400">
                Praxy is your AI practice buddy for business skills. Master finance, ace cold calls, crack cases — with real company data, instant feedback, and zero judgment.
              </p>
              <div className="flex flex-wrap gap-4 mt-8 animate-fade-in-up animate-delay-500">
                <SignedOut>
                  <SignUpButton mode="modal">
                    <button className="praxy-gradient text-white px-8 py-4 rounded-full font-bold text-lg hover:scale-[1.02] transition-transform shadow-lg shadow-coral/25">
                      Start Practicing Free →
                    </button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <Link href="/dashboard">
                    <button className="praxy-gradient text-white px-8 py-4 rounded-full font-bold text-lg hover:scale-[1.02] transition-transform shadow-lg shadow-coral/25">
                      Start Practicing Free →
                    </button>
                  </Link>
                </SignedIn>
                <button
                  onClick={scrollToArenas}
                  className="text-teal font-semibold text-lg hover:underline underline-offset-4 px-4 py-4"
                >
                  See what you can practice ↓
                </button>
              </div>
            </div>

            {/* Right Column */}
            <div className="order-1 lg:order-2 flex flex-col items-center animate-fade-in animate-delay-300">
              <div className="relative w-full max-w-md">
                <div className="video-diffuse">
                  <video
                    src={VIDEO_ANIMATION}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="h-[60px] bg-white flex items-center justify-center border-y border-charcoal/10">
        <p className="text-sm font-medium text-charcoal/70 text-center px-6">
          Built for B-school students & aspirants • Real company data with 100+ examples • Powered by AI
        </p>
      </section>

      {/* Practice Arenas Section */}
      <section id="arenas" className="py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2
              className="text-4xl font-bold text-charcoal"
              style={{ fontFamily: "var(--font-nunito)" }}
            >
              Choose your practice arena
            </h2>
            <p className="text-charcoal/70 mt-4 text-lg">
              Three simulators. Real skills. Start practicing now.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ARENAS.map((arena, idx) => (
              <Link key={idx} href={arena.route}>
                <div
                  className={`bg-white rounded-xl p-6 border-l-4 ${arena.borderColor} shadow-lg shadow-charcoal/5 transition-lift hover:shadow-xl hover:scale-[1.01] cursor-pointer h-full`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-mint text-white text-xs font-bold px-3 py-1 rounded-full">
                      {arena.badge}
                    </span>
                    <span className={`text-sm font-medium ${arena.categoryColor}`}>
                      {arena.category}
                    </span>
                  </div>
                  <div className="text-5xl mb-4">{arena.icon}</div>
                  <h3
                    className="text-2xl font-bold text-charcoal"
                    style={{ fontFamily: "var(--font-nunito)" }}
                  >
                    {arena.title}
                  </h3>
                  <p className="text-charcoal/80 font-medium mt-1">{arena.tagline}</p>
                  <p className="text-charcoal/60 text-sm mt-3 leading-relaxed">
                    {arena.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {arena.tags.map((tag, i) => (
                      <span key={i} className="text-xs bg-charcoal/5 text-charcoal/70 px-3 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-charcoal/10">
                    <span
                      className="text-sm font-semibold text-charcoal/70"
                      style={{ fontFamily: "var(--font-space)" }}
                    >
                      {arena.levels}
                    </span>
                    <span className="text-coral font-semibold text-sm hover:underline underline-offset-4">
                      Start Practicing →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section id="request" className="py-24 bg-gradient-to-br from-teal/5 to-transparent">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2
              className="text-4xl font-bold text-charcoal"
              style={{ fontFamily: "var(--font-nunito)" }}
            >
              More practice arenas coming soon
            </h2>
            <p className="text-charcoal/70 mt-4 text-lg">
              We're building simulators for every skill that matters. Tell us what you need.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {COMING_SOON.map((item, idx) => (
              <div
                key={idx}
                className="bg-white/60 border-2 border-dashed border-charcoal/20 rounded-xl p-5 text-center"
              >
                <div className="text-3xl mb-2">{item.icon}</div>
                <h4 className="font-semibold text-charcoal text-sm">{item.title}</h4>
                <span className="text-xs text-charcoal/50 mt-1 block">{item.status}</span>
              </div>
            ))}
          </div>

          {/* Course Request Form */}
          <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-xl shadow-charcoal/10 p-8">
            <h3
              className="text-2xl font-bold text-charcoal text-center"
              style={{ fontFamily: "var(--font-nunito)" }}
            >
              Can't find what you're looking for?
            </h3>
            <p className="text-charcoal/60 text-center mt-2 mb-6">
              Request a practice course and we'll prioritize based on demand.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Your name"
                value={formData.name}
                onChange={handleFormChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-charcoal/20 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all"
              />
              <input
                type="email"
                name="email"
                placeholder="Your email"
                value={formData.email}
                onChange={handleFormChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-charcoal/20 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all"
              />
              <input
                type="text"
                name="skill"
                placeholder="Skill you want to practice"
                value={formData.skill}
                onChange={handleFormChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-charcoal/20 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all"
              />
              <select
                name="category"
                value={formData.category}
                onChange={handleFormChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-charcoal/20 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-charcoal/70"
              >
                <option value="">Select a category</option>
                <option value="finance">Finance & Accounting</option>
                <option value="sales">Sales & Communication</option>
                <option value="consulting">Consulting & Case Prep</option>
                <option value="technical">Technical Skills</option>
                <option value="leadership">Leadership & Management</option>
                <option value="other">Other</option>
              </select>
              <textarea
                name="reason"
                placeholder="Why is this important to you? (optional)"
                value={formData.reason}
                onChange={handleFormChange}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-charcoal/20 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all resize-none"
              />
              <button
                type="submit"
                className="w-full bg-teal text-white py-4 rounded-lg font-semibold hover:bg-teal/90 hover:scale-[1.02] transition-all"
              >
                Submit Request →
              </button>
            </form>
            <p className="text-xs text-charcoal/50 text-center mt-4">
              We read every request. Popular courses get built first.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2
            className="text-4xl font-bold text-charcoal text-center mb-16"
            style={{ fontFamily: "var(--font-nunito)" }}
          >
            Learning that actually sticks
          </h2>

          {/* Desktop Circular Layout */}
          <div className="hidden lg:block relative max-w-3xl mx-auto">
            <svg
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px]"
              viewBox="0 0 420 420"
              fill="none"
            >
              <defs>
                <marker id="arrowCoral" markerWidth="12" markerHeight="12" refX="6" refY="6" orient="auto">
                  <path d="M2,2 L10,6 L2,10 L4,6 Z" fill="#FF6B6B" />
                </marker>
                <marker id="arrowTeal" markerWidth="12" markerHeight="12" refX="6" refY="6" orient="auto">
                  <path d="M2,2 L10,6 L2,10 L4,6 Z" fill="#2A9D8F" />
                </marker>
                <marker id="arrowYellow" markerWidth="12" markerHeight="12" refX="6" refY="6" orient="auto">
                  <path d="M2,2 L10,6 L2,10 L4,6 Z" fill="#FFD166" />
                </marker>
                <marker id="arrowMint" markerWidth="12" markerHeight="12" refX="6" refY="6" orient="auto">
                  <path d="M2,2 L10,6 L2,10 L4,6 Z" fill="#06D6A0" />
                </marker>
              </defs>
              <path d="M 210 40 A 170 170 0 0 1 370 180" stroke="#FF6B6B" strokeWidth="3" strokeDasharray="8 6" fill="none" markerEnd="url(#arrowCoral)" />
              <path d="M 380 210 A 170 170 0 0 1 250 375" stroke="#2A9D8F" strokeWidth="3" strokeDasharray="8 6" fill="none" markerEnd="url(#arrowTeal)" />
              <path d="M 170 375 A 170 170 0 0 1 40 240" stroke="#FFD166" strokeWidth="3" strokeDasharray="8 6" fill="none" markerEnd="url(#arrowYellow)" />
              <path d="M 40 180 A 170 170 0 0 1 170 45" stroke="#06D6A0" strokeWidth="3" strokeDasharray="8 6" fill="none" markerEnd="url(#arrowMint)" />
            </svg>

            <div className="relative h-[520px]">
              {/* Learn - Top */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center text-center group">
                <div className="w-24 h-24 bg-cream rounded-full flex items-center justify-center text-4xl border-4 border-coral shadow-lg shadow-coral/20 group-hover:scale-110 transition-transform">📖</div>
                <span className="text-coral font-bold text-lg mt-3" style={{ fontFamily: "var(--font-space)" }}>01</span>
                <h4 className="text-lg font-bold text-charcoal" style={{ fontFamily: "var(--font-nunito)" }}>Learn</h4>
                <p className="text-charcoal/60 text-sm mt-1 max-w-[150px]">Bite-sized visual concepts. No boring lectures.</p>
              </div>

              {/* Practice - Right */}
              <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-8 flex flex-col items-center text-center group">
                <div className="w-24 h-24 bg-cream rounded-full flex items-center justify-center text-4xl border-4 border-teal shadow-lg shadow-teal/20 group-hover:scale-110 transition-transform">🎯</div>
                <span className="text-teal font-bold text-lg mt-3" style={{ fontFamily: "var(--font-space)" }}>02</span>
                <h4 className="text-lg font-bold text-charcoal" style={{ fontFamily: "var(--font-nunito)" }}>Practice</h4>
                <p className="text-charcoal/60 text-sm mt-1 max-w-[150px]">Real scenarios with real company data.</p>
              </div>

              {/* Get Feedback - Bottom */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center text-center group">
                <p className="text-charcoal/60 text-sm mb-1 max-w-[150px]">Instant, personalized. Zero judgment.</p>
                <h4 className="text-lg font-bold text-charcoal" style={{ fontFamily: "var(--font-nunito)" }}>Get Feedback</h4>
                <span className="text-yellow font-bold text-lg mb-3" style={{ fontFamily: "var(--font-space)" }}>03</span>
                <div className="w-24 h-24 bg-cream rounded-full flex items-center justify-center text-4xl border-4 border-yellow shadow-lg shadow-yellow/20 group-hover:scale-110 transition-transform">✅</div>
              </div>

              {/* Level Up - Left */}
              <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-8 flex flex-col items-center text-center group">
                <div className="w-24 h-24 bg-cream rounded-full flex items-center justify-center text-4xl border-4 border-mint shadow-lg shadow-mint/20 group-hover:scale-110 transition-transform">📈</div>
                <span className="text-mint font-bold text-lg mt-3" style={{ fontFamily: "var(--font-space)" }}>04</span>
                <h4 className="text-lg font-bold text-charcoal" style={{ fontFamily: "var(--font-nunito)" }}>Level Up</h4>
                <p className="text-charcoal/60 text-sm mt-1 max-w-[150px]">Track progress. Earn badges. Build confidence.</p>
              </div>

              {/* Center */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-gradient-to-br from-coral/10 to-teal/10 rounded-full flex items-center justify-center">
                  <span className="text-3xl">🔄</span>
                </div>
                <span className="text-charcoal/50 text-xs mt-2 font-medium">Repeat</span>
              </div>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden">
            <div className="relative pl-8">
              <div className="absolute left-[27px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-coral via-teal via-yellow to-mint" />
              <div className="absolute -top-2 left-[19px] text-coral text-lg">↓</div>
              <div className="space-y-10">
                {[
                  { step: "01", icon: "📖", title: "Learn", description: "Bite-sized visual concepts. No boring lectures.", borderColor: "border-coral", textColor: "text-coral" },
                  { step: "02", icon: "🎯", title: "Practice", description: "Real scenarios with real company data.", borderColor: "border-teal", textColor: "text-teal" },
                  { step: "03", icon: "✅", title: "Get Feedback", description: "Instant, personalized. Zero judgment.", borderColor: "border-yellow", textColor: "text-yellow" },
                  { step: "04", icon: "📈", title: "Level Up", description: "Track progress. Earn badges. Build confidence.", borderColor: "border-mint", textColor: "text-mint" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className={`w-14 h-14 bg-cream rounded-full flex items-center justify-center text-2xl border-4 ${item.borderColor} shrink-0 shadow-lg`}>
                      {item.icon}
                    </div>
                    <div className="pt-2">
                      <span className={`${item.textColor} font-bold text-sm`} style={{ fontFamily: "var(--font-space)" }}>{item.step}</span>
                      <h4 className="text-lg font-bold text-charcoal" style={{ fontFamily: "var(--font-nunito)" }}>{item.title}</h4>
                      <p className="text-charcoal/60 text-sm mt-1">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center gap-2 ml-2">
                <div className="w-10 h-10 bg-coral/10 rounded-full flex items-center justify-center text-lg">🔄</div>
                <span className="text-charcoal/60 text-sm font-medium">Then repeat — every cycle makes you stronger</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Praxy Section */}
      <section className="py-24 bg-gradient-to-br from-coral/5 to-transparent">
        <div className="max-w-7xl mx-auto px-6">
          <h2
            className="text-4xl font-bold text-charcoal text-center mb-16"
            style={{ fontFamily: "var(--font-nunito)" }}
          >
            Why practice with Praxy?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {WHY_PRAXY.map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="text-5xl mb-4">{item.icon}</div>
                <h4 className="text-xl font-bold text-charcoal mb-3" style={{ fontFamily: "var(--font-nunito)" }}>{item.title}</h4>
                <p className="text-charcoal/60 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Praxy Speaks Section */}
      <section className="py-24 bg-white">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <img src={LOGO_PLAIN} alt="Praxy" className="h-20 mx-auto mb-8" />
          <div className="praxy-gradient text-white p-8 rounded-2xl relative speech-bubble">
            <p className="text-lg leading-relaxed font-medium">
              "I'm not here to judge you. My goal is to help you get comfortable with picking up any topic and acing them through practice sessions."
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-charcoal">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2
            className="text-4xl font-bold text-white mb-4"
            style={{ fontFamily: "var(--font-nunito)" }}
          >
            Ready to practice?
          </h2>
          <p className="text-white/70 text-lg mb-10">
            Pick an arena. Start now. It's free.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {ARENAS.map((arena, idx) => (
              <Link key={idx} href={arena.route}>
                <button className="border-2 border-coral text-coral px-6 py-3 rounded-full font-semibold hover:bg-coral hover:text-white transition-all hover:scale-[1.02]">
                  {arena.title} →
                </button>
              </Link>
            ))}
          </div>

          <SignedOut>
            <SignUpButton mode="modal">
              <button className="praxy-gradient text-white px-10 py-5 rounded-full font-bold text-xl hover:scale-[1.02] transition-transform shadow-lg shadow-coral/30">
                Sign Up & Start →
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard">
              <button className="praxy-gradient text-white px-10 py-5 rounded-full font-bold text-xl hover:scale-[1.02] transition-transform shadow-lg shadow-coral/30">
                Go to Dashboard →
              </button>
            </Link>
          </SignedIn>

          <p className="text-white/50 text-sm mt-6">
            No signup required to try Level 1
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[#1a3a47]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <img src={LOGO_PLAIN} alt="Praxy" className="h-8" />
            <div className="flex flex-wrap justify-center gap-6">
              <a href="#" className="text-white/60 hover:text-white text-sm transition-colors">About</a>
              <a href="#" className="text-white/60 hover:text-white text-sm transition-colors">Privacy</a>
              <a href="#" className="text-white/60 hover:text-white text-sm transition-colors">Contact</a>
              <a href="#request" className="text-white/60 hover:text-white text-sm transition-colors">Request a Course</a>
            </div>
          </div>
          <div className="text-center mt-8 pt-8 border-t border-white/10">
            <p className="text-white/40 text-sm">
              Built for Runable x ElevenLabs Hackathon 2026
            </p>
            <p className="text-white/30 text-xs mt-2">
              © 2026 Praxy
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Index;
