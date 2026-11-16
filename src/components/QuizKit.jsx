import { useState } from 'react';
import { useAr, href, num, shuffle, recordScore } from '../lib.js';
import { Star } from './Ornament.jsx';

export function Progress({ i, n, score }) {
  const ar = useAr();
  return (
    <div className="gprogress">
      <div className="bar">
        <i style={{ width: `${(i / n) * 100}%` }} />
      </div>
      <span>
        {ar('السُّؤَالُ')} {num(Math.min(i + 1, n))} / {num(n)} · {ar('النِّقَاطُ')}: {num(score)}
      </span>
    </div>
  );
}

export function Finish({ score, total, again }) {
  const ar = useAr();
  const ratio = score / total;
  const stars = ratio === 1 ? 3 : ratio >= 0.6 ? 2 : ratio > 0 ? 1 : 0;
  const msg =
    ratio === 1
      ? 'مُمْتَازٌ! أَنْتَ مِنْ أَهْلِ الْمَقْهَى.'
      : ratio >= 0.6
        ? 'أَحْسَنْتَ! حَاوِلْ مَرَّةً أُخْرَى لِتَحْصُلَ عَلَى ثَلَاثِ نُجُومٍ.'
        : 'لَا بَأْسَ، رَاجِعِ الْمُفْرَدَاتِ ثُمَّ حَاوِلْ مَرَّةً أُخْرَى.';
  return (
    <div className="finish">
      <div className="stars">
        {[0, 1, 2].map((k) => (
          <span key={k} className={k < stars ? 'on' : ''}>
            <Star size={54} />
          </span>
        ))}
      </div>
      <div className="finish-score">
        {num(score)} / {num(total)}
      </div>
      <p>{ar(msg)}</p>
      <div className="row">
        <button className="btn" onClick={again}>
          {ar('الْعَبْ مَرَّةً أُخْرَى')}
        </button>
        <a className="btn ghost" href={href('play')}>
          {ar('أَلْعَابٌ أُخْرَى')}
        </a>
      </div>
    </div>
  );
}

/**
 * اختيار من متعدد.
 * questions = [{ prompt: ReactNode, options: [{key, label: ReactNode}], answer: key, explain?: string }]
 */
export function MultipleChoice({ questions, gameId, again, wide = false }) {
  const ar = useAr();
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const n = questions.length;

  if (i >= n) return <Finish score={score} total={n} again={again} />;
  const q = questions[i];
  const ok = picked === q.answer;
  const pick = (k) => {
    if (picked !== null) return;
    setPicked(k);
    if (k === q.answer) setScore((s) => s + 1);
  };
  const next = () => {
    if (i + 1 === n) recordScore(gameId, 'all', score, n);
    setPicked(null);
    setI(i + 1);
  };
  return (
    <>
      <Progress i={i} n={n} score={score} />
      <div className="qprompt" key={i}>
        {q.prompt}
      </div>
      <div className={'options' + (wide ? ' wide' : '')}>
        {q.options.map((o) => (
          <button
            key={o.key}
            className={'opt' + (picked !== null ? (o.key === q.answer ? ' right' : o.key === picked ? ' wrong' : ' dim') : '')}
            onClick={() => pick(o.key)}
            disabled={picked !== null}
          >
            {o.label}
          </button>
        ))}
      </div>
      {picked !== null && (
        <div className={'feedback ' + (ok ? 'ok' : 'no')}>
          <b>{ar(ok ? 'صَحِيحٌ! 👏' : 'لَيْسَ تَمَامًا')}</b>
          {q.explain && <span>{ar(q.explain)}</span>}
          <button className="btn" onClick={next} autoFocus>
            {ar(i + 1 === n ? 'النَّتِيجَةُ' : 'التَّالِي')}
          </button>
        </div>
      )}
    </>
  );
}

/** لعبة ترتيب الخطوات: steps بالترتيب الصحيح */
export function OrderSteps({ steps, gameId, again, onDone }) {
  const ar = useAr();
  const [pool, setPool] = useState(() => {
    let s = shuffle(steps.map((_, i) => i));
    while (s.every((x, i) => x === i)) s = shuffle(s);
    return s;
  });
  const [placed, setPlaced] = useState([]);
  const [checked, setChecked] = useState(false);

  const correct = placed.filter((x, i) => x === i).length;
  const add = (x) => {
    setPlaced([...placed, x]);
    setPool(pool.filter((y) => y !== x));
  };
  const remove = (k) => {
    if (checked) return;
    const x = placed[k];
    setPlaced(placed.filter((_, j) => j !== k));
    setPool([...pool, x]);
  };
  const check = () => {
    setChecked(true);
    recordScore(gameId, 'all', correct, steps.length);
    onDone?.(correct === steps.length);
  };

  return (
    <div className="order-game">
      <ol className="seq">
        {steps.map((_, k) => (
          <li key={k} className={checked ? (placed[k] === k ? 'right' : 'wrong') : ''}>
            <span className="n">{num(k + 1)}</span>
            {placed[k] !== undefined ? (
              <button onClick={() => remove(k)} disabled={checked}>
                {ar(steps[placed[k]])}
              </button>
            ) : (
              <span className="ph">{ar('اخْتَرِ الْخُطْوَةَ…')}</span>
            )}
          </li>
        ))}
      </ol>
      {pool.length > 0 && (
        <div className="pool">
          {pool.map((x) => (
            <button key={x} className="ev" onClick={() => add(x)}>
              {ar(steps[x])}
            </button>
          ))}
        </div>
      )}
      {!pool.length && !checked && (
        <div className="row center">
          <button className="btn" onClick={check}>
            {ar('تَحَقَّقْ')}
          </button>
        </div>
      )}
      {checked && (
        <div className={'feedback ' + (correct === steps.length ? 'ok' : 'no')}>
          <b>
            {correct === steps.length
              ? ar('مُمْتَازٌ! الچَايُ جَاهِزٌ. بِالْعَافِيَة! ☕')
              : `${ar('صَحِيحٌ')}: ${num(correct)} / ${num(steps.length)}`}
          </b>
          <button className="btn" onClick={again}>
            {ar('مَرَّةً أُخْرَى')}
          </button>
        </div>
      )}
    </div>
  );
}
