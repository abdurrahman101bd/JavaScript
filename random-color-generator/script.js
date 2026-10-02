const containerEl = document.querySelector(".container");
const toastEl = document.getElementById("toast");
const toastText = document.getElementById("toast-text");
const toastSwatch = document.getElementById("toast-swatch");
const generateBtn = document.getElementById("generate-btn");

document.getElementById("theme-switch").addEventListener("click", () => {
  document.body.classList.toggle("darkmode");
  const isDark = document.body.classList.contains("darkmode");
  localStorage.setItem("theme", isDark ? "dark" : "light");
});

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("darkmode");
}

const CARD_COUNT = 30;
const cards = [];

for (let i = 0; i < CARD_COUNT; i++) {
  const card = document.createElement("div");
  card.classList.add("color-container");

  const pill = document.createElement("span");
  pill.className = "hex-pill";

  const hint = document.createElement("span");
  hint.className = "copy-hint";
  hint.textContent = "Click to copy";

  card.appendChild(pill);
  card.appendChild(hint);

  card.addEventListener("click", () => {
    const color = pill.textContent.trim();
    if (color) copyToClipboard(color);
  });

  containerEl.appendChild(card);
  cards.push({ card, pill });
}

function generateColors() {
  cards.forEach(({ card, pill }) => {
    const code = "#" + randomColor();
    card.style.backgroundColor = code;
    pill.textContent = code;
  });
}

generateColors();

generateBtn.addEventListener("click", () => {
  generateColors();
  generateBtn.classList.remove("spin");
  void generateBtn.offsetWidth;
  generateBtn.classList.add("spin");
});

function randomColor() {
  const chars = "0123456789abcdef";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text)
      .then(() => showToast(text))
      .catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
    showToast(text);
  } catch (err) {
    console.error("Copy failed", err);
  }
  document.body.removeChild(ta);
}

let toastTimer;
function showToast(color) {
  toastText.textContent = `${color} copied!`;
  toastSwatch.style.backgroundColor = color;

  toastEl.classList.remove("show");
  void toastEl.offsetWidth;
  toastEl.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.classList.remove("show");
  }, 1600);
}