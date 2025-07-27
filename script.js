const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1399043773614526545/zAonOKE2JM8N3zz_cp96KdsbyrSusP3K_sRubo99MMPVRK0qVhu6IuCAru6a9JJNMiJu";

const output = document.getElementById("terminal-output");
const input = document.getElementById("command-input");
const form = document.getElementById("terminal-form");
const donateModal = document.getElementById("donate-modal");
const closeModal = document.getElementById("close-modal");

// Play subtle lofi typing sound loop
const audioPlayer = new Audio("https://cdn.pixabay.com/download/audio/2022/03/17/audio_53070372e3.mp3?filename=lofi-beat-ambient-11652.mp3");
audioPlayer.volume = 0.04;
audioPlayer.loop = true;
audioPlayer.play().catch(() => {}); // ignore play() errors (e.g. user didn't interact)

// Generate QR for PayPal and PromptPay
QRCode.toCanvas(document.getElementById("paypal-qr"), "https://paypal.me/philaphatz", { width: 150 });
QRCode.toCanvas(document.getElementById("promptpay-qr"), "https://promptpay.io/0930401105", { width: 150 });

// Handle form submit (Enter key)
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const cmd = input.value.trim();
  if (!cmd) return;
  input.value = "";
  printToTerminal(`> ${cmd}`, false);
  await handleCommand(cmd);
});

// Commands list
const commandsList = [
  "c / clear",
  "back",
  "run [facebook|instagram|linktree|email]",
  "donate",
  "about / whoami",
  "time",
  "contact",
  "echo [text]",
  "help / ?",
];

// Show help text (only once on load and on clear)
function printHelp() {
  const helpText = `Available commands:\n- ${commandsList.join("\n- ")}`;
  printToTerminal(helpText, true);
}

// Main command handler
async function handleCommand(cmd) {
  const [main, ...args] = cmd.toLowerCase().split(" ");
  switch (main) {
    case "help":
    case "?":
      await showProgress();
      printHelp();
      break;
    case "c":
    case "clear":
      output.innerHTML = "";
      printHelp();
      break;
    case "back":
      await showProgress();
      window.open("https://linktr.ee/philaphatz.work", "_blank");
      break;
    case "run":
      await showProgress();
      const site = args[0];
      const links = {
        facebook: "https://facebook.com/",
        instagram: "https://instagram.com/",
        linktree: "https://linktr.ee/philaphatz.work",
        email: "mailto:someone@example.com",
      };
      if (links[site]) {
        printToTerminal(`Running ${site}...`);
        window.open(links[site], "_blank");
      } else {
        printToTerminal("Invalid run command.");
      }
      break;
    case "donate":
      donateModal.classList.remove("hidden");
      break;
    case "about":
    case "whoami":
      await showProgress();
      printToTerminal(
        `About Me:\n- Name: PhilaphatZ\n- Role: Developer / Automation & Web Enthusiast\n- Skills: Shell Script, Web Dev, Automation\n- Status: Always Learning & Sharing`,
        true
      );
      break;
    case "time":
      const now = new Date();
      printToTerminal(`Current Time: ${now.toLocaleString()}`);
      break;
    case "contact":
      await showProgress();
      printToTerminal(
        `Contact Info:\n- Email: philaphatz@example.com\n- Linktree: https://linktr.ee/philaphatz.work`,
        true
      );
      break;
    case "echo":
      if (args.length > 0) printToTerminal(args.join(" "));
      break;
    default:
      printToTerminal("Unknown command. Type help to see available commands.");
  }
  if (main !== "echo" && main !== "time") sendLog(cmd);
}

// Progress bar with smooth animation
function showProgress() {
  return new Promise((resolve) => {
    const bar = document.createElement("div");
    bar.classList.add("progress-bar");
    const fill = document.createElement("div");
    fill.classList.add("progress-bar-fill");
    bar.appendChild(fill);
    output.appendChild(bar);
    output.scrollTop = output.scrollHeight;

    let width = 0;
    const interval = setInterval(() => {
      width += Math.random() * 10 + 5; // slower smoother progress
      if (width >= 100) {
        fill.style.width = "100%";
        clearInterval(interval);
        setTimeout(() => {
          bar.remove();
          resolve();
        }, 350);
      } else {
        fill.style.width = `${width}%`;
      }
    }, 150);
  });
}

// Print text or multiline as preformatted block
function printToTerminal(text, isPre = false) {
  if (!text) return;
  if (isPre) {
    const pre = document.createElement("pre");
    pre.classList.add("cmd-output");
    pre.textContent = text;
    output.appendChild(pre);
  } else {
    const p = document.createElement("p");
    p.textContent = text;
    output.appendChild(p);
  }
  output.scrollTop = output.scrollHeight;
}

// Logs to Discord webhook with code block JSON highlight
async function sendLog(command) {
  const info = await collectClientInfo();
  const logObject = {
    command,
    time: new Date().toISOString(),
    ip: info.ip,
    location: `${info.city}, ${info.country}`,
    device: info.device,
    browser: info.browser,
    battery: info.battery,
    network: info.network,
    gpu: info.gpu,
    cpu: info.cpu,
    referrer: document.referrer || "Direct",
  };
  const content = "```json\n" + JSON.stringify(logObject, null, 2) + "\n```";

  fetch(DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
}

// Collect device info
async function collectClientInfo() {
  try {
    const res = await fetch("https://ipapi.co/json");
    const data = await res.json();
    const battery = await navigator.getBattery();
    const gpu = getGPU();
    return {
      ip: data.ip,
      city: data.city,
      country: data.country_name,
      device: navigator.platform,
      browser: navigator.userAgent,
      battery: `${Math.round(battery.level * 100)}% (Charging: ${battery.charging})`,
      network: navigator.connection ? navigator.connection.effectiveType : "Unknown",
      gpu,
      cpu: navigator.hardwareConcurrency || "Unknown",
    };
  } catch {
    return {
      ip: "Unknown",
      city: "Unknown",
      country: "Unknown",
      device: navigator.platform,
      browser: navigator.userAgent,
      battery: "Unknown",
      network: "Unknown",
      gpu: "Unknown",
      cpu: "Unknown",
    };
  }
}

// Get GPU info using WebGL debug extension
function getGPU() {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return "Unknown";
    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    return debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : "Unknown";
  } catch {
    return "Unknown";
  }
}

// Close modal button
closeModal.addEventListener("click", () => {
  donateModal.classList.add("hidden");
});

// Close modal on clicking outside modal content
donateModal.addEventListener("click", (e) => {
  if (e.target === donateModal) donateModal.classList.add("hidden");
});
