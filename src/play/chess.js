// محرّك شطرنج صغير: توليد النقلات القانونية + خصم حاسوبي بسيط (ألفا-بيتا).
// اللوح مصفوفة من ٦٤ خانة، الخانة ٠ = a8 (أعلى اليسار من جهة الأبيض)، والخانة ٦٣ = h1.
// القطعة نصّ من حرفين: اللون (w/b) ثم النوع (k q r b n p)، مثل 'wk' أو 'bp'.

export const START = [
  'br', 'bn', 'bb', 'bq', 'bk', 'bb', 'bn', 'br',
  'bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp',
  null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null,
  'wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp',
  'wr', 'wn', 'wb', 'wq', 'wk', 'wb', 'wn', 'wr',
];

export function newGame() {
  return { board: [...START], turn: 'w', castle: { wK: true, wQ: true, bK: true, bQ: true }, ep: null, last: null };
}

const rc = (i) => [i >> 3, i & 7];
const at = (r, c) => (r < 0 || r > 7 || c < 0 || c > 7 ? -1 : r * 8 + c);
const other = (c) => (c === 'w' ? 'b' : 'w');

const KNIGHT = [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]];
const KING = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
const ROOK = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const BISHOP = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

/** الخانات التي تصل إليها قطعة من خانة ما (بلا فحص كشّ الملك) */
function pseudo(s, from, out, attacksOnly = false) {
  const b = s.board;
  const p = b[from];
  if (!p) return;
  const col = p[0];
  const t = p[1];
  const [r, c] = rc(from);
  const push = (to, extra) => out.push({ from, to, piece: p, cap: b[to], ...extra });
  const slide = (dirs) => {
    for (const [dr, dc] of dirs)
      for (let k = 1; k < 8; k++) {
        const to = at(r + dr * k, c + dc * k);
        if (to < 0) break;
        if (!b[to]) push(to);
        else {
          if (b[to][0] !== col) push(to);
          break;
        }
      }
  };
  const step = (dirs) => {
    for (const [dr, dc] of dirs) {
      const to = at(r + dr, c + dc);
      if (to >= 0 && (!b[to] || b[to][0] !== col)) push(to);
    }
  };
  if (t === 'n') step(KNIGHT);
  else if (t === 'b') slide(BISHOP);
  else if (t === 'r') slide(ROOK);
  else if (t === 'q') slide([...ROOK, ...BISHOP]);
  else if (t === 'k') {
    step(KING);
    if (!attacksOnly) castles(s, from, col, push);
  } else if (t === 'p') {
    const dir = col === 'w' ? -1 : 1;
    const last = col === 'w' ? 0 : 7;
    for (const dc of [-1, 1]) {
      const to = at(r + dir, c + dc);
      if (to < 0) continue;
      if (attacksOnly) push(to);
      else if (b[to] && b[to][0] !== col) push(to, r + dir === last ? { promo: col + 'q' } : {});
      else if (to === s.ep) push(to, { epCap: at(r, c + dc), cap: b[at(r, c + dc)] });
    }
    if (attacksOnly) return;
    const one = at(r + dir, c);
    if (one >= 0 && !b[one]) {
      push(one, r + dir === last ? { promo: col + 'q' } : {});
      const start = col === 'w' ? 6 : 1;
      const two = at(r + 2 * dir, c);
      if (r === start && !b[two]) push(two, { double: one });
    }
  }
}

function castles(s, from, col, push) {
  const b = s.board;
  const home = col === 'w' ? 60 : 4;
  if (from !== home || attacked(s, home, other(col))) return;
  if (s.castle[col + 'K'] && !b[home + 1] && !b[home + 2] && b[home + 3] === col + 'r' && !attacked(s, home + 1, other(col)) && !attacked(s, home + 2, other(col)))
    push(home + 2, { rook: [home + 3, home + 1] });
  if (s.castle[col + 'Q'] && !b[home - 1] && !b[home - 2] && !b[home - 3] && b[home - 4] === col + 'r' && !attacked(s, home - 1, other(col)) && !attacked(s, home - 2, other(col)))
    push(home - 2, { rook: [home - 4, home - 1] });
}

/** هل تهاجم قطعُ اللون by الخانةَ sq؟ */
export function attacked(s, sq, by) {
  const out = [];
  for (let i = 0; i < 64; i++) if (s.board[i] && s.board[i][0] === by) pseudo(s, i, out, true);
  return out.some((m) => m.to === sq);
}

export function inCheck(s, col) {
  const k = s.board.indexOf(col + 'k');
  return k >= 0 && attacked(s, k, other(col));
}

