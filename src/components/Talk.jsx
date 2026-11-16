import { useState } from 'react';
import { useAr, speak, useArabicVoice, norm } from '../lib.js';
import { Star } from './Ornament.jsx';

/** حوارات المقهى بالعامية، وتحت كل جملة معناها بالفصحى */
export default function Talk({ dialogues }) {
  const ar = useAr();
  const [fusha, setFusha] = useState(true);
  const hasVoice = useArabicVoice();
  return (
    <div className="dialogues">
      <div className="talk-tools">
        <p className="hint">{ar('اقْرَأِ الْحِوَارَ مَعَ زَمِيلِكَ: كُلُّ وَاحِدٍ يَقْرَأُ دَوْرًا.')}</p>
        <button className={'chip toggle' + (fusha ? ' on' : '')} onClick={() => setFusha(!fusha)} aria-pressed={fusha}>
          <span className="dot" />
          {ar('الْمَعْنَى بِالْفُصْحَى')}
        </button>
      </div>
      {dialogues.map((d, di) => {
        const speakers = [...new Set(d.lines.map((l) => l[0]).filter(Boolean))];
        return (
          <article key={di} className="dialogue">
            <h3>
              <Star size={18} /> {ar(d.title)}
            </h3>
            {d.lines.map(([who, text, f], li) =>
              who ? (
                <div key={li} className={'bubble ' + (speakers.indexOf(who) % 2 ? 'b' : 'a')}>
                  <span className="who">{ar(who)}</span>
                  <span className="say">
                    {ar(text)}
                    {hasVoice && (
                      <button className="say-voice" onClick={() => speak(text)} aria-label={ar('اسْتَمِعْ')}>
                        🔊
                      </button>
                    )}
                  </span>
                  {fusha && f && norm(f) !== norm(text) && <span className="say-f">{ar(f)}</span>}
                </div>
              ) : (
                <div key={li} className="stage-dir">
                  {ar(text)}
                </div>
              )
            )}
          </article>
        );
      })}
    </div>
  );
}
