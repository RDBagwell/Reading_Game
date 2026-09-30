import { createSpeech, isSpeechSupported } from './speech.js';
import { loadLevels, earlierWords } from './levels.js';
import { createRound, nextQuestion, answer } from './round.js';
import { starsFor, levelBonus } from './scoring.js';
import { applyLevelResult, isUnlocked, levelRecord } from './progress.js';
import { pickPraise, askPhrases, correctionPhrases } from './praise.js';
import { formatWord } from './text.js';
import { el, clear, $ } from './dom.js';

let speech;
let levels = [];
let round = null;
let locked = false;
// In-memory for now; saved per player in the next phase.
const player = { unlocked: 1, levels: {}, totalScore: 0 };

function show(...nodes) {
  clear($('#app')).append(...nodes);
}

function showMap() {
  show(
    el('h2', { text: 'Pick a level' }),
    el('ol', { class: 'level-map' }, levels.map((lvl) => {
      const rec = levelRecord(player, lvl.id);
      const open = isUnlocked(player, lvl.id);
      return el('li', {}, el('button', {
        type: 'button',
        disabled: !open,
        on: { click: () => startLevel(lvl) },
      }, `${lvl.emoji} ${lvl.id}. ${lvl.name} ${'★'.repeat(rec.stars)}${open ? '' : ' 🔒'}`));
    })),
  );
}

function startLevel(level) {
  round = createRound(level, { extraPool: earlierWords(levels, level.id) });
  show(
    el('h2', { text: `${level.id}. ${level.name}` }),
    el('p', { id: 'progress' }),
    el('div', { class: 'card-list', id: 'card-list' }),
    el('button', { type: 'button', on: { click: () => speech.say(round.target) } }, '🔊 Hear it again'),
    el('button', { type: 'button', on: { click: showMap } }, 'Map'),
  );
  ask(level);
}

function ask(level) {
  const { target, choices } = nextQuestion(round);
  $('#progress').textContent = `${round.correct} / ${round.goal} · ${round.score} points`;
  clear($('#card-list')).append(...choices.map((word) =>
    el('button', { type: 'button', class: 'card', on: { click: () => onCard(level, word) } }, formatWord(word))));
  locked = false;
  speech.say(askPhrases(target));
}

async function onCard(level, word) {
  if (locked) return;
  const result = answer(round, word);
  if (!result.correct) {
    speech.say(correctionPhrases(word, round.target));
    return;
  }
  locked = true;
  await speech.say(pickPraise());
  if (result.done) finishLevel(level);
  else ask(level);
}

function finishLevel(level) {
  const stars = starsFor(round.firstTry, round.goal);
  const score = round.score + levelBonus(stars);
  applyLevelResult(player, level, { score, stars }, levels.length);
  speech.say(`Level complete! You earned ${stars} ${stars === 1 ? 'star' : 'stars'}.`);
  show(
    el('h2', { text: 'Level complete!' }),
    el('p', { text: `${'★'.repeat(stars)} · ${score} points` }),
    el('button', { type: 'button', on: { click: showMap } }, 'Map'),
  );
}

async function start() {
  $('#start-screen').hidden = true;
  speech.say("Let's read!"); // first speech inside the tap, which iOS requires
  levels = await loadLevels();
  showMap();
}

function init() {
  if (!isSpeechSupported(window)) {
    $('#start-screen').hidden = true;
    $('#unsupported').hidden = false;
    return;
  }
  speech = createSpeech(window);
  $('#start-button').addEventListener('click', start);
}

init();
