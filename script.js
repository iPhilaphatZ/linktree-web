// ===== Constants =====
const BACK_LINK = "https://linktr.ee/philaphatz.work";
const PROMPTPAY_NUMBER = "0930401105";
const DISCORD_WEBHOOKS = [
  "https://discord.com/api/webhooks/1399043773614526545/zAonOKE2JM8N3zz_cp96KdsbyrSusP3K_sRubo99MMPVRK0qVhu6IuCAru6a9JJNMiJu",
  "https://discord.com/api/webhooks/1399056039411847330/Gz4p2lxYeV1JbYHfXUa9idXq044dNGDWSjCGqf2kX6icHobHjZa97p5ETsPYf8GiSASn"
];

// Social links placeholder (user fills)
const SOCIAL_LINKS = {
  facebook: "https://facebook.com/yourusername",
  instagram: "https://instagram.com/yourusername",
  linktree: "https://linktr.ee/yourusername",
  email: "mailto:your.email@example.com"
};

// Typing sound toggle (true to enable)
const TYPING_SOUND_ENABLED = true;

// Variables
const terminalOutput = document.getElementById("terminal-output");
const commandForm = document.getElementById("command-form");
const commandInput = document.getElementById("command-input");
const progressContainer = document.getElementById("progress-container");
const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");
const lofiAudio = document.getElementById("lofi-audio");

let fingerprint = null;
let sessionId = generateSessionId();
let isProcessing = false;

// Init lo-fi audio softly
lofiAudio.volume = 0.08;
lofiAudio.play().catch(() => { /* Autoplay may be blocked, ignore */ });

// Generate Session ID (random 8 char hex)
function generateSessionId() {
  return Math.random().toString(16).slice(2, 10);
}

