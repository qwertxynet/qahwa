import { useEffect, useRef, useState } from 'react';
import { useAr, addWin, num } from '../lib.js';
import { Piece } from '../components/Bits.jsx';
import * as C from './chess.js';

const NAMES = { k: 'الشَّاه (الْمَلِك)', q: 'الْوَزِير', r: 'الرُّخّ', b: 'الْفِيل', n: 'الْحِصَان', p: 'الْجُنْدِيّ' };
const HOW = {
  k: 'خَانَةً وَاحِدَةً فِي أَيِّ اتِّجَاهٍ.',
  q: 'مُسْتَقِيمًا أَوْ مَائِلًا، مَهْمَا كَانَتِ الْمَسَافَةُ.',
  r: 'مُسْتَقِيمًا: إِلَى الْأَمَامِ وَالْخَلْفِ وَالْجَانِبَيْنِ.',
  b: 'مَائِلًا فَقَطْ، مَهْمَا كَانَتِ الْمَسَافَةُ.',
  n: 'قَفْزًا عَلَى شَكْلِ زَاوِيَةٍ: خَانَتَيْنِ ثُمَّ خَانَةً جَانِبًا، وَيَقْفِزُ فَوْقَ الْقِطَعِ.',
  p: 'إِلَى الْأَمَامِ خَانَةً (أَوْ خَانَتَيْنِ مِنْ مَكَانِهِ الْأَوَّلِ)، وَيَأْكُلُ مَائِلًا (×).',
};
export const PIECE_NAMES = NAMES;

/** رقعة عامة: cells = مصفوفة ٦٤ قطعة، marks = {index: 'move'|'cap'|'sel'|'last'|'check'} */
export function Board({ cells, marks = {}, onCell, label }) {
  return (
    <div className="cboard" dir="ltr" role="grid" aria-label={label}>
      {cells.map((p, i) => {
        const dark = ((i >> 3) + (i & 7)) % 2 === 1;
        const m = marks[i];
        return (
          <button
            key={i}
            className={'csq ' + (dark ? 'd' : 'l') + (m ? ' ' + m.split(' ').map((x) => 'm-' + x).join(' ') : '')}
            onClick={() => onCell?.(i)}
            aria-label={C.squareName(i) + (p ? ' ' + p : '')}
            tabIndex={onCell ? 0 : -1}
          >
            {p && <Piece p={p} className="cpiece" />}
          </button>
        );
      })}
    </div>
  );
}

/** مستكشف الحركة: اختر قطعة وشاهد أين تستطيع أن تذهب */
export function ChessExplorer() {
  const ar = useAr();
  const [t, setT] = useState('n');
  const [sq, setSq] = useState(35);
  const piece = 'w' + t;
  const at = t === 'p' && sq < 8 ? sq + 8 : sq;
  const { moves, captures } = C.reach(piece, at);
  const cells = Array(64).fill(null);
  cells[at] = piece;
  const marks = {};
  moves.forEach((i) => (marks[i] = 'move'));
  captures.forEach((i) => (marks[i] = (marks[i] ? marks[i] + ' ' : '') + 'cap'));
  return (
    <div className="explorer">
      <h3 className="ex-title">{ar('جَرِّبْ: كَيْفَ تَمْشِي الْقِطَعُ؟')}</h3>
      <div className="chip-row center" role="group" aria-label={ar('اخْتَرْ قِطْعَةً')}>
        {['k', 'q', 'r', 'b', 'n', 'p'].map((x) => (
          <button key={x} className={'chip piece-chip' + (t === x ? ' on' : '')} onClick={() => { setT(x); if (x === 'p') setSq(52); }}>
            <Piece p={'w' + x} size={26} /> {ar(NAMES[x])}
          </button>
        ))}
      </div>
      <p className="ex-how">
        <b>{ar(NAMES[t])}</b> {ar('يَمْشِي')} {ar(HOW[t])}
      </p>
      <Board cells={cells} marks={marks} onCell={(i) => setSq(i)} label={ar('رُقْعَةُ التَّجْرِبَةِ')} />
      <p className="hint">{ar('اضْغَطْ عَلَى أَيِّ خَانَةٍ لِتَنْقُلَ الْقِطْعَةَ إِلَيْهَا.')}</p>
    </div>
  );
}

const LEVELS = [
  [1, 'سَهْل'],
  [2, 'مُتَوَسِّط'],
  [3, 'صَعْب'],
];

