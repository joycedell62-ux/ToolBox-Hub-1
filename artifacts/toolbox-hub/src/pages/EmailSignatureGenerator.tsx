import React, { useState, useRef } from 'react';
import { Mail, ThumbsUp, ThumbsDown, Lightbulb, ChevronDown, Copy, Check } from 'lucide-react';
import { Link } from 'wouter';
import { getRelatedTools } from '@/lib/tools';

const related = getRelatedTools('/email-signature-generator', 4);

type Template = 'classic' | 'modern' | 'compact' | 'bold';

const TEMPLATES: { id: Template; label: string }[] = [
  { id: 'classic', label: 'Classic' },
  { id: 'modern', label: 'Modern' },
  { id: 'compact', label: 'Compact' },
  { id: 'bold', label: 'Bold' },
];

const SOCIAL_ICONS: Record<string, string> = {
  linkedin: '🔷',
  twitter: '🐦',
  facebook: '📘',
  instagram: '📷',
  youtube: '▶️',
  github: '🐙',
};

const FAQS = [
  { q: 'Is this Gmail/Outlook compatible?', a: 'Yes. The HTML uses inline styles which work across Gmail, Outlook, Apple Mail and most other clients.' },
  { q: 'How do I add this to Gmail?', a: 'Copy the HTML, go to Gmail Settings → See all settings → General → Signature, click the "source" icon in the editor, paste the HTML, and save.' },
  { q: 'How do I add this to Outlook?', a: 'In Outlook: File → Options → Mail → Signatures. Create a new signature, switch to HTML view, paste the code.' },
  { q: 'Does the logo upload to any server?', a: 'No. The logo is embedded as a base64 data URL directly in the HTML — nothing leaves your device.' },
  { q: 'Can I use a font other than Arial?', a: 'The template uses Arial/sans-serif as a web-safe fallback so it renders consistently across all email clients.' },
];

function buildSignatureHtml(opts: {
  template: Template; name: string; position: string; company: string;
  phone: string; email: string; website: string; logoUrl: string | null;
  accentColor: string; socials: Record<string, string>;
}) {
  const { template, name, position, company, phone, email, website, logoUrl, accentColor, socials } = opts;
  const socialEntries = Object.entries(socials).filter(([, v]) => v);

  const logoHtml = logoUrl
    ? `<img src="${logoUrl}" alt="${company} logo" style="height:40px;width:auto;display:block;margin-bottom:8px;" />`
    : '';

  const contactLine = [
    phone && `<span>${phone}</span>`,
    email && `<a href="mailto:${email}" style="color:${accentColor};text-decoration:none;">${email}</a>`,
    website && `<a href="${website.startsWith('http') ? website : 'https://' + website}" style="color:${accentColor};text-decoration:none;">${website}</a>`,
  ].filter(Boolean).join(' &nbsp;·&nbsp; ');

  const socialsHtml = socialEntries.length
    ? `<div style="margin-top:8px;">${socialEntries.map(([k, v]) => `<a href="${v.startsWith('http') ? v : 'https://' + v}" style="text-decoration:none;margin-right:8px;font-size:18px;">${SOCIAL_ICONS[k] || '🔗'}</a>`).join('')}</div>`
    : '';

  if (template === 'classic') {
    return `<table cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;font-size:13px;color:#334155;border-collapse:collapse;">
  <tr>
    ${logoUrl ? `<td style="padding-right:16px;vertical-align:top;border-right:3px solid ${accentColor};">${logoHtml}</td><td style="width:16px;"></td>` : `<td style="border-left:3px solid ${accentColor};padding-right:16px;"></td>`}
    <td style="vertical-align:top;">
      <div style="font-weight:bold;font-size:15px;color:#0f172a;">${name}</div>
      <div style="color:${accentColor};font-size:12px;">${position}${company ? ` · ${company}` : ''}</div>
      <div style="margin-top:6px;font-size:12px;color:#64748b;">${contactLine}</div>
      ${socialsHtml}
    </td>
  </tr>
</table>`;
  }

  if (template === 'modern') {
    return `<table cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;border-collapse:collapse;max-width:480px;">
  <tr><td style="background:${accentColor};padding:16px 20px;vertical-align:middle;">
    ${logoHtml}
    <div style="color:#fff;font-weight:bold;font-size:16px;">${name}</div>
    <div style="color:rgba(255,255,255,0.8);font-size:12px;">${position}${company ? ` | ${company}` : ''}</div>
  </td></tr>
  <tr><td style="background:#f8fafc;padding:12px 20px;font-size:12px;color:#475569;">
    ${contactLine}
    ${socialsHtml}
  </td></tr>
</table>`;
  }

  if (template === 'compact') {
    return `<div style="font-family:Arial,sans-serif;font-size:12px;color:#334155;border-top:2px solid ${accentColor};padding-top:8px;max-width:420px;">
  ${logoHtml}<strong style="font-size:13px;color:#0f172a;">${name}</strong> &nbsp;|&nbsp; <span style="color:${accentColor};">${position}${company ? `, ${company}` : ''}</span><br/>
  <span style="color:#64748b;">${contactLine}</span>
  ${socialsHtml}
</div>`;
  }

  // bold
  return `<table cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;border-collapse:collapse;max-width:480px;">
  <tr>
    <td style="padding:16px;background:#0f172a;vertical-align:middle;width:6px;"></td>
    <td style="padding:16px 20px;vertical-align:top;">
      ${logoHtml}
      <div style="font-weight:bold;font-size:18px;color:#0f172a;">${name}</div>
      <div style="font-size:12px;font-weight:600;color:${accentColor};text-transform:uppercase;letter-spacing:0.05em;">${position}${company ? ` · ${company}` : ''}</div>
      <div style="margin-top:8px;font-size:12px;color:#475569;">${contactLine}</div>
      ${socialsHtml}
    </td>
  </tr>
</table>`;
}

