import { useEffect, useRef, useState } from 'react';
import { useAr, addWin, num } from '../lib.js';
import { Die } from '../components/Bits.jsx';
import * as T from './tawla.js';

// ---------- رسم اللوح (SVG) ----------
// viewBox 0 0 300 236. بيت اللاعب (٠–٥) في الربع الأسفل الأيمن.
const W = 20; // عرض البيت
const L = 6; // بداية النصف الأيسر
const R = 146; // بداية النصف الأيمن (بعد البار)
const BAR = [126, 146];
const TRAY = 272;
const TOP = 6;
const BOT = 230;
const LEN = 92; // طول المثلث

function pointX(i) {
  if (i <= 5) return R + (5 - i) * W;
  if (i <= 11) return L + (11 - i) * W;
  if (i <= 17) return L + (i - 12) * W;
  return R + (i - 18) * W;
}
const isTop = (i) => i >= 12;

function Checker({ x, y, side, n, glow }) {
  return (
    <g>
      <circle cx={x} cy={y} r="8.6" className={'chk ' + (side === 1 ? 'me' : 'ai') + (glow ? ' glow' : '')} />
      <circle cx={x} cy={y} r="5" className={'chk-ring ' + (side === 1 ? 'me' : 'ai')} />
      {n ? (
        <text x={x} y={y + 3.4} className={'chk-n ' + (side === 1 ? 'me' : 'ai')} textAnchor="middle">
          {n}
        </text>
      ) : null}
    </g>
  );
}

function Stack({ i, v, glow }) {
  const side = v > 0 ? 1 : -1;
  const n = Math.abs(v);
  const x = pointX(i) + W / 2;
  const shown = Math.min(n, 5);
  return Array.from({ length: shown }, (_, k) => {
    const y = isTop(i) ? TOP + 9 + k * 17 : BOT - 9 - k * 17;
    return <Checker key={k} x={x} y={y} side={side} n={k === shown - 1 && n > 5 ? n : 0} glow={glow && k === shown - 1} />;
  });
}

export function TawlaBoard({ s, sources = [], targets = [], sel, onPoint, onBar, onOff, labels = false }) {
  const ar = useAr();
  const src = new Set(sources.map(String));
  const tgt = new Set(targets.map(String));
  return (
    <svg className="tboard" viewBox="0 0 300 236" dir="ltr" role="img" aria-label={ar('لَوْحُ الطَّاوْلِي')}>
      <rect x="0" y="0" width="300" height="236" rx="8" className="tb-frame" />
      <rect x={L} y={TOP} width={6 * W} height={BOT - TOP} className="tb-felt" />
      <rect x={R} y={TOP} width={6 * W} height={BOT - TOP} className="tb-felt" />
      <rect x={BAR[0]} y={TOP} width={BAR[1] - BAR[0]} height={BOT - TOP} className="tb-bar" />
      <rect x={TRAY} y={TOP} width="22" height={BOT - TOP} rx="3" className={'tb-tray' + (tgt.has('off') ? ' target' : '')} onClick={onOff} />
      {labels && (
        <>
          <rect x={R} y={TOP} width={6 * W} height={BOT - TOP} className="tb-home" />
          <text x={R + 3 * W} y={BOT - LEN - 8} textAnchor="middle" className="tb-label">{ar('بَيْتُكَ')}</text>
          <text x={R + 3 * W} y={TOP + LEN + 16} textAnchor="middle" className="tb-label">{ar('الْبِدَايَةُ')}</text>
          <text x={L + 3 * W} y={TOP + LEN + 16} textAnchor="middle" className="tb-arrow">{'←  ←  ←'}</text>
          <text x={L + 3 * W} y={BOT - LEN - 8} textAnchor="middle" className="tb-arrow">{'→  →  →'}</text>
          <text x={TRAY + 11} y={BOT - LEN - 8} textAnchor="middle" className="tb-arrow">{'⇥'}</text>
        </>
      )}
      {Array.from({ length: 24 }, (_, i) => {
        const x = pointX(i);
        const top = isTop(i);
        const d = top ? `M${x} ${TOP} L${x + W} ${TOP} L${x + W / 2} ${TOP + LEN} Z` : `M${x} ${BOT} L${x + W} ${BOT} L${x + W / 2} ${BOT - LEN} Z`;
        const t = tgt.has(String(i));
        return (
          <g key={i} onClick={() => onPoint?.(i)} className={'tb-pt' + (onPoint ? ' click' : '')}>
            <rect x={x} y={top ? TOP : BOT - LEN - 8} width={W} height={LEN + 8} fill="transparent" />
            <path d={d} className={'tri ' + (i % 2 ? 'a' : 'b') + (t ? ' target' : '') + (String(sel) === String(i) ? ' sel' : '')} />
            {s.pts[i] !== 0 && <Stack i={i} v={s.pts[i]} glow={src.has(String(i))} />}
          </g>
        );
      })}
      {/* البار: قطعك المضروبة في الأسفل، وقطع الحاسوب في الأعلى */}
      <g onClick={onBar} className={onBar ? 'click' : ''}>
        {s.bar[1] > 0 && <Checker x={136} y={150} side={1} n={s.bar[1] > 1 ? s.bar[1] : 0} glow={src.has('bar')} />}
        {s.bar[-1] > 0 && <Checker x={136} y={86} side={-1} n={s.bar[-1] > 1 ? s.bar[-1] : 0} />}
      </g>
      {/* القطع الخارجة */}
      {Array.from({ length: s.off[1] }, (_, k) => (
        <rect key={'m' + k} x={TRAY + 3} y={BOT - 6 - k * 6} width="16" height="4.6" rx="1.5" className="off me" />
      ))}
      {Array.from({ length: s.off[-1] }, (_, k) => (
        <rect key={'a' + k} x={TRAY + 3} y={TOP + 1.4 + k * 6} width="16" height="4.6" rx="1.5" className="off ai" />
      ))}
    </svg>
  );
}

