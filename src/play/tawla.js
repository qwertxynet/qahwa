// محرّك الطاولي (الطاولة/النرد) بالقواعد المعروفة دوليًّا.
// pts[0..23]: عدد القطع في كل بيت؛ موجب = قطع اللاعب (أنت)، سالب = قطع الحاسوب.
// اللاعب يتحرّك من ٢٣ نحو ٠ ويُخرج قطعه بعد ٠؛ بيته الخانات ٠–٥.
// الحاسوب يتحرّك من ٠ نحو ٢٣ ويُخرج قطعه بعد ٢٣؛ بيته الخانات ١٨–٢٣.
// side: 1 = اللاعب، -1 = الحاسوب.

export function newGame() {
  const pts = Array(24).fill(0);
  pts[23] = 2; pts[12] = 5; pts[7] = 3; pts[5] = 5;
  pts[0] = -2; pts[11] = -5; pts[16] = -3; pts[18] = -5;
  return { pts, bar: { 1: 0, '-1': 0 }, off: { 1: 0, '-1': 0 } };
}

const clone = (s) => ({ pts: [...s.pts], bar: { ...s.bar }, off: { ...s.off } });
const mine = (v, side) => v * side > 0;
const count = (v, side) => (mine(v, side) ? Math.abs(v) : 0);

/** المسافة التي تقطعها قطعة من بيت ما حتى الخروج (لعدّ النقاط "pip count") */
const dist = (i, side) => (side === 1 ? i + 1 : 24 - i);

export function allHome(s, side) {
  if (s.bar[side]) return false;
  for (let i = 0; i < 24; i++) if (mine(s.pts[i], side) && dist(i, side) > 6) return false;
  return true;
}

/** نقلة واحدة: from = 'bar' أو رقم البيت؛ to = رقم البيت أو 'off' */
export function single(s, side, from, die) {
  if (s.bar[side] && from !== 'bar') return null;
  if (from === 'bar') {
    if (!s.bar[side]) return null;
    const to = side === 1 ? 24 - die : die - 1;
    return open(s, side, to) ? { from, to, die } : null;
  }
  if (!mine(s.pts[from], side)) return null;
  const to = from - side * die;
  if (to >= 0 && to <= 23) return open(s, side, to) ? { from, to, die } : null;
  // إخراج القطعة
  if (!allHome(s, side)) return null;
  const d = dist(from, side);
  if (d === die) return { from, to: 'off', die };
  if (die > d) {
    // يجوز بالرقم الأكبر إذا لم تكن هناك قطعة أبعد
    for (let i = 0; i < 24; i++) if (mine(s.pts[i], side) && dist(i, side) > d) return null;
    return { from, to: 'off', die };
  }
  return null;
}

const open = (s, side, to) => !(s.pts[to] * side <= -2);

export function apply(s, side, m) {
  const n = clone(s);
  if (m.from === 'bar') n.bar[side]--;
  else n.pts[m.from] -= side;
  m.hit = false;
  if (m.to === 'off') n.off[side]++;
  else {
    if (n.pts[m.to] === -side) {
      n.pts[m.to] = 0;
      n.bar[-side]++;
      m.hit = true;
    }
    n.pts[m.to] += side;
  }
  return n;
}

function singles(s, side, die) {
  const out = [];
  if (s.bar[side]) {
    const m = single(s, side, 'bar', die);
    if (m) out.push(m);
    return out;
  }
  for (let i = 0; i < 24; i++) if (mine(s.pts[i], side)) {
    const m = single(s, side, i, die);
    if (m) out.push(m);
  }
  return out;
}

const key = (s) => s.pts.join(',') + '|' + s.bar[1] + ',' + s.bar[-1] + '|' + s.off[1] + ',' + s.off[-1];

/**
 * كل تسلسلات النقلات الممكنة لرمية (dice = الأرقام الباقية).
 * يطبّق القاعدة: يجب استعمال أكبر عدد ممكن من الأرقام، وإن أمكن رقم واحد فقط فالأكبر.
 * يعيد [{moves:[...], state}]
 */
export function sequences(s, side, dice) {
  const results = new Map();
  let maxLen = 0;
  const rec = (st, left, moves) => {
    let any = false;
    const tried = new Set();
    for (let k = 0; k < left.length; k++) {
      const die = left[k];
      if (tried.has(die)) continue;
      tried.add(die);
      for (const m of singles(st, side, die)) {
        any = true;
        const n = apply(st, side, { ...m });
        const rest = [...left.slice(0, k), ...left.slice(k + 1)];
        rec(n, rest, [...moves, { ...m, hit: st.pts[m.to] === -side }]);
      }
    }
    if (!any) {
      if (moves.length > maxLen) maxLen = moves.length;
      const kk = key(st) + '#' + moves.length;
      if (!results.has(kk)) results.set(kk, { moves, state: st });
    }
  };
  rec(s, dice, []);
  let list = [...results.values()].filter((r) => r.moves.length === maxLen);
  if (maxLen === 1 && dice.length === 2 && dice[0] !== dice[1]) {
    const big = Math.max(...dice);
    if (list.some((r) => r.moves[0].die === big)) list = list.filter((r) => r.moves[0].die === big);
  }
  return list;
}

