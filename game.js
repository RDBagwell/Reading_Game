const synth = window.speechSynthesis;
const voicesSelect = document.getElementById('voices');
const readText = document.getElementById('readText');
const cardList = document.getElementById('card-list');
const card = document.getElementsByClassName('card');
const message = document.getElementById('message');
const filePath = './word_list.json';

let utterThis = new SpeechSynthesisUtterance();
let wordToFind = "";

async function getWordList(level = 0){
  const res = await fetch(filePath);
  const data = await res.json();
  const wordList = data[level];
  return wordList.wordList
 }

 function createWordCard() {
  getWordList(1).then(wordList =>{
    wordList.forEach(word =>{
      const card = `
      <div class="card" onclick="cardClick(this)">
        <h3>${word}</h3>
      </div>`;
      cardList.innerHTML += card;
     })
  });
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
        },2000);
      } else {
        const text = `No, that word is ${elementWord}.`;
        message.innerHTML = `<h3>${text}</h3>`;
        utterThis.text = text;
        synth.speak(utterThis);
        setTimeout(function(){ 
          utterThis.text = `Find the word...${wordToFind}`;
          synth.speak(utterThis);
          message.innerHTML = "";
        }, 2000);
      }
    }
 }

 function getWord(){
  getWordList(1).then(wordList => {
    const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
    sayWordToFind(randomWord);
    setWordToFind(randomWord);
  })
 }

 function setWordToFind(randomWord) {
    wordToFind = randomWord;
 }

 function sayWordToFind(randomWord) {
    utterThis.text = `Find the word...${randomWord}`;
    synth.speak(utterThis);
 }

readText.addEventListener('click', getWord);
createWordCard();
