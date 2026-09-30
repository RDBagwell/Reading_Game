import { createSpeech, isSpeechSupported } from './speech.js';
import { pickTarget } from './round.js';
import { el, clear, $ } from './dom.js';

const FEEDBACK_MS = 1200;

let words = [];
let target = null;
let busy = false;
let speech = null;

async function loadWords() {
  // Loaded once, not on every question.
  const res = await fetch('./word_list.json');
  const data = await res.json();
  return data[0].wordList.map((w) => w.toLowerCase());
}

function renderCards() {
  const list = $('#card-list');
  clear(list);
  words.forEach((word) => {
    list.append(el('button', { type: 'button', class: 'card', on: { click: () => onCard(word) } }, word));
  });
}

function ask() {
  target = pickTarget(words, { last: target });
  speech.say(['Find the word', target]);
}

async function onCard(word) {
  if (busy) return;
  const message = $('#message');
  if (word === target) {
    busy = true;
    message.textContent = 'Correct!';
    await speech.say('Correct!');
    setTimeout(() => {
      message.textContent = '';
      busy = false;
      ask();
    }, FEEDBACK_MS / 2);
  } else {
    message.textContent = `That word is ${word}.`;
    await speech.say(`No, that word is ${word}.`);
    message.textContent = '';
    speech.say(['Find the word', target]);
  }
}

async function start() {
  $('#start-screen').hidden = true;
  $('#game').hidden = false;
  words = await loadWords();
  renderCards();
  ask(); // first speech happens inside the tap, which iOS requires
}

function init() {
  if (!isSpeechSupported(window)) {
    $('#start-screen').hidden = true;
    $('#unsupported').hidden = false;
    return;
  }
  speech = createSpeech(window);
  $('#start-button').addEventListener('click', start);
  $('#hear-again').addEventListener('click', () => target && speech.say(target));
}

init();