// ---------- مستكشف الزار ----------
export function TawlaExplorer() {
  const ar = useAr();
  const [dice, setDice] = useState([6, 5]);
  const [spin, setSpin] = useState(0);
  const double = dice[0] === dice[1];
  return (
    <div className="explorer">
      <h3 className="ex-title">{ar('اللَّوْحُ: مِنْ أَيْنَ تَبْدَأُ وَإِلَى أَيْنَ تَذْهَبُ؟')}</h3>
      <TawlaBoard s={T.newGame()} labels />
      <p className="hint">{ar('قِطَعُكَ فَاتِحَةُ اللَّوْنِ. تَمْشِي بِعَكْسِ قِطَعِ الْخَصْمِ حَتَّى تَصِلَ إِلَى بَيْتِكَ، ثُمَّ تَخْرُجُ إِلَى الصُّنْدُوقِ عَلَى الْيَمِينِ.')}</p>

      <h3 className="ex-title">{ar('ارْمِ الزَّارَ وَتَعَلَّمِ اسْمَ الرَّمْيَةِ')}</h3>
      <div className="dice-demo">
        <div className="dice-row" key={spin}>
          <Die n={dice[0]} size={64} className="roll" />
          <Die n={dice[1]} size={64} className="roll" />
        </div>
        <div className="roll-name">{ar(T.rollName(...dice))}</div>
        <div className="roll-explain">
          {double
            ? ar(`رَقْمَانِ مُتَسَاوِيَانِ: تَلْعَبُ ${'٠١٢٣٤٥٦'[dice[0]]} أَرْبَعَ مَرَّاتٍ.`)
            : ar(`تُحَرِّكُ ${'٠١٢٣٤٥٦'[dice[0]]} خُطُوَاتٍ وَ${'٠١٢٣٤٥٦'[dice[1]]} خُطُوَاتٍ: بِقِطْعَةٍ وَاحِدَةٍ أَوْ بِقِطْعَتَيْنِ.`)}
        </div>
        <button className="btn" onClick={() => { setDice(T.roll()); setSpin(spin + 1); }}>
          🎲 {ar('ارْمِ الزَّارَ')}
        </button>
      </div>
      <div className="die-names">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div key={n} className="die-name">
            <Die n={n} size={40} />
            <b>{ar(T.DIE_NAMES[n])}</b>
            <span>{num(n)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- اللعبة ضد الحاسوب ----------
export function TawlaGame() {
  const ar = useAr();
  const [s, setS] = useState(T.newGame);
  const [phase, setPhase] = useState('roll'); // roll | move | ai | over
  const [dice, setDice] = useState(null); // الرمية [a,b]
  const [left, setLeft] = useState([]); // الأرقام الباقية
  const [sel, setSel] = useState(null);
  const [start, setStart] = useState(null); // للتراجع: {s, left}
  const [msg, setMsg] = useState('اضْغَطْ «ارْمِ الزَّارَ» لِتَبْدَأَ. قِطَعُكَ هِيَ الْفَاتِحَةُ.');
  const [score, setScore] = useState({ me: 0, ai: 0 });
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));

  const moves = phase === 'move' ? T.legalFirst(s, 1, left) : [];
  const sources = [...new Set(moves.map((m) => m.from))];
  const targets = sel !== null ? moves.filter((m) => String(m.from) === String(sel)).map((m) => m.to) : [];

  function finish(st, side) {
    const w = T.winner(st);
    if (!w) return false;
    const mars = T.isMars(st, w);
    const pts = mars ? 2 : 1;
    setScore((x) => (w === 1 ? { ...x, me: x.me + pts } : { ...x, ai: x.ai + pts }));
    if (w === 1) addWin('tawla');
    setMsg(w === 1 ? (mars ? 'مَارِس! فُزْتَ فَوْزًا مُضَاعَفًا 🎉' : 'غْلَبْتَه! فُزْتَ عَلَى الْحَاسُوبِ 🎉') : mars ? 'مَارِس! فَازَ الْحَاسُوبُ فَوْزًا مُضَاعَفًا.' : 'فَازَ الْحَاسُوبُ هَذِهِ الْمَرَّةَ. نْعِيدْهَا؟');
    setPhase('over');
    setDice(null);
    return true;
  }

  function rollMine() {
    const d = T.roll();
    const l = T.diceList(d);
    setDice(d);
    setLeft(l);
    setStart({ s, left: l });
    setSel(null);
    const can = T.legalFirst(s, 1, l).length > 0;
    if (!can) {
      setMsg(`${T.rollName(...d)}: لَا تُوجَدُ نَقْلَةٌ مُمْكِنَةٌ. الدَّوْرُ لِلْحَاسُوبِ.`);
      setPhase('ai');
      later(() => aiPlay(s), 1300);
    } else {
      setMsg(`${T.rollName(...d)}! اخْتَرْ قِطْعَةً مُضِيئَةً ثُمَّ مَكَانًا لَهَا.`);
      setPhase('move');
    }
  }

  function moveTo(to) {
    const m = moves.find((x) => String(x.from) === String(sel) && String(x.to) === String(to));
    if (!m) return;
    const n = T.apply(s, 1, { ...m });
    const k = left.indexOf(m.die);
    const rest = [...left.slice(0, k), ...left.slice(k + 1)];
    setS(n);
    setLeft(rest);
    setSel(null);
    if (finish(n, 1)) return;
    const more = rest.length && T.legalFirst(n, 1, rest).length;
    if (!more) {
      setPhase('ai');
      setMsg('الدَّوْرُ لِلْحَاسُوبِ…');
      later(() => aiPlay(n), 900);
    }
  }

  function aiPlay(st) {
    const d = T.roll();
    setDice(d);
    setLeft(T.diceList(d));
    const r = T.aiTurn(st, -1, T.diceList(d));
    if (!r.moves.length) {
      setMsg(`الْحَاسُوبُ: ${T.rollName(...d)}، وَلَا نَقْلَةَ لَهُ. دَوْرُكَ!`);
      later(() => setPhase('roll'), 600);
      return;
    }
    setMsg(`الْحَاسُوبُ رَمَى: ${T.rollName(...d)}`);
    let cur = st;
    let used = [];
    r.moves.forEach((m, k) => {
      later(() => {
        cur = T.apply(cur, -1, { ...m });
        used = [...used, m.die];
        setS(cur);
        const rest = [...T.diceList(d)];
        used.forEach((u) => rest.splice(rest.indexOf(u), 1));
        setLeft(rest);
        if (k === r.moves.length - 1) {
          if (!finish(cur, -1)) {
            setPhase('roll');
            setMsg(m.hit || r.moves.some((x) => x.hit) ? 'ضَرَبَ الْحَاسُوبُ قِطْعَتَكَ! أَدْخِلْهَا مِنْ جَدِيدٍ. دَوْرُكَ.' : 'دَوْرُكَ: ارْمِ الزَّارَ.');
          }
        }
      }, 700 + k * 650);
    });
  }

  const undo = () => {
    if (!start || phase !== 'move') return;
    setS(start.s);
    setLeft(start.left);
    setSel(null);
  };
  const reset = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setS(T.newGame());
    setPhase('roll');
    setDice(null);
    setLeft([]);
    setSel(null);
    setMsg('اضْغَطْ «ارْمِ الزَّارَ» لِتَبْدَأَ. قِطَعُكَ هِيَ الْفَاتِحَةُ.');
  };

  const pick = (from) => {
    if (phase !== 'move') return;
    if (sel !== null && targets.map(String).includes(String(from))) return moveTo(from);
    setSel(sources.map(String).includes(String(from)) ? from : null);
  };

  // كم بقي من كل زار؟ (لإظهار الزار المستعمل باهتًا)
  const shown = dice ? (dice[0] === dice[1] ? [dice[0], dice[0], dice[0], dice[0]] : dice) : [];
  const remaining = [...left];
  const diceView = shown.map((n) => {
    const k = remaining.indexOf(n);
    if (k >= 0) {
      remaining.splice(k, 1);
      return { n, used: false };
    }
    return { n, used: true };
  });

  return (
    <div className="gamebox tawla-game">
      <div className="gbar">
        <div className="scorebox">
          {ar('أَنْتَ')} <b>{num(score.me)}</b> — <b>{num(score.ai)}</b> {ar('الْحَاسُوبُ')}
        </div>
        <div className="chip-row">
          <button className="chip" onClick={undo} disabled={phase !== 'move' || !start || start.s === s}>
            ↶ {ar('تَرَاجَعْ')}
          </button>
          <button className="chip" onClick={reset}>
            {ar('لُعْبَةٌ جَدِيدَةٌ')}
          </button>
        </div>
      </div>
      <div className={'gmsg' + (phase === 'over' ? ' big' : '')} role="status">
        {ar(msg)}
      </div>
      <TawlaBoard
        s={s}
        sources={phase === 'move' && sel === null ? sources : []}
        targets={targets}
        sel={sel}
        onPoint={pick}
        onBar={() => pick('bar')}
        onOff={() => sel !== null && targets.includes('off') && moveTo('off')}
      />
      <div className="tawla-controls">
        <div className="dice-row small" aria-live="polite">
          {diceView.map((d, i) => (
            <Die key={i + '-' + d.n + (dice || []).join()} n={d.n} size={40} dim={d.used} className={phase === 'ai' ? 'ai' : 'roll'} />
          ))}
        </div>
        {phase === 'roll' && (
          <button className="btn" onClick={rollMine}>
            🎲 {ar('ارْمِ الزَّارَ')}
          </button>
        )}
        {phase === 'move' && targets.includes('off') && (
          <button className="btn" onClick={() => moveTo('off')}>
            {ar('شِيلِ الْقِطْعَةَ ⇦')}
          </button>
        )}
        {phase === 'over' && (
          <button className="btn" onClick={reset}>
            {ar('نْعِيدْهَا؟ لُعْبَةٌ جَدِيدَةٌ')}
          </button>
        )}
      </div>
    </div>
  );
}
