// Configs
const LINKTREE_MAIN = "https://linktr.ee/philaphatz.work";
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1399043773614526545/zAonOKE2JM8N3zz_cp96KdsbyrSusP3K_sRubo99MMPVRK0qVhu6aCAru6a9JJNMiJu";

// Social links
const SOCIAL_LINKS = {
  facebook: "https://facebook.com/iphilaphatz",
  instagram: "https://instagram.com/iphilaphatz",
  linktree: LINKTREE_MAIN,
  email: "mailto:iphilaphatz@example.com",
};

// Session & fingerprint
let sessionId = null;
let fpData = null;

// Terminal elements
const output = document.getElementById("output");
const inputForm = document.getElementById("input-form");
const input = document.getElementById("input");
const lofiAudio = document.getElementById("lofi-audio");

// Utility for delay
const wait = (ms) => new Promise((res) => setTimeout(res, ms));

// Print line to terminal
function printLine(text = "", className = "") {
  const line = document.createElement("div");
  if (className) line.classList.add(className);
  line.textContent = text;
  output.appendChild(line);
  output.scrollTop = output.scrollHeight;
}

// Print HTML line to terminal
function printHTML(html) {
  const div = document.createElement("div");
  div.innerHTML = html;
  output.appendChild(div);
  output.scrollTop = output.scrollHeight;
}

// Clear terminal output
function clearTerminal() {
  output.innerHTML = "";
}

// Progress bar animation
async function showProgress(text = "Loading...", duration = 2500) {
  printLine(text);
  const container = document.createElement("div");
  container.classList.add("progress-bar-container");
  const bar = document.createElement("div");
  bar.classList.add("progress-bar");
  container.appendChild(bar);
  output.appendChild(container);
  output.scrollTop = output.scrollHeight;

  const steps = 50;
  for (let i = 0; i <= steps; i++) {
    bar.style.width = `${(i / steps) * 100}%`;
    await wait(duration / steps);
  }
  container.remove();
}

// Display welcome message with hint to help
function showWelcome() {
  clearTerminal();
  printLine("Welcome to Philaphatz Terminal!");
  printLine("Type 'help' or '?' to see available commands.");
  printLine("");
}

// Format timestamp
function getTimeString() {
  const now = new Date();
  return now.toLocaleString();
}

// Send logs to Discord webhook
async function sendLogToDiscord(command, extra = "") {
  if (!fpData || !sessionId) return;
  const embed = {
    title: "Terminal Command Log",
    color: 0x6acd3c,
    fields: [
      { name: "Session ID", value: sessionId, inline: true },
      { name: "Command", value: command, inline: true },
      { name: "Timestamp", value: getTimeString(), inline: false },
      { name: "Fingerprint", value: JSON.stringify(fpData, null, 2).substring(0, 500), inline: false },
      { name: "Extra Info", value: extra || "-", inline: false },
    ],
  };
  try {
    await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    });
  } catch (e) {
    // Fail silently
  }
}

// Handle command input
inputForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const raw = input.value.trim();
  if (!raw) return;
  input.value = "";

  const args = raw.split(/\s+/);
  const cmd = args[0].toLowerCase();

  // Show command entered
  printLine(`> ${raw}`, "command-text");

  // Command handling logic
  switch (cmd) {
    case "c":
    case "clear":
      clearTerminal();
      showWelcome();
      await sendLogToDiscord(raw);
      break;

    case "help":
    case "?":
      showHelp();
      await sendLogToDiscord(raw);
      break;

    case "back":
      await showProgress("Redirecting to main Linktree page...", 3000);
      window.open(LINKTREE_MAIN, "_blank", "noopener");
      printLine("Opened main Linktree page.");
      await sendLogToDiscord(raw);
      break;

    case "run":
      if (args.length < 2) {
        printLine("Usage: run [facebook|instagram|linktree|email]", "error-text");
        break;
      }
      const site = args[1].toLowerCase();
      if (!SOCIAL_LINKS[site]) {
        printLine(`Unknown site '${site}'. Type 'help' or '?' for commands.`, "error-text");
        break;
      }
      await showProgress(`Opening ${site}...`, 3000);
      window.open(SOCIAL_LINKS[site], "_blank", "noopener");
      printLine(`Opened ${site}.`);
      await sendLogToDiscord(raw);
      break;

    case "donate":
      await showProgress("Preparing donation details...", 3000);
      showDonateSection();
      await sendLogToDiscord(raw);
      break;

    case "about":
    case "whoami":
      await showProgress("Loading profile info...", 3000);
      showAboutSection();
      await sendLogToDiscord(raw);
      break;

    case "time":
      printLine(`Current time: ${getTimeString()}`);
      await sendLogToDiscord(raw);
      break;

    case "contact":
      await showProgress("Loading contact info...", 3000);
      showContactSection();
      await sendLogToDiscord(raw);
      break;

    case "echo":
      if (args.length < 2) {
        printLine("Usage: echo [text]", "error-text");
        break;
      }
      printLine(args.slice(1).join(" "));
      await sendLogToDiscord(raw);
      break;

    default:
      printLine(`Unknown command '${raw}'. Type 'help' or '?' to see available commands.`, "error-text");
      break;
  }
  output.scrollTop = output.scrollHeight;
});

