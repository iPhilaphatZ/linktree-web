const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1399043773614526545/zAonOKE2JM8N3zz_cp96KdsbyrSusP3K_sRubo99MMPVRK0qVhu6IuCAru6a9JJNMiJu";

const output = document.getElementById("terminal-output");
const input = document.getElementById("command-input");
const donateModal = document.getElementById("donate-modal");
const closeModal = document.getElementById("close-modal");

// Generate QR for PayPal
QRCode.toCanvas(document.getElementById('paypal-qr'), "https://paypal.me/philaphatz", {
  width: 150
});

// Terminal Input
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const command = input.value.trim();
    handleCommand(command);
    input.value = "";
  }
});

// Handle Commands
async function handleCommand(cmd) {
  printToTerminal(`> ${cmd}`);
  if (!cmd) return;
  
  const [main, ...args] = cmd.split(" ");
  
  switch (main.toLowerCase()) {
    case "help":
      await showProgress();
      printToTerminal("Available commands:\n- c / clear\n- back\n- run [facebook|instagram|linktree|email]\n- donate\n- about / whoami\n- time\n- contact\n- echo [text]");
      break;
    case "c":
    case "clear":
      output.innerHTML = "";
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
        email: "mailto:someone@example.com"
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
      printToTerminal("About Me:\n- Name: PhilaphatZ\n- Role: Developer / Automation & Web Enthusiast\n- Skills: Shell Script, Web Dev, Automation\n- Status: Always Learning & Sharing");
      break;
    case "time":
      const now = new Date();
      printToTerminal(`Current Time: ${now.toLocaleString()}`);
      break;
    case "contact":
      await showProgress();
      printToTerminal("Contact Info:\n- Email: philaphatz@example.com\n- Linktree: https://linktr.ee/philaphatz.work");
      break;
    case "echo":
      printToTerminal(args.join(" "));
      break;
    default:
      printToTerminal("Unknown command. Type help to see available commands.");
  }

  if (main !== "echo" && main !== "time") sendLog(cmd);
}

// Progress Bar
function showProgress() {
  return new Promise((resolve) => {
    const bar = document.createElement("div");
    bar.classList.add("progress-bar");
    const fill = document.createElement("div");
    fill.classList.add("progress-bar-fill");
    bar.appendChild(fill);
    output.appendChild(bar);
    let width = 0;
    const interval = setInterval(() => {
      width += Math.random() * 20;
      if (width >= 100) {
        fill.style.width = "100%";
        clearInterval(interval);
        setTimeout(() => {
          bar.remove();
          resolve();
        }, 300);
      } else {
        fill.style.width = width + "%";
      }
    }, 200);
  });
}

// Print to Terminal
function printToTerminal(text) {
  const p = document.createElement("p");
  p.textContent = text;
  output.appendChild(p);
  output.scrollTop = output.scrollHeight;
}

// Logs to Discord
async function sendLog(command) {
  const info = await collectClientInfo();
  const payload = {
    content: `📝 Command: ${command}\n🕒 Time: ${new Date().toLocaleString()}\n🌐 IP: ${info.ip} (${info.city}, ${info.country})\n💻 Device: ${info.device} | ${info.browser}\n🔋 Battery: ${info.battery}\n📶 Network: ${info.network}\n🎮 GPU: ${info.gpu} | CPU: ${info.cpu}\n🔗 Referrer: ${document.referrer || 'Direct'}`
  };
  fetch(DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}

// Collect Client Info
async function collectClientInfo() {
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
    gpu: gpu,
    cpu: navigator.hardwareConcurrency || "Unknown"
  };
}

function getGPU() {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl');
  if (!gl) return "Unknown";
  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  return debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : "Unknown";
}

// Close Donate Modal
closeModal.addEventListener("click", () => {
  donateModal.classList.add("hidden");
});
