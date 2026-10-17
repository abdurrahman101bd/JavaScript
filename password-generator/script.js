const passwordInput = document.getElementById("password");
const lengthSlider = document.getElementById("length");
const lengthDisplay = document.getElementById("length-value");
const uppercaseCheckbox = document.getElementById("uppercase");
const lowercaseCheckbox = document.getElementById("lowercase");
const numbersCheckbox = document.getElementById("numbers");
const symbolsCheckbox = document.getElementById("symbols");
const generateButton = document.getElementById("generate-btn");
const copyButton = document.getElementById("copy-btn");
const strengthBar = document.getElementById("strength-bar");
const strengthLabel = document.getElementById("strength-label");
const toastEl = document.getElementById("toast");

const uppercaseLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const lowercaseLetters = "abcdefghijklmnopqrstuvwxyz";
const numberCharacters = "0123456789";
const symbolCharacters = "!@#$%^&*()-_=+[]{}|;:,.<>?/";

function secureRandom(max) {
  if (window.crypto && window.crypto.getRandomValues) {
    const arr = new Uint32Array(1);
    window.crypto.getRandomValues(arr);
    return arr[0] % max;
  }
  return Math.floor(Math.random() * max);
}

let toastTimer = null;

function showToast(message, type = "success") {
  toastEl.textContent = message;
  toastEl.className = `toast show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2200);
}

lengthSlider.addEventListener("input", () => {
  lengthDisplay.textContent = lengthSlider.value;
  lengthDisplay.classList.remove("bump");
  void lengthDisplay.offsetWidth;
  lengthDisplay.classList.add("bump");
});

generateButton.addEventListener("click", makePassword);

function makePassword() {
  const length = Number(lengthSlider.value);
  const includeUppercase = uppercaseCheckbox.checked;
  const includeLowercase = lowercaseCheckbox.checked;
  const includeNumbers = numbersCheckbox.checked;
  const includeSymbols = symbolsCheckbox.checked;

  if (!includeUppercase && !includeLowercase && !includeNumbers && !includeSymbols) {
    showToast("Please select at least one character type.", "error");
    return;
  }

  const newPassword = createRandomPassword(
    length,
    includeUppercase,
    includeLowercase,
    includeNumbers,
    includeSymbols
  );

  passwordInput.value = newPassword;
  updateStrengthMeter(newPassword);
}

function updateStrengthMeter(password) {
  if (!password) {
    strengthBar.style.width = "0%";
    strengthLabel.textContent = "—";
    strengthLabel.className = "strength-label";
    return;
  }

  const passwordLength = password.length;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSymbols = /[^A-Za-z0-9]/.test(password);

  let strengthScore = 0;

  strengthScore += Math.min(passwordLength * 2.5, 40);

  if (hasUppercase) strengthScore += 15;
  if (hasLowercase) strengthScore += 15;
  if (hasNumbers) strengthScore += 15;
  if (hasSymbols) strengthScore += 15;

  if (passwordLength < 8) {
    strengthScore = Math.min(strengthScore, 40);
  }

  const safeScore = Math.max(5, Math.min(100, strengthScore));
  strengthBar.style.width = safeScore + "%";

  let label, colorClass;

  if (strengthScore < 40) {
    label = "Weak";
    colorClass = "weak";
    strengthBar.style.background = "var(--weak)";
    strengthBar.style.color = "var(--weak)";
  } else if (strengthScore < 70) {
    label = "Medium";
    colorClass = "medium";
    strengthBar.style.background = "var(--medium)";
    strengthBar.style.color = "var(--medium)";
  } else {
    label = "Strong";
    colorClass = "strong";
    strengthBar.style.background = "var(--strong)";
    strengthBar.style.color = "var(--strong)";
  }

  strengthLabel.textContent = label;
  strengthLabel.className = `strength-label ${colorClass}`;
}

function createRandomPassword(
  length,
  includeUppercase,
  includeLowercase,
  includeNumbers,
  includeSymbols
) {
  let allCharacters = "";
  if (includeUppercase) allCharacters += uppercaseLetters;
  if (includeLowercase) allCharacters += lowercaseLetters;
  if (includeNumbers)   allCharacters += numberCharacters;
  if (includeSymbols)   allCharacters += symbolCharacters;

  let password = "";
  for (let i = 0; i < length; i++) {
    password += allCharacters[secureRandom(allCharacters.length)];
  }
  return password;
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

copyButton.addEventListener("click", async () => {
  if (!passwordInput.value) return;

  const ok = await copyToClipboard(passwordInput.value);
  if (ok) {
    copyButton.classList.add("copied");
    showToast("Password copied to clipboard!", "success");
    setTimeout(() => copyButton.classList.remove("copied"), 1500);
  } else {
    showToast("Copy failed. Please try manually.", "error");
  }
});

window.addEventListener("DOMContentLoaded", makePassword);