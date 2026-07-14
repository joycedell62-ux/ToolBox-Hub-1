import React, { useState } from 'react';
import { Building2, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Copy, Check, RefreshCw } from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'How does this generator create names?', a: 'It combines curated prefixes, suffixes, and industry words with any keyword you enter, using randomized blending logic so every regenerate produces fresh combinations.' },
  { q: 'Are these names available to register?', a: 'This tool only generates ideas — it does not check domain, trademark, or business-registry availability. Always verify a name yourself before using it.' },
  { q: 'Do I need to enter a keyword?', a: 'No. A keyword makes results more personal, but you can generate industry-flavored names without one.' },
  { q: 'Can I use these names commercially?', a: 'The generated words are common terms, but you are responsible for confirming a name is free of trademark and legal conflicts in your region.' },
  { q: 'Why do I get different names each time?', a: 'The generator randomly samples from large word banks and blend patterns, so pressing Generate again reshuffles the ideas.' },
];

const RELATED = [
  { label: 'Slogan Generator', href: '/slogan-generator' },
  { label: 'Brand Name Generator', href: '/brand-name-generator' },
  { label: 'Username Generator', href: '/username-generator' },
  { label: 'Mission Statement Generator', href: '/mission-statement-generator' },
];

const INDUSTRIES: Record<string, { prefixes: string[]; suffixes: string[]; words: string[] }> = {
  tech: {
    prefixes: ['Nova', 'Byte', 'Data', 'Cloud', 'Logic', 'Pixel', 'Cyber', 'Quantum', 'Neural', 'Vertex', 'Core', 'Stack', 'Grid', 'Node', 'Sync'],
    suffixes: ['Labs', 'Systems', 'Works', 'Technologies', 'Digital', 'Solutions', 'Soft', 'Hub', 'Forge', 'Wave', 'Sphere', 'Dynamics', 'Networks', 'Studio', 'IQ'],
    words: ['Circuit', 'Signal', 'Vector', 'Matrix', 'Cortex', 'Nexus', 'Pulse', 'Beacon', 'Orbit', 'Fusion', 'Photon', 'Kernel', 'Cipher', 'Relay', 'Spark'],
  },
  food: {
    prefixes: ['Fresh', 'Golden', 'Rustic', 'Savory', 'Urban', 'Little', 'Green', 'Wild', 'Sweet', 'Hearty', 'Crispy', 'Bold', 'Cozy', 'Sunny', 'Homely'],
    suffixes: ['Kitchen', 'Table', 'Bistro', 'Eatery', 'Pantry', 'Grill', 'Bakery', 'Bites', 'Feast', 'Harvest', 'Spoon', 'Fork', 'Plate', 'Larder', 'Cafe'],
    words: ['Basil', 'Maple', 'Pepper', 'Honey', 'Olive', 'Cinnamon', 'Truffle', 'Ember', 'Garden', 'Meadow', 'Orchard', 'Copper', 'Saffron', 'Thyme', 'Citrus'],
  },
  fashion: {
    prefixes: ['Luxe', 'Vogue', 'Chic', 'Velvet', 'Noir', 'Gilded', 'Pure', 'Bold', 'Muse', 'Aura', 'Bella', 'Mode', 'Elite', 'Silk', 'Prism'],
    suffixes: ['Atelier', 'Couture', 'Threads', 'Wardrobe', 'Collective', 'Studio', 'House', 'Label', 'Boutique', 'Attire', 'Style', 'Wear', 'Closet', 'Line', 'Co'],
    words: ['Linen', 'Ivory', 'Onyx', 'Pearl', 'Amber', 'Sable', 'Ember', 'Bloom', 'Aria', 'Lush', 'Rouge', 'Grace', 'Vela', 'Lumen', 'Sienna'],
  },
  health: {
    prefixes: ['Vital', 'Pure', 'Thrive', 'Renew', 'Zen', 'Balance', 'Peak', 'Clear', 'Bright', 'Living', 'Prime', 'Nourish', 'Calm', 'Fresh', 'Active'],
    suffixes: ['Wellness', 'Health', 'Care', 'Clinic', 'Therapy', 'Vitality', 'Life', 'Med', 'Nutrition', 'Fitness', 'Recovery', 'Wellbeing', 'Rehab', 'Remedy', 'Labs'],
    words: ['Aloe', 'Pulse', 'Zenith', 'Harmony', 'Serene', 'Radiant', 'Nourish', 'Bloom', 'Willow', 'Sage', 'Verve', 'Elevate', 'Restore', 'Flourish', 'Glow'],
  },
  finance: {
    prefixes: ['Prime', 'Summit', 'Capital', 'Secure', 'Trust', 'Sterling', 'Apex', 'Bright', 'Solid', 'Noble', 'Clear', 'True', 'Vantage', 'Bold', 'First'],
    suffixes: ['Capital', 'Partners', 'Advisors', 'Financial', 'Ventures', 'Wealth', 'Holdings', 'Group', 'Fund', 'Equity', 'Assets', 'Trust', 'Bank', 'Invest', 'Capital'],
    words: ['Anchor', 'Ledger', 'Compass', 'Beacon', 'Keystone', 'Pillar', 'Vault', 'Meridian', 'Sterling', 'Legacy', 'Cornerstone', 'Horizon', 'Bedrock', 'Fortis', 'Crest'],
  },
  creative: {
    prefixes: ['Bold', 'Spark', 'Bright', 'Wild', 'Neon', 'Prism', 'Echo', 'Vivid', 'Loud', 'Fresh', 'Bright', 'Rebel', 'Playful', 'Curious', 'Lucid'],
    suffixes: ['Studio', 'Creative', 'Collective', 'Works', 'Agency', 'Lab', 'House', 'Media', 'Design', 'Ideas', 'Craft', 'Guild', 'Union', 'Factory', 'Co'],
    words: ['Canvas', 'Palette', 'Muse', 'Inkwell', 'Prism', 'Aperture', 'Motif', 'Sketch', 'Vellum', 'Chroma', 'Frame', 'Lumen', 'Verve', 'Riff', 'Halo'],
  },
  retail: {
    prefixes: ['Urban', 'Corner', 'Daily', 'Prime', 'Nook', 'Little', 'Market', 'Fresh', 'Value', 'Bright', 'Trendy', 'Everyday', 'Handy', 'Cozy', 'Main'],
    suffixes: ['Shop', 'Store', 'Market', 'Emporium', 'Goods', 'Trading', 'Outlet', 'Supply', 'Depot', 'Bazaar', 'Boutique', 'Mart', 'Cart', 'Corner', 'Co'],
    words: ['Basket', 'Shelf', 'Bundle', 'Trove', 'Stash', 'Haven', 'Nook', 'Cache', 'Parcel', 'Vault', 'Depot', 'Crate', 'Bounty', 'Harbor', 'Loft'],
  },
  services: {
    prefixes: ['Pro', 'Swift', 'Reliable', 'Prime', 'Trusted', 'Elite', 'Rapid', 'Handy', 'Sharp', 'Solid', 'Bright', 'Ready', 'Quick', 'Sure', 'Clear'],
    suffixes: ['Services', 'Solutions', 'Group', 'Experts', 'Partners', 'Care', 'Support', 'Team', 'Pros', 'Works', 'Hub', 'Crew', 'Squad', 'Company', 'Co'],
    words: ['Anchor', 'Compass', 'Beacon', 'Summit', 'Bridge', 'Keystone', 'Pillar', 'Nexus', 'Vantage', 'Meridian', 'Catalyst', 'Momentum', 'Foundry', 'Relay', 'Pivot'],
  },
};

const INDUSTRY_LABELS: { value: string; label: string }[] = [
  { value: 'tech', label: 'Technology' },
  { value: 'food', label: 'Food & Beverage' },
  { value: 'fashion', label: 'Fashion & Apparel' },
  { value: 'health', label: 'Health & Wellness' },
  { value: 'finance', label: 'Finance' },
  { value: 'creative', label: 'Creative & Design' },
  { value: 'retail', label: 'Retail & Shops' },
  { value: 'services', label: 'Services' },
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function generateNames(industry: string, keyword: string): string[] {
  const bank = INDUSTRIES[industry];
  const kw = keyword.trim() ? cap(keyword.trim().replace(/\s+/g, '')) : '';
  const results = new Set<string>();
  let guard = 0;
  while (results.size < 12 && guard < 400) {
    guard++;
    const pattern = Math.floor(Math.random() * (kw ? 6 : 4));
    let name = '';
    switch (pattern) {
      case 0: name = `${pick(bank.prefixes)} ${pick(bank.words)}`; break;
      case 1: name = `${pick(bank.words)} ${pick(bank.suffixes)}`; break;
      case 2: name = `${pick(bank.prefixes)}${pick(bank.suffixes)}`; break;
      case 3: name = `${pick(bank.words)} & ${pick(bank.words)}`; break;
      case 4: name = kw ? `${kw} ${pick(bank.suffixes)}` : `${pick(bank.prefixes)} ${pick(bank.words)}`; break;
      case 5: name = kw ? `${pick(bank.prefixes)} ${kw}` : `${pick(bank.words)} ${pick(bank.suffixes)}`; break;
    }
    if (name && !/(\w+) \1/.test(name)) results.add(name);
  }
  return Array.from(results);
}

export default function BusinessNameGenerator() {
  const [industry, setIndustry] = useState('tech');
  const [keyword, setKeyword] = useState('');
  const [names, setNames] = useState<string[]>(() => generateNames('tech', ''));
  const [copiedOne, setCopiedOne] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const generate = () => setNames(generateNames(industry, keyword));

  const copyOne = async (name: string, i: number) => {
    await navigator.clipboard.writeText(name);
    setCopiedOne(i);
    setTimeout(() => setCopiedOne(null), 2000);
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><Building2 className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Business Name Generator</h1><p className="text-blue-200 text-sm">by industry · optional keyword · 12 fresh ideas · copy each</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Spark memorable business name ideas tailored to your industry. Pick a category, add an optional keyword, and regenerate for endless fresh combinations — all offline in your browser.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <label htmlFor="industry" className="block text-xs font-semibold text-gray-500 mb-1">Industry</label>
              <select id="industry" value={industry} onChange={e => setIndustry(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
                {INDUSTRY_LABELS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="keyword" className="block text-xs font-semibold text-gray-500 mb-1">Keyword (optional)</label>
              <input id="keyword" type="text" value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="e.g. coffee, spark, luna" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button onClick={generate} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Generate Names
            </button>
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Say each name out loud — the best ones are easy to spell and remember.</li>
              <li>• Shorter names (1-2 words) are usually easier to brand and market.</li>
              <li>• Add a keyword tied to your product to keep results on-theme.</li>
              <li>• Shortlist 3-5 favorites, then check domain and trademark availability yourself.</li>
              <li>• Regenerate a few times — the word banks reshuffle for fresh ideas each round.</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-sm">Name Ideas</h2>
              <span className="text-xs text-gray-400">{names.length} ideas</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              {names.map((name, i) => (
                <div key={name + i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100 hover:border-blue-200 transition-all group">
                  <span className="flex-1 text-sm font-medium text-gray-800">{name}</span>
                  <button onClick={() => copyOne(name, i)} aria-label={`Copy ${name}`} className="shrink-0 text-gray-300 hover:text-blue-600 group-hover:text-gray-400 transition-colors">
                    {copiedOne === i ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {RELATED.map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} aria-label={v === 'up' ? 'Helpful' : 'Not helpful'} onClick={() => { setFeedback(v); localStorage.setItem('feedback_business-name-generator', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5"><HelpCircle className="w-5 h-5 text-blue-600" /><h2 className="font-bold text-gray-900">Frequently Asked Questions</h2></div>
        <div className="space-y-3">{FAQS.map((faq, i) => (<div key={i} className="border border-gray-100 rounded-xl overflow-hidden"><button className="w-full flex items-center justify-between px-5 py-4 text-left" aria-expanded={openFaq === i} onClick={() => setOpenFaq(openFaq === i ? null : i)}><span className="font-semibold text-gray-800 text-sm">{faq.q}</span>{openFaq === i ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}</button>{openFaq === i && <div className="px-5 pb-4 text-sm text-gray-600">{faq.a}</div>}</div>))}</div>
      </div>
    </div>
  );
}