/** لعبة شطرنج كاملة ضد الحاسوب. أنت بالأبيض. */
export function ChessGame() {
  const ar = useAr();
  const [level, setLevel] = useState(1);
  const [s, setS] = useState(C.newGame);
  const [hist, setHist] = useState([]);
  const [sel, setSel] = useState(null);
  const [thinking, setThinking] = useState(false);
  const [lost, setLost] = useState({ w: [], b: [] });
  const won = useRef(false);

  const st = C.status(s);
  const over = st !== 'play';

  useEffect(() => {
    if (s.turn !== 'b' || over) return;
    setThinking(true);
    const id = setTimeout(() => {
      const m = C.bestMove(s, level);
      if (m) {
        if (m.cap) setLost((l) => ({ ...l, w: [...l.w, m.cap] }));
        setS(C.play(s, m));
      }
      setThinking(false);
    }, 450);
    return () => clearTimeout(id);
  }, [s, level, over]);

  useEffect(() => {
    if (st === 'mate' && s.turn === 'b' && !won.current) {
      won.current = true;
      addWin('chess');
    }
  }, [st, s.turn]);

  const legal = sel !== null ? C.legalMoves(s, sel) : [];
  const click = (i) => {
    if (s.turn !== 'w' || over) return;
    const m = legal.find((x) => x.to === i);
    if (m) {
      setHist([...hist, { s, lost }]);
      if (m.cap) setLost((l) => ({ ...l, b: [...l.b, m.cap] }));
      setS(C.play(s, m));
      setSel(null);
      return;
    }
    setSel(s.board[i]?.[0] === 'w' && i !== sel ? i : null);
  };
  const reset = () => {
    setS(C.newGame());
    setHist([]);
    setSel(null);
    setLost({ w: [], b: [] });
    won.current = false;
  };
  const undo = () => {
    const h = hist[hist.length - 1];
    if (!h) return;
    setS(h.s);
    setLost(h.lost);
    setHist(hist.slice(0, -1));
    setSel(null);
  };

  const marks = {};
  if (s.last) {
    marks[s.last.from] = 'last';
    marks[s.last.to] = 'last';
  }
  if (C.inCheck(s, s.turn)) marks[s.board.indexOf(s.turn + 'k')] = 'check';
  if (sel !== null) marks[sel] = 'sel';
  legal.forEach((m) => (marks[m.to] = (marks[m.to] ? marks[m.to] + ' ' : '') + (m.cap ? 'cap' : 'move')));

  let msg;
  if (st === 'mate') msg = s.turn === 'b' ? 'شَاه مَات! فُزْتَ عَلَى الْحَاسُوبِ 🎉' : 'شَاه مَات! فَازَ الْحَاسُوبُ هَذِهِ الْمَرَّةَ.';
  else if (st === 'stalemate' || st === 'draw') msg = 'تَعَادُل: لَا فَائِزَ.';
  else if (thinking) msg = 'الْحَاسُوبُ يُفَكِّرُ…';
  else if (C.inCheck(s, 'w')) msg = 'كِشّ! مَلِكُكَ فِي خَطَرٍ، أَنْقِذْهُ.';
  else msg = sel !== null ? 'اخْتَرِ الْخَانَةَ الَّتِي تُرِيدُهَا.' : 'دَوْرُكَ: اخْتَرْ قِطْعَةً بَيْضَاءَ.';

  return (
    <div className="gamebox chess-game">
      <div className="gbar">
        <div className="chip-row" role="group" aria-label={ar('الْمُسْتَوَى')}>
          {LEVELS.map(([v, n]) => (
            <button key={v} className={'chip' + (level === v ? ' on' : '')} onClick={() => setLevel(v)}>
              {ar(n)}
            </button>
          ))}
        </div>
        <div className="chip-row">
          <button className="chip" onClick={undo} disabled={!hist.length || thinking}>
            ↶ {ar('تَرَاجَعْ')}
          </button>
          <button className="chip" onClick={reset}>
            {ar('لُعْبَةٌ جَدِيدَةٌ')}
          </button>
        </div>
      </div>
      <div className={'gmsg' + (over ? ' big' : '')} role="status">
        {ar(msg)}
      </div>
      <Captured list={lost.w} label={ar('خَسِرْتَ')} />
      <Board cells={s.board} marks={marks} onCell={click} label={ar('رُقْعَةُ الشِّطْرَنْجِ')} />
      <Captured list={lost.b} label={ar('أَكَلْتَ')} />
      {over && (
        <div className="row center">
          <button className="btn" onClick={reset}>
            {ar('الْعَبْ مَرَّةً أُخْرَى')}
          </button>
        </div>
      )}
    </div>
  );
}

function Captured({ list, label }) {
  return (
    <div className="captured" dir="ltr">
      <span dir="rtl">{label}:</span>
      {list.map((p, i) => (
        <Piece key={i} p={p} size={22} />
      ))}
      {!list.length && <span className="muted">{num(0)}</span>}
    </div>
  );
}
