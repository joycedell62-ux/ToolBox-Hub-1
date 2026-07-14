import React, { useState } from 'react';
import { BookOpen, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Copy, Check, RefreshCw, Share2 } from 'lucide-react';
import { Link } from 'wouter';

type Level = 'all' | 'everyday' | 'advanced' | 'beautiful' | 'business';

const LEVELS: { id: Level; label: string; emoji: string }[] = [
  { id: 'all', label: 'Surprise Me', emoji: '🎲' },
  { id: 'everyday', label: 'Everyday', emoji: '💬' },
  { id: 'advanced', label: 'Advanced', emoji: '🎓' },
  { id: 'beautiful', label: 'Beautiful', emoji: '✨' },
  { id: 'business', label: 'Business', emoji: '💼' },
];

interface WordEntry {
  word: string;
  pos: string;
  meaning: string;
  example: string;
  synonyms: string[];
}

const WORDS: Record<Exclude<Level, 'all'>, WordEntry[]> = {
  everyday: [
    { word: 'Candid', pos: 'adjective', meaning: 'Truthful and straightforward; frank.', example: 'She gave a candid answer about why the project failed.', synonyms: ['frank', 'honest', 'direct'] },
    { word: 'Diligent', pos: 'adjective', meaning: 'Showing careful and persistent effort in work or duties.', example: 'His diligent study habits earned him top marks.', synonyms: ['hardworking', 'industrious', 'meticulous'] },
    { word: 'Reluctant', pos: 'adjective', meaning: 'Unwilling and hesitant to do something.', example: 'He was reluctant to lend his new bike to anyone.', synonyms: ['hesitant', 'unwilling', 'loath'] },
    { word: 'Vivid', pos: 'adjective', meaning: 'Producing powerful, clear images in the mind; strikingly bright.', example: 'She gave a vivid description of the carnival.', synonyms: ['graphic', 'striking', 'lively'] },
    { word: 'Grumble', pos: 'verb', meaning: 'To complain in a bad-tempered, muttering way.', example: 'The passengers grumbled about the delayed flight.', synonyms: ['complain', 'mutter', 'moan'] },
    { word: 'Baffle', pos: 'verb', meaning: 'To totally confuse or puzzle someone.', example: 'The magician\u2019s trick baffled the entire audience.', synonyms: ['puzzle', 'confound', 'perplex'] },
    { word: 'Ponder', pos: 'verb', meaning: 'To think about something carefully before deciding.', example: 'She pondered the offer for a week before accepting.', synonyms: ['consider', 'contemplate', 'mull over'] },
    { word: 'Sturdy', pos: 'adjective', meaning: 'Strongly and solidly built; robust.', example: 'The sturdy table survived three house moves.', synonyms: ['robust', 'solid', 'durable'] },
    { word: 'Tidy', pos: 'adjective', meaning: 'Arranged neatly and in order.', example: 'His desk is always tidy before he leaves work.', synonyms: ['neat', 'orderly', 'organized'] },
    { word: 'Swift', pos: 'adjective', meaning: 'Happening quickly or moving at high speed.', example: 'The team made a swift decision to change plans.', synonyms: ['fast', 'rapid', 'prompt'] },
    { word: 'Gloomy', pos: 'adjective', meaning: 'Dark or poorly lit; feeling or looking sad.', example: 'The gloomy weather matched his mood.', synonyms: ['dismal', 'dreary', 'somber'] },
    { word: 'Chuckle', pos: 'verb', meaning: 'To laugh quietly or inwardly.', example: 'He chuckled at the comic strip in the newspaper.', synonyms: ['giggle', 'snicker', 'laugh softly'] },
    { word: 'Rummage', pos: 'verb', meaning: 'To search unsystematically through something.', example: 'She rummaged through the drawer looking for her keys.', synonyms: ['search', 'dig', 'forage'] },
    { word: 'Feeble', pos: 'adjective', meaning: 'Lacking physical strength; weak.', example: 'His feeble excuse convinced no one.', synonyms: ['weak', 'frail', 'flimsy'] },
    { word: 'Drowsy', pos: 'adjective', meaning: 'Sleepy and lethargic; half asleep.', example: 'The warm afternoon made everyone drowsy.', synonyms: ['sleepy', 'lethargic', 'groggy'] },
    { word: 'Stubborn', pos: 'adjective', meaning: 'Determined not to change one\u2019s attitude or position.', example: 'The stubborn stain would not come out of the shirt.', synonyms: ['obstinate', 'headstrong', 'inflexible'] },
    { word: 'Wander', pos: 'verb', meaning: 'To walk or move in a leisurely, aimless way.', example: 'They wandered through the old town without a map.', synonyms: ['roam', 'stroll', 'drift'] },
    { word: 'Bland', pos: 'adjective', meaning: 'Lacking strong features or flavor; dull.', example: 'The soup was too bland without any seasoning.', synonyms: ['flavorless', 'plain', 'insipid'] },
    { word: 'Startle', pos: 'verb', meaning: 'To cause someone to feel sudden shock or alarm.', example: 'The loud knock startled the sleeping cat.', synonyms: ['surprise', 'alarm', 'jolt'] },
    { word: 'Thrifty', pos: 'adjective', meaning: 'Careful with money; using resources wisely.', example: 'Her thrifty habits let her save for the trip in months.', synonyms: ['frugal', 'economical', 'prudent'] },
  ],
  advanced: [
    { word: 'Ubiquitous', pos: 'adjective', meaning: 'Present, appearing, or found everywhere.', example: 'Smartphones have become ubiquitous in modern life.', synonyms: ['omnipresent', 'pervasive', 'universal'] },
    { word: 'Ephemeral', pos: 'adjective', meaning: 'Lasting for a very short time.', example: 'The beauty of cherry blossoms is ephemeral.', synonyms: ['fleeting', 'transient', 'short-lived'] },
    { word: 'Pragmatic', pos: 'adjective', meaning: 'Dealing with things sensibly and realistically.', example: 'She took a pragmatic approach to the budget cuts.', synonyms: ['practical', 'realistic', 'sensible'] },
    { word: 'Obfuscate', pos: 'verb', meaning: 'To deliberately make something unclear or hard to understand.', example: 'The report seemed designed to obfuscate rather than explain.', synonyms: ['confuse', 'muddle', 'cloud'] },
    { word: 'Alacrity', pos: 'noun', meaning: 'Brisk and cheerful readiness.', example: 'He accepted the invitation with alacrity.', synonyms: ['eagerness', 'willingness', 'enthusiasm'] },
    { word: 'Taciturn', pos: 'adjective', meaning: 'Reserved or uncommunicative in speech; saying little.', example: 'The taciturn farmer answered only in single words.', synonyms: ['reticent', 'reserved', 'quiet'] },
    { word: 'Capitulate', pos: 'verb', meaning: 'To cease resisting; to surrender.', example: 'The city finally capitulated after a long siege.', synonyms: ['surrender', 'yield', 'concede'] },
    { word: 'Perfunctory', pos: 'adjective', meaning: 'Carried out with minimum effort or reflection.', example: 'He gave the report a perfunctory glance and signed it.', synonyms: ['cursory', 'superficial', 'mechanical'] },
    { word: 'Equanimity', pos: 'noun', meaning: 'Mental calmness and composure, especially in difficulty.', example: 'She faced the bad news with remarkable equanimity.', synonyms: ['composure', 'calm', 'poise'] },
    { word: 'Recalcitrant', pos: 'adjective', meaning: 'Stubbornly resistant to authority or guidance.', example: 'The recalcitrant mule refused to cross the bridge.', synonyms: ['defiant', 'unruly', 'obstinate'] },
    { word: 'Sycophant', pos: 'noun', meaning: 'A person who flatters others to gain advantage.', example: 'The manager was surrounded by sycophants who never disagreed.', synonyms: ['flatterer', 'toady', 'yes-man'] },
    { word: 'Insidious', pos: 'adjective', meaning: 'Proceeding gradually and harmfully in a subtle way.', example: 'Rust is insidious \u2014 by the time you see it, the damage is done.', synonyms: ['stealthy', 'treacherous', 'creeping'] },
    { word: 'Magnanimous', pos: 'adjective', meaning: 'Generous or forgiving, especially toward a rival.', example: 'The champion was magnanimous in victory, praising her opponent.', synonyms: ['generous', 'noble', 'big-hearted'] },
    { word: 'Obstreperous', pos: 'adjective', meaning: 'Noisy and difficult to control.', example: 'The obstreperous crowd drowned out the speaker.', synonyms: ['unruly', 'boisterous', 'rowdy'] },
    { word: 'Parsimonious', pos: 'adjective', meaning: 'Extremely unwilling to spend money or resources.', example: 'The parsimonious landlord refused to fix the heating.', synonyms: ['stingy', 'miserly', 'tightfisted'] },
    { word: 'Quixotic', pos: 'adjective', meaning: 'Extremely idealistic; unrealistic and impractical.', example: 'His quixotic plan to sail the Atlantic in a rowboat worried everyone.', synonyms: ['idealistic', 'romantic', 'impractical'] },
    { word: 'Vociferous', pos: 'adjective', meaning: 'Expressing opinions loudly and forcefully.', example: 'Vociferous protests erupted outside the stadium.', synonyms: ['clamorous', 'outspoken', 'strident'] },
    { word: 'Zealous', pos: 'adjective', meaning: 'Showing great energy and passion for a cause.', example: 'The zealous volunteers knocked on every door in town.', synonyms: ['fervent', 'ardent', 'passionate'] },
    { word: 'Laconic', pos: 'adjective', meaning: 'Using very few words.', example: 'His laconic reply \u2014 "Fine." \u2014 ended the discussion.', synonyms: ['terse', 'brief', 'concise'] },
    { word: 'Juxtapose', pos: 'verb', meaning: 'To place side by side for contrast or comparison.', example: 'The exhibit juxtaposes ancient tools with modern gadgets.', synonyms: ['compare', 'contrast', 'set side by side'] },
  ],
  beautiful: [
    { word: 'Serendipity', pos: 'noun', meaning: 'The occurrence of happy or beneficial events by chance.', example: 'Meeting her co-founder at a bus stop was pure serendipity.', synonyms: ['chance', 'fortuity', 'luck'] },
    { word: 'Petrichor', pos: 'noun', meaning: 'The pleasant, earthy smell after rain falls on dry ground.', example: 'The petrichor after the summer storm filled the garden.', synonyms: ['rain scent', 'earth smell'] },
    { word: 'Luminous', pos: 'adjective', meaning: 'Full of or shedding light; glowing.', example: 'The luminous moon lit the whole valley.', synonyms: ['radiant', 'glowing', 'bright'] },
    { word: 'Mellifluous', pos: 'adjective', meaning: 'Sweet or musical; pleasant to hear.', example: 'Her mellifluous voice made even announcements sound lovely.', synonyms: ['euphonious', 'dulcet', 'honeyed'] },
    { word: 'Halcyon', pos: 'adjective', meaning: 'Denoting a period of time that was idyllically happy and peaceful.', example: 'They reminisced about the halcyon days of their childhood summers.', synonyms: ['golden', 'peaceful', 'idyllic'] },
    { word: 'Sonder', pos: 'noun', meaning: 'The realization that each passerby lives a life as vivid and complex as your own.', example: 'Watching the crowd from the caf\u00e9 window, she felt a wave of sonder.', synonyms: ['awareness', 'empathy'] },
    { word: 'Ethereal', pos: 'adjective', meaning: 'Extremely delicate and light; seemingly too perfect for this world.', example: 'The dancer moved with an ethereal grace.', synonyms: ['celestial', 'airy', 'otherworldly'] },
    { word: 'Wanderlust', pos: 'noun', meaning: 'A strong desire to travel and explore the world.', example: 'Wanderlust pulled him from city to city across three continents.', synonyms: ['travel bug', 'restlessness'] },
    { word: 'Solitude', pos: 'noun', meaning: 'The state of being alone, often peaceful and restorative.', example: 'She found solitude by the lake every morning before work.', synonyms: ['seclusion', 'quietness', 'privacy'] },
    { word: 'Effervescent', pos: 'adjective', meaning: 'Bubbly and enthusiastic; fizzy with energy.', example: 'Her effervescent personality lifted the whole room.', synonyms: ['bubbly', 'vivacious', 'sparkling'] },
    { word: 'Gossamer', pos: 'adjective', meaning: 'Extremely light, thin, and delicate.', example: 'Gossamer threads of spider silk glittered with dew.', synonyms: ['delicate', 'filmy', 'sheer'] },
    { word: 'Aurora', pos: 'noun', meaning: 'The dawn; also the natural light display in polar skies.', example: 'They drove north all night hoping to catch the aurora.', synonyms: ['dawn', 'daybreak', 'northern lights'] },
    { word: 'Sempiternal', pos: 'adjective', meaning: 'Eternal and unchanging; everlasting.', example: 'The poem spoke of a sempiternal love that outlives the stars.', synonyms: ['eternal', 'everlasting', 'endless'] },
    { word: 'Susurrus', pos: 'noun', meaning: 'A soft murmuring or rustling sound; a whisper.', example: 'The susurrus of leaves was the only sound in the grove.', synonyms: ['whisper', 'murmur', 'rustle'] },
    { word: 'Ineffable', pos: 'adjective', meaning: 'Too great or extreme to be expressed in words.', example: 'The view from the summit filled them with ineffable joy.', synonyms: ['indescribable', 'unspeakable', 'beyond words'] },
    { word: 'Limerence', pos: 'noun', meaning: 'The state of being infatuated with another person.', example: 'The first months of limerence made every text feel electric.', synonyms: ['infatuation', 'crush', 'passion'] },
    { word: 'Vellichor', pos: 'noun', meaning: 'The strange wistfulness of used bookstores.', example: 'The old shop\u2019s vellichor kept her browsing for hours.', synonyms: ['nostalgia', 'wistfulness'] },
    { word: 'Idyllic', pos: 'adjective', meaning: 'Extremely happy, peaceful, or picturesque.', example: 'They spent an idyllic week in a cottage by the sea.', synonyms: ['picturesque', 'blissful', 'perfect'] },
  ],
  business: [
    { word: 'Leverage', pos: 'verb', meaning: 'To use something to maximum advantage.', example: 'We can leverage our existing customers for referrals.', synonyms: ['utilize', 'exploit', 'capitalize on'] },
    { word: 'Synergy', pos: 'noun', meaning: 'Combined effect greater than the sum of separate parts.', example: 'The merger created synergy between the two sales teams.', synonyms: ['collaboration', 'combined effect'] },
    { word: 'Scalable', pos: 'adjective', meaning: 'Able to grow or be expanded without breaking down.', example: 'The new system is scalable to millions of users.', synonyms: ['expandable', 'growable', 'flexible'] },
    { word: 'Stakeholder', pos: 'noun', meaning: 'A person with an interest or concern in a business or project.', example: 'All stakeholders reviewed the proposal before launch.', synonyms: ['interested party', 'shareholder', 'partner'] },
    { word: 'Benchmark', pos: 'noun', meaning: 'A standard against which things are measured or judged.', example: 'Their response time set the benchmark for the industry.', synonyms: ['standard', 'yardstick', 'reference point'] },
    { word: 'Mitigate', pos: 'verb', meaning: 'To make something less severe, serious, or painful.', example: 'Insurance helps mitigate the risk of unexpected losses.', synonyms: ['reduce', 'alleviate', 'lessen'] },
    { word: 'Incentivize', pos: 'verb', meaning: 'To motivate someone by offering a reward.', example: 'The bonus plan incentivizes early delivery.', synonyms: ['motivate', 'encourage', 'spur'] },
    { word: 'Delegate', pos: 'verb', meaning: 'To entrust a task or responsibility to another person.', example: 'A good manager knows when to delegate routine work.', synonyms: ['assign', 'entrust', 'hand over'] },
    { word: 'Pivot', pos: 'verb', meaning: 'To shift strategy or direction, often in response to the market.', example: 'The startup pivoted from hardware to software services.', synonyms: ['shift', 'redirect', 'change course'] },
    { word: 'Due diligence', pos: 'noun', meaning: 'Careful investigation done before a business decision.', example: 'They completed due diligence before acquiring the company.', synonyms: ['vetting', 'investigation', 'review'] },
    { word: 'Attrition', pos: 'noun', meaning: 'Gradual reduction of staff through resignations and retirements.', example: 'The team shrank through attrition rather than layoffs.', synonyms: ['turnover', 'wastage', 'erosion'] },
    { word: 'Bandwidth', pos: 'noun', meaning: 'The capacity or time a person has to take on work.', example: 'I don\u2019t have the bandwidth for another project this month.', synonyms: ['capacity', 'availability', 'headroom'] },
    { word: 'Bottleneck', pos: 'noun', meaning: 'A point of congestion that slows an entire process.', example: 'Approval sign-offs were the bottleneck in the release cycle.', synonyms: ['obstruction', 'chokepoint', 'holdup'] },
    { word: 'Onboarding', pos: 'noun', meaning: 'The process of integrating a new employee or customer.', example: 'Smooth onboarding doubled the trial-to-paid conversion.', synonyms: ['orientation', 'induction', 'ramp-up'] },
    { word: 'Iterate', pos: 'verb', meaning: 'To repeat a process, refining the result each cycle.', example: 'The design team iterates weekly based on user feedback.', synonyms: ['refine', 'repeat', 'improve'] },
    { word: 'Procurement', pos: 'noun', meaning: 'The action of obtaining goods or services for a business.', example: 'Procurement negotiated a better rate with the supplier.', synonyms: ['purchasing', 'sourcing', 'acquisition'] },
    { word: 'Turnkey', pos: 'adjective', meaning: 'Ready for immediate use with no extra work required.', example: 'They sell a turnkey solution for online stores.', synonyms: ['ready-made', 'plug-and-play', 'complete'] },
    { word: 'Amortize', pos: 'verb', meaning: 'To spread the cost of an asset over a period of time.', example: 'The equipment cost is amortized over five years.', synonyms: ['spread out', 'write off gradually'] },
  ],
};

