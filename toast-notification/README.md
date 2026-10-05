<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif">

<p align="center">
  <img src="/assets/toast-notification.png" alt="cover">
</p>

<h1 align="center">Toast Notification</h1>

<p align="center">
  A sleek, fully responsive toast notification system built with vanilla JavaScript — featuring 4 notification types, animated progress bars, sound effects, and a dark neon aesthetic.
</p>

<p align="center">
  <a href="https://abdurrahman101bd.github.io/JavaScript/toast-notification">
    <img src="https://img.shields.io/badge/Live%20Demo-Click%20Here-brightgreen?style=for-the-badge&logo=google-chrome" alt="Live Demo">
  </a>
  <img src="https://img.shields.io/badge/Made%20with-HTML%20%7C%20CSS%20%7C%20JS-orange?style=for-the-badge" alt="Tech">
</p>

> Built while learning JavaScript.

---

## ✨ Features

- **4 notification types** — success, error, warning, and info, each with its own color & icon
- **Slide-in animation** — toasts glide in from the right with a smooth cubic-bezier curve
- **Progress bar** — a colored bar at the bottom shows remaining time for each toast
- **Hover to pause** — hovering a toast pauses both its timer and progress bar animation
- **Sound effects** — Web Audio API generates unique chimes for each type (no audio files needed)
- **Max stack limit** — automatically removes the oldest toast when 5 are visible at once
- **Auto-dismiss** — toasts disappear after 2.8s (configurable per call)
- **XSS-safe** — user text is HTML-escaped before rendering
- **Accessibility** — proper `role="status"` / `role="alert"` attributes
- **Fully responsive** — perfect on mobile (320px+), tablet, and desktop
- **Premium typography** — Orbitron font with glow effects

---

## 🔊 Sound Design

Each toast type plays a unique two-tone chime generated via the Web Audio API — **no external audio files required**.

| Type | Tones | Waveform | Feel |
|------|-------|----------|------|
| **Success** | 660 → 880 Hz | Sine | Rising, bright |
| **Error** | 400 → 250 Hz | Sawtooth | Falling, harsh |
| **Warning** | 520 → 420 Hz | Sine | Medium, cautious |
| **Info** | 600 → 720 Hz | Sine | Light, pleasant |

---

<p align="center">
  Made with ❤️ while learning JavaScript
</p>