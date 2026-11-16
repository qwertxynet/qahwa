import media from '../data/media.json';
import { PHOTOS, img } from '../data/topics.js';
import { useAr } from '../lib.js';
import { pieceSrc } from '../components/Bits.jsx';

export default function Credits() {
  const ar = useAr();
  const photos = media.filter((m) => m.kind === 'photo');
  return (
    <div className="credits">
      <h1 className="page-title">{ar('مَصَادِرُ الصُّوَرِ')}</h1>
      <p className="lead center">
        {ar('كُلُّ الصُّوَرِ مِنْ «وِيكِيمِيدْيَا كُومُنْز»، وَهِيَ مُتَاحَةٌ بِرُخَصٍ حُرَّةٍ. نَشْكُرُ أَصْحَابَهَا.')}
      </p>
      <ul className="credit-list">
        {photos.map((m) => (
          <li key={m.id}>
            <img src={img(m.id, true)} alt="" loading="lazy" />
            <div>
              <b>{ar(PHOTOS[m.id] || m.title)}</b>
              <div dir="auto">
                {ar('تَصْوِيرُ')}: {m.artist}
              </div>
              <div>
                {ar('الرُّخْصَةُ')}:{' '}
                {m.licenseUrl ? (
                  <a href={m.licenseUrl} target="_blank" rel="noreferrer" dir="ltr">
                    {m.license}
                  </a>
                ) : (
                  <span dir="ltr">{m.license === 'Public domain' ? ar('مِلْكٌ عَامٌّ') : m.license}</span>
                )}{' '}
                ·{' '}
                <a href={m.page} target="_blank" rel="noreferrer">
                  {ar('صَفْحَةُ الصُّورَةِ')}
                </a>
              </div>
            </div>
          </li>
        ))}
        <li>
          <span className="credit-pieces">
            <img src={pieceSrc('wn')} alt="" />
            <img src={pieceSrc('bk')} alt="" />
          </span>
          <div>
            <b>{ar('قِطَعُ الشِّطْرَنْجِ')}</b>
            <div dir="ltr">Cburnett · CC BY-SA 3.0 / GFDL / BSD</div>
            <div>
              <a href="https://commons.wikimedia.org/wiki/Category:SVG_chess_pieces" target="_blank" rel="noreferrer">
                {ar('صَفْحَةُ الصُّوَرِ')}
              </a>
            </div>
          </div>
        </li>
      </ul>
      <p className="hint">{ar('الرُّسُومُ الْأُخْرَى (الزَّارُ وَأَحْجَارُ الدُّومِينُو وَاللَّوْحُ وَالْأَيْقُونَاتُ) رُسِمَتْ لِهَذَا الْمَوْقِعِ.')}</p>
    </div>
  );
}
