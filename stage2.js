const messagesEl = document.getElementById('messages');
const input      = document.getElementById('userInput');
const timerEl    = document.getElementById('timer');
const exitBtn    = document.getElementById('exitBtn');
const modal      = document.getElementById('modalOverlay');
const yesQuit    = document.getElementById('yesQuit');
const noStay     = document.getElementById('noStay');
const congratsOv = document.getElementById('congratsOverlay');
const congratsMsg= document.getElementById('congratsMsg');
const closeCongrats=document.getElementById('closeCongrats');

let isTyping = false;
const correctKey = "PHC-CYBER-2025";
let startTime = Date.now();
let recentReplies = [];
let attempts = 0;

/* ---------------- Timer ---------------- */
function updateTimer() {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  timerEl.textContent = h > 0
    ? String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0')
    : String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
}
setInterval(updateTimer, 1000);

/* ---------------- Typewriter ---------------- */
function setInputEnabled(en) { input.disabled = !en; if(en) input.focus(); }
function typeWriter(text, cls='') {
  return new Promise(res=>{
    const span=document.createElement('span');
    if(cls) span.className=cls;
    messagesEl.appendChild(span);
    let i=0; isTyping=true; setInputEnabled(false);
    const int=setInterval(()=>{
      span.textContent=text.slice(0,++i);
      messagesEl.scrollTop=messagesEl.scrollHeight;
      if(i===text.length){clearInterval(int);messagesEl.appendChild(document.createElement('br'));isTyping=false;setInputEnabled(true);res();}
    },28);
  });
}
async function clerkSay(t){await typeWriter('Clerk: ','nameClerk'); await typeWriter(t);}
async function youSay(t){await typeWriter('You: ','nameYou'); await typeWriter(t);}

/* ---------------- Dialogue Pools ---------------- */
const hints = [
  "Records often begin with three letters—then a dash.",
  "The castle loves acronyms; perhaps start with PHC-?",
  "CYBER things nest in secure vaults.",
  "Years matter; the castle cannot forget 2025."
];

const chatter = [
  "The corridors stretch on, digit by digit.",
  "Your silence echoes like empty hallways.",
  "Wrong turn. Perhaps consult the filing clerks?",
  "Every failed code adds another brick to the wall.",
  "Record misfiled. Clerk shrugs into the abyss."
];

const filingResponses = [
  (rec)=>`Department of Lost Causes received record ${rec}. They deny existing.`,
  (rec)=>`Record ${rec} routed to Office 404. Expect no reply.`,
  (rec)=>`Clerk stamps ${rec} twice, then sets it ablaze.`,
  (rec)=>`System acknowledges record ${rec}. System also laughs.`
];

/* ---------------- Intro ---------------- */
(async ()=>{await clerkSay("What is the key / record number?");})();

/* ---------------- Helpers ---------------- */
function randomChoice(a){return a[Math.floor(Math.random()*a.length)];}
function addRecent(rep){recentReplies.push(rep); if(recentReplies.length>4) recentReplies.shift(); }

/* ---------------- Hint scheduler (keeps dialogue alive) ---------------- */
setInterval(()=>{
  if(!isTyping && attempts>0 && attempts%4===0){
    const h=randomChoice(hints); addRecent(h);
    clerkSay(h);
  }
}, 20000);

/* ---------------- Input Handler ---------------- */
input.addEventListener('keydown', async (e)=>{
  if(e.key==='Enter' && input.value.trim() && !isTyping){
    const txt=input.value.trim();
    input.value=''; attempts++;
    await youSay(txt);

    // Exit command
    if(/exit|leave|quit/i.test(txt)){ openModal(); return; }

    // Correct key
    if(txt.toUpperCase()===correctKey){
      await handleWin(); return;
    }

    // False key pattern: PHC + 6 digits
    if(/^PHC\d{6}$/i.test(txt)){
      const resp=randomChoice(filingResponses)(txt.toUpperCase());
      addRecent(resp); 
    // Insert occasional exit hint
    if (attempts % 7 === 0) {
      const exitHint = "Stuck? Some choose to type 'exit' and abandon the pursuit...";
      addRecent(exitHint);
      await clerkSay(exitHint);
    }

    await clerkSay(resp);
      return;
    }

    // Hint request
    if(/hint|help|clue/i.test(txt)){
      const h=randomChoice(hints); addRecent(h); await clerkSay(h); return;
    }

    // Generic chatter avoiding repeats
    let rep;
    do{ rep=randomChoice(chatter);}while(recentReplies.includes(rep));
    addRecent(rep); await clerkSay(rep);
  }
});

/* ---------------- Win Handler ---------------- */
async function handleWin(){
  const now=new Date().toLocaleString();
  let creepMsg=`Access granted. Welcome within.\nLocal time registered: ${now}.`;
  try{
    const d=await fetch('https://ipapi.co/json/').then(r=>r.json());
    if(d.city){ creepMsg+=`\nSignal traced to ${d.city}, ${d.region}.`; }
  }catch{}
  congratsMsg.textContent=creepMsg;
  congratsOv.classList.remove('hidden');
}

/* Close congrats */
closeCongrats.addEventListener('click',()=>{
  congratsOv.classList.add('hidden');
  clerkSay("Proceed further if you dare. The halls await.");
});

/* ---------------- Exit logic ---------------- */
function openModal(){ modal.classList.remove('hidden'); }
noStay.addEventListener('click', ()=>modal.classList.add('hidden'));
yesQuit.addEventListener('click', ()=>window.location.href='index.html');
exitBtn.addEventListener('click', openModal);
