// محرّك الدومينو (المجموعة المزدوجة-ستة، ٢٨ حجرًا) للاعبَين: أنت والحاسوب.
// الحجر [a, b]. الخط chain: مصفوفة من الأحجار بالاتجاه الصحيح، طرفاه chain[0][0] و chain[آخر][1].

export const TARGET = 51; // تنتهي المباراة حين يصل لاعب إلى ٥١ نقطة

export function allTiles() {
  const t = [];
  for (let a = 0; a <= 6; a++) for (let b = a; b <= 6; b++) t.push([a, b]);
  return t;
}

function shuffle(a) {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

export const pipsOf = (hand) => hand.reduce((n, [a, b]) => n + a + b, 0);
const same = (x, y) => (x[0] === y[0] && x[1] === y[1]) || (x[0] === y[1] && x[1] === y[0]);

/** جولة جديدة. يبدأ صاحب أكبر دُبْل (أو أكبر حجر إن لم يكن عند أحد دُبْل) ويُلعب حجره تلقائيًّا */
export function newRound() {
  const t = shuffle(allTiles());
  const hands = { me: t.slice(0, 7), ai: t.slice(7, 14) };
  const pile = t.slice(14);
  let best = null;
  for (const who of ['me', 'ai'])
    for (const x of hands[who]) {
      const v = (x[0] === x[1] ? 100 : 0) + x[0] + x[1];
      if (!best || v > best.v) best = { who, x, v };
    }
  hands[best.who] = hands[best.who].filter((x) => x !== best.x);
  return {
    hands,
    pile,
    chain: [best.x],
    turn: best.who === 'me' ? 'ai' : 'me',
    opener: best.who,
    passes: 0,
    log: [{ who: best.who, tile: best.x }],
  };
}

export function ends(r) {
  return [r.chain[0][0], r.chain[r.chain.length - 1][1]];
}

/** أين يمكن وضع الحجر؟ ['L'] أو ['R'] أو كلاهما، أو [] */
export function placements(r, tile) {
  const [L, R] = ends(r);
  const out = [];
  if (tile[0] === L || tile[1] === L) out.push('L');
  if ((tile[0] === R || tile[1] === R) && !(L === R && out.length)) out.push('R');
  return out;
}

export const canPlay = (r, who) => r.hands[who].some((t) => placements(r, t).length);

export function place(r, who, tile, side) {
  const [L, R] = ends(r);
  const chain = [...r.chain];
  if (side === 'L') chain.unshift(tile[1] === L ? [tile[0], tile[1]] : [tile[1], tile[0]]);
  else chain.push(tile[0] === R ? [tile[0], tile[1]] : [tile[1], tile[0]]);
  return {
    ...r,
    chain,
    hands: { ...r.hands, [who]: r.hands[who].filter((t) => !same(t, tile)) },
    turn: who === 'me' ? 'ai' : 'me',
    passes: 0,
    log: [...r.log, { who, tile }],
  };
}

export function draw(r, who) {
  if (!r.pile.length) return r;
  const [t, ...pile] = r.pile;
  return { ...r, pile, hands: { ...r.hands, [who]: [...r.hands[who], t] }, drew: t };
}

export function pass(r, who) {
  return { ...r, turn: who === 'me' ? 'ai' : 'me', passes: r.passes + 1, log: [...r.log, { who, pass: true }] };
}

/** null أثناء اللعب، وإلا {winner, points, blocked} */
export function result(r) {
  for (const who of ['me', 'ai'])
    if (!r.hands[who].length) {
      const o = who === 'me' ? 'ai' : 'me';
      return { winner: who, points: pipsOf(r.hands[o]), blocked: false };
    }
  if (r.passes >= 2) {
    const a = pipsOf(r.hands.me);
    const b = pipsOf(r.hands.ai);
    if (a === b) return { winner: null, points: 0, blocked: true };
    const winner = a < b ? 'me' : 'ai';
    return { winner, points: winner === 'me' ? b : a, blocked: true };
  }
  return null;
}

/** دور الحاسوب: يسحب حتى يجد حجرًا، ثم يلعب الأثقل (والدُّبْل أولًا) */
export function aiStep(r) {
  let x = r;
  while (!canPlay(x, 'ai') && x.pile.length) x = draw(x, 'ai');
  if (!canPlay(x, 'ai')) return pass(x, 'ai');
  const options = x.hands.ai
    .flatMap((t) => placements(x, t).map((side) => ({ t, side })))
    .map((o) => ({ ...o, v: o.t[0] + o.t[1] + (o.t[0] === o.t[1] ? 6 : 0) + Math.random() }));
  options.sort((a, b) => b.v - a.v);
  return place(x, 'ai', options[0].t, options[0].side);
}
