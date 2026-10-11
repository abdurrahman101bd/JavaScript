const outputCode = document.getElementById("css-code");
const blobEl = document.getElementById("blob");
const copyBtn = document.getElementById("copy");
const toastEl = document.getElementById("toast");
const toastText = document.querySelector(".toast-text");
const resetBtn = document.getElementById("reset-btn");
const themeToggle = document.getElementById("theme-toggle");

const widthInput = document.getElementById("blob-width");
const heightInput = document.getElementById("blob-height");
const sliders = document.querySelectorAll("input[type='range']");
const valLabels = document.querySelectorAll(".slider-value");

const statW = document.getElementById("stat-w");
const statH = document.getElementById("stat-h");
const statShape = document.getElementById("stat-shape");
const metaSize = document.getElementById("meta-size");

const DEFAULTS = {
  width: 200,
  height: 200,
  corners: [30, 80, 60, 40],
};

const LS_THEME = "blobmaker_theme";

function getPreferredTheme() {
  const saved = localStorage.getItem(LS_THEME);
  if (saved === "light" || saved === "dark") return saved;

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(LS_THEME, theme);

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", theme === "dark" ? "#0b0d12" : "#ffffff");
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const next = current === "dark" ? "light" : "dark";
  applyTheme(next);
}

applyTheme(getPreferredTheme());

themeToggle.addEventListener("click", toggleTheme);

function createBlob() {
  const [r1, r2, r3, r4] = [...sliders].map((s) => Number(s.value));

  const borderRadius =
    `${r1}% ${100 - r1}% ${100 - r3}% ${r3}% / ${r4}% ${r2}% ${100 - r2}% ${100 - r4}%`;

  const w = Number(widthInput.value) || DEFAULTS.width;
  const h = Number(heightInput.value) || DEFAULTS.height;

  blobEl.style.borderRadius = borderRadius;
  blobEl.style.width  = `${w}px`;
  blobEl.style.height = `${h}px`;

  const code = `border-radius: ${borderRadius};`;
  outputCode.textContent = code;
  outputCode.dataset.code = code;

  sliders.forEach((s, i) => {
    if (valLabels[i]) valLabels[i].textContent = `${s.value}%`;
  });

  statW.textContent = `${w}px`;
  statH.textContent = `${h}px`;
  statShape.textContent = getShapeName(r1, r2, r3, r4);
  metaSize.textContent = `${w} × ${h}`;
}

function getShapeName(r1, r2, r3, r4) {
  const vals = [r1, r2, r3, r4];
  const avg  = vals.reduce((a, b) => a + b, 0) / 4;
  const variance = vals.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / 4;

  if (variance < 50)  return "Circle";
  if (variance < 200) return "Soft";
  if (variance < 600) return "Organic";
  return "Wild";
}

sliders.forEach((s) => s.addEventListener("input", createBlob));

[widthInput, heightInput].forEach((inp) => {
  inp.addEventListener("input", createBlob);
  inp.addEventListener("change", createBlob);
});

resetBtn.addEventListener("click", () => {
  widthInput.value  = DEFAULTS.width;
  heightInput.value = DEFAULTS.height;
  sliders.forEach((s, i) => {
    s.value = DEFAULTS.corners[i];
  });
  createBlob();
});

let toastTimer = null;

function showToast(message, type = "success") {
  toastText.textContent = message;
  toastEl.className = `toast show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2000);
}

async function copyToClipboard(text) {
  if (!text) return false;

  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {}
  }

  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, 99999);
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

copyBtn.addEventListener("click", async () => {
  const code = outputCode.dataset.code || outputCode.textContent;
  const ok = await copyToClipboard(code);

  if (ok) {
    showToast("Copied to clipboard", "success");
    copyBtn.classList.add("copied");

    const originalHTML = copyBtn.innerHTML;
    copyBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      <span>Copied</span>
    `;

    setTimeout(() => {
      copyBtn.classList.remove("copied");
      copyBtn.innerHTML = originalHTML;
    }, 1500);
  } else {
    showToast("Copy failed", "error");
  }
});

createBlob();