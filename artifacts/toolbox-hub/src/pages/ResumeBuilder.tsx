import React, { useState, useRef, useEffect, useCallback } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  Download, Printer, RefreshCw, User, Plus, Trash2, Loader2,
  Upload, Briefcase, GraduationCap, Award, Globe, UserCheck,
  FileText, Zap, Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

// ─── Constants ────────────────────────────────────────────────────────────────

const RW = 794;   // A4 portrait width  @ 96 dpi
const RH = 1122;  // A4 portrait height @ 96 dpi

type TId = 'classic' | 'minimal' | 'executive' | 'creative' | 'timeline';

const TMPL_META = [
  { id: 'classic'   as TId, name: 'Classic',   preview: [['#1e3a5f','30%'],['#f0f4f8','70%']] },
  { id: 'minimal'   as TId, name: 'Minimal',   preview: [['#ffffff','100%']] },
  { id: 'executive' as TId, name: 'Executive', preview: [['#0f172a','28%'],['#ffffff','72%']] },
  { id: 'creative'  as TId, name: 'Creative',  preview: [['#1d4ed8','32%'],['#ffffff','68%']] },
  { id: 'timeline'  as TId, name: 'Timeline',  preview: [['#ffffff','100%']] },
];

const PROFICIENCY = ['Beginner','Intermediate','Advanced','Fluent','Native'];

// ─── Types ────────────────────────────────────────────────────────────────────

interface WorkEntry    { id:string; position:string; company:string; startDate:string; endDate:string; description:string }
interface EduEntry     { id:string; degree:string; field:string; institution:string; startDate:string; endDate:string; gpa:string }
interface CertEntry    { id:string; name:string; issuer:string; date:string; credentialId:string }
interface LangEntry    { id:string; language:string; proficiency:string }
interface RefEntry     { id:string; name:string; position:string; company:string; email:string; phone:string }

interface Resume {
  fullName:string; jobTitle:string; phone:string; email:string; address:string; photoDataUrl:string;
  summary:string; skills:string;
  workExperience: WorkEntry[];
  education: EduEntry[];
  certifications: CertEntry[];
  languages: LangEntry[];
  references: RefEntry[];
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2,8);

const blankWork  = (): WorkEntry  => ({ id:uid(), position:'', company:'', startDate:'', endDate:'', description:'' });
const blankEdu   = (): EduEntry   => ({ id:uid(), degree:'', field:'', institution:'', startDate:'', endDate:'', gpa:'' });
const blankCert  = (): CertEntry  => ({ id:uid(), name:'', issuer:'', date:'', credentialId:'' });
const blankLang  = (): LangEntry  => ({ id:uid(), language:'', proficiency:'Intermediate' });
const blankRef   = (): RefEntry   => ({ id:uid(), name:'', position:'', company:'', email:'', phone:'' });

const DEFAULT: Resume = {
  fullName:'', jobTitle:'', phone:'', email:'', address:'', photoDataUrl:'',
  summary:'', skills:'',
  workExperience: [blankWork()],
  education:      [blankEdu()],
  certifications: [], languages: [], references: [],
};

// ─── Shared helpers ───────────────────────────────────────────────────────────

const parseSkills = (s: string) => s.split(/[\n,]+/).map(x=>x.trim()).filter(Boolean);
const ph = (v:string, fb:string) => v || fb;
const nameSz = (n:string) => { const l=(n||'').length; return l<=20?30:l<=30?26:l<=40?22:18; };
const dateRange = (s:string,e:string) => [s,e].filter(Boolean).join(' – ');

const PROF_LEVEL: Record<string,number> = { Beginner:1, Intermediate:2, Advanced:3, Fluent:4, Native:5 };

function Desc({ text, color='#4b5563', size=11 }:{ text:string; color?:string; size?:number }) {
  return (
    <>
      {text.split('\n').filter(Boolean).map((line,i)=>{
        const bul = /^[-•*]/.test(line.trimStart());
        const txt = bul ? line.trimStart().slice(1).trim() : line;
        return (
          <div key={i} style={{ display:'flex', gap:5, fontSize:size, color, lineHeight:1.55, marginBottom:1 }}>
            {bul && <span style={{ flexShrink:0 }}>•</span>}
            <span>{txt}</span>
          </div>
        );
      })}
    </>
  );
}

// ─── Template 1 · Classic Professional ───────────────────────────────────────

function T1Classic({ d }: { d:Resume }) {
  const navy='#1e3a5f', sb='#f0f4f8', font='"Segoe UI",Arial,sans-serif';
  const skills=parseSkills(d.skills);
  const H = ({ t }:{ t:string }) => (
    <div style={{ fontSize:11, fontWeight:800, color:navy, textTransform:'uppercase', letterSpacing:1.5, borderBottom:`2px solid ${navy}`, paddingBottom:3, marginBottom:8 }}>{t}</div>
  );
  const hasWork = d.workExperience.some(e=>e.company||e.position);
  const hasEdu  = d.education.some(e=>e.institution||e.degree);
  return (
    <div style={{ width:RW, height:RH, background:'#fff', fontFamily:font, display:'flex', flexDirection:'column', overflow:'hidden' }}>
      {/* Header */}
      <div style={{ background:navy, padding:'22px 30px', display:'flex', alignItems:'center', gap:20, flexShrink:0 }}>
        {d.photoDataUrl && <img src={d.photoDataUrl} style={{ width:80,height:80,borderRadius:'50%',objectFit:'cover',border:'3px solid rgba(255,255,255,0.25)',flexShrink:0 }} alt="" />}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:nameSz(d.fullName), fontWeight:800, color:'#fff', lineHeight:1.1, marginBottom:3 }}>{ph(d.fullName,'Your Name')}</div>
          <div style={{ fontSize:14, color:'#93c5fd', marginBottom:8 }}>{ph(d.jobTitle,'Job Title')}</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'4px 18px' }}>
            {[d.phone,d.email,d.address].filter(Boolean).map((v,i)=>(
              <span key={i} style={{ fontSize:11, color:'rgba(255,255,255,0.78)' }}>{v}</span>
            ))}
          </div>
        </div>
      </div>
      {/* Body */}
      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>
        {/* Sidebar */}
        <div style={{ width:220, background:sb, padding:'18px 14px', flexShrink:0, overflow:'hidden' }}>
          {skills.length>0 && <div style={{ marginBottom:18 }}>
            <H t="Skills" />
            <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
              {skills.map((s,i)=><span key={i} style={{ background:'#dbeafe', color:'#1e40af', borderRadius:4, padding:'2px 8px', fontSize:10, fontWeight:600 }}>{s}</span>)}
            </div>
          </div>}
          {d.languages.length>0 && <div style={{ marginBottom:18 }}>
            <H t="Languages" />
            {d.languages.map((l,i)=>(
              <div key={i} style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#374151', marginBottom:3 }}>
                <span>{l.language}</span><span style={{ color:'#6b7280' }}>{l.proficiency}</span>
              </div>
            ))}
          </div>}
          {d.certifications.length>0 && <div>
            <H t="Certifications" />
            {d.certifications.map((c,i)=>(
              <div key={i} style={{ marginBottom:8 }}>
                <div style={{ fontSize:11, fontWeight:700, color:'#1f2937' }}>{c.name}</div>
                <div style={{ fontSize:10, color:'#6b7280' }}>{c.issuer}{c.date?` · ${c.date}`:''}</div>
              </div>
            ))}
          </div>}
        </div>
        {/* Main */}
        <div style={{ flex:1, padding:'18px 22px', overflow:'hidden' }}>
          {d.summary && <div style={{ marginBottom:16 }}>
            <H t="Professional Summary" />
            <div style={{ fontSize:11, color:'#374151', lineHeight:1.6 }}>{d.summary}</div>
          </div>}
          {hasWork && <div style={{ marginBottom:16 }}>
            <H t="Work Experience" />
            {d.workExperience.filter(e=>e.company||e.position).map((j,i)=>(
              <div key={i} style={{ marginBottom:13 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:'#111827' }}>{j.position}</div>
                    <div style={{ fontSize:11, color:'#1d4ed8', fontWeight:600 }}>{j.company}</div>
                  </div>
                  <div style={{ fontSize:10, color:'#6b7280', flexShrink:0 }}>{dateRange(j.startDate,j.endDate)}</div>
                </div>
                {j.description && <div style={{ marginTop:4 }}><Desc text={j.description} /></div>}
              </div>
            ))}
          </div>}
          {hasEdu && <div style={{ marginBottom:16 }}>
            <H t="Education" />
            {d.education.filter(e=>e.institution||e.degree).map((e,i)=>(
              <div key={i} style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color:'#111827' }}>{e.degree}{e.field?` in ${e.field}`:''}</div>
                  <div style={{ fontSize:11, color:'#374151' }}>{e.institution}</div>
                  {e.gpa && <div style={{ fontSize:10, color:'#6b7280' }}>GPA: {e.gpa}</div>}
                </div>
                <div style={{ fontSize:10, color:'#6b7280', flexShrink:0 }}>{dateRange(e.startDate,e.endDate)}</div>
              </div>
            ))}
          </div>}
          {d.references.some(r=>r.name) && <div>
            <H t="References" />
            <div style={{ display:'flex', flexWrap:'wrap', gap:12 }}>
              {d.references.filter(r=>r.name).map((r,i)=>(
                <div key={i} style={{ flex:'1 1 150px' }}>
                  <div style={{ fontSize:12, fontWeight:700 }}>{r.name}</div>
                  <div style={{ fontSize:10, color:'#374151' }}>{r.position}{r.company?` at ${r.company}`:''}</div>
                  <div style={{ fontSize:10, color:'#6b7280' }}>{r.email}</div>
                  <div style={{ fontSize:10, color:'#6b7280' }}>{r.phone}</div>
                </div>
              ))}
            </div>
          </div>}
        </div>
      </div>
    </div>
  );
}

// ─── Template 2 · Modern Minimal ─────────────────────────────────────────────

function T2Minimal({ d }: { d:Resume }) {
  const blue='#2563eb', dark='#111827', font='"Segoe UI",Arial,sans-serif';
  const skills=parseSkills(d.skills);
  const H = ({ t }:{ t:string }) => (
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:9 }}>
      <span style={{ fontSize:11, fontWeight:800, color:blue, textTransform:'uppercase', letterSpacing:2 }}>{t}</span>
      <div style={{ flex:1, height:1, background:'#e5e7eb' }} />
    </div>
  );
  const hasWork=d.workExperience.some(e=>e.company||e.position);
  const hasEdu=d.education.some(e=>e.institution||e.degree);
  return (
    <div style={{ width:RW, height:RH, background:'#fff', fontFamily:font, display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <div style={{ height:4, background:`linear-gradient(90deg,${blue},#60a5fa)`, flexShrink:0 }} />
      <div style={{ padding:'28px 40px 0', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:18, marginBottom:14 }}>
          {d.photoDataUrl && <img src={d.photoDataUrl} style={{ width:72,height:72,borderRadius:'50%',objectFit:'cover',border:`2px solid ${blue}`,flexShrink:0 }} alt="" />}
          <div style={{ flex:1 }}>
            <div style={{ fontSize:nameSz(d.fullName)+4, fontWeight:900, color:dark, lineHeight:1, letterSpacing:-0.5 }}>{ph(d.fullName,'Your Name')}</div>
            <div style={{ fontSize:16, color:blue, fontWeight:600, marginTop:4 }}>{ph(d.jobTitle,'Job Title')}</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'3px 16px', marginTop:6 }}>
              {[d.phone,d.email,d.address].filter(Boolean).map((v,i)=>(
                <span key={i} style={{ fontSize:11, color:'#6b7280' }}>{v}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div style={{ flex:1, padding:'0 40px 20px', overflow:'hidden' }}>
        {d.summary && <div style={{ marginBottom:14 }}>
          <H t="Summary" />
          <div style={{ fontSize:11, color:'#374151', lineHeight:1.65 }}>{d.summary}</div>
        </div>}
        {skills.length>0 && <div style={{ marginBottom:14 }}>
          <H t="Skills" />
          <div style={{ fontSize:11, color:'#374151' }}>{skills.join(' · ')}</div>
        </div>}
        {hasWork && <div style={{ marginBottom:14 }}>
          <H t="Experience" />
          {d.workExperience.filter(e=>e.company||e.position).map((j,i)=>(
            <div key={i} style={{ marginBottom:13 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
                <div style={{ fontSize:13, fontWeight:800, color:dark }}>{j.position}</div>
                <div style={{ fontSize:10, color:'#9ca3af', flexShrink:0 }}>{dateRange(j.startDate,j.endDate)}</div>
              </div>
              <div style={{ fontSize:11, color:blue, fontWeight:600, marginBottom:2 }}>{j.company}</div>
              {j.description && <Desc text={j.description} />}
            </div>
          ))}
        </div>}
        {hasEdu && <div style={{ marginBottom:14 }}>
          <H t="Education" />
          {d.education.filter(e=>e.institution||e.degree).map((e,i)=>(
            <div key={i} style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:dark }}>{e.degree}{e.field?` in ${e.field}`:''}</div>
                <div style={{ fontSize:11, color:'#6b7280' }}>{e.institution}{e.gpa?` · GPA ${e.gpa}`:''}</div>
              </div>
              <div style={{ fontSize:10, color:'#9ca3af', flexShrink:0 }}>{dateRange(e.startDate,e.endDate)}</div>
            </div>
          ))}
        </div>}
        {(d.certifications.length>0||d.languages.length>0) && <div style={{ display:'flex', gap:32, marginBottom:14 }}>
          {d.certifications.length>0 && <div style={{ flex:1 }}>
            <H t="Certifications" />
            {d.certifications.map((c,i)=>(
              <div key={i} style={{ fontSize:11, color:'#374151', marginBottom:4 }}>{c.name}{c.issuer?` — ${c.issuer}`:''}</div>
            ))}
          </div>}
          {d.languages.length>0 && <div style={{ flex:1 }}>
            <H t="Languages" />
            {d.languages.map((l,i)=>(
              <div key={i} style={{ fontSize:11, color:'#374151', marginBottom:3 }}>{l.language} <span style={{ color:'#9ca3af' }}>({l.proficiency})</span></div>
            ))}
          </div>}
        </div>}
        {d.references.some(r=>r.name) && <div>
          <H t="References" />
          <div style={{ display:'flex', flexWrap:'wrap', gap:14 }}>
            {d.references.filter(r=>r.name).map((r,i)=>(
              <div key={i} style={{ flex:'1 1 160px' }}>
                <div style={{ fontSize:12, fontWeight:700, color:dark }}>{r.name}</div>
                <div style={{ fontSize:10, color:'#6b7280' }}>{r.position}{r.company?` · ${r.company}`:''}</div>
                <div style={{ fontSize:10, color:'#9ca3af' }}>{[r.email,r.phone].filter(Boolean).join(' · ')}</div>
              </div>
            ))}
          </div>
        </div>}
      </div>
    </div>
  );
}

// ─── Template 3 · Executive ───────────────────────────────────────────────────

function T3Executive({ d }: { d:Resume }) {
  const hdr='#0f172a', gold='#d97706', side='#f8fafc', font='"Segoe UI",Arial,sans-serif';
  const skills=parseSkills(d.skills);
  const H = ({ t }:{ t:string }) => (
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
      <div style={{ width:4, height:16, background:gold, borderRadius:2, flexShrink:0 }} />
      <span style={{ fontSize:11, fontWeight:800, color:hdr, textTransform:'uppercase', letterSpacing:1.5 }}>{t}</span>
    </div>
  );
  const hasWork=d.workExperience.some(e=>e.company||e.position);
  const hasEdu=d.education.some(e=>e.institution||e.degree);
  return (
    <div style={{ width:RW, height:RH, background:'#fff', fontFamily:font, display:'flex', flexDirection:'column', overflow:'hidden' }}>
      {/* Header */}
      <div style={{ background:hdr, padding:'24px 32px', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:20 }}>
          {d.photoDataUrl && <img src={d.photoDataUrl} style={{ width:76,height:76,borderRadius:'50%',objectFit:'cover',border:`2px solid ${gold}`,flexShrink:0 }} alt="" />}
          <div style={{ flex:1 }}>
            <div style={{ fontSize:nameSz(d.fullName)+2, fontWeight:900, color:'#fff', textTransform:'uppercase', letterSpacing:2, lineHeight:1.1 }}>{ph(d.fullName,'YOUR NAME')}</div>
            <div style={{ fontSize:14, color:'#94a3b8', marginTop:4, fontWeight:400, letterSpacing:0.5 }}>{ph(d.jobTitle,'Job Title')}</div>
          </div>
        </div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:'4px 20px', marginTop:10, paddingTop:10, borderTop:'1px solid rgba(255,255,255,0.1)' }}>
          {[d.phone,d.email,d.address].filter(Boolean).map((v,i)=>(
            <span key={i} style={{ fontSize:11, color:'#60a5fa' }}>{v}</span>
          ))}
        </div>
      </div>
      {/* Body */}
      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>
        {/* Sidebar */}
        <div style={{ width:230, background:side, borderRight:'1px solid #e2e8f0', padding:'18px 14px', flexShrink:0, overflow:'hidden' }}>
          {skills.length>0 && <div style={{ marginBottom:18 }}>
            <H t="Core Skills" />
            <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
              {skills.map((s,i)=>(
                <div key={i} style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'#374151' }}>
                  <div style={{ width:6, height:6, borderRadius:'50%', background:gold, flexShrink:0 }} />
                  {s}
                </div>
              ))}
            </div>
          </div>}
          {d.languages.length>0 && <div style={{ marginBottom:18 }}>
            <H t="Languages" />
            {d.languages.map((l,i)=>(
              <div key={i} style={{ marginBottom:6 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#374151', marginBottom:2 }}>
                  <span>{l.language}</span><span style={{ color:'#94a3b8', fontSize:10 }}>{l.proficiency}</span>
                </div>
                <div style={{ height:3, background:'#e2e8f0', borderRadius:2 }}>
                  <div style={{ height:3, width:`${(PROF_LEVEL[l.proficiency]||2)/5*100}%`, background:gold, borderRadius:2 }} />
                </div>
              </div>
            ))}
          </div>}
          {d.certifications.length>0 && <div>
            <H t="Certifications" />
            {d.certifications.map((c,i)=>(
              <div key={i} style={{ marginBottom:8 }}>
                <div style={{ fontSize:11, fontWeight:700, color:'#1e293b' }}>{c.name}</div>
                <div style={{ fontSize:10, color:'#64748b' }}>{c.issuer}{c.date?` · ${c.date}`:''}</div>
              </div>
            ))}
          </div>}
        </div>
        {/* Main */}
        <div style={{ flex:1, padding:'18px 22px', overflow:'hidden' }}>
          {d.summary && <div style={{ marginBottom:16 }}>
            <H t="Executive Summary" />
            <div style={{ fontSize:11, color:'#374151', lineHeight:1.65 }}>{d.summary}</div>
          </div>}
          {hasWork && <div style={{ marginBottom:16 }}>
            <H t="Professional Experience" />
            {d.workExperience.filter(e=>e.company||e.position).map((j,i)=>(
              <div key={i} style={{ marginBottom:13, paddingLeft:8, borderLeft:`2px solid ${gold}` }}>
                <div style={{ display:'flex', justifyContent:'space-between' }}>
                  <div style={{ fontSize:13, fontWeight:800, color:hdr }}>{j.position}</div>
                  <div style={{ fontSize:10, color:'#94a3b8', flexShrink:0 }}>{dateRange(j.startDate,j.endDate)}</div>
                </div>
                <div style={{ fontSize:11, color:'#475569', fontWeight:600, marginBottom:3 }}>{j.company}</div>
                {j.description && <Desc text={j.description} color="#64748b" />}
              </div>
            ))}
          </div>}
          {hasEdu && <div style={{ marginBottom:16 }}>
            <H t="Education" />
            {d.education.filter(e=>e.institution||e.degree).map((e,i)=>(
              <div key={i} style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color:hdr }}>{e.degree}{e.field?` in ${e.field}`:''}</div>
                  <div style={{ fontSize:11, color:'#475569' }}>{e.institution}{e.gpa?` · GPA ${e.gpa}`:''}</div>
                </div>
                <div style={{ fontSize:10, color:'#94a3b8', flexShrink:0 }}>{dateRange(e.startDate,e.endDate)}</div>
              </div>
            ))}
          </div>}
          {d.references.some(r=>r.name) && <div>
            <H t="References" />
            <div style={{ display:'flex', flexWrap:'wrap', gap:12 }}>
              {d.references.filter(r=>r.name).map((r,i)=>(
                <div key={i} style={{ flex:'1 1 150px' }}>
                  <div style={{ fontSize:12, fontWeight:700, color:hdr }}>{r.name}</div>
                  <div style={{ fontSize:10, color:'#64748b' }}>{r.position}{r.company?` · ${r.company}`:''}</div>
                  <div style={{ fontSize:10, color:'#94a3b8' }}>{[r.email,r.phone].filter(Boolean).join(' · ')}</div>
                </div>
              ))}
            </div>
          </div>}
        </div>
      </div>
    </div>
  );
}

