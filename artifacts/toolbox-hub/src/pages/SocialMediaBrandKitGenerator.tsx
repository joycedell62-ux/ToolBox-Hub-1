import React, { useState, useRef, useEffect } from 'react';
import {
  Share2, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Download,
  Rocket, Zap, Star, Heart, Leaf, Flame, Crown, Gem, Globe, Sun, Target, Coffee,
} from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'What does the kit include?', a: 'Three matching assets: a square profile avatar (500×500), a wide cover banner (1500×500), and a square social post template (1080×1080) — all in your brand colors.' },
  { q: 'Can I download each asset separately?', a: 'Yes. Each preview has its own Download PNG button so you can grab exactly what you need.' },
  { q: 'How do I keep everything on-brand?', a: 'The kit reuses your chosen icon and two colors across all three assets, so your profile looks cohesive at a glance.' },
  { q: 'Which platforms do these fit?', a: 'The avatar and post are square (Instagram, LinkedIn, X profile). The cover suits X/Twitter headers and adapts to other cover slots.' },
  { q: 'Is anything uploaded?', a: 'No. Every asset is rendered on a local canvas — your brand stays on your device.' },
];

const ICONS: { name: string; Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; path: string }[] = [
  { name: 'Rocket', Icon: Rocket, path: 'M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09zM12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2zM9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5' },
  { name: 'Zap', Icon: Zap, path: 'M13 2 3 14h9l-1 8 10-12h-9l1-8z' },
  { name: 'Star', Icon: Star, path: 'M12 2 15.09 8.26 22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
  { name: 'Heart', Icon: Heart, path: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' },
  { name: 'Leaf', Icon: Leaf, path: 'M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10zM2 21c0-3 1.85-5.36 5.08-6' },
  { name: 'Flame', Icon: Flame, path: 'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z' },
  { name: 'Crown', Icon: Crown, path: 'M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294zM5 21h14' },
  { name: 'Gem', Icon: Gem, path: 'M6 3h12l4 6-10 13L2 9zM11 3 8 9l4 13 4-13-3-6M2 9h20' },
  { name: 'Globe', Icon: Globe, path: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z' },
  { name: 'Sun', Icon: Sun, path: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42' },
  { name: 'Target', Icon: Target, path: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z' },
  { name: 'Coffee', Icon: Coffee, path: 'M10 2v2M14 2v2M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1M6 2v2' },
];

type AssetKind = 'avatar' | 'cover' | 'post';

export default function SocialMediaBrandKitGenerator() {
  const [name, setName] = useState('Northwind');
  const [handle, setHandle] = useState('@northwind');
  const [tagline, setTagline] = useState('Build something great');
  const [iconName, setIconName] = useState('Rocket');
  const [primary, setPrimary] = useState('#2563eb');
  const [secondary, setSecondary] = useState('#1e3a8a');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const avatarRef = useRef<HTMLCanvasElement | null>(null);
  const coverRef = useRef<HTMLCanvasElement | null>(null);
  const postRef = useRef<HTMLCanvasElement | null>(null);

  const iconPath = (ICONS.find(i => i.name === iconName) || ICONS[0]).path;

  const drawIcon = (ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string) => {
    const scale = size / 24;
    ctx.save();
    ctx.translate(cx - size / 2, cy - size / 2);
    ctx.scale(scale, scale);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const path = new Path2D(iconPath);
    ctx.stroke(path);
    ctx.restore();
  };

  const drawAvatar = (ctx: CanvasRenderingContext2D, W: number, H: number) => {
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, secondary); g.addColorStop(1, primary);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    drawIcon(ctx, W / 2, H / 2 - H * 0.06, W * 0.34, '#ffffff');
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.font = `800 ${W * 0.11}px Arial, sans-serif`;
    ctx.fillText((name || 'Brand').slice(0, 14), W / 2, H * 0.78);
  };

  const drawCover = (ctx: CanvasRenderingContext2D, W: number, H: number) => {
    const g = ctx.createLinearGradient(0, 0, W, 0);
    g.addColorStop(0, secondary); g.addColorStop(1, primary);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    drawIconFilledCircle(ctx, W * 0.8, H * 0.5, H * 0.55);
    drawIcon(ctx, W * 0.18, H / 2, H * 0.42, '#ffffff');
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = `800 ${H * 0.18}px Arial, sans-serif`;
    ctx.fillText(name || 'Brand', W * 0.3, H * 0.46);
    ctx.font = `500 ${H * 0.09}px Arial, sans-serif`;
    ctx.globalAlpha = 0.9;
    ctx.fillText(tagline || '', W * 0.3, H * 0.62);
    ctx.globalAlpha = 1;
  };

  const drawIconFilledCircle = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) => {
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  };

  const drawPost = (ctx: CanvasRenderingContext2D, W: number, H: number) => {
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = primary; ctx.fillRect(0, 0, W, H * 0.03);
    ctx.fillStyle = primary; ctx.fillRect(0, H * 0.97, W, H * 0.03);
    // icon tile
    const tile = W * 0.24;
    const tx = W / 2 - tile / 2; const ty = H * 0.16;
    roundRect(ctx, tx, ty, tile, tile, tile * 0.24);
    ctx.fillStyle = secondary; ctx.fill();
    drawIcon(ctx, W / 2, ty + tile / 2, tile * 0.55, '#ffffff');
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0f172a';
    ctx.font = `800 ${W * 0.075}px Arial, sans-serif`;
    ctx.fillText(name || 'Brand', W / 2, H * 0.56);
    ctx.fillStyle = primary;
    ctx.font = `600 ${W * 0.04}px Arial, sans-serif`;
    ctx.fillText(handle || '', W / 2, H * 0.64);
    ctx.fillStyle = '#475569';
    ctx.font = `400 ${W * 0.042}px Arial, sans-serif`;
    ctx.fillText(tagline || '', W / 2, H * 0.76);
  };

  const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  useEffect(() => {
    const render = (ref: React.RefObject<HTMLCanvasElement | null>, w: number, h: number, fn: (ctx: CanvasRenderingContext2D, W: number, H: number) => void) => {
      const canvas = ref.current; if (!canvas) return;
      const ctx = canvas.getContext('2d'); if (!ctx) return;
      canvas.width = w; canvas.height = h;
      fn(ctx, w, h);
    };
    render(avatarRef, 500, 500, drawAvatar);
    render(coverRef, 1500, 500, drawCover);
    render(postRef, 1080, 1080, drawPost);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, handle, tagline, iconName, primary, secondary]);

  const download = (kind: AssetKind) => {
    const ref = kind === 'avatar' ? avatarRef : kind === 'cover' ? coverRef : postRef;
    const canvas = ref.current; if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `${(name || 'brand').toLowerCase().replace(/\s+/g, '-')}-${kind}.png`;
    a.click();
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><Share2 className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Social Media Brand Kit</h1><p className="text-blue-200 text-sm">avatar · cover · post template · download each as PNG</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Generate a matching set of social assets from your brand name, colors, and icon. Get a profile avatar, cover banner, and post template — all on-brand and ready to download.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <label htmlFor="bn" className="block text-xs font-semibold text-gray-500 mb-1">Brand name</label>
              <input id="bn" type="text" value={name} onChange={e => setName(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" />
            </div>
            <div>
              <label htmlFor="hd" className="block text-xs font-semibold text-gray-500 mb-1">Handle</label>
              <input id="hd" type="text" value={handle} onChange={e => setHandle(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" />
            </div>
            <div>
              <label htmlFor="tl" className="block text-xs font-semibold text-gray-500 mb-1">Tagline</label>
              <input id="tl" type="text" value={tagline} onChange={e => setTagline(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">Icon</label>
              <div className="grid grid-cols-6 gap-2">
                {ICONS.map(({ name: n, Icon }) => (
                  <button key={n} onClick={() => setIconName(n)} aria-label={`Choose ${n} icon`} aria-pressed={iconName === n} className={`aspect-square flex items-center justify-center rounded-lg border transition-all ${iconName === n ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-500 hover:border-blue-300'}`}>
                    <Icon className="w-5 h-5" />
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Primary color</label>
                <input type="color" value={primary} onChange={e => setPrimary(e.target.value)} aria-label="Primary color" className="w-full h-9 rounded-lg border border-gray-200 cursor-pointer" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Secondary color</label>
                <input type="color" value={secondary} onChange={e => setSecondary(e.target.value)} aria-label="Secondary color" className="w-full h-9 rounded-lg border border-gray-200 cursor-pointer" />
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Use the same avatar across every platform for instant recognition.</li>
              <li>• Keep the cover&apos;s key text centered so it survives mobile cropping.</li>
              <li>• Reuse the post template as a background for quotes and announcements.</li>
              <li>• Two brand colors are plenty — consistency beats variety.</li>
              <li>• Pick an icon that hints at what you do, not just what looks nice.</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-900 text-sm">Avatar · 500×500</h2>
              <button onClick={() => download('avatar')} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"><Download className="w-3.5 h-3.5" /> PNG</button>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-5 flex items-center justify-center">
              <canvas ref={avatarRef} className="w-40 h-40 rounded-full shadow-md" aria-label="Avatar preview" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-900 text-sm">Cover · 1500×500</h2>
              <button onClick={() => download('cover')} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"><Download className="w-3.5 h-3.5" /> PNG</button>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-5 flex items-center justify-center">
              <canvas ref={coverRef} className="w-full max-w-lg rounded-lg shadow-md" style={{ aspectRatio: '1500 / 500' }} aria-label="Cover preview" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-900 text-sm">Post Template · 1080×1080</h2>
              <button onClick={() => download('post')} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"><Download className="w-3.5 h-3.5" /> PNG</button>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-5 flex items-center justify-center">
              <canvas ref={postRef} className="w-full max-w-xs rounded-lg shadow-md" style={{ aspectRatio: '1 / 1' }} aria-label="Post template preview" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Banner Creator', href: '/banner-creator' }, { label: 'Logo Generator', href: '/logo-generator' }, { label: 'Brand Style Guide', href: '/brand-style-guide-generator' }, { label: 'Color Palette Generator', href: '/color-palette-generator' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} aria-label={v === 'up' ? 'Helpful' : 'Not helpful'} onClick={() => { setFeedback(v); localStorage.setItem('feedback_social-media-brand-kit', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
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
