import { useEffect, useRef, useState } from 'react';
import { useAr, addWin, num } from '../lib.js';
import { Tile } from '../components/Bits.jsx';
import * as D from './domino.js';

const N = (n) => num(n);
const tileName = (t) => `${N(t[0])}|${N(t[1])}`;

/** الخط: الأحجار بالترتيب من اليسار إلى اليمين، والدُّبْل يُرسم واقفًا */
function Chain({ chain, targets = [], onEnd, size = 30 }) {
  const ar = useAr();
  const [L, R] = [chain[0][0], chain[chain.length - 1][1]];
  return (
    <div className="chain" dir="ltr">
      <button className={'end' + (targets.includes('L') ? ' target' : '')} onClick={() => onEnd?.('L')} disabled={!targets.includes('L')} aria-label={ar('الطَّرَفُ الْأَيْسَرُ') + ' ' + L}>
        {N(L)}
      </button>
      {chain.map((t, i) => (
        <Tile key={i} a={t[0]} b={t[1]} vertical={t[0] === t[1]} size={size} className="in-chain" />
      ))}
      <button className={'end' + (targets.includes('R') ? ' target' : '')} onClick={() => onEnd?.('R')} disabled={!targets.includes('R')} aria-label={ar('الطَّرَفُ الْأَيْمَنُ') + ' ' + R}>
        {N(R)}
      </button>
    </div>
  );
}

// ---------- مستكشف: أيّ حجر يطابق؟ ----------
const DEMO_CHAIN = [[3, 6], [6, 6], [6, 1], [1, 5]];
const DEMO_HAND = [[2, 4], [5, 2], [0, 3], [4, 4], [1, 6]];

export function DominoExplorer() {
  const ar = useAr();
  const [r, setR] = useState({ chain: DEMO_CHAIN, hands: { me: DEMO_HAND }, log: [] });
  const [sel, setSel] = useState(null);
  const [note, setNote] = useState(null);
  const ends = D.ends(r);
  const choose = (t) => {
    const p = D.placements(r, t);
    if (!p.length) {
      setSel(null);
      return setNote({ ok: false, t: `الْحَجَرُ ${tileName(t)} لَا يُطَابِقُ: الطَّرَفَانِ ${N(ends[0])} وَ${N(ends[1])}.` });
    }
    if (p.length === 1) return put(t, p[0]);
    setSel(t);
    setNote({ ok: true, t: 'هَذَا الْحَجَرُ يُطَابِقُ الطَّرَفَيْنِ! اخْتَرْ طَرَفًا.' });
  };
  const put = (t, side) => {
    const n = D.place(r, 'me', t, side);
    setR(n);
    setSel(null);
    setNote({ ok: true, t: `أَحْسَنْتَ! ${tileName(t)} يُطَابِقُ الطَّرَفَ ${N(side === 'L' ? ends[0] : ends[1])}.` });
  };
  return (
    <div className="explorer">
      <h3 className="ex-title">{ar('جَرِّبْ: أَيُّ حَجَرٍ يُطَابِقُ؟')}</h3>
      <p className="hint">{ar('انْظُرْ إِلَى الرَّقْمَيْنِ فِي طَرَفَيِ الْخَطِّ، ثُمَّ اضْغَطْ عَلَى حَجَرٍ مِنْ أَحْجَارِكَ.')}</p>
      <Chain chain={r.chain} targets={sel ? D.placements(r, sel) : []} onEnd={(side) => sel && put(sel, side)} />
      {note && <div className={'feedback ' + (note.ok ? 'ok' : 'no')}><span>{ar(note.t)}</span></div>}
      <div className="hand" dir="ltr">
        {r.hands.me.map((t) => (
          <button key={t.join()} className={'tile-btn' + (sel === t ? ' sel' : '')} onClick={() => choose(t)} aria-label={tileName(t)}>
            <Tile a={t[0]} b={t[1]} vertical size={30} />
          </button>
        ))}
      </div>
      <div className="row center">
        <button className="chip" onClick={() => { setR({ chain: DEMO_CHAIN, hands: { me: DEMO_HAND }, log: [] }); setNote(null); setSel(null); }}>
          {ar('مِنْ جَدِيدٍ')}
        </button>
      </div>
    </div>
  );
}

