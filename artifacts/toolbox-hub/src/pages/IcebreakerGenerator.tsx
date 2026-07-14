import React, { useState } from 'react';
import { Snowflake, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Copy, Check, RefreshCw } from 'lucide-react';
import { Link } from 'wouter';

type Setting = 'team' | 'classroom' | 'party' | 'workshop';

const SETTINGS: { id: Setting; label: string; emoji: string }[] = [
  { id: 'team', label: 'Team Meeting', emoji: '💼' },
  { id: 'classroom', label: 'Classroom', emoji: '🎓' },
  { id: 'party', label: 'Party', emoji: '🎉' },
  { id: 'workshop', label: 'Workshop', emoji: '🛠️' },
];

const QUESTIONS: Record<Setting, string[]> = {
  team: [
    'What is one thing you are looking forward to this week?',
    'If you could instantly master any work skill, what would it be?',
    'What is a small win you had recently?',
    'What is your go-to productivity hack?',
    'Coffee, tea, or something else to start your day?',
    'What is the best team you have ever been part of and why?',
    'If our team had a mascot, what should it be?',
    'What is a hobby you would love more time for?',
    'What is one app you could not work without?',
    'What is the most useful piece of advice you have received?',
    'What did you want to be when you grew up?',
    'What is your ideal way to recharge after a busy day?',
    'What is something you learned recently that surprised you?',
    'If you could swap roles with anyone here for a day, who?',
    'What is a book, podcast, or show you would recommend?',
    'What is your favorite way to celebrate a project finishing?',
    'What is a fun fact about you most people do not know?',
    'What is your dream work-from-anywhere location?',
    'What motivates you outside of work?',
    'What is one thing that would make this week great?',
    'What is your most-used emoji in chats?',
    'What is a skill you picked up during the last year?',
    'What is your favorite kind of meeting — and why?',
    'If you could add one thing to the office, what would it be?',
    'What is a goal you are quietly working toward?',
  ],
  classroom: [
    'What is your favorite subject and why?',
    'If you could visit any country, where would you go?',
    'What is a talent or hobby you are proud of?',
    'What is the best book or movie you experienced this year?',
    'If you could have any superpower, what would it be?',
    'What is your favorite way to spend a weekend?',
    'What is one thing you want to learn this year?',
    'If you could meet any famous person, who and why?',
    'What is your favorite food and where do you get it?',
    'What is a fun fact about you?',
    'If you could be an animal for a day, which one?',
    'What is your favorite season and why?',
    'What is something that always makes you laugh?',
    'What would your dream job be?',
    'What is your favorite game to play?',
    'If you had a time machine, where would you go?',
    'What is a place you would love to explore?',
    'What is your favorite thing about your hometown?',
    'If you could invent anything, what would it be?',
    'What is a song you could listen to on repeat?',
    'What is the best gift you have ever received?',
    'What is something you are grateful for today?',
    'What is a skill you would teach others?',
    'If you could eat one meal forever, what would it be?',
    'What makes a good friend, in your opinion?',
  ],
  party: [
    'What is the most memorable trip you have taken?',
    'What is your go-to karaoke song?',
    'What is a hidden talent nobody would guess?',
    'If you could throw any themed party, what would it be?',
    'What is the wildest thing on your bucket list?',
    'What is your favorite way to spend a night off?',
    'Who is the most interesting person you have met this year?',
    'What is your signature dance move?',
    'What is the best concert or event you have been to?',
    'If you had a walk-up song, what would it be?',
    'What is a food you could eat every single day?',
    'What is the funniest thing that happened to you this week?',
    'What is your favorite holiday tradition?',
    'What is a trend you secretly love?',
    'If you could live in any decade, which one?',
    'What is your dream vacation destination?',
    'What is the best costume you have ever worn?',
    'What is your favorite board or party game?',
    'What is a random skill you are weirdly good at?',
    'Who would you invite to your dream dinner party?',
    'What is the best gift you have ever given?',
    'What is your favorite dad joke?',
    'What is something you are excited about right now?',
    'What is a movie you can quote by heart?',
    'What is your ideal way to celebrate a big win?',
  ],
  workshop: [
    'What brought you to this workshop today?',
    'What is one thing you hope to take away from today?',
    'What is a challenge you are hoping to solve?',
    'What is a skill you are actively building right now?',
    'What is the best learning experience you have had?',
    'If you could master one new topic this year, what would it be?',
    'What is a tool or resource you would recommend to others?',
    'What is your preferred way to learn — doing, watching, or reading?',
    'What is a recent aha moment you had?',
    'What is a goal that brought you here?',
    'What is something you already feel confident about?',
    'What is a topic you could teach others?',
    'What is the biggest change you want to make after today?',
    'What is a habit that has helped you grow?',
    'What does success look like for you in this area?',
    'What is a myth about this topic you would like busted?',
    'What is a question you have been sitting with lately?',
    'What is one word describing how you feel about today?',
    'What is a project you are excited to apply this to?',
    'What is your biggest obstacle to progress right now?',
    'What is a small experiment you are willing to try?',
    'Who inspires you in this field?',
    'What is a win you would celebrate at the end of this?',
    'What is a resource that changed how you think?',
    'What is one assumption you are willing to challenge today?',
  ],
};

const FAQS = [
  { q: 'How many icebreakers does this generate?', a: 'Five at a time, tailored to your chosen setting. Hit "Generate 5 New Questions" for a fresh set anytime.' },
  { q: 'Can I copy them all at once?', a: 'Yes — use "Copy List" to grab all five as a numbered list, ready to paste into an agenda, slide, or chat.' },
  { q: 'Which setting should I pick?', a: 'Team Meeting is work-appropriate, Classroom suits students, Party keeps it playful, and Workshop focuses on learning goals.' },
  { q: 'How long should icebreakers take?', a: 'Aim for 30–60 seconds per person. For larger groups, split into pairs or small groups to keep energy high.' },
  { q: 'Does this need the internet?', a: 'No. All 100+ questions are built into the tool and work fully offline.' },
];

const RELATED = [
  { label: 'Conversation Starters', href: '/conversation-starter-generator' },
  { label: 'Would You Rather', href: '/would-you-rather' },
  { label: 'Word & Meaning', href: '/word-meaning-generator' },
  { label: 'Random Fact Generator', href: '/random-fact-generator' },
];

function sample<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

export default function IcebreakerGenerator() {
  const [setting, setSetting] = useState<Setting>('team');
  const [questions, setQuestions] = useState<string[]>(() => sample(QUESTIONS.team, 5));
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const generate = (s: Setting = setting) => setQuestions(sample(QUESTIONS[s], 5));

  const changeSetting = (s: Setting) => {
    setSetting(s);
    generate(s);
  };

  const copyList = async () => {
    await navigator.clipboard.writeText(questions.map((q, i) => `${i + 1}. ${q}`).join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><Snowflake className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Icebreaker Questions Generator</h1><p className="text-blue-200 text-sm">team meetings · classrooms · parties · workshops</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Break the ice with five ready-to-use questions matched to your group. Generate, tweak, and copy the whole list in one click.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">Group setting</label>
              <div className="grid grid-cols-2 gap-2">
                {SETTINGS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => changeSetting(s.id)}
                    aria-pressed={setting === s.id}
                    className={`flex items-center gap-2 text-sm font-medium rounded-xl px-3 py-2.5 border transition-all ${setting === s.id ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300'}`}
                  >
                    <span aria-hidden="true">{s.emoji}</span> {s.label}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => generate()} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Generate 5 New Questions
            </button>
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Answer first to model the vibe and put people at ease.</li>
              <li>• For big groups, split into pairs so everyone gets a turn.</li>
              <li>• Keep it to one or two questions to leave time for the main event.</li>
              <li>• Copy the list into your slide deck or meeting agenda ahead of time.</li>
              <li>• Let people pass — pressure kills the mood.</li>
              <li>• Mix a light question with a thoughtful one for balance.</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-sm">Your 5 Icebreakers</h2>
              <button onClick={copyList} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                {copied ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied List</> : <><Copy className="w-3.5 h-3.5" /> Copy List</>}
              </button>
            </div>
            <ol className="space-y-3 animate-in fade-in duration-200">
              {questions.map((q, i) => (
                <li key={q + i} className="flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                  <span className="text-sm text-gray-800 leading-relaxed">{q}</span>
                </li>
              ))}
            </ol>
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
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} aria-label={v === 'up' ? 'Helpful' : 'Not helpful'} onClick={() => { setFeedback(v); localStorage.setItem('feedback_icebreaker', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
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
