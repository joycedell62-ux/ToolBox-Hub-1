import React from 'react';
import { Link } from 'wouter';
import {
  Target, Eye, Zap, Star, Globe, Users, Wrench,
  CheckCircle, ArrowRight, Sparkles, Shield, Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ─── Stat card ────────────────────────────────────────────────────────────────

function Stat({ value, label, sub }: { value: string; label: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center text-center px-4">
      <div className="text-4xl font-black text-blue-600 mb-1">{value}</div>
      <div className="text-sm font-semibold text-gray-700">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  );
}

// ─── Value card ───────────────────────────────────────────────────────────────

function Value({ icon: Icon, title, desc, color }: { icon: React.ElementType; title: string; desc: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-start gap-4 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

// ─── Tool badge ───────────────────────────────────────────────────────────────

function ToolBadge({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-3 py-1 text-sm font-medium">
      <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
      {name}
    </span>
  );
}

// ─── About page ───────────────────────────────────────────────────────────────

export default function About() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 -mt-8 md:-mt-12 space-y-0">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-800 via-blue-700 to-blue-500 text-white px-6 py-20 md:py-28 -mx-4 sm:-mx-6 lg:-mx-8 mb-16">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-32 -left-16 w-96 h-96 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-white/3 pointer-events-none" />

        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            Our Story
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 leading-tight">
            Our Journey
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-xl mx-auto leading-relaxed">
            From a simple idea to a growing platform built for everyone — free, forever.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto space-y-20">

        {/* ── Origin story ──────────────────────────────────────────────────── */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-black text-gray-900 mb-3">Where It All Began</h2>
            <div className="w-12 h-1 bg-blue-500 rounded-full mx-auto" />
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 md:p-10 space-y-6">
            {/* Pull quote */}
            <blockquote className="relative">
              <div className="text-6xl text-blue-200 font-serif leading-none mb-2 select-none">&ldquo;</div>
              <p className="text-xl md:text-2xl font-semibold text-blue-700 leading-snug pl-2">
                What if one website could provide hundreds of useful tools for everyone — for free?
              </p>
            </blockquote>

            <p className="text-gray-600 leading-relaxed text-base md:text-lg">
              That question was the seed that became <strong className="text-gray-900">ToolBox Hub</strong>.
            </p>

            <p className="text-gray-600 leading-relaxed text-base md:text-lg">
              Today, that idea is becoming reality. With tools like the <strong className="text-gray-800">QR Code Generator</strong>,{' '}
              <strong className="text-gray-800">Certificate Generator</strong>, <strong className="text-gray-800">Resume Builder</strong>,{' '}
              <strong className="text-gray-800">Password Generator</strong>, and many more on the way — ToolBox Hub is growing into a platform
              that helps <span className="font-semibold text-blue-600">students, businesses, professionals, developers, creators,</span> and
              everyday users solve problems in seconds.
            </p>

            <p className="text-gray-600 leading-relaxed text-base md:text-lg">
              Every new tool brings us one step closer to our vision.
            </p>

            <div className="border-l-4 border-blue-500 pl-6 py-2 bg-blue-50/50 rounded-r-xl">
              <p className="text-gray-700 leading-relaxed font-medium">
                We&rsquo;re not just adding tools anymore — we&rsquo;re building a brand.<br />
                A brand built on <strong className="text-blue-700">simplicity</strong>.<br />
                A brand built on <strong className="text-blue-700">quality</strong>.<br />
                A brand built <strong className="text-blue-700">for everyone</strong>.
              </p>
            </div>

            <p className="text-gray-600 leading-relaxed text-base md:text-lg">
              Our goal is to create one of the world&rsquo;s most trusted collections of free online tools —
              with <span className="font-semibold">no sign-up required</span>, no downloads, and no unnecessary complexity.
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              {['QR Code Generator','Certificate Generator','Resume Builder','Invoice Generator',
                'Password Generator','Word Counter','BMI Calculator','Loan Calculator',
                'Age Calculator','Discount Calculator'].map(t => <ToolBadge key={t} name={t} />)}
              <span className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-400 border border-gray-100 rounded-full px-3 py-1 text-sm">
                + many more coming...
              </span>
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-2xl font-black text-gray-900">Welcome to ToolBox Hub.</p>
            <p className="text-blue-600 font-bold text-lg">Everything You Need. One Website. Free Forever.</p>
          </div>
        </section>

        {/* ── Stats ─────────────────────────────────────────────────────────── */}
        <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl py-10 px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x-0 md:divide-x divide-blue-200">
            <Stat value="13+" label="Free Tools" sub="& counting" />
            <Stat value="0" label="Sign-ups Required" sub="ever" />
            <Stat value="100%" label="Free Forever" sub="no hidden fees" />
            <Stat value="Any" label="Device" sub="phone, tablet, desktop" />
          </div>
        </section>

        {/* ── Mission ───────────────────────────────────────────────────────── */}
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-black text-gray-900 mb-3">Our Mission</h2>
            <div className="w-12 h-1 bg-blue-500 rounded-full mx-auto" />
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-blue-700 to-blue-600 rounded-3xl p-8 md:p-10 text-white">
            <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-white/8 pointer-events-none" />
            <div className="absolute -bottom-6 left-10 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
            <div className="relative flex items-start gap-5">
              <div className="shrink-0 bg-white/15 rounded-xl p-3">
                <Target className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3">Built With Purpose</h3>
                <p className="text-blue-100 text-lg leading-relaxed">
                  Our mission is to build one of the world&rsquo;s best collections of free online tools that are{' '}
                  <strong className="text-white">fast</strong>,{' '}
                  <strong className="text-white">simple</strong>,{' '}
                  <strong className="text-white">secure</strong>, and{' '}
                  <strong className="text-white">accessible from any device</strong>.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Vision ────────────────────────────────────────────────────────── */}
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-black text-gray-900 mb-3">Our Vision</h2>
            <div className="w-12 h-1 bg-blue-500 rounded-full mx-auto" />
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-blue-950 rounded-3xl p-8 md:p-10 text-white">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -translate-y-1/3 translate-x-1/3 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/8 rounded-full translate-y-1/3 -translate-x-1/3 pointer-events-none" />
            <div className="relative flex items-start gap-5">
              <div className="shrink-0 bg-blue-500/30 rounded-xl p-3">
                <Eye className="w-7 h-7 text-blue-300" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3">Where We Are Headed</h3>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Our vision is to become the <strong className="text-white">first website everyone thinks of</strong> when they need a free
                  online tool — a trusted global platform serving millions of users with{' '}
                  <strong className="text-blue-300">hundreds of tools</strong>, zero sign-up, zero cost, and zero compromise.
                </p>
                <p className="text-gray-400 text-base leading-relaxed mt-4">
                  A single destination where anyone, anywhere — a student in Lagos, a developer in Berlin, a small business owner in Manila —
                  can solve any everyday digital task in seconds.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Values ────────────────────────────────────────────────────────── */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-black text-gray-900 mb-3">What We Stand For</h2>
            <div className="w-12 h-1 bg-blue-500 rounded-full mx-auto mb-4" />
            <p className="text-gray-500 max-w-md mx-auto">Three principles guide every decision we make at ToolBox Hub.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Value
              icon={Zap}
              title="Simplicity"
              desc="Every tool should work immediately — no instructions needed. If you have to think twice, we've already failed."
              color="bg-blue-500"
            />
            <Value
              icon={Star}
              title="Quality"
              desc="We'd rather build ten excellent tools than a hundred mediocre ones. Every tool on ToolBox Hub is crafted with care."
              color="bg-indigo-500"
            />
            <Value
              icon={Globe}
              title="Accessibility"
              desc="No accounts. No payments. No downloads. Every tool works in your browser on any device, anywhere in the world."
              color="bg-cyan-500"
            />
          </div>
        </section>

        {/* ── Who we build for ──────────────────────────────────────────────── */}
        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 md:p-10 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 rounded-xl p-2">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-black text-gray-900">Built For Everyone</h2>
          </div>
          <p className="text-gray-600 leading-relaxed text-base">
            ToolBox Hub is for the student writing their first resume, the freelancer creating a professional invoice,
            the developer who needs a quick QR code, the teacher generating certificates, and the business owner who just
            needs things to work — <strong className="text-gray-900">without the friction</strong>.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {['Students','Freelancers','Developers','Businesses','Educators','Creators'].map(who => (
              <div key={who} className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3">
                <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="text-sm font-medium text-gray-700">{who}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Privacy & trust ───────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-green-50 border border-green-100 rounded-2xl p-6 flex gap-4 items-start">
            <Shield className="w-8 h-8 text-green-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Privacy First</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Your data never leaves your device. Every tool runs entirely in your browser — no servers, no tracking, no storage.
              </p>
            </div>
          </div>
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 flex gap-4 items-start">
            <Heart className="w-8 h-8 text-orange-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Free Forever</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                ToolBox Hub will always have a fully free tier. We believe access to useful tools should never depend on your ability to pay.
              </p>
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────────────── */}
        <section className="text-center space-y-4 pb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-2">
            <Wrench className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-black text-gray-900">Ready to explore?</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Browse all 13+ free tools — no account, no downloads, no strings attached.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link href="/">
              <Button size="lg" className="gap-2 px-8">
                Explore All Tools <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
