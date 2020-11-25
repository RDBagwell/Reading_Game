const synth = window.speechSynthesis;
const voicesSelect = document.getElementById('voices');
const readText = document.getElementById('readText');
const cardList = document.getElementById('card-list');
const card = document.getElementsByClassName('card');
const message = document.getElementById('message');
const filePath = './word_list.json';

let voices = [];
let utterThis = new SpeechSynthesisUtterance();

function getVoices() {
    voices = synth.getVoices();
    voices.forEach(voice => {
      const option = document.createElement('option');
      if(voice.name ==="Microsoft Zira Desktop - English (United States)"){
        option.selected = true;
      }
      option.value = voice.name;
      option.innerText = `${voice.name} ${voice.lang}`;
      voicesSelect.appendChild(option);
    });
  }
  
  function setVoice(e){
      console.log(e.target.value);
      const test = voices.find(voice => voice.name === e.target.value);
      utterThis.voice = test;
 }

 function cardClick(element) {
    const elementWord = element.textContent.trim().toLowerCase();
    if(elementWord === wordToFind.toLowerCase()){
      message.innerHTML = "<h3>Correct</h3>";
    } else {
      message.innerHTML = "<h3>Wrong</h3>";
    }
 }

 async function createWordCard() {
   const res = await fetch(filePath);
   const data = await res.json();
   const wordList = data.level_01.word_list;
   wordList.forEach(word =>{
    const card = `
    <div class="card" onclick="cardClick(this)">
      <h3>${word}</h3>
    </div>`;
    cardList.innerHTML += card;
   })
 }
 createWordCard();

 async function getWord(){
  const res = await fetch(filePath);
  const data = await res.json();
  const wordList = data.level_01.word_list;
  utterThis.text = `Find the word... ${wordList[1]}`;
  synth.speak(utterThis);
  console.log(wordList[1])
 }

synth.addEventListener('voiceschanged', getVoices);
voicesSelect.addEventListener('change', setVoice);

readText.addEventListener('click', getWord);