export function play(s, m) {
  const b = [...s.board];
  b[m.to] = m.promo || b[m.from];
  b[m.from] = null;
  if (m.epCap !== undefined) b[m.epCap] = null;
  if (m.rook) {
    b[m.rook[1]] = b[m.rook[0]];
    b[m.rook[0]] = null;
  }
  const castle = { ...s.castle };
  const col = m.piece[0];
  if (m.piece[1] === 'k') castle[col + 'K'] = castle[col + 'Q'] = false;
  for (const [sq, key] of [[63, 'wK'], [56, 'wQ'], [7, 'bK'], [0, 'bQ']]) if (m.from === sq || m.to === sq) castle[key] = false;
  return { board: b, turn: other(s.turn), castle, ep: m.double ?? null, last: m };
}

export function legalMoves(s, from) {
  const out = [];
  if (from !== undefined) pseudo(s, from, out);
  else for (let i = 0; i < 64; i++) if (s.board[i] && s.board[i][0] === s.turn) pseudo(s, i, out);
  return out.filter((m) => m.piece[0] === s.turn && !inCheck(play(s, m), s.turn));
}

/** 'play' | 'mate' | 'stalemate' | 'draw' (ملكان فقط) */
export function status(s) {
  const left = s.board.filter(Boolean);
  if (left.length === 2) return 'draw';
  if (legalMoves(s).length) return 'play';
  return inCheck(s, s.turn) ? 'mate' : 'stalemate';
}

// ---------- مستكشف الحركة (للصفحة التعليمية) ----------
/** خانات الحركة لقطعة وحدها على لوح فارغ؛ للجندي تُعاد خانات الأكل أيضًا */
export function reach(piece, sq) {
  const s = { board: Array(64).fill(null), turn: piece[0], castle: {}, ep: null };
  s.board[sq] = piece;
  const out = [];
  pseudo(s, sq, out);
  const moves = out.map((m) => m.to);
  let captures = [];
  if (piece[1] === 'p') {
    const t = [];
    pseudo(s, sq, t, true);
    captures = t.map((m) => m.to);
  }
  return { moves, captures };
}

// ---------- الخصم الحاسوبي ----------
const VAL = { p: 100, n: 300, b: 320, r: 500, q: 900, k: 0 };
// جدول بسيط يكافئ القطع في الوسط ويدفع الجنود إلى الأمام
const CENTER = Array.from({ length: 64 }, (_, i) => {
  const [r, c] = rc(i);
  return 14 - (Math.abs(3.5 - r) + Math.abs(3.5 - c)) * 4;
});

function evaluate(s) {
  let v = 0;
  for (let i = 0; i < 64; i++) {
    const p = s.board[i];
    if (!p) continue;
    const [r] = rc(i);
    let x = VAL[p[1]];
    if (p[1] === 'p') x += (p[0] === 'w' ? 6 - r : r - 1) * 8;
    else if (p[1] !== 'k') x += CENTER[i];
    v += p[0] === 'b' ? x : -x;
  }
  return v; // موجب = جيّد للأسود (الحاسوب)
}

function order(moves) {
  return moves.sort((a, b) => (b.cap ? VAL[b.cap[1]] * 10 - VAL[b.piece[1]] : 0) - (a.cap ? VAL[a.cap[1]] * 10 - VAL[a.piece[1]] : 0));
}

function search(s, depth, alpha, beta) {
  if (depth === 0) return evaluate(s);
  const moves = legalMoves(s);
  if (!moves.length) return inCheck(s, s.turn) ? (s.turn === 'b' ? -100000 - depth : 100000 + depth) : 0;
  order(moves);
  if (s.turn === 'b') {
    let best = -Infinity;
    for (const m of moves) {
      best = Math.max(best, search(play(s, m), depth - 1, alpha, beta));
      alpha = Math.max(alpha, best);
      if (alpha >= beta) break;
    }
    return best;
  }
  let best = Infinity;
  for (const m of moves) {
    best = Math.min(best, search(play(s, m), depth - 1, alpha, beta));
    beta = Math.min(beta, best);
    if (alpha >= beta) break;
  }
  return best;
}

/** يختار الحاسوب (الأسود) نقلة. level: 1 سهل، 2 متوسط، 3 صعب */
export function bestMove(s, level = 2) {
  const moves = order(legalMoves(s));
  if (!moves.length) return null;
  const depth = level === 1 ? 1 : level === 2 ? 2 : 3;
  const noise = level === 1 ? 120 : level === 2 ? 25 : 5;
  let best = null;
  let bestV = -Infinity;
  for (const m of moves) {
    const v = search(play(s, m), depth - 1, bestV - noise, Infinity) + Math.random() * noise;
    if (v > bestV) {
      bestV = v;
      best = m;
    }
  }
  return best;
}

export const squareName = (i) => 'abcdefgh'[i & 7] + (8 - (i >> 3));
