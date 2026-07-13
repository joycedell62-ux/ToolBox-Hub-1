import React, { useState, useEffect, useRef } from 'react';
import { StickyNote, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Plus, Trash2, Download } from 'lucide-react';
import { Link } from 'wouter';

interface Note { id: number; title: string; content: string; updated: number; color: string; }
const COLORS = ['bg-white', 'bg-yellow-50', 'bg-blue-50', 'bg-green-50', 'bg-pink-50', 'bg-purple-50'];
const FAQS = [
  { q: 'Are my notes saved?', a: 'Yes — all notes are auto-saved to your browser\'s local storage.' },
  { q: 'Can I download a note?', a: 'Yes — click the download icon on any note to save it as a .txt file.' },
  { q: 'How many notes can I have?', a: 'As many as your browser\'s storage allows — typically thousands.' },
  { q: 'Can I change note colours?', a: 'Yes — click the colour dots on any note to change its background.' },
];

let nid = 1;

export default function NotesPad() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const s = localStorage.getItem('notes_pad');
    if (s) { try { const p = JSON.parse(s); setNotes(p); nid = p.length ? Math.max(...p.map((n: Note) => n.id)) + 1 : 1; if (p.length) setActive(p[0].id); } catch {} }
  }, []);

  const saveNotes = (ns: Note[]) => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => localStorage.setItem('notes_pad', JSON.stringify(ns)), 300);
  };

  const addNote = () => {
    const n: Note = { id: nid++, title: 'Untitled Note', content: '', updated: Date.now(), color: 'bg-white' };
    const ns = [n, ...notes];
    setNotes(ns); setActive(n.id); saveNotes(ns);
  };

  const updateNote = (id: number, field: 'title' | 'content' | 'color', value: string) => {
    const ns = notes.map(n => n.id === id ? { ...n, [field]: value, updated: Date.now() } : n);
    setNotes(ns); saveNotes(ns);
  };

  const deleteNote = (id: number) => {
    const ns = notes.filter(n => n.id !== id);
    setNotes(ns); saveNotes(ns);
    setActive(ns.length ? ns[0].id : null);
  };

  const downloadNote = (note: Note) => {
    const blob = new Blob([`${note.title}\n${'='.repeat(note.title.length)}\n\n${note.content}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${note.title.replace(/[^a-z0-9]/gi, '_')}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  const activeNote = notes.find(n => n.id === active);
  const fmt = (ts: number) => new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><StickyNote className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Notes Pad</h1><p className="text-blue-200 text-sm">Multiple notes · auto-save · colour coding · download</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">A simple, fast notepad that lives in your browser. Create multiple notes, colour-code them, and download as text files.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6 min-h-[500px]">
        <div className="lg:col-span-2 flex flex-col gap-3">
          <button onClick={addNote} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-sm">
            <Plus className="w-4 h-4" /> New Note
          </button>
          <div className="flex flex-col gap-2 overflow-y-auto max-h-[400px] pr-1">
            {notes.length === 0 && <div className="text-center py-8 text-gray-400 text-sm">No notes yet — create one!</div>}
            {notes.map(note => (
              <button key={note.id} onClick={() => setActive(note.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${active === note.id ? 'border-blue-400 bg-blue-50' : 'border-gray-100 bg-white hover:border-blue-200'}`}>
                <div className="font-semibold text-gray-800 text-sm truncate">{note.title || 'Untitled'}</div>
                <div className="text-xs text-gray-400 mt-0.5 truncate">{note.content.slice(0, 50) || 'Empty note'}</div>
                <div className="text-[10px] text-gray-300 mt-1">{fmt(note.updated)}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3">
          {activeNote ? (
            <div className={`h-full flex flex-col rounded-2xl border border-gray-100 shadow-sm overflow-hidden ${activeNote.color}`}>
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                <input value={activeNote.title} onChange={e => updateNote(activeNote.id, 'title', e.target.value)}
                  className="flex-1 bg-transparent font-bold text-gray-900 text-sm focus:outline-none" placeholder="Note title…" />
                <div className="flex gap-1">
                  {COLORS.map(c => <button key={c} onClick={() => updateNote(activeNote.id, 'color', c)} className={`w-4 h-4 rounded-full border-2 ${c} ${activeNote.color === c ? 'border-blue-500' : 'border-gray-300'}`} />)}
                </div>
                <button onClick={() => downloadNote(activeNote)} className="text-gray-400 hover:text-blue-600 p-1"><Download className="w-4 h-4" /></button>
                <button onClick={() => deleteNote(activeNote.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
              </div>
              <textarea value={activeNote.content} onChange={e => updateNote(activeNote.id, 'content', e.target.value)}
                className="flex-1 bg-transparent px-4 py-3 text-sm text-gray-800 focus:outline-none resize-none min-h-[300px] font-mono leading-relaxed"
                placeholder="Start writing…" />
              <div className="px-4 py-2 text-xs text-gray-400 border-t border-gray-100 flex justify-between">
                <span>{activeNote.content.trim() ? activeNote.content.trim().split(/\s+/).length : 0} words</span>
                <span>Saved automatically</span>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center bg-white rounded-2xl border border-dashed border-gray-200">
              <div className="text-center"><StickyNote className="w-12 h-12 text-gray-200 mx-auto mb-3" /><p className="text-gray-500 text-sm">Create a note to get started</p></div>
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
          <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Use colour coding to organise notes by topic (yellow=ideas, blue=work, green=personal).</li>
            <li>• Download important notes as .txt files for backup.</li>
            <li>• Keep a "Running List" note for quick captures throughout the day.</li>
          </ul>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
          <div className="grid grid-cols-2 gap-3">
            {[{ label: 'Daily To-Do', href: '/todo-list' }, { label: 'Markdown Editor', href: '/markdown-editor' }, { label: 'Weekly Planner', href: '/weekly-planner' }, { label: 'Word Counter', href: '/word-counter' }].map(r => (
              <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
        <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} onClick={() => { setFeedback(v); localStorage.setItem('feedback_notes', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5"><HelpCircle className="w-5 h-5 text-blue-600" /><h2 className="font-bold text-gray-900">Frequently Asked Questions</h2></div>
        <div className="space-y-3">{FAQS.map((faq, i) => (<div key={i} className="border border-gray-100 rounded-xl overflow-hidden"><button className="w-full flex items-center justify-between px-5 py-4 text-left" onClick={() => setOpenFaq(openFaq === i ? null : i)}><span className="font-semibold text-gray-800 text-sm">{faq.q}</span>{openFaq === i ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}</button>{openFaq === i && <div className="px-5 pb-4 text-sm text-gray-600">{faq.a}</div>}</div>))}</div>
      </div>
    </div>
  );
}