/** النقلات المفردة المسموح بها الآن (أول خطوة في تسلسل كامل قانوني) */
// (لا نأخذها من sequences لأنها تحذف التسلسلات التي تنتهي إلى الوضع نفسه)
export function legalFirst(s, side, dice) {
  const memo = new Map();
  const depth = (st, left) => {
    if (!left.length) return 0;
    const k = key(st) + '/' + [...left].sort().join('');
    if (memo.has(k)) return memo.get(k);
    let best = 0;
    for (const die of new Set(left)) {
      const rest = [...left];
      rest.splice(rest.indexOf(die), 1);
      for (const m of singles(st, side, die)) {
        best = Math.max(best, 1 + depth(apply(st, side, { ...m }), rest));
        if (best === left.length) break;
      }
      if (best === left.length) break;
    }
    memo.set(k, best);
    return best;
  };
  const maxLen = depth(s, dice);
  if (!maxLen) return [];
  const out = [];
  for (const die of new Set(dice)) {
    const rest = [...dice];
    rest.splice(rest.indexOf(die), 1);
    for (const m of singles(s, side, die))
      if (1 + depth(apply(s, side, { ...m }), rest) === maxLen) out.push(m);
  }
  // إن أمكن لعب رقم واحد فقط من رقمين مختلفين، فالأكبر واجب
  if (maxLen === 1 && dice.length === 2 && dice[0] !== dice[1]) {
    const big = Math.max(...dice);
    if (out.some((m) => m.die === big)) return out.filter((m) => m.die === big);
  }
  return out;
}

export const pips = (s, side) => {
  let n = s.bar[side] * 25;
  for (let i = 0; i < 24; i++) n += count(s.pts[i], side) * dist(i, side);
  return n;
};

export function winner(s) {
  if (s.off[1] === 15) return 1;
  if (s.off[-1] === 15) return -1;
  return 0;
}
/** «مارس»: يفوز اللاعب قبل أن يُخرج خصمه أيّ قطعة — فوز مضاعف */
export const isMars = (s, w) => s.off[-w] === 0;

// ---------- الخصم الحاسوبي ----------
function score(s, side) {
  let v = (pips(s, -side) - pips(s, side)) * 1.0;
  v += s.off[side] * 4;
  v += s.bar[-side] * 14;
  // قطع الخصم: أين هي؟ (لمعرفة الخطر على القطع المكشوفة)
  const enemy = [];
  for (let i = 0; i < 24; i++) if (mine(s.pts[i], -side)) enemy.push(i);
  for (let i = 0; i < 24; i++) {
    const c = count(s.pts[i], side);
    if (c >= 2) {
      // بيت مغلق: أنفع في بيتي وأمام الخصم
      v += dist(i, side) <= 6 ? 6 : 3;
    } else if (c === 1) {
      // قطعة مكشوفة: خطرة إن كان للخصم قطع خلفها على مسافة قريبة
      let danger = 0;
      for (const e of enemy) {
        const d = side === 1 ? i - e : e - i; // الخصم يتحرك باتجاه معاكس
        const ahead = d; // المسافة من قطعة الخصم إليها
        if (ahead > 0 && ahead <= 12) danger += ahead <= 6 ? 3 : 1;
      }
      if (s.bar[-side]) danger += 2;
      v -= Math.min(danger, 8) * 2.2;
    }
  }
  return v;
}

export function aiTurn(s, side, dice) {
  const seqs = sequences(s, side, dice);
  if (!seqs.length || !seqs[0].moves.length) return { moves: [], state: s };
  let best = seqs[0];
  let bestV = -Infinity;
  for (const r of seqs) {
    const v = score(r.state, side) + Math.random() * 0.5;
    if (v > bestV) {
      bestV = v;
      best = r;
    }
  }
  return best;
}

export const roll = () => [1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6)];
export const diceList = ([a, b]) => (a === b ? [a, a, a, a] : [a, b]);

// ---------- أسماء الزهر كما تُقال في المقهى ----------
export const DIE_NAMES = { 1: 'يَك', 2: 'دُو', 3: 'سِه', 4: 'جِهَار', 5: 'بَنْج', 6: 'شِيش' };
export function rollName(a, b) {
  const [hi, lo] = a >= b ? [a, b] : [b, a];
  if (hi === lo) return 'دُو ' + DIE_NAMES[hi];
  if (hi === 6 && lo === 5) return 'شِيش بِيش';
  return DIE_NAMES[hi] + ' ' + DIE_NAMES[lo];
}
