import { TOPICS, QUIZZES } from './data/topics.js';

const perfect = (g, id) => g[`${id}:all`] && g[`${id}:all`].score === g[`${id}:all`].total;

export function badges(store) {
  const g = store.games || {};
  const w = store.wins || {};
  const knownTotal = Object.values(store.known || {}).reduce((n, a) => n + a.length, 0);
  const perfects = QUIZZES.filter((q) => perfect(g, q.id)).length;
  return [
    { id: 'reader', name: 'زَائِرُ الْمَقْهَى', how: 'اقْرَأِ الْحِكَايَاتِ الْأَرْبَعَ حَتَّى النِّهَايَةِ.', got: TOPICS.every((t) => store.story?.[t.id]) },
    { id: 'words', name: 'جَامِعُ الْكَلِمَاتِ', how: 'احْفَظْ خَمْسًا وَعِشْرِينَ كَلِمَةً فِي الْبِطَاقَاتِ.', got: knownTotal >= 25 },
    { id: 'tea', name: 'مُعَلِّمُ الچَايِ', how: 'رَتِّبْ خُطُوَاتِ تَخْدِيرِ الچَايِ دُونَ خَطَأٍ.', got: perfect(g, 'tea') },
    { id: 'chess', name: 'صُولِيُّ الْمَقْهَى', how: 'اغْلِبِ الْحَاسُوبَ فِي الشِّطْرَنْجِ.', got: (w.chess || 0) > 0 },
    { id: 'tawla', name: 'سُلْطَانُ الطَّاوْلِي', how: 'اغْلِبِ الْحَاسُوبَ فِي الطَّاوْلِي.', got: (w.tawla || 0) > 0 },
    { id: 'domino', name: 'بَطَلُ الدُّومِنَة', how: 'اغْلِبِ الْحَاسُوبَ فِي مُبَارَاةِ دُومِينُو.', got: (w.domino || 0) > 0 },
    { id: 'quiz', name: 'نَجْمُ الْأَسْئِلَةِ', how: 'احْصُلْ عَلَى الْعَلَامَةِ الْكَامِلَةِ فِي ثَلَاثَةِ اخْتِبَارَاتٍ.', got: perfects >= 3 },
  ];
}
