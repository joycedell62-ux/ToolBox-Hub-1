import React, { useState } from 'react';
import { Sparkles, ThumbsUp, ThumbsDown, Lightbulb, HelpCircle, ChevronDown, ChevronUp, Copy, Check, RefreshCw, Share2 } from 'lucide-react';
import { Link } from 'wouter';

type Category = 'all' | 'science' | 'history' | 'animals' | 'space' | 'body';

const CATEGORIES: { id: Category; label: string; emoji: string }[] = [
  { id: 'all', label: 'Surprise Me', emoji: '🎲' },
  { id: 'science', label: 'Science', emoji: '🔬' },
  { id: 'history', label: 'History', emoji: '🏛️' },
  { id: 'animals', label: 'Animals', emoji: '🦋' },
  { id: 'space', label: 'Space', emoji: '🌌' },
  { id: 'body', label: 'Human Body', emoji: '🧠' },
];

const FACTS: Record<Exclude<Category, 'all'>, string[]> = {
  science: [
    'Honey never spoils — edible honey has been found in 3,000-year-old Egyptian tombs.',
    'Water can boil and freeze at the same time, a state called the triple point.',
    'A single bolt of lightning is about five times hotter than the surface of the Sun.',
    'Bananas are slightly radioactive because they contain potassium-40.',
    'Hot water can freeze faster than cold water under certain conditions — the Mpemba effect.',
    'Glass is technically an amorphous solid, not a slow-moving liquid.',
    'The human sense of smell can distinguish over one trillion different scents.',
    'Diamonds are not the hardest known material — some lab-made materials surpass them.',
    'Sound travels about four times faster in water than in air.',
    'A teaspoon of neutron star material would weigh about six billion tons.',
    'Helium can turn into a superfluid that climbs the walls of its container.',
    'Oxygen gives flames their glow, but the flame itself is mostly gas and plasma.',
    'The Eiffel Tower can grow more than 15 cm taller in summer as its metal expands.',
    'Rubber bands last longer when refrigerated.',
    'The average cloud weighs around a million pounds due to the water it holds.',
    'DNA from a single human cell would stretch about two meters if uncoiled.',
    'Lightning strikes the Earth roughly 100 times every second.',
    'Ice is less dense than water, which is why it floats.',
    'A material called aerogel is 99.8% air and is nearly weightless.',
    'The speed of light is exactly 299,792,458 meters per second.',
    'Water expands by about 9% when it freezes.',
    'Static electricity can generate sparks reaching thousands of volts.',
    'The smell of rain has a name: petrichor.',
    'Table salt is made from two elements that are dangerous alone — sodium and chlorine.',
    'A day on Earth is gradually getting longer as the Moon slowly drifts away.',
  ],
  history: [
    'Oxford University is older than the Aztec Empire.',
    'Cleopatra lived closer in time to the Moon landing than to the building of the Great Pyramid.',
    'The Great Fire of London in 1666 reportedly killed very few people.',
    'Ancient Romans used crushed mouse brains as toothpaste.',
    'The shortest war in history lasted about 38 minutes.',
    'Napoleon was once attacked by a horde of bunnies during a hunt.',
    'Vikings used the bones of slain animals to make combs.',
    'The Eiffel Tower was originally meant to be a temporary structure.',
    'Ketchup was sold in the 1830s as medicine.',
    'The first recorded Olympic Games took place in 776 BC.',
    'Ancient Egyptians used slabs of stone as pillows.',
    'The Leaning Tower of Pisa has never stood fully straight.',
    'Wristwatches were popularized for soldiers during World War I.',
    'The Great Wall of China is not visible from space with the naked eye.',
    'Coca-Cola was originally green in color.',
    'The Statue of Liberty was a gift from France in 1886.',
    'Medieval knights often could not stand back up unaided if they fell in full armor.',
    'The first email was sent in 1971 by Ray Tomlinson.',
    'People once believed tomatoes were poisonous in parts of Europe.',
    'The typewriter QWERTY layout was designed to slow typists down.',
    'The Titanic had a swimming pool and a gymnasium on board.',
    'Ancient Olympic athletes competed without any clothing.',
    'The oldest known recipe is for beer, dating back thousands of years.',
    'The Hundred Years War actually lasted 116 years.',
    'Paper money was first used in China over a thousand years ago.',
  ],
  animals: [
    'Octopuses have three hearts and blue blood.',
    'A group of flamingos is called a flamboyance.',
    'Sloths can hold their breath longer than dolphins can.',
    'Wombats produce cube-shaped poop.',
    'A shrimp\u2019s heart is located in its head.',
    'Cows have best friends and get stressed when separated.',
    'Butterflies taste with their feet.',
    'A snail can sleep for up to three years.',
    'Sea otters hold hands while sleeping so they don\u2019t drift apart.',
    'Honeybees can recognize human faces.',
    'A tiger\u2019s skin is striped, not just its fur.',
    'Elephants are the only animals that cannot jump.',
    'Crocodiles cannot stick out their tongues.',
    'A hummingbird\u2019s heart can beat over 1,200 times per minute.',
    'Starfish have no brain and no blood.',
    'Cats have a third eyelid to protect their eyes.',
    'Penguins propose to mates with a carefully chosen pebble.',
    'The mantis shrimp can throw a punch as fast as a bullet.',
    'A cockroach can live for weeks without its head.',
    'Dolphins give each other names using unique whistles.',
    'Koalas have fingerprints nearly identical to humans.',
    'Some turtles can breathe partly through their rear ends.',
    'A blue whale\u2019s heart is roughly the size of a small car.',
    'Ants never sleep and don\u2019t have lungs.',
    'Reindeer eyes change color from gold in summer to blue in winter.',
  ],
  space: [
    'A day on Venus is longer than its year.',
    'There may be more stars in the universe than grains of sand on Earth.',
    'Neutron stars can spin hundreds of times per second.',
    'One million Earths could fit inside the Sun.',
    'Space is completely silent because there is no air to carry sound.',
    'It rains molten glass sideways on the exoplanet HD 189733b.',
    'The footprints on the Moon could last millions of years.',
    'Saturn is so light it would float in water if a big enough ocean existed.',
    'A year on Mercury is just 88 Earth days.',
    'The largest known volcano, Olympus Mons, is on Mars.',
    'The Sun makes up about 99.8% of the mass in our solar system.',
    'Jupiter\u2019s Great Red Spot is a storm larger than Earth.',
    'There is a planet made largely of diamond, called 55 Cancri e.',
    'Light from the Sun takes about eight minutes to reach Earth.',
    'The Milky Way and Andromeda galaxies are on a collision course.',
    'Astronauts can grow up to two inches taller in space.',
    'A spoonful of the Sun\u2019s core would be incredibly dense and hot.',
    'The coldest place known in the universe is the Boomerang Nebula.',
    'There are more trees on Earth than stars in the Milky Way.',
    'Neptune has only completed one orbit of the Sun since its discovery in 1846.',
    'The Moon is slowly moving away from Earth by about 3.8 cm a year.',
    'Space smells faintly of seared steak and hot metal, astronauts report.',
    'A full NASA space suit costs around 12 million dollars.',
    'Black holes can slow down time near their edges.',
    'Uranus rotates on its side, likely from a massive ancient collision.',
  ],
  body: [
    'Your body has enough iron to make a small nail.',
    'The human brain uses about 20% of the body\u2019s total energy.',
    'You are slightly taller in the morning than at night.',
    'The strongest muscle by weight is the masseter, your jaw muscle.',
    'Your stomach gets a new lining every few days to avoid digesting itself.',
    'Humans shed about 40,000 skin cells every minute.',
    'The surface area of your lungs is roughly the size of a tennis court.',
    'You have taste receptors in your gut, not just your tongue.',
    'Your heart beats around 100,000 times a day.',
    'The human eye can distinguish about 10 million colors.',
    'Bone is, ounce for ounce, stronger than steel.',
    'Your body produces about 25 million new cells each second.',
    'The small intestine is around 20 feet long.',
    'Fingernails grow faster than toenails.',
    'You blink around 15 to 20 times per minute.',
    'Your nose can remember around 50,000 different scents.',
    'The acid in your stomach is strong enough to dissolve metal.',
    'Humans are the only animals with chins.',
    'Your brain generates enough electricity to power a small light bulb.',
    'Saliva production over a lifetime could fill two swimming pools.',
    'Red blood cells make a full loop of your body in about 20 seconds.',
    'The hyoid bone in your throat is the only bone not connected to another.',
    'You have unique tongue prints, just like fingerprints.',
    'Your ears and nose never stop growing throughout life.',
    'The cornea is the only part of the body with no blood supply.',
  ],
};

