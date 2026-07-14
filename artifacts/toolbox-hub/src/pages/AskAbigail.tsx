import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Send, Info } from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'Is Abigail a real fortune teller or psychic?', a: 'No. Abigail is a playful, rule-based chatbot that matches keywords in your message to a friendly response bank. Nothing she says is a real prediction or advice.' },
  { q: 'Does this send my messages anywhere?', a: 'No. Everything runs entirely in your browser with no network calls. Your conversation never leaves your device and is not stored after you leave the page.' },
  { q: 'How does Abigail decide what to say?', a: 'She scans your message for keywords (like "love", "luck", "job") and picks a random response from the matching bank. If nothing matches, she offers an uplifting general reply.' },
  { q: 'Can I use this for real decisions?', a: 'Please don\'t! Abigail is for entertainment and inspiration only. For real advice, talk to a qualified professional or someone you trust.' },
  { q: 'Why do the answers change each time?', a: 'Each response bank has many variations that are chosen at random, so asking the same thing twice usually gives a fresh reply.' },
];

const RESPONSE_BANKS: { keywords: string[]; replies: string[] }[] = [
  {
    keywords: ['love', 'crush', 'relationship', 'partner', 'romance', 'date', 'marry', 'boyfriend', 'girlfriend', 'heart'],
    replies: [
      'The heart knows things the mind is still catching up on. Be patient and kind — with them and with yourself. 💙',
      'Love grows where honesty is planted. Say the true thing gently and see what blooms.',
      'Sometimes the bravest thing you can do is simply show up as yourself. That\'s more attractive than any grand gesture.',
      'The stars whisper that connection favors the curious — ask the question you\'ve been holding back.',
      'A warm heart is never wasted. Even if the timing isn\'t perfect, kindness always finds its way home.',
      'Romance is less about fireworks and more about someone who feels like a quiet, safe morning.',
    ],
  },
  {
    keywords: ['luck', 'lucky', 'fortune', 'chance', 'gamble', 'win', 'lottery'],
    replies: [
      'Luck loves preparation. Do one small brave thing today and watch the doors it opens. 🍀',
      'Fortune tends to smile on people who smile first. Consider today wonderfully promising.',
      'The winds feel favorable — but remember, the luckiest people simply notice more opportunities.',
      'A shimmer of good fortune follows you. Keep your eyes open for a small, happy surprise.',
      'Your lucky spark is real, but it burns brightest when you take a gentle step toward what you want.',
    ],
  },
  {
    keywords: ['career', 'job', 'work', 'money', 'business', 'promotion', 'boss', 'interview', 'salary', 'success'],
    replies: [
      'The path forward rewards steady effort over frantic sprints. One focused hour beats a scattered day. ✨',
      'Your talents are quietly being noticed. Keep planting good work and the harvest will come.',
      'A door you thought was closed may only be waiting for a confident knock.',
      'Success favors those who ask better questions. What do you truly want this to lead to?',
      'The signs suggest a season of growth — but growth is often uncomfortable before it\'s rewarding.',
      'Trust your skills. The version of you six months from now is grateful you kept going.',
    ],
  },
  {
    keywords: ['will i', 'should i', 'do i', 'is it', 'can i', 'am i', 'does', 'yes or no', 'maybe'],
    replies: [
      'The signs point to yes — but let your own courage be the final word. 🌟',
      'Not yet... but soon, if you keep tending to it with care.',
      'All signs say: absolutely, and sooner than you think.',
      'The answer is a gentle "perhaps" — meaning it\'s up to what you do next.',
      'My crystal ball is a little foggy, but my gut says lean toward the brave choice.',
      'Yes — but only if you\'re willing to take the first small step yourself.',
    ],
  },
  {
    keywords: ['joke', 'funny', 'laugh', 'humor', 'cheer'],
    replies: [
      'Why did the fortune teller go to therapy? She had too many issues she couldn\'t see coming! 😄',
      'They say I can read minds... but honestly, most days I can barely read my own handwriting.',
      'A crystal ball walks into a bar. The bartender says, "I saw you coming." 🔮',
      'I asked the universe for a sign. It sent me a "Wet Floor" sign. Very mysterious.',
      'Why don\'t fortune tellers ever win at hide and seek? Everyone can see them coming!',
    ],
  },
  {
    keywords: ['sad', 'tired', 'stressed', 'anxious', 'worried', 'scared', 'lonely', 'hard', 'struggle', 'lost', 'help', 'depressed', 'down'],
    replies: [
      'Even the darkest night ends with a sunrise. You\'ve survived every hard day so far — that\'s a perfect record. 💙',
      'Be gentle with yourself today. You\'re doing better than the anxious voice claims.',
      'Storms pass. You are the sky, not the weather. Breathe — this moment is not forever.',
      'You are allowed to rest. Even the moon takes time in shadow before it shines again.',
      'One small kind thing for yourself today counts as a victory. You matter more than you know.',
      'It\'s okay to not have it all figured out. Take the next tiny step — that\'s enough for now.',
    ],
  },
  {
    keywords: ['thank', 'thanks', 'love you', 'awesome', 'great', 'amazing', 'cool'],
    replies: [
      'You\'re so welcome! Sprinkle a little of that kindness on someone else today. ✨',
      'Aww, you\'ve got a lovely energy. The universe noticed too.',
      'That warms my crystal heart! Go be wonderful out there.',
    ],
  },
  {
    keywords: ['future', 'tomorrow', 'destiny', 'fate', 'happen', 'ahead'],
    replies: [
      'The future is a story you\'re still writing. Grab a bold pen. 📖',
      'What\'s ahead is shaped by what you nurture today — plant good seeds.',
      'Your destiny isn\'t fixed; it\'s a garden that grows toward your attention.',
      'Tomorrow holds a small delight for you. Stay open enough to notice it.',
    ],
  },
];

const FALLBACK_REPLIES = [
  'Hmm, the mists are swirling... I sense you\'re on the edge of something good. Keep going. 🌟',
  'Interesting energy you bring today. Trust your instincts — they\'re wiser than you think.',
  'The universe is a little playful right now. Take a chance on something small and joyful.',
  'I feel a gentle current of possibility around you. Follow your curiosity.',
  'Every question you ask is a tiny act of courage. Stay curious, brave soul. ✨',
  'The answer you seek may already live quietly in your heart. Listen closely.',
];

const GREETING = 'Hello, dear friend! I\'m Abigail, your whimsical fortune companion. 🔮 Ask me about love, luck, your career, or anything on your mind — I\'ll offer a little sparkle of inspiration. (Just for fun!)';

interface Message { from: 'abigail' | 'user'; text: string; }

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function getReply(input: string): string {
  const lower = input.toLowerCase();
  const matches = RESPONSE_BANKS.filter(b => b.keywords.some(k => lower.includes(k)));
  if (matches.length > 0) return pick(pick(matches).replies);
  return pick(FALLBACK_REPLIES);
}

export default function AskAbigail() {
  const [messages, setMessages] = useState<Message[]>([{ from: 'abigail', text: GREETING }]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typing]);

  const send = () => {
    const text = input.trim();
    if (!text || typing) return;
    setMessages(prev => [...prev, { from: 'user', text }]);
    setInput('');
    setTyping(true);
    const reply = getReply(text);
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, { from: 'abigail', text: reply }]);
    }, 900 + Math.random() * 700);
  };

  const quickAsks = ['Will I find love?', 'Am I lucky today?', 'How\'s my career looking?', 'Tell me a joke'];

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><Sparkles className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Ask Abigail</h1><p className="text-blue-200 text-sm">whimsical chatbot · love · luck · career · pure fun</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Chat with Abigail, a friendly fortune-teller companion who offers playful, uplifting replies. 100% offline and private — for entertainment and inspiration only.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-amber-800 font-medium">Responses are for entertainment and inspiration only. Abigail is not a real fortune teller and gives no genuine advice or predictions.</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <h2 className="font-bold text-gray-900 text-sm">Try asking Abigail…</h2>
            <div className="flex flex-wrap gap-2">
              {quickAsks.map(q => (
                <button key={q} onClick={() => setInput(q)} className="text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg px-3 py-1.5 transition-colors">{q}</button>
              ))}
            </div>
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Use keywords like "love", "luck", or "career" for themed replies.</li>
              <li>• Ask a yes/no question ("Should I…?") for a playful verdict.</li>
              <li>• Say "tell me a joke" when you need a quick laugh.</li>
              <li>• Feeling down? Abigail keeps an encouraging word ready.</li>
              <li>• Ask the same thing twice — the reply usually changes!</li>
              <li>• Take everything with a wink; it\'s all in good fun.</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col" style={{ height: '480px' }}>
            <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-1" aria-live="polite">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${m.from === 'user' ? 'bg-blue-600 text-white rounded-br-md' : 'bg-gray-100 text-gray-800 rounded-bl-md'}`}>
                    {m.from === 'abigail' && <span className="block text-xs font-bold text-blue-600 mb-0.5">Abigail 🔮</span>}
                    {m.text}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-500 rounded-2xl rounded-bl-md px-4 py-2.5 text-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>
            <form onSubmit={e => { e.preventDefault(); send(); }} className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
              <label htmlFor="abigail-input" className="sr-only">Your message to Abigail</label>
              <input id="abigail-input" type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Ask Abigail anything…" className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button type="submit" disabled={!input.trim() || typing} className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold rounded-xl transition-colors flex items-center gap-2" aria-label="Send message">
                <Send className="w-4 h-4" /> Send
              </button>
            </form>
          </div>
          <p className="text-center text-xs text-gray-400">Responses are for entertainment and inspiration only.</p>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Daily Fortune', href: '/daily-fortune' }, { label: 'Random Joke', href: '/random-joke-generator' }, { label: 'Word & Meaning', href: '/word-meaning-generator' }, { label: 'Would You Rather', href: '/would-you-rather' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} onClick={() => { setFeedback(v); localStorage.setItem('feedback_ask-abigail', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`} aria-label={v === 'up' ? 'Helpful' : 'Not helpful'}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
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
