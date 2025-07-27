const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxPwLScT8AQo-FRKXAT8QiSPazsjOxvwXMsbhzPuXIO2WW6VxUy_2_cPqN7gsl-Sj-I/exec";
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/123456789012345678/AbCdEfGhIjKlMnOpQrStUvWxYz";

const output = document.getElementById("output");
const commandInput = document.getElementById("command");

// Local Logs
let localLogs = [];

// Typewriter print
function print(text, type = "normal") {
  const p = document.createElement("p");
  if (type === "ok") p.style.color = "#00ff88";
  if (type === "error") p.style.color = "#ff4444";
  p.textContent = text;
  output.appendChild(p);
  output.scrollTop = output.scrollHeight;
}

// Command Handler
commandInput.addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    const cmd = commandInput.value.trim();
    handleCommand(cmd);
    commandInput.value = "";
  }
});

function handleCommand(cmd) {
  print(`> ${cmd}`);
  if (!cmd) return;

  if (cmd === "help") {
    print("Available commands:");
    print("- help : Show commands");
    print("- theme list : Show themes");
    print("- theme [name] : Change theme");
    print("- testlogs : Test logging & notify");
    print("- showlogs : Show local logs");
    return;
  }

  if (cmd.startsWith("theme")) {
    if (cmd === "theme list") {
      print("Themes: cyberpunk, matrix, neon, light");
    } else {
      const theme = cmd.split(" ")[1];
      changeTheme(theme);
    }
    return;
  }

  if (cmd === "testlogs") {
    logAndNotify("test-command");
    return;
  }

  if (cmd === "showlogs") {
    showLocalLogs();
    return;
  }

  // Default: Log any command
  logAndNotify(cmd);
}

// Change Theme
function changeTheme(theme) {
  const validThemes = ["cyberpunk", "matrix", "neon", "light"];
  if (!validThemes.includes(theme)) {
    print("Invalid theme. Use: theme list", "error");
    return;
  }
  document.body.className = `theme-${theme}`;
  print(`Theme changed to ${theme}`, "ok");
}

// Logs & Notify
function logAndNotify(command) {
  localLogs.push({ time: new Date().toLocaleString(), command });

  // Google Sheets Log
  fetch(GOOGLE_APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command, userAgent: navigator.userAgent }),
  })
  .then(res => {
    if (!res.ok) throw new Error("HTTP " + res.status);
    print(`[OK] Google Sheets logged: ${command}`, "ok");
  })
  .catch(err => {
    print("[ERROR] Google Sheets Failed: " + err.message, "error");
  });

  // Discord Notify
  fetch(DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: `[LOG] ${command} | ${new Date().toLocaleString()}` }),
  })
  .then(res => {
    if (!res.ok) throw new Error("HTTP " + res.status);
    print(`[OK] Discord notified: ${command}`, "ok");
  })
  .catch(err => {
    print("[ERROR] Discord Failed: " + err.message, "error");
  });
}

// Show Local Logs
function showLocalLogs() {
  print("Local Logs:");
  localLogs.forEach(log => {
    print(`${log.time} - ${log.command}`);
  });
}
