const inputText = document.getElementById("inputText");
const sizeSelect = document.getElementById("size");
const ecSelect = document.getElementById("ecLevel");
const darkColor = document.getElementById("darkColor");
const lightColor = document.getElementById("lightColor");
const generateBtn = document.getElementById("generateBtn");
const clearBtn = document.getElementById("clearBtn");
const charCountEl = document.getElementById("char-count");
const qrSection = document.getElementById("qrSection");
const qrContainer = document.getElementById("qrContainer");
const downloadBtn = document.getElementById("downloadBtn");
const copyBtn = document.getElementById("copyBtn");
const shareBtn = document.getElementById("shareBtn");
const toastEl = document.getElementById("toast");

let qrCodeDataUrl = "";
let isGenerating = false;

let toastTimer = null;
function showToast(message, type = "success") {
  toastEl.textContent = message;
  toastEl.className = `toast show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2200);
}

function updateCharCount() {
  const len = inputText.value.length;
  charCountEl.textContent = len;
  charCountEl.parentElement.classList.toggle("warn", len > 400);
  clearBtn.classList.toggle("visible", len > 0);
}

inputText.addEventListener("input", updateCharCount);

clearBtn.addEventListener("click", () => {
  inputText.value = "";
  updateCharCount();
  qrSection.classList.remove("show");
  qrCodeDataUrl = "";
  inputText.focus();
});

function getECLevel(level) {
  const map = {
    L: QRCode.CorrectLevel.L,
    M: QRCode.CorrectLevel.M,
    Q: QRCode.CorrectLevel.Q,
    H: QRCode.CorrectLevel.H,
  };
  return map[level] || QRCode.CorrectLevel.H;
}

function generateQRCode() {
  if (isGenerating) return;

  const text = inputText.value.trim();

  if (!text) {
    showToast("Please enter some text or URL", "error");
    inputText.focus();
    return;
  }

  if (typeof QRCode === "undefined") {
    showToast("QR library still loading — try again", "error");
    return;
  }

  isGenerating = true;
  generateBtn.disabled = true;
  generateBtn.innerHTML = `<span class="spinner"></span> Generating...`;

  const size = parseInt(sizeSelect.value, 10);
  const ecLevel = ecSelect.value;
  const dark = darkColor.value;
  const light = lightColor.value;

  qrContainer.innerHTML = "";
  qrCodeDataUrl = "";

  try {
    new QRCode(qrContainer, {
      text,
      width: size,
      height: size,
      colorDark: dark,
      colorLight: light,
      correctLevel: getECLevel(ecLevel),
    });

    setTimeout(() => {
      const canvas = qrContainer.querySelector("canvas");
      if (canvas) {
        qrCodeDataUrl = canvas.toDataURL("image/png");
        qrSection.classList.add("show");
        showToast("QR code generated!", "success");
      } else {
        showToast("Failed to generate QR code", "error");
      }

      generateBtn.disabled = false;
      generateBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2v20M2 12h20"/>
        </svg>
        Generate QR Code
      `;
      isGenerating = false;
    }, 150);
  } catch (err) {
    console.error(err);
    showToast("Something went wrong", "error");
    generateBtn.disabled = false;
    generateBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2v20M2 12h20"/>
      </svg>
      Generate QR Code
    `;
    isGenerating = false;
  }
}

generateBtn.addEventListener("click", generateQRCode);

downloadBtn.addEventListener("click", () => {
  if (!qrCodeDataUrl) {
    showToast("No QR code to download", "error");
    return;
  }
  const link = document.createElement("a");
  link.download = `qrcode-${Date.now()}.png`;
  link.href = qrCodeDataUrl;
  link.click();
  showToast("Downloaded!", "success");
});

copyBtn.addEventListener("click", async () => {
  if (!qrCodeDataUrl) {
    showToast("No QR code to copy", "error");
    return;
  }

  try {
    const response = await fetch(qrCodeDataUrl);
    const blob = await response.blob();

    if (navigator.clipboard && window.ClipboardItem) {
      const item = new ClipboardItem({ "image/png": blob });
      await navigator.clipboard.write([item]);
      showToast("QR image copied!", "success");
    } else {
      showToast("Copy image not supported — use Download", "error");
    }
  } catch (err) {
    console.error(err);
    showToast("Copy failed — try Download", "error");
  }
});

shareBtn.addEventListener("click", async () => {
  if (!qrCodeDataUrl) {
    showToast("No QR code to share", "error");
    return;
  }

  if (!navigator.share) {
    showToast("Share not supported — use Download", "error");
    return;
  }

  try {
    const response = await fetch(qrCodeDataUrl);
    const blob = await response.blob();
    const file = new File([blob], "qrcode.png", { type: "image/png" });

    await navigator.share({
      title: "QR Code",
      text: "Check out this QR code",
      files: [file],
    });
    showToast("Shared!", "success");
  } catch (err) {
    if (err.name !== "AbortError") {
      console.error(err);
      showToast("Share failed", "error");
    }
  }
});

inputText.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    e.preventDefault();
    generateQRCode();
  }
});

[sizeSelect, ecSelect, darkColor, lightColor].forEach((el) => {
  el.addEventListener("change", () => {
    if (qrSection.classList.contains("show") && inputText.value.trim()) {
      generateQRCode();
    }
  });
});

updateCharCount();