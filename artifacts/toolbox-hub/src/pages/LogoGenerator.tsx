import React, { useState } from 'react';
import {
  Sparkles, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp,
  Download, RefreshCw,
  Rocket, Zap, Star, Heart, Leaf, Flame, Anchor, Award, Bird, Bolt, Camera, Cloud,
  Coffee, Crown, Diamond, Feather, Gem, Globe, Hexagon, Moon, Mountain, Music,
  Palette, Plane, Shield, Sun, Target, TreePine, Wine, Wrench,
} from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'Is this logo really free to use?', a: 'Yes. Everything is generated in your browser using icons and text you choose. Download the PNG or SVG and use it however you like.' },
  { q: 'What is the difference between PNG and SVG?', a: 'PNG is a pixel image great for web and social. SVG is a scalable vector that stays crisp at any size — best for print and further editing.' },
  { q: 'Can I edit the SVG later?', a: 'Absolutely. Open the downloaded .svg in any vector editor (Figma, Illustrator, Inkscape) to tweak colors, fonts, or shapes.' },
  { q: 'Are the icons copyright-safe?', a: 'The icons come from the open-source Lucide icon set (ISC license), which is free for commercial use.' },
  { q: 'Why does my logo look pixelated?', a: 'The PNG export is fixed-resolution. For the sharpest result at large sizes, download the SVG version instead.' },
];

const ICONS: { name: string; Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }> }[] = [
  { name: 'Rocket', Icon: Rocket }, { name: 'Zap', Icon: Zap }, { name: 'Star', Icon: Star },
  { name: 'Heart', Icon: Heart }, { name: 'Leaf', Icon: Leaf }, { name: 'Flame', Icon: Flame },
  { name: 'Anchor', Icon: Anchor }, { name: 'Award', Icon: Award }, { name: 'Bird', Icon: Bird },
  { name: 'Bolt', Icon: Bolt }, { name: 'Camera', Icon: Camera }, { name: 'Cloud', Icon: Cloud },
  { name: 'Coffee', Icon: Coffee }, { name: 'Crown', Icon: Crown }, { name: 'Diamond', Icon: Diamond },
  { name: 'Feather', Icon: Feather }, { name: 'Gem', Icon: Gem }, { name: 'Globe', Icon: Globe },
  { name: 'Hexagon', Icon: Hexagon }, { name: 'Moon', Icon: Moon }, { name: 'Mountain', Icon: Mountain },
  { name: 'Music', Icon: Music }, { name: 'Palette', Icon: Palette }, { name: 'Plane', Icon: Plane },
  { name: 'Shield', Icon: Shield }, { name: 'Sun', Icon: Sun }, { name: 'Target', Icon: Target },
  { name: 'TreePine', Icon: TreePine }, { name: 'Wine', Icon: Wine }, { name: 'Wrench', Icon: Wrench },
];

// Minimal inline SVG path data mirroring the chosen icons for canvas/SVG export.
const ICON_PATHS: Record<string, string> = {
  Rocket: 'M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09zM12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0 M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5',
  Zap: 'M13 2 3 14h9l-1 8 10-12h-9l1-8z',
  Star: 'M12 2 15.09 8.26 22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  Heart: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
  Leaf: 'M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z M2 21c0-3 1.85-5.36 5.08-6',
  Flame: 'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z',
  Anchor: 'M12 22V8 M5 12H2a10 10 0 0 0 20 0h-3 M12 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  Award: 'M15.477 12.89 17 22l-5-3-5 3 1.523-9.11 M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12z',
  Bird: 'M16 7h.01 M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20 M20 7h2 M5.12 12.53l-1.83 4.28',
  Bolt: 'M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h3l2.5 3h5l2.5-3h3a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z M9 9v6',
  Camera: 'M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  Cloud: 'M17.5 19a4.5 4.5 0 0 0 0-9h-1.8A7 7 0 1 0 4 15.9',
  Coffee: 'M10 2v2 M14 2v2 M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1 M6 2v2',
  Crown: 'M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z M5 21h14',
  Diamond: 'M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41L13.7 2.71a2.41 2.41 0 0 0-3.41 0z',
  Feather: 'M12.67 19a2 2 0 0 0 1.416-.588l6.154-6.172a6 6 0 0 0-8.49-8.49L5.586 9.914A2 2 0 0 0 5 11.328V18a1 1 0 0 0 1 1z M16 8 2 22 M17.5 15H9',
  Gem: 'M6 3h12l4 6-10 13L2 9z M11 3 8 9l4 13 4-13-3-6 M2 9h20',
  Globe: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z',
  Hexagon: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z',
  Moon: 'M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z',
  Mountain: 'm8 3 4 8 5-5 5 15H2L8 3z',
  Music: 'M9 18V5l12-2v13 M9 18a3 3 0 1 0 0 0z M21 16a3 3 0 1 0 0 0z',
  Palette: 'M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z M13.5 6.5a1 1 0 1 0 0 0z M17.5 10.5a1 1 0 1 0 0 0z M8.5 7.5a1 1 0 1 0 0 0z M6.5 12.5a1 1 0 1 0 0 0z',
  Plane: 'M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z',
  Shield: 'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z',
  Sun: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z M12 1v2 M12 21v2 M4.22 4.22l1.42 1.42 M18.36 18.36l1.42 1.42 M1 12h2 M21 12h2 M4.22 19.78l1.42-1.42 M18.36 5.64l1.42-1.42',
  Target: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  TreePine: 'M17 14h.352a1 1 0 0 0 .894-1.447l-2.052-3.981h.581a1 1 0 0 0 .894-1.447l-3.75-7.28a1 1 0 0 0-1.788 0l-3.75 7.28A1 1 0 0 0 9.275 8.572h.581l-2.052 3.981A1 1 0 0 0 8.7 14H12v8 M12 22h.01',
  Wine: 'M8 22h8 M7 10h10 M12 15v7 M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5z',
  Wrench: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z',
};

