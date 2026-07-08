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

type TemplateId = 'executive' | 'royal' | 'luxury' | 'academic' | 'blackgold';

interface Template { id: TemplateId; name: string; preview: [string, string] }
const TEMPLATES: Template[] = [
  { id: 'executive', name: 'Executive Gold',       preview: ['#1a1a2e', '#c9a84c'] },
  { id: 'royal',     name: 'Royal Red',            preview: ['#fdf8f0', '#8b0000'] },
  { id: 'luxury',    name: 'Luxury Blue',          preview: ['#060d1f', '#b8c4d4'] },
  { id: 'academic',  name: 'Academic Classic',     preview: ['#f5f0e8', '#1a3a1a'] },
  { id: 'blackgold', name: 'Premium Black & Gold', preview: ['#050505', '#d4a017'] },
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

const ph = (val: string, fallback: string) => val.trim() || fallback;

// ─── Template 1: Executive Gold ───────────────────────────────────────────────

function ExecutiveGoldTemplate({ d }: { d: CertData }) {
  const bg      = '#12122a';
  const gold    = '#c9a84c';
  const lgold   = '#f0d978';
  const dgold   = 'rgba(201,168,76,0.55)';
  const white   = '#f5f0e8';
  const font    = 'Georgia, "Times New Roman", serif';
  const sigs    = [
    { name: d.sig1Name, title: d.sig1Title },
    ...(d.sig2Name || d.sig2Title ? [{ name: d.sig2Name, title: d.sig2Title }] : []),
  ];

  return (
    <div style={{
      width: CERT_W, height: CERT_H,
      background: `radial-gradient(ellipse at 50% 35%, #1e1e3e 0%, #141428 45%, #0a0a1c 100%)`,
      position: 'relative', fontFamily: font,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      boxSizing: 'border-box', overflow: 'hidden',
    }}>

      {/* ── Watermark ── */}
      <svg style={{ position: 'absolute', inset: 0, width: CERT_W, height: CERT_H, pointerEvents: 'none' }}>
        <text x="500" y="390" textAnchor="middle" fontFamily={font} fontSize="160" fontWeight="900"
          fill={gold} fillOpacity="0.035" transform="rotate(-18,500,390)">
          {(d.orgName || d.certTitle || 'EXCELLENCE').toUpperCase()}
        </text>
      </svg>

      {/* ── Borders: outer thick, middle thin, inner hairline ── */}
      <div style={{ position:'absolute', inset:13,  border:`2.5px solid ${gold}`,            zIndex:1 }} />
      <div style={{ position:'absolute', inset:21,  border:`1px solid ${dgold}`,              zIndex:1 }} />
      <div style={{ position:'absolute', inset:28,  border:`0.5px solid rgba(201,168,76,.2)`, zIndex:1 }} />

      {/* ── Corner ornaments (SVG) ── */}
      {([['top','left'],[`top`,'right'],['bottom','left'],['bottom','right']] as const).map(([v,h]) => {
        const flip = `${h === 'right' ? 'scaleX(-1)' : ''} ${v === 'bottom' ? 'scaleY(-1)' : ''}`;
        return (
          <svg key={v+h}
            style={{ position:'absolute', [v]:5, [h]:5, zIndex:3,
              transform: flip.trim() || undefined,
              transformOrigin:'center center' }}
            width="90" height="90" viewBox="0 0 90 90">
            {/* Outer L */}
            <polyline points="4,86 4,4 86,4" fill="none" stroke={gold} strokeWidth="2.2" strokeLinecap="square"/>
            {/* Inner L */}
            <polyline points="14,76 14,14 76,14" fill="none" stroke={dgold} strokeWidth="1" strokeLinecap="square"/>
            {/* Corner diamond */}
            <polygon points="4,4 10,4 4,10" fill={gold} opacity="0.9"/>
            {/* Decorative notches along outer L */}
            <line x1="4" y1="30" x2="10" y2="30" stroke={gold} strokeWidth="1" opacity="0.6"/>
            <line x1="4" y1="46" x2="8"  y2="46" stroke={gold} strokeWidth="0.8" opacity="0.5"/>
            <line x1="4" y1="62" x2="10" y2="62" stroke={gold} strokeWidth="1" opacity="0.6"/>
            <line x1="30" y1="4" x2="30" y2="10" stroke={gold} strokeWidth="1" opacity="0.6"/>
            <line x1="46" y1="4" x2="46" y2="8"  stroke={gold} strokeWidth="0.8" opacity="0.5"/>
            <line x1="62" y1="4" x2="62" y2="10" stroke={gold} strokeWidth="1" opacity="0.6"/>
            {/* Inner corner dot */}
            <circle cx="14" cy="14" r="2.5" fill={gold} opacity="0.7"/>
          </svg>
        );
      })}

      {/* ── Top flourish ── */}
      <svg style={{ position:'absolute', top:36, left:0, right:0, margin:'0 auto', display:'block', zIndex:2 }}
        width="700" height="26" viewBox="0 0 700 26">
        <path d="M0,13 Q60,3 120,13 Q180,23 240,13 Q270,6 290,13" fill="none" stroke={gold} strokeWidth="1" opacity="0.45"/>
        <line x1="295" y1="13" x2="310" y2="13" stroke={gold} strokeWidth="0.7" opacity="0.5"/>
        <polygon points="322,13 329,7 336,13 329,19" fill="none" stroke={gold} strokeWidth="1.2" opacity="0.75"/>
        <polygon points="350,13 357,6 364,13 357,20" fill={gold} opacity="0.9"/>
        <polygon points="364,13 371,7 378,13 371,19" fill="none" stroke={gold} strokeWidth="1.2" opacity="0.75"/>
        <line x1="390" y1="13" x2="405" y2="13" stroke={gold} strokeWidth="0.7" opacity="0.5"/>
        <path d="M410,13 Q430,6 460,13 Q520,23 580,13 Q640,3 700,13" fill="none" stroke={gold} strokeWidth="1" opacity="0.45"/>
      </svg>

      {/* ── Bottom flourish ── */}
      <svg style={{ position:'absolute', bottom:36, left:0, right:0, margin:'0 auto', display:'block', zIndex:2 }}
        width="700" height="26" viewBox="0 0 700 26">
        <path d="M0,13 Q60,23 120,13 Q180,3 240,13 Q270,20 290,13" fill="none" stroke={gold} strokeWidth="1" opacity="0.45"/>
        <line x1="295" y1="13" x2="310" y2="13" stroke={gold} strokeWidth="0.7" opacity="0.5"/>
        <polygon points="322,13 329,19 336,13 329,7" fill="none" stroke={gold} strokeWidth="1.2" opacity="0.75"/>
        <polygon points="350,13 357,20 364,13 357,6" fill={gold} opacity="0.9"/>
        <polygon points="364,13 371,19 378,13 371,7" fill="none" stroke={gold} strokeWidth="1.2" opacity="0.75"/>
        <line x1="390" y1="13" x2="405" y2="13" stroke={gold} strokeWidth="0.7" opacity="0.5"/>
        <path d="M410,13 Q430,20 460,13 Q520,3 580,13 Q640,23 700,13" fill="none" stroke={gold} strokeWidth="1" opacity="0.45"/>
      </svg>

      {/* ── Side midpoint ornaments ── */}
      {(['left','right'] as const).map(side => (
        <svg key={side} style={{ position:'absolute', [side]:11, top: CERT_H/2-9, zIndex:2 }}
          width="18" height="18" viewBox="0 0 18 18">
          <polygon points="9,0 18,9 9,18 0,9" fill={gold} opacity="0.85"/>
          <polygon points="9,4 14,9 9,14 4,9"  fill={bg}/>
          <circle cx="9" cy="9" r="1.5" fill={gold} opacity="0.9"/>
        </svg>
      ))}

      {/* ── Content ── */}
      <div style={{
        position:'relative', zIndex:4,
        display:'flex', flexDirection:'column', alignItems:'center',
        width:'100%', padding:'64px 100px 56px',
        boxSizing:'border-box', textAlign:'center',
      }}>
        {/* Org name */}
        <div style={{ fontSize:11, letterSpacing:7, textTransform:'uppercase', color:gold, marginBottom:8, fontWeight:400 }}>
          {ph(d.orgName,'Organization Name')}
        </div>

        {/* Flourish divider */}
        <svg width="500" height="18" viewBox="0 0 500 18" style={{ marginBottom:10 }}>
          <line x1="0" y1="9" x2="195" y2="9" stroke={gold} strokeWidth="0.7" opacity="0.55"/>
          <circle cx="207" cy="9" r="2.5" fill="none" stroke={gold} strokeWidth="1" opacity="0.7"/>
          <polygon points="250,9 257,4 264,9 257,14" fill={gold} opacity="0.95"/>
          <polygon points="250,9 243,4 236,9 243,14" fill="none" stroke={gold} strokeWidth="0.9" opacity="0.6"/>
          <polygon points="264,9 271,4 278,9 271,14" fill="none" stroke={gold} strokeWidth="0.9" opacity="0.6"/>
          <circle cx="293" cy="9" r="2.5" fill="none" stroke={gold} strokeWidth="1" opacity="0.7"/>
          <line x1="305" y1="9" x2="500" y2="9" stroke={gold} strokeWidth="0.7" opacity="0.55"/>
        </svg>

        {/* Title */}
        <div style={{ fontSize:31, fontWeight:700, color:white, letterSpacing:3, textTransform:'uppercase', marginBottom:5 }}>
          {ph(d.certTitle,'Certificate of Achievement')}
        </div>

        <div style={{ fontSize:10, letterSpacing:5, textTransform:'uppercase', color:dgold, marginBottom:13 }}>
          ✦ &nbsp; Proudly Presented To &nbsp; ✦
        </div>

        {/* Recipient */}
        <div style={{ fontSize:50, fontStyle:'italic', color:lgold, fontWeight:400, lineHeight:1.1,
          marginBottom:13, letterSpacing:1, textShadow:`0 0 50px rgba(201,168,76,0.25)`,
          wordBreak:'break-word', overflowWrap:'break-word', maxWidth:'800px' }}>
          {ph(d.recipientName,'Recipient Name')}
        </div>

        {/* Description */}
        <div style={{ fontSize:12, color:'rgba(240,217,120,0.6)', maxWidth:560, lineHeight:1.75, marginBottom:5,
          wordBreak:'break-word' }}>
          {ph(d.awardDescription,'has successfully completed and demonstrated outstanding performance in')}
        </div>

        {/* Course */}
        <div style={{ fontSize:19, fontWeight:700, color:white, letterSpacing:1, marginBottom: d.grade ? 3 : 0,
          wordBreak:'break-word', maxWidth:'720px' }}>
          {ph(d.courseName,'Course / Event Name')}
        </div>
        {d.grade && (
          <div style={{ fontSize:12, color:gold, letterSpacing:2, marginTop:2 }}>
            {d.grade}
          </div>
        )}

        {/* Bottom divider */}
        <svg width="380" height="18" viewBox="0 0 380 18" style={{ margin:'13px 0 10px' }}>
          <line x1="0" y1="9" x2="155" y2="9" stroke={gold} strokeWidth="0.7" opacity="0.5"/>
          <circle cx="166" cy="9" r="2" fill="none" stroke={gold} strokeWidth="1" opacity="0.65"/>
          <polygon points="190,9 196,3 202,9 196,15" fill={gold} opacity="0.9"/>
          <circle cx="214" cy="9" r="2" fill="none" stroke={gold} strokeWidth="1" opacity="0.65"/>
          <line x1="225" y1="9" x2="380" y2="9" stroke={gold} strokeWidth="0.7" opacity="0.5"/>
        </svg>

        {/* Footer row: date – seal – signatures */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', width:'88%', gap:16, marginTop:2 }}>

          {/* Date block */}
          <div style={{ textAlign:'center', minWidth:110 }}>
            <div style={{ fontSize:12, color:lgold, marginBottom:6 }}>{d.date || 'Date'}</div>
            <div style={{ borderTop:`1px solid ${dgold}`, paddingTop:5 }}>
              <div style={{ fontSize:9, color:dgold, letterSpacing:2, textTransform:'uppercase' }}>Date Awarded</div>
            </div>
          </div>

          {/* Medallion seal */}
          <svg width="72" height="72" viewBox="0 0 72 72">
            <circle cx="36" cy="36" r="34" fill="none" stroke={gold} strokeWidth="1.5"/>
            <circle cx="36" cy="36" r="28" fill="none" stroke={dgold} strokeWidth="0.8"/>
            {Array.from({length:24},(_,i) => {
              const a = (i/24)*Math.PI*2;
              const x1=36+28*Math.cos(a), y1=36+28*Math.sin(a);
              const x2=36+34*Math.cos(a), y2=36+34*Math.sin(a);
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={gold} strokeWidth="0.8" opacity="0.6"/>;
            })}
            {/* 8-pointed star */}
            {Array.from({length:8},(_,i) => {
              const a1=(i/8)*Math.PI*2, a2=((i+0.5)/8)*Math.PI*2;
              const ox=36, oy=36, r1=18, r2=10;
              return <polygon key={i}
                points={`${ox+r1*Math.cos(a1)},${oy+r1*Math.sin(a1)} ${ox+r2*Math.cos(a2)},${oy+r2*Math.sin(a2)} ${ox+r1*Math.cos(a2+Math.PI/8)},${oy+r1*Math.sin(a2+Math.PI/8)}`}
                fill={gold} opacity="0.85"/>;
            })}
            <circle cx="36" cy="36" r="7" fill={bg}/>
            <circle cx="36" cy="36" r="4" fill={gold} opacity="0.9"/>
          </svg>

          {/* Signatures */}
          <div style={{ display:'flex', gap:28 }}>
            {sigs.map((s, i) => (
              <div key={i} style={{ textAlign:'center', minWidth:130 }}>
                <div style={{ borderTop:`1px solid ${dgold}`, paddingTop:6 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:white }}>{s.name || 'Signature Name'}</div>
                  <div style={{ fontSize:10, color:dgold, letterSpacing:1.5, marginTop:2, textTransform:'uppercase' }}>{s.title || 'Title'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Template 2: Royal Red ────────────────────────────────────────────────────

function RoyalRedTemplate({ d }: { d: CertData }) {
  const cream  = '#fdf8f0';
  const crimson = '#8b0000';
  const gold   = '#b8860b';
  const brown  = '#3d1a0a';
  const lgold  = '#d4a843';
  const font   = 'Georgia, "Times New Roman", serif';
  const sigs   = [
    { name: d.sig1Name, title: d.sig1Title },
    ...(d.sig2Name || d.sig2Title ? [{ name: d.sig2Name, title: d.sig2Title }] : []),
  ];

  return (
    <div style={{
      width: CERT_W, height: CERT_H, background: cream,
      position:'relative', fontFamily: font,
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      boxSizing:'border-box', overflow:'hidden',
    }}>

      {/* ── Parchment texture ── */}
      <div style={{ position:'absolute', inset:0, background:
        'radial-gradient(ellipse at 15% 20%, rgba(180,120,60,0.07) 0%, transparent 55%), radial-gradient(ellipse at 85% 80%, rgba(139,0,0,0.05) 0%, transparent 55%)',
        pointerEvents:'none' }} />

      {/* ── Watermark ── */}
      <svg style={{ position:'absolute', inset:0, width:CERT_W, height:CERT_H, pointerEvents:'none' }}>
        <text x="500" y="400" textAnchor="middle" fontFamily={font} fontSize="140" fontWeight="900"
          fill={crimson} fillOpacity="0.04" transform="rotate(-18,500,400)">
          {(d.orgName || 'ROYAL HONOR').toUpperCase()}
        </text>
      </svg>

      {/* ── Borders ── */}
      <div style={{ position:'absolute', inset:12, border:`4px solid ${crimson}`,             zIndex:1 }} />
      <div style={{ position:'absolute', inset:21, border:`1px solid ${crimson}`,             zIndex:1 }} />
      <div style={{ position:'absolute', inset:28, border:`0.5px solid rgba(184,134,11,0.5)`, zIndex:1 }} />

      {/* ── Ornate corner scrollwork ── */}
      {([['top','left'],['top','right'],['bottom','left'],['bottom','right']] as const).map(([v,h]) => {
        const sx = h === 'right' ? -1 : 1;
        const sy = v === 'bottom' ? -1 : 1;
        return (
          <svg key={v+h} style={{ position:'absolute', [v]:5, [h]:5, zIndex:3,
            transform:`scale(${sx},${sy})`, transformOrigin:'center center' }}
            width="95" height="95" viewBox="0 0 95 95">
            {/* Outer bracket */}
            <polyline points="5,91 5,5 91,5" fill="none" stroke={crimson} strokeWidth="2.5" strokeLinecap="butt"/>
            {/* Inner bracket */}
            <polyline points="15,81 15,15 81,15" fill="none" stroke={crimson} strokeWidth="0.8" opacity="0.5"/>
            {/* Scroll curl at corner - Bezier */}
            <path d="M5,5 Q5,18 18,18 Q30,18 30,8" fill="none" stroke={gold} strokeWidth="1.2" opacity="0.7"/>
            {/* Corner diamond */}
            <rect x="2" y="2" width="6" height="6" fill={crimson} transform="rotate(45,5,5)"/>
            {/* Tick marks */}
            <line x1="5" y1="32" x2="13" y2="32" stroke={crimson} strokeWidth="1.5"/>
            <line x1="5" y1="50" x2="10" y2="50" stroke={crimson} strokeWidth="1"/>
            <line x1="5" y1="68" x2="13" y2="68" stroke={crimson} strokeWidth="1.5"/>
            <line x1="32" y1="5" x2="32" y2="13" stroke={crimson} strokeWidth="1.5"/>
            <line x1="50" y1="5" x2="50" y2="10" stroke={crimson} strokeWidth="1"/>
            <line x1="68" y1="5" x2="68" y2="13" stroke={crimson} strokeWidth="1.5"/>
            {/* Small circle on inner bracket corner */}
            <circle cx="15" cy="15" r="3" fill="none" stroke={gold} strokeWidth="1.2" opacity="0.8"/>
            <circle cx="15" cy="15" r="1.2" fill={gold} opacity="0.8"/>
          </svg>
        );
      })}

      {/* ── Top ornamental arch band ── */}
      <svg style={{ position:'absolute', top:0, left:0, width:CERT_W, height:90, zIndex:2 }}
        viewBox={`0 0 ${CERT_W} 90`} preserveAspectRatio="none">
        {/* Arch pattern */}
        <path d="M100,88 Q200,52 300,72 Q400,88 500,68 Q600,48 700,68 Q800,88 900,72 L1000,88" fill="none" stroke={crimson} strokeWidth="0.8" opacity="0.25"/>
        {/* Top center crown motif */}
        <g transform="translate(500,10)">
          <polygon points="0,-6 -4,0 4,0" fill={crimson} opacity="0.5"/>
          <polygon points="-12,0 -14,-8 -8,-4 -4,0" fill={crimson} opacity="0.4"/>
          <polygon points="12,0 14,-8 8,-4 4,0" fill={crimson} opacity="0.4"/>
          <line x1="-14" y1="0" x2="14" y2="0" stroke={crimson} strokeWidth="1.5" opacity="0.5"/>
          <rect x="-14" y="0" width="28" height="5" fill={crimson} opacity="0.3"/>
        </g>
      </svg>

      {/* ── Horizontal ornament bands (top & bottom inside border) ── */}
      <div style={{ position:'absolute', top:32, left:32, right:32, height:6,
        background:`repeating-linear-gradient(90deg, ${crimson} 0px, ${crimson} 3px, transparent 3px, transparent 9px)`,
        opacity:0.18, zIndex:2 }} />
      <div style={{ position:'absolute', bottom:32, left:32, right:32, height:6,
        background:`repeating-linear-gradient(90deg, ${crimson} 0px, ${crimson} 3px, transparent 3px, transparent 9px)`,
        opacity:0.18, zIndex:2 }} />

      {/* ── Content ── */}
      <div style={{
        position:'relative', zIndex:4,
        display:'flex', flexDirection:'column', alignItems:'center',
        width:'100%', padding:'60px 100px 52px',
        boxSizing:'border-box', textAlign:'center',
      }}>

        {/* Crest seal */}
        <svg width="70" height="70" viewBox="0 0 70 70" style={{ marginBottom:10 }}>
          <circle cx="35" cy="35" r="33" fill="none" stroke={crimson} strokeWidth="2"/>
          <circle cx="35" cy="35" r="27" fill="none" stroke={crimson} strokeWidth="0.8" opacity="0.5"/>
          {/* Radiating lines */}
          {Array.from({length:16},(_,i) => {
            const a = (i/16)*Math.PI*2;
            return <line key={i} x1={35+27*Math.cos(a)} y1={35+27*Math.sin(a)}
              x2={35+33*Math.cos(a)} y2={35+33*Math.sin(a)} stroke={crimson} strokeWidth="1" opacity="0.5"/>;
          })}
          {/* Inner shield-like shape */}
          <path d="M35,14 L46,20 L46,34 Q46,43 35,49 Q24,43 24,34 L24,20 Z"
            fill="none" stroke={crimson} strokeWidth="1.5"/>
          <path d="M35,18 L43,23 L43,33 Q43,40 35,45 Q27,40 27,33 L27,23 Z"
            fill={crimson} opacity="0.12"/>
          {/* Star in shield */}
          <text x="35" y="37" textAnchor="middle" fontSize="14" fill={crimson} opacity="0.7" fontFamily="Georgia">★</text>
        </svg>

        {/* Org name */}
        <div style={{ fontSize:11, letterSpacing:6, textTransform:'uppercase', color:crimson, marginBottom:6, fontWeight:700 }}>
          {ph(d.orgName,'Organization Name')}
        </div>

        {/* Flourish divider */}
        <svg width="520" height="20" viewBox="0 0 520 20" style={{ marginBottom:12 }}>
          <line x1="0" y1="10" x2="185" y2="10" stroke={crimson} strokeWidth="0.8" opacity="0.4"/>
          <path d="M190,10 Q205,4 220,10 Q205,16 190,10" fill={crimson} opacity="0.5"/>
          <polygon points="260,10 267,5 274,10 267,15" fill={crimson} opacity="0.9"/>
          <path d="M300,10 Q315,4 330,10 Q315,16 300,10" fill={crimson} opacity="0.5"/>
          <line x1="335" y1="10" x2="520" y2="10" stroke={crimson} strokeWidth="0.8" opacity="0.4"/>
        </svg>

        {/* Certificate title */}
        <div style={{ fontSize:30, fontWeight:700, color:brown, letterSpacing:2.5, textTransform:'uppercase', marginBottom:6 }}>
          {ph(d.certTitle,'Certificate of Achievement')}
        </div>
        <div style={{ fontSize:10, letterSpacing:5, textTransform:'uppercase', color:'rgba(139,0,0,0.55)', marginBottom:12 }}>
          This is to Certify That
        </div>

        {/* Recipient */}
        <div style={{ fontSize:48, fontStyle:'italic', color:crimson, fontWeight:400, lineHeight:1.1,
          marginBottom:12, wordBreak:'break-word', overflowWrap:'break-word', maxWidth:'800px' }}>
          {ph(d.recipientName,'Recipient Name')}
        </div>

        {/* Description */}
        <div style={{ fontSize:13, color:brown, maxWidth:560, lineHeight:1.7, marginBottom:6, opacity:0.75,
          wordBreak:'break-word' }}>
          {ph(d.awardDescription,'has successfully completed and demonstrated outstanding performance in')}
        </div>

        {/* Course */}
        <div style={{ fontSize:19, fontWeight:700, color:brown, marginBottom: d.grade ? 3 : 0,
          wordBreak:'break-word', maxWidth:'720px' }}>
          {ph(d.courseName,'Course / Event Name')}
        </div>
        {d.grade && <div style={{ fontSize:12, color:crimson, fontWeight:600, marginTop:2 }}>{d.grade}</div>}

        {/* Gold/red divider */}
        <svg width="400" height="20" viewBox="0 0 400 20" style={{ margin:'12px 0 10px' }}>
          <line x1="0" y1="10" x2="155" y2="10" stroke={lgold} strokeWidth="1" opacity="0.6"/>
          <polygon points="168,10 175,5 182,10 175,15" fill="none" stroke={crimson} strokeWidth="1.2" opacity="0.7"/>
          <text x="200" y="15" textAnchor="middle" fontSize="14" fill={crimson} fontFamily="Georgia" opacity="0.6">✦</text>
          <polygon points="218,10 225,5 232,10 225,15" fill="none" stroke={crimson} strokeWidth="1.2" opacity="0.7"/>
          <line x1="245" y1="10" x2="400" y2="10" stroke={lgold} strokeWidth="1" opacity="0.6"/>
        </svg>

        {/* Date + signatures */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', width:'86%', gap:20 }}>
          <div style={{ textAlign:'center', minWidth:120 }}>
            <div style={{ fontSize:12, color:brown, opacity:0.7, marginBottom:6 }}>{d.date || 'Date'}</div>
            <div style={{ borderTop:`1.5px solid rgba(139,0,0,0.35)`, paddingTop:5 }}>
              <div style={{ fontSize:9, color:crimson, opacity:0.55, letterSpacing:2, textTransform:'uppercase' }}>Date</div>
            </div>
          </div>
          <div style={{ display:'flex', gap:30 }}>
            {sigs.map((s,i) => (
              <div key={i} style={{ textAlign:'center', minWidth:140 }}>
                <div style={{ borderTop:`1.5px solid rgba(139,0,0,0.4)`, paddingTop:6 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:brown }}>{s.name || 'Signature Name'}</div>
                  <div style={{ fontSize:10, color:crimson, opacity:0.6, letterSpacing:1.5, textTransform:'uppercase', marginTop:2 }}>{s.title || 'Title'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom ribbon banner ── */}
      <svg style={{ position:'absolute', bottom:40, left:'50%', transform:'translateX(-50%)', zIndex:5 }}
        width="300" height="28" viewBox="0 0 300 28">
        <path d="M0,0 L280,0 L300,14 L280,28 L0,28 L20,14 Z" fill={crimson} opacity="0.85"/>
        <path d="M4,4 L276,4 L294,14 L276,24 L4,24 L22,14 Z" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"/>
        <text x="150" y="19" textAnchor="middle" fontSize="9" letterSpacing="3"
          fill="rgba(255,255,255,0.9)" fontFamily="Georgia" fontWeight="bold">
          {(d.orgName || 'CERTIFICATE OF EXCELLENCE').toUpperCase().substring(0,30)}
        </text>
      </svg>
    </div>
  );
}

// ─── Template 3: Luxury Blue ──────────────────────────────────────────────────

function LuxuryBlueTemplate({ d }: { d: CertData }) {
  const bg      = '#060e20';
  const navy    = '#0a1628';
  const silver  = '#b8c8d8';
  const lsilver = '#dce8f4';
  const dsilver = 'rgba(184,200,216,0.45)';
  const accent  = '#4fc3f7';
  const font    = '"Segoe UI", "Helvetica Neue", Arial, sans-serif';
  const sfont   = 'Georgia, "Times New Roman", serif';
  const sigs    = [
    { name: d.sig1Name, title: d.sig1Title },
    ...(d.sig2Name || d.sig2Title ? [{ name: d.sig2Name, title: d.sig2Title }] : []),
  ];

  return (
    <div style={{
      width: CERT_W, height: CERT_H,
      background: `radial-gradient(ellipse at 50% 40%, #0d1e3a 0%, #070f22 55%, #040913 100%)`,
      position:'relative', fontFamily: font,
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      boxSizing:'border-box', overflow:'hidden',
    }}>

      {/* ── Background subtle glow ── */}
      <div style={{ position:'absolute', top:'30%', left:'50%', transform:'translate(-50%,-50%)',
        width:600, height:400, borderRadius:'50%',
        background:'radial-gradient(ellipse, rgba(79,195,247,0.06) 0%, transparent 70%)',
        pointerEvents:'none', zIndex:0 }} />

      {/* ── Watermark ── */}
      <svg style={{ position:'absolute', inset:0, width:CERT_W, height:CERT_H, pointerEvents:'none', zIndex:0 }}>
        <text x="500" y="400" textAnchor="middle" fontFamily={sfont} fontSize="150" fontWeight="900"
          fill={silver} fillOpacity="0.03" transform="rotate(-18,500,400)">
          {(d.orgName || 'EXCELLENCE').toUpperCase()}
        </text>
      </svg>

      {/* ── Art-deco multi-line border ── */}
      <div style={{ position:'absolute', inset:12,  border:`2px solid ${silver}`,  opacity:0.7, zIndex:1 }} />
      <div style={{ position:'absolute', inset:18,  border:`1px solid ${dsilver}`,              zIndex:1 }} />
      <div style={{ position:'absolute', inset:24,  border:`0.5px solid rgba(79,195,247,0.2)`,  zIndex:1 }} />

      {/* ── Art-deco corner ornaments ── */}
      {([['top','left'],['top','right'],['bottom','left'],['bottom','right']] as const).map(([v,h]) => {
        const sx = h === 'right' ? -1 : 1;
        const sy = v === 'bottom' ? -1 : 1;
        return (
          <svg key={v+h} style={{ position:'absolute', [v]:6, [h]:6, zIndex:3,
            transform:`scale(${sx},${sy})`, transformOrigin:'center center' }}
            width="85" height="85" viewBox="0 0 85 85">
            {/* Outer L */}
            <polyline points="4,81 4,4 81,4" fill="none" stroke={silver} strokeWidth="1.8" opacity="0.8"/>
            {/* Middle L */}
            <polyline points="12,73 12,12 73,12" fill="none" stroke={dsilver} strokeWidth="1"/>
            {/* Inner small L */}
            <polyline points="20,42 20,20 42,20" fill="none" stroke={accent} strokeWidth="0.8" opacity="0.5"/>
            {/* Corner accent dot */}
            <circle cx="4" cy="4" r="3.5" fill={silver} opacity="0.85"/>
            <circle cx="4" cy="4" r="1.5" fill={bg}/>
            {/* Step notches - art deco */}
            <polyline points="4,24 12,24 12,30" fill="none" stroke={silver} strokeWidth="1" opacity="0.5"/>
            <polyline points="24,4 24,12 30,12" fill="none" stroke={silver} strokeWidth="1" opacity="0.5"/>
            <line x1="4" y1="52" x2="10" y2="52" stroke={silver} strokeWidth="0.8" opacity="0.4"/>
            <line x1="52" y1="4" x2="52" y2="10" stroke={silver} strokeWidth="0.8" opacity="0.4"/>
            {/* Chevron at corner */}
            <path d="M4,4 L14,4 L4,14" fill={accent} opacity="0.25"/>
          </svg>
        );
      })}

      {/* ── Top geometric band ── */}
      <svg style={{ position:'absolute', top:30, left:0, width:CERT_W, height:20, zIndex:2 }}
        viewBox={`0 0 ${CERT_W} 20`} preserveAspectRatio="none">
        <path d="M50,10 L100,3 L150,10 L200,3 L250,10 L300,3 L350,10 L400,3 L450,10 L500,3 L550,10 L600,3 L650,10 L700,3 L750,10 L800,3 L850,10 L900,3 L950,10"
          fill="none" stroke={silver} strokeWidth="0.6" opacity="0.25"/>
        <line x1="50" y1="10" x2="950" y2="10" stroke={accent} strokeWidth="0.5" opacity="0.3"/>
      </svg>

      {/* ── Bottom geometric band ── */}
      <svg style={{ position:'absolute', bottom:30, left:0, width:CERT_W, height:20, zIndex:2 }}
        viewBox={`0 0 ${CERT_W} 20`} preserveAspectRatio="none">
        <path d="M50,10 L100,17 L150,10 L200,17 L250,10 L300,17 L350,10 L400,17 L450,10 L500,17 L550,10 L600,17 L650,10 L700,17 L750,10 L800,17 L850,10 L900,17 L950,10"
          fill="none" stroke={silver} strokeWidth="0.6" opacity="0.25"/>
        <line x1="50" y1="10" x2="950" y2="10" stroke={accent} strokeWidth="0.5" opacity="0.3"/>
      </svg>

      {/* ── Left/right mid accent bars ── */}
      {(['left','right'] as const).map(side => (
        <svg key={side} style={{ position:'absolute', [side]:10, top: CERT_H/2-50, zIndex:2 }}
          width="20" height="100" viewBox="0 0 20 100">
          <line x1="10" y1="0" x2="10" y2="42" stroke={silver} strokeWidth="0.8" opacity="0.4"/>
          <polygon points="10,46 14,50 10,54 6,50" fill={accent} opacity="0.7"/>
          <line x1="10" y1="58" x2="10" y2="100" stroke={silver} strokeWidth="0.8" opacity="0.4"/>
        </svg>
      ))}

      {/* ── Content ── */}
      <div style={{
        position:'relative', zIndex:4,
        display:'flex', flexDirection:'column', alignItems:'center',
        width:'100%', padding:'60px 100px 52px',
        boxSizing:'border-box', textAlign:'center',
      }}>

        {/* Top: starburst sunburst badge */}
        <svg width="68" height="68" viewBox="0 0 68 68" style={{ marginBottom:10 }}>
          {/* Sunburst rays */}
          {Array.from({length:16},(_,i)=>{
            const a=(i/16)*Math.PI*2;
            const r1=26, r2=32;
            return <line key={i} x1={34+r1*Math.cos(a)} y1={34+r1*Math.sin(a)}
              x2={34+r2*Math.cos(a)} y2={34+r2*Math.sin(a)} stroke={accent} strokeWidth="1.2" opacity="0.5"/>;
          })}
          {Array.from({length:8},(_,i)=>{
            const a=(i/8)*Math.PI*2+Math.PI/16;
            const r1=23, r2=32;
            return <line key={i} x1={34+r1*Math.cos(a)} y1={34+r1*Math.sin(a)}
              x2={34+r2*Math.cos(a)} y2={34+r2*Math.sin(a)} stroke={silver} strokeWidth="2" opacity="0.4"/>;
          })}
          <circle cx="34" cy="34" r="22" fill="none" stroke={silver} strokeWidth="1.5" opacity="0.7"/>
          <circle cx="34" cy="34" r="17" fill={navy}/>
          <circle cx="34" cy="34" r="17" fill="none" stroke={accent} strokeWidth="0.8" opacity="0.6"/>
          {/* Diamond star */}
          <polygon points="34,20 37,34 34,48 31,34" fill={silver} opacity="0.8"/>
          <polygon points="20,34 34,31 48,34 34,37" fill={silver} opacity="0.8"/>
          <polygon points="34,26 37,34 34,42 31,34" fill={accent} opacity="0.5"/>
        </svg>

        {/* Org */}
        <div style={{ fontSize:10, letterSpacing:7, textTransform:'uppercase', color:silver, marginBottom:7, opacity:0.8 }}>
          {ph(d.orgName,'Organization Name')}
        </div>

        {/* Silver/accent divider */}
        <svg width="540" height="18" viewBox="0 0 540 18" style={{ marginBottom:10 }}>
          <line x1="0" y1="9" x2="210" y2="9" stroke={silver} strokeWidth="0.7" opacity="0.4"/>
          <path d="M215,9 L225,4 L235,9 L225,14 Z" fill="none" stroke={silver} strokeWidth="1" opacity="0.6"/>
          <path d="M244,9 L254,4 L264,9 L254,14 Z" fill={accent} opacity="0.7"/>
          <path d="M265,9 L275,4 L285,9 L275,14 Z" fill="none" stroke={silver} strokeWidth="1" opacity="0.6"/>
          <line x1="305" y1="9" x2="540" y2="9" stroke={silver} strokeWidth="0.7" opacity="0.4"/>
        </svg>

        {/* Title */}
        <div style={{ fontSize:11, letterSpacing:7, textTransform:'uppercase', color:accent, marginBottom:6, opacity:0.8 }}>
          {ph(d.certTitle,'Certificate of Achievement')}
        </div>
        <div style={{ fontSize:10, letterSpacing:4, textTransform:'uppercase', color:dsilver, marginBottom:12 }}>
          Awarded With Distinction To
        </div>

        {/* Recipient */}
        <div style={{ fontFamily: sfont, fontSize:50, fontStyle:'italic', color:lsilver, fontWeight:400,
          lineHeight:1.1, marginBottom:12, textShadow:`0 0 50px rgba(79,195,247,0.18)`,
          wordBreak:'break-word', overflowWrap:'break-word', maxWidth:'800px' }}>
          {ph(d.recipientName,'Recipient Name')}
        </div>

        {/* Description */}
        <div style={{ fontSize:12, color:dsilver, maxWidth:560, lineHeight:1.8, marginBottom:5,
          wordBreak:'break-word' }}>
          {ph(d.awardDescription,'has successfully completed and demonstrated outstanding performance in')}
        </div>

        {/* Course */}
        <div style={{ fontSize:19, fontWeight:700, color:lsilver, letterSpacing:0.5, marginBottom: d.grade ? 3 : 0,
          wordBreak:'break-word', maxWidth:'720px' }}>
          {ph(d.courseName,'Course / Event Name')}
        </div>
        {d.grade && <div style={{ fontSize:12, color:accent, marginTop:3, letterSpacing:2 }}>{d.grade}</div>}

        {/* Bottom divider */}
        <svg width="420" height="18" viewBox="0 0 420 18" style={{ margin:'12px 0 10px' }}>
          <line x1="0" y1="9" x2="170" y2="9" stroke={silver} strokeWidth="0.7" opacity="0.4"/>
          <polygon points="183,9 189,4 195,9 189,14" fill="none" stroke={accent} strokeWidth="1" opacity="0.7"/>
          <line x1="210" y1="4" x2="210" y2="14" stroke={silver} strokeWidth="1.5" opacity="0.5"/>
          <polygon points="225,9 231,4 237,9 231,14" fill="none" stroke={accent} strokeWidth="1" opacity="0.7"/>
          <line x1="250" y1="9" x2="420" y2="9" stroke={silver} strokeWidth="0.7" opacity="0.4"/>
        </svg>

        {/* Footer */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', width:'86%', gap:20 }}>
          <div style={{ textAlign:'center', minWidth:110 }}>
            <div style={{ fontSize:12, color:silver, opacity:0.7, marginBottom:6 }}>{d.date || 'Date'}</div>
            <div style={{ borderTop:`1px solid ${dsilver}`, paddingTop:5 }}>
              <div style={{ fontSize:9, color:dsilver, letterSpacing:2, textTransform:'uppercase' }}>Date Issued</div>
            </div>
          </div>
          <div style={{ display:'flex', gap:28 }}>
            {sigs.map((s,i)=>(
              <div key={i} style={{ textAlign:'center', minWidth:130 }}>
                <div style={{ borderTop:`1px solid ${dsilver}`, paddingTop:6 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:lsilver }}>{s.name || 'Signature Name'}</div>
                  <div style={{ fontSize:10, color:dsilver, letterSpacing:1.5, marginTop:2, textTransform:'uppercase' }}>{s.title || 'Title'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Template 4: Academic Classic ────────────────────────────────────────────

function AcademicClassicTemplate({ d }: { d: CertData }) {
  const parchment = '#f5f0e2';
  const green     = '#1a3a1a';
  const dgreen    = '#0f2410';
  const brown     = '#3d2310';
  const red       = '#8b1a1a';
  const gold      = '#b5872a';
  const font      = 'Georgia, "Times New Roman", serif';
  const sigs      = [
    { name: d.sig1Name, title: d.sig1Title },
    ...(d.sig2Name || d.sig2Title ? [{ name: d.sig2Name, title: d.sig2Title }] : []),
  ];

  return (
    <div style={{
      width: CERT_W, height: CERT_H, background: parchment,
      position:'relative', fontFamily: font,
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      boxSizing:'border-box', overflow:'hidden',
    }}>

      {/* ── Aged parchment texture ── */}
      <div style={{ position:'absolute', inset:0, background:
        'radial-gradient(ellipse at 10% 10%, rgba(101,67,33,0.09) 0%, transparent 45%), radial-gradient(ellipse at 90% 90%, rgba(101,67,33,0.07) 0%, transparent 45%), radial-gradient(ellipse at 50% 50%, rgba(255,248,220,0.4) 0%, transparent 70%)',
        pointerEvents:'none' }} />

      {/* ── Watermark ── */}
      <svg style={{ position:'absolute', inset:0, width:CERT_W, height:CERT_H, pointerEvents:'none' }}>
        <text x="500" y="390" textAnchor="middle" fontFamily={font} fontSize="130" fontWeight="900"
          fill={green} fillOpacity="0.035" transform="rotate(-18,500,390)">
          {(d.orgName || 'ACADEMIA').toUpperCase()}
        </text>
      </svg>

      {/* ── Borders: thick green outer, thin gold inner ── */}
      <div style={{ position:'absolute', inset:12, border:`4px double ${green}`,   zIndex:1 }} />
      <div style={{ position:'absolute', inset:22, border:`1.5px solid ${gold}`,   zIndex:1, opacity:0.6 }} />
      <div style={{ position:'absolute', inset:29, border:`0.5px solid ${green}`,  zIndex:1, opacity:0.2 }} />

      {/* ── Ivy/leaf corner ornaments ── */}
      {([['top','left'],['top','right'],['bottom','left'],['bottom','right']] as const).map(([v,h]) => {
        const sx = h === 'right' ? -1 : 1;
        const sy = v === 'bottom' ? -1 : 1;
        return (
          <svg key={v+h} style={{ position:'absolute', [v]:7, [h]:7, zIndex:3,
            transform:`scale(${sx},${sy})`, transformOrigin:'center center' }}
            width="85" height="85" viewBox="0 0 85 85">
            {/* Double L bracket */}
            <polyline points="4,81 4,4 81,4" fill="none" stroke={green} strokeWidth="3" strokeLinecap="square"/>
            <polyline points="11,74 11,11 74,11" fill="none" stroke={green} strokeWidth="1" opacity="0.4"/>
            {/* Leaf-like curl at corner */}
            <path d="M4,4 Q16,4 16,16 Q16,28 4,28" fill="none" stroke={green} strokeWidth="1.2" opacity="0.5"/>
            <path d="M4,4 Q4,16 16,16 Q28,16 28,4" fill="none" stroke={green} strokeWidth="1.2" opacity="0.5"/>
            {/* Small oval leaf shapes */}
            <ellipse cx="10" cy="10" rx="5" ry="3" fill="none" stroke={gold} strokeWidth="0.8" opacity="0.6" transform="rotate(45,10,10)"/>
            {/* Notch marks */}
            <line x1="4" y1="30" x2="11" y2="30" stroke={green} strokeWidth="1.5"/>
            <line x1="4" y1="48" x2="9"  y2="48" stroke={green} strokeWidth="1" opacity="0.6"/>
            <line x1="4" y1="66" x2="11" y2="66" stroke={green} strokeWidth="1.5"/>
            <line x1="30" y1="4" x2="30" y2="11" stroke={green} strokeWidth="1.5"/>
            <line x1="48" y1="4" x2="48" y2="9"  stroke={green} strokeWidth="1" opacity="0.6"/>
            <line x1="66" y1="4" x2="66" y2="11" stroke={green} strokeWidth="1.5"/>
            {/* Corner fill */}
            <rect x="3" y="3" width="8" height="8" fill={green} opacity="0.9"/>
          </svg>
        );
      })}

      {/* ── Decorative top & bottom bands ── */}
      <div style={{ position:'absolute', top:34, left:34, right:34, height:4,
        background:`repeating-linear-gradient(90deg, ${green} 0, ${green} 6px, transparent 6px, transparent 12px)`,
        opacity:0.2, zIndex:2 }} />
      <div style={{ position:'absolute', bottom:34, left:34, right:34, height:4,
        background:`repeating-linear-gradient(90deg, ${green} 0, ${green} 6px, transparent 6px, transparent 12px)`,
        opacity:0.2, zIndex:2 }} />

      {/* ── Content ── */}
      <div style={{
        position:'relative', zIndex:4,
        display:'flex', flexDirection:'column', alignItems:'center',
        width:'100%', padding:'56px 100px 50px',
        boxSizing:'border-box', textAlign:'center',
      }}>

        {/* University crest / shield */}
        <svg width="66" height="72" viewBox="0 0 66 72" style={{ marginBottom:10 }}>
          {/* Shield shape */}
          <path d="M5,5 L61,5 L61,42 Q61,65 33,70 Q5,65 5,42 Z" fill="none" stroke={green} strokeWidth="2.5"/>
          <path d="M10,10 L56,10 L56,42 Q56,60 33,65 Q10,60 10,42 Z" fill="none" stroke={green} strokeWidth="0.8" opacity="0.4"/>
          {/* Horizontal divider */}
          <line x1="5" y1="30" x2="61" y2="30" stroke={green} strokeWidth="1.5"/>
          {/* Vertical divider upper half */}
          <line x1="33" y1="5" x2="33" y2="30" stroke={green} strokeWidth="1.5"/>
          {/* Quadrant decorations */}
          <text x="19" y="23" textAnchor="middle" fontSize="12" fill={green} opacity="0.6">⚜</text>
          <text x="47" y="23" textAnchor="middle" fontSize="12" fill={green} opacity="0.6">✦</text>
          {/* Lower half book / star */}
          <text x="33" y="51" textAnchor="middle" fontSize="16" fill={green} opacity="0.5">★</text>
          {/* Top scrollwork */}
          <path d="M5,5 Q0,0 5,0 Q10,0 10,5" fill={green} opacity="0.3"/>
          <path d="M61,5 Q66,0 61,0 Q56,0 56,5" fill={green} opacity="0.3"/>
        </svg>

        {/* Org name */}
        <div style={{ fontSize:12, letterSpacing:5, textTransform:'uppercase', color:green, marginBottom:7, fontWeight:700 }}>
          {ph(d.orgName,'University / Academy Name')}
        </div>

        {/* Green/gold flourish divider */}
        <svg width="560" height="20" viewBox="0 0 560 20" style={{ marginBottom:12 }}>
          <line x1="0" y1="10" x2="180" y2="10" stroke={green} strokeWidth="1" opacity="0.35"/>
          <path d="M186,10 Q196,4 206,10 Q196,16 186,10" fill={green} opacity="0.4"/>
          <text x="228" y="15" textAnchor="middle" fontSize="12" fill={red} fontFamily="Georgia">❧</text>
          <polygon points="280,10 287,5 294,10 287,15" fill={green} opacity="0.7"/>
          <text x="332" y="15" textAnchor="middle" fontSize="12" fill={red} fontFamily="Georgia">❧</text>
          <path d="M354,10 Q364,4 374,10 Q364,16 354,10" fill={green} opacity="0.4"/>
          <line x1="380" y1="10" x2="560" y2="10" stroke={green} strokeWidth="1" opacity="0.35"/>
        </svg>

        {/* Title */}
        <div style={{ fontSize:29, fontWeight:700, color:dgreen, letterSpacing:2, textTransform:'uppercase', marginBottom:5 }}>
          {ph(d.certTitle,'Certificate of Achievement')}
        </div>
        <div style={{ fontSize:10, letterSpacing:4.5, textTransform:'uppercase', color:'rgba(26,58,26,0.55)', marginBottom:12 }}>
          This is to Certify That the Following
        </div>

        {/* Recipient */}
        <div style={{ fontSize:48, fontStyle:'italic', color:red, fontWeight:400, lineHeight:1.1,
          marginBottom:11, wordBreak:'break-word', overflowWrap:'break-word', maxWidth:'800px' }}>
          {ph(d.recipientName,'Recipient Name')}
        </div>

        {/* Description */}
        <div style={{ fontSize:13, color:brown, maxWidth:560, lineHeight:1.72, marginBottom:5, opacity:0.8,
          wordBreak:'break-word' }}>
          {ph(d.awardDescription,'has successfully completed and demonstrated outstanding performance in')}
        </div>

        {/* Course */}
        <div style={{ fontSize:19, fontWeight:700, color:dgreen, marginBottom: d.grade ? 3 : 0,
          wordBreak:'break-word', maxWidth:'720px' }}>
          {ph(d.courseName,'Course / Field of Study')}
        </div>
        {d.grade && <div style={{ fontSize:12, color:red, fontWeight:600, marginTop:3, letterSpacing:1 }}>{d.grade}</div>}

        {/* Red grosgrain divider */}
        <svg width="380" height="16" viewBox="0 0 380 16" style={{ margin:'12px 0 10px' }}>
          <line x1="0" y1="8" x2="148" y2="8" stroke={gold} strokeWidth="1" opacity="0.55"/>
          <polygon points="160,8 167,3 174,8 167,13" fill="none" stroke={green} strokeWidth="1.2" opacity="0.6"/>
          <text x="190" y="13" textAnchor="middle" fontSize="12" fill={red} fontFamily="Georgia">✦</text>
          <polygon points="206,8 213,3 220,8 213,13" fill="none" stroke={green} strokeWidth="1.2" opacity="0.6"/>
          <line x1="232" y1="8" x2="380" y2="8" stroke={gold} strokeWidth="1" opacity="0.55"/>
        </svg>

        {/* Footer */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', width:'86%', gap:20 }}>
          <div style={{ textAlign:'center', minWidth:120 }}>
            <div style={{ fontSize:12, color:brown, opacity:0.7, marginBottom:6 }}>{d.date || 'Date'}</div>
            <div style={{ borderTop:`1.5px solid rgba(26,58,26,0.35)`, paddingTop:5 }}>
              <div style={{ fontSize:9, color:green, opacity:0.5, letterSpacing:2, textTransform:'uppercase' }}>Date Conferred</div>
            </div>
          </div>
          <div style={{ display:'flex', gap:28 }}>
            {sigs.map((s,i)=>(
              <div key={i} style={{ textAlign:'center', minWidth:140 }}>
                <div style={{ borderTop:`1.5px solid rgba(26,58,26,0.4)`, paddingTop:6 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:dgreen }}>{s.name || 'Signature Name'}</div>
                  <div style={{ fontSize:10, color:green, opacity:0.6, letterSpacing:1.5, textTransform:'uppercase', marginTop:2 }}>{s.title || 'Title'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Template 5: Premium Black & Gold ────────────────────────────────────────

function PremiumBlackGoldTemplate({ d }: { d: CertData }) {
  const bg     = '#050505';
  const gold   = '#d4a017';
  const lgold  = '#f5d050';
  const dgold  = 'rgba(212,160,23,0.5)';
  const white  = '#ffffff';
  const font   = 'Georgia, "Times New Roman", serif';
  const sfont  = '"Segoe UI", Arial, sans-serif';
  const sigs   = [
    { name: d.sig1Name, title: d.sig1Title },
    ...(d.sig2Name || d.sig2Title ? [{ name: d.sig2Name, title: d.sig2Title }] : []),
  ];

  return (
    <div style={{
      width: CERT_W, height: CERT_H, background: bg,
      position:'relative', fontFamily: font,
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      boxSizing:'border-box', overflow:'hidden',
    }}>

      {/* ── Diagonal line pattern — CSS gradient (html2canvas-safe) ── */}
      <div style={{
        position:'absolute', inset:0, zIndex:0, pointerEvents:'none',
        background:'repeating-linear-gradient(135deg, rgba(212,160,23,0.055) 0px, rgba(212,160,23,0.055) 1px, transparent 1px, transparent 14px)',
      }} />

      {/* ── Watermark ── */}
      <svg style={{ position:'absolute', inset:0, width:CERT_W, height:CERT_H, pointerEvents:'none', zIndex:0 }}>
        <text x="500" y="400" textAnchor="middle" fontFamily={font} fontSize="150" fontWeight="900"
          fill={gold} fillOpacity="0.04" transform="rotate(-18,500,400)">
          {(d.orgName || 'PRESTIGE').toUpperCase()}
        </text>
      </svg>

      {/* ── Multi-line gold border system ── */}
      <div style={{ position:'absolute', inset:10,  border:`3px solid ${gold}`,   zIndex:1 }} />
      <div style={{ position:'absolute', inset:17,  border:`1px solid ${dgold}`,  zIndex:1 }} />
      <div style={{ position:'absolute', inset:22,  border:`0.5px solid rgba(212,160,23,0.2)`, zIndex:1 }} />

      {/* ── Filigree corner ornaments ── */}
      {([['top','left'],['top','right'],['bottom','left'],['bottom','right']] as const).map(([v,h]) => {
        const sx = h === 'right' ? -1 : 1;
        const sy = v === 'bottom' ? -1 : 1;
        return (
          <svg key={v+h} style={{ position:'absolute', [v]:5, [h]:5, zIndex:3,
            transform:`scale(${sx},${sy})`, transformOrigin:'center center' }}
            width="100" height="100" viewBox="0 0 100 100">
            {/* Bold outer L */}
            <polyline points="4,96 4,4 96,4" fill="none" stroke={gold} strokeWidth="2.5" strokeLinecap="butt"/>
            {/* Inner L */}
            <polyline points="13,87 13,13 87,13" fill="none" stroke={dgold} strokeWidth="1"/>
            {/* Corner solid fill */}
            <rect x="4" y="4" width="9" height="9" fill={gold} opacity="0.9"/>
            {/* Filigree scrollwork */}
            <path d="M4,4 Q4,24 24,24 Q36,24 36,12 Q36,4 28,4" fill="none" stroke={gold} strokeWidth="1.2" opacity="0.6"/>
            <path d="M4,4 Q24,4 24,24 Q24,36 12,36 Q4,36 4,28" fill="none" stroke={gold} strokeWidth="1.2" opacity="0.6"/>
            {/* Decorative circles */}
            <circle cx="24" cy="24" r="3" fill="none" stroke={gold} strokeWidth="1" opacity="0.7"/>
            <circle cx="24" cy="24" r="1.2" fill={gold} opacity="0.8"/>
            {/* Notch ticks */}
            <line x1="4" y1="36" x2="13" y2="36" stroke={gold} strokeWidth="1.5" opacity="0.7"/>
            <line x1="4" y1="54" x2="10" y2="54" stroke={gold} strokeWidth="1"   opacity="0.5"/>
            <line x1="4" y1="72" x2="13" y2="72" stroke={gold} strokeWidth="1.5" opacity="0.7"/>
            <line x1="36" y1="4" x2="36" y2="13" stroke={gold} strokeWidth="1.5" opacity="0.7"/>
            <line x1="54" y1="4" x2="54" y2="10" stroke={gold} strokeWidth="1"   opacity="0.5"/>
            <line x1="72" y1="4" x2="72" y2="13" stroke={gold} strokeWidth="1.5" opacity="0.7"/>
          </svg>
        );
      })}

      {/* ── Top ornamental band ── */}
      <svg style={{ position:'absolute', top:26, left:0, width:CERT_W, height:30, zIndex:2 }}
        viewBox={`0 0 ${CERT_W} 30`}>
        {/* Repeating diamond chain */}
        {Array.from({length:14},(_,i) => (
          <polygon key={i} points={`${60+i*65},15 ${65+i*65},10 ${70+i*65},15 ${65+i*65},20`}
            fill="none" stroke={gold} strokeWidth="0.8" opacity="0.3"/>
        ))}
        <line x1="50" y1="15" x2="950" y2="15" stroke={gold} strokeWidth="0.5" opacity="0.2"/>
      </svg>

      {/* ── Bottom ornamental band ── */}
      <svg style={{ position:'absolute', bottom:26, left:0, width:CERT_W, height:30, zIndex:2 }}
        viewBox={`0 0 ${CERT_W} 30`}>
        {Array.from({length:14},(_,i) => (
          <polygon key={i} points={`${60+i*65},15 ${65+i*65},10 ${70+i*65},15 ${65+i*65},20`}
            fill="none" stroke={gold} strokeWidth="0.8" opacity="0.3"/>
        ))}
        <line x1="50" y1="15" x2="950" y2="15" stroke={gold} strokeWidth="0.5" opacity="0.2"/>
      </svg>

      {/* ── Large background starburst (centered behind recipient) ── */}
      <svg style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
        width:320, height:320, zIndex:1, pointerEvents:'none', marginTop:-20 }}
        viewBox="0 0 320 320">
        {Array.from({length:36},(_,i)=>{
          const a=(i/36)*Math.PI*2;
          const r1=50, r2=150;
          return <line key={i} x1={160+r1*Math.cos(a)} y1={160+r1*Math.sin(a)}
            x2={160+r2*Math.cos(a)} y2={160+r2*Math.sin(a)} stroke={gold} strokeWidth="0.4" opacity="0.07"/>;
        })}
        <circle cx="160" cy="160" r="50" fill="none" stroke={gold} strokeWidth="0.5" opacity="0.06"/>
        <circle cx="160" cy="160" r="80" fill="none" stroke={gold} strokeWidth="0.3" opacity="0.04"/>
      </svg>

      {/* ── Content ── */}
      <div style={{
        position:'relative', zIndex:4,
        display:'flex', flexDirection:'column', alignItems:'center',
        width:'100%', padding:'58px 100px 50px',
        boxSizing:'border-box', textAlign:'center',
      }}>

        {/* Award badge/medallion */}
        <svg width="72" height="72" viewBox="0 0 72 72" style={{ marginBottom:10 }}>
          {/* Outer starburst 16-point */}
          {Array.from({length:16},(_,i)=>{
            const a=(i/16)*Math.PI*2, b=((i+0.5)/16)*Math.PI*2;
            const r1=35, r2=28;
            return <polygon key={i}
              points={`36,36 ${36+r1*Math.cos(a)},${36+r1*Math.sin(a)} ${36+r2*Math.cos(b)},${36+r2*Math.sin(b)}`}
              fill={gold} opacity="0.7"/>;
          })}
          <circle cx="36" cy="36" r="22" fill={bg}/>
          <circle cx="36" cy="36" r="22" fill="none" stroke={gold} strokeWidth="1.5"/>
          <circle cx="36" cy="36" r="16" fill="none" stroke={dgold} strokeWidth="0.8"/>
          {/* Inner bold star */}
          {Array.from({length:5},(_,i)=>{
            const a=(i/5)*Math.PI*2-Math.PI/2, b=((i+0.5)/5)*Math.PI*2-Math.PI/2;
            const r1=12, r2=6;
            return <polygon key={i}
              points={`${36+r1*Math.cos(a)},${36+r1*Math.sin(a)} ${36+r2*Math.cos(b)},${36+r2*Math.sin(b)} ${36+r1*Math.cos(a+Math.PI*2/5)},${36+r1*Math.sin(a+Math.PI*2/5)}`}
              fill={gold} opacity="0.9"/>;
          })}
        </svg>

        {/* Org */}
        <div style={{ fontFamily: sfont, fontSize:10, letterSpacing:8, textTransform:'uppercase', color:gold, marginBottom:8, fontWeight:400 }}>
          {ph(d.orgName,'Organization Name')}
        </div>

        {/* Bold divider */}
        <svg width="520" height="20" viewBox="0 0 520 20" style={{ marginBottom:10 }}>
          <line x1="0" y1="10" x2="175" y2="10" stroke={gold} strokeWidth="1" opacity="0.5"/>
          <line x1="0" y1="13" x2="175" y2="13" stroke={gold} strokeWidth="0.4" opacity="0.25"/>
          <polygon points="190,10 200,4 210,10 200,16" fill={gold} opacity="0.9"/>
          <polygon points="260,10 270,3 280,10 270,17" fill={lgold} opacity="0.95"/>
          <polygon points="310,10 320,4 330,10 320,16" fill={gold} opacity="0.9"/>
          <line x1="345" y1="10" x2="520" y2="10" stroke={gold} strokeWidth="1" opacity="0.5"/>
          <line x1="345" y1="13" x2="520" y2="13" stroke={gold} strokeWidth="0.4" opacity="0.25"/>
        </svg>

        {/* Title */}
        <div style={{ fontFamily: sfont, fontSize:10, letterSpacing:7, textTransform:'uppercase', color:gold, marginBottom:5, opacity:0.8 }}>
          {ph(d.certTitle,'Certificate of Achievement')}
        </div>
        <div style={{ fontFamily: sfont, fontSize:9, letterSpacing:5, textTransform:'uppercase', color:dgold, marginBottom:12 }}>
          Is Proudly Awarded To
        </div>

        {/* Recipient */}
        <div style={{ fontSize:52, fontStyle:'italic', color:lgold, fontWeight:400, lineHeight:1.1,
          marginBottom:12, letterSpacing:1, textShadow:`0 0 60px rgba(212,160,23,0.35)`,
          wordBreak:'break-word', overflowWrap:'break-word', maxWidth:'800px' }}>
          {ph(d.recipientName,'Recipient Name')}
        </div>

        {/* Description */}
        <div style={{ fontFamily: sfont, fontSize:12, color:'rgba(212,160,23,0.58)', maxWidth:560, lineHeight:1.78, marginBottom:5,
          wordBreak:'break-word' }}>
          {ph(d.awardDescription,'has successfully completed and demonstrated outstanding performance in')}
        </div>

        {/* Course */}
        <div style={{ fontFamily: sfont, fontSize:19, fontWeight:700, color:white, letterSpacing:0.5, marginBottom: d.grade ? 3 : 0,
          wordBreak:'break-word', maxWidth:'720px' }}>
          {ph(d.courseName,'Course / Event Name')}
        </div>
        {d.grade && <div style={{ fontFamily: sfont, fontSize:12, color:gold, letterSpacing:2, marginTop:3 }}>{d.grade}</div>}

        {/* Double-line divider */}
        <svg width="400" height="18" viewBox="0 0 400 18" style={{ margin:'13px 0 10px' }}>
          <line x1="0" y1="8" x2="155" y2="8" stroke={gold} strokeWidth="1.2" opacity="0.55"/>
          <line x1="0" y1="11" x2="155" y2="11" stroke={gold} strokeWidth="0.4" opacity="0.25"/>
          <polygon points="170,9.5 177,4 184,9.5 177,15" fill={gold} opacity="0.8"/>
          <circle cx="200" cy="9.5" r="3" fill={gold} opacity="0.9"/>
          <polygon points="216,9.5 223,4 230,9.5 223,15" fill={gold} opacity="0.8"/>
          <line x1="245" y1="8" x2="400" y2="8" stroke={gold} strokeWidth="1.2" opacity="0.55"/>
          <line x1="245" y1="11" x2="400" y2="11" stroke={gold} strokeWidth="0.4" opacity="0.25"/>
        </svg>

        {/* Footer */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', width:'87%', gap:20 }}>
          <div style={{ textAlign:'center', minWidth:110 }}>
            <div style={{ fontSize:12, color:lgold, opacity:0.8, marginBottom:6 }}>{d.date || 'Date'}</div>
            <div style={{ borderTop:`1px solid ${dgold}`, paddingTop:5 }}>
              <div style={{ fontFamily: sfont, fontSize:9, color:dgold, letterSpacing:2, textTransform:'uppercase' }}>Date Awarded</div>
            </div>
          </div>
          <div style={{ display:'flex', gap:28 }}>
            {sigs.map((s,i)=>(
              <div key={i} style={{ textAlign:'center', minWidth:130 }}>
                <div style={{ borderTop:`1px solid ${dgold}`, paddingTop:6 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:white }}>{s.name || 'Signature Name'}</div>
                  <div style={{ fontFamily: sfont, fontSize:10, color:gold, opacity:0.7, letterSpacing:1.5, marginTop:2, textTransform:'uppercase' }}>{s.title || 'Title'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Template renderer ────────────────────────────────────────────────────────

function CertificatePreview({ data, template }: { data: CertData; template: TemplateId }) {
  switch (template) {
    case 'executive': return <ExecutiveGoldTemplate d={data} />;
    case 'royal':     return <RoyalRedTemplate d={data} />;
    case 'luxury':    return <LuxuryBlueTemplate d={data} />;
    case 'academic':  return <AcademicClassicTemplate d={data} />;
    case 'blackgold': return <PremiumBlackGoldTemplate d={data} />;
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
  const [template, setTemplate] = useState<TemplateId>('executive');
  const [exporting, setExporting] = useState(false);
  const [showSig2, setShowSig2] = useState(false);

  const captureRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const { toast } = useToast();

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setScale(Math.min(containerRef.current.clientWidth / CERT_W, 1));
      }
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const set = (key: keyof CertData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setData(prev => ({ ...prev, [key]: e.target.value }));

  const capture = useCallback(async (hiDpi = 3): Promise<HTMLCanvasElement | null> => {
    if (!captureRef.current) return null;
    try { await document.fonts.ready; } catch {}
    return html2canvas(captureRef.current, {
      scale: hiDpi, useCORS: true, allowTaint: true,
      backgroundColor: null, logging: false,
      onclone: (doc) => {
        document.querySelectorAll('link[rel="stylesheet"],style').forEach(n => {
          try { doc.head.appendChild(n.cloneNode(true)); } catch {}
        });
      },
    });
  }, []);

  const exportPng = async () => {
    setExporting(true);
    try {
      const canvas = await capture(3);
      if (!canvas) throw new Error();
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.recipientName.trim() || 'certificate'}-certificate.png`;
      a.click();
      toast({ title: 'PNG Downloaded!', description: 'High-resolution certificate saved.', duration: 2500 });
    } catch {
      toast({ title: 'Export failed', variant: 'destructive' });
    } finally { setExporting(false); }
  };

  const exportPdf = async () => {
    setExporting(true);
    try {
      const canvas = await capture(3);
      if (!canvas) throw new Error();
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'PNG', 0, 0, pw, ph);
      pdf.save(`${data.recipientName.trim() || 'certificate'}-certificate.pdf`);
      toast({ title: 'PDF Downloaded!', description: 'Landscape A4 PDF saved.', duration: 2500 });
    } catch {
      toast({ title: 'Export failed', variant: 'destructive' });
    } finally { setExporting(false); }
  };

  const handlePrint = async () => {
    setExporting(true);
    try {
      const canvas = await capture(3);
      if (!canvas) throw new Error();
      const url = canvas.toDataURL('image/png');
      const win = window.open('', '_blank');
      if (!win) throw new Error('popup blocked');
      win.document.write(`<html><head><title>Certificate</title>
        <style>*{margin:0;padding:0;box-sizing:border-box}body{display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f5f5f5}img{max-width:100%;box-shadow:0 4px 24px rgba(0,0,0,0.15)}@media print{body{background:white}img{box-shadow:none;width:100%;height:auto}}</style>
        </head><body><img src="${url}" alt="Certificate" onload="window.print();setTimeout(()=>window.close(),500);" /></body></html>`);
      win.document.close();
    } catch {
      toast({ title: 'Print failed', description: 'Allow pop-ups for this site.', variant: 'destructive' });
    } finally { setExporting(false); }
  };

  const handleReset = () => { setData(DEFAULT_DATA); setTemplate('executive'); setShowSig2(false); };

  return (
  <>
    <div className="max-w-screen-xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Certificate Generator</h1>
        <p className="text-muted-foreground">Design premium, print-ready certificates instantly — no sign-up required</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6 items-start">

        {/* ── Form ─────────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-5 xl:sticky xl:top-4 xl:max-h-[calc(100vh-2rem)] xl:overflow-y-auto">

          {/* Template selector */}
          <div className="space-y-3">
            <Label className="text-base font-semibold block">Template</Label>
            <div className="grid grid-cols-5 gap-2">
              {TEMPLATES.map(t => (
                <button key={t.id} onClick={() => setTemplate(t.id)} title={t.name}
                  className={`relative rounded-lg overflow-hidden border-2 transition-all cursor-pointer flex flex-col ${
                    template === t.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
                  }`} style={{ aspectRatio: '1.41' }}>
                  <div className="flex-1" style={{ background: t.preview[0] }} />
                  <div className="h-[30%]" style={{ background: t.preview[1], opacity: 0.85 }} />
                  {template === t.id && (
                    <div className="absolute inset-0 flex items-end justify-center pb-1">
                      <span className="text-[8px] font-bold text-white bg-blue-500 rounded px-1 leading-4 shadow">
                        {t.name.split(' ')[0]}
                      </span>
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

          <Field label="Organization / Business Name" id="orgName">
            <Input id="orgName" placeholder="e.g. Acme Academy" value={data.orgName} onChange={set('orgName')} />
          </Field>
          <Field label="Certificate Title" id="certTitle">
            <Input id="certTitle" placeholder="e.g. Certificate of Achievement" value={data.certTitle} onChange={set('certTitle')} />
          </Field>

          <div className="border-t" />

          <Field label="Recipient Name" id="recipientName">
            <Input id="recipientName" placeholder="e.g. Jane Smith" value={data.recipientName} onChange={set('recipientName')} />
          </Field>
          <Field label="Award Description" id="awardDescription">
            <textarea id="awardDescription" rows={2}
              placeholder="e.g. has successfully completed and demonstrated outstanding performance in"
              value={data.awardDescription} onChange={set('awardDescription')}
              className="w-full border rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent" />
          </Field>
          <Field label="Course / Event Name" id="courseName">
            <Input id="courseName" placeholder="e.g. Advanced Web Development" value={data.courseName} onChange={set('courseName')} />
          </Field>
          <Field label="Grade or Award" id="grade" optional>
            <Input id="grade" placeholder="e.g. With Distinction" value={data.grade} onChange={set('grade')} />
          </Field>
          <Field label="Date" id="date">
            <Input id="date" value={data.date} onChange={set('date')} />
          </Field>

          <div className="border-t" />

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

          <button onClick={() => { if (showSig2) setData(prev => ({ ...prev, sig2Name: '', sig2Title: '' })); setShowSig2(v => !v); }}
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors">
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

          <Button variant="outline" onClick={handleReset} className="w-full gap-2 text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50">
            <RefreshCw className="w-4 h-4" /> Reset All Fields
          </Button>
        </div>

        {/* ── Preview + actions ─────────────────────────────────────────────── */}
        <div className="space-y-4">
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

          <div className="bg-gray-900 rounded-2xl border border-gray-700 p-4 overflow-hidden">
            <div ref={containerRef} className="w-full">
              <div style={{ width:'100%', height: CERT_H * scale, position:'relative', overflow:'hidden' }}>
                <div style={{
                  position:'absolute', top:0, left:0, width: CERT_W, height: CERT_H,
                  transform: `scale(${scale})`, transformOrigin: 'top left',
                  boxShadow: '0 8px 48px rgba(0,0,0,0.5)', borderRadius: 2,
                }}>
                  <CertificatePreview data={data} template={template} />
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Print-ready · Landscape A4 · High-resolution PNG & PDF · Works for universities, churches, businesses & events
          </p>
        </div>
      </div>

    </div>

    {/* Off-screen capture — sibling to animated div, outside transform ancestry */}
    <div ref={captureRef} aria-hidden="true"
      style={{ position:'fixed', left:-9999, top:0, width: CERT_W, height: CERT_H,
        pointerEvents:'none', zIndex:-1, overflow:'hidden' }}>
      <CertificatePreview data={data} template={template} />
    </div>
  </>
  );
}
