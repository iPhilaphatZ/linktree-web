const output = document.getElementById("output");
const input = document.getElementById("commandInput");
const lofi = document.getElementById("lofi");
const typeSound = document.getElementById("typeSound");
const webhook1 = "https://discord.com/api/webhooks/1399043773614526545/zAonOKE2JM8N3zz_cp96KdsbyrSusP3K_sRubo99MMPVRK0qVhu6IuCAru6a9JJNMiJu";
const webhook2 = "https://discord.com/api/webhooks/1399056039411847330/Gz4p2lxYeV1JbYHfXUa9idXq044dNGDWSjCGqf2kX6icHobHjZa97p5ETsPYf8GiSASn";
let sessionId = Math.random().toString(36).substring(2,10);
let fingerprint = "unknown";
let userAgent = navigator.userAgent;
let referrer = document.referrer || "Direct";
let screenRes = `${window.screen.width}x${window.screen.height}`;
let userIP = "Fetching...";
let locationTxt = "Unknown";

lofi.play().catch(()=>{});

new Fingerprint2().get(result => { fingerprint = result; });
fetch("https://ipapi.co/json/").then(r=>r.json()).then(d=>{
  userIP = d.ip;
  locationTxt = `${d.city}, ${d.country_name}`;
});

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
    });
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
      typeSound.play().catch(()=>{});
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
help | whoami | contact | projects | stats | run [name] | donate | time | ech
