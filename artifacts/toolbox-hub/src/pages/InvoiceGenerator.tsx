import React, { useState, useRef, useEffect, useCallback } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  Download, Printer, RefreshCw, FileImage, FileText,
  Loader2, Plus, Trash2, Upload, ChevronDown, ChevronUp,
  Building2, User, Receipt,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

// ─── Constants ────────────────────────────────────────────────────────────────

const INV_W = 794; // A4 portrait at 96 dpi

type TemplateId = 'classic' | 'modern' | 'minimal' | 'executive' | 'bold';
type DiscountType = 'percent' | 'fixed';

interface InvoiceItem {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
}

interface InvoiceData {
  // Business
  businessName: string;
  logoDataUrl: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  businessWebsite: string;
  // Customer
  customerName: string;
  customerCompany: string;
  customerAddress: string;
  customerEmail: string;
  customerPhone: string;
  // Invoice details
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  // Items
  items: InvoiceItem[];
  // Pricing
  discountType: DiscountType;
  discountValue: number;
  taxPercent: number;
  // Extra
  notes: string;
  paymentInstructions: string;
  thankYouMessage: string;
}

// ─── Currencies ───────────────────────────────────────────────────────────────

const CURRENCIES: Record<string, { symbol: string; name: string }> = {
  USD: { symbol: '$',    name: 'US Dollar' },
  EUR: { symbol: '€',    name: 'Euro' },
  GBP: { symbol: '£',    name: 'British Pound' },
  NGN: { symbol: '₦',    name: 'Nigerian Naira' },
  CAD: { symbol: 'CA$',  name: 'Canadian Dollar' },
  AUD: { symbol: 'A$',   name: 'Australian Dollar' },
  JPY: { symbol: '¥',    name: 'Japanese Yen' },
  INR: { symbol: '₹',    name: 'Indian Rupee' },
  CHF: { symbol: 'Fr ',  name: 'Swiss Franc' },
  ZAR: { symbol: 'R ',   name: 'South African Rand' },
  AED: { symbol: 'AED ', name: 'UAE Dirham' },
  BRL: { symbol: 'R$',   name: 'Brazilian Real' },
  MXN: { symbol: 'MX$',  name: 'Mexican Peso' },
  SGD: { symbol: 'S$',   name: 'Singapore Dollar' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

let _itemCounter = 0;
const uid = () => `item-${++_itemCounter}`;

function genNo() {
  const d = new Date();
  return `INV-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}-${String(Math.floor(Math.random()*9000)+1000)}`;
}

function todayStr() { return new Date().toISOString().split('T')[0]; }
function dueDateStr() { return new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]; }

function fmtDate(s: string) {
  if (!s) return '—';
  try { return new Date(s + 'T12:00:00').toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' }); }
  catch { return s; }
}

function money(n: number, sym: string) {
  return `${sym}${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function calcTotals(d: InvoiceData) {
  const sym    = CURRENCIES[d.currency]?.symbol ?? '$';
  const sub    = d.items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const discAmt = d.discountType === 'percent'
    ? sub * (d.discountValue / 100)
    : d.discountValue;
  const afterDisc = sub - discAmt;
  const taxAmt  = afterDisc * (d.taxPercent / 100);
  const grand   = afterDisc + taxAmt;
  return { sym, sub, discAmt, afterDisc, taxAmt, grand };
}

function ph(v: string, fallback: string) { return v.trim() || fallback; }

// ─── Template helpers ─────────────────────────────────────────────────────────

function ItemsTable({ d, headBg, headColor, rowAlt, borderColor, font }:
  { d: InvoiceData; headBg: string; headColor: string; rowAlt: string; borderColor: string; font: string }) {
  const { sym } = calcTotals(d);
  const visItems = d.items.filter(i => i.description || i.qty || i.unitPrice);
  const col = { description: '48%', qty: '12%', unit: '20%', total: '20%' };
  return (
    <table style={{ width:'100%', borderCollapse:'collapse', fontFamily:font, fontSize:13 }}>
      <thead>
        <tr>
          {(['DESCRIPTION','QTY','UNIT PRICE','AMOUNT'] as const).map((h, hi) => (
            <th key={h} style={{
              background: headBg, color: headColor,
              padding: '10px 12px', textAlign: hi === 0 ? 'left' : 'right',
              fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase',
              width: [col.description, col.qty, col.unit, col.total][hi],
            }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {visItems.length === 0 ? (
          <tr>
            <td colSpan={4} style={{ padding:'14px 12px', color:'#9ca3af', fontSize:12, textAlign:'center',
              borderBottom:`1px solid ${borderColor}` }}>
              No items added yet
            </td>
          </tr>
        ) : visItems.map((item, idx) => (
          <tr key={item.id} style={{ background: idx % 2 === 1 ? rowAlt : 'transparent' }}>
            <td style={{ padding:'11px 12px', borderBottom:`1px solid ${borderColor}` }}>
              {item.description || <span style={{ color:'#9ca3af' }}>Item description</span>}
            </td>
            <td style={{ padding:'11px 12px', textAlign:'right', borderBottom:`1px solid ${borderColor}` }}>{item.qty}</td>
            <td style={{ padding:'11px 12px', textAlign:'right', borderBottom:`1px solid ${borderColor}` }}>{money(item.unitPrice, sym)}</td>
            <td style={{ padding:'11px 12px', textAlign:'right', fontWeight:600, borderBottom:`1px solid ${borderColor}` }}>
              {money(item.qty * item.unitPrice, sym)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function TotalsBlock({ d, accentColor, totalBg, totalColor, font }:
  { d: InvoiceData; accentColor: string; totalBg: string; totalColor: string; font: string }) {
  const { sym, sub, discAmt, taxAmt, grand } = calcTotals(d);
  const row = (label: string, val: string, bold = false, big = false) => (
    <div style={{ display:'flex', justifyContent:'space-between', padding:'5px 0',
      borderBottom: bold ? 'none' : '1px solid rgba(0,0,0,0.06)',
      fontWeight: bold ? 700 : 400, fontSize: big ? 15 : 13, fontFamily: font }}>
      <span style={{ color: bold ? totalColor : '#4b5563' }}>{label}</span>
      <span style={{ color: bold ? totalColor : '#111827' }}>{val}</span>
    </div>
  );
  return (
    <div style={{ display:'flex', justifyContent:'flex-end' }}>
      <div style={{ minWidth: 260 }}>
        {row('Subtotal', money(sub, sym))}
        {d.discountValue > 0 && row(
          d.discountType === 'percent' ? `Discount (${d.discountValue}%)` : 'Discount',
          `-${money(discAmt, sym)}`
        )}
        {d.taxPercent > 0 && row(`Tax / VAT (${d.taxPercent}%)`, money(taxAmt, sym))}
        <div style={{ marginTop: 8, background: totalBg, borderRadius: 6, padding:'12px 14px',
          display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ color: totalColor, fontWeight:700, fontSize:13, fontFamily:font, textTransform:'uppercase', letterSpacing:1 }}>Total</span>
          <span style={{ color: totalColor, fontWeight:800, fontSize:20, fontFamily:font }}>{money(grand, sym)}</span>
        </div>
      </div>
    </div>
  );
}

function FooterBlock({ d, dividerColor, labelColor, font }:
  { d: InvoiceData; dividerColor: string; labelColor: string; font: string }) {
  if (!d.notes && !d.paymentInstructions && !d.thankYouMessage) return null;
  return (
    <div style={{ marginTop: 32, paddingTop: 20, borderTop:`1.5px solid ${dividerColor}`, fontFamily: font }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
        {d.notes && (
          <div>
            <div style={{ fontSize:10, fontWeight:700, color:labelColor, letterSpacing:1.5, textTransform:'uppercase', marginBottom:5 }}>Notes</div>
            <div style={{ fontSize:12, color:'#4b5563', lineHeight:1.7, whiteSpace:'pre-wrap' }}>{d.notes}</div>
          </div>
        )}
        {d.paymentInstructions && (
          <div>
            <div style={{ fontSize:10, fontWeight:700, color:labelColor, letterSpacing:1.5, textTransform:'uppercase', marginBottom:5 }}>Payment Instructions</div>
            <div style={{ fontSize:12, color:'#4b5563', lineHeight:1.7, whiteSpace:'pre-wrap' }}>{d.paymentInstructions}</div>
          </div>
        )}
      </div>
      {d.thankYouMessage && (
        <div style={{ textAlign:'center', marginTop:24, paddingTop:16, borderTop:`1px solid ${dividerColor}` }}>
          <div style={{ fontSize:13, color:labelColor, fontStyle:'italic' }}>{d.thankYouMessage}</div>
        </div>
      )}
    </div>
  );
}

// ─── Template 1: Classic Blue ─────────────────────────────────────────────────

function ClassicBlueTemplate({ d }: { d: InvoiceData }) {
  const blue = '#1d4ed8', lightBlue = '#eff6ff', midBlue = '#dbeafe';
  const font = '"Segoe UI", Arial, sans-serif';
  return (
    <div style={{ width: INV_W, background:'#fff', fontFamily: font, padding: '0 0 40px' }}>
      {/* Header */}
      <div style={{ background: blue, padding:'32px 48px', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          {d.logoDataUrl
            ? <img src={d.logoDataUrl} alt="logo" style={{ maxHeight:60, maxWidth:200, objectFit:'contain', marginBottom:8, display:'block' }} />
            : <div style={{ fontSize:22, fontWeight:800, color:'#fff', letterSpacing:-0.5 }}>{ph(d.businessName,'Your Business Name')}</div>
          }
          {d.logoDataUrl && <div style={{ fontSize:16, fontWeight:700, color:'#fff' }}>{d.businessName}</div>}
          <div style={{ marginTop:8, fontSize:12, color:'rgba(255,255,255,0.8)', lineHeight:1.7 }}>
            {d.businessAddress && <div>{d.businessAddress}</div>}
            {d.businessPhone && <div>{d.businessPhone}</div>}
            {d.businessEmail && <div>{d.businessEmail}</div>}
            {d.businessWebsite && <div>{d.businessWebsite}</div>}
          </div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:32, fontWeight:900, color:'rgba(255,255,255,0.95)', letterSpacing:3, textTransform:'uppercase' }}>Invoice</div>
          <div style={{ marginTop:12, fontSize:12, color:'rgba(255,255,255,0.8)', lineHeight:2 }}>
            <div><strong style={{ color:'#fff' }}>#{ph(d.invoiceNumber,'—')}</strong></div>
            <div>Date: {fmtDate(d.invoiceDate)}</div>
            <div>Due: {fmtDate(d.dueDate)}</div>
            <div>Currency: {d.currency}</div>
          </div>
        </div>
      </div>

      {/* Bill To */}
      <div style={{ padding:'24px 48px 0', display:'flex', gap:32 }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:10, fontWeight:700, color:blue, letterSpacing:2, textTransform:'uppercase', marginBottom:8 }}>Bill To</div>
          <div style={{ fontSize:16, fontWeight:700, color:'#111827', marginBottom:3 }}>{ph(d.customerName,'Customer Name')}</div>
          {d.customerCompany && <div style={{ fontSize:13, color:'#374151', marginBottom:2 }}>{d.customerCompany}</div>}
          <div style={{ fontSize:12, color:'#6b7280', lineHeight:1.7 }}>
            {d.customerAddress && <div>{d.customerAddress}</div>}
            {d.customerEmail && <div>{d.customerEmail}</div>}
            {d.customerPhone && <div>{d.customerPhone}</div>}
          </div>
        </div>
      </div>

      {/* Items table */}
      <div style={{ padding:'24px 48px 0' }}>
        <ItemsTable d={d} headBg={midBlue} headColor={blue} rowAlt={lightBlue} borderColor="#e5e7eb" font={font} />
      </div>

      {/* Totals */}
      <div style={{ padding:'20px 48px 0' }}>
        <TotalsBlock d={d} accentColor={blue} totalBg={blue} totalColor="#fff" font={font} />
      </div>

      {/* Footer */}
      <div style={{ padding:'0 48px' }}>
        <FooterBlock d={d} dividerColor="#e5e7eb" labelColor={blue} font={font} />
      </div>
    </div>
  );
}

// ─── Template 2: Modern Dark ──────────────────────────────────────────────────

function ModernDarkTemplate({ d }: { d: InvoiceData }) {
  const dark = '#0f172a', slate = '#1e293b', accent = '#38bdf8';
  const font = '"Segoe UI", Arial, sans-serif';
  return (
    <div style={{ width: INV_W, background:'#fff', fontFamily: font, padding:'0 0 40px' }}>
      {/* Header */}
      <div style={{ background: dark, padding:'36px 48px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            {d.logoDataUrl
              ? <img src={d.logoDataUrl} alt="logo" style={{ maxHeight:52, maxWidth:180, objectFit:'contain', display:'block', marginBottom:6 }} />
              : <div style={{ fontSize:20, fontWeight:800, color:'#fff' }}>{ph(d.businessName,'Your Business Name')}</div>
            }
            {d.logoDataUrl && <div style={{ fontSize:15, fontWeight:700, color:'#fff' }}>{d.businessName}</div>}
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:28, fontWeight:900, color:accent, letterSpacing:4, textTransform:'uppercase' }}>Invoice</div>
            <div style={{ fontSize:13, color:'rgba(255,255,255,0.6)', marginTop:4 }}>#{ph(d.invoiceNumber,'—')}</div>
          </div>
        </div>
        <div style={{ marginTop:20, display:'grid', gridTemplateColumns:'1fr 1fr', gap:0 }}>
          <div style={{ fontSize:12, color:'rgba(255,255,255,0.6)', lineHeight:1.9 }}>
            {d.businessAddress && <div>{d.businessAddress}</div>}
            {d.businessPhone && <div>{d.businessPhone}</div>}
            {d.businessEmail && <div>{d.businessEmail}</div>}
            {d.businessWebsite && <div>{d.businessWebsite}</div>}
          </div>
          <div style={{ textAlign:'right', fontSize:12, color:'rgba(255,255,255,0.6)', lineHeight:1.9 }}>
            <div><span style={{ color:'rgba(255,255,255,0.4)' }}>Date:  </span><span style={{ color:'#fff' }}>{fmtDate(d.invoiceDate)}</span></div>
            <div><span style={{ color:'rgba(255,255,255,0.4)' }}>Due:  </span><span style={{ color:accent }}>{fmtDate(d.dueDate)}</span></div>
            <div><span style={{ color:'rgba(255,255,255,0.4)' }}>Currency:  </span><span style={{ color:'#fff' }}>{d.currency}</span></div>
          </div>
        </div>
      </div>

      {/* Bill To */}
      <div style={{ padding:'24px 48px 0', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <div style={{ fontSize:10, fontWeight:700, color:accent, letterSpacing:2, textTransform:'uppercase', marginBottom:8 }}>Billed To</div>
          <div style={{ fontSize:16, fontWeight:700, color:'#111827' }}>{ph(d.customerName,'Customer Name')}</div>
          {d.customerCompany && <div style={{ fontSize:13, color:'#374151', marginTop:2 }}>{d.customerCompany}</div>}
          <div style={{ fontSize:12, color:'#6b7280', lineHeight:1.7, marginTop:3 }}>
            {d.customerAddress && <div>{d.customerAddress}</div>}
            {d.customerEmail && <div>{d.customerEmail}</div>}
            {d.customerPhone && <div>{d.customerPhone}</div>}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ margin:'20px 48px 0', height:1, background:'#e5e7eb' }} />

      {/* Items */}
      <div style={{ padding:'0 48px' }}>
        <ItemsTable d={d} headBg={slate} headColor="#fff" rowAlt="#f8fafc" borderColor="#e5e7eb" font={font} />
      </div>

      {/* Totals */}
      <div style={{ padding:'20px 48px 0' }}>
        <TotalsBlock d={d} accentColor={accent} totalBg={dark} totalColor="#fff" font={font} />
      </div>

      {/* Footer */}
      <div style={{ padding:'0 48px' }}>
        <FooterBlock d={d} dividerColor="#e5e7eb" labelColor={accent} font={font} />
      </div>
    </div>
  );
}

// ─── Template 3: Minimal ──────────────────────────────────────────────────────

function MinimalTemplate({ d }: { d: InvoiceData }) {
  const near  = '#111827';
  const mid   = '#374151';
  const muted = '#9ca3af';
  const font  = 'Georgia, "Times New Roman", serif';
  return (
    <div style={{ width: INV_W, background:'#fff', fontFamily: font, padding:'0 0 40px' }}>
      {/* Header */}
      <div style={{ padding:'44px 52px 28px', borderBottom:'2px solid #111827' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
          <div>
            {d.logoDataUrl
              ? <img src={d.logoDataUrl} alt="logo" style={{ maxHeight:56, maxWidth:190, objectFit:'contain', display:'block', marginBottom:10 }} />
              : <div style={{ fontSize:24, fontWeight:700, color:near, letterSpacing:-1 }}>{ph(d.businessName,'Your Business Name')}</div>
            }
            {d.logoDataUrl && <div style={{ fontSize:17, fontWeight:700, color:near }}>{d.businessName}</div>}
            <div style={{ marginTop:8, fontSize:12, color:mid, lineHeight:1.8 }}>
              {d.businessAddress && <div>{d.businessAddress}</div>}
              {[d.businessPhone, d.businessEmail].filter(Boolean).join('  ·  ') && (
                <div>{[d.businessPhone, d.businessEmail].filter(Boolean).join('  ·  ')}</div>
              )}
              {d.businessWebsite && <div>{d.businessWebsite}</div>}
            </div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:40, fontWeight:900, color:near, letterSpacing:-1, lineHeight:1 }}>INVOICE</div>
            <div style={{ marginTop:10, fontSize:12, color:mid, lineHeight:2 }}>
              <div>#{ph(d.invoiceNumber,'—')}</div>
              <div>{fmtDate(d.invoiceDate)}</div>
              <div style={{ color:near, fontWeight:600 }}>Due {fmtDate(d.dueDate)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bill To */}
      <div style={{ padding:'24px 52px 0' }}>
        <div style={{ fontSize:10, fontWeight:700, color:muted, letterSpacing:2.5, textTransform:'uppercase', marginBottom:8 }}>Bill To</div>
        <div style={{ fontSize:15, fontWeight:700, color:near }}>{ph(d.customerName,'Customer Name')}</div>
        {d.customerCompany && <div style={{ fontSize:13, color:mid, marginTop:2 }}>{d.customerCompany}</div>}
        <div style={{ fontSize:12, color:mid, lineHeight:1.8, marginTop:3 }}>
          {d.customerAddress && <div>{d.customerAddress}</div>}
          {[d.customerEmail, d.customerPhone].filter(Boolean).join('  ·  ') && (
            <div>{[d.customerEmail, d.customerPhone].filter(Boolean).join('  ·  ')}</div>
          )}
        </div>
      </div>

      {/* Items */}
      <div style={{ padding:'24px 52px 0' }}>
        <ItemsTable d={d} headBg="transparent" headColor={muted} rowAlt="transparent" borderColor="#e5e7eb" font={font} />
      </div>

      {/* Totals */}
      <div style={{ padding:'20px 52px 0' }}>
        <TotalsBlock d={d} accentColor={near} totalBg={near} totalColor="#fff" font={font} />
      </div>

      {/* Footer */}
      <div style={{ padding:'0 52px' }}>
        <FooterBlock d={d} dividerColor="#e5e7eb" labelColor={muted} font={font} />
      </div>
    </div>
  );
}

// ─── Template 4: Executive ────────────────────────────────────────────────────

function ExecutiveTemplate({ d }: { d: InvoiceData }) {
  const navy   = '#0f172a';
  const blue   = '#1d4ed8';
  const silver = '#f1f5f9';
  const font   = '"Segoe UI", Arial, sans-serif';
  const { sym, sub, discAmt, taxAmt, grand } = calcTotals(d);

  return (
    <div style={{ width: INV_W, background:'#fff', fontFamily: font, display:'flex', minHeight:900, padding:'0 0 0' }}>
      {/* Left sidebar */}
      <div style={{ width:220, background:navy, flexShrink:0, padding:'40px 24px', display:'flex', flexDirection:'column', gap:0 }}>
        {/* Logo/Business */}
        <div style={{ marginBottom:28 }}>
          {d.logoDataUrl
            ? <img src={d.logoDataUrl} alt="logo" style={{ maxWidth:160, maxHeight:50, objectFit:'contain', display:'block', marginBottom:10, filter:'brightness(0) invert(1)' }} />
            : null
          }
          <div style={{ fontSize:15, fontWeight:800, color:'#fff', lineHeight:1.3, wordBreak:'break-word' }}>
            {ph(d.businessName,'Your Business Name')}
          </div>
          <div style={{ marginTop:8, fontSize:10.5, color:'rgba(255,255,255,0.55)', lineHeight:1.9 }}>
            {d.businessAddress && <div>{d.businessAddress}</div>}
            {d.businessPhone && <div>{d.businessPhone}</div>}
            {d.businessEmail && <div>{d.businessEmail}</div>}
            {d.businessWebsite && <div>{d.businessWebsite}</div>}
          </div>
        </div>

        {/* INVOICE title */}
        <div style={{ borderTop:'1px solid rgba(255,255,255,0.12)', paddingTop:20, marginBottom:20 }}>
          <div style={{ fontSize:9, fontWeight:700, letterSpacing:3, textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:4 }}>Document</div>
          <div style={{ fontSize:22, fontWeight:900, color:'#fff', letterSpacing:2, textTransform:'uppercase' }}>Invoice</div>
        </div>

        {/* Invoice meta */}
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.6)', lineHeight:2.1 }}>
          <div><span style={{ color:'rgba(255,255,255,0.35)', fontSize:9, textTransform:'uppercase', letterSpacing:1 }}>Number</span></div>
          <div style={{ color:'#fff', fontWeight:600, marginBottom:8 }}>#{ph(d.invoiceNumber,'—')}</div>
          <div><span style={{ color:'rgba(255,255,255,0.35)', fontSize:9, textTransform:'uppercase', letterSpacing:1 }}>Invoice Date</span></div>
          <div style={{ color:'#fff', marginBottom:8 }}>{fmtDate(d.invoiceDate)}</div>
          <div><span style={{ color:'rgba(255,255,255,0.35)', fontSize:9, textTransform:'uppercase', letterSpacing:1 }}>Due Date</span></div>
          <div style={{ color:'#38bdf8', fontWeight:600, marginBottom:8 }}>{fmtDate(d.dueDate)}</div>
          <div><span style={{ color:'rgba(255,255,255,0.35)', fontSize:9, textTransform:'uppercase', letterSpacing:1 }}>Currency</span></div>
          <div style={{ color:'#fff' }}>{d.currency}</div>
        </div>

        {/* Grand total in sidebar */}
        <div style={{ marginTop:'auto', paddingTop:24, borderTop:'1px solid rgba(255,255,255,0.12)' }}>
          <div style={{ fontSize:9, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:4 }}>Amount Due</div>
          <div style={{ fontSize:20, fontWeight:900, color:'#fff', wordBreak:'break-all' }}>{money(grand, sym)}</div>
          <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', marginTop:2 }}>{d.currency}</div>
        </div>
      </div>

      {/* Right content */}
      <div style={{ flex:1, padding:'40px 40px 40px 36px' }}>
        {/* Bill To */}
        <div style={{ marginBottom:24, background:silver, borderRadius:8, padding:'14px 18px' }}>
          <div style={{ fontSize:9, fontWeight:700, color:blue, letterSpacing:2, textTransform:'uppercase', marginBottom:6 }}>Bill To</div>
          <div style={{ fontSize:15, fontWeight:700, color:navy }}>{ph(d.customerName,'Customer Name')}</div>
          {d.customerCompany && <div style={{ fontSize:12, color:'#374151', marginTop:2 }}>{d.customerCompany}</div>}
          <div style={{ fontSize:11.5, color:'#6b7280', lineHeight:1.8, marginTop:4 }}>
            {d.customerAddress && <div>{d.customerAddress}</div>}
            {d.customerEmail && <div>{d.customerEmail}</div>}
            {d.customerPhone && <div>{d.customerPhone}</div>}
          </div>
        </div>

        {/* Items */}
        <ItemsTable d={d} headBg={navy} headColor="#fff" rowAlt="#f8fafc" borderColor="#e5e7eb" font={font} />

        {/* Totals */}
        <div style={{ marginTop:20 }}>
          {[
            { label:'Subtotal', val:money(sub, sym), show:true },
            { label: d.discountType==='percent' ? `Discount (${d.discountValue}%)` : 'Discount', val:`-${money(discAmt, sym)}`, show: d.discountValue > 0 },
            { label:`Tax / VAT (${d.taxPercent}%)`, val:money(taxAmt, sym), show: d.taxPercent > 0 },
          ].filter(r => r.show).map(r => (
            <div key={r.label} style={{ display:'flex', justifyContent:'flex-end', fontSize:12, color:'#374151', marginBottom:4 }}>
              <div style={{ width:220, display:'flex', justifyContent:'space-between', padding:'3px 0', borderBottom:'1px solid #f3f4f6' }}>
                <span>{r.label}</span><span>{r.val}</span>
              </div>
            </div>
          ))}
          <div style={{ display:'flex', justifyContent:'flex-end', marginTop:4 }}>
            <div style={{ width:220, background:blue, borderRadius:6, padding:'10px 14px', display:'flex', justifyContent:'space-between' }}>
              <span style={{ color:'#fff', fontWeight:700, fontSize:12, textTransform:'uppercase', letterSpacing:0.8 }}>Total</span>
              <span style={{ color:'#fff', fontWeight:800, fontSize:17 }}>{money(grand, sym)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <FooterBlock d={d} dividerColor="#e5e7eb" labelColor={blue} font={font} />
      </div>
    </div>
  );
}

// ─── Template 5: Bold Gradient ────────────────────────────────────────────────

function BoldTemplate({ d }: { d: InvoiceData }) {
  const blue   = '#1d4ed8';
  const indigo = '#4f46e5';
  const amber  = '#f59e0b';
  const font   = '"Segoe UI", Arial, sans-serif';
  const { sym, sub, discAmt, taxAmt, grand } = calcTotals(d);

  return (
    <div style={{ width: INV_W, background:'#fff', fontFamily: font, padding:'0 0 40px' }}>
      {/* Gradient header */}
      <div style={{ background:`linear-gradient(135deg, ${blue} 0%, ${indigo} 100%)`, padding:'36px 48px', position:'relative', overflow:'hidden' }}>
        {/* Decorative circles */}
        <div style={{ position:'absolute', right:-60, top:-60, width:220, height:220, borderRadius:'50%', background:'rgba(255,255,255,0.06)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', right:40, bottom:-80, width:160, height:160, borderRadius:'50%', background:'rgba(255,255,255,0.05)', pointerEvents:'none' }} />

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', position:'relative', zIndex:1 }}>
          <div>
            {d.logoDataUrl
              ? <img src={d.logoDataUrl} alt="logo" style={{ maxHeight:54, maxWidth:190, objectFit:'contain', display:'block', marginBottom:8 }} />
              : <div style={{ fontSize:21, fontWeight:800, color:'#fff' }}>{ph(d.businessName,'Your Business Name')}</div>
            }
            {d.logoDataUrl && <div style={{ fontSize:15, fontWeight:700, color:'#fff' }}>{d.businessName}</div>}
            <div style={{ marginTop:8, fontSize:11.5, color:'rgba(255,255,255,0.75)', lineHeight:1.8 }}>
              {d.businessAddress && <div>{d.businessAddress}</div>}
              {d.businessPhone && <div>{d.businessPhone}</div>}
              {d.businessEmail && <div>{d.businessEmail}</div>}
              {d.businessWebsite && <div>{d.businessWebsite}</div>}
            </div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:38, fontWeight:900, color:'#fff', letterSpacing:-0.5, lineHeight:1 }}>INVOICE</div>
            <div style={{ marginTop:10, fontSize:12, color:'rgba(255,255,255,0.75)', lineHeight:2 }}>
              <div style={{ color:'#fff', fontWeight:600 }}>#{ph(d.invoiceNumber,'—')}</div>
              <div>Date: {fmtDate(d.invoiceDate)}</div>
              <div>Due: {fmtDate(d.dueDate)}</div>
            </div>
          </div>
        </div>

        {/* Amber strip */}
        <div style={{ position:'relative', zIndex:1, marginTop:20, height:3, background:`linear-gradient(90deg, ${amber}, rgba(245,158,11,0.3))`, borderRadius:2 }} />
      </div>

      {/* Bill To */}
      <div style={{ padding:'24px 48px 0' }}>
        <div style={{ display:'flex', gap:32, alignItems:'flex-start' }}>
          <div style={{ flex:1, borderLeft:`3px solid ${blue}`, paddingLeft:14 }}>
            <div style={{ fontSize:10, fontWeight:700, color:blue, letterSpacing:2, textTransform:'uppercase', marginBottom:6 }}>Bill To</div>
            <div style={{ fontSize:16, fontWeight:700, color:'#111827' }}>{ph(d.customerName,'Customer Name')}</div>
            {d.customerCompany && <div style={{ fontSize:13, color:'#374151', marginTop:2 }}>{d.customerCompany}</div>}
            <div style={{ fontSize:12, color:'#6b7280', lineHeight:1.8, marginTop:3 }}>
              {d.customerAddress && <div>{d.customerAddress}</div>}
              {d.customerEmail && <div>{d.customerEmail}</div>}
              {d.customerPhone && <div>{d.customerPhone}</div>}
            </div>
          </div>
          <div style={{ flex:1, borderLeft:`3px solid ${amber}`, paddingLeft:14 }}>
            <div style={{ fontSize:10, fontWeight:700, color:amber, letterSpacing:2, textTransform:'uppercase', marginBottom:6 }}>Summary</div>
            <div style={{ fontSize:12, color:'#374151', lineHeight:2 }}>
              <div><span style={{ color:'#9ca3af' }}>Items:</span> {d.items.filter(i => i.description||i.qty||i.unitPrice).length}</div>
              <div><span style={{ color:'#9ca3af' }}>Subtotal:</span> {money(sub, sym)}</div>
              {d.discountValue > 0 && <div><span style={{ color:'#9ca3af' }}>Discount:</span> -{money(discAmt, sym)}</div>}
              {d.taxPercent > 0 && <div><span style={{ color:'#9ca3af' }}>Tax:</span> {money(taxAmt, sym)}</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Items */}
      <div style={{ padding:'24px 48px 0' }}>
        <ItemsTable d={d} headBg={indigo} headColor="#fff" rowAlt="#f5f3ff" borderColor="#e5e7eb" font={font} />
      </div>

      {/* Grand total */}
      <div style={{ padding:'20px 48px 0', display:'flex', justifyContent:'flex-end' }}>
        <div style={{
          background:`linear-gradient(135deg, ${amber}, #fbbf24)`,
          borderRadius:10, padding:'16px 28px',
          display:'flex', alignItems:'center', gap:32,
        }}>
          <div style={{ textAlign:'right' }}>
            {d.discountValue > 0 && <div style={{ fontSize:12, color:'rgba(0,0,0,0.55)', marginBottom:2 }}>Subtotal {money(sub, sym)}</div>}
            <div style={{ fontSize:12, color:'rgba(0,0,0,0.7)', fontWeight:600 }}>
              {d.discountValue > 0 && `Discount -${money(discAmt, sym)}  `}
              {d.taxPercent > 0 && `Tax ${money(taxAmt, sym)}`}
            </div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:11, fontWeight:700, color:'rgba(0,0,0,0.6)', letterSpacing:1.5, textTransform:'uppercase', marginBottom:3 }}>Total Due</div>
            <div style={{ fontSize:26, fontWeight:900, color:'#000' }}>{money(grand, sym)}</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding:'0 48px' }}>
        <FooterBlock d={d} dividerColor="#e5e7eb" labelColor={blue} font={font} />
      </div>
    </div>
  );
}

