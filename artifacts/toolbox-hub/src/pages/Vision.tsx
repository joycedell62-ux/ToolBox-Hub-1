import React from 'react';
import { Link } from 'wouter';
import { Rocket, Globe2, Users, Sparkles } from 'lucide-react';

export default function Vision() {
  return (
    <div className="max-w-3xl mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center bg-blue-100 text-blue-600 p-3 rounded-2xl mb-4">
          <Globe2 className="w-7 h-7" aria-hidden="true" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Our Vision</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-10 space-y-6 text-gray-700 leading-relaxed">
        <p className="text-lg font-medium text-gray-900">
          We believe powerful online tools should be simple, fast, and accessible to everyone.
        </p>
        <p>
          Our vision is to build one of the world's most trusted platforms for free online
          tools—helping students, professionals, businesses, creators, developers, and everyday
          users save time and accomplish more.
        </p>
        <p>Every new tool is another step toward making that vision a reality.</p>

        <div className="grid sm:grid-cols-3 gap-4 pt-2">
          <div className="rounded-xl bg-blue-50 p-4 text-center">
            <Users className="w-5 h-5 text-blue-600 mx-auto mb-2" aria-hidden="true" />
            <p className="text-sm font-semibold text-gray-900">For everyone</p>
            <p className="text-xs text-gray-500 mt-1">No sign-up, no paywalls</p>
          </div>
          <div className="rounded-xl bg-blue-50 p-4 text-center">
            <Sparkles className="w-5 h-5 text-blue-600 mx-auto mb-2" aria-hidden="true" />
            <p className="text-sm font-semibold text-gray-900">Always improving</p>
            <p className="text-xs text-gray-500 mt-1">New tools added regularly</p>
          </div>
          <div className="rounded-xl bg-blue-50 p-4 text-center">
            <Globe2 className="w-5 h-5 text-blue-600 mx-auto mb-2" aria-hidden="true" />
            <p className="text-sm font-semibold text-gray-900">Private by design</p>
            <p className="text-xs text-gray-500 mt-1">Everything runs in your browser</p>
          </div>
        </div>

        <div className="text-center pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            <Rocket className="w-4 h-4" aria-hidden="true" />
            Explore Our Tools
          </Link>
        </div>
      </div>
    </div>
  );
}
