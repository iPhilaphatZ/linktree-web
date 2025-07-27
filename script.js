const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1399043773614526545/zAonOKE2JM8N3zz_cp96KdsbyrSusP3K_sRubo99MMPVRK0qVhu6IuCAru6a9JJNMiJu";

const output = document.getElementById("terminal-output");
const input = document.getElementById("command-input");
const donateModal = document.getElementById("donate-modal");
const closeModal = document.getElementById("close-modal");

let sessionId = localStorage.getItem("sessionId");
if (!sessionId) {
  sessionId = crypto.randomUUID();
  localStorage.setItem("sessionId", sessionId);
}

let fingerprint = null;
FingerprintJS.load().then(fp => fp.get()).then(result => {
  fingerprint = result.visitorId;
});

// Generate QR for PayPal (once)
QRCode.toCanvas(document.getElementById('paypal-qr'), "https://paypal.me/philaphatz", { width: 150 });

// Print text to terminal output
function printToTerminal(text, isError = false) {
  const p = document.createElement("p");
  p.textContent = text;
  if (isError) p.style.color = "#ff5c5c";
  output.appendChild(p);
  output.scrollTop = output.scrollHeight;
}

// Show progress bar animation, resolve promise when done
function showProgress() {
  return new Promise((resolve) => {
    const bar = document.createElement("div");
    bar.classList.add("progress-bar");
    const fill = document.createElement("div");
    fill.classList.add("progress-bar-fill");
    bar.appendChild(fill);
    output.appendChild(bar);

    let width = 0;
    let speed = Math.random() * 15 + 10; // Random speed for fun effect

    const interval = setInterval(() => {
      width += speed * (Math.random() * 0.7 + 0.3);
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
    }, 150);
  });
}

// Collect detailed client info async
async function collectClientInfo() {
  let ip = "Unknown", city = "Unknown", country = "Unknown", isp = "Unknown";

  try {
    const res = await fetch("https://ipapi.co/json");
    if (res.ok) {
      const data = await res.json();
      ip = data.ip || ip;
      city = data.city || city;
      country = data.country_name || country;
      isp = data.org || isp;
    }
  } catch {}

  const device = navigator.platform || "Unknown";
  const browser = navigator.userAgent || "Unknown";
  const screen = `${window.screen.width}x${window.screen.height}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown";
  const language = navigator.language || "Unknown";
  const dark_mode = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

  // Battery info
  let battery_level = "Unknown", charging = "Unknown";
  try {
    const battery = await navigator.getBattery();
    battery_level = Math.round(battery.level * 100) + "%";
    charging = battery.charging ? "Yes" : "No";
  } catch {}

  // Network info
  let network_type = "Unknown", connection_speed = "Unknown";
  try {
    if (navigator.connection) {
      network_type = navigator.connection.effectiveType || network_type;
      connection_speed = navigator.connection.downlink ? navigator.connection.downlink + "Mbps" : connection_speed;
    }
  } catch {}

  const cpu_cores = navigator.hardwareConcurrency || "Unknown";

  // GPU info (WebGL)
  let gpu_vendor = "Unknown", gpu_renderer = "Unknown";
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (gl) {
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if (debugInfo) {
        gpu_vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || gpu_vendor;
        gpu_renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || gpu_renderer;
      }
    }
  } catch {}

  const referrer = document.referrer || "Direct";

  return {
    ip, city, country, isp,
    device, browser, screen,
    timezone, language, dark_mode,
    battery_level, charging,
    network_type, connection_speed,
    cpu_cores,
    gpu_vendor, gpu_renderer,
    referrer
  };
}

// Send log with detailed JSON codeblock
async function sendLog(command) {
  if (!fingerprint) return; // wait fingerprint ready

  const info = await collectClientInfo();

  const logData = {
    session_id: sessionId,
    fingerprint: fingerprint,
    timestamp: new Date().toISOString(),
    command: command,
    ip: info.ip,
    city: info.city,
    country: info.country,
    isp: info.isp,
    device: info.device,
    browser: info.browser,
    screen: info.screen,
    timezone: info.timezone,
    language: info.language,
    dark_mode: info.dark_mode,
    battery_level: info.battery_level,
    charging: info.charging,
    network_type: info.network_type,
    connection_speed: info.connection_speed,
    cpu_cores: info.cpu_cores,
    gpu_vendor: info.gpu_vendor,
    gpu_renderer: info.gpu_renderer,
    referrer: info.referrer
  };

  const payload = {
    content: "```json\n" + JSON.stringify(logData, null, 2) + "\n```"
  };

  try {
    await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch (e) {
    console.warn("Discord webhook failed:", e);
  }
}

// Handle command input and logic
async function handleCommand(cmd) {
  printToTerminal(`> ${cmd}`);

  if (!cmd) return;

  const [main, ...args] = cmd.toLowerCase().split(" ");

  // Commands that do NOT require progress bar
  const fastCommands = ["time", "echo"];

  if (!fastCommands.includes(main)) {
    await showProgress();
  }

  switch (main) {
    case "help":
    case "?":
      printToTerminal(
`Available commands:
- c / clear
- back
- run [facebook|instagram|linktree|email]
- donate
- about / whoami
- time
- contact
- echo [text]`
      );
      break;

    case "c":
    case "clear":
      output.innerHTML = "";
      break;

    case "back":
      printToTerminal("Redirecting to Linktree...");
      window.open("https://linktr.ee/philaphatz.work", "_blank");
      break;

    case "run":
      if (!args[0]) {
        printToTerminal("Please specify a target: facebook, instagram, linktree, or email.", true);
        break;
      }
      const links = {
        facebook: "https://facebook.com/",
        instagram: "https://instagram.com/",
        linktree: "https://linktr.ee/philaphatz.work",
        email: "mailto:someone@example.com"
      };
      if (links[args[0]]) {
        printToTerminal(`Opening ${args[0]}...`);
        window.open(links[args[0]], "_blank");
      } else {
        printToTerminal("Invalid run target.", true);
      }
      break;

    case "donate":
      donateModal.classList.remove("hidden");
      break;

    case "about":
    case "whoami":
      printToTerminal(`About Me:
- Name: PhilaphatZ
- Role: Educator / Dev&Ops
- Skills: Shell Script, Web Dev, Automation
- Status: Talk nerdy, To Me`);
      break;

    case "time":
      printToTerminal(`Current Time: ${new Date().toLocaleString()}`);
      break;

    case "contact":
      printToTerminal(`Contact Info:
- Email: philaphatz@icloud.com
- Linktree: https://linktr.ee/philaphatz.work`);
      break;

    case "echo":
      printToTerminal(args.join(" "));
      break;

    default:
      printToTerminal("Unknown command. Type help to see available commands.", true);
  }

  if (!fastCommands.includes(main)) {
    sendLog(cmd); // async fire & forget
  }
}

// Event Listeners
input.addEventListener("keydown", async (e) => {
  if (e.key === "Enter") {
    const cmd = input.value.trim();
    input.value = "";
    await handleCommand(cmd);
  }
});

closeModal.addEventListener("click", () => {
  donateModal.classList.add("hidden");
});
