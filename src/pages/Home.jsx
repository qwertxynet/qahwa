import { TOPICS, QUIZZES, img, GAME_IDS, byId } from '../data/topics.js';
import { useAr, useStore, href, num } from '../lib.js';
import { Star, Divider, Corners } from '../components/Ornament.jsx';
import { TopicIcon, Photo } from '../components/Bits.jsx';
import { badges } from '../badges.js';

export default function Home() {
  const ar = useAr();
  const store = useStore();
  const earned = badges(store);

  return (
    <>
      <section className="hero">
        <Corners />
        <div className="hero-text">
          <Star size={48} className="hero-star" />
          <h1 className="ruqaa">{ar('أَلْعَابُ الْمَقْهَى')}</h1>
          <p className="hero-sub">{ar('الشِّطْرَنْجُ وَالطَّاوْلِي وَالدُّومِينُو فِي الْمَقْهَى الْعِرَاقِيِّ')}</p>
          <p className="lead">{ar('تَعَالَ نَجْلِسْ فِي مَقْهًى بَغْدَادِيٍّ: نَشْرَبُ الچَايَ، وَنَتَعَلَّمُ كَلِمَاتِ الْمَقْهَى، وَنَلْعَبُ!')}</p>
          <div className="steps">
            <span><b>١</b>{ar('اقْرَأْ')}</span>
            <span><b>٢</b>{ar('تَعَلَّمْ')}</span>
            <span><b>٣</b>{ar('الْعَبْ')}</span>
          </div>
        </div>
        <Photo id="shahbandar" className="hero-photo" />
      </section>

      <Divider />
      <h2 className="section-title">{ar('ادْخُلِ الْمَقْهَى')}</h2>
      <div className="cards">
        {TOPICS.map((t) => {
          const known = store.known?.[t.id]?.length || 0;
          const read = store.story?.[t.id];
          return (
            <a key={t.id} className="pcard" href={href('t', t.id)}>
              <div className="pcard-img">
                <img src={img(t.image, true)} alt="" loading="lazy" />
                <span className="pcard-icon">
                  <TopicIcon name={t.icon} size={26} />
                </span>
                {read && (
                  <span className="seal" title={ar('قَرَأْتَ الْحِكَايَةَ')}>
                    ✓
                  </span>
                )}
              </div>
              <div className="pcard-body">
                <div className="pcard-title">{ar(t.title)}</div>
                <div className="pcard-iq">
                  {ar('فِي الْمَقْهَى')}: «{ar(t.iq)}»
                </div>
                <div className="pcard-tag">{ar(t.tagline)}</div>
                <div className="meter" aria-hidden="true">
                  <i style={{ width: `${(known / t.vocab.length) * 100}%` }} />
                </div>
                <div className="meter-label">
                  {ar('الْمُفْرَدَاتُ')}: {num(known)} / {num(t.vocab.length)}
                </div>
              </div>
            </a>
          );
        })}
      </div>

      <Divider />
      <h2 className="section-title">{ar('الْعَبْ ضِدَّ الْحَاسُوبِ')}</h2>
      <div className="games-grid three">
        {GAME_IDS.map((id) => (
          <a key={id} className="gcard" href={href('t', id, 'play')}>
            <span className="gicon">
              <TopicIcon name={byId[id].icon} size={30} />
            </span>
            <span className="gtitle">{ar(byId[id].title)}</span>
            <span className="gdesc">{ar('لُعْبَةٌ كَامِلَةٌ ضِدَّ الْحَاسُوبِ')}</span>
            {store.wins?.[id] > 0 && <span className="gdone">✓ {num(store.wins[id])}</span>}
          </a>
        ))}
      </div>

      <Divider />
      <h2 className="section-title">{ar('اخْتَبِرْ نَفْسَكَ')}</h2>
      <div className="games-grid">
        {QUIZZES.map((q) => (
          <a key={q.id} className="gcard" href={href('quiz', q.id)}>
            <span className="gicon">{q.icon}</span>
            <span className="gtitle">{ar(q.title)}</span>
            <span className="gdesc">{ar(q.desc)}</span>
            {store.games?.[`${q.id}:all`] && <span className="gdone">✓</span>}
          </a>
        ))}
      </div>

      <Divider />
      <h2 className="section-title">{ar('شَارَاتِي')}</h2>
      <div className="badges">
        {earned.map((b) => (
          <div key={b.id} className={'badge' + (b.got ? ' got' : '')}>
            <div className="badge-medal">
              <Star size={34} />
            </div>
            <div className="badge-name">{ar(b.name)}</div>
            <div className="badge-how">{ar(b.how)}</div>
          </div>
        ))}
      </div>
    </>
  );
}
