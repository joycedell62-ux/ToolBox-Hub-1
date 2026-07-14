import React, { useState, useRef } from 'react';
import { FileText, ThumbsUp, ThumbsDown, Lightbulb, ChevronDown, Download, Printer, RefreshCw } from 'lucide-react';
import { Link } from 'wouter';
import { jsPDF } from 'jspdf';
import { getRelatedTools } from '@/lib/tools';

const related = getRelatedTools('/cover-letter-generator', 4);

type Template = 'formal' | 'modern' | 'creative';

const TEMPLATES: { id: Template; label: string; desc: string }[] = [
  { id: 'formal', label: 'Formal', desc: 'Conservative, traditional layout' },
  { id: 'modern', label: 'Modern', desc: 'Clean, contemporary style' },
  { id: 'creative', label: 'Creative', desc: 'Bold accent with personality' },
];

const FAQS = [
  { q: 'Can I export to PDF?', a: 'Yes. Click "Download PDF" and the letter is exported at A4 size, ready to attach to any job application.' },
  { q: 'Are the letters AI-generated?', a: 'No. The generator creates a professional structure from your inputs — the words are based on your details, not AI. You can edit the output as needed.' },
  { q: 'Can I customise the text?', a: 'Yes — edit any of the generated text fields directly before downloading.' },
  { q: 'What format is the PDF?', a: 'A4 (210 × 297 mm), standard for professional applications globally.' },
  { q: 'How long should a cover letter be?', a: 'One page is ideal. Three to four short paragraphs are enough — hiring managers spend less than 30 seconds reading.' },
];

function buildLetter(fields: {
  applicantName: string; applicantEmail: string; applicantPhone: string;
  jobTitle: string; company: string; hiringManager: string;
  experience: string; skills: string; whyInterested: string; template: Template;
}) {
  const { applicantName, applicantEmail, applicantPhone, jobTitle, company, hiringManager, experience, skills, whyInterested, template } = fields;
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const greeting = hiringManager ? `Dear ${hiringManager},` : 'Dear Hiring Manager,';
  const skillList = skills.split(',').map(s => s.trim()).filter(Boolean).slice(0, 3).join(', ');
  const closing = applicantName || 'Your Name';

  const opening = `I am writing to express my strong interest in the ${jobTitle || '[Position]'} role at ${company || '[Company]'}. With ${experience || 'several years of'} experience in my field and a passion for delivering outstanding results, I am confident I would be a valuable addition to your team.`;

  const body = `Throughout my career, I have developed expertise in ${skillList || 'key areas relevant to this role'}. I have consistently delivered results through attention to detail, strong communication, and a collaborative approach. My background has equipped me with the skills needed to thrive in a fast-paced, dynamic environment.`;

  const whyParagraph = whyInterested
    ? `I am particularly excited about this opportunity because ${whyInterested}. I believe ${company || 'your organisation'}'s mission aligns closely with my professional values, and I am eager to contribute to your continued success.`
    : `I am particularly excited about this opportunity to bring my skills to ${company || 'your organisation'} and contribute to your team's goals.`;

  return { today, greeting, opening, body, whyParagraph, closing, applicantEmail, applicantPhone };
}