const FAQS = [
  { q: 'Where do these facts come from?', a: 'They come from a curated, built-in collection of well-known trivia across science, history, animals, space, and the human body. Nothing is fetched from the internet.' },
  { q: 'Can I filter by topic?', a: 'Yes — pick a category to focus on that subject, or choose "Surprise Me" to draw from all categories at once.' },
  { q: 'How do I share a fact?', a: 'Use the Share button to open your device\u2019s native share menu, or the Copy button to grab the text for chats and posts.' },
  { q: 'Will I see the same fact repeatedly?', a: 'Each category has 25+ facts and the generator avoids showing the same one twice in a row, so it stays fresh.' },
  { q: 'Does this work offline?', a: 'Yes — the entire fact bank ships inside the app and works with no connection.' },
];

const RELATED = [
  { label: 'Random Joke Generator', href: '/random-joke-generator' },
  { label: 'Daily Fortune', href: '/daily-fortune' },
  { label: 'Would You Rather', href: '/would-you-rather' },
  { label: 'Conversation Starters', href: '/conversation-starter-generator' },
];

function pool(cat: Category): string[] {
  if (cat === 'all') return Object.values(FACTS).flat();
  return FACTS[cat];
}

export default function RandomFactGenerator() {
  const [category, setCategory] = useState<Category>('all');
  const [fact, setFact] = useState<string>(() => {
    const p = pool('all');
    return p[Math.floor(Math.random() * p.length)];
  });
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const pick = (cat: Category, avoid?: string) => {
    const p = pool(cat);
    let next = p[Math.floor(Math.random() * p.length)];
    if (p.length > 1 && avoid) {
      let guard = 0;
      while (next === avoid && guard < 10) { next = p[Math.floor(Math.random() * p.length)]; guard++; }
    }
    return next;
  };

  const nextFact = () => setFact(pick(category, fact));

  const changeCategory = (cat: Category) => {
    setCategory(cat);
    setFact(pick(cat));
  };

  const copy = async () => { await navigator.clipboard.writeText(fact); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const share = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: 'Random Fact', text: fact });
        return;
      } catch {
        // user cancelled or unsupported — fall through to clipboard
      }
    }
    await navigator.clipboard.writeText(fact);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl text-white p-8" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 p-2.5 rounded-xl"><Sparkles className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-extrabold">Random Fact Generator</h1><p className="text-blue-200 text-sm">science · history · animals · space · human body</p></div>
        </div>
        <p className="text-blue-100 text-sm max-w-xl">Discover a surprising fact in a tap. Filter by topic or hit surprise me, then copy or share the ones that make you say "no way."</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">Category</label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map(c => (
                  <button
                    key={c.id}
                    onClick={() => changeCategory(c.id)}
                    aria-pressed={category === c.id}
                    className={`flex items-center gap-2 text-sm font-medium rounded-xl px-3 py-2.5 border transition-all ${category === c.id ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300'}`}
                  >
                    <span aria-hidden="true">{c.emoji}</span> {c.label}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={nextFact} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Next Fact
            </button>
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="font-bold text-blue-900 text-sm">Pro Tips</span></div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Use a fun fact to open a presentation or class.</li>
              <li>• Share the wildest ones in group chats to spark discussion.</li>
              <li>• Pick a single category for themed trivia nights.</li>
              <li>• Great for filling awkward silences on a call.</li>
              <li>• Keep a favorite handy as your go-to icebreaker.</li>
              <li>• Facts are static — verify before quoting in formal work.</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-sm">Did You Know?</h2>
              <div className="flex gap-2">
                <button onClick={copy} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                  {copied ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                </button>
                <button onClick={share} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                  {shared ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied</> : <><Share2 className="w-3.5 h-3.5" /> Share</>}
                </button>
              </div>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-blue-50 to-white border border-blue-100 px-6 py-10 text-center min-h-[180px] flex items-center justify-center animate-in fade-in duration-200">
              <p className="text-lg md:text-xl font-semibold text-gray-900 leading-relaxed">{fact}</p>
            </div>
            <button onClick={nextFact} className="w-full mt-4 py-3 bg-white border border-gray-200 text-gray-700 hover:border-blue-300 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Another fact
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
            <div className="flex gap-2">{(['up', 'down'] as const).map(v => (<button key={v} aria-label={v === 'up' ? 'Helpful' : 'Not helpful'} onClick={() => { setFeedback(v); localStorage.setItem('feedback_random-fact', v); }} className={`p-2 rounded-xl border transition-all ${feedback === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 hover:border-blue-300'}`}>{v === 'up' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}</button>))}</div>
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
