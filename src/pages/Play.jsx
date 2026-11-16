import { QUIZZES, GAME_IDS, byId } from '../data/topics.js';
import { useAr, useStore, href, num } from '../lib.js';
import { Divider } from '../components/Ornament.jsx';
import { TopicIcon } from '../components/Bits.jsx';

export default function Play() {
  const ar = useAr();
  const store = useStore();
  return (
    <>
      <h1 className="page-title">{ar('الْعَبْ')}</h1>
      <p className="lead center">{ar('الْعَبْ ضِدَّ الْحَاسُوبِ، أَوِ اخْتَبِرْ مَا تَعَلَّمْتَ مِنْ كَلِمَاتِ الْمَقْهَى.')}</p>
      <h2 className="section-title">{ar('أَلْعَابُ الْمَقْهَى')}</h2>
      <div className="games-grid three">
        {GAME_IDS.map((id) => (
          <a key={id} className="gcard" href={href('t', id, 'play')}>
            <span className="gicon">
              <TopicIcon name={byId[id].icon} size={30} />
            </span>
            <span className="gtitle">{ar(byId[id].title)}</span>
            <span className="gdesc">{ar(byId[id].tagline)}</span>
            {store.wins?.[id] > 0 && <span className="gdone">✓ {num(store.wins[id])}</span>}
          </a>
        ))}
      </div>
      <Divider />
      <h2 className="section-title">{ar('اخْتَبِرْ نَفْسَكَ')}</h2>
      <div className="games-grid">
        {QUIZZES.map((q) => {
          const best = store.games?.[`${q.id}:all`];
          return (
            <a key={q.id} className="gcard" href={href('quiz', q.id)}>
              <span className="gicon">{q.icon}</span>
              <span className="gtitle">{ar(q.title)}</span>
              <span className="gdesc">{ar(q.desc)}</span>
              {best && (
                <span className="gdone">
                  {num(best.score)}/{num(best.total)}
                </span>
              )}
            </a>
          );
        })}
      </div>
    </>
  );
}
