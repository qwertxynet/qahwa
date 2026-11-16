import { useEffect, useMemo } from 'react';
import { Settings, useStore, setPref, useRoute, href, useAr } from './lib.js';
import { byId, QUIZZES } from './data/topics.js';
import { TopicIcon } from './components/Bits.jsx';
import { Star } from './components/Ornament.jsx';
import Home from './pages/Home.jsx';
import Topic from './pages/Topic.jsx';
import Play from './pages/Play.jsx';
import Quiz from './pages/Quiz.jsx';
import Credits from './pages/Credits.jsx';

export default function App() {
  const store = useStore();
  const prefs = store.prefs || {};
  const settings = useMemo(() => ({ harakat: prefs.harakat !== false, size: prefs.size || 1 }), [prefs.harakat, prefs.size]);
  const { parts } = useRoute();

  useEffect(() => {
    document.documentElement.style.setProperty('--scale', settings.size);
  }, [settings.size]);

  let page;
  let section = 'home';
  if (parts[0] === 't' && byId[parts[1]]) {
    page = <Topic t={byId[parts[1]]} tab={parts[2]} />;
    section = parts[1];
  } else if (parts[0] === 'play') {
    page = <Play />;
    section = 'play';
  } else if (parts[0] === 'quiz' && QUIZZES.some((q) => q.id === parts[1])) {
    page = <Quiz id={parts[1]} />;
    section = 'play';
  } else if (parts[0] === 'credits') {
    page = <Credits />;
    section = 'credits';
  } else page = <Home />;

  return (
    <Settings.Provider value={settings}>
      <Header settings={settings} section={section} />
      <main className="wrap">{page}</main>
      <Footer />
    </Settings.Provider>
  );
}

function Header({ settings, section }) {
  const ar = useAr();
  const sizes = [0.9, 1, 1.15, 1.3];
  const i = Math.max(0, sizes.indexOf(settings.size));
  return (
    <header className="topbar">
      <div className="wrap topbar-in">
        <a className="brand" href={href()}>
          <span className="brand-icon">
            <TopicIcon name="cup" size={26} />
          </span>
          <span>{ar('أَلْعَابُ الْمَقْهَى')}</span>
        </a>
        <nav className="nav">
          <a href={href()} className={section === 'home' ? 'on' : ''}>
            {ar('الرَّئِيسِيَّةُ')}
          </a>
          <a href={href('play')} className={section === 'play' ? 'on' : ''}>
            {ar('الْعَبْ')}
          </a>
        </nav>
        <div className="tools">
          <button
            className={'chip toggle' + (settings.harakat ? ' on' : '')}
            onClick={() => setPref('harakat', !settings.harakat)}
            aria-pressed={settings.harakat}
            title={ar('إِظْهَارُ التَّشْكِيلِ أَوْ إِخْفَاؤُهُ')}
          >
            <span className="dot" />
            {settings.harakat ? 'التَّشْكِيلُ' : 'التشكيل'}
          </button>
          <div className="chip-group" role="group" aria-label={ar('حَجْمُ الْخَطِّ')}>
            <button className="chip" disabled={i === 0} onClick={() => setPref('size', sizes[i - 1])} aria-label={ar('تَصْغِيرُ الْخَطِّ')}>
              أ−
            </button>
            <button className="chip" disabled={i === sizes.length - 1} onClick={() => setPref('size', sizes[i + 1])} aria-label={ar('تَكْبِيرُ الْخَطِّ')}>
              أ+
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  const ar = useAr();
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-line">
          <Star size={18} />
          <span>{ar('الْمَقْهَى بَيْتُ النَّاسِ: چَايٌ وَحَدِيثٌ وَلَعِبٌ.')}</span>
          <Star size={18} />
        </div>
        <a className="footer-link" href={href('credits')}>
          {ar('مَصَادِرُ الصُّوَرِ')}
        </a>
      </div>
    </footer>
  );
}
