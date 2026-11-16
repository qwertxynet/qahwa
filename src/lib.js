import { createContext, useContext, useEffect, useState, useCallback } from 'react';

// ---------- التشكيل ----------
const HARAKAT = /[ً-ْٰـ]/g;
export const strip = (s) => (s || '').replace(HARAKAT, '');
// للمقارنة: بلا تشكيل، وتوحيد الألف والهمزات والتاء المربوطة، وبلا علامات ترقيم
export const norm = (s) =>
  strip(s)
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[«»"'،.؛:!?؟…\-–()]/g, '')
    .trim();

// ---------- الإعدادات (التشكيل وحجم الخط) ----------
export const Settings = createContext({ harakat: true, size: 1 });
export const useSettings = () => useContext(Settings);

/** يعرض النص العربي مع التشكيل أو بدونه حسب الإعداد */
export function useAr() {
  const { harakat } = useSettings();
  return useCallback((s) => (harakat ? s : strip(s)), [harakat]);
}

// ---------- التخزين المحلي ----------
const KEY = 'qahwa-v1';
function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}
function save(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* تخزين غير متاح — لا بأس */
  }
}

let state = load();
const listeners = new Set();
export function update(fn) {
  state = fn(structuredClone(state));
  save(state);
  listeners.forEach((l) => l(state));
}
export function useStore() {
  const [s, set] = useState(state);
  useEffect(() => {
    listeners.add(set);
    return () => listeners.delete(set);
  }, []);
  return s;
}

export const markStory = (id) => update((s) => ({ ...s, story: { ...s.story, [id]: true } }));
export const markKnown = (id, word, known) =>
  update((s) => {
    const k = { ...(s.known || {}) };
    const set = new Set(k[id] || []);
    known ? set.add(word) : set.delete(word);
    k[id] = [...set];
    return { ...s, known: k };
  });
export const recordScore = (game, scope, score, total) =>
  update((s) => {
    const g = { ...(s.games || {}) };
    const k = `${game}:${scope}`;
    const prev = g[k];
    if (!prev || score / total >= prev.score / prev.total) g[k] = { score, total };
    return { ...s, games: g };
  });
export const addWin = (game) =>
  update((s) => ({ ...s, wins: { ...(s.wins || {}), [game]: ((s.wins || {})[game] || 0) + 1 } }));
export const setPref = (k, v) => update((s) => ({ ...s, prefs: { ...s.prefs, [k]: v } }));

// ---------- أدوات ----------
export function shuffle(a) {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}
export const sample = (a, n) => shuffle(a).slice(0, n);

const PREFIXES = ['وال', 'فال', 'بال', 'كال', 'لل', 'ال', 'و', 'ف', 'ب', 'ل', 'ك'];
function stems(word) {
  const w = norm(word);
  const out = new Set([w]);
  for (const p of PREFIXES) if (w.startsWith(p) && w.length - p.length >= 2) out.add(w.slice(p.length));
  for (const b of [...out]) if (b.startsWith('ال')) out.add(b.slice(2));
  // لواحق الضمائر والمثنى والجمع (يساومه ← يساوم، خفين ← خف)
  for (const b of [...out])
    for (const s of SUFFIXES)
      if (b.endsWith(s) && b.length - s.length >= 2) {
        const r = b.slice(0, -s.length);
        out.add(r);
        if (r.endsWith('ت')) out.add(r.slice(0, -1) + 'ه'); // ناقته ← ناقة
      }
  return out;
}
const SUFFIXES = ['هما', 'هم', 'ها', 'ه', 'ين', 'ان', 'ون', 'وا', 'ا']; // «ا» = ألف تنوين النصب (إسكافيًّا)
const PUNCT = /^([«"(]*)(.*?)([»"),.،؛:!?؟…]*)$/;
const PUNCT_ONLY = /^[«»"(),.،؛:!?؟…]+$/;

/**
 * يقسّم الجملة إلى كلمات، ويحدّد الكلمات (أو العبارات) الموجودة في قائمة المفردات.
 * يعيد مصفوفة من {text, vocab?} مع الحفاظ على المسافات.
 */
export function tokenize(sentence, vocab) {
  // نفصل علامات الترقيم عن الكلمات حتى لا تُسطَّر معها
  const words = sentence.split(/(\s+)/).flatMap((w) => {
    if (!w.trim()) return [w];
    const [, a, core, b] = w.match(PUNCT);
    return [a, core, b].filter(Boolean);
  });
  const isWord = (w) => w.trim() && !PUNCT_ONLY.test(w);
  const idx = []; // مواقع الكلمات الحقيقية
  words.forEach((w, i) => isWord(w) && idx.push(i));
  const tag = new Array(words.length).fill(null);
  const entries = vocab.map(([w, d]) => ({ w, d, parts: w.split(/\s+/).map(norm) }));
  // العبارات الأطول أولًا
  entries.sort((a, b) => b.parts.length - a.parts.length);
  for (const e of entries) {
    for (let k = 0; k + e.parts.length <= idx.length; k++) {
      let ok = true;
      for (let j = 0; j < e.parts.length; j++) {
        const i = idx[k + j];
        if (tag[i]) { ok = false; break; }
        const s = stems(words[i]);
        const target = e.parts[j];
        const t2 = target.startsWith('ال') ? target.slice(2) : target;
        if (!(s.has(target) || s.has(t2))) { ok = false; break; }
      }
      if (ok) for (let j = 0; j < e.parts.length; j++) tag[idx[k + j]] = { ...e, start: j === 0, end: j === e.parts.length - 1 };
    }
  }
  return words.map((text, i) => ({ text, vocab: tag[i] }));
}

// ---------- النطق (إن توفّر صوت عربي في المتصفح) ----------
export function speak(text) {
  try {
    const synth = window.speechSynthesis;
    if (!synth) return false;
    const voice = synth.getVoices().find((v) => v.lang?.toLowerCase().startsWith('ar'));
    if (!voice) return false;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.voice = voice;
    u.lang = voice.lang;
    u.rate = 0.8;
    synth.speak(u);
    return true;
  } catch {
    return false;
  }
}
export function useArabicVoice() {
  const [has, setHas] = useState(false);
  useEffect(() => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    const check = () => setHas(synth.getVoices().some((v) => v.lang?.toLowerCase().startsWith('ar')));
    check();
    synth.addEventListener?.('voiceschanged', check);
    return () => synth.removeEventListener?.('voiceschanged', check);
  }, []);
  return has;
}

// ---------- التوجيه (hash router) ----------
export function useRoute() {
  const get = () => {
    const h = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
    const [path, query = ''] = h.split('?');
    return { parts: path.split('/').filter(Boolean), query: new URLSearchParams(query) };
  };
  const [r, setR] = useState(get);
  useEffect(() => {
    const on = () => {
      setR(get());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return r;
}
export const href = (...parts) => '#/' + parts.filter(Boolean).join('/');

// أرقام عربية مشرقية
export const num = (n) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);
