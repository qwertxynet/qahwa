import { useEffect, useMemo, useState } from 'react';
import { TOPICS, QUIZZES, byId } from '../data/topics.js';
import { useAr, href, shuffle, sample, recordScore, num } from '../lib.js';
import { Die, Tile } from '../components/Bits.jsx';
import { VocabVisual } from '../components/Flashcards.jsx';
import { MultipleChoice, OrderSteps, Finish } from '../components/QuizKit.jsx';
import { Board, PIECE_NAMES } from '../play/Chess.jsx';
import { reach } from '../play/chess.js';
import { DIE_NAMES, rollName } from '../play/tawla.js';

const ALL = TOPICS.flatMap((t) => t.vocab.map((v) => ({ ...v, topic: t.id })));

export default function Quiz({ id }) {
  const ar = useAr();
  const q = QUIZZES.find((x) => x.id === id);
  const [round, setRound] = useState(0);
  const again = () => setRound(round + 1);
  const Q = { match: Match, meaning: Meaning, dice: DiceQuiz, piece: PieceQuiz, pips: PipsQuiz, tea: TeaQuiz }[id];
  return (
    <div className="game">
      <div className="crumbs">
        <a href={href('play')}>{ar('الْعَبْ')}</a>
        <span>›</span>
        <span>{ar(q.title)}</span>
      </div>
      <h1 className="game-title">
        <span className="gicon">{q.icon}</span> {ar(q.title)}
      </h1>
      <p className="hint">{ar(q.desc)}</p>
      <Q key={round} again={again} />
    </div>
  );
}

/** طابق الكلمة العراقية بمعناها في الفصحى */
function Match({ again }) {
  const ar = useAr();
  const [items] = useState(() => sample(ALL.filter((v) => v.iq && !v.die), 6));
  const [right] = useState(() => shuffle(items.map((_, i) => i)));
  const [sel, setSel] = useState(null);
  const [done, setDone] = useState([]);
  const [shake, setShake] = useState(null);
  const [mistakes, setMistakes] = useState(0);
  const finished = done.length === items.length;
  if (finished) {
    const score = Math.max(0, items.length - mistakes);
    return <MatchEnd score={score} total={items.length} again={again} />;
  }
  const tryMatch = (j) => {
    if (sel === null || done.includes(j)) return;
    if (sel === j) {
      setDone([...done, j]);
      setSel(null);
    } else {
      setMistakes(mistakes + 1);
      setShake(j);
      setTimeout(() => setShake(null), 450);
    }
  };
  return (
    <>
      <p className="hint">{ar('اخْتَرْ كَلِمَةً مِنَ الْمَقْهَى، ثُمَّ اخْتَرْ مَعْنَاهَا بِالْفُصْحَى.')}</p>
      <div className="match-cols">
        <div className="col words">
          {items.map((v, i) => (
            <button key={i} className={'mw' + (sel === i ? ' sel' : '') + (done.includes(i) ? ' done' : '')} onClick={() => !done.includes(i) && setSel(i)} disabled={done.includes(i)}>
              {ar(v.w)}
            </button>
          ))}
        </div>
        <div className="col">
          {right.map((j) => (
            <button key={j} className={'md' + (done.includes(j) ? ' done' : '') + (shake === j ? ' shake' : '')} onClick={() => tryMatch(j)} disabled={done.includes(j)}>
              {ar(items[j].f)}
            </button>
          ))}
        </div>
      </div>
      <p className="hint">
        {ar('الْأَخْطَاءُ')}: {num(mistakes)}
      </p>
    </>
  );
}
function MatchEnd({ score, total, again }) {
  useEffect(() => recordScore('match', 'all', score, total), [score, total]);
  return <Finish score={score} total={total} again={again} />;
}

/** ما معنى الكلمة؟ */
function Meaning({ again }) {
  const ar = useAr();
  const questions = useMemo(
    () =>
      sample(ALL, 8).map((v) => {
        const others = sample(
          ALL.filter((x) => x.f !== v.f && x.w !== v.w),
          3
        );
        const opts = shuffle([v, ...others]).map((x) => ({ key: x.f, label: ar(x.f) }));
        return {
          prompt: (
            <>
              <span className="qlabel">{ar('مَا مَعْنَى هَذِهِ الْكَلِمَةِ؟')}</span>
              <VocabVisual v={v} size={48} />
              <div className="qword">{ar(v.w)}</div>
              <span className="qlabel">{ar(byId[v.topic].title)}</span>
            </>
          ),
          options: opts,
          answer: v.f,
          explain: v.d,
        };
      }),
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );
  return <MultipleChoice questions={questions} gameId="meaning" again={again} />;
}

