import { useState } from 'react';
import { useAr, useStore, markKnown, shuffle, speak, useArabicVoice, num } from '../lib.js';
import { Die, Tile, Piece } from './Bits.jsx';

/** صورة صغيرة تساعد على فهم الكلمة (قطعة شطرنج، زار، حجر دومينو) */
export function VocabVisual({ v, size = 64 }) {
  if (v.piece)
    return (
      <span className="vv">
        <Piece p={'w' + v.piece} size={size} />
        <Piece p={'b' + v.piece} size={size} />
      </span>
    );
  if (v.die) return <span className="vv"><Die n={v.die} size={size * 0.8} /></span>;
  if (v.dice)
    return (
      <span className="vv">
        {v.dice.map((n, i) => <Die key={i} n={n} size={size * 0.8} />)}
      </span>
    );
  if (v.tile) return <span className="vv"><Tile a={v.tile[0]} b={v.tile[1]} size={size * 0.6} /></span>;
  return null;
}

export function Kind({ v }) {
  const ar = useAr();
  return <span className={'kind ' + (v.iq ? 'iq' : 'fs')}>{ar(v.iq ? 'عِرَاقِيَّة' : 'فُصْحَى')}</span>;
}

export default function Flashcards({ t }) {
  const ar = useAr();
  const store = useStore();
  const hasVoice = useArabicVoice();
  const known = new Set(store.known?.[t.id] || []);
  const [order, setOrder] = useState(() => t.vocab.map((_, i) => i));
  const [onlyNew, setOnlyNew] = useState(false);
  const [pos, setPos] = useState(0);
  const [flip, setFlip] = useState(false);
  const [list, setList] = useState(false);

  const deck = order.filter((i) => !onlyNew || !known.has(t.vocab[i].w));
  const cur = deck[Math.min(pos, deck.length - 1)];
  const v = cur !== undefined ? t.vocab[cur] : null;

  const move = (d) => {
    setFlip(false);
    setPos((x) => (x + d + deck.length) % deck.length);
  };

  const toolbar = (
    <div className="fc-toolbar">
      <span className="fc-count">
        {ar('حَفِظْتَ')} {num(known.size)} {ar('مِنْ')} {num(t.vocab.length)}
      </span>
      <div className="chip-row">
        {!list && (
          <>
            <button className="chip" onClick={() => { setOrder(shuffle(order)); setPos(0); setFlip(false); }}>
              {ar('خَلْطُ الْبِطَاقَاتِ')}
            </button>
            <button className={'chip' + (onlyNew ? ' on' : '')} onClick={() => { setOnlyNew(!onlyNew); setPos(0); setFlip(false); }}>
              {ar('غَيْرُ الْمَحْفُوظَةِ فَقَطْ')}
            </button>
          </>
        )}
        <button className={'chip' + (list ? ' on' : '')} onClick={() => setList(!list)}>
          {list ? ar('الْبِطَاقَاتُ') : ar('الْقَائِمَةُ كَامِلَةً')}
        </button>
      </div>
    </div>
  );

  if (list)
    return (
      <div className="vocab-list">
        {toolbar}
        <table>
          <thead>
            <tr>
              <th scope="col">{ar('فِي الْمَقْهَى')}</th>
              <th scope="col">{ar('بِالْفُصْحَى')}</th>
              <th scope="col" className="tick" aria-label={ar('مَحْفُوظَة')} />
            </tr>
          </thead>
          <tbody>
            {t.vocab.map((x) => (
              <tr key={x.w}>
                <th scope="row">
                  {ar(x.w)} <Kind v={x} />
                </th>
                <td>
                  <b>{ar(x.f)}</b>
                  <div className="vl-d">{ar(x.d)}</div>
                </td>
                <td className="tick">{known.has(x.w) ? '✓' : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

  if (!v)
    return (
      <div className="flashcards">
        {toolbar}
        <div className="done-card">
          <div className="done-big">{ar('أَحْسَنْتَ!')}</div>
          <p>{ar('حَفِظْتَ كُلَّ كَلِمَاتِ هَذَا الْقِسْمِ.')}</p>
          <button className="btn" onClick={() => setOnlyNew(false)}>
            {ar('رَاجِعْ كُلَّ الْبِطَاقَاتِ')}
          </button>
        </div>
      </div>
    );

  const isKnown = known.has(v.w);
  return (
    <div className="flashcards">
      {toolbar}
      <div
        className={'fc' + (flip ? ' flipped' : '')}
        onClick={() => setFlip(!flip)}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setFlip(!flip))}
        role="button"
        tabIndex={0}
        aria-label={ar('اقْلِبِ الْبِطَاقَةَ')}
      >
        <div className="fc-inner">
          <div className="fc-face front">
            {isKnown && <span className="fc-known">✓</span>}
            <Kind v={v} />
            <VocabVisual v={v} />
            <div className="fc-word">{ar(v.w)}</div>
            <div className="fc-tap">{ar('اضْغَطْ لِتَرَى الْمَعْنَى')}</div>
          </div>
          <div className="fc-face back">
            <div className="fc-word small">{ar(v.w)}</div>
            <div className="fc-f">
              <span className="fc-ex-label">{ar('بِالْفُصْحَى')}:</span> {ar(v.f)}
            </div>
            <div className="fc-def">{ar(v.d)}</div>
            {v.ex && (
              <div className="fc-ex">
                <div>«{ar(v.ex[0])}»</div>
                <div className="fc-ex-f">{ar(v.ex[1])}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="fc-actions">
        <button className="ctl" onClick={() => move(-1)} aria-label={ar('السَّابِقُ')}>→</button>
        <span className="fc-pos">
          {num(Math.min(pos, deck.length - 1) + 1)} / {num(deck.length)}
        </span>
        <button className="ctl" onClick={() => move(1)} aria-label={ar('التَّالِي')}>←</button>
      </div>
      <div className="fc-actions">
        {hasVoice && (
          <button className="btn ghost" onClick={() => speak(v.w)}>
            🔊 {ar('انْطِقِ الْكَلِمَةَ')}
          </button>
        )}
        <button
          className={'btn' + (isKnown ? ' ghost' : '')}
          onClick={() => {
            markKnown(t.id, v.w, !isKnown);
            if (!isKnown && !onlyNew) move(1);
            else setFlip(false);
          }}
        >
          {isKnown ? ar('أُرِيدُ أَنْ أُرَاجِعَهَا') : ar('أَعْرِفُهَا ✓')}
        </button>
      </div>
    </div>
  );
}
