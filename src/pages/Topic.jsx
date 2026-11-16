import { useState } from 'react';
import { TOPICS, TAB_NAMES } from '../data/topics.js';
import { useAr, href, useStore, markStory, num } from '../lib.js';
import { Corners } from '../components/Ornament.jsx';
import { TopicIcon } from '../components/Bits.jsx';
import Reader from '../components/Reader.jsx';
import Flashcards from '../components/Flashcards.jsx';
import Talk from '../components/Talk.jsx';
import { OrderSteps } from '../components/QuizKit.jsx';
import { ChessExplorer, ChessGame } from '../play/Chess.jsx';
import { TawlaExplorer, TawlaGame } from '../play/Tawla.jsx';
import { DominoExplorer, DominoGame } from '../play/Domino.jsx';

const EXPLORER = { chess: ChessExplorer, tawla: TawlaExplorer, domino: DominoExplorer };
const GAME = { chess: ChessGame, tawla: TawlaGame, domino: DominoGame };

export default function Topic({ t, tab }) {
  const ar = useAr();
  const current = t.tabs.includes(tab) ? tab : t.tabs[0];
  const idx = TOPICS.indexOf(t);
  const prev = TOPICS[idx - 1];
  const next = TOPICS[idx + 1];

  return (
    <>
      <div className="crumbs">
        <a href={href()}>{ar('الرَّئِيسِيَّةُ')}</a>
        <span>›</span>
        <span>{ar(t.title)}</span>
      </div>
      <header className="banner">
        <Corners />
        <span className="banner-icon">
          <TopicIcon name={t.icon} size={34} />
        </span>
        <h1 className="banner-title ruqaa">{ar(t.title)}</h1>
        <div className="banner-iq">
          {ar('يَقُولُونَ فِي الْمَقْهَى')}: <b>«{ar(t.iq)}»</b>
        </div>
      </header>

      <nav className="tabs" aria-label={ar('أَقْسَامُ الصَّفْحَةِ')}>
        {t.tabs.map((k) => (
          <a key={k} href={href('t', t.id, k)} className={k === current ? 'on' : ''} aria-current={k === current ? 'page' : undefined}>
            {ar(TAB_NAMES[k])}
          </a>
        ))}
      </nav>

      {current === 'story' && <Story t={t} />}
      {current === 'tea' && <Tea t={t} />}
      {current === 'rules' && <Rules t={t} />}
      {current === 'words' && <Flashcards key={t.id} t={t} />}
      {current === 'talk' && <Talk dialogues={t.dialogues} />}
      {current === 'play' && <Game t={t} />}

      <div className="pager">
        {prev ? <a href={href('t', prev.id)}>→ {ar(prev.title)}</a> : <span />}
        {next ? <a href={href('t', next.id)}>{ar(next.title)} ←</a> : <span />}
      </div>
    </>
  );
}

function Story({ t }) {
  const ar = useAr();
  const store = useStore();
  const read = store.story?.[t.id];
  const nextTab = t.tabs[1];
  return (
    <Reader sections={t.story} gloss={t.gloss}>
      <div className="story-end">
        {read ? (
          <p className="read-done">✓ {ar('قَرَأْتَ هَذِهِ الْحِكَايَةَ')}</p>
        ) : (
          <button className="btn" onClick={() => markStory(t.id)}>
            {ar('قَرَأْتُ الْحِكَايَةَ ✓')}
          </button>
        )}
        <a className="btn ghost" href={href('t', t.id, nextTab)}>
          {ar(TAB_NAMES[nextTab])} ←
        </a>
      </div>
    </Reader>
  );
}

function Tea({ t }) {
  const ar = useAr();
  const [round, setRound] = useState(0);
  return (
    <Reader sections={t.tea} gloss={t.gloss}>
      <section className="rsec">
        <h2 className="rsec-h">☕ {ar('حَضِّرِ الچَايَ بِنَفْسِكَ')}</h2>
        <p className="hint">{ar('رَتِّبْ خُطُوَاتِ تَخْدِيرِ الچَايِ: اضْغَطْ عَلَى الْخُطُوَاتِ بِالتَّرْتِيبِ الصَّحِيحِ.')}</p>
        <OrderSteps key={round} steps={t.teaSteps} gameId="tea" again={() => setRound(round + 1)} />
      </section>
    </Reader>
  );
}

function Rules({ t }) {
  const ar = useAr();
  const Ex = EXPLORER[t.id];
  return (
    <div className="rules">
      <ol className="rule-list">
        {t.rules.map((r, i) => (
          <li key={i}>
            <span className="n">{num(i + 1)}</span>
            <p>{ar(r)}</p>
          </li>
        ))}
      </ol>
      <Ex />
      <div className="row center">
        <a className="btn" href={href('t', t.id, 'play')}>
          {ar('الْعَبْ ضِدَّ الْحَاسُوبِ')} ←
        </a>
      </div>
    </div>
  );
}

function Game({ t }) {
  const ar = useAr();
  const G = GAME[t.id];
  return (
    <>
      <p className="hint">
        {ar('لَا تَعْرِفُ الْقَوَاعِدَ؟')} <a href={href('t', t.id, 'rules')}>{ar('اقْرَأْهَا أَوَّلًا')}</a>.
      </p>
      <G />
    </>
  );
}