// ---------- اللعبة ضد الحاسوب ----------
function firstMsg(r) {
  const t = r.log[0].tile;
  return r.opener === 'me' ? `بَدَأْتَ أَنْتَ بِأَكْبَرِ حَجَرٍ: ${tileName(t)}. الدَّوْرُ لِلْحَاسُوبِ…` : `بَدَأَ الْحَاسُوبُ بِأَكْبَرِ حَجَرٍ: ${tileName(t)}. دَوْرُكَ!`;
}

export function DominoGame() {
  const ar = useAr();
  const [r, setR] = useState(D.newRound);
  const [score, setScore] = useState({ me: 0, ai: 0 });
  const [sel, setSel] = useState(null);
  const [msg, setMsg] = useState(() => '');
  const [end, setEnd] = useState(null); // نتيجة الجولة
  const timer = useRef();
  const counted = useRef(false);

  useEffect(() => setMsg(firstMsg(r)), []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => clearTimeout(timer.current), []);

  const res = D.result(r);
  const matchOver = score.me >= D.TARGET || score.ai >= D.TARGET;

  // نهاية الجولة: احسب النقاط مرة واحدة
  useEffect(() => {
    if (!res || counted.current) return;
    counted.current = true;
    const sc = { ...score };
    if (res.winner) sc[res.winner] += res.points;
    setScore(sc);
    setEnd(res);
    if (sc.me >= D.TARGET && sc.me > sc.ai) addWin('domino');
  }, [res]); // eslint-disable-line react-hooks/exhaustive-deps

  // دور الحاسوب
  useEffect(() => {
    if (res || r.turn !== 'ai') return;
    timer.current = setTimeout(() => {
      const n = D.aiStep(r);
      const drew = r.pile.length - n.pile.length;
      const last = n.log[n.log.length - 1];
      let m = '';
      if (drew) m += `سَحَبَ الْحَاسُوبُ مِنَ الْكَوْمَةِ (${N(drew)}). `;
      m += last.pass ? 'الْحَاسُوبُ: «پَاس!» دَوْرُكَ.' : `لَعِبَ الْحَاسُوبُ ${tileName(last.tile)}. دَوْرُكَ!`;
      setR(n);
      setMsg(m);
    }, 900);
    return () => clearTimeout(timer.current);
  }, [r, res]);

  const mine = r.turn === 'me' && !res;
  const playable = mine ? r.hands.me.filter((t) => D.placements(r, t).length) : [];
  const targets = sel ? D.placements(r, sel) : [];

  const play = (t, side) => {
    const n = D.place(r, 'me', t, side);
    setR(n);
    setSel(null);
    setMsg(`لَعِبْتَ ${tileName(t)}.`);
  };
  const choose = (t) => {
    if (!mine) return;
    const p = D.placements(r, t);
    if (!p.length) return setMsg(`${tileName(t)} لَا يُطَابِقُ أَيَّ طَرَفٍ.`);
    if (p.length === 1) return play(t, p[0]);
    setSel(t);
    setMsg('هَذَا الْحَجَرُ يُطَابِقُ الطَّرَفَيْنِ: اضْغَطْ عَلَى الطَّرَفِ الَّذِي تُرِيدُهُ.');
  };
  const drawOne = () => {
    const n = D.draw(r, 'me');
    setR(n);
    setMsg(`سَحَبْتَ ${tileName(n.drew)}.`);
  };
  const passTurn = () => {
    setR(D.pass(r, 'me'));
    setMsg('قُلْتَ: «پَاس».');
  };
  const nextRound = () => {
    counted.current = false;
    if (matchOver) setScore({ me: 0, ai: 0 });
    const n = D.newRound();
    setR(n);
    setEnd(null);
    setSel(null);
    setMsg(firstMsg(n));
  };

  let endMsg = '';
  if (end) {
    if (!end.winner) endMsg = 'انْقِفْلَتْ! وَالنِّقَاطُ مُتَسَاوِيَةٌ، فَلَا فَائِزَ فِي هَذِهِ الْجَوْلَةِ.';
    else {
      endMsg =
        (end.blocked ? 'انْقِفْلَتْ! ' : '') +
        (end.winner === 'me'
          ? `فُزْتَ بِالْجَوْلَةِ! نِقَاطُكَ فِيهَا: ${N(end.points)}.`
          : `فَازَ الْحَاسُوبُ بِالْجَوْلَةِ. نِقَاطُهُ فِيهَا: ${N(end.points)}.`);
    }
    if (matchOver) endMsg += score.me > score.ai ? ' 🎉 وَفُزْتَ بِالْمُبَارَاةِ!' : ' فَازَ الْحَاسُوبُ بِالْمُبَارَاةِ.';
  }

  return (
    <div className="gamebox domino-game">
      <div className="gbar">
        <div className="scorebox">
          {ar('أَنْتَ')} <b>{N(score.me)}</b> — <b>{N(score.ai)}</b> {ar('الْحَاسُوبُ')} <span className="muted">({ar('إِلَى')} {N(D.TARGET)})</span>
        </div>
        <div className="chip-row">
          <span className="chip static">{ar('الْكَوْمَةُ')}: {N(r.pile.length)}</span>
          <button className="chip" onClick={() => { setScore({ me: 0, ai: 0 }); counted.current = false; const n = D.newRound(); setR(n); setEnd(null); setSel(null); setMsg(firstMsg(n)); }}>
            {ar('مُبَارَاةٌ جَدِيدَةٌ')}
          </button>
        </div>
      </div>

      <div className="opp-hand" dir="ltr" aria-label={ar('أَحْجَارُ الْحَاسُوبِ')}>
        {end
          ? r.hands.ai.map((t, i) => <Tile key={i} a={t[0]} b={t[1]} vertical size={20} />)
          : r.hands.ai.map((_, i) => <span key={i} className="tile-back" />)}
      </div>

      <div className="gmsg" role="status">
        {ar(end ? endMsg : msg)}
      </div>

      <div className="table-felt">
        <Chain chain={r.chain} targets={targets} onEnd={(side) => sel && play(sel, side)} />
      </div>

      <div className="hand mine" dir="ltr" aria-label={ar('أَحْجَارُكَ')}>
        {r.hands.me.map((t) => {
          const ok = playable.includes(t);
          return (
            <button key={t.join()} className={'tile-btn' + (ok ? ' ok' : '') + (sel === t ? ' sel' : '')} onClick={() => choose(t)} disabled={!mine} aria-label={tileName(t)}>
              <Tile a={t[0]} b={t[1]} vertical size={32} />
            </button>
          );
        })}
      </div>
      <div className="row center">
        {mine && !playable.length && r.pile.length > 0 && (
          <button className="btn" onClick={drawOne}>
            {ar('اسْحَبْ مِنَ الْكَوْمَةِ')}
          </button>
        )}
        {mine && !playable.length && !r.pile.length && (
          <button className="btn" onClick={passTurn}>
            {ar('پَاس')}
          </button>
        )}
        {end && (
          <button className="btn" onClick={nextRound}>
            {ar(matchOver ? 'مُبَارَاةٌ جَدِيدَةٌ' : 'الْجَوْلَةُ التَّالِيَةُ')}
          </button>
        )}
      </div>
      {mine && <p className="hint">{ar('الْأَحْجَارُ الْمُضِيئَةُ تُطَابِقُ أَحَدَ الطَّرَفَيْنِ.')}</p>}
    </div>
  );
}