const FAQS = [
  { q: 'Where do these words come from?', a: 'They come from a curated, built-in word bank spanning everyday vocabulary, advanced words, beautiful/rare words, and business terms. Nothing is fetched from the internet.' },
  { q: 'Can I use this to grow my vocabulary?', a: 'Yes — draw a few words a day, read the example sentence out loud, and try using each word in a sentence of your own. The synonyms help anchor the meaning.' },
  { q: 'How do I share a word?', a: 'Use the Share button to open your device\u2019s native share menu, or the Copy button to grab the word and its meaning for chats and notes.' },
  { q: 'Will I see the same word repeatedly?', a: 'Each category holds a bank of words and the generator avoids showing the same one twice in a row.' },
  { q: 'Does this work offline?', a: 'Yes — the entire word bank ships inside the app and works with no connection.' },
];

const RELATED = [
  { label: 'Random Fact Generator', href: '/random-fact-generator' },
  { label: 'Word Counter', href: '/word-counter' },
  { label: 'Essay Generator', href: '/essay-generator' },
  { label: 'Conversation Starters', href: '/conversation-starter-generator' },
];

function pool(level: Level): WordEntry[] {
  if (level === 'all') return Object.values(WORDS).flat();
  return WORDS[level];
}

export default function WordMeaningGenerator() {
  const [level, setLevel] = useState<Level>('all');
  const [entry, setEntry] = useState<WordEntry>(() => {
    const p = pool('all');
    return p[Math.floor(Math.random() * p.length)];
  });
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const pick = (lv: Level, avoid?: WordEntry) => {
    const p = pool(lv);
    let next = p[Math.floor(Math.random() * p.length)];
    if (p.length > 1 && avoid) {
      let guard = 0;
      while (next.word === avoid.word && guard < 10) { next = p[Math.floor(Math.random() * p.length)]; guard++; }
    }
    return next;
  };

  const nextWord = () => setEntry(pick(level, entry));

  const changeLevel = (lv: Level) => {
    setLevel(lv);
    setEntry(pick(lv));
  };

  const asText = () =>
    `${entry.word} (${entry.pos}) — ${entry.meaning}\nExample: ${entry.example}\nSynonyms: ${entry.synonyms.join(', ')}`;

  const copy = async () => { await navigator.clipboard.writeText(asText()); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const share = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: entry.word, text: asText() });
      } catch {
        // user cancelled the native share sheet — do nothing
      }
      return;
    }
    await navigator.clipboard.writeText(asText());
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><BookOpen className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Word & Meaning Generator</h1><p className="text-blue-200 text-sm">everyday · advanced · beautiful · business</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Discover a new word with its meaning, an example sentence, and synonyms. Perfect for growing your vocabulary one word at a time.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">Word Category</label>
              <div className="grid grid-cols-2 gap-2">
                {LEVELS.map(c => (
                  <button
                    key={c.id}
                    onClick={() => changeLevel(c.id)}
                    aria-pressed={level === c.id}
                    className={`flex items-center gap-2 text-sm font-medium rounded-xl px-3 py-2.5 border transition-all ${level === c.id ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300'}`}
                  >
                    <span aria-hidden="true">{c.emoji}</span> {c.label}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={nextWord} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> New Word
            </button>
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Learn 3 new words a day and use each in a sentence.</li>
              <li>• Read the example aloud — it helps the meaning stick.</li>
              <li>• The synonyms are great for essays and word games.</li>
              <li>• Pick "Beautiful" for poetic words to use in writing.</li>
              <li>• "Business" words sharpen your workplace vocabulary.</li>
              <li>• Copy your favorites into a personal word journal.</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-sm">Word of the Moment</h2>
              <div className="flex gap-2">
                <button onClick={copy} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                  {copied ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                </button>
                <button onClick={share} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                  {shared ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied</> : <><Share2 className="w-3.5 h-3.5" /> Share</>}
                </button>
              </div>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-blue-50 to-white border border-blue-100 px-6 py-8 min-h-[220px] animate-in fade-in duration-200">
              <div className="flex items-baseline gap-3 flex-wrap justify-center text-center">
                <span className="text-3xl md:text-4xl font-extrabold text-gray-900">{entry.word}</span>
                <span className="text-sm italic text-gray-400">{entry.pos}</span>
              </div>
              <p className="text-base md:text-lg font-medium text-gray-800 leading-relaxed text-center mt-4">{entry.meaning}</p>
              <p className="text-sm text-gray-600 italic text-center mt-4">“{entry.example}”</p>
              <div className="flex items-center justify-center gap-2 flex-wrap mt-5">
                {entry.synonyms.map(s => (
                  <span key={s} className="text-xs font-semibold text-blue-700 bg-blue-100 rounded-full px-3 py-1">{s}</span>
                ))}
              </div>
            </div>
            <button onClick={nextWord} className="w-full mt-4 py-3 bg-white border border-gray-200 text-gray-700 hover:border-blue-300 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Another word
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
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} aria-label={v === 'up' ? 'Helpful' : 'Not helpful'} onClick={() => { setFeedback(v); localStorage.setItem('feedback_word-meaning', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
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