type Shape = 'circle' | 'square' | 'rounded' | 'none';
type Layout = 'top' | 'left';

const BG_SWATCHES = ['#2563eb', '#0f172a', '#059669', '#dc2626', '#f59e0b', '#7c3aed', '#db2777', '#0891b2', '#ffffff', '#111827'];

export default function LogoGenerator() {
  const [iconName, setIconName] = useState('Rocket');
  const [shape, setShape] = useState<Shape>('rounded');
  const [layout, setLayout] = useState<Layout>('top');
  const [bgColor, setBgColor] = useState('#2563eb');
  const [iconColor, setIconColor] = useState('#ffffff');
  const [textColor, setTextColor] = useState('#0f172a');
  const [name, setName] = useState('Northwind');
  const [tagline, setTagline] = useState('Build something great');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const buildSvgString = (): string => {
    const W = layout === 'top' ? 400 : 520;
    const H = layout === 'top' ? 320 : 200;
    const path = ICON_PATHS[iconName] || ICON_PATHS.Rocket;
    const shapeRadius = shape === 'circle' ? 60 : shape === 'rounded' ? 28 : 0;
    const tileSize = 120;

    let shapeEl = '';
    if (shape !== 'none') {
      shapeEl = `<rect x="0" y="0" width="${tileSize}" height="${tileSize}" rx="${shapeRadius}" ry="${shapeRadius}" fill="${bgColor}"/>`;
    }
    // icon drawn at 24x24 viewBox scaled to 64 and centered inside tile
    const iconScale = 64 / 24;
    const iconOffset = (tileSize - 64) / 2;
    const iconGroup = `<g transform="translate(${iconOffset},${iconOffset}) scale(${iconScale})"><path d="${path}" fill="none" stroke="${iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></g>`;

    let content = '';
    if (layout === 'top') {
      const tileX = (W - tileSize) / 2;
      content = `
        <g transform="translate(${tileX},30)">${shapeEl}${iconGroup}</g>
        <text x="${W / 2}" y="215" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="800" fill="${textColor}">${escapeXml(name)}</text>
        <text x="${W / 2}" y="255" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="${textColor}" opacity="0.7">${escapeXml(tagline)}</text>`;
    } else {
      content = `
        <g transform="translate(30,40)">${shapeEl}${iconGroup}</g>
        <text x="180" y="95" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="800" fill="${textColor}">${escapeXml(name)}</text>
        <text x="180" y="130" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="${textColor}" opacity="0.7">${escapeXml(tagline)}</text>`;
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${content}</svg>`;
  };

  const downloadSvg = () => {
    const blob = new Blob([buildSvgString()], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(name || 'logo').toLowerCase().replace(/\s+/g, '-')}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPng = () => {
    const svgStr = buildSvgString();
    const img = new Image();
    const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    img.onload = () => {
      const scale = 3;
      const canvas = document.createElement('canvas');
      const W = layout === 'top' ? 400 : 520;
      const H = layout === 'top' ? 320 : 200;
      canvas.width = W * scale;
      canvas.height = H * scale;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = `${(name || 'logo').toLowerCase().replace(/\s+/g, '-')}.png`;
        a.click();
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const SelectedIcon = (ICONS.find(i => i.name === iconName) || ICONS[0]).Icon;

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><Sparkles className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Logo Generator</h1><p className="text-blue-200 text-sm">icon grid · shapes · colors · live preview · PNG + SVG download</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Design a clean, professional logo in seconds — pick an icon, choose a shape and colors, add your name, and download a crisp PNG or scalable SVG. 100% in your browser.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">Icon</label>
              <div className="grid grid-cols-6 gap-2 max-h-44 overflow-y-auto">
                {ICONS.map(({ name: n, Icon }) => (
                  <button key={n} onClick={() => setIconName(n)} aria-label={`Choose ${n} icon`} aria-pressed={iconName === n}
                    className={`aspect-square flex items-center justify-center rounded-lg border transition-all ${iconName === n ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-500 hover:border-blue-300'}`}>
                    <Icon className="w-5 h-5" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Business name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Tagline</label>
              <input type="text" value={tagline} onChange={e => setTagline(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">Shape</label>
              <div className="grid grid-cols-4 gap-2">
                {(['circle', 'square', 'rounded', 'none'] as Shape[]).map(s => (
                  <button key={s} onClick={() => setShape(s)} aria-pressed={shape === s}
                    className={`text-xs font-semibold py-2 rounded-lg border capitalize transition-all ${shape === s ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}>{s}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">Layout</label>
              <div className="grid grid-cols-2 gap-2">
                {(['top', 'left'] as Layout[]).map(l => (
                  <button key={l} onClick={() => setLayout(l)} aria-pressed={layout === l}
                    className={`text-xs font-semibold py-2 rounded-lg border transition-all ${layout === l ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}>Icon {l}</button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Background</label>
                <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} aria-label="Background color" className="w-full h-9 rounded-lg border border-gray-200 cursor-pointer" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Icon</label>
                <input type="color" value={iconColor} onChange={e => setIconColor(e.target.value)} aria-label="Icon color" className="w-full h-9 rounded-lg border border-gray-200 cursor-pointer" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Text</label>
                <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} aria-label="Text color" className="w-full h-9 rounded-lg border border-gray-200 cursor-pointer" />
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {BG_SWATCHES.map(c => (
                <button key={c} onClick={() => setBgColor(c)} aria-label={`Set background ${c}`} className="w-6 h-6 rounded-md border border-gray-200" style={{ background: c }} />
              ))}
            </div>
          </div>

          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Keep it simple — a single icon plus a strong name reads best at small sizes.</li>
              <li>• Use high contrast between the icon and its background so it stays legible.</li>
              <li>• Download the SVG for print and business cards; it stays sharp at any size.</li>
              <li>• Test your logo in one color (all black) to make sure the shape still works.</li>
              <li>• Reuse the same background color across your brand for consistency.</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-sm">Live Preview</h2>
              <div className="flex gap-2">
                <button onClick={downloadPng} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"><Download className="w-3.5 h-3.5" /> PNG</button>
                <button onClick={downloadSvg} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"><Download className="w-3.5 h-3.5" /> SVG</button>
              </div>
            </div>
            <div className="rounded-xl border border-gray-100 bg-[repeating-conic-gradient(#f8fafc_0%_25%,#eef2f7_0%_50%)] bg-[length:24px_24px] flex items-center justify-center p-10 min-h-[280px]">
              <div className={`flex ${layout === 'top' ? 'flex-col items-center text-center' : 'flex-row items-center'} gap-4`}>
                <div
                  className="shrink-0 flex items-center justify-center"
                  style={{
                    width: 96, height: 96,
                    background: shape === 'none' ? 'transparent' : bgColor,
                    borderRadius: shape === 'circle' ? '9999px' : shape === 'rounded' ? '22px' : shape === 'square' ? '0px' : '0px',
                  }}>
                  <SelectedIcon className="w-12 h-12" style={{ color: iconColor } as React.CSSProperties} />
                </div>
                <div>
                  <div className="text-3xl font-extrabold leading-tight" style={{ color: textColor }}>{name || 'Your Name'}</div>
                  {tagline && <div className="text-base" style={{ color: textColor, opacity: 0.7 }}>{tagline}</div>}
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">Checkerboard shows transparency. PNG exports on a white background; SVG keeps transparency.</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Logo Idea Generator', href: '/logo-idea-generator' }, { label: 'Color Palette Generator', href: '/color-palette-generator' }, { label: 'Brand Name Generator', href: '/brand-name-generator' }, { label: 'Font Pairing Generator', href: '/font-pairing-generator' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} aria-label={v === 'up' ? 'Helpful' : 'Not helpful'} onClick={() => { setFeedback(v); localStorage.setItem('feedback_logo-generator', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
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

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c] as string));
}
