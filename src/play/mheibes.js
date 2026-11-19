// منطق لعبة المحيبس (بلا واجهة).
// لكل فريق خمسة لاعبين، ولكل لاعب يدان: اليد رقم player*2 + side (side 0 = اليمنى، 1 = اليسرى).

export const PLAYERS = 5;
export const HANDS = PLAYERS * 2;
export const TARGET = 7; // في المقهى يلعبون عادةً إلى ثلاث عشرة؛ هنا إلى سبع
export const SEARCH_SECONDS = 60; // في المقهى عشر دقائق؛ هنا دقيقة

export const AI_NAMES = ['حَسُّون', 'أَبُو عَلِي', 'مُصْطَفَى', 'كَرِيم', 'عَبَّاس'];
export const MY_NAMES = ['أَنْتَ', 'سَيِّد جَاسِم', 'عُمَر', 'حَيْدَر', 'أَبُو سَلَام'];

export const LEVELS = {
  easy: { name: 'سَهْل', tell: 0.5, falseTell: 0.04, sense: 0.45, stopAt: [1, 2] },
  hard: { name: 'صَعْب', tell: 0.22, falseTell: 0.1, sense: 0.75, stopAt: [2, 3] },
};

export const playerOf = (hand) => Math.floor(hand / 2);
export const sideOf = (hand) => hand % 2; // 0 يمنى، 1 يسرى
export const randomHand = (n = HANDS) => Math.floor(Math.random() * n);

/**
 * تعابير الوجوه في لحظة ما.
 * صاحب المحبس «يفضحه» وجهه أحيانًا: عرق على جبينه، أو نظرة إلى اليد التي فيها المحبس.
 * وبقية اللاعبين يرمشون ويبتسمون، وأحيانًا يبدو أحدهم قلقًا بلا سبب (خدعة).
 */
export function faces(ring, opened, level, players = PLAYERS) {
  const L = LEVELS[level];
  return Array.from({ length: players }, (_, p) => {
    const inGame = !opened.has(p * 2) || !opened.has(p * 2 + 1);
    if (!inGame) return { mood: 'calm' }; // يداه مفتوحتان: لم يعد في اللعبة
    const holder = playerOf(ring) === p;
    const r = Math.random();
    if (holder && r < L.tell) {
      return Math.random() < 0.5 ? { mood: 'sweat' } : { mood: 'glance', side: sideOf(ring) };
    }
    if (!holder && r < L.falseTell) {
      return Math.random() < 0.5 ? { mood: 'sweat' } : { mood: 'glance', side: Math.random() < 0.5 ? 0 : 1 };
    }
    const r2 = Math.random();
    if (r2 < 0.12) return { mood: 'blink' };
    if (r2 < 0.2) return { mood: 'smile' };
    if (r2 < 0.25) return { mood: 'brow' };
    return { mood: 'calm' };
  });
}

/**
 * خطوة واحدة للنازل الحاسوبي: يفتح يدًا يظنّها فارغة، أو يختار اليد التي فيها المحبس.
 * «فراسته» (sense) تجعله يتجنّب يد المحبس حين يفتح الأيدي، وتقرّبه منها حين يختار.
 * يعيد { act: 'open' | 'pick', hand }.
 */
export function aiStep(ring, opened, level, stopAt) {
  const L = LEVELS[level];
  const left = [...Array(HANDS).keys()].filter((h) => !opened.has(h));
  if (left.length <= stopAt) {
    // الاختيار الأخير
    const right = Math.random() < 1 / left.length + (1 - 1 / left.length) * L.sense * 0.5;
    const others = left.filter((h) => h !== ring);
    return { act: 'pick', hand: right || !others.length ? ring : others[Math.floor(Math.random() * others.length)] };
  }
  // فتح يد: احتمال أن يفتح يد المحبس أقلّ من الحظّ وحده
  const pRing = (1 / left.length) * (1 - L.sense);
  if (Math.random() < pRing) return { act: 'open', hand: ring };
  const others = left.filter((h) => h !== ring);
  return { act: 'open', hand: others[Math.floor(Math.random() * others.length)] };
}

export const pickStop = (level) => {
  const [a, b] = LEVELS[level].stopAt;
  return a + Math.floor(Math.random() * (b - a + 1));
};
