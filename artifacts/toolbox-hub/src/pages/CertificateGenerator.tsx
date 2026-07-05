import React, { useState, useRef, useEffect, useCallback } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  Download, Printer, RefreshCw, FileImage, Award,
  Loader2, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

// ─── Constants ────────────────────────────────────────────────────────────────

const CERT_W = 1000;
const CERT_H = 707;

type TemplateId = 'classic' | 'modern' | 'royal' | 'academic' | 'corporate';

interface Template { id: TemplateId; name: string; palette: string[] }
const TEMPLATES: Template[] = [
  { id: 'classic',   name: 'Classic Elegance', palette: ['#1a2744', '#c9a55a', '#ffffff'] },
  { id: 'modern',    name: 'Modern Blue',       palette: ['#1d4ed8', '#3b82f6', '#ffffff'] },
  { id: 'royal',     name: 'Royal Gold',        palette: ['#0d1b3e', '#d4a843', '#0d1b3e'] },
  { id: 'academic',  name: 'Parchment',         palette: ['#fef9ec', '#8b1a1a', '#3d2b1f'] },
  { id: 'corporate', name: 'Corporate',         palette: ['#1e3a5f', '#0ea5e9', '#ffffff'] },
];

// ─── Data model ───────────────────────────────────────────────────────────────

interface CertData {
  orgName: string;
  certTitle: string;
  recipientName: string;
  awardDescription: string;
  courseName: string;
  grade: string;
  date: string;
  sig1Name: string;
  sig1Title: string;
  sig2Name: string;
  sig2Title: string;
}

const DEFAULT_DATA: CertData = {
  orgName: '',
  certTitle: 'Certificate of Achievement',
  recipientName: '',
  awardDescription: 'has successfully completed and demonstrated outstanding performance in',
  courseName: '',
  grade: '',
  date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  sig1Name: '',
  sig1Title: '',
  sig2Name: '',
  sig2Title: '',
};

// ─── Shared helpers ───────────────────────────────────────────────────────────

const orPlaceholder = (val: string, fallback: string) => val.trim() || fallback;

// ─── Template: Classic Elegance ───────────────────────────────────────────────