/** سمّ الزار */
function DiceQuiz({ again }) {
  const ar = useAr();
  const questions = useMemo(() => {
    const all = [];
    for (let a = 1; a <= 6; a++) for (let b = 1; b <= a; b++) all.push([a, b]);
    return sample(all, 8).map(([a, b]) => {
      const name = rollName(a, b);
      const wrong = sample(
        all.filter(([x, y]) => rollName(x, y) !== name),
        3
      ).map(([x, y]) => rollName(x, y));
      return {
        prompt: (
          <>
            <span className="qlabel">{ar('مَاذَا يَصِيحُ اللَّاعِبُ فِي الْمَقْهَى؟')}</span>
            <div className="dice-row">
              <Die n={a} size={56} />
              <Die n={b} size={56} />
            </div>
          </>
        ),
        options: shuffle([name, ...wrong]).map((x) => ({ key: x, label: ar(x) })),
        answer: name,
        explain: `${DIE_NAMES[a]} = ${a}، ${DIE_NAMES[b]} = ${b}`.replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]),
      };
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return <MultipleChoice questions={questions} gameId="dice" again={again} />;
}

/** من يمشي هكذا؟ */
function PieceQuiz({ again }) {
  const ar = useAr();
  const questions = useMemo(
    () =>
      shuffle(['k', 'q', 'r', 'b', 'n', 'p']).map((t) => {
        // مكان عشوائي في وسط الرقعة (والجندي في الصف الثاني ليظهر خطوتاه)
        const sq = t === 'p' ? 48 + 1 + Math.floor(Math.random() * 6) : sample([18, 19, 20, 21, 26, 27, 28, 29, 34, 35, 36, 37, 42, 43, 44, 45], 1)[0];
        const { moves, captures } = reach('w' + t, sq);
        const marks = { [sq]: 'mystery' };
        moves.forEach((i) => (marks[i] = 'move'));
        captures.forEach((i) => (marks[i] = (marks[i] ? marks[i] + ' ' : '') + 'cap'));
        return {
          prompt: (
            <>
              <span className="qlabel">{ar('الْقِطْعَةُ الْمَخْفِيَّةُ (؟) تَسْتَطِيعُ الذَّهَابَ إِلَى النِّقَاطِ. مَنْ هِيَ؟')}</span>
              <div className="mini-board">
                <Board cells={Array(64).fill(null)} marks={marks} label={ar('رُقْعَةُ السُّؤَالِ')} />
              </div>
            </>
          ),
          options: ['k', 'q', 'r', 'b', 'n', 'p'].map((x) => ({ key: x, label: ar(PIECE_NAMES[x]) })),
          answer: t,
        };
      }),
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );
  return <MultipleChoice questions={questions} gameId="piece" again={again} wide />;
}

/** عدّ نقاط أحجار الدومينو */
function PipsQuiz({ again }) {
  const ar = useAr();
  const questions = useMemo(
    () =>
      Array.from({ length: 6 }, (_, k) => {
        const n = k < 2 ? 2 : k < 4 ? 3 : 4;
        const tiles = Array.from({ length: n }, () => [Math.floor(Math.random() * 7), Math.floor(Math.random() * 7)]);
        const sum = tiles.reduce((s, [a, b]) => s + a + b, 0);
        const wrong = new Set();
        while (wrong.size < 3) {
          const d = sample([-4, -3, -2, -1, 1, 2, 3, 4, 5], 1)[0];
          if (sum + d >= 0) wrong.add(sum + d);
        }
        return {
          prompt: (
            <>
              <span className="qlabel">{ar('كَمْ مَجْمُوعُ النِّقَاطِ عَلَى هَذِهِ الْأَحْجَارِ؟ (الْأَبْيَضُ = صِفْرٌ)')}</span>
              <div className="hand" dir="ltr">
                {tiles.map((t, i) => (
                  <Tile key={i} a={t[0]} b={t[1]} vertical size={32} />
                ))}
              </div>
            </>
          ),
          options: shuffle([sum, ...wrong]).map((x) => ({ key: x, label: num(x) })),
          answer: sum,
          explain: tiles.map(([a, b]) => `${a}+${b}`).join(' + ').replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]) + ' = ' + num(sum),
        };
      }),
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );
  return <MultipleChoice questions={questions} gameId="pips" again={again} />;
}

function TeaQuiz({ again }) {
  return <OrderSteps steps={byId.cafe.teaSteps} gameId="tea" again={again} />;
}

