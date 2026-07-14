import React, { useState } from 'react';
import { MessagesSquare, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Copy, Check, RefreshCw } from 'lucide-react';
import { Link } from 'wouter';

type Context = 'date' | 'party' | 'work' | 'family' | 'deep';

const CONTEXTS: { id: Context; label: string; emoji: string }[] = [
  { id: 'date', label: 'First Date', emoji: '💕' },
  { id: 'party', label: 'Party', emoji: '🎉' },
  { id: 'work', label: 'Work', emoji: '💼' },
  { id: 'family', label: 'Family', emoji: '🏡' },
  { id: 'deep', label: 'Deep Talk', emoji: '🌌' },
];

const STARTERS: Record<Context, string[]> = {
  date: [
    'What does your perfect weekend look like?',
    'What is a small thing that instantly makes your day better?',
    'If we could teleport anywhere right now for dinner, where would we go?',
    'What are you weirdly passionate about?',
    'What is the best trip you have ever taken?',
    'What show or movie could you rewatch endlessly?',
    'What is your go-to comfort meal?',
    'Are you more of a mountains or beaches person?',
    'What is something you have always wanted to learn?',
    'What is your most-used app and why?',
    'What was your first concert or live event?',
    'What is a hobby you would pick up if you had unlimited time?',
    'What is the most spontaneous thing you have ever done?',
    'Coffee, tea, or something else entirely?',
    'What is a book, song, or artist you think everyone should experience?',
    'What is your idea of a truly relaxing day?',
    'What made you laugh most recently?',
    'What is a place you keep meaning to visit but never have?',
    'What is your favorite way to spend a rainy day?',
    'If you could master any skill overnight, what would it be?',
    'What is a food you refused as a kid but love now?',
    'What is your love language, roughly speaking?',
    'What is a tradition you would love to start?',
    'What is the best advice you have ever gotten?',
    'What is something you are looking forward to this year?',
  ],
  party: [
    'What is the most memorable party you have ever been to?',
    'If you could add any song to the playlist right now, what is it?',
    'What is your signature dance move?',
    'Who is the most interesting person you have met this year?',
    'What is your go-to karaoke song?',
    'What is the best snack at any party, no debate?',
    'What is a hidden talent nobody here knows about?',
    'What is the wildest thing on your bucket list?',
    'If tonight had a theme song, what would it be?',
    'What is your favorite holiday and why?',
    'What is a game you could play all night?',
    'What is the best gift you have ever received?',
    'What emoji do you use way too much?',
    'What is your most-used phrase or catchphrase?',
    'If you had to give a toast right now, what would you say?',
    'What is the funniest thing that happened to you this week?',
    'What is your favorite way to celebrate a win?',
    'What is a trend you secretly enjoy?',
    'What would your walk-up song be if you had one?',
    'What is the best costume you have ever worn?',
    'What drink or dish here should everyone try?',
    'What is your favorite dad joke?',
    'Who would you invite to your dream dinner party?',
    'What is a random skill you are secretly proud of?',
    'What is the best road trip you have taken?',
  ],
  work: [
    'What project are you most proud of this year?',
    'What is one tool or app that makes your work easier?',
    'What did you want to be when you grew up?',
    'What is the best piece of career advice you have received?',
    'What is a skill you are trying to build right now?',
    'What does a great day at work look like for you?',
    'What is something you learned recently that surprised you?',
    'If you could swap jobs with anyone for a day, who and why?',
    'What is your favorite way to recharge between meetings?',
    'What is a small win you had this week?',
    'What is the most useful habit you have picked up?',
    'What is a book or podcast you would recommend to the team?',
    'What is your ideal working environment?',
    'What is one thing you wish more people understood about your role?',
    'What is a challenge you overcame that made you better at your job?',
    'What motivates you outside of work?',
    'What is a goal you are chasing this quarter?',
    'What is the best team you have ever been part of?',
    'What is your go-to productivity trick?',
    'What is something new you would like to try at work?',
    'What is the most interesting problem you have solved recently?',
    'How do you like to receive feedback?',
    'What is a mentor or role model who shaped you?',
    'What is one thing you would change about your typical week?',
    'What is a topic you could give an unprepared talk about?',
  ],
  family: [
    'What is your favorite family memory?',
    'What is a family tradition you love?',
    'What was your favorite meal growing up?',
    'What is the funniest thing a family member has ever done?',
    'What is a story about our family you love retelling?',
    'What is something you learned from a grandparent?',
    'What was your favorite family vacation?',
    'What is a recipe you hope gets passed down?',
    'What game did we always play together?',
    'What is your earliest happy memory?',
    'What is a lesson our parents taught that stuck with you?',
    'What did your childhood bedroom look like?',
    'What is a family inside joke that still makes you laugh?',
    'What is something you are grateful for about our family?',
    'What was your favorite holiday tradition as a kid?',
    'What is a place from your childhood you would love to revisit?',
    'What is a talent that runs in the family?',
    'What is the best gift you ever gave someone in the family?',
    'What is a moment you wish you could relive?',
    'What is something you want future generations to know about us?',
    'What was your favorite subject or activity as a child?',
    'What is a song that reminds you of home?',
    'What is a piece of advice you would give your younger self?',
    'What is a hobby you picked up because of family?',
    'What is a family member you admire and why?',
  ],
  deep: [
    'What is something you have changed your mind about recently?',
    'What does a meaningful life look like to you?',
    'What are you most grateful for right now?',
    'What is a fear you have been working to overcome?',
    'What do you want to be remembered for?',
    'What is a belief you hold that others might find surprising?',
    'When do you feel most like yourself?',
    'What is a moment that changed the direction of your life?',
    'What does success mean to you, honestly?',
    'What is something you needed to hear a few years ago?',
    'What is a risk you are glad you took?',
    'What relationship in your life has shaped you the most?',
    'What is something you are still learning about yourself?',
    'What would you do if you knew you could not fail?',
    'What is a small act of kindness you will never forget?',
    'What do you think people misunderstand about you?',
    'What gives you hope?',
    'What is a question you wish people asked you more often?',
    'What have you let go of that you are glad to be free from?',
    'What does home mean to you?',
    'What is the hardest thing you have gone through, and what did it teach you?',
    'What is something you would tell your younger self?',
    'What does forgiveness mean to you?',
    'What legacy do you hope to leave behind?',
    'When were you last truly proud of yourself?',
  ],
};

const FAQS = [
  { q: 'How do I use these conversation starters?', a: 'Pick a context, generate a question, and ask it out loud. When the conversation slows, tap "Next Question" for a fresh one. There is no wrong order.' },
  { q: 'Are these good for shy people?', a: 'Absolutely. Open-ended questions take the pressure off — they give the other person room to share, and give you an easy follow-up.' },
  { q: 'Do the questions repeat?', a: 'Each context has 25+ questions and the tool shuffles randomly, so repeats are rare within a session and every generate feels fresh.' },
  { q: 'Can I use this at work or in a classroom?', a: 'Yes. The Work context is meeting-friendly, and Deep Talk works well for team retreats or reflective sessions.' },
  { q: 'Does this work offline?', a: 'Completely. Every question is built into the app — no internet or account needed.' },
];

const RELATED = [
  { label: 'Icebreaker Questions', href: '/icebreaker-questions' },
  { label: 'Would You Rather', href: '/would-you-rather' },
  { label: 'Truth or Dare', href: '/truth-or-dare' },
  { label: 'Random Fact Generator', href: '/random-fact-generator' },
];

export default function ConversationStarterGenerator() {
  const [context, setContext] = useState<Context>('date');
  const [current, setCurrent] = useState<string>(() => STARTERS.date[Math.floor(Math.random() * STARTERS.date.length)]);
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const pick = (ctx: Context, avoid?: string) => {
    const bank = STARTERS[ctx];
    let next = bank[Math.floor(Math.random() * bank.length)];
    if (bank.length > 1 && avoid) {
      let guard = 0;
      while (next === avoid && guard < 10) { next = bank[Math.floor(Math.random() * bank.length)]; guard++; }
    }
    return next;
  };

  const next = () => setCurrent(pick(context, current));

  const changeContext = (ctx: Context) => {
    setContext(ctx);
    setCurrent(pick(ctx));
  };

  const copy = async () => { await navigator.clipboard.writeText(current); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><MessagesSquare className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Conversation Starter Generator</h1><p className="text-blue-200 text-sm">dates · parties · work · family · deep talks</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Never run out of things to say. Pick a setting and get a fresh, open-ended question — one at a time — to spark genuine conversation.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">Choose a setting</label>
              <div className="grid grid-cols-2 gap-2">
                {CONTEXTS.map(c => (
                  <button
                    key={c.id}
                    onClick={() => changeContext(c.id)}
                    aria-pressed={context === c.id}
                    className={`flex items-center gap-2 text-sm font-medium rounded-xl px-3 py-2.5 border transition-all ${context === c.id ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300'}`}
                  >
                    <span aria-hidden="true">{c.emoji}</span> {c.label}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={next} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Next Question
            </button>
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Ask, then really listen — silence is fine while someone thinks.</li>
              <li>• Follow up with "why?" or "tell me more" to go deeper.</li>
              <li>• Answer the question yourself first to make it feel mutual.</li>
              <li>• Match the setting: keep Work questions light, save Deep Talk for close friends.</li>
              <li>• There are no wrong answers — the goal is connection, not a quiz.</li>
              <li>• Screenshot a favorite to save for later.</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-sm">Your Conversation Starter</h2>
              <button onClick={copy} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                {copied ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
              </button>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-blue-50 to-white border border-blue-100 px-6 py-10 text-center min-h-[180px] flex items-center justify-center animate-in fade-in duration-200">
              <p className="text-xl md:text-2xl font-semibold text-gray-900 leading-snug">{current}</p>
            </div>
            <button onClick={next} className="w-full mt-4 py-3 bg-white border border-gray-200 text-gray-700 hover:border-blue-300 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Give me another
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {RELATED.map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} aria-label={v === 'up' ? 'Helpful' : 'Not helpful'} onClick={() => { setFeedback(v); localStorage.setItem('feedback_conversation-starter', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
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