function ClassicTemplate({ d }: { d: CertData }) {
  const navy = '#1a2744';
  const gold = '#c9a55a';
  return (
    <div style={{ width: CERT_W, height: CERT_H, background: '#fff', position: 'relative', fontFamily: 'Georgia, "Times New Roman", serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0', boxSizing: 'border-box' }}>
      {/* Outer border */}
      <div style={{ position: 'absolute', inset: 18, border: `5px solid ${navy}` }} />
      {/* Inner border */}
      <div style={{ position: 'absolute', inset: 28, border: `1.5px solid ${gold}` }} />
      {/* Corner ornaments */}
      {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v,h]) => (
        <div key={v+h} style={{ position:'absolute', [v]: 10, [h]: 10, width: 40, height: 40,
          borderTop: v==='top'?`4px solid ${gold}`:'none',
          borderBottom: v==='bottom'?`4px solid ${gold}`:'none',
          borderLeft: h==='left'?`4px solid ${gold}`:'none',
          borderRight: h==='right'?`4px solid ${gold}`:'none',
        }} />
      ))}

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, padding: '50px 80px', width: '100%', boxSizing: 'border-box' }}>
        {/* Org name */}
        <div style={{ fontSize: 13, letterSpacing: 5, textTransform: 'uppercase', color: navy, fontWeight: 700, marginBottom: 10 }}>
          {orPlaceholder(d.orgName, 'Organization Name')}
        </div>
        {/* Gold rule */}
        <div style={{ display:'flex', alignItems:'center', gap: 12, width:'60%', marginBottom: 14 }}>
          <div style={{ flex:1, height:1, background: gold }} />
          <span style={{ color: gold, fontSize: 18 }}>✦</span>
          <div style={{ flex:1, height:1, background: gold }} />
        </div>
        {/* Cert title */}
        <div style={{ fontSize: 36, fontWeight: 700, color: navy, letterSpacing: 2, marginBottom: 8 }}>
          {orPlaceholder(d.certTitle, 'Certificate of Achievement')}
        </div>
        <div style={{ fontSize: 12, letterSpacing: 4, textTransform: 'uppercase', color: '#666', marginBottom: 14 }}>
          Proudly Presented To
        </div>
        {/* Recipient */}
        <div style={{ fontSize: 42, fontStyle: 'italic', color: gold, fontWeight: 400, marginBottom: 10, textAlign: 'center' }}>
          {orPlaceholder(d.recipientName, 'Recipient Name')}
        </div>
        {/* Description */}
        <div style={{ fontSize: 13, color: '#444', textAlign: 'center', maxWidth: 560, lineHeight: 1.6, marginBottom: 6 }}>
          {orPlaceholder(d.awardDescription, 'has successfully completed and demonstrated outstanding performance in')}
        </div>
        {/* Course */}
        <div style={{ fontSize: 18, fontWeight: 700, color: navy, marginBottom: 4, textAlign:'center' }}>
          {orPlaceholder(d.courseName, 'Course / Event Name')}
        </div>
        {/* Grade */}
        {d.grade && <div style={{ fontSize: 13, color: gold, fontWeight: 600, marginBottom: 6 }}>Grade / Award: {d.grade}</div>}
        {/* Gold rule */}
        <div style={{ display:'flex', alignItems:'center', gap: 12, width:'50%', margin: '10px 0' }}>
          <div style={{ flex:1, height:1, background: gold }} />
          <span style={{ color: gold, fontSize: 14 }}>★</span>
          <div style={{ flex:1, height:1, background: gold }} />
        </div>
        {/* Date */}
        <div style={{ fontSize: 12, color: '#666', letterSpacing: 1, marginBottom: 16 }}>{d.date || 'Date'}</div>
        {/* Signatures */}
        <div style={{ display:'flex', justifyContent:'space-around', width:'80%', gap: 20 }}>
          {[{ name: d.sig1Name, title: d.sig1Title, ph1: 'Signature Name', ph2: 'Title' },
            ...(d.sig2Name || d.sig2Title ? [{ name: d.sig2Name, title: d.sig2Title, ph1: 'Signature Name', ph2: 'Title' }] : [])
          ].map((s, i) => (
            <div key={i} style={{ textAlign:'center', minWidth: 160 }}>
              <div style={{ borderTop: `1.5px solid ${navy}`, paddingTop: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: navy }}>{s.name || s.ph1}</div>
                <div style={{ fontSize: 11, color: '#666', letterSpacing: 1 }}>{s.title || s.ph2}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Template: Modern Blue ────────────────────────────────────────────────────

function ModernTemplate({ d }: { d: CertData }) {
  const blue = '#1d4ed8';
  const lightBlue = '#3b82f6';
  return (
    <div style={{ width: CERT_W, height: CERT_H, background: '#fff', position: 'relative', fontFamily: '"Segoe UI", Arial, sans-serif', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', overflow: 'hidden' }}>
      {/* Top gradient bar */}
      <div style={{ background: `linear-gradient(135deg, ${blue} 0%, ${lightBlue} 100%)`, height: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0 }}>
        {/* Geometric accent circles */}
        <div style={{ position:'absolute', right: -40, top: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position:'absolute', right: 20, top: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position:'absolute', left: -30, bottom: -30, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ fontSize: 13, letterSpacing: 5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)', marginBottom: 6 }}>
          {orPlaceholder(d.orgName, 'Organization Name')}
        </div>
        <div style={{ fontSize: 30, fontWeight: 800, color: '#fff', letterSpacing: 1 }}>
          {orPlaceholder(d.certTitle, 'Certificate of Achievement')}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '28px 80px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 12, letterSpacing: 4, textTransform: 'uppercase', color: '#888', marginBottom: 8 }}>This certificate is proudly awarded to</div>
        <div style={{ fontSize: 48, fontWeight: 800, color: blue, lineHeight: 1.1, marginBottom: 10 }}>
          {orPlaceholder(d.recipientName, 'Recipient Name')}
        </div>
        <div style={{ width: 60, height: 3, background: `linear-gradient(90deg, ${blue}, ${lightBlue})`, borderRadius: 2, marginBottom: 12 }} />
        <div style={{ fontSize: 14, color: '#555', maxWidth: 520, lineHeight: 1.7, marginBottom: 6 }}>
          {orPlaceholder(d.awardDescription, 'has successfully completed and demonstrated outstanding performance in')}
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#222', marginBottom: d.grade ? 4 : 0 }}>
          {orPlaceholder(d.courseName, 'Course / Event Name')}
        </div>
        {d.grade && <div style={{ fontSize: 13, color: lightBlue, fontWeight: 600, marginTop: 2 }}>Grade / Award: {d.grade}</div>}
      </div>

      {/* Footer bar */}
      <div style={{ background: '#f8faff', borderTop: `3px solid ${blue}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '14px 60px 18px', flexShrink: 0 }}>
        <div style={{ fontSize: 12, color: '#888' }}>{d.date || 'Date'}</div>
        <div style={{ display:'flex', gap: 60 }}>
          {[{ name: d.sig1Name, title: d.sig1Title },
            ...(d.sig2Name || d.sig2Title ? [{ name: d.sig2Name, title: d.sig2Title }] : [])
          ].map((s, i) => (
            <div key={i} style={{ textAlign:'center' }}>
              <div style={{ borderTop: `2px solid ${blue}`, paddingTop: 5, minWidth: 140 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#222' }}>{s.name || 'Signature Name'}</div>
                <div style={{ fontSize: 11, color: '#888' }}>{s.title || 'Title'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Template: Royal Gold ─────────────────────────────────────────────────────

function RoyalTemplate({ d }: { d: CertData }) {
  const bg = '#0d1b3e';
  const gold = '#d4a843';
  const lightGold = '#f0d080';
  return (
    <div style={{ width: CERT_W, height: CERT_H, background: bg, position: 'relative', fontFamily: 'Georgia, "Times New Roman", serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}>
      {/* Thin gold outer border */}
      <div style={{ position:'absolute', inset: 16, border: `1px solid ${gold}`, opacity: 0.6 }} />
      <div style={{ position:'absolute', inset: 22, border: `1px solid ${gold}`, opacity: 0.3 }} />

      {/* Corner ornaments */}
      {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v,h]) => (
        <div key={v+h} style={{
          position:'absolute', [v]: 24, [h]: 24,
          width: 36, height: 36,
          borderTop: v==='top' ? `2px solid ${gold}` : 'none',
          borderBottom: v==='bottom' ? `2px solid ${gold}` : 'none',
          borderLeft: h==='left' ? `2px solid ${gold}` : 'none',
          borderRight: h==='right' ? `2px solid ${gold}` : 'none',
        }} />
      ))}

      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap: 0, padding: '50px 80px', width:'100%', boxSizing:'border-box', textAlign:'center' }}>
        {/* Crown SVG */}
        <svg width="48" height="36" viewBox="0 0 48 36" style={{ marginBottom: 8 }}>
          <polygon points="4,32 4,12 14,22 24,4 34,22 44,12 44,32" fill="none" stroke={gold} strokeWidth="1.8" strokeLinejoin="round" />
          <line x1="4" y1="32" x2="44" y2="32" stroke={gold} strokeWidth="1.8" />
          <circle cx="4" cy="12" r="2.5" fill={gold} />
          <circle cx="24" cy="4" r="2.5" fill={gold} />
          <circle cx="44" cy="12" r="2.5" fill={gold} />
        </svg>
        <div style={{ fontSize: 12, letterSpacing: 5, textTransform:'uppercase', color: gold, marginBottom: 10 }}>
          {orPlaceholder(d.orgName, 'Organization Name')}
        </div>
        {/* Decorative rule */}
        <div style={{ display:'flex', alignItems:'center', gap: 10, width:'55%', marginBottom: 12 }}>
          <div style={{ flex:1, height:1, background:`linear-gradient(90deg, transparent, ${gold})` }} />
          <span style={{ color: gold, fontSize: 16 }}>◆</span>
          <div style={{ flex:1, height:1, background:`linear-gradient(90deg, ${gold}, transparent)` }} />
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, color: gold, letterSpacing: 3, marginBottom: 10 }}>
          {orPlaceholder(d.certTitle, 'Certificate of Achievement')}
        </div>
        <div style={{ fontSize: 12, letterSpacing: 4, textTransform:'uppercase', color: 'rgba(212,168,67,0.7)', marginBottom: 12 }}>
          Bestowed Upon
        </div>
        <div style={{ fontSize: 44, fontStyle:'italic', color: lightGold, fontWeight: 400, lineHeight:1.1, marginBottom: 12, textShadow: `0 2px 20px rgba(212,168,67,0.3)` }}>
          {orPlaceholder(d.recipientName, 'Recipient Name')}
        </div>
        <div style={{ fontSize: 13, color: 'rgba(212,168,67,0.75)', maxWidth: 520, lineHeight: 1.7, marginBottom: 6 }}>
          {orPlaceholder(d.awardDescription, 'has successfully completed and demonstrated outstanding performance in')}
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, color: gold, marginBottom: d.grade ? 4 : 0 }}>
          {orPlaceholder(d.courseName, 'Course / Event Name')}
        </div>
        {d.grade && <div style={{ fontSize: 12, color: 'rgba(212,168,67,0.7)', marginBottom: 4 }}>Grade / Award: {d.grade}</div>}
        {/* Rule */}
        <div style={{ display:'flex', alignItems:'center', gap: 10, width:'45%', margin:'12px 0' }}>
          <div style={{ flex:1, height:1, background:`linear-gradient(90deg, transparent, ${gold})`, opacity:0.5 }} />
          <span style={{ color: gold, fontSize: 12, opacity:0.7 }}>✦</span>
          <div style={{ flex:1, height:1, background:`linear-gradient(90deg, ${gold}, transparent)`, opacity:0.5 }} />
        </div>
        <div style={{ fontSize: 11, color: 'rgba(212,168,67,0.6)', letterSpacing: 2, marginBottom: 14 }}>{d.date || 'Date'}</div>
        {/* Signatures */}
        <div style={{ display:'flex', gap: 60, justifyContent:'center' }}>
          {[{ name: d.sig1Name, title: d.sig1Title },
            ...(d.sig2Name || d.sig2Title ? [{ name: d.sig2Name, title: d.sig2Title }] : [])
          ].map((s, i) => (
            <div key={i} style={{ textAlign:'center', minWidth: 140 }}>
              <div style={{ borderTop:`1px solid ${gold}`, paddingTop: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: gold }}>{s.name || 'Signature Name'}</div>
                <div style={{ fontSize: 11, color:'rgba(212,168,67,0.6)' }}>{s.title || 'Title'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Template: Parchment Academic ────────────────────────────────────────────

function AcademicTemplate({ d }: { d: CertData }) {
  const cream = '#fef9ec';
  const brown = '#3d2b1f';
  const red = '#8b1a1a';
  const darkBrown = '#2a1a0f';
  return (
    <div style={{ width: CERT_W, height: CERT_H, background: cream, position:'relative', fontFamily: 'Georgia, "Times New Roman", serif', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', boxSizing:'border-box', overflow:'hidden' }}>
      {/* Parchment texture via radial gradients */}
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 20% 30%, rgba(139,90,43,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 70%, rgba(139,90,43,0.05) 0%, transparent 60%)', pointerEvents:'none' }} />

      {/* Outer border */}
      <div style={{ position:'absolute', inset:14, border:`3px solid ${brown}` }} />
      <div style={{ position:'absolute', inset:20, border:`1px solid rgba(61,43,31,0.3)` }} />

      {/* Top decorative band */}
      <div style={{ position:'absolute', top:24, left:24, right:24, height:8, background:`repeating-linear-gradient(90deg, ${red} 0px, ${red} 4px, ${cream} 4px, ${cream} 12px)`, opacity:0.4 }} />
      <div style={{ position:'absolute', bottom:24, left:24, right:24, height:8, background:`repeating-linear-gradient(90deg, ${red} 0px, ${red} 4px, ${cream} 4px, ${cream} 12px)`, opacity:0.4 }} />

      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:0, padding:'52px 80px', width:'100%', boxSizing:'border-box', textAlign:'center', position:'relative', zIndex:1 }}>
        {/* Seal circle */}
        <div style={{ width:60, height:60, borderRadius:'50%', border:`2px solid ${red}`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:10, flexShrink:0 }}>
          <div style={{ width:46, height:46, borderRadius:'50%', border:`1px solid ${red}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={{ fontSize:20, color:red }}>★</span>
          </div>
        </div>
        <div style={{ fontSize:11, letterSpacing:5, textTransform:'uppercase', color:brown, marginBottom:4 }}>
          {orPlaceholder(d.orgName, 'Organization Name')}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10, width:'55%', marginBottom:10 }}>
          <div style={{ flex:1, height:1, background:brown, opacity:0.3 }} />
          <span style={{ color:red, fontSize:12 }}>❧</span>
          <div style={{ flex:1, height:1, background:brown, opacity:0.3 }} />
        </div>
        <div style={{ fontSize:28, fontWeight:700, color:darkBrown, letterSpacing:2, marginBottom:8 }}>
          {orPlaceholder(d.certTitle, 'Certificate of Achievement')}
        </div>
        <div style={{ fontSize:11, letterSpacing:4, textTransform:'uppercase', color:'#888', marginBottom:10 }}>This is to certify that</div>
        <div style={{ fontSize:40, fontStyle:'italic', color:red, fontWeight:400, lineHeight:1.1, marginBottom:8 }}>
          {orPlaceholder(d.recipientName, 'Recipient Name')}
        </div>
        <div style={{ fontSize:13, color:brown, maxWidth:520, lineHeight:1.7, marginBottom:5 }}>
          {orPlaceholder(d.awardDescription, 'has successfully completed and demonstrated outstanding performance in')}
        </div>
        <div style={{ fontSize:18, fontWeight:700, color:darkBrown, marginBottom: d.grade ? 4 : 0 }}>
          {orPlaceholder(d.courseName, 'Course / Event Name')}
        </div>
        {d.grade && <div style={{ fontSize:12, color:red, fontWeight:600, marginTop:2 }}>Grade / Award: {d.grade}</div>}
        <div style={{ display:'flex', alignItems:'center', gap:10, width:'40%', margin:'12px 0' }}>
          <div style={{ flex:1, height:1, background:brown, opacity:0.25 }} />
          <span style={{ color:red, fontSize:10 }}>✦</span>
          <div style={{ flex:1, height:1, background:brown, opacity:0.25 }} />
        </div>
        <div style={{ fontSize:11, color:brown, opacity:0.6, letterSpacing:1, marginBottom:14 }}>{d.date || 'Date'}</div>
        <div style={{ display:'flex', gap:60, justifyContent:'center' }}>
          {[{ name: d.sig1Name, title: d.sig1Title },
            ...(d.sig2Name || d.sig2Title ? [{ name: d.sig2Name, title: d.sig2Title }] : [])
          ].map((s, i) => (
            <div key={i} style={{ textAlign:'center', minWidth:140 }}>
              <div style={{ borderTop:`1px solid ${brown}`, paddingTop:6, opacity:0.7 }}>
                <div style={{ fontSize:12, fontWeight:700, color:darkBrown }}>{s.name || 'Signature Name'}</div>
                <div style={{ fontSize:11, color:'#888' }}>{s.title || 'Title'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Template: Corporate Professional ────────────────────────────────────────

function CorporateTemplate({ d }: { d: CertData }) {
  const darkBlue = '#1e3a5f';
  const accent = '#0ea5e9';
  return (
    <div style={{ width: CERT_W, height: CERT_H, background:'#fff', position:'relative', fontFamily:'"Segoe UI", Arial, sans-serif', display:'flex', flexDirection:'row', boxSizing:'border-box', overflow:'hidden' }}>
      {/* Left sidebar */}
      <div style={{ width:270, background:darkBlue, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'space-between', padding:'40px 24px', flexShrink:0, position:'relative', overflow:'hidden' }}>
        {/* Decorative circles */}
        <div style={{ position:'absolute', top:-60, left:-60, width:200, height:200, borderRadius:'50%', background:'rgba(255,255,255,0.04)' }} />
        <div style={{ position:'absolute', bottom:-80, right:-80, width:250, height:250, borderRadius:'50%', background:'rgba(255,255,255,0.05)' }} />
        <div style={{ position:'absolute', bottom:80, left:-40, width:120, height:120, borderRadius:'50%', background:'rgba(14,165,233,0.1)' }} />

        <div style={{ textAlign:'center', position:'relative', zIndex:1 }}>
          {/* Award icon */}
          <div style={{ width:64, height:64, borderRadius:'50%', background:'rgba(14,165,233,0.2)', border:`2px solid ${accent}`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
            <span style={{ fontSize:28, color:accent }}>🏆</span>
          </div>
          <div style={{ fontSize:10, letterSpacing:4, textTransform:'uppercase', color:'rgba(255,255,255,0.6)', marginBottom:8 }}>Presented by</div>
          <div style={{ fontSize:15, fontWeight:800, color:'#fff', lineHeight:1.3, textAlign:'center' }}>
            {orPlaceholder(d.orgName, 'Organization Name')}
          </div>
          <div style={{ width:40, height:2, background:accent, margin:'14px auto 0', borderRadius:1 }} />
        </div>

        {/* Vertical decorative dots */}
        <div style={{ display:'flex', flexDirection:'column', gap:6, position:'relative', zIndex:1 }}>
          {[...Array(5)].map((_,i)=>(
            <div key={i} style={{ width:6, height:6, borderRadius:'50%', background: i===2 ? accent : 'rgba(255,255,255,0.2)' }} />
          ))}
        </div>

        <div style={{ textAlign:'center', position:'relative', zIndex:1 }}>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)', marginBottom:4 }}>{d.date || 'Date'}</div>
          <div style={{ width:40, height:1, background:'rgba(255,255,255,0.2)', margin:'0 auto' }} />
        </div>
      </div>

      {/* Right content */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', padding:'40px 50px' }}>
        {/* Top accent line */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
          <div style={{ width:30, height:3, background:accent, borderRadius:2 }} />
          <div style={{ flex:1, height:1, background:'#e5e7eb' }} />
        </div>

        <div style={{ fontSize:11, letterSpacing:4, textTransform:'uppercase', color:'#888', marginBottom:10 }}>
          {orPlaceholder(d.certTitle, 'Certificate of Achievement')}
        </div>
        <div style={{ fontSize:11, color:'#aaa', marginBottom:6 }}>This certificate is awarded to</div>
        <div style={{ fontSize:44, fontWeight:800, color:darkBlue, lineHeight:1.1, marginBottom:12 }}>
          {orPlaceholder(d.recipientName, 'Recipient Name')}
        </div>
        <div style={{ fontSize:13, color:'#555', lineHeight:1.7, maxWidth:440, marginBottom:8 }}>
          {orPlaceholder(d.awardDescription, 'has successfully completed and demonstrated outstanding performance in')}
        </div>
        <div style={{ fontSize:19, fontWeight:700, color:'#222', marginBottom: d.grade ? 4 : 0 }}>
          {orPlaceholder(d.courseName, 'Course / Event Name')}
        </div>
        {d.grade && <div style={{ fontSize:12, color:accent, fontWeight:600, marginBottom:0 }}>Grade / Award: {d.grade}</div>}

        {/* Bottom accent */}
        <div style={{ display:'flex', alignItems:'center', gap:10, margin:'20px 0 16px' }}>
          <div style={{ flex:1, height:1, background:'#e5e7eb' }} />
          <div style={{ width:30, height:3, background:accent, borderRadius:2 }} />
        </div>

        {/* Signatures */}
        <div style={{ display:'flex', gap:40 }}>
          {[{ name: d.sig1Name, title: d.sig1Title },
            ...(d.sig2Name || d.sig2Title ? [{ name: d.sig2Name, title: d.sig2Title }] : [])
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize:13, fontWeight:700, color:darkBlue }}>{s.name || 'Signature Name'}</div>
              <div style={{ fontSize:11, color:'#888', borderTop:'1px solid #ddd', paddingTop:4, marginTop:4 }}>{s.title || 'Title'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Template renderer ────────────────────────────────────────────────────────

function CertificatePreview({ data, template }: { data: CertData; template: TemplateId }) {
  switch (template) {
    case 'classic':   return <ClassicTemplate d={data} />;
    case 'modern':    return <ModernTemplate d={data} />;
    case 'royal':     return <RoyalTemplate d={data} />;
    case 'academic':  return <AcademicTemplate d={data} />;
    case 'corporate': return <CorporateTemplate d={data} />;
  }
}

// ─── Field component ──────────────────────────────────────────────────────────

function Field({ label, id, optional, children }: { label: string; id: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-semibold flex items-center gap-1.5">
        {label}
        {optional && <span className="text-xs font-normal text-muted-foreground">(Optional)</span>}
      </Label>
      {children}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CertificateGenerator() {
  const [data, setData] = useState<CertData>(DEFAULT_DATA);
  const [template, setTemplate] = useState<TemplateId>('classic');
  const [exporting, setExporting] = useState(false);
  const [showSig2, setShowSig2] = useState(false);

  // captureRef → off-screen, never transformed; used exclusively by html2canvas
  const captureRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const { toast } = useToast();

  // Scale certificate preview to fit container width
  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        setScale(Math.min(w / CERT_W, 1));
      }
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const set = (key: keyof CertData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setData(prev => ({ ...prev, [key]: e.target.value }));

  // ── Capture helpers ──────────────────────────────────────────────────────

  const capture = useCallback(async (hiDpi = 2): Promise<HTMLCanvasElement | null> => {
    if (!captureRef.current) return null;
    return html2canvas(captureRef.current, {
      scale: hiDpi,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false,
    });
  }, []);

  const exportPng = async () => {
    setExporting(true);
    try {
      const canvas = await capture(2);
      if (!canvas) throw new Error('capture failed');
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.recipientName.trim() || 'certificate'}-certificate.png`;
      a.click();
      toast({ title: 'PNG Downloaded!', description: 'Certificate saved as a PNG image.', duration: 2500 });
    } catch {
      toast({ title: 'Export failed', description: 'Could not generate PNG. Please try again.', variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  const exportPdf = async () => {
    setExporting(true);
    try {
      const canvas = await capture(2);
      if (!canvas) throw new Error('capture failed');
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'PNG', 0, 0, pw, ph);
      pdf.save(`${data.recipientName.trim() || 'certificate'}-certificate.pdf`);
      toast({ title: 'PDF Downloaded!', description: 'Certificate saved as a landscape A4 PDF.', duration: 2500 });
    } catch {
      toast({ title: 'Export failed', description: 'Could not generate PDF. Please try again.', variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = async () => {
    setExporting(true);
    try {
      const canvas = await capture(2);
      if (!canvas) throw new Error('capture failed');
      const url = canvas.toDataURL('image/png');
      const win = window.open('', '_blank');
      if (!win) throw new Error('popup blocked');
      win.document.write(`
        <html><head><title>Certificate</title>
        <style>
          * { margin:0; padding:0; box-sizing:border-box; }
          body { display:flex; align-items:center; justify-content:center; min-height:100vh; background:#f5f5f5; }
          img { max-width:100%; box-shadow:0 4px 24px rgba(0,0,0,0.15); }
          @media print { body { background:white; } img { box-shadow:none; width:100%; height:auto; } }
        </style>
        </head><body>
        <img src="${url}" alt="Certificate" onload="window.print(); setTimeout(()=>window.close(), 500);" />
        </body></html>
      `);
      win.document.close();
    } catch {
      toast({ title: 'Print failed', description: 'Allow pop-ups for this site to use print.', variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  const handleReset = () => {
    setData(DEFAULT_DATA);
    setTemplate('classic');
    setShowSig2(false);
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="max-w-screen-xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Certificate Generator</h1>
        <p className="text-muted-foreground">Design professional certificates instantly — no sign-up, all in your browser</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6 items-start">

        {/* ── Left: Form ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-5 xl:sticky xl:top-4">

          {/* Template selector */}
          <div className="space-y-3">
            <Label className="text-base font-semibold block">Template</Label>
            <div className="grid grid-cols-5 gap-2">
              {TEMPLATES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  title={t.name}
                  className={`relative rounded-lg overflow-hidden border-2 transition-all cursor-pointer aspect-[1.41] flex flex-col ${
                    template === t.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Mini palette swatch */}
                  <div className="flex-1" style={{ background: t.palette[0] }} />
                  <div className="h-[35%]" style={{ background: t.palette[2] }} />
                  {template === t.id && (
                    <div className="absolute inset-0 flex items-end justify-center pb-1">
                      <span className="text-[9px] font-bold text-white bg-blue-500 rounded px-1 leading-4 shadow">{t.name.split(' ')[0]}</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {TEMPLATES.find(t => t.id === template)?.name}
            </p>
          </div>

          <div className="border-t" />

          {/* Organization & Title */}
          <Field label="Organization / Business Name" id="orgName">
            <Input id="orgName" placeholder="e.g. Acme Academy" value={data.orgName} onChange={set('orgName')} />
          </Field>
          <Field label="Certificate Title" id="certTitle">
            <Input id="certTitle" placeholder="e.g. Certificate of Achievement" value={data.certTitle} onChange={set('certTitle')} />
          </Field>

          <div className="border-t" />

          {/* Recipient */}
          <Field label="Recipient Name" id="recipientName">
            <Input id="recipientName" placeholder="e.g. Jane Smith" value={data.recipientName} onChange={set('recipientName')} />
          </Field>
          <Field label="Award Description" id="awardDescription">
            <textarea
              id="awardDescription"
              rows={2}
              placeholder="e.g. has successfully completed and demonstrated outstanding performance in"
              value={data.awardDescription}
              onChange={set('awardDescription')}
              className="w-full border rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </Field>
          <Field label="Course / Event Name" id="courseName">
            <Input id="courseName" placeholder="e.g. Advanced Web Development" value={data.courseName} onChange={set('courseName')} />
          </Field>
          <Field label="Grade or Award" id="grade" optional>
            <Input id="grade" placeholder="e.g. With Distinction" value={data.grade} onChange={set('grade')} />
          </Field>
          <Field label="Date" id="date">
            <Input id="date" type="text" value={data.date} onChange={set('date')} />
          </Field>

          <div className="border-t" />

          {/* Signature 1 */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Signature 1</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="sig1Name" className="text-xs text-muted-foreground">Name</Label>
                <Input id="sig1Name" placeholder="e.g. Dr. Sarah Lee" value={data.sig1Name} onChange={set('sig1Name')} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="sig1Title" className="text-xs text-muted-foreground">Title / Role</Label>
                <Input id="sig1Title" placeholder="e.g. Director" value={data.sig1Title} onChange={set('sig1Title')} />
              </div>
            </div>
          </div>

          {/* Signature 2 toggle */}
          <button
            onClick={() => {
              if (showSig2) setData(prev => ({ ...prev, sig2Name: '', sig2Title: '' }));
              setShowSig2(v => !v);
            }}
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            {showSig2 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {showSig2 ? 'Remove second signature' : 'Add second signature'}
          </button>
          {showSig2 && (
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Signature 2 <span className="text-xs font-normal text-muted-foreground">(Optional)</span></Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="sig2Name" className="text-xs text-muted-foreground">Name</Label>
                  <Input id="sig2Name" placeholder="Name" value={data.sig2Name} onChange={set('sig2Name')} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="sig2Title" className="text-xs text-muted-foreground">Title / Role</Label>
                  <Input id="sig2Title" placeholder="Title / Role" value={data.sig2Title} onChange={set('sig2Title')} />
                </div>
              </div>
            </div>
          )}

          <div className="border-t" />

          {/* Reset */}
          <Button variant="outline" onClick={handleReset} className="w-full gap-2 text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50">
            <RefreshCw className="w-4 h-4" />
            Reset All Fields
          </Button>
        </div>

        {/* ── Right: Preview + actions ────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Action bar */}
          <div className="bg-white rounded-2xl shadow-sm border p-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 mr-auto">
              <Award className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-sm">Certificate Preview</span>
              <span className="text-xs text-muted-foreground hidden sm:inline">— updates as you type</span>
            </div>
            <Button variant="outline" size="sm" onClick={handlePrint} disabled={exporting} className="gap-2">
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={exportPng} disabled={exporting} className="gap-2">
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileImage className="w-4 h-4" />}
              PNG
            </Button>
            <Button size="sm" onClick={exportPdf} disabled={exporting} className="gap-2">
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Download PDF
            </Button>
          </div>

          {/* Certificate preview */}
          <div className="bg-blue-50/50 rounded-2xl border border-blue-100 p-4 overflow-hidden">
            <div ref={containerRef} className="w-full">
              <div
                style={{
                  width: '100%',
                  height: CERT_H * scale,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: CERT_W,
                    height: CERT_H,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    boxShadow: '0 4px 32px rgba(0,0,0,0.12)',
                    borderRadius: 4,
                  }}
                >
                  {/* Visual preview only — not captured */}
                  <div style={{ width: CERT_W, height: CERT_H }}>
                    <CertificatePreview data={data} template={template} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Usage hint */}
          <p className="text-center text-xs text-muted-foreground">
            Works for businesses · schools · churches · events · competitions · online courses · teachers · employers
          </p>
        </div>
      </div>

      {/* Off-screen capture target — full 1000×707, no CSS transform ancestor */}
      <div
        ref={captureRef}
        style={{
          position: 'fixed',
          left: -9999,
          top: 0,
          width: CERT_W,
          height: CERT_H,
          pointerEvents: 'none',
          zIndex: -1,
          overflow: 'hidden',
        }}
        aria-hidden="true"
      >
        <CertificatePreview data={data} template={template} />
      </div>
    </div>
  );
}