// ─── Template 4 · Creative ────────────────────────────────────────────────────

function T4Creative({ d }: { d:Resume }) {
  const sbGrad='linear-gradient(180deg,#1d4ed8 0%,#1e3a5f 100%)', font='"Segoe UI",Arial,sans-serif';
  const skills=parseSkills(d.skills);
  const SbH = ({ t }:{ t:string }) => (
    <div style={{ fontSize:10, fontWeight:800, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:2, marginBottom:7, paddingBottom:4, borderBottom:'1px solid rgba(255,255,255,0.15)' }}>{t}</div>
  );
  const MainH = ({ t }:{ t:string }) => (
    <div style={{ fontSize:11, fontWeight:800, color:'#1e3a5f', textTransform:'uppercase', letterSpacing:1.5, marginBottom:8, paddingBottom:3, borderBottom:'2px solid #bfdbfe' }}>{t}</div>
  );
  const hasWork=d.workExperience.some(e=>e.company||e.position);
  const hasEdu=d.education.some(e=>e.institution||e.degree);
  return (
    <div style={{ width:RW, height:RH, background:'#fff', fontFamily:font, display:'flex', flexDirection:'row', overflow:'hidden' }}>
      {/* Sidebar */}
      <div style={{ width:245, background:sbGrad, padding:'28px 18px', display:'flex', flexDirection:'column', gap:18, flexShrink:0, overflow:'hidden' }}>
        {/* Photo + identity */}
        <div style={{ textAlign:'center' }}>
          {d.photoDataUrl
            ? <img src={d.photoDataUrl} style={{ width:90,height:90,borderRadius:'50%',objectFit:'cover',border:'3px solid rgba(255,255,255,0.3)',display:'block',margin:'0 auto 10px' }} alt="" />
            : <div style={{ width:90,height:90,borderRadius:'50%',background:'rgba(255,255,255,0.12)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 10px' }}>
                <span style={{ fontSize:32, color:'rgba(255,255,255,0.4)' }}>👤</span>
              </div>
          }
          <div style={{ fontSize:nameSz(d.fullName)-6, fontWeight:800, color:'#fff', lineHeight:1.15, marginBottom:4 }}>{ph(d.fullName,'Your Name')}</div>
          <div style={{ fontSize:12, color:'#93c5fd', fontWeight:500 }}>{ph(d.jobTitle,'Job Title')}</div>
        </div>
        {/* Contact */}
        {(d.phone||d.email||d.address) && <div>
          <SbH t="Contact" />
          {[d.phone,d.email,d.address].filter(Boolean).map((v,i)=>(
            <div key={i} style={{ fontSize:10, color:'rgba(255,255,255,0.8)', marginBottom:5, wordBreak:'break-all' }}>{v}</div>
          ))}
        </div>}
        {/* Skills */}
        {skills.length>0 && <div>
          <SbH t="Skills" />
          <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
            {skills.map((s,i)=>(
              <span key={i} style={{ background:'rgba(255,255,255,0.12)', color:'#bfdbfe', borderRadius:4, padding:'2px 8px', fontSize:10 }}>{s}</span>
            ))}
          </div>
        </div>}
        {/* Languages */}
        {d.languages.length>0 && <div>
          <SbH t="Languages" />
          {d.languages.map((l,i)=>(
            <div key={i} style={{ marginBottom:6 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'rgba(255,255,255,0.85)', marginBottom:2 }}>
                <span>{l.language}</span>
                <span style={{ color:'rgba(255,255,255,0.5)' }}>{l.proficiency}</span>
              </div>
              <div style={{ height:3, background:'rgba(255,255,255,0.15)', borderRadius:2 }}>
                <div style={{ height:3, width:`${(PROF_LEVEL[l.proficiency]||2)/5*100}%`, background:'#60a5fa', borderRadius:2 }} />
              </div>
            </div>
          ))}
        </div>}
        {/* Certifications */}
        {d.certifications.length>0 && <div>
          <SbH t="Certifications" />
          {d.certifications.map((c,i)=>(
            <div key={i} style={{ marginBottom:6 }}>
              <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.9)' }}>{c.name}</div>
              <div style={{ fontSize:9, color:'rgba(255,255,255,0.55)' }}>{c.issuer}{c.date?` · ${c.date}`:''}</div>
            </div>
          ))}
        </div>}
      </div>
      {/* Main content */}
      <div style={{ flex:1, padding:'24px 22px', overflow:'hidden' }}>
        {d.summary && <div style={{ marginBottom:16 }}>
          <MainH t="About Me" />
          <div style={{ fontSize:11, color:'#374151', lineHeight:1.65 }}>{d.summary}</div>
        </div>}
        {hasWork && <div style={{ marginBottom:16 }}>
          <MainH t="Work Experience" />
          {d.workExperience.filter(e=>e.company||e.position).map((j,i)=>(
            <div key={i} style={{ marginBottom:13, paddingLeft:10, borderLeft:'3px solid #bfdbfe' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div style={{ fontSize:13, fontWeight:800, color:'#1e3a5f' }}>{j.position}</div>
                <div style={{ fontSize:10, color:'#93c5fd', flexShrink:0, fontWeight:600 }}>{dateRange(j.startDate,j.endDate)}</div>
              </div>
              <div style={{ fontSize:11, color:'#2563eb', fontWeight:600, marginBottom:3 }}>{j.company}</div>
              {j.description && <Desc text={j.description} color="#4b5563" />}
            </div>
          ))}
        </div>}
        {hasEdu && <div style={{ marginBottom:16 }}>
          <MainH t="Education" />
          {d.education.filter(e=>e.institution||e.degree).map((e,i)=>(
            <div key={i} style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:'#1e3a5f' }}>{e.degree}{e.field?` in ${e.field}`:''}</div>
                <div style={{ fontSize:11, color:'#6b7280' }}>{e.institution}{e.gpa?` · GPA ${e.gpa}`:''}</div>
              </div>
              <div style={{ fontSize:10, color:'#93c5fd', flexShrink:0, fontWeight:600 }}>{dateRange(e.startDate,e.endDate)}</div>
            </div>
          ))}
        </div>}
        {d.references.some(r=>r.name) && <div>
          <MainH t="References" />
          <div style={{ display:'flex', flexWrap:'wrap', gap:12 }}>
            {d.references.filter(r=>r.name).map((r,i)=>(
              <div key={i} style={{ flex:'1 1 150px' }}>
                <div style={{ fontSize:12, fontWeight:700, color:'#1e3a5f' }}>{r.name}</div>
                <div style={{ fontSize:10, color:'#374151' }}>{r.position}{r.company?` · ${r.company}`:''}</div>
                <div style={{ fontSize:10, color:'#9ca3af' }}>{[r.email,r.phone].filter(Boolean).join(' · ')}</div>
              </div>
            ))}
          </div>
        </div>}
      </div>
    </div>
  );
}

