import { useEffect, useRef, useState } from 'react';
import { useAr, addWin, num } from '../lib.js';
import * as M from './mheibes.js';

const N = (n) => num(n);

// ───────── الرسوم ─────────
const LOOKS = [
  { skin: '#e2b48a', shmagh: true, mustache: true },
  { skin: '#c9905f', hair: '#2a1d12', mustache: true },
  { skin: '#d8a477', hair: '#3b2a1d', beard: true },
  { skin: '#b97d52', shmagh: true },
  { skin: '#e6bf98', hair: '#1d140c', mustache: true, beard: true },
];

/** وجه اللاعب. mood: calm | blink | smile | brow | sweat | glance (side: 0 يمنى، 1 يسرى) | win | shock */
export function Face({ mood = 'calm', side = 0, look = 0, size = 64 }) {
  const L = LOOKS[look % LOOKS.length];
  // ينظر إلى يده: يمناه تظهر على يسارنا (نحن نقابله)
  const dx = mood === 'glance' ? (side === 0 ? -2.6 : 2.6) : 0;
  const dy = mood === 'glance' ? 2.2 : 0;
  const eyesClosed = mood === 'blink';
  const browY = mood === 'brow' || mood === 'shock' ? 19 : 21.5;
  return (
    <svg className="mh-face" width={size} height={size} viewBox="0 0 60 60" aria-hidden="true">
      {L.shmagh && <path d="M8 34C8 14 18 6 30 6s22 8 22 28l-4 16H12z" fill="#f4efe6" stroke="#b5402a" strokeWidth="1.2" />}
      {L.shmagh && <path d="M10 24h40M9 30h42" stroke="#b5402a" strokeWidth="1" strokeDasharray="2 2" />}
      <ellipse cx="30" cy="32" rx="15" ry="17" fill={L.skin} />
      {L.hair && <path d="M15 27c0-11 7-16 15-16s15 5 15 16c-3-5-8-7-15-7s-12 2-15 7z" fill={L.hair} />}
      {L.shmagh && <path d="M14 22c4-6 9-8 16-8s12 2 16 8" fill="none" stroke="#1d140c" strokeWidth="2.4" />}
      {/* الحاجبان */}
      <path d={`M20 ${browY}q4-2 7 0M33 ${browY}q4-2 7 0`} stroke="#2a1d12" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {/* العينان */}
      {eyesClosed ? (
        <path d="M20 27q3.5 2 7 0M33 27q3.5 2 7 0" stroke="#2a1d12" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      ) : (
        <g>
          <ellipse cx="23.5" cy="27" rx="3.4" ry={mood === 'shock' ? 3.4 : 2.6} fill="#fff" />
          <ellipse cx="36.5" cy="27" rx="3.4" ry={mood === 'shock' ? 3.4 : 2.6} fill="#fff" />
          <circle cx={23.5 + dx * 0.5} cy={27 + dy * 0.4} r="1.6" fill="#1d140c" />
          <circle cx={36.5 + dx * 0.5} cy={27 + dy * 0.4} r="1.6" fill="#1d140c" />
        </g>
      )}
      {/* الشارب واللحية */}
      {L.beard && <path d="M16 36c2 10 8 14 14 14s12-4 14-14c-3 4-8 6-14 6s-11-2-14-6z" fill="#2a1d12" opacity=".85" />}
      {L.mustache && <path d="M23 38c3-2 5-2 7-1 2-1 4-1 7 1-3 1-5 1-7 0-2 1-4 1-7 0z" fill="#2a1d12" />}
      {/* الفم */}
      {mood === 'smile' || mood === 'win' ? (
        <path d="M25 42q5 4 10 0" stroke="#7a3022" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      ) : mood === 'sweat' ? (
        <path d="M25 43q1.7-1.5 3.4 0t3.3 0t3.3 0" stroke="#7a3022" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      ) : mood === 'shock' ? (
        <ellipse cx="30" cy="43" rx="2.6" ry="3" fill="#7a3022" />
      ) : (
        <path d="M26 43h8" stroke="#7a3022" strokeWidth="1.8" strokeLinecap="round" />
      )}
      {/* العرق */}
      {mood === 'sweat' && <path d="M45 17c2 3 3 5 3 6.5a3 3 0 0 1-6 0c0-1.5 1-3.5 3-6.5z" fill="#6fb6e8" stroke="#2d6f9e" strokeWidth=".8" />}
    </svg>
  );
}