export default function EmailSignatureGenerator() {
  const [template, setTemplate] = useState<Template>('classic');
  const [name, setName] = useState('Alex Johnson');
  const [position, setPosition] = useState('Product Designer');
  const [company, setCompany] = useState('ToolBox Corp');
  const [phone, setPhone] = useState('+1 (555) 123-4567');
  const [email, setEmail] = useState('alex@toolboxcorp.com');
  const [website, setWebsite] = useState('toolboxcorp.com');
  const [accentColor, setAccentColor] = useState('#2563eb');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [socials, setSocials] = useState<Record<string, string>>({ linkedin: '', twitter: '', instagram: '', facebook: '', youtube: '', github: '' });
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setLogoUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const signatureHtml = buildSignatureHtml({ template, name, position, company, phone, email, website, logoUrl, accentColor, socials });

  const handleCopy = async () => {
    await navigator.clipboard.writeText(signatureHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="w-full py-10 px-4 text-white text-center" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex justify-center mb-3"><Mail className="w-10 h-10 opacity-90" /></div>
        <h1 className="text-3xl font-bold mb-2">Email Signature Generator</h1>
        <p className="text-blue-100 max-w-xl mx-auto">Create a professional email signature with logo, social links, and QR code. Copy the HTML to Gmail, Outlook, or Apple Mail.</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 grid lg:grid-cols-5 gap-6">
        {/* Controls */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h2 className="font-semibold text-slate-800 mb-3">Template</h2>
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATES.map(t => (
                <button key={t.id} onClick={() => setTemplate(t.id)}
                  className={`py-2 rounded-lg text-sm font-medium border transition-all ${template === t.id ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-700 hover:border-blue-300'}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-3">
            <h2 className="font-semibold text-slate-800 mb-1">Your Details</h2>
            {[
              { label: 'Full Name', value: name, set: setName },
              { label: 'Position / Title', value: position, set: setPosition },
              { label: 'Company', value: company, set: setCompany },
              { label: 'Phone', value: phone, set: setPhone },
              { label: 'Email', value: email, set: setEmail },
              { label: 'Website', value: website, set: setWebsite },
            ].map(f => (
              <div key={f.label}>
                <label className="block text-xs text-slate-500 mb-1">{f.label}</label>
                <input value={f.value} onChange={e => f.set(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
            ))}
            <div>
              <label className="block text-xs text-slate-500 mb-1">Accent Color</label>
              <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-200 cursor-pointer" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-3">
            <h2 className="font-semibold text-slate-800 mb-1">Logo</h2>
            <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            <button onClick={() => logoInputRef.current?.click()}
              className="w-full py-3 border-2 border-dashed border-blue-200 rounded-xl text-blue-600 hover:bg-blue-50 text-sm font-medium transition-colors">
              {logoUrl ? '✓ Logo uploaded — click to change' : '+ Upload Logo'}
            </button>
            {logoUrl && <button onClick={() => setLogoUrl(null)} className="w-full text-xs text-slate-400 hover:text-red-500 transition-colors">Remove logo</button>}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-3">
            <h2 className="font-semibold text-slate-800 mb-1">Social Media Links</h2>
            {Object.keys(socials).map(k => (
              <div key={k}>
                <label className="block text-xs text-slate-500 mb-1 capitalize">{SOCIAL_ICONS[k]} {k}</label>
                <input value={socials[k]} onChange={e => setSocials(s => ({ ...s, [k]: e.target.value }))}
                  placeholder={`https://${k}.com/yourhandle`}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="font-semibold text-slate-800 mb-4">Live Preview</h2>
            <div className="border border-slate-100 rounded-xl p-4 bg-slate-50 overflow-x-auto">
              <div dangerouslySetInnerHTML={{ __html: signatureHtml }} />
            </div>
            <div className="mt-4 flex gap-3">
              <button onClick={handleCopy}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy HTML'}
              </button>
            </div>

            {/* Raw HTML */}
            <div className="mt-4">
              <p className="text-xs text-slate-500 mb-2 font-medium">HTML Source</p>
              <pre className="bg-slate-900 text-green-400 text-xs rounded-xl p-4 overflow-x-auto whitespace-pre-wrap break-all select-all" style={{ maxHeight: '200px' }}>{signatureHtml}</pre>
            </div>

            {/* Compat badges */}
            <div className="mt-4 flex flex-wrap gap-2">
              {['Gmail', 'Outlook', 'Apple Mail', 'Yahoo Mail'].map(c => (
                <span key={c} className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-100">
                  <Check className="w-3 h-3" /> {c}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><h3 className="font-semibold text-blue-900 text-sm">Pro Tips</h3></div>
            <ul className="space-y-1.5 text-sm text-blue-800">
              <li>• Keep your logo image small (under 100KB) for faster email loading.</li>
              <li>• In Gmail, paste the HTML via the "source" icon (⟨⟩) in the signature editor.</li>
              <li>• Avoid background images — they don't render in Outlook by default.</li>
              <li>• Test your signature by sending yourself an email before rolling it out.</li>
              <li>• The Compact template works best on mobile email clients.</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 mb-3">Frequently Asked Questions</h3>
            {FAQS.map((faq, i) => (
              <div key={i} className="border-b border-slate-100 last:border-0">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex justify-between items-center py-3 text-left text-sm font-medium text-slate-700 hover:text-blue-600">
                  {faq.q}<ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && <p className="pb-3 text-sm text-slate-600">{faq.a}</p>}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {related.map(t => (
                <Link key={t.href} href={t.href} className="p-3 border border-slate-100 rounded-xl hover:border-blue-200 hover:bg-blue-50 transition-all">
                  <p className="font-medium text-sm text-slate-800">{t.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{t.description}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 text-center">
            <p className="text-sm text-slate-600 mb-3">Was this tool helpful?</p>
            <div className="flex justify-center gap-3">
              {(['up', 'down'] as const).map(v => (
                <button key={v} onClick={() => { setFeedback(v); localStorage.setItem('feedback_email-signature-generator', v); }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm transition-all ${feedback === v ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-600 hover:border-blue-300'}`}>
                  {v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}
                  {v === 'up' ? 'Yes' : 'No'}
                </button>
              ))}
            </div>
            {feedback && <p className="text-xs text-slate-400 mt-2">Thanks for your feedback!</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
