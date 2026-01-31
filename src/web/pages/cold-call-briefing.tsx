import { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'wouter';
import { FiArrowLeft, FiPhone, FiTarget, FiUser, FiBriefcase, FiZap, FiAlertCircle } from 'react-icons/fi';
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
            <p className="font-inter text-sm text-charcoal/60">Level 1 — The Gatekeeper</p>
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
                Read through the brief carefully before you dial in. Know your product, know your prospect, and lead with confidence. You've got this! 💪
              </p>
            </SpeechBubble>
          </div>

          {/* YOUR ROLE */}
          <div className="bg-white rounded-[16px] p-6 shadow-warm mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-coral/10 flex items-center justify-center">
                <FiUser className="w-5 h-5 text-coral" />
              </div>
              <h2 className="font-nunito font-700 text-lg text-charcoal">Your Role</h2>
            </div>
            <p className="font-inter text-charcoal/80 leading-relaxed mb-3">
              You are <span className="font-600 text-charcoal">a Sales Development Rep (SDR) at DevBoost</span>, a mid-stage startup that sells a <span className="font-600 text-charcoal">developer productivity platform</span>. DevBoost helps engineering teams cut code-review cycle time by 40% and reduces CI/CD pipeline failures through AI-powered insights.
            </p>
            <div className="bg-cream rounded-lg p-4 space-y-2">
              <p className="font-inter text-sm text-charcoal/70"><span className="font-600 text-charcoal">Your company:</span> DevBoost</p>
              <p className="font-inter text-sm text-charcoal/70"><span className="font-600 text-charcoal">Product:</span> AI-powered developer productivity platform</p>
              <p className="font-inter text-sm text-charcoal/70"><span className="font-600 text-charcoal">Key value props:</span> 40% faster code reviews, fewer CI/CD failures, real-time developer analytics</p>
              <p className="font-inter text-sm text-charcoal/70"><span className="font-600 text-charcoal">Pricing:</span> Starts at $12/developer/month</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* WHO YOU'RE CALLING */}
            <div className="bg-white rounded-[16px] p-6 shadow-warm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center">
                  <FiBriefcase className="w-5 h-5 text-teal" />
                </div>
                <h2 className="font-nunito font-700 text-lg text-charcoal">The Company</h2>
              </div>
              <h3 className="font-nunito font-700 text-2xl text-charcoal mb-1">Stripe</h3>
              <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" className="font-inter text-sm text-teal hover:underline mb-3 block">stripe.com</a>
              <p className="font-inter text-charcoal/70 text-sm leading-relaxed">
                Stripe is a global payments infrastructure company with 8,000+ engineers. They process billions of dollars in payments and are known for their engineering-first culture. Their engineering org moves fast and ships frequently.
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
              <h3 className="font-nunito font-700 text-2xl text-charcoal mb-1">Sarah</h3>
              <p className="font-inter text-sm text-charcoal/60 mb-3">Front Desk / Receptionist</p>
              <div className="bg-yellow/10 rounded-lg p-3">
                <p className="font-inter text-sm text-charcoal/80">
                  <span className="font-600">Personality:</span> Polite but efficient. Gets dozens of sales calls a day and is trained to screen them. She won't transfer you unless you give her a convincing reason. She's not rude — just doing her job.
                </p>
              </div>
            </div>
          </div>

          {/* WHY YOU'RE CALLING — PAIN POINTS */}
          <div className="bg-white rounded-[16px] p-6 shadow-warm mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-yellow/20 flex items-center justify-center">
                <FiAlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
              <h2 className="font-nunito font-700 text-lg text-charcoal">Why You're Calling — Pain Points to Leverage</h2>
            </div>
            <p className="font-inter text-charcoal/70 text-sm mb-4 leading-relaxed">
              You've done your research. Here's what you know about Stripe's engineering org that makes DevBoost relevant:
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3 bg-coral/5 rounded-lg p-3">
                <span className="text-coral font-600 mt-0.5">1.</span>
                <div>
                  <p className="font-inter text-sm font-600 text-charcoal">Slow code review cycles</p>
                  <p className="font-inter text-xs text-charcoal/60">With 8,000+ engineers, PRs often sit in review queues for days. DevBoost's AI reviewer can cut this by 40%.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-coral/5 rounded-lg p-3">
                <span className="text-coral font-600 mt-0.5">2.</span>
                <div>
                  <p className="font-inter text-sm font-600 text-charcoal">CI/CD pipeline reliability</p>
                  <p className="font-inter text-xs text-charcoal/60">At Stripe's scale, flaky tests and pipeline failures cost engineering hours. DevBoost flags failure patterns before they hit production.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-coral/5 rounded-lg p-3">
                <span className="text-coral font-600 mt-0.5">3.</span>
                <div>
                  <p className="font-inter text-sm font-600 text-charcoal">Developer productivity visibility</p>
                  <p className="font-inter text-xs text-charcoal/60">Engineering managers at large orgs struggle to measure team velocity without micromanaging. DevBoost gives real-time dashboards.</p>
                </div>
              </div>
            </div>
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
              Get past Sarah and get transferred to an Engineering Manager or VP of Engineering.
            </p>
            <p className="font-inter text-white/80 text-sm">
              You do NOT need to pitch the full product to Sarah. Your only goal is to say enough to convince her to connect you with someone in engineering leadership.
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
                "Don't pitch the product to the receptionist — just give enough context to sound legitimate.",
                "Use a specific name if you can (\"I'm trying to reach someone on the engineering leadership team\").",
                "Sound confident, not salesy. You're a professional with a relevant reason to call, not a cold caller reading a script.",
                "If she pushes back, try: \"I understand — could I leave a message for the VP of Engineering?\" This keeps the door open.",
                "Keep it under 30 seconds before she makes a decision. Brevity = credibility.",
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
