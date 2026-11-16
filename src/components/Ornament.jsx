// زخارف بسيطة: النجمة الثمانية (الخاتم) وفاصل مزخرف

export function Star({ size = 24, className = '' }) {
  return (
    <svg className={'star ' + className} width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="5" strokeLinejoin="round">
        <rect x="20" y="20" width="60" height="60" />
        <rect x="20" y="20" width="60" height="60" transform="rotate(45 50 50)" />
      </g>
      <circle cx="50" cy="50" r="9" fill="currentColor" />
    </svg>
  );
}

export function Divider() {
  return (
    <div className="divider" aria-hidden="true">
      <span />
      <Star size={20} />
      <span />
    </div>
  );
}

export function Corners() {
  const c = (
    <svg viewBox="0 0 40 40" width="40" height="40">
      <path d="M2 38 V14 Q2 2 14 2 H38" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M8 38 V18 Q8 8 18 8 H38" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="14" cy="14" r="3" fill="currentColor" />
    </svg>
  );
  return (
    <div className="corners" aria-hidden="true">
      <i className="tl">{c}</i>
      <i className="tr">{c}</i>
      <i className="bl">{c}</i>
      <i className="br">{c}</i>
    </div>
  );
}
