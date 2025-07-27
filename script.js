const output = document.getElementById("output");
const input = document.getElementById("commandInput");
const lofi = document.getElementById("lofi");
const typeSound = document.getElementById("typeSound");
const webhook1 = "https://discord.com/api/webhooks/1399043773614526545/zAonOKE2JM8N3zz_cp96KdsbyrSusP3K_sRubo99MMPVRK0qVhu6IuCAru6a9JJNMiJu";
const webhook2 = "https://discord.com/api/webhooks/1399056039411847330/Gz4p2lxYeV1JbYHfXUa9idXq044dNGDWSjCGqf2kX6icHobHjZa97p5ETsPYf8GiSASn";

let sessionId = Math.random().toString(36).substring(2,10);
let fingerprint = "Loading…";
let userAgent = navigator.userAgent;
let referrer = document.referrer || "Direct";
let screenRes = `${window.screen.width}x${window.screen.height}`;
let userIP = "Loading…";
let locationTxt = "Loading…";

// ลองเปิดเพลง ถ้าไม่ให้เปิดก็ไม่ error
try{ lofi.play().catch(()=>{}); }catch(e){}

new Fingerprint2().get(result => { fingerprint = result; });
fetch("https://ipapi.co/json/")
  .then(r=>r.json())
  .then(d=>{
    userIP = d.ip;
    locationTxt = `${d.city}, ${d.country_name}`;
  })
  .catch(()=>{});

function logToDiscord(command, result){
  const time = new Date().toLocaleString();
  const msg = "```" +
`[TERMINAL LOGS]
Session: ${sessionId}
Time: ${time}
IP: ${userIP}
Location: ${locationTxt}
Device: ${userAgent}
Screen: ${screenRes}
Referrer: ${referrer}
Fingerprint: ${fingerprint}
Command: ${command}
Result: ${result}` + "```";
  [webhook1, webhook2].forEach(url=>{
    fetch(url,{
      method:"POST",
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({content:msg})
    }).catch(()=>{});
  });
}

function print(text){
  output.innerHTML += text + "\n";
  output.scrollTop = output.scrollHeight;
}

function typewriter(text, delay=20){
  return new Promise(res=>{
    let i=0, line="";
    const interval=setInterval(()=>{
      try{ typeSound.play().catch(()=>{});}catch(e){}
      line += text[i];
      output.innerHTML = output.innerHTML.replace(/<span class="typing">.*<\/span>/,"") + line + `<span class="typing"></span>`;
      output.scrollTop = output.scrollHeight;
      i++;
      if(i>=text.length){clearInterval(interval);output.innerHTML=output.innerHTML.replace(/<span class="typing">.*<\/span>/,"");print("");res();}
    },delay);
  });
}

function fakeProgress(callback){
  return new Promise(res=>{
    let container=document.createElement("div");
    container.className="progress-container";
    let bar=document.createElement("div");
    bar.className="progress-bar";
    container.appendChild(bar);
    output.appendChild(container);
    let percent=0;
    let interval=setInterval(()=>{
      percent += Math.floor(Math.random()*15)+5;
      if(percent>=100){percent=100;clearInterval(interval);setTimeout(()=>{container.remove();res();},300);}
      bar.style.width=percent+"%";
    },150);
  });
}

function showHelp(){
  print(`[WELCOME TO PHILAPHATZ TERMINAL]
Type one of the following commands:
help | whoami | contact | projects | stats | run [name] | donate | time | echo [txt] | quote | back | c/clear`);
}

async function runCommand(cmd){
  const args = cmd.split(" ");
  const main = args[0];

  switch(main){
    case "help": showHelp(); break;
    case "c":
    case "clear": output.innerHTML=""; showHelp(); break;

    case "whoami":
      await fakeProgress();
      await typewriter(`[WHOAMI]
---------------------------------------
| Name         | Philaphatz
| Role         | Developer / Creator
| Skills       | JavaScript, Python, Shell
| Passion      | Building interactive web terminals
| About        | A passionate dev who loves creating
|               automation tools and pushing browser
|               apps to the limit.
---------------------------------------`);
      logToDiscord(cmd,"Displayed about me");
      break;

    case "contact":
      await fakeProgress();
      await typewriter(`[CONTACT]
---------------------------------------
| Email   | example@mail.com
| Discord | Philaphatz#1234
| GitHub  | github.com/philaphatz
| Twitter | @philaphatz
---------------------------------------`);
      logToDiscord(cmd,"Displayed contact");
      break;

    case "projects":
      await fakeProgress();
      await typewriter(`[PROJECTS]
-----------------------------------------------------------
| Name          | Status      | Description
-----------------------------------------------------------
| AutoScraper   | Active      | A smart bot scraping data
| LinkTree++    | Development | Enhanced personal branding
| TermLogPro    | Beta        | Logging & Analytics tool
-----------------------------------------------------------`);
      logToDiscord(cmd,"Displayed projects");
      break;

    case "stats":
      await fakeProgress();
      await typewriter(`[STATS]
----------------------------------------
| Active Session | 23
| Uptime         | 02:13:41
| Total Logs     | 153
| Location       | ${locationTxt}
| System Note    | Monitoring user in real-time.
----------------------------------------`);
      logToDiscord(cmd,"Displayed stats");
      break;

    case "run":
      if(!args[1]){print("Usage: run [facebook|instagram|linktree|email]");return;}
      await fakeProgress();
      let url="";
      if(args[1]==="facebook") url="https://facebook.com/";
      if(args[1]==="instagram") url="https://instagram.com/";
      if(args[1]==="linktree") url="https://linktr.ee/philaphatz.work";
      if(args[1]==="email") url="mailto:example@mail.com";
      if(url){window.open(url,"_blank");print(`[OK] Redirected to ${args[1]}`);logToDiscord(cmd,`Opened ${args[1]}`);}
      else print("Invalid run target");
      break;

    case "donate":
      await fakeProgress();
      await typewriter(`[DONATE MODULE]
---------------------------------------
Thank you for your support!
Scan the PromptPay QR code below to donate:

PromptPay QR Code: [0930401105]
PayPal: https://paypal.me/philaphatz
---------------------------------------`);
      logToDiscord(cmd,"Displayed donate");
      break;

    case "time":
      print(`[TIME] ${new Date().toLocaleString()}`);
      logToDisc
