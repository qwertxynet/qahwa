import { useState } from 'react';
import { useAr, tokenize, speak, useArabicVoice } from '../lib.js';
import { Photo } from './Bits.jsx';
import { Star } from './Ornament.jsx';

/** يعرض فقرات الحكاية؛ الكلمات الصعبة مسطّرة، والضغط عليها يُظهر معناها */
export default function Reader({ sections, gloss = [], children }) {
  const ar = useAr();
  const [sel, setSel] = useState(null);
  const hasVoice = useArabicVoice();

  return (
    <div className="reader">
      <p className="hint">{ar('اضْغَطْ عَلَى الْكَلِمَةِ الْمُسَطَّرَةِ لِتَرَى مَعْنَاهَا.')}</p>
      {sections.map((s, si) => (
        <section key={si} className="rsec">
          <h2 className="rsec-h">
            <Star size={20} /> {ar(s.h)}
          </h2>
          <div className={'rsec-body' + (s.img?.length ? ' with-img' : '')}>
            <div className="rtext">
              {s.p.map((para, pi) => (
                <p key={pi}>
                  {tokenize(para, gloss).map((t, i) =>
                    t.vocab ? (
                      <button
                        key={i}
                        className={'w' + (sel && sel.w === t.vocab.w ? ' sel' : '')}
                        onClick={() => setSel({ w: t.vocab.w, d: t.vocab.d, text: t.text })}
                      >
                        {ar(t.text)}
                      </button>
                    ) : (
                      <span key={i}>{ar(t.text)}</span>
                    )
                  )}
                </p>
              ))}
            </div>
            {s.img?.length > 0 && (
              <div className={'rimgs n' + s.img.length}>
                {s.img.map((id) => (
                  <Photo key={id} id={id} small={s.img.length > 1} />
                ))}
              </div>
            )}
          </div>
        </section>
      ))}
      {children}
      {sel && (
        <div className="gloss" role="status">
          <span className="gloss-w">{ar(sel.w)}</span>
          <span className="gloss-d">{ar(sel.d)}</span>
          {hasVoice && (
            <button className="x" onClick={() => speak(sel.w)} aria-label={ar('انْطِقِ الْكَلِمَةَ')}>
              🔊
            </button>
          )}
          <button className="x" onClick={() => setSel(null)} aria-label={ar('إِغْلَاقٌ')}>
            ×
          </button>
        </div>
      )}
    </div>
  );
}
