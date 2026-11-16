// قطع رسومية صغيرة: أيقونات المواضيع، الزار، حجر الدومينو، قطع الشطرنج، الصور مع مصادرها.
import { useAr } from '../lib.js';
import { PHOTOS, img } from '../data/topics.js';
import media from '../data/media.json';

const credit = Object.fromEntries(media.map((m) => [m.id, m]));

export function TopicIcon({ name, size = 28 }) {
  const common = { width: size, height: size, viewBox: '0 0 48 48', 'aria-hidden': true };
  if (name === 'cup')
    // استكان على صحن
    return (
      <svg {...common}>
        <path d="M15 9h18l-3 11c-1.5 3-1.5 5 0 8l1.5 6c.5 2-1 3-3 3h-9c-2 0-3.5-1-3-3l1.5-6c1.5-3 1.5-5 0-8z" fill="currentColor" opacity=".9" />
        <path d="M17 14h14l-1.6 5.6H18.6z" fill="var(--tea, #b5402a)" />
        <ellipse cx="24" cy="40" rx="15" ry="3.5" fill="currentColor" />
        <path d="M30 6c2 1 2 3 0 4" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </svg>
    );
  if (name === 'dice')
    return (
      <svg {...common}>
        <rect x="5" y="13" width="22" height="22" rx="5" fill="currentColor" transform="rotate(-12 16 24)" />
        <rect x="22" y="9" width="21" height="21" rx="5" fill="currentColor" opacity=".75" transform="rotate(14 32 20)" />
        <g fill="var(--gicon-bg, #22407a)">
          <circle cx="11" cy="20" r="2.2" />
          <circle cx="16" cy="24" r="2.2" />
          <circle cx="21" cy="28" r="2.2" />
          <circle cx="29" cy="15" r="2" />
          <circle cx="36" cy="24" r="2" />
        </g>
      </svg>
    );
  if (name === 'tile')
    return (
      <svg {...common}>
        <rect x="14" y="3" width="20" height="42" rx="4" fill="currentColor" />
        <line x1="17" y1="24" x2="31" y2="24" stroke="var(--gicon-bg, #22407a)" strokeWidth="1.5" />
        <g fill="var(--gicon-bg, #22407a)">
          <circle cx="19.5" cy="9" r="2" />
          <circle cx="24" cy="13.5" r="2" />
          <circle cx="28.5" cy="18" r="2" />
          <circle cx="19.5" cy="30" r="2" />
          <circle cx="28.5" cy="30" r="2" />
          <circle cx="19.5" cy="39" r="2" />
          <circle cx="28.5" cy="39" r="2" />
        </g>
      </svg>
    );
  // knight: حصان الشطرنج (مبسّط)
  return (
    <svg {...common}>
      <path
        d="M14 42h22v-4c0-1-1-2-2-2h-1c-1-6 1-11 3-15 1.5-3 1-8-3-11l-3-2-1-3-3 4c-5 1-10 5-11 10-.5 2 .5 3 2 3l4-1 3-2c-1 4-5 6-7 11-1 2-1 5-1 5h-1c-1 0-2 1-2 2z"
        fill="currentColor"
      />
      <circle cx="24" cy="14" r="1.6" fill="var(--gicon-bg, #22407a)" />
    </svg>
  );
}

const PIPS = {
  1: [[2, 2]],
  2: [[1, 1], [3, 3]],
  3: [[1, 1], [2, 2], [3, 3]],
  4: [[1, 1], [3, 1], [1, 3], [3, 3]],
  5: [[1, 1], [3, 1], [2, 2], [1, 3], [3, 3]],
  6: [[1, 1], [3, 1], [1, 2], [3, 2], [1, 3], [3, 3]],
};

/** وجه زار */
export function Die({ n, size = 44, dim = false, className = '' }) {
  return (
    <svg className={'die ' + (dim ? 'dim ' : '') + className} width={size} height={size} viewBox="0 0 40 40" role="img" aria-label={String(n)}>
      <rect x="1.5" y="1.5" width="37" height="37" rx="8" className="die-face" />
      {(PIPS[n] || []).map(([x, y], i) => (
        <circle key={i} cx={x * 10} cy={y * 10} r="3.6" className="die-pip" />
      ))}
    </svg>
  );
}

/** نصف حجر دومينو (من ٠ إلى ٦ نقاط) داخل مربع ٤٠×٤٠ */
function Half({ n, y = 0 }) {
  return (PIPS[n] || []).map(([px, py], i) => <circle key={i} cx={px * 10} cy={y + py * 10} r="3.3" className="tile-pip" />);
}

/** حجر دومينو: a في الأعلى/اليسار و b في الأسفل/اليمين */
export function Tile({ a, b, vertical = false, size = 34, className = '', ...rest }) {
  const w = vertical ? size : size * 2;
  const h = vertical ? size * 2 : size;
  return (
    <svg className={'tile ' + className} width={w} height={h} viewBox={vertical ? '0 0 40 80' : '0 0 80 40'} role="img" aria-label={`${a}-${b}`} {...rest}>
      <rect x="1" y="1" width={vertical ? 38 : 78} height={vertical ? 78 : 38} rx="6" className="tile-face" />
      {vertical ? (
        <>
          <line x1="6" y1="40" x2="34" y2="40" className="tile-line" />
          <Half n={a} />
          <Half n={b} y={40} />
        </>
      ) : (
        <>
          <line x1="40" y1="6" x2="40" y2="34" className="tile-line" />
          <g>
            <Half n={a} />
          </g>
          <g transform="translate(40 0)">
            <Half n={b} />
          </g>
        </>
      )}
    </svg>
  );
}

export const pieceSrc = (p) => `./media/chess/${p}.svg`;
export function Piece({ p, size = 40, className = '' }) {
  return <img className={'piece ' + className} src={pieceSrc(p)} width={size} height={size} alt="" draggable="false" />;
}

/** صورة مع تعليقها ومصدرها */
export function Photo({ id, small = false, className = '' }) {
  const ar = useAr();
  const c = credit[id];
  return (
    <figure className={'photo ' + className}>
      <img src={img(id, small)} alt={ar(PHOTOS[id] || '')} loading="lazy" />
      <figcaption>
        <span>{ar(PHOTOS[id] || '')}</span>
        {c && (
          <a className="credit" href={c.page} target="_blank" rel="noreferrer">
            {c.artist} · {c.license}
          </a>
        )}
      </figcaption>
    </figure>
  );
}
