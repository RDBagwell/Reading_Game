const synth = window.speechSynthesis;
const readText = document.getElementById('readText');
const cardList = document.getElementById('card-list');
const card = document.getElementsByClassName('card');
const message = document.getElementById('message');
const filePath = './word_list.json';
const testSentance = 'The quick brown fox jumps over the lazy dog.'
const timeDelay = 2000

let utterThis = new SpeechSynthesisUtterance();
let wordToFind = "";
let gameLevel = 2;

async function getWordList(level = 0){
  const res = await fetch(filePath);
  const data = await res.json();
   if(level  >= data.length){ level = data.length -1}
  const wordList = data[level];
  return wordList.wordList
 }

 async function createWordCard() {
  const wordList = await getWordList(gameLevel);
  wordList.map(word=>{
    const card = `
    <div class="card" onclick="cardClick(this)">
      <h3>${word}</h3>
    </div>`;
    cardList.innerHTML += card;
  })
  
 }

 function cardClick(element) {
    const elementWord = element.textContent.trim().toLowerCase();
    if(wordToFind === ""){
      getWord();
    } else {
      if(elementWord === wordToFind.toLowerCase()){
        const text = 'Correct!!';
        message.innerHTML = `<h3>${text}</h3>`;
        utterThis.text = text;
        synth.speak(utterThis);
        setTimeout(()=>{
          message.innerHTML = "";
          getWord()
        },timeDelay);
      } else {
        const text = `No, that word is ${elementWord}.`;
        message.innerHTML = `<h3>${text}</h3>`;
        utterThis.text = text;
        synth.speak(utterThis);
        if(synth.pending){
          synth.cancel()
        }
        setTimeout(function(){ 
          sayWordToFind(wordToFind);
          message.innerHTML = "";
        }, timeDelay);
      }
    }
 }

async function getWord(){
   const wordList = await getWordList(gameLevel);
   const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
    sayWordToFind(randomWord);
    setWordToFind(randomWord);
 }

 function setWordToFind(randomWord) {
    wordToFind = randomWord;
 }

 function sayWordToFind(randomWord) {
    utterThis.text = `Find the word...${randomWord}`;
    // console.log(synth.getVoices()[0])
    synth.speak(utterThis);
    if(synth.pending){
      synth.cancel()
    }
 }


readText.addEventListener('click', getWord);

createWordCard();