// ─── Template 5 · Timeline Pro ────────────────────────────────────────────────

function T5Timeline({ d }: { d:Resume }) {
  const teal='#0ea5e9', navy='#0f172a', font='"Segoe UI",Arial,sans-serif';
  const skills=parseSkills(d.skills);
  const H = ({ t }:{ t:string }) => (
    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
      <div style={{ width:8, height:8, borderRadius:'50%', background:teal, flexShrink:0 }} />
      <span style={{ fontSize:11, fontWeight:800, color:navy, textTransform:'uppercase', letterSpacing:2 }}>{t}</span>
      <div style={{ flex:1, height:1, background:'#e2e8f0' }} />
    </div>
  );
  const hasWork=d.workExperience.some(e=>e.company||e.position);
  const hasEdu=d.education.some(e=>e.institution||e.degree);
  return (
    <div style={{ width:RW, height:RH, background:'#fff', fontFamily:font, display:'flex', flexDirection:'column', overflow:'hidden' }}>
      {/* Gradient top bar */}
      <div style={{ height:5, background:`linear-gradient(90deg,${teal},#818cf8)`, flexShrink:0 }} />
      {/* Header */}
      <div style={{ padding:'22px 36px 14px', borderBottom:'1px solid #e2e8f0', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:nameSz(d.fullName)+2, fontWeight:900, color:navy, letterSpacing:-0.5, lineHeight:1 }}>{ph(d.fullName,'Your Name')}</div>
            <div style={{ fontSize:16, color:teal, fontWeight:600, marginTop:3 }}>{ph(d.jobTitle,'Job Title')}</div>
          </div>
          {d.photoDataUrl && <img src={d.photoDataUrl} style={{ width:68,height:68,borderRadius:'50%',objectFit:'cover',border:`2px solid ${teal}`,flexShrink:0 }} alt="" />}
        </div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:'3px 16px', marginTop:8 }}>
          {[d.phone,d.email,d.address].filter(Boolean).map((v,i)=>(
            <span key={i} style={{ fontSize:11, color:'#64748b' }}>{v}</span>
          ))}
        </div>
      </div>
      {/* Body */}
      <div style={{ flex:1, padding:'16px 36px', overflow:'hidden' }}>
        {d.summary && <div style={{ marginBottom:14 }}>
          <H t="Summary" />
          <div style={{ fontSize:11, color:'#475569', lineHeight:1.65 }}>{d.summary}</div>
        </div>}
        {hasWork && <div style={{ marginBottom:14 }}>
          <H t="Experience" />
          <div style={{ borderLeft:`2px solid ${teal}`, marginLeft:4, paddingLeft:16 }}>
            {d.workExperience.filter(e=>e.company||e.position).map((j,i)=>(
              <div key={i} style={{ position:'relative', marginBottom:14 }}>
                <div style={{ position:'absolute', left:-22, top:4, width:8, height:8, borderRadius:'50%', background:teal, border:'2px solid #fff', boxShadow:`0 0 0 1px ${teal}` }} />
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <div style={{ fontSize:13, fontWeight:800, color:navy }}>{j.position}</div>
                  <div style={{ fontSize:10, color:'#94a3b8', flexShrink:0 }}>{dateRange(j.startDate,j.endDate)}</div>
                </div>
                <div style={{ fontSize:11, color:teal, fontWeight:600, marginBottom:3 }}>{j.company}</div>
                {j.description && <Desc text={j.description} color="#64748b" />}
              </div>
            ))}
          </div>
        </div>}
        <div style={{ display:'flex', gap:28, marginBottom:14 }}>
          {hasEdu && <div style={{ flex:1 }}>
            <H t="Education" />
            {d.education.filter(e=>e.institution||e.degree).map((e,i)=>(
              <div key={i} style={{ marginBottom:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between' }}>
                  <div style={{ fontSize:12, fontWeight:700, color:navy }}>{e.degree}{e.field?` in ${e.field}`:''}</div>
                  <div style={{ fontSize:10, color:'#94a3b8', flexShrink:0 }}>{dateRange(e.startDate,e.endDate)}</div>
                </div>
                <div style={{ fontSize:11, color:'#64748b' }}>{e.institution}{e.gpa?` · GPA ${e.gpa}`:''}</div>
              </div>
            ))}
          </div>}
          {(d.languages.length>0||d.certifications.length>0) && <div style={{ flex:1 }}>
            {d.languages.length>0 && <>
              <H t="Languages" />
              {d.languages.map((l,i)=>(
                <div key={i} style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#475569', marginBottom:3 }}>
                  <span>{l.language}</span><span style={{ color:'#94a3b8' }}>{l.proficiency}</span>
                </div>
              ))}
            </>}
            {d.certifications.length>0 && <div style={{ marginTop: d.languages.length>0 ? 12 : 0 }}>
              <H t="Certifications" />
              {d.certifications.map((c,i)=>(
                <div key={i} style={{ fontSize:11, color:'#475569', marginBottom:4 }}>{c.name}{c.issuer?` — ${c.issuer}`:''}</div>
              ))}
            </div>}
          </div>}
        </div>
        {skills.length>0 && <div style={{ marginBottom:14 }}>
          <H t="Skills" />
          <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
            {skills.map((s,i)=>(
              <span key={i} style={{ background:'#f0f9ff', border:`1px solid ${teal}`, color:'#0369a1', borderRadius:20, padding:'2px 10px', fontSize:10, fontWeight:600 }}>{s}</span>
            ))}
          </div>
        </div>}
        {d.references.some(r=>r.name) && <div>
          <H t="References" />
          <div style={{ display:'flex', flexWrap:'wrap', gap:14 }}>
            {d.references.filter(r=>r.name).map((r,i)=>(
              <div key={i} style={{ flex:'1 1 150px' }}>
                <div style={{ fontSize:12, fontWeight:700, color:navy }}>{r.name}</div>
                <div style={{ fontSize:10, color:'#64748b' }}>{r.position}{r.company?` · ${r.company}`:''}</div>
                <div style={{ fontSize:10, color:'#94a3b8' }}>{[r.email,r.phone].filter(Boolean).join(' · ')}</div>
              </div>
            ))}
          </div>
        </div>}
      </div>
    </div>
  );
}

