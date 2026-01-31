import { Link, useParams, useLocation } from 'wouter';
import { FiArrowLeft, FiPhone, FiTarget, FiUser, FiBriefcase, FiZap, FiAlertCircle, FiShield } from 'react-icons/fi';
import PraxyAvatar from '../components/ui/PraxyAvatar';
import SpeechBubble from '../components/ui/SpeechBubble';

const ColdCallBriefing = () => {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="py-4 px-6 md:px-12 bg-cream/80 backdrop-blur-sm border-b border-charcoal/5">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/cold-call">
            <button className="p-2 hover:bg-charcoal/5 rounded-lg transition-colors">
              <FiArrowLeft className="w-5 h-5 text-charcoal" />
            </button>
          </Link>
          <div>
            <h1 className="font-nunito font-700 text-xl text-charcoal">Call Briefing</h1>
            <p className="font-inter text-sm text-charcoal/60">Level 1 — The Skeptical CISO</p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="py-8 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          {/* Praxy encouragement */}
          <div className="flex items-start gap-4 mb-8">
            <PraxyAvatar size={70} expression="encouraging" animate />
            <SpeechBubble size="md" className="flex-1 max-w-md">
              <p className="font-inter text-charcoal">
                This is a tough one — you're calling a CISO who talks to security vendors all day. Read the brief, know your differentiators, and lead with his pain points, not your features. Let's go! 💪
              </p>
            </SpeechBubble>
          </div>

          {/* YOUR ROLE */}
          <div className="bg-white rounded-[16px] p-6 shadow-warm mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-coral/10 flex items-center justify-center">
                <FiShield className="w-5 h-5 text-coral" />
              </div>
              <h2 className="font-nunito font-700 text-lg text-charcoal">Your Role</h2>
            </div>
            <p className="font-inter text-charcoal/80 leading-relaxed mb-3">
              You are <span className="font-600 text-charcoal">a Sales Rep at SecureShield</span>, selling <span className="font-600 text-charcoal">SecureShield Pro</span> — an enterprise cybersecurity platform with AI-powered threat detection, compliance automation, and vendor risk management.
            </p>
            <div className="bg-cream rounded-lg p-4 space-y-2">
              <p className="font-inter text-sm text-charcoal/70"><span className="font-600 text-charcoal">Your company:</span> SecureShield</p>
              <p className="font-inter text-sm text-charcoal/70"><span className="font-600 text-charcoal">Product:</span> SecureShield Pro — Enterprise cybersecurity platform</p>
              <p className="font-inter text-sm text-charcoal/70"><span className="font-600 text-charcoal">Key capabilities:</span> AI-powered threat detection, compliance automation (RBI/SOC2/ISO 27001), vendor risk management, unified security dashboard</p>
              <p className="font-inter text-sm text-charcoal/70"><span className="font-600 text-charcoal">Differentiator vs CrowdStrike:</span> SecureShield consolidates multiple tools into one platform — threat detection + compliance + vendor risk — instead of point solutions. Built-in compliance automation for Indian regulatory frameworks (RBI, SEBI).</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* THE COMPANY */}
            <div className="bg-white rounded-[16px] p-6 shadow-warm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center">
                  <FiBriefcase className="w-5 h-5 text-teal" />
                </div>
                <h2 className="font-nunito font-700 text-lg text-charcoal">The Company</h2>
              </div>
              <h3 className="font-nunito font-700 text-2xl text-charcoal mb-1">Razorpay</h3>
              <a href="https://razorpay.com" target="_blank" rel="noopener noreferrer" className="font-inter text-sm text-teal hover:underline mb-3 block">razorpay.com</a>
              <p className="font-inter text-charcoal/70 text-sm leading-relaxed">
                Razorpay is one of India's largest payment gateway companies, based in Delhi NCR with ~2,500 employees. They handle billions in transactions and are subject to strict RBI compliance requirements. As a fintech, security is existential — a breach would be catastrophic for trust.
              </p>
            </div>

            {/* THE PROSPECT */}
            <div className="bg-white rounded-[16px] p-6 shadow-warm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-coral/10 flex items-center justify-center">
                  <FiUser className="w-5 h-5 text-coral" />
                </div>
                <h2 className="font-nunito font-700 text-lg text-charcoal">The Prospect</h2>
              </div>
              <h3 className="font-nunito font-700 text-2xl text-charcoal mb-1">Rajesh Menon</h3>
              <p className="font-inter text-sm text-charcoal/60 mb-3">Chief Information Security Officer (CISO)</p>
              <div className="bg-yellow/10 rounded-lg p-3">
                <p className="font-inter text-sm text-charcoal/80">
                  <span className="font-600">Personality:</span> Technical, risk-averse, and deeply skeptical of vendors making big claims. He needs strong proof points and values security certifications. Speaks in natural Indian English with occasional technical jargon. He's busy and won't give you time unless you earn it.
                </p>
              </div>
            </div>
          </div>

          {/* PAIN POINTS */}
          <div className="bg-white rounded-[16px] p-6 shadow-warm mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-yellow/20 flex items-center justify-center">
                <FiAlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
              <h2 className="font-nunito font-700 text-lg text-charcoal">His Pain Points — Use These</h2>
            </div>
            <p className="font-inter text-charcoal/70 text-sm mb-4 leading-relaxed">
              You've done your research on Razorpay. Here's what Rajesh is dealing with right now:
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3 bg-coral/5 rounded-lg p-3">
                <span className="text-coral font-600 mt-0.5">1.</span>
                <div>
                  <p className="font-inter text-sm font-600 text-charcoal">Recent phishing attacks targeting employees</p>
                  <p className="font-inter text-xs text-charcoal/60">Razorpay employees have been hit by targeted phishing campaigns. Rajesh needs better threat detection and employee security awareness tooling.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-coral/5 rounded-lg p-3">
                <span className="text-coral font-600 mt-0.5">2.</span>
                <div>
                  <p className="font-inter text-sm font-600 text-charcoal">RBI compliance audit in 3 months</p>
                  <p className="font-inter text-xs text-charcoal/60">A major regulatory audit is approaching. Rajesh needs to demonstrate compliance readiness and is scrambling to consolidate evidence across tools.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-coral/5 rounded-lg p-3">
                <span className="text-coral font-600 mt-0.5">3.</span>
                <div>
                  <p className="font-inter text-sm font-600 text-charcoal">Too many security tools, not enough integration</p>
                  <p className="font-inter text-xs text-charcoal/60">They use multiple point solutions (CrowdStrike, etc.) that don't talk to each other. Alert fatigue is real, and the team wastes time switching between dashboards.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-coral/5 rounded-lg p-3">
                <span className="text-coral font-600 mt-0.5">4.</span>
                <div>
                  <p className="font-inter text-sm font-600 text-charcoal">Board demanding better security metrics</p>
                  <p className="font-inter text-xs text-charcoal/60">The board wants a single dashboard showing security posture, compliance status, and risk scores — Rajesh currently stitches this together manually.</p>
                </div>
              </div>
            </div>
          </div>

          {/* OBJECTIONS TO EXPECT */}
          <div className="bg-white rounded-[16px] p-6 shadow-warm mb-6 border-l-4 border-l-yellow">
            <h2 className="font-nunito font-700 text-lg text-charcoal mb-3">⚠️ Objections He'll Likely Raise</h2>
            <p className="font-inter text-charcoal/60 text-sm mb-3">Be ready for these — he will test you:</p>
            <ul className="space-y-2">
              <li className="font-inter text-sm text-charcoal/80 flex items-start gap-2">
                <span className="text-yellow-600 mt-1">•</span>
                <span>"We already have multiple security vendors — why do we need another one?"</span>
              </li>
              <li className="font-inter text-sm text-charcoal/80 flex items-start gap-2">
                <span className="text-yellow-600 mt-1">•</span>
                <span>"How is your threat detection different from CrowdStrike?"</span>
              </li>
              <li className="font-inter text-sm text-charcoal/80 flex items-start gap-2">
                <span className="text-yellow-600 mt-1">•</span>
                <span>"Our team needs to evaluate this thoroughly — we can't just add another tool."</span>
              </li>
            </ul>
          </div>

          {/* MISSION */}
          <div className="bg-gradient-to-r from-coral to-coral/80 rounded-[16px] p-6 shadow-warm mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <FiTarget className="w-5 h-5 text-white" />
              </div>
              <h2 className="font-nunito font-700 text-lg text-white">Your Mission</h2>
            </div>
            <p className="font-nunito font-700 text-2xl text-white mb-2">
              Get Rajesh to agree to a technical demo with his security team.
            </p>
            <p className="font-inter text-white/80 text-sm">
              He won't say yes easily. You need to demonstrate that you understand his specific problems (not just generic security talk), handle his objections with real differentiators, and give him a reason to invest 30 minutes of his team's time.
            </p>
          </div>

          {/* TIPS */}
          <div className="bg-white rounded-[16px] p-6 shadow-warm mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-yellow/20 flex items-center justify-center">
                <FiZap className="w-5 h-5 text-yellow-600" />
              </div>
              <h2 className="font-nunito font-700 text-lg text-charcoal">Tips from Praxy</h2>
            </div>
            <ul className="space-y-3">
              {[
                "Open by referencing something specific — the RBI audit or the phishing attacks. Generic openers will get you hung up on.",
                "Don't trash CrowdStrike. Position SecureShield as complementary or as a consolidation play: \"What if you could replace 3 tools with one?\"",
                "He's technical — don't oversimplify. Use terms like \"unified threat intelligence\", \"compliance automation\", \"SIEM integration\". He'll respect you more.",
                "When he objects, agree first: \"That's a fair concern...\" then pivot to your differentiator. Don't argue.",
                "Ask for a specific next step: \"Could I set up a 30-minute technical demo with you and one of your team leads next week?\" Vague asks get vague answers.",
              ].map((tip, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-teal/10 text-teal text-sm font-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="font-inter text-charcoal/80 text-sm">{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Start call button */}
          <div className="flex justify-center">
            <button
              onClick={() => navigate(`/cold-call/${scenarioId}/call`)}
              className="gradient-coral text-white font-inter font-600 text-lg px-10 py-4 rounded-[8px] shadow-warm hover:shadow-warm-lg transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-3"
            >
              <FiPhone className="w-5 h-5" />
              Start Call
            </button>
          </div>

          {/* Disclaimer */}
          <p className="text-center font-inter text-xs text-charcoal/40 mt-6">
            Your microphone will be used during the call. Make sure you're in a quiet environment.
          </p>
        </div>
      </main>
    </div>
  );
};

export default ColdCallBriefing;
