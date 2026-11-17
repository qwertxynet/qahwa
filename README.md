# ألعاب المقهى

An Arabic learning site about traditional café games in Iraq: chess (الشطرنج), backgammon (الطاولي) and
dominoes (الدومينو), plus the café itself (tea, the istikan, café manners and Iraqi café expressions).
It is written for learners of Arabic. The text is standard Arabic with full tashkeel (with an on/off switch), and
Iraqi dialect words are shown next to their فصحى meaning.

What's inside:

- **Four topic pages** (المقهى، الشطرنج، الطاولي، الدومينو) with a short illustrated history, where you can tap the
  underlined words to see their meaning.
- **Rules with interactive boards**: tap a chess piece to see how it moves, roll dice to learn the Iraqi
  names of each roll (شش بيش، دو شش…), and match domino tiles to the ends of a line.
- **Vocabulary flashcards** with Iraqi words, their فصحى equivalent and example sentences, plus café dialogues in
  dialect with a فصحى line under each.
- **Three full games against the computer**: chess (three levels), backgammon (with «مارس», the double win) and
  dominoes (a match to 51 points).
- **Six quizzes** and badges. Progress is saved in the browser.

Built with React + Vite, in the same style as [حكايات الأمثال](https://qwertxynet.github.io/amthal/). It deploys
to GitHub Pages automatically on every push to `main` (see `.github/workflows/deploy.yml`).

## Run locally

```bash
npm install
npm run dev
```

## Editing content

All the text is in **`src/data/topics.js`**: stories, glossed words, rules, vocabulary cards, dialogues and the
tea-making steps. Photo captions are at the top of the same file.

> The Iraqi dialect terms (dice names, café words, dialogues) reflect common Baghdadi usage, but they vary from
> city to city. A teacher should review them and adjust them to the local usage they want to teach.

## Media

The photos come from Wikimedia Commons under free licences. `src/data/media.json` lists each file with its
author, licence and source page, and the site's «مصادر الصور» page shows these credits. To rebuild the web
images, download the originals into `source/commons/<id>.jpg` (and the chess-piece SVGs as `<id>.svg`), then run
`npm run media`. It writes WebP files to `public/media`. `source/` is not committed.

The game engines are in `src/play/` (`chess.js`, `tawla.js`, `domino.js`) and are plain JavaScript with no
dependencies.