// Show help text
function showHelp() {
  clearTerminal();
  printLine("Available commands:", "command-text");
  printLine("c, clear          - Clear the terminal");
  printLine("back              - Open main Linktree page");
  printLine("run [site]        - Open social link (facebook, instagram, linktree, email)");
  printLine("donate            - Show donation QR PromptPay");
  printLine("about, whoami     - Show profile information");
  printLine("time              - Show current time");
  printLine("contact           - Show contact information");
  printLine("echo [text]       - Display text");
  printLine("help, ?           - Show this help text");
}

// Show donate section with QR and glow
function showDonateSection() {
  clearTerminal();
  printLine("Thank you for your support!", "command-text");
  printLine("Scan the PromptPay QR code below to donate:", "");
  const qrHTML = `
    <img src="https://chart.googleapis.com/chart?chs=180x180&cht=qr&chl=00020101021126360014A0000006770101110113006609304011055204581253037645802TH63046A94"
      alt="PromptPay QR Code" class="qr-glow" />
  `;
  printHTML(qrHTML);
}

// Show about section
function showAboutSection() {
  clearTerminal();
  printLine("About Me:", "command-text");
  const aboutHTML = `
  <div class="section">
    <p>Hello! I'm Philaphatz, a full-stack developer with over 10 years of experience.</p>
    <p>I specialize in web development, shell scripting, and automation.</p>
    <div class="grid">
      <div class="grid-item"><b>Skills</b><br>JavaScript, Python, Bash, React, Node.js</div>
      <div class="grid-item"><b>Projects</b><br>Custom terminal apps, automation tools, APIs</div>
      <div class="grid-item"><b>Interests</b><br>Open source, DevOps, Cloud Computing</div>
    </div>
  </div>
  `;
  printHTML(aboutHTML);
}

// Show contact section
function showContactSection() {
  clearTerminal();
  printLine("Contact Information:", "command-text");
  const contactHTML = `
  <div class="section">
    <div class="grid">
      <div class="grid-item"><b>Email</b><br>iphilaphatz@example.com</div>
      <div class="grid-item"><b>Phone</b><br>+66 930 401 105</div>
      <div class="grid-item"><b>Location</b><br>Bangkok, Thailand</div>
      <div class="grid-item"><b>Website</b><br><a href="${LINKTREE_MAIN}" target="_blank" rel="noopener">Linktree</a></div>
    </div>
  </div>
  `;
  printHTML(contactHTML);
}

// Initialize fingerprint & session id
async function initFingerprint() {
  const fp = await FingerprintJS.load();
  const result = await fp.get();
  sessionId = crypto.randomUUID();
  fpData = result.visitorId;
  // You can expand fpData to get full result.details if needed
}

// Start lofi audio
function startLofi() {
  lofiAudio.volume = 0.05;
  lofiAudio.play().catch(() => {});
}

// Init app
async function init() {
  await initFingerprint();
  startLofi();
  showWelcome();
  input.focus();
}

window.onload = init;
