<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif">

<p align="center">
  <img src="/assets/password-generator.png" alt="cover">
</p>

<h1 align="center">Password Generator</h1>

<p align="center">
  A sleek, fully responsive password generator built with vanilla JavaScript — featuring cryptographically secure randomness, live strength meter, and a dark neon aesthetic.
</p>

<p align="center">
  <a href="https://abdurrahman101bd.github.io/JavaScript/password-generator">
    <img src="https://img.shields.io/badge/Live%20Demo-Click%20Here-brightgreen?style=for-the-badge&logo=google-chrome" alt="Live Demo">
  </a>
  <img src="https://img.shields.io/badge/Made%20with-HTML%20%7C%20CSS%20%7C%20JS-orange?style=for-the-badge" alt="Tech">
</p>

> Built while learning JavaScript.

---

## ✨ Features

- **Cryptographically secure passwords** — uses `crypto.getRandomValues()` instead of `Math.random()` for real security
- **Adjustable length** — 6 to 32 characters via animated slider
- **4 character type toggles** — uppercase, lowercase, numbers, symbols
- **Live strength meter** — 3-tier visual feedback (Weak / Medium / Strong) with color + bar width
- **Dynamic strength calculation** — scores based on length + character variety
- **Character type validation** — shows error toast if no types are selected
- **One-click copy** — with clipboard API + `execCommand` fallback for mobile
- **Animated copy feedback** — icon morphs from copy → check with glow
- **Auto-generate on load** — first password appears instantly
- **Animated sliders** — custom cyan thumb with hover scale + focus ring
- **Neon toggle switches** — animated slide with cyan glow
- **Bump animation** — length value pulses on change
- **Toast notifications** — smooth slide-in with success/error variants
- **Glassmorphism card** — dark frosted with animated gradient top line
- **Floating glow orbs** — soft ambient background orbs
- **Fully responsive** — perfect on mobile (320px+), tablet, and desktop
- **Premium typography** — Orbitron font with subtle glow effects

---

### 🔐 Secure Randomness

```js
function secureRandom(max) {
  if (window.crypto && window.crypto.getRandomValues) {
    const arr = new Uint32Array(1);
    window.crypto.getRandomValues(arr);
    return arr[0] % max;
  }
  return Math.floor(Math.random() * max);
}
```

`Math.random()` is **predictable** and should **never** be used for passwords. `crypto.getRandomValues()` taps into the OS's entropy pool — the same source used by browsers and password managers.

### 📊 Strength Calculation

| Factor | Weight |
|--------|--------|
| **Length** | `min(length × 2.5, 40)` points |
| **Has uppercase** | +15 points |
| **Has lowercase** | +15 points |
| **Has numbers** | +15 points |
| **Has symbols** | +15 points |

| Score | Label | Color |
|-------|-------|-------|
| < 40 | **Weak** | Red `#fc8181` |
| 40–69 | **Medium** | Yellow `#fbd38d` |
| ≥ 70 | **Strong** | Green `#68d391` |

Passwords under 8 characters are capped at **Weak** regardless of variety.

---

## 🔮 Future Ideas

- [ ] **Exclude similar characters** — remove `0/O`, `1/l/I`
- [ ] **Memorable password mode** — diceware-style word-based passwords
- [ ] **Passphrase generator** — 3–4 random words
- [ ] **History** — last 5 generated passwords (session only)
- [ ] **Export as file** — download password to `.txt`
- [ ] **QR code** — scan to transfer to phone
- [ ] **Dark / light theme toggle**

---

> "This is a demo project. For production use, consider established tools like `1Password` or `Bitwarden` — but the cryptography principles here are sound."

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to check the [issues page](https://github.com/abdurrahman101bd/JavaScript/issues).

---

<p align="center">
  Made with ❤️ while learning JavaScript
</p>