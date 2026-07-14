import React, { useState } from 'react';
import { Flame, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, HelpCircle as QIcon, Zap } from 'lucide-react';
import { Link } from 'wouter';

const FAQS = [
  { q: 'Is this appropriate for kids and families?', a: 'Yes. Every truth and dare is family-friendly across all difficulty levels — nothing embarrassing, risky, or inappropriate.' },
  { q: 'What do the difficulty levels mean?', a: 'Mild is gentle and easy, Medium adds a little challenge, and Spicy is the boldest — but all stay clean and light-hearted.' },
  { q: 'Will I get the same prompt twice?', a: 'The generator avoids repeating the prompt you just saw within each list, so consecutive picks feel fresh.' },
  { q: 'How many people can play?', a: 'As many as you like! Pass the device around, take turns, and let each person choose Truth or Dare.' },
  { q: 'Does this work offline?', a: 'Completely. All prompts are built into the app and never require the internet.' },
];

type Level = 'mild' | 'medium' | 'spicy';

const TRUTHS: Record<Level, string[]> = {
  mild: [
    'What is your favorite food of all time?',
    'What was your favorite cartoon growing up?',
    'What is your dream vacation destination?',
    'What is your favorite season and why?',
    'What is a hobby you\'d love to try?',
    'What is the best gift you\'ve ever received?',
    'Who is your favorite fictional character?',
    'What is your go-to comfort movie?',
    'What is your favorite thing to do on weekends?',
    'What song always makes you happy?',
    'What is your favorite ice cream flavor?',
    'What animal would you love to have as a pet?',
    'What is your favorite board or video game?',
    'What subject did you enjoy most in school?',
    'What is your favorite holiday?',
  ],
  medium: [
    'What is the most embarrassing thing that\'s happened to you at school or work?',
    'What is a talent most people don\'t know you have?',
    'What is the silliest fear you\'ve ever had?',
    'What is the weirdest food combination you secretly enjoy?',
    'What is the last thing you searched on your phone?',
    'What is a small habit you\'d like to break?',
    'What is the most childish thing you still do?',
    'What is a white lie you\'ve told recently?',
    'What is your most-used emoji and why?',
    'What is the worst haircut you\'ve ever had?',
    'What is something you\'re surprisingly bad at?',
    'What is the strangest dream you can remember?',
    'What is a trend you followed and later regretted?',
    'What is the most useless thing you know a lot about?',
    'What is a nickname you had that you\'d rather forget?',
  ],
  spicy: [
    'What is the most daring thing you\'ve ever done?',
    'What is a secret talent you\'d perform in front of a crowd?',
    'What is the biggest goal on your bucket list?',
    'If you could swap lives with anyone for a day, who and why?',
    'What is the boldest decision you\'ve ever made?',
    'What is something wild you\'d try if you knew you couldn\'t fail?',
    'What is the most spontaneous thing you\'ve ever done?',
    'What is a rule you love to break (harmlessly)?',
    'What is the most competitive you\'ve ever gotten over something small?',
    'What is a big dream you\'ve never told anyone here?',
    'What is the cheekiest thing you\'ve gotten away with?',
    'If you had to give a surprise speech right now, what would it be about?',
    'What is the most adventurous food you\'d be willing to eat?',
    'What is a bold prediction you have about your future?',
    'What is the funniest way you\'ve ever embarrassed yourself in public?',
  ],
};

const DARES: Record<Level, string[]> = {
  mild: [
    'Do your best impression of a cat for 10 seconds.',
    'Sing the chorus of your favorite song out loud.',
    'Talk in a robot voice until your next turn.',
    'Do 5 jumping jacks right now.',
    'Give a compliment to everyone in the room.',
    'Make up a short rhyme about the person to your left.',
    'Do your happiest dance for 15 seconds.',
    'Speak in a whisper until your next turn.',
    'Show everyone the last photo you took.',
    'Do your best superhero pose and hold it for 10 seconds.',
    'Hum a tune and let others guess the song.',
    'Balance a spoon (or object) on your nose for 5 seconds.',
    'Say the alphabet backward as fast as you can.',
    'Pretend to be a news anchor reporting the weather.',
    'Give a high five to everyone in the room.',
  ],
  medium: [
    'Do your best impression of another player.',
    'Speak in an accent for the next two rounds.',
    'Act out a movie scene and let others guess it.',
    'Do a dramatic slow-motion walk across the room.',
    'Tell a two-minute story using only made-up words.',
    'Balance on one foot until your next turn.',
    'Do your best runway model walk.',
    'Pretend to be a tour guide describing this room.',
    'Sing your last text message as an opera.',
    'Do an impression of your favorite animal, including sounds.',
    'Make up a jingle for a random object in the room.',
    'Give a passionate 30-second speech about socks.',
    'Do your best impression of a famous cartoon character.',
    'Pantomime making breakfast without any words.',
    'Invent a secret handshake with the person across from you.',
  ],
  spicy: [
    'Let another player draw a (washable) doodle on your hand.',
    'Do your most dramatic fake-crying performance.',
    'Perform a 30-second stand-up comedy bit on the spot.',
    'Do your best catwalk with narration from another player.',
    'Act out an entire fairy tale in 60 seconds.',
    'Do 10 push-ups (or wall push-ups) while telling a joke.',
    'Let the group choose a silly voice for you to use for 3 rounds.',
    'Give an over-the-top acceptance speech as if you won an award.',
    'Do an interpretive dance to a song someone hums.',
    'Perform a dramatic reading of a cereal box or nearby label.',
    'Do your best impression of every player in one minute.',
    'Pretend the floor is lava and cross the room without touching it.',
    'Act as a sports commentator narrating everyone\'s next moves.',
    'Do a full dramatic movie-trailer voiceover about your day.',
    'Lead the whole group in a 20-second silly workout.',
  ],
};