/** قبضة مغلقة، أو كفّ مفتوحة (وفيها المحبس إن كان فيها) */
function Hand({ open, ring, side, size = 44 }) {
  const flip = side === 1 ? 'scale(-1,1) translate(-48,0)' : undefined;
  if (!open)
    return (
      <svg className="mh-hand" width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
        <g transform={flip}>
          <rect x="9" y="12" width="28" height="26" rx="10" fill="var(--hand, #d8a477)" stroke="var(--hand-line, #7a5233)" strokeWidth="1.5" />
          <path d="M16 13v8M23 12.5v8.5M30 13v8" stroke="var(--hand-line, #7a5233)" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M9 26c-4 0-5 6 0 7h8" fill="var(--hand, #d8a477)" stroke="var(--hand-line, #7a5233)" strokeWidth="1.5" />
          <rect x="13" y="37" width="20" height="9" rx="3" fill="var(--sleeve, #f4efe6)" stroke="var(--hand-line, #7a5233)" strokeWidth="1" />
        </g>
      </svg>
    );
  return (
    <svg className="mh-hand open" width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <g transform={flip}>
        <path
          d="M14 40V22c0-2 3-2 3 0v-12c0-2 3-2 3 0v10-13c0-2 3-2 3 0v13-11c0-2 3-2 3 0v13-8c0-2 3-2 3 0v14c0 6-3 10-6 12H17c-2-1-3-2-3-3z"
          fill="var(--hand, #d8a477)"
          stroke="var(--hand-line, #7a5233)"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
        <rect x="13" y="40" width="18" height="7" rx="3" fill="var(--sleeve, #f4efe6)" stroke="var(--hand-line, #7a5233)" strokeWidth="1" />
      </g>
      {ring && (
        <g className="mh-ring">
          <circle cx="23" cy="30" r="6" fill="none" stroke="#d4a017" strokeWidth="2.6" />
          <circle cx="23" cy="23.6" r="2.3" fill="#c0392b" stroke="#8a6d10" strokeWidth=".8" />
        </g>
      )}
    </svg>
  );
}

/** صفّ اللاعبين: الوجوه، وتحت كل وجه اليدان (اليسرى على يميننا لأننا نقابلهم) */
function Row({ names, faces, opened, ring, reveal, sel, onHand, showRing, looks = 0 }) {
  const ar = useAr();
  return (
    <div className="mh-row">
      {names.map((name, p) => (
        <div key={p} className={'mh-player' + (opened.has(p * 2) && opened.has(p * 2 + 1) ? ' out' : '')}>
          <Face {...(faces[p] || {})} look={p + looks} />
          <div className="mh-name">{ar(name)}</div>
          <div className="mh-hands">
            {[1, 0].map((s) => {
              const h = p * 2 + s;
              const isOpen = opened.has(h) || (reveal && h === ring);
              const label = `${ar(name)}: ${ar(s === 0 ? 'الْيَدُ الْيُمْنَى' : 'الْيَدُ الْيُسْرَى')}`;
              return (
                <button
                  key={s}
                  className={'mh-hand-btn' + (sel === h ? ' sel' : '') + (showRing && h === ring ? ' mine' : '') + (isOpen ? ' is-open' : '')}
                  onClick={() => onHand?.(h)}
                  disabled={!onHand || opened.has(h)}
                  aria-label={label}
                  aria-pressed={sel === h}
                >
                  <Hand open={isOpen} ring={h === ring && (isOpen || showRing)} side={s} />
                  <span className="mh-side">{ar(s === 0 ? 'يُمْنَى' : 'يُسْرَى')}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function useFaces(ring, opened, level, players, on) {
  const [f, setF] = useState(() => M.faces(ring, opened, level, players));
  useEffect(() => {
    if (!on) return;
    setF(M.faces(ring, opened, level, players));
    const id = setInterval(() => setF(M.faces(ring, opened, level, players)), 1100);
    return () => clearInterval(id);
  }, [ring, opened, level, players, on]);
  return f;
}

// ───────── أنت النازل: ابحث عن المحبس ─────────
function Search({ names, level, timed, onEnd, explorer }) {
  const ar = useAr();
  const players = names.length;
  const [ring] = useState(() => M.randomHand(players * 2));
  const [opened, setOpened] = useState(() => new Set());
  const [sel, setSel] = useState(null);
  const [res, setRes] = useState(null); // bat | found | miss | time
  const [left, setLeft] = useState(M.SEARCH_SECONDS);
  const [msg, setMsg] = useState(explorer ? 'انْظُرْ إِلَى الْوُجُوهِ: مَنْ يَبْدُو قَلِقًا؟ مَنْ يَنْظُرُ إِلَى يَدِهِ؟' : 'أَنْتَ النَّازِلُ! انْظُرْ إِلَى الْوُجُوهِ، ثُمَّ اخْتَرْ يَدًا.');
  const f = useFaces(ring, opened, level, players, !res);

  useEffect(() => {
    if (!timed || res) return;
    if (left <= 0) {
      finish('time');
      return;
    }
    const id = setTimeout(() => setLeft(left - 1), 1000);
    return () => clearTimeout(id);
  }, [left, res, timed]); // eslint-disable-line react-hooks/exhaustive-deps

  const finish = (r) => {
    setRes(r);
    setSel(null);
    setMsg(
      {
        bat: 'فَتَحْتَ الْيَدَ الَّتِي فِيهَا الْمِحْبَسُ، فَصَاحَ صَاحِبُهَا: «بَات!». النُّقْطَةُ لِلْفَرِيقِ الْآخَرِ.',
        found: 'أَحْسَنْتَ! وَجَدْتَ الْمِحْبَسَ بِفِرَاسَتِكَ. النُّقْطَةُ لِفَرِيقِكَ!',
        miss: 'لَا، هَذِهِ الْيَدُ فَارِغَةٌ. الْمِحْبَسُ كَانَ فِي يَدٍ أُخْرَى، وَالنُّقْطَةُ لِلْفَرِيقِ الْآخَرِ.',
        time: 'انْتَهَى الْوَقْتُ! النُّقْطَةُ لِلْفَرِيقِ الْآخَرِ.',
      }[r]
    );
    onEnd?.(r);
  };

  const open = () => {
    if (sel === null) return;
    if (sel === ring) return finish('bat');
    const n = new Set(opened);
    n.add(sel);
    setOpened(n);
    setSel(null);
    const remaining = players * 2 - n.size;
    setMsg(remaining === 1 ? 'بَقِيَتْ يَدٌ وَاحِدَةٌ مُغْلَقَةٌ. اخْتَرْهَا وَقُلْ: «الْمِحْبَسُ هُنَا!»' : `فَارِغَةٌ! بَقِيَتْ ${N(remaining)} أَيْدٍ مُغْلَقَةٍ.`);
  };
  const pick = () => sel !== null && finish(sel === ring ? 'found' : 'miss');

  return (
    <div className="mh-phase">
      {timed && !res && (
        <div className={'mh-timer' + (left <= 10 ? ' low' : '')} role="timer">
          ⏳ {N(left)} {ar('ثَانِيَةً')}
        </div>
      )}
      <Row names={names} faces={res ? f.map(() => ({ mood: res === 'bat' ? 'win' : 'calm' })) : f} opened={opened} ring={ring} reveal={!!res} sel={sel} onHand={res ? null : (h) => setSel(h === sel ? null : h)} />
      {res === 'bat' && <div className="mh-bat">{ar('بَات!')}</div>}
      <div className={'feedback ' + (res ? (res === 'found' ? 'ok' : 'no') : '')} role="status">
        <span>{ar(msg)}</span>
      </div>
      {!res && (
        <div className="row center">
          <button className="btn ghost" onClick={open} disabled={sel === null}>
            ✋ {ar('اِفْتَحْ هَذِهِ الْيَدَ (فَارِغَةٌ)')}
          </button>
          <button className="btn" onClick={pick} disabled={sel === null}>
            ☝ {ar('الْمِحْبَسُ هُنَا!')}
          </button>
        </div>
      )}
    </div>
  );
}

// ───────── فريقك يخفي: الحاسوب هو النازل ─────────
function Hide({ level, onEnd }) {
  const ar = useAr();
  const [ring, setRing] = useState(null);
  const [started, setStarted] = useState(false);
  const [opened, setOpened] = useState(() => new Set());
  const [res, setRes] = useState(null);
  const [aiSel, setAiSel] = useState(null);
  const [msg, setMsg] = useState('اخْتَرْ يَدًا مِنْ أَيْدِي فَرِيقِكَ تُخْفِي فِيهَا الْمِحْبَسَ.');
  const stop = useRef(M.pickStop(level));
  const f = useFaces(ring ?? 0, opened, level, M.PLAYERS, started && !res);
  const myFaces = started ? f : M.MY_NAMES.map(() => ({ mood: 'calm' }));

  useEffect(() => {
    if (!started || res) return;
    const id = setTimeout(() => {
      const step = M.aiStep(ring, opened, level, stop.current);
      setAiSel(step.hand);
      const who = `${M.MY_NAMES[M.playerOf(step.hand)]} (${M.sideOf(step.hand) === 0 ? 'الْيُمْنَى' : 'الْيُسْرَى'})`;
      setTimeout(() => {
        setAiSel(null);
        if (step.act === 'open') {
          if (step.hand === ring) {
            setRes('bat');
            setMsg(`النَّازِلُ قَالَ: «اِفْتَح إِيدَك!» لِـ${who}، وَفِيهَا الْمِحْبَسُ! «بَات!». النُّقْطَةُ لِفَرِيقِكَ.`);
            onEnd('bat');
          } else {
            const n = new Set(opened);
            n.add(step.hand);
            setOpened(n);
            setMsg(`النَّازِلُ: «اِفْتَح إِيدَك!» (${who}). فَارِغَةٌ.`);
          }
        } else {
          const right = step.hand === ring;
          setRes(right ? 'found' : 'miss');
          setMsg(right ? `النَّازِلُ: «الْمِحْبَس هْنَا!» وَأَشَارَ إِلَى ${who}… وَجَدَهُ! النُّقْطَةُ لِلْحَاسُوبِ.` : `النَّازِلُ: «الْمِحْبَس هْنَا!» وَأَشَارَ إِلَى ${who}… لَكِنَّهَا فَارِغَةٌ! النُّقْطَةُ لِفَرِيقِكَ.`);
          onEnd(right ? 'found' : 'miss');
        }
      }, 550);
    }, 1000);
    return () => clearTimeout(id);
  }, [started, opened, res]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="mh-phase">
      <Row
        names={M.MY_NAMES}
        faces={res ? myFaces.map(() => ({ mood: res === 'found' ? 'shock' : 'win' })) : myFaces}
        opened={opened}
        ring={ring}
        reveal={!!res}
        sel={started ? aiSel : ring}
        showRing={ring !== null}
        looks={2}
        onHand={started ? null : (h) => { setRing(h); setMsg('هَذِهِ يَدُ الْمِحْبَسِ. لَا يَرَاهَا إِلَّا أَنْتَ. اضْغَطْ «ابْدَأْ» لِيَأْتِيَ النَّازِلُ.'); }}
      />
      {res === 'bat' && <div className="mh-bat">{ar('بَات!')}</div>}
      <div className={'feedback ' + (res ? (res === 'found' ? 'no' : 'ok') : '')} role="status">
        <span>{ar(msg)}</span>
      </div>
      {!started && (
        <div className="row center">
          <button className="btn" disabled={ring === null} onClick={() => { setStarted(true); setMsg('جَاءَ النَّازِلُ وَيَنْظُرُ إِلَى وُجُوهِ فَرِيقِكَ…'); }}>
            {ar('ابْدَأْ')}
          </button>
        </div>
      )}
    </div>
  );
}

// ───────── المستكشف (في صفحة القواعد) ─────────
export function MheibesExplorer() {
  const ar = useAr();
  const [round, setRound] = useState(0);
  const [done, setDone] = useState(false);
  return (
    <div className="explorer mheibes">
      <h3 className="ex-title">{ar('جَرِّبْ: أَنْتَ النَّازِلُ')}</h3>
      <p className="hint">{ar('فِي يَدِ وَاحِدٍ مِنْ هَؤُلَاءِ الثَّلَاثَةِ مِحْبَسٌ. صَاحِبُهُ يَعْرَقُ أَحْيَانًا، أَوْ يَنْظُرُ إِلَى يَدِهِ. اخْتَرْ يَدًا ثُمَّ: افْتَحْهَا إِنْ ظَنَنْتَهَا فَارِغَةً، أَوْ قُلْ: «الْمِحْبَسُ هُنَا!».')}</p>
      <Search key={round} names={M.AI_NAMES.slice(0, 3)} level="easy" explorer onEnd={() => setDone(true)} />
      {done && (
        <div className="row center">
          <button className="chip" onClick={() => { setRound(round + 1); setDone(false); }}>
            {ar('مِنْ جَدِيدٍ')}
          </button>
        </div>
      )}
    </div>
  );
}

// ───────── المباراة ─────────
export function MheibesGame() {
  const ar = useAr();
  const [level, setLevel] = useState('easy');
  const [score, setScore] = useState({ me: 0, ai: 0 });
  const [hider, setHider] = useState(() => (Math.random() < 0.5 ? 'me' : 'ai'));
  const [round, setRound] = useState(0);
  const [result, setResult] = useState(null);
  const [intro, setIntro] = useState(true);
  const over = score.me >= M.TARGET || score.ai >= M.TARGET;

  // نتيجة الجولة: من يأخذ النقطة، ومن يخفي المحبس بعدها
  const onEnd = (r) => {
    const searcherWon = r === 'found';
    const searcher = hider === 'me' ? 'ai' : 'me';
    const winner = searcherWon ? searcher : hider;
    const sc = { ...score, [winner]: score[winner] + 1 };
    setScore(sc);
    setResult({ r, winner, nextHider: searcherWon ? searcher : hider });
    if (sc.me >= M.TARGET && sc.me > sc.ai) addWin('mheibes');
  };

  const next = () => {
    if (over) {
      setScore({ me: 0, ai: 0 });
      setHider(Math.random() < 0.5 ? 'me' : 'ai');
      setIntro(true);
    } else setHider(result.nextHider);
    setResult(null);
    setRound(round + 1);
  };
  const reset = () => {
    setScore({ me: 0, ai: 0 });
    setHider(Math.random() < 0.5 ? 'me' : 'ai');
    setResult(null);
    setIntro(true);
    setRound(round + 1);
  };

  return (
    <div className="gamebox mheibes-game">
      <div className="gbar">
        <div className="scorebox">
          {ar('فَرِيقُكَ')} <b>{N(score.me)}</b> — <b>{N(score.ai)}</b> {ar('فَرِيقُ الْحَاسُوبِ')} <span className="muted">({ar('إِلَى')} {N(M.TARGET)})</span>
        </div>
        <div className="chip-row" role="group" aria-label={ar('الْمُسْتَوَى')}>
          {Object.entries(M.LEVELS).map(([k, v]) => (
            <button key={k} className={'chip' + (level === k ? ' on' : '')} onClick={() => setLevel(k)} aria-pressed={level === k}>
              {ar(v.name)}
            </button>
          ))}
          <button className="chip" onClick={reset}>
            {ar('مُبَارَاةٌ جَدِيدَةٌ')}
          </button>
        </div>
      </div>

      {intro ? (
        <div className="mh-intro">
          <p className="gmsg">
            {ar('رُمِيَتْ قِطْعَةُ النُّقُودِ…')} {ar(hider === 'me' ? 'فَرِيقُكَ يُخْفِي الْمِحْبَسَ أَوَّلًا.' : 'فَرِيقُ الْحَاسُوبِ يُخْفِي الْمِحْبَسَ أَوَّلًا، وَأَنْتَ النَّازِلُ.')}
          </p>
          <p className="hint">{ar('فِي الْمَقْهَى يَلْعَبُونَ عَادَةً إِلَى ثَلَاثَ عَشْرَةَ نُقْطَةً، وَلِلْبَحْثِ عَشْرُ دَقَائِقَ. هُنَا نَلْعَبُ إِلَى سَبْعِ نِقَاطٍ، وَلِلْبَحْثِ دَقِيقَةٌ وَاحِدَةٌ.')}</p>
          <div className="row center">
            <button className="btn" onClick={() => setIntro(false)}>
              {ar('يَلَّا نِلْعَب!')}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="gmsg mh-role">{ar(hider === 'me' ? 'دَوْرُ فَرِيقِكَ: أَخْفِ الْمِحْبَسَ، وَالْحَاسُوبُ هُوَ النَّازِلُ.' : 'أَنْتَ النَّازِلُ: الْمِحْبَسُ فِي يَدٍ مِنْ أَيْدِي فَرِيقِ الْحَاسُوبِ.')}</div>
          {hider === 'me' ? <Hide key={round} level={level} onEnd={onEnd} /> : <Search key={round} names={M.AI_NAMES} level={level} timed onEnd={onEnd} />}
          {result && (
            <div className="row center mh-next">
              {over && <p className="gmsg big">{ar(score.me > score.ai ? '🎉 فَازَ فَرِيقُكَ بِالْمُبَارَاةِ! صِينِيَّةُ الزَّلَابِيَةِ عَلَى الْحَاسُوبِ.' : 'فَازَ فَرِيقُ الْحَاسُوبِ. صِينِيَّةُ الْبَقْلَاوَةِ عَلَيْكَ!')}</p>}
              <button className="btn" onClick={next}>
                {ar(over ? 'مُبَارَاةٌ جَدِيدَةٌ' : result.nextHider === 'me' ? 'الْجَوْلَةُ التَّالِيَةُ: فَرِيقُكَ يُخْفِي' : 'الْجَوْلَةُ التَّالِيَةُ: أَنْتَ النَّازِلُ')} ←
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
