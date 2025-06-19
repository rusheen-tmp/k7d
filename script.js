const messagesEl = document.getElementById('messages');
const input      = document.getElementById('userInput');
const keyButton  = document.getElementById('keyButton');
const enterBtn   = document.getElementById('enterBtn');

let stage = 0;
let isTyping = false;
let recentReplies = [];

function setInputEnabled(enabled) {
  input.disabled = !enabled;
  if (enabled) input.focus();
}

function typeWriter(text, className = '') {
  return new Promise(resolve => {
    const span = document.createElement('span');
    if (className) span.className = className;
    messagesEl.appendChild(span);

    let i = 0;
    isTyping = true;
    setInputEnabled(false);

    const typeInterval = setInterval(() => {
      span.textContent = text.slice(0, ++i);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      if (i === text.length) {
        clearInterval(typeInterval);
        messagesEl.appendChild(document.createElement('br'));
        messagesEl.scrollTop = messagesEl.scrollHeight;
        isTyping = false;
        setInputEnabled(true);
        resolve();
      }
    }, 35);
  });
}

async function clerkSay(text) {
  await typeWriter('Clerk: ', 'nameClerk');
  await typeWriter(text);
}

async function youSay(text) {
  await typeWriter('You: ', 'nameYou');
  await typeWriter(text);
}

function randomChoice(arr) { return arr[Math.floor(Math.random()*arr.length)]; }

const firstLines = [
  "You stand before the gate—by whose order?",
  "State your business, stranger, before the castle listens.",
  "Identify yourself. The walls have ears.",
  "Another seeker? Speak your code."
];

const stage1Lines = [
  "A code? Codes twist in corridors like smoke. State it again, if you dare.",
  "I'm waiting. A clearer code, perhaps? Second time is tradition.",
  "The castle rejected that whisper; try once more—louder or wiser.",
  "Curious digits, but they seem incomplete. Provide your code anew."
];

const stage2Hint = "Curious… It appears orderly, yet reeks of disorder. One final attempt—prove you belong.";
const unlockLine = "Very well. Take the key, if your hand won't tremble.";

const taunts = [
  "Why linger? The door is ajar—step through or step aside.",
  "More words? The castle devours them whole.",
  "Courage fades with every syllable you spill.",
  "Enter, unless your fear prefers these shadows.",
  "Mystery grows impatient. Will you cross the threshold?"
];

(async ()=>{ await clerkSay(randomChoice(firstLines)); })();

input.addEventListener('keydown', async (e)=>{
  if(e.key==='Enter' && input.value.trim() && !isTyping){
    const txt=input.value.trim(); input.value='';
    await youSay(txt);
    stage++;
    if(stage===1){ await clerkSay(randomChoice(stage1Lines));}
    else if(stage===2){ await clerkSay(stage2Hint);}
    else if(stage===3){ await clerkSay(unlockLine); unlockKey();}
    else{
      let rep;
      do{ rep=randomChoice(taunts);}while(recentReplies.includes(rep));
      recentReplies.push(rep); if(recentReplies.length>3) recentReplies.shift();
      await clerkSay(rep);
    }
  }
});

function unlockKey(){
  keyButton.style.display='inline-block';
  enterBtn.classList.add('active'); enterBtn.disabled=false;
  const go=()=>window.location.href='stage2.html';
  keyButton.addEventListener('click',go); enterBtn.addEventListener('click',go);
}