// Utility: Sleep for ms
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Utility: Escape HTML
function escapeHTML(str) {
  return str.replace(/[&<>"']/g, function (m) {
    return (
      {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[m] || m
    );
  });
}

// Typewriter effect: print text char by char
async function typeWriter(text, element, speed = 30) {
  element.textContent = "";
  for (let i = 0; i < text.length; i++) {
    element.textContent += text.charAt(i);
    if (TYPING_SOUND_ENABLED) playTypingSound();
    await sleep(speed);
  }
}

// Play typing sound effect (simple beep)
function playTypingSound() {
  if (!TYPING_SOUND_ENABLED) return;
  // We are using lo-fi ambient so no per keystroke sound here
  // Can implement here if you want per key click
}

// Append text line to terminal output (with optional CSS class)
function appendLine(text, cssClass = "") {
  const line = document.createElement("div");
  line.className = cssClass;
  line.textContent = text;
  terminalOutput.appendChild(line);
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

// Append HTML section block (used for whoami, contact, etc.)
function appendSection(title, htmlContent) {
  const section = document.createElement("section");
  section.className = "output-section";
  const h2 = document.createElement("h2");
  h2.textContent = title;
  section.appendChild(h2);
  const contentDiv = document.createElement("div");
  contentDiv.innerHTML = htmlContent;
  section.appendChild(contentDiv);
  terminalOutput.appendChild(section);
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

// Clear terminal output
function clearTerminal() {
  terminalOutput.innerHTML = "";
}

// Show progress bar with fake loading
async function showProgressBar(duration = 2500) {
  progressContainer.style.display = "block";
  progressBar.style.width = "0%";

  const messages = [
    "Initializing connection...",
    "Loading data packets...",
    "Decrypting response...",
    "Finalizing output..."
  ];

  let startTime = performance.now();
  let endTime = startTime + duration;

  while (performance.now() < endTime) {
    let elapsed = performance.now() - startTime;
    let percent = Math.min(100, Math.floor((elapsed / duration) * 100));
    progressBar.style.width = percent + "%";

    // Change message every 25%
    let msgIndex = Math.floor(percent / 25);
    progressText.textContent = messages[msgIndex] || "Completing...";

    await sleep(100);
  }
  progressBar.style.width = "100%";
  progressText.textContent = "Done!";
  await sleep(400);
  progressContainer.style.display = "none";
  progressBar.style.width = "0%";
  progressText.textContent = "";
}

// Send logs to all Discord webhooks as rich embed
async function sendLogs(command, extraData = {}) {
  if (!fingerprint) return; // wait fingerprint ready

  // Get IP, location from free API (can fail silently)
  let ipInfo = {};
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (res.ok) ipInfo = await res.json();
  } catch {}

  // Prepare embed data
  const embed = {
    title: `🖥️ Command Executed: ${command}`,
    color: 3066993, // Green color
    fields: [
      { name: "Session ID", value: sessionId, inline: true },
      { name: "Timestamp", value: new Date().toISOString(), inline: true },
      { name: "IP & Location", value: `${ipInfo.ip || "Unknown"} (${ipInfo.city || "?"}, ${ipInfo.region || "?"}, ${ipInfo.country_name || "?"})`, inline: false },
      { name: "Device Info", value: `${navigator.platform} | ${navigator.userAgent}`, inline: false },
      { name: "Fingerprint", value: fingerprint.visitorId || "N/A", inline: false },
      { name: "Battery", value: await getBatteryInfo(), inline: true },
      { name: "Network", value: navigator.connection ? navigator.connection.effectiveType : "Unknown", inline: true },
      { name: "Referrer", value: document.referrer || "None", inline: false }
    ]
  };

  // Append extra data if any
  for (const [k, v] of Object.entries(extraData)) {
    embed.fields.push({ name: k, value: v, inline: false });
  }

  // Discord message payload
  const payload = {
    embeds: [embed]
  };

  // Send to all webhooks
  for (const url of DISCORD_WEBHOOKS) {
    try {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.error("Discord webhook error:", e);
    }
  }
}

// Get Battery info nicely formatted
async function getBatteryInfo() {
  if (!navigator.getBattery) return "N/A";
  try {
    const battery = await navigator.getBattery();
    return `${Math.round(battery.level * 100)}% (Charging: ${battery.charging})`;
  } catch {
    return "N/A";
  }
}

// Handle command execution
async function handleCommand(cmdRaw) {
  if (isProcessing) return; // Prevent multiple simultaneous commands

  const cmd = cmdRaw.trim();
  if (!cmd) return;

  isProcessing = true;
  clearTerminal();

  const parts = cmd.split(" ");
  const mainCmd = parts[0].toLowerCase();
  const arg = parts.slice(1).join(" ");

  if (cmd === "help") {
  clearTerminal();
  appendLine("Available commands:", "highlight");
  appendLine("c or clear       - Clear the terminal");
  appendLine("back             - Open main Linktree page");
  appendLine("run [name]       - Open social link (facebook, instagram, linktree, email)");
  appendLine("donate           - Show donation QR code");
  appendLine("about or whoami  - About me section");
  appendLine("time             - Show current time");
  appendLine("contact          - Show contact information");
  appendLine("echo [text]      - Display your text");
  appendLine("help             - Show this help message");
  return;
}


  // Commands that bypass loading
  const instantCommands = ["time", "echo"];

  // Show progress bar for most commands except instantCommands
  if (!instantCommands.includes(mainCmd)) {
    await showProgressBar(3000);
  }

  switch (mainCmd) {
    case "c":
    case "clear":
      clearTerminal();
      appendLine("Terminal cleared.", "highlight");
      break;

    case "back":
      appendLine("Redirecting to main Linktree...", "highlight");
      window.open(BACK_LINK, "_blank");
      break;

    case "run":
      if (!arg) {
        appendLine("Usage: run [facebook|instagram|linktree|email]", "highlight");
      } else {
        const url = SOCIAL_LINKS[arg.toLowerCase()];
        if (url) {
          appendLine(`Opening ${arg} in a new tab...`, "highlight");
          window.open(url, "_blank");
        } else {
          appendLine(`Unknown social link: ${arg}`, "highlight");
        }
      }
      break;

    case "donate":
      await showDonateSection();
      break;

    case "about":
    case "whoami":
      await showAboutSection();
      break;

    case "time":
      const now = new Date();
      appendLine(now.toLocaleString());
      break;

    case "contact":
      await showContactSection();
      break;

    case "echo":
      if (!arg) {
        appendLine("Usage: echo [text]", "highlight");
      } else {
        appendLine(arg);
      }
      break;

    default:
      appendLine(`Unknown command: ${cmd}`, "highlight");
  }

  // Send logs quietly (no UI notice)
  await sendLogs(cmd);

  isProcessing = false;
}

// Show About Section with grid & sections
async function showAboutSection() {
  const aboutHTML = `
    <div class="about-grid">
      <section>
        <h3>Profile</h3>
        <p>Philaphatz is a passionate developer and digital creator with over 10 years of experience building interactive web applications and tools. He enjoys exploring new technologies, especially in JavaScript, cloud computing, and automation.</p>
      </section>
      <section>
        <h3>Skills</h3>
        <ul>
          <li>JavaScript (ES6+), Node.js, React</li>
          <li>HTML5, CSS3, Responsive Design</li>
          <li>Shell scripting, Automation tools</li>
          <li>Cloud APIs and Webhooks</li>
          <li>UI/UX and Animation Design</li>
        </ul>
      </section>
      <section>
        <h3>Projects</h3>
        <ul>
          <li>Linktree Custom Terminal Interface</li>
          <li>Discord Webhook Analytics Logger</li>
          <li>Advanced PromptPay Donation System</li>
          <li>Interactive Terminal UI with Animations</li>
        </ul>
      </section>
      <section>
        <h3>About Me</h3>
        <p>This terminal is designed to be minimal yet powerful, offering custom commands and smooth interactions. It's perfect for showcasing social links while providing a sleek user experience.</p>
      </section>
    </div>
  `;
  appendSection("About Me", aboutHTML);
}

// Show Contact Section with grid & sections
async function showContactSection() {
  const contactHTML = `
    <div class="contact-grid">
      <section>
        <h3>Email</h3>
        <p><a href="mailto:philaphatz@example.com">philaphatz@example.com</a></p>
      </section>
      <section>
        <h3>Phone</h3>
        <p>+66 930 401 105</p>
      </section>
      <section>
        <h3>Location</h3>
        <p>Bangkok, Thailand</p>
      </section>
      <section>
        <h3>Website</h3>
        <p><a href="https://philaphatz.work" target="_blank" rel="noopener">https://philaphatz.work</a></p>
      </section>
    </div>
  `;
  appendSection("Contact Info", contactHTML);
}

// Show Donate Section with QR PromptPay + animation
async function showDonateSection() {
  clearTerminal();

  appendLine("Preparing your donation options...\n", "highlight");

  await sleep(1000);

  const qrUrl = `https://promptpay.info/${PROMPTPAY_NUMBER}`;
  // Generate QR with Google Chart API (simple)
  const qrImgUrl = `https://chart.googleapis.com/chart?cht=qr&chs=180x180&chl=${encodeURIComponent(qrUrl)}`;

  const donateHTML = `
    <div id="donate-section">
      <p>Scan the QR code below to donate via PromptPay</p>
      <img id="donate-qr" src="${qrImgUrl}" alt="PromptPay QR Code" />
      <p class="highlight">Thank you for your support! ❤️</p>
    </div>
  `;

  appendSection("Donate", donateHTML);
}

// Get fingerprint with FingerprintJS
async function initFingerprint() {
  const fp = await FingerprintJS.load();
  fingerprint = await fp.get();
}

// Initialize
(async () => {
  await initFingerprint();

  // แสดงข้อความแนะนำตอนเปิดเว็บ
  appendLine("Welcome to the Custom Linktree Terminal!", "highlight");
  appendLine("Type 'help' to see available commands.\n", "highlight");

  // focus input และใส่ placeholder ชัดเจน
  commandInput.placeholder = "Type a command here and press Enter...";
  commandInput.focus();
})();


// Command form submit event
commandForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = commandInput.value.trim();
  if (!input) return;
  await handleCommand(input);
  commandInput.value = "";
});

// Scroll terminal output on new content
terminalOutput.addEventListener("DOMNodeInserted", () => {
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
});
