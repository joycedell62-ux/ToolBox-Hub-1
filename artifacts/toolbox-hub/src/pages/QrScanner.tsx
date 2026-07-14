import React, { useState, useRef, useEffect } from 'react';
import { QrCode, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Copy, Check, Camera, CameraOff, ExternalLink } from 'lucide-react';
import { Link } from 'wouter';
import { BrowserQRCodeReader } from '@zxing/browser';
import type { IScannerControls } from '@zxing/browser';

const FAQS = [
  { q: 'Is my camera feed uploaded anywhere?', a: 'No. The QR code is decoded entirely in your browser using the device camera. No image or video ever leaves your device.' },
  { q: 'Why does it ask for camera permission?', a: 'Reading a QR code requires access to your camera. Your browser prompts you the first time; you can revoke it anytime in site settings.' },
  { q: 'It says no camera found — why?', a: 'Your device may not have a camera, or another app is using it. Close other apps using the camera and reload the page.' },
  { q: 'What kinds of QR codes work?', a: 'Any standard QR code — URLs, plain text, Wi-Fi credentials, contact cards, and more. The decoded text is shown as-is.' },
  { q: 'Can I use the back camera on my phone?', a: 'Yes. The scanner prefers the rear (environment) camera on mobile devices for easier scanning.' },
];

function isUrl(text: string): boolean {
  try { const u = new URL(text.trim()); return u.protocol === 'http:' || u.protocol === 'https:'; } catch { return false; }
}

export default function QrScanner() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const stop = () => {
    if (controlsRef.current) { controlsRef.current.stop(); controlsRef.current = null; }
    const v = videoRef.current;
    if (v && v.srcObject) {
      (v.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      v.srcObject = null;
    }
    setScanning(false);
  };

  useEffect(() => () => stop(), []);

  const start = async () => {
    setError('');
    setResult('');
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Camera access is not supported in this browser.');
      return;
    }
    try {
      const reader = new BrowserQRCodeReader();
      setScanning(true);
      const controls = await reader.decodeFromVideoDevice(undefined, videoRef.current || undefined, (res) => {
        if (res) {
          setResult(res.getText());
          stop();
        }
      });
      controlsRef.current = controls;
    } catch (e) {
      const err = e as Error;
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera permission was denied. Please allow camera access in your browser settings and try again.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No camera was found on this device.');
      } else {
        setError('Could not start the camera: ' + (err.message || 'unknown error'));
      }
      setScanning(false);
    }
  };

  const copy = async () => { await navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><QrCode className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">QR Code Scanner</h1><p className="text-blue-200 text-sm">live camera · instant decode · copy · open links</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Scan any QR code with your device camera. Decoding happens entirely in your browser — nothing is uploaded.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <p className="text-sm text-gray-600">Point your camera at a QR code. Scanning stops automatically once a code is detected.</p>
            {!scanning ? (
              <button onClick={start} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-sm flex items-center justify-center gap-2">
                <Camera className="w-4 h-4" /> Start Camera
              </button>
            ) : (
              <button onClick={stop} className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                <CameraOff className="w-4 h-4" /> Stop Camera
              </button>
            )}
            {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</div>}
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Hold the code steady and fill the frame for the fastest read.</li>
              <li>• Good lighting dramatically improves recognition speed.</li>
              <li>• On phones, the rear camera is used automatically.</li>
              <li>• Everything runs in your browser — your camera feed is never uploaded.</li>
              <li>• If a code contains a link, use "Open Link" to visit it safely in a new tab.</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 text-sm mb-4">Camera Preview</h2>
            <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video flex items-center justify-center">
              <video ref={videoRef} className="w-full h-full object-cover" playsInline muted aria-label="Camera preview for QR scanning" />
              {!scanning && !result && <span className="absolute text-gray-400 text-sm">Camera is off</span>}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-900 text-sm">Decoded Result</h2>
              {result && (
                <button onClick={copy} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                  {copied ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                </button>
              )}
            </div>
            {result ? (
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-xl px-3 py-3 border border-gray-100 break-all text-sm font-mono text-gray-700 select-all">{result}</div>
                {isUrl(result) && (
                  <a href={result} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors">
                    <ExternalLink className="w-4 h-4" /> Open Link
                  </a>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No code scanned yet. Start the camera and point it at a QR code.</p>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Barcode Scanner', href: '/barcode-scanner' }, { label: 'Barcode Generator', href: '/barcode-generator' }, { label: 'QR Generator', href: '/qr-code-generator' }, { label: 'Password Generator', href: '/password-generator' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} onClick={() => { setFeedback(v); localStorage.setItem('feedback_qr-scanner', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`} aria-label={v === 'up' ? 'Helpful' : 'Not helpful'}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5"><HelpCircle className="w-5 h-5 text-blue-600" /><h2 className="font-bold text-gray-900">Frequently Asked Questions</h2></div>
        <div className="space-y-3">{FAQS.map((faq, i) => (<div key={i} className="border border-gray-100 rounded-xl overflow-hidden"><button className="w-full flex items-center justify-between px-5 py-4 text-left" onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i}><span className="font-semibold text-gray-800 text-sm">{faq.q}</span>{openFaq === i ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}</button>{openFaq === i && <div className="px-5 pb-4 text-sm text-gray-600">{faq.a}</div>}</div>))}</div>
      </div>
    </div>
  );
}