export default function CoverLetterGenerator() {
  const [template, setTemplate] = useState<Template>('modern');
  const [applicantName, setApplicantName] = useState('Alex Johnson');
  const [applicantEmail, setApplicantEmail] = useState('alex@email.com');
  const [applicantPhone, setApplicantPhone] = useState('+1 (555) 123-4567');
  const [jobTitle, setJobTitle] = useState('Senior Designer');
  const [company, setCompany] = useState('ToolBox Corp');
  const [hiringManager, setHiringManager] = useState('');
  const [experience, setExperience] = useState('5+ years of');
  const [skills, setSkills] = useState('UI/UX design, Figma, team collaboration');
  const [whyInterested, setWhyInterested] = useState('your innovative approach to product design inspires me');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const letter = buildLetter({ applicantName, applicantEmail, applicantPhone, jobTitle, company, hiringManager, experience, skills, whyInterested, template });

  const accentMap: Record<Template, string> = { formal: '#1e3a8a', modern: '#2563eb', creative: '#7c3aed' };
  const accent = accentMap[template];

  const handleDownloadPdf = () => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const w = 210; const margin = 20; const textW = w - margin * 2;
    let y = margin;

    // Header
    if (template === 'modern' || template === 'creative') {
      doc.setFillColor(template === 'creative' ? 124 : 37, template === 'creative' ? 58 : 99, template === 'creative' ? 237 : 235);
      doc.rect(0, 0, w, 30, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16); doc.setFont('helvetica', 'bold');
      doc.text(applicantName || 'Your Name', margin, 15);
      doc.setFontSize(9); doc.setFont('helvetica', 'normal');
      doc.text([applicantEmail, applicantPhone].filter(Boolean).join('  ·  '), margin, 23);
      y = 40;
    } else {
      doc.setTextColor(30, 30, 30);
      doc.setFontSize(16); doc.setFont('helvetica', 'bold');
      doc.text(applicantName || 'Your Name', margin, y);
      y += 6;
      doc.setFontSize(9); doc.setFont('helvetica', 'normal');
      doc.text([applicantEmail, applicantPhone].filter(Boolean).join('  |  '), margin, y);
      y += 10;
      doc.setDrawColor(200, 200, 200); doc.line(margin, y, w - margin, y);
      y += 8;
    }

    doc.setTextColor(80, 80, 80);
    doc.setFontSize(10); doc.setFont('helvetica', 'normal');
    doc.text(letter.today, margin, y); y += 8;
    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'bold'); doc.text(letter.greeting, margin, y); y += 8;
    doc.setFont('helvetica', 'normal');
    const paras = [letter.opening, letter.body, letter.whyParagraph, 'I would welcome the opportunity to discuss how my experience aligns with your needs. Thank you for your consideration. I look forward to hearing from you.'];
    paras.forEach(p => {
      const lines = doc.splitTextToSize(p, textW);
      doc.text(lines, margin, y); y += lines.length * 6 + 4;
    });
    y += 4;
    doc.setFont('helvetica', 'normal'); doc.text('Sincerely,', margin, y); y += 8;
    doc.setFont('helvetica', 'bold'); doc.text(letter.closing, margin, y);
    doc.save(`cover-letter-${(applicantName || 'cover').replace(/\s+/g, '-').toLowerCase()}.pdf`);
  };

  const handlePrint = () => {
    if (!previewRef.current) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<html><head><title>Cover Letter</title><style>body{font-family:Arial,sans-serif;max-width:700px;margin:40px auto;font-size:13px;line-height:1.6;color:#1e293b;}h2{margin:0 0 4px;}.header{margin-bottom:20px;}</style></head><body>${previewRef.current.innerHTML}</body></html>`);
    win.document.close(); win.print();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="w-full py-10 px-4 text-white text-center" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex justify-center mb-3"><FileText className="w-10 h-10 opacity-90" /></div>
        <h1 className="text-3xl font-bold mb-2">Cover Letter Generator</h1>
        <p className="text-blue-100 max-w-xl mx-auto">Create a professional, personalised cover letter in seconds. Choose a template and download as PDF or print.</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 grid lg:grid-cols-5 gap-6">
        {/* Controls */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h2 className="font-semibold text-slate-800 mb-3">Template Style</h2>
            <div className="space-y-2">
              {TEMPLATES.map(t => (
                <button key={t.id} onClick={() => setTemplate(t.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${template === t.id ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-700 hover:border-blue-300'}`}>
                  <div className="font-medium text-sm">{t.label}</div>
                  <div className={`text-xs mt-0.5 ${template === t.id ? 'text-blue-100' : 'text-slate-400'}`}>{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-3">
            <h2 className="font-semibold text-slate-800 mb-1">Your Details</h2>
            {[
              { label: 'Your Name', value: applicantName, set: setApplicantName },
              { label: 'Email', value: applicantEmail, set: setApplicantEmail },
              { label: 'Phone', value: applicantPhone, set: setApplicantPhone },
            ].map(f => (
              <div key={f.label}>
                <label className="block text-xs text-slate-500 mb-1">{f.label}</label>
                <input value={f.value} onChange={e => f.set(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-3">
            <h2 className="font-semibold text-slate-800 mb-1">Job Details</h2>
            {[
              { label: 'Job Title', value: jobTitle, set: setJobTitle },
              { label: 'Company Name', value: company, set: setCompany },
              { label: 'Hiring Manager Name (optional)', value: hiringManager, set: setHiringManager },
              { label: 'Years of Experience', value: experience, set: setExperience },
            ].map(f => (
              <div key={f.label}>
                <label className="block text-xs text-slate-500 mb-1">{f.label}</label>
                <input value={f.value} onChange={e => f.set(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
            ))}
            <div>
              <label className="block text-xs text-slate-500 mb-1">Key Skills (comma-separated)</label>
              <input value={skills} onChange={e => setSkills(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Why You're Interested</label>
              <textarea value={whyInterested} onChange={e => setWhyInterested(e.target.value)} rows={3}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none" />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Letter header */}
            {(template === 'modern' || template === 'creative') && (
              <div className="px-8 py-5 text-white" style={{ background: accent }}>
                <h2 className="text-xl font-bold">{applicantName || 'Your Name'}</h2>
                <p className="text-sm opacity-80 mt-0.5">{[applicantEmail, applicantPhone].filter(Boolean).join('  ·  ')}</p>
              </div>
            )}
            <div ref={previewRef} className="p-8 font-serif text-slate-800 text-sm leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
              {template === 'formal' && (
                <div className="mb-6">
                  <p className="text-lg font-bold">{applicantName || 'Your Name'}</p>
                  <p className="text-slate-500 text-xs">{[applicantEmail, applicantPhone].filter(Boolean).join('  |  ')}</p>
                  <hr className="mt-3 border-slate-200" />
                </div>
              )}
              <p className="text-slate-400 text-xs mb-4">{letter.today}</p>
              <p className="font-semibold mb-4">{letter.greeting}</p>
              <p className="mb-3">{letter.opening}</p>
              <p className="mb-3">{letter.body}</p>
              <p className="mb-3">{letter.whyParagraph}</p>
              <p className="mb-6">I would welcome the opportunity to discuss how my experience aligns with your needs. Thank you for your consideration. I look forward to hearing from you.</p>
              <p className="mb-2">Sincerely,</p>
              <p className="font-bold" style={{ color: accent }}>{letter.closing}</p>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={handleDownloadPdf}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors text-sm">
                <Download className="w-4 h-4" /> Download PDF
              </button>
              <button onClick={handlePrint}
                className="flex items-center justify-center gap-2 px-5 py-3 border border-slate-200 hover:bg-slate-50 rounded-xl font-medium text-slate-700 transition-colors text-sm">
                <Printer className="w-4 h-4" /> Print
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><h3 className="font-semibold text-blue-900 text-sm">Pro Tips</h3></div>
            <ul className="space-y-1.5 text-sm text-blue-800">
              <li>• Tailor the "Why You're Interested" section for every application.</li>
              <li>• Keep skills to 3–5 specific, relevant abilities rather than generic traits.</li>
              <li>• Address the hiring manager by name if known — it boosts open rates.</li>
              <li>• Read the job description and mirror its keywords in your letter.</li>
              <li>• One page maximum — brevity signals good communication skills.</li>
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
                <button key={v} onClick={() => { setFeedback(v); localStorage.setItem('feedback_cover-letter-generator', v); }}
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