// ─── Resume canvas dispatcher ─────────────────────────────────────────────────

function ResumeCanvas({ data, tmpl }: { data:Resume; tmpl:TId }) {
  switch(tmpl) {
    case 'classic':   return <T1Classic d={data} />;
    case 'minimal':   return <T2Minimal d={data} />;
    case 'executive': return <T3Executive d={data} />;
    case 'creative':  return <T4Creative d={data} />;
    case 'timeline':  return <T5Timeline d={data} />;
  }
}

// ─── Form helpers ─────────────────────────────────────────────────────────────

function Sec({ icon: Icon, title, children }: { icon:React.ElementType; title:string; children:React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 pb-1.5 border-b">
        <Icon className="w-4 h-4 text-blue-600 shrink-0" />
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function F({ label, id, children, optional }: { label:string; id:string; children:React.ReactNode; optional?:boolean }) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-xs font-semibold text-gray-600">
        {label}{optional && <span className="text-gray-400 font-normal ml-1">(optional)</span>}
      </Label>
      {children}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ResumeBuilder() {
  const [resume, setResume]   = useState<Resume>(DEFAULT);
  const [tmpl, setTmpl]       = useState<TId>('classic');
  const [exporting, setExp]   = useState(false);
  const [scale, setScale]     = useState(0.7);
  const { toast }             = useToast();
  const containerRef          = useRef<HTMLDivElement>(null);
  const captureRef            = useRef<HTMLDivElement>(null);
  const photoInputRef         = useRef<HTMLInputElement>(null);

  // Responsive preview scaling
  useEffect(() => {
    const update = () => {
      if (containerRef.current) setScale(Math.min(containerRef.current.clientWidth / RW, 1));
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const set = (key: keyof Resume) => (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) =>
    setResume(p => ({ ...p, [key]: e.target.value }));

  // Generic list updater
  function listSet<T>(key: keyof Resume, idx: number, field: keyof T, val: string) {
    setResume(p => ({
      ...p,
      [key]: (p[key] as T[]).map((item, i) => i===idx ? { ...item, [field]: val } : item)
    }));
  }
  function listAdd<T>(key: keyof Resume, blank: T) {
    setResume(p => ({ ...p, [key]: [...(p[key] as T[]), blank] }));
  }
  function listRemove(key: keyof Resume, idx: number) {
    setResume(p => ({ ...p, [key]: (p[key] as unknown[]).filter((_,i)=>i!==idx) }));
  }

  // Photo upload
  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setResume(p => ({ ...p, photoDataUrl: ev.target?.result as string }));
    reader.readAsDataURL(file);
  };

  // Capture
  const capture = useCallback(async (dpi=3): Promise<HTMLCanvasElement|null> => {
    try { await document.fonts.ready; } catch {}
    if (!captureRef.current) return null;
    return html2canvas(captureRef.current, {
      scale: dpi, useCORS: true, allowTaint: true,
      backgroundColor: '#ffffff', logging: false,
      onclone: (doc) => {
        document.querySelectorAll('link[rel="stylesheet"],style').forEach(n => {
          try { doc.head.appendChild(n.cloneNode(true)); } catch {}
        });
      }
    });
  }, []);

  const exportPdf = async () => {
    setExp(true);
    try {
      const canvas = await capture(3);
      if (!canvas) throw new Error();
      const img = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4' });
      pdf.addImage(img, 'PNG', 0, 0, 210, 297);
      pdf.save(`${resume.fullName.trim()||'resume'}-resume.pdf`);
      toast({ title:'PDF Downloaded!', description:'High-resolution A4 PDF saved.', duration:2500 });
    } catch {
      toast({ title:'Export failed', description:'Please try again.', variant:'destructive' });
    } finally { setExp(false); }
  };

  const handlePrint = async () => {
    setExp(true);
    try {
      const canvas = await capture(3);
      if (!canvas) throw new Error();
      const url = canvas.toDataURL('image/png');
      const win = window.open('','_blank');
      if (!win) throw new Error('popup');
      win.document.write(`<html><head><title>Resume</title>
        <style>*{margin:0;padding:0;box-sizing:border-box}body{background:#f5f5f5;display:flex;align-items:center;justify-content:center;min-height:100vh}img{max-width:100%;box-shadow:0 4px 24px rgba(0,0,0,0.15)}@media print{body{background:#fff}img{width:100%;height:auto;box-shadow:none}}</style>
        </head><body><img src="${url}" onload="window.print();setTimeout(()=>window.close(),500);" /></body></html>`);
      win.document.close();
    } catch { toast({ title:'Print failed', description:'Allow pop-ups for this site.', variant:'destructive' }); }
    finally { setExp(false); }
  };

  const handleReset = () => { setResume(DEFAULT); setTmpl('classic'); };

  return (
  <>
    <div className="max-w-screen-xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Resume Builder</h1>
        <p className="text-muted-foreground">Build a professional resume in minutes — no sign-up, works entirely in your browser</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[400px_1fr] gap-6 items-start">

        {/* ── Form ──────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border p-5 space-y-6 xl:sticky xl:top-4 xl:max-h-[calc(100vh-2rem)] xl:overflow-y-auto">

          {/* Template selector */}
          <Sec icon={Eye} title="Template">
            <div className="grid grid-cols-5 gap-2">
              {TMPL_META.map(t => (
                <button key={t.id} onClick={() => setTmpl(t.id)} title={t.name}
                  className={`rounded-lg border-2 overflow-hidden transition-all cursor-pointer ${tmpl===t.id?'border-blue-500 ring-2 ring-blue-200':'border-gray-200 hover:border-gray-300'}`}
                  style={{ aspectRatio:'0.707' }}>
                  <div className="h-full flex flex-col relative">
                    {t.id==='creative'
                      ? <div className="h-full flex flex-row">
                          <div style={{ background:'#1d4ed8', width:'32%' }} />
                          <div style={{ background:'#fff', flex:1 }} />
                        </div>
                      : t.id==='timeline'
                        ? <div className="h-full" style={{ background:'#fff', borderTop:'3px solid #0ea5e9' }} />
                        : t.id==='minimal'
                          ? <div className="h-full" style={{ background:'#fff', borderTop:'3px solid #2563eb' }} />
                          : <>
                              <div style={{ background:t.preview[0][0], height:t.preview[0][1] }} />
                              {t.preview[1] && <div style={{ background:t.preview[1][0], flex:1 }} />}
                            </>
                    }
                    {tmpl===t.id && (
                      <div className="absolute inset-0 flex items-end justify-center pb-1">
                        <span className="text-[8px] font-bold text-white bg-blue-500 rounded px-1 leading-4 shadow">{t.name}</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-center text-muted-foreground">{TMPL_META.find(t=>t.id===tmpl)?.name}</p>
          </Sec>

          <div className="border-t" />

          {/* Personal info */}
          <Sec icon={User} title="Personal Information">
            {/* Photo upload */}
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center bg-gray-50 shrink-0 cursor-pointer" onClick={()=>photoInputRef.current?.click()}>
                {resume.photoDataUrl
                  ? <img src={resume.photoDataUrl} className="w-full h-full object-cover" alt="" />
                  : <User className="w-6 h-6 text-gray-300" />
                }
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-xs font-semibold text-gray-600">Profile Photo <span className="text-gray-400 font-normal">(optional)</span></p>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7" onClick={()=>photoInputRef.current?.click()}>
                  <Upload className="w-3 h-3" /> Upload Photo
                </Button>
                {resume.photoDataUrl && (
                  <button className="text-xs text-red-500 hover:text-red-700 ml-2" onClick={()=>setResume(p=>({...p,photoDataUrl:''}))}>Remove</button>
                )}
              </div>
              <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <F label="Full Name" id="fullName"><Input id="fullName" placeholder="Jane Smith" value={resume.fullName} onChange={set('fullName')} /></F>
              <F label="Job Title" id="jobTitle"><Input id="jobTitle" placeholder="Software Engineer" value={resume.jobTitle} onChange={set('jobTitle')} /></F>
              <F label="Phone" id="phone"><Input id="phone" placeholder="+1 (555) 000-0000" value={resume.phone} onChange={set('phone')} /></F>
              <F label="Email" id="email"><Input id="email" type="email" placeholder="jane@example.com" value={resume.email} onChange={set('email')} /></F>
            </div>
            <F label="Address" id="address"><Input id="address" placeholder="City, State, Country" value={resume.address} onChange={set('address')} /></F>
          </Sec>

          <div className="border-t" />

          {/* Summary */}
          <Sec icon={FileText} title="Professional Summary">
            <textarea id="summary" rows={4} placeholder="Write a compelling 2–4 sentence summary of your experience, skills, and career goals…"
              value={resume.summary} onChange={set('summary')}
              className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </Sec>

          <div className="border-t" />

          {/* Skills */}
          <Sec icon={Zap} title="Skills">
            <textarea id="skills" rows={3} placeholder="JavaScript, React, Node.js, Python&#10;(comma or newline separated)"
              value={resume.skills} onChange={set('skills')}
              className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </Sec>

          <div className="border-t" />

          {/* Work Experience */}
          <Sec icon={Briefcase} title="Work Experience">
            <div className="space-y-3">
              {resume.workExperience.map((job, idx) => (
                <div key={job.id} className="bg-gray-50 rounded-xl p-3 space-y-2 relative">
                  {resume.workExperience.length > 1 && (
                    <button onClick={()=>listRemove('workExperience',idx)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <Input aria-label="Job Title" placeholder="Job Title" value={job.position} onChange={e=>listSet<WorkEntry>('workExperience',idx,'position',e.target.value)} className="text-sm" />
                    <Input aria-label="Company" placeholder="Company" value={job.company} onChange={e=>listSet<WorkEntry>('workExperience',idx,'company',e.target.value)} className="text-sm" />
                    <Input aria-label="Start Date" placeholder="Start (e.g. Jan 2020)" value={job.startDate} onChange={e=>listSet<WorkEntry>('workExperience',idx,'startDate',e.target.value)} className="text-sm" />
                    <Input aria-label="End Date" placeholder="End (or Present)" value={job.endDate} onChange={e=>listSet<WorkEntry>('workExperience',idx,'endDate',e.target.value)} className="text-sm" />
                  </div>
                  <textarea aria-label="Responsibilities" rows={3} placeholder="Responsibilities (use - for bullet points)…"
                    value={job.description} onChange={e=>listSet<WorkEntry>('workExperience',idx,'description',e.target.value)}
                    className="w-full border rounded-md px-2.5 py-1.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white" />
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full gap-2 border-dashed text-blue-600 hover:text-blue-700 hover:border-blue-300" onClick={()=>listAdd('workExperience',blankWork())}>
                <Plus className="w-4 h-4" /> Add Experience
              </Button>
            </div>
          </Sec>

          <div className="border-t" />

          {/* Education */}
          <Sec icon={GraduationCap} title="Education">
            <div className="space-y-3">
              {resume.education.map((edu, idx) => (
                <div key={edu.id} className="bg-gray-50 rounded-xl p-3 space-y-2 relative">
                  {resume.education.length > 1 && (
                    <button onClick={()=>listRemove('education',idx)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <Input aria-label="Degree" placeholder="Degree (e.g. B.Sc.)" value={edu.degree} onChange={e=>listSet<EduEntry>('education',idx,'degree',e.target.value)} className="text-sm" />
                    <Input aria-label="Field of Study" placeholder="Field of Study" value={edu.field} onChange={e=>listSet<EduEntry>('education',idx,'field',e.target.value)} className="text-sm" />
                  </div>
                  <Input aria-label="Institution" placeholder="Institution / School" value={edu.institution} onChange={e=>listSet<EduEntry>('education',idx,'institution',e.target.value)} className="text-sm" />
                  <div className="grid grid-cols-3 gap-2">
                    <Input aria-label="Start Year" placeholder="Start Year" value={edu.startDate} onChange={e=>listSet<EduEntry>('education',idx,'startDate',e.target.value)} className="text-sm" />
                    <Input aria-label="End Year" placeholder="End Year" value={edu.endDate} onChange={e=>listSet<EduEntry>('education',idx,'endDate',e.target.value)} className="text-sm" />
                    <Input aria-label="GPA" placeholder="GPA (opt.)" value={edu.gpa} onChange={e=>listSet<EduEntry>('education',idx,'gpa',e.target.value)} className="text-sm" />
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full gap-2 border-dashed text-blue-600 hover:text-blue-700 hover:border-blue-300" onClick={()=>listAdd('education',blankEdu())}>
                <Plus className="w-4 h-4" /> Add Education
              </Button>
            </div>
          </Sec>

          <div className="border-t" />

          {/* Certifications */}
          <Sec icon={Award} title="Certifications">
            <div className="space-y-3">
              {resume.certifications.map((cert, idx) => (
                <div key={cert.id} className="bg-gray-50 rounded-xl p-3 space-y-2 relative">
                  <button onClick={()=>listRemove('certifications',idx)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <Input aria-label="Certification Name" placeholder="Certification Name" value={cert.name} onChange={e=>listSet<CertEntry>('certifications',idx,'name',e.target.value)} className="text-sm" />
                  <div className="grid grid-cols-2 gap-2">
                    <Input aria-label="Issuing Organization" placeholder="Issuing Organization" value={cert.issuer} onChange={e=>listSet<CertEntry>('certifications',idx,'issuer',e.target.value)} className="text-sm" />
                    <Input aria-label="Date" placeholder="Date (e.g. Dec 2023)" value={cert.date} onChange={e=>listSet<CertEntry>('certifications',idx,'date',e.target.value)} className="text-sm" />
                  </div>
                  <Input aria-label="Credential ID" placeholder="Credential ID (optional)" value={cert.credentialId} onChange={e=>listSet<CertEntry>('certifications',idx,'credentialId',e.target.value)} className="text-sm" />
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full gap-2 border-dashed text-blue-600 hover:text-blue-700 hover:border-blue-300" onClick={()=>listAdd('certifications',blankCert())}>
                <Plus className="w-4 h-4" /> Add Certification
              </Button>
            </div>
          </Sec>

          <div className="border-t" />

          {/* Languages */}
          <Sec icon={Globe} title="Languages">
            <div className="space-y-2">
              {resume.languages.map((lang, idx) => (
                <div key={lang.id} className="flex gap-2 items-center">
                  <Input aria-label="Language" placeholder="Language" value={lang.language} onChange={e=>listSet<LangEntry>('languages',idx,'language',e.target.value)} className="text-sm flex-1" />
                  <select aria-label="Proficiency" value={lang.proficiency} onChange={e=>listSet<LangEntry>('languages',idx,'proficiency',e.target.value)}
                    className="border rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white flex-1">
                    {PROFICIENCY.map(p=><option key={p}>{p}</option>)}
                  </select>
                  <button onClick={()=>listRemove('languages',idx)} className="text-gray-400 hover:text-red-500 transition-colors shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full gap-2 border-dashed text-blue-600 hover:text-blue-700 hover:border-blue-300" onClick={()=>listAdd('languages',blankLang())}>
                <Plus className="w-4 h-4" /> Add Language
              </Button>
            </div>
          </Sec>

          <div className="border-t" />

          {/* References */}
          <Sec icon={UserCheck} title="References">
            <div className="space-y-3">
              {resume.references.map((ref, idx) => (
                <div key={ref.id} className="bg-gray-50 rounded-xl p-3 space-y-2 relative">
                  <button onClick={()=>listRemove('references',idx)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <Input aria-label="Reference Name" placeholder="Full Name" value={ref.name} onChange={e=>listSet<RefEntry>('references',idx,'name',e.target.value)} className="text-sm" />
                    <Input aria-label="Reference Job Title" placeholder="Job Title" value={ref.position} onChange={e=>listSet<RefEntry>('references',idx,'position',e.target.value)} className="text-sm" />
                  </div>
                  <Input aria-label="Reference Company" placeholder="Company" value={ref.company} onChange={e=>listSet<RefEntry>('references',idx,'company',e.target.value)} className="text-sm" />
                  <div className="grid grid-cols-2 gap-2">
                    <Input aria-label="Reference Email" placeholder="Email" value={ref.email} onChange={e=>listSet<RefEntry>('references',idx,'email',e.target.value)} className="text-sm" />
                    <Input aria-label="Reference Phone" placeholder="Phone" value={ref.phone} onChange={e=>listSet<RefEntry>('references',idx,'phone',e.target.value)} className="text-sm" />
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full gap-2 border-dashed text-blue-600 hover:text-blue-700 hover:border-blue-300" onClick={()=>listAdd('references',blankRef())}>
                <Plus className="w-4 h-4" /> Add Reference
              </Button>
            </div>
          </Sec>

          <div className="border-t" />

          {/* Reset */}
          <Button variant="outline" onClick={handleReset} className="w-full gap-2 text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50">
            <RefreshCw className="w-4 h-4" /> Reset All Fields
          </Button>
        </div>

        {/* ── Preview + actions ──────────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Action bar */}
          <div className="bg-white rounded-2xl shadow-sm border p-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 mr-auto">
              <FileText className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-sm">Resume Preview</span>
              <span className="text-xs text-muted-foreground hidden sm:inline">— updates as you type</span>
            </div>
            <Button variant="outline" size="sm" onClick={handlePrint} disabled={exporting} className="gap-2">
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
              Print
            </Button>
            <Button size="sm" onClick={exportPdf} disabled={exporting} className="gap-2">
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Download PDF
            </Button>
          </div>

          {/* Preview */}
          <div className="bg-gray-100 rounded-2xl border p-4 overflow-hidden">
            <div ref={containerRef} className="w-full">
              <div style={{ width:'100%', height:RH*scale, position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:0, left:0, width:RW, height:RH, transform:`scale(${scale})`, transformOrigin:'top left', boxShadow:'0 4px 32px rgba(0,0,0,0.15)' }}>
                  {/* Visual preview only */}
                  <ResumeCanvas data={resume} tmpl={tmpl} />
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            High-resolution PDF · Portrait A4 · Works offline · No data sent anywhere
          </p>
        </div>
      </div>

    </div>

    {/* Off-screen capture — sibling to animated div, no transform ancestor */}
    <div ref={captureRef} aria-hidden="true"
      style={{ position:'fixed', left:-9999, top:0, width:RW, height:RH, pointerEvents:'none', zIndex:-1, overflow:'hidden' }}>
      <ResumeCanvas data={resume} tmpl={tmpl} />
    </div>
  </>
  );
}