const LEVELS: { id: Level; label: string }[] = [
  { id: 'mild', label: 'Mild' },
  { id: 'medium', label: 'Medium' },
  { id: 'spicy', label: 'Spicy' },
];

export default function TruthOrDareGenerator() {
  const [level, setLevel] = useState<Level>('mild');
  const [type, setType] = useState<'truth' | 'dare' | null>(null);
  const [prompt, setPrompt] = useState('');
  const [lastTruth, setLastTruth] = useState('');
  const [lastDare, setLastDare] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const draw = (kind: 'truth' | 'dare') => {
    const list = kind === 'truth' ? TRUTHS[level] : DARES[level];
    const last = kind === 'truth' ? lastTruth : lastDare;
    let choices = list.filter(p => p !== last);
    if (choices.length === 0) choices = list;
    const chosen = choices[Math.floor(Math.random() * choices.length)];
    if (kind === 'truth') setLastTruth(chosen); else setLastDare(chosen);
    setType(kind);
    setPrompt(chosen);
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><Flame className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Truth or Dare</h1><p className="text-blue-200 text-sm">mild · medium · spicy · always family-friendly</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">The classic party game with clean, all-ages prompts. Pick a difficulty, choose Truth or Dare, and pass the device around. 100% offline.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">Difficulty</label>
              <div className="flex gap-2">
                {LEVELS.map(l => (
                  <button key={l.id} onClick={() => setLevel(l.id)} className={`flex-1 text-xs font-semibold rounded-lg px-3 py-2 transition-colors ${level === l.id ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}>{l.label}</button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">All levels stay clean and family-friendly.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => draw('truth')} className="py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-sm flex items-center justify-center gap-2">
                <QIcon className="w-4 h-4" /> Truth
              </button>
              <button onClick={() => draw('dare')} className="py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-sm flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" /> Dare
              </button>
            </div>
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Take turns and let each player choose Truth or Dare.</li>
              <li>• Start on Mild and work up to Spicy for a fun build-up.</li>
              <li>• Pass the device around so everyone gets a turn.</li>
              <li>• No repeats back-to-back, so keep tapping for variety.</li>
              <li>• Great for road trips, sleepovers, and game nights.</li>
              <li>• Keep it kind — the best rounds get everyone laughing. 🔥</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 min-h-[240px] flex flex-col items-center justify-center text-center">
            {!type ? (
              <div className="text-gray-400 flex flex-col items-center gap-3">
                <Flame className="w-16 h-16 text-orange-300" aria-hidden="true" />
                <p className="text-sm">Choose Truth or Dare to begin!</p>
              </div>
            ) : (
              <div className="animate-in fade-in zoom-in duration-300 w-full flex flex-col items-center gap-4">
                <span className={`text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full ${type === 'truth' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>{type === 'truth' ? 'Truth' : 'Dare'} · {LEVELS.find(l => l.id === level)?.label}</span>
                <p className="text-xl font-bold text-gray-900 max-w-lg leading-relaxed">{prompt}</p>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => draw('truth')} className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors">
                    <QIcon className="w-4 h-4" /> New Truth
                  </button>
                  <button onClick={() => draw('dare')} className="flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-800 bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-xl transition-colors">
                    <Zap className="w-4 h-4" /> New Dare
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Related Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Would You Rather', href: '/would-you-rather' }, { label: 'Random Joke', href: '/random-joke-generator' }, { label: 'Icebreaker Questions', href: '/icebreaker-questions' }, { label: 'Conversation Starters', href: '/conversation-starter-generator' }].map(r => (
                <Link key={r.href} href={r.href} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2 transition-colors font-medium">→ {r.label}</Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Was this tool helpful?</span>
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} onClick={() => { setFeedback(v); localStorage.setItem('feedback_truth-or-dare', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`} aria-label={v === 'up' ? 'Helpful' : 'Not helpful'}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
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
