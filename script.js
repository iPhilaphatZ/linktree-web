const output = document.getElementById("output");
const input = document.getElementById("commandInput");
const lofi = document.getElementById("lofi");
const webhook1 = "https://discord.com/api/webhooks/1399043773614526545/zAonOKE2JM8N3zz_cp96KdsbyrSusP3K_sRubo99MMPVRK0qVhu6IuCAru6a9JJNMiJu";
const webhook2 = "https://discord.com/api/webhooks/1399056039411847330/Gz4p2lxYeV1JbYHfXUa9idXq044dNGDWSjCGqf2kX6icHobHjZa97p5ETsPYf8GiSASn";
let sessionId = Math.random().toString(36).substring(2,10);
let fingerprint = "unknown";
let userAgent = navigator.userAgent;
let referrer = document.referrer || "Direct";
let screenRes = `${window.screen.width}x${window.screen.height}`;
let userIP = "Fetching...";

if (lofi) lofi.play().catch(()=>{});

new Fingerprint2().get(result => { fingerprint = result; });
fetch("https://api.ipify.org?format=json").then(r=>r.json()).then(d=>userIP=d.ip);

function logToDiscord(command, result){
  const time = new Date().toLocaleString();
  const msg = "```" +
`[TERMINAL LOGS]
Session: ${sessionId}
Time: ${time}
IP: ${userIP}
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

function fakeProgress(callback){
  return new Promise(res=>{
    let container = document.createElement("div");
    container.className = "progress-container";
    let bar = document.createElement("div");
    bar.className = "progress-bar";
    container.appendChild(bar);
    output.appendChild(container);
    let percent = 0;
    let interval = setInterval(()=>{
      percent += Math.floor(Math.random()*10)+5;
      if(percent>=100) {percent=100; clearInterval(interval); setTimeout(()=>{container.remove();res();},500);}
      bar.style.width=percent+"%";
    },200);
  });
}

function showHelp(){
  print(`[WELCOME TO PHILAPHATZ TERMINAL]
Type one of the following commands:

help       – show available commands
whoami     – about me
contact    – show contact info
run [name] – open facebook | instagram | linktree | email
donate     – support me via PromptPay
time       – show current time
echo [txt] – print your text
back       – return to Linktree
c / clear  – clear the terminal`);
}

function runCommand(cmd){
  const args = cmd.split(" ");
  const main = args[0];
  switch(main){
    case "help":
      showHelp();
      break;
    case "c":
    case "clear":
      output.innerHTML = "";
      showHelp();
      break;
    case "whoami":
      fakeProgress().then(()=>{
        print(`[ABOUT ME]
--------------------------------
Name: Philaphatz (Dev)
Bio: Passionate developer creating interactive web apps and automation tools. Skilled in JavaScript, Python, and system scripting. Always exploring new technologies to push creativity and productivity. Enjoys building open-source tools, experimenting with UI/UX, and teaching others through live projects.
--------------------------------`);
        logToDiscord(cmd,"Displayed about me");
      });
      break;
    case "contact":
      fakeProgress().then(()=>{
        print(`[CONTACT]
--------------------------------`);
        print(`Email : example@mail.com
Discord : Philaphatz#1234
GitHub  : https://github.com/philaphatz`);
        logToDiscord(cmd,"Displayed contact info");
      });
      break;
    case "run":
      if(!args[1]) {print("Usage: run [facebook|instagram|linktree|email]"); return;}
      fakeProgress().then(()=>{
        let url="";
        if(args[1]==="facebook") url="https://facebook.com/";
        if(args[1]==="instagram") url="https://instagram.com/";
        if(args[1]==="linktree") url="https://linktr.ee/philaphatz.work";
        if(args[1]==="email") url="mailto:example@mail.com";
        if(url){window.open(url,"_blank"); print(`[OK] Redirected to ${args[1]}`); logToDiscord(cmd,`Opened ${args[1]}`);}
        else print("Invalid run target");
      });
      break;
    case "donate":
      fakeProgress().then(()=>{
        print(`[DONATE MODULE]
Scan the QR below to support me!
PayPal: https://paypal.me/philaphatz`);
        let div=document.createElement("div");
        div.className="qr-container";
        div.innerHTML=`<img src="https://promptpay.io/0930401105.png" alt="PromptPay QR">`;
        output.appendChild(div);
        logToDiscord(cmd,"Displayed donate QR");
      });
      break;
    case "time":
      print(`[TIME] ${new Date().toLocaleString()}`);
      logToDiscord(cmd,"Showed time");
      break;
    case "echo":
      print(cmd.replace("echo ",""));
      logToDiscord(cmd,"Echoed text");
      break;
    case "back":
      window.open("https://linktr.ee/philaphatz.work","_blank");
      print("[OK] Back to Linktree");
      logToDiscord(cmd,"Back to Linktree");
      break;
    default:
      print(`[ERROR] Unknown command: ${cmd} (type 'help' for list)`);
      logToDiscord(cmd,"Unknown command");
  }
}

input.addEventListener("keydown",e=>{
  if(e.key==="Enter"){
    const cmd=input.value.trim();
    if(!cmd) return;
    print("> " + cmd);
    runCommand(cmd);
    input.value="";
  }
});

showHelp();
logToDiscord("session_start","User opened terminal");