// ─── Preview router ────────────────────────────────────────────────────────────

function InvoicePreview({ data, template }: { data: InvoiceData; template: TemplateId }) {
  switch (template) {
    case 'classic':   return <ClassicBlueTemplate d={data} />;
    case 'modern':    return <ModernDarkTemplate d={data} />;
    case 'minimal':   return <MinimalTemplate d={data} />;
    case 'executive': return <ExecutiveTemplate d={data} />;
    case 'bold':      return <BoldTemplate d={data} />;
  }
}

// ─── Template metadata ────────────────────────────────────────────────────────

const TEMPLATES: { id: TemplateId; name: string; bg: string; accent: string }[] = [
  { id:'classic',   name:'Classic Blue',    bg:'#1d4ed8', accent:'#dbeafe' },
  { id:'modern',    name:'Modern Dark',     bg:'#0f172a', accent:'#38bdf8' },
  { id:'minimal',   name:'Minimal',         bg:'#111827', accent:'#e5e7eb' },
  { id:'executive', name:'Executive',       bg:'#0f172a', accent:'#1d4ed8' },
  { id:'bold',      name:'Bold Gradient',   bg:'#4f46e5', accent:'#f59e0b' },
];

// ─── Form helpers ─────────────────────────────────────────────────────────────

function F({ label, id, optional, children }: { label:string; id:string; optional?:boolean; children:React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-xs font-semibold text-gray-600">
        {label}{optional && <span className="text-gray-400 font-normal ml-1">(optional)</span>}
      </Label>
      {children}
    </div>
  );
}

function Sec({ icon:Icon, title, children }: { icon:React.ElementType; title:string; children:React.ReactNode }) {
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

// ─── Default invoice ──────────────────────────────────────────────────────────

function defaultInvoice(): InvoiceData {
  return {
    businessName:'', logoDataUrl:'',
    businessAddress:'', businessPhone:'', businessEmail:'', businessWebsite:'',
    customerName:'', customerCompany:'', customerAddress:'', customerEmail:'', customerPhone:'',
    invoiceNumber: genNo(),
    invoiceDate: todayStr(),
    dueDate: dueDateStr(),
    currency:'USD',
    items:[
      { id:uid(), description:'', qty:1, unitPrice:0 },
    ],
    discountType:'percent', discountValue:0, taxPercent:0,
    notes:'', paymentInstructions:'', thankYouMessage:'Thank you for your business!',
  };
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function InvoiceGenerator() {
  const [inv, setInv]         = useState<InvoiceData>(defaultInvoice);
  const [template, setTpl]    = useState<TemplateId>('classic');
  const [exporting, setExp]   = useState(false);
  const [scale, setScale]     = useState(0.6);
  const [prevH, setPrevH]     = useState(1000);
  const [showExtra, setExtra] = useState(false);

  const containerRef   = useRef<HTMLDivElement>(null);
  const innerRef       = useRef<HTMLDivElement>(null);
  const captureRef     = useRef<HTMLDivElement>(null);
  const logoInputRef   = useRef<HTMLInputElement>(null);
  const { toast }      = useToast();

  // Scale preview to fit container
  useEffect(() => {
    const update = () => {
      if (containerRef.current) setScale(Math.min(containerRef.current.clientWidth / INV_W, 1));
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Track invoice natural height for correct outer container height
  useEffect(() => {
    if (!innerRef.current) return;
    const ro = new ResizeObserver(() => {
      if (innerRef.current) setPrevH(innerRef.current.offsetHeight);
    });
    ro.observe(innerRef.current);
    return () => ro.disconnect();
  }, []);

  // ── field setters ──────────────────────────────────────────────────────────

  const set = (key: keyof InvoiceData) =>
    (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) =>
      setInv(p => ({ ...p, [key]: e.target.value }));

  const setNum = (key: keyof InvoiceData) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setInv(p => ({ ...p, [key]: parseFloat(e.target.value) || 0 }));

  // ── items ──────────────────────────────────────────────────────────────────

  const addItem = () => setInv(p => ({
    ...p, items: [...p.items, { id:uid(), description:'', qty:1, unitPrice:0 }]
  }));

  const removeItem = (id: string) => setInv(p => ({
    ...p, items: p.items.filter(i => i.id !== id)
  }));

  const updateItem = (id: string, field: keyof InvoiceItem, val: string|number) =>
    setInv(p => ({ ...p, items: p.items.map(i => i.id===id ? { ...i, [field]:val } : i) }));

  // ── logo upload ────────────────────────────────────────────────────────────

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setInv(p => ({ ...p, logoDataUrl: ev.target?.result as string }));
    reader.readAsDataURL(file);
  };

  // ── capture ────────────────────────────────────────────────────────────────

  const capture = useCallback(async (scale = 2): Promise<HTMLCanvasElement|null> => {
    if (!captureRef.current) return null;
    try { await document.fonts.ready; } catch {}
    return html2canvas(captureRef.current, {
      scale, useCORS:true, allowTaint:true, backgroundColor:'#ffffff', logging:false,
      onclone: doc => {
        document.querySelectorAll('link[rel="stylesheet"],style').forEach(n => {
          try { doc.head.appendChild(n.cloneNode(true)); } catch {}
        });
      },
    });
  }, []);

  const exportPdf = async () => {
    setExp(true);
    try {
      const canvas = await capture(2);
      if (!canvas) throw new Error();
      const img    = canvas.toDataURL('image/png');
      const wMm    = 210; // A4 width
      const hMm    = (canvas.height / canvas.width) * wMm;
      const pdf    = new jsPDF({ orientation:'portrait', unit:'mm', format:[wMm, hMm] });
      pdf.addImage(img, 'PNG', 0, 0, wMm, hMm);
      const name   = inv.invoiceNumber || 'invoice';
      pdf.save(`${name}.pdf`);
      toast({ title:'PDF Downloaded!', description:'Invoice saved as PDF.', duration:2500 });
    } catch {
      toast({ title:'Export failed', variant:'destructive' });
    } finally { setExp(false); }
  };

  const exportPng = async () => {
    setExp(true);
    try {
      const canvas = await capture(2);
      if (!canvas) throw new Error();
      const url    = canvas.toDataURL('image/png');
      const a      = document.createElement('a');
      a.href       = url;
      a.download   = `${inv.invoiceNumber || 'invoice'}.png`;
      a.click();
      toast({ title:'PNG Downloaded!', duration:2500 });
    } catch {
      toast({ title:'Export failed', variant:'destructive' });
    } finally { setExp(false); }
  };

  const handlePrint = async () => {
    setExp(true);
    try {
      const canvas = await capture(2);
      if (!canvas) throw new Error();
      const url = canvas.toDataURL('image/png');
      const win = window.open('','_blank');
      if (!win) throw new Error('popup');
      win.document.write(`<html><head><title>${inv.invoiceNumber||'Invoice'}</title>
        <style>*{margin:0;padding:0;box-sizing:border-box}body{background:#f5f5f5;display:flex;justify-content:center;padding:20px}img{max-width:100%;box-shadow:0 4px 20px rgba(0,0,0,.12)}@media print{body{background:#fff;padding:0}img{box-shadow:none;width:100%}}</style>
        </head><body><img src="${url}" onload="window.print();setTimeout(()=>window.close(),500);"/></body></html>`);
      win.document.close();
    } catch { toast({ title:'Print failed', description:'Allow pop-ups for this site.', variant:'destructive' }); }
    finally { setExp(false); }
  };

  const handleReset = () => { setInv(defaultInvoice()); setTpl('classic'); };

  // ── totals (for form display) ──────────────────────────────────────────────

  const { sym, sub, discAmt, taxAmt, grand } = calcTotals(inv);

  return (
  <>
    <div className="max-w-screen-xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Invoice Generator</h1>
        <p className="text-muted-foreground">Create professional invoices instantly — no sign-up, works offline in your browser</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[460px_1fr] gap-6 items-start">

        {/* ── Form ─────────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border p-5 space-y-5 xl:sticky xl:top-4 xl:max-h-[calc(100vh-2rem)] xl:overflow-y-auto">

          {/* Template selector */}
          <div className="space-y-2">
            <Label className="text-sm font-bold text-gray-700">Template</Label>
            <div className="grid grid-cols-5 gap-2">
              {TEMPLATES.map(t => (
                <button key={t.id} onClick={() => setTpl(t.id)} title={t.name}
                  className={`relative rounded-xl border-2 overflow-hidden transition-all cursor-pointer ${
                    template===t.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
                  }`} style={{ aspectRatio:'0.707' }}>
                  <div className="h-1/3" style={{ background:t.bg }} />
                  <div className="h-1/4" style={{ background:'#fff' }} />
                  <div className="h-px" style={{ background:t.accent, opacity:0.6 }} />
                  <div className="flex-1 bg-white" style={{ height:'42%' }} />
                  {template===t.id && (
                    <div className="absolute inset-0 flex items-end justify-center pb-1">
                      <span className="text-[8px] font-bold text-white bg-blue-500 rounded px-1 leading-4 shadow">{t.name.split(' ')[0]}</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center">{TEMPLATES.find(t=>t.id===template)?.name}</p>
          </div>

          <div className="border-t" />

          {/* ── Business Information ── */}
          <Sec icon={Building2} title="Business Information">
            {/* Logo upload */}
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center bg-gray-50 shrink-0 cursor-pointer"
                onClick={() => logoInputRef.current?.click()}>
                {inv.logoDataUrl
                  ? <img src={inv.logoDataUrl} className="w-full h-full object-contain p-1" alt="logo" />
                  : <Building2 className="w-5 h-5 text-gray-300" />
                }
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-xs font-semibold text-gray-600">Business Logo <span className="text-gray-400 font-normal">(optional)</span></p>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7" onClick={() => logoInputRef.current?.click()}>
                  <Upload className="w-3 h-3" /> Upload Logo
                </Button>
                {inv.logoDataUrl && (
                  <button className="text-xs text-red-500 hover:text-red-700 ml-2" onClick={() => setInv(p => ({...p, logoDataUrl:''}))}>Remove</button>
                )}
              </div>
              <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
            </div>

            <F label="Business Name" id="bName">
              <Input id="bName" placeholder="Your Business Name" value={inv.businessName} onChange={set('businessName')} />
            </F>
            <F label="Address" id="bAddr">
              <Input id="bAddr" placeholder="123 Main St, City, Country" value={inv.businessAddress} onChange={set('businessAddress')} />
            </F>
            <div className="grid grid-cols-2 gap-3">
              <F label="Phone" id="bPhone"><Input id="bPhone" placeholder="+1 555 000 0000" value={inv.businessPhone} onChange={set('businessPhone')} /></F>
              <F label="Email" id="bEmail"><Input id="bEmail" type="email" placeholder="you@company.com" value={inv.businessEmail} onChange={set('businessEmail')} /></F>
            </div>
            <F label="Website" id="bWeb" optional>
              <Input id="bWeb" placeholder="www.yoursite.com" value={inv.businessWebsite} onChange={set('businessWebsite')} />
            </F>
          </Sec>

          <div className="border-t" />

          {/* ── Customer Information ── */}
          <Sec icon={User} title="Customer Information">
            <F label="Customer Name" id="cName">
              <Input id="cName" placeholder="Jane Smith" value={inv.customerName} onChange={set('customerName')} />
            </F>
            <F label="Company" id="cCo" optional>
              <Input id="cCo" placeholder="Company Inc." value={inv.customerCompany} onChange={set('customerCompany')} />
            </F>
            <F label="Address" id="cAddr">
              <Input id="cAddr" placeholder="456 Client Ave, City, Country" value={inv.customerAddress} onChange={set('customerAddress')} />
            </F>
            <div className="grid grid-cols-2 gap-3">
              <F label="Email" id="cEmail"><Input id="cEmail" type="email" placeholder="client@email.com" value={inv.customerEmail} onChange={set('customerEmail')} /></F>
              <F label="Phone" id="cPhone"><Input id="cPhone" placeholder="+1 555 000 0000" value={inv.customerPhone} onChange={set('customerPhone')} /></F>
            </div>
          </Sec>

          <div className="border-t" />

          {/* ── Invoice Details ── */}
          <Sec icon={Receipt} title="Invoice Details">
            <div className="grid grid-cols-2 gap-3">
              <F label="Invoice Number" id="invNo">
                <div className="flex gap-1">
                  <Input id="invNo" value={inv.invoiceNumber} onChange={set('invoiceNumber')} className="text-sm" />
                  <Button variant="outline" size="sm" className="px-2 shrink-0 text-xs h-9" title="Regenerate"
                    onClick={() => setInv(p => ({...p, invoiceNumber: genNo()}))}>↺</Button>
                </div>
              </F>
              <F label="Currency" id="currency">
                <select id="currency" value={inv.currency} onChange={set('currency')}
                  className="w-full border rounded-md px-3 h-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
                  {Object.entries(CURRENCIES).map(([code, c]) => (
                    <option key={code} value={code}>{code} — {c.name}</option>
                  ))}
                </select>
              </F>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <F label="Invoice Date" id="invDate">
                <Input id="invDate" type="date" value={inv.invoiceDate} onChange={set('invoiceDate')} />
              </F>
              <F label="Due Date" id="dueDate">
                <Input id="dueDate" type="date" value={inv.dueDate} onChange={set('dueDate')} />
              </F>
            </div>
          </Sec>

          <div className="border-t" />

          {/* ── Items ── */}
          <Sec icon={FileText} title="Items">
            <div className="space-y-2">
              {/* Column headers */}
              <div className="grid grid-cols-[1fr_60px_90px_28px] gap-1.5 px-1">
                {['Description','Qty','Unit Price',''].map(h => (
                  <div key={h} className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</div>
                ))}
              </div>

              {inv.items.map((item, idx) => (
                <div key={item.id} className="grid grid-cols-[1fr_60px_90px_28px] gap-1.5 items-center">
                  <Input aria-label="Item description" placeholder={`Item ${idx+1}`} value={item.description}
                    onChange={e => updateItem(item.id,'description',e.target.value)} className="text-sm" />
                  <Input aria-label="Quantity" type="number" min="0" step="1" value={item.qty || ''}
                    onChange={e => updateItem(item.id,'qty', parseFloat(e.target.value)||0)} className="text-sm text-right" />
                  <Input aria-label="Unit price" type="number" min="0" step="0.01" value={item.unitPrice || ''}
                    onChange={e => updateItem(item.id,'unitPrice', parseFloat(e.target.value)||0)} className="text-sm text-right" />
                  <button onClick={() => removeItem(item.id)} disabled={inv.items.length === 1}
                    className="text-gray-300 hover:text-red-500 disabled:opacity-20 disabled:cursor-not-allowed transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <Button variant="outline" size="sm" onClick={addItem}
              className="w-full gap-2 border-dashed text-blue-600 hover:text-blue-700 hover:border-blue-300">
              <Plus className="w-4 h-4" /> Add Item
            </Button>
          </Sec>

          <div className="border-t" />

          {/* ── Pricing ── */}
          <Sec icon={Receipt} title="Pricing">
            {/* Discount */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-600">Discount</Label>
              <div className="flex gap-2">
                <select value={inv.discountType} onChange={e => setInv(p => ({...p, discountType: e.target.value as DiscountType}))}
                  className="border rounded-md px-2 h-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white w-24 shrink-0">
                  <option value="percent">% Percent</option>
                  <option value="fixed">$ Fixed</option>
                </select>
                <Input type="number" min="0" step="0.01" placeholder="0" value={inv.discountValue || ''}
                  onChange={setNum('discountValue')} className="text-sm" aria-label="Discount amount" />
              </div>
            </div>

            {/* Tax */}
            <F label="Tax / VAT (%)" id="tax">
              <Input id="tax" type="number" min="0" max="100" step="0.1" placeholder="0" value={inv.taxPercent || ''}
                onChange={setNum('taxPercent')} className="text-sm" />
            </F>

            {/* Live totals preview */}
            <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3 text-sm space-y-1.5">
              {[
                { label:'Subtotal', val: money(sub, sym) },
                ...(inv.discountValue > 0 ? [{ label:'Discount', val:`-${money(discAmt, sym)}` }] : []),
                ...(inv.taxPercent > 0 ? [{ label:`Tax (${inv.taxPercent}%)`, val:money(taxAmt, sym) }] : []),
              ].map(r => (
                <div key={r.label} className="flex justify-between text-gray-600">
                  <span>{r.label}</span><span>{r.val}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-blue-700 pt-1 border-t border-blue-200 text-base">
                <span>Total</span><span>{money(grand, sym)}</span>
              </div>
            </div>
          </Sec>

          <div className="border-t" />

          {/* ── Extra (collapsible) ── */}
          <div>
            <button type="button" onClick={() => setExtra(v => !v)}
              className="flex items-center gap-2 w-full text-sm font-bold text-gray-700 uppercase tracking-wide pb-2 border-b hover:text-blue-600 transition-colors">
              <FileText className="w-4 h-4 text-blue-600" />
              Notes & Payment
              {showExtra ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
            </button>
            {showExtra && (
              <div className="space-y-3 mt-3">
                <F label="Notes" id="notes" optional>
                  <textarea id="notes" rows={3} placeholder="Any additional notes or terms…"
                    value={inv.notes} onChange={set('notes')}
                    className="w-full border rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </F>
                <F label="Payment Instructions" id="payment" optional>
                  <textarea id="payment" rows={3} placeholder="Bank details, payment methods, account info…"
                    value={inv.paymentInstructions} onChange={set('paymentInstructions')}
                    className="w-full border rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </F>
                <F label="Thank You Message" id="thanks" optional>
                  <Input id="thanks" placeholder="Thank you for your business!" value={inv.thankYouMessage} onChange={set('thankYouMessage')} />
                </F>
              </div>
            )}
          </div>

          <div className="border-t" />

          {/* Reset */}
          <Button variant="outline" onClick={handleReset} className="w-full gap-2 text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50">
            <RefreshCw className="w-4 h-4" /> Reset Invoice
          </Button>
        </div>

        {/* ── Preview + actions ─────────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Action bar */}
          <div className="bg-white rounded-2xl shadow-sm border p-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 mr-auto">
              <FileText className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-sm">Invoice Preview</span>
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

          {/* Preview */}
          <div className="bg-gray-100 rounded-2xl border p-4 overflow-hidden">
            <div ref={containerRef} className="w-full">
              <div style={{ width:'100%', height: prevH * scale, position:'relative', overflow:'hidden' }}>
                <div ref={innerRef} style={{
                  position:'absolute', top:0, left:0, width: INV_W,
                  transform:`scale(${scale})`, transformOrigin:'top left',
                  boxShadow:'0 4px 32px rgba(0,0,0,0.12)',
                }}>
                  <InvoicePreview data={inv} template={template} />
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Works offline · No data sent anywhere · PDF fits any invoice length
          </p>
        </div>
      </div>
    </div>

    {/* Off-screen capture — outside animated wrapper */}
    <div ref={captureRef} aria-hidden="true"
      style={{ position:'fixed', left:-9999, top:0, width:INV_W, pointerEvents:'none', zIndex:-1 }}>
      <InvoicePreview data={inv} template={template} />
    </div>
  </>
  );
}
