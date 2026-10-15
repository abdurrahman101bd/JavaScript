<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif">

<p align="center">
  <img src="/assets/analog-clock.png" alt="cover">
</p>

<h1 align="center">Analog Clock</h1>

<p align="center">
  A sleek, fully responsive analog clock built with vanilla JavaScript — featuring smooth sweeping hands, neon cyan glow, and a dark glassmorphism aesthetic.
</p>

<p align="center">
  <a href="https://abdurrahman101bd.github.io/JavaScript/analog-clock">
    <img src="https://img.shields.io/badge/Live%20Demo-Click%20Here-brightgreen?style=for-the-badge&logo=google-chrome" alt="Live Demo">
  </a>
  <img src="https://img.shields.io/badge/Made%20with-HTML%20%7C%20CSS%20%7C%20JS-orange?style=for-the-badge" alt="Tech">
</p>

> Built while learning JavaScript.

---

## ✨ Features

- **Pure analog clock** — no digital text, just a beautiful clock face
- **Smooth sweeping second hand** — `requestAnimationFrame` + millisecond accuracy for 60fps motion
- **Continuous hour & minute hands** — hands move gradually, not in jumps
- **SVG clock face** — 12 hour ticks, 60 minute ticks, and 12 numbers (no external image needed)
- **Neon cyan glow** — clock face, hour ticks, second hand, and center cap all glow softly
- **Pulsing clock aura** — the outer glow breathes gently for a living feel
- **Pulsing center cap glow** — radial blur behind the center breathes in and out
- **Glassmorphism card** — dark frosted glass with a subtle border
- **Animated gradient top line** — cyan → pink → cyan sweep on the card
- **Floating glow orbs** — soft ambient background orbs
- **Fully responsive** — perfect on mobile (320px+), tablet, and desktop
- **Premium typography** — Orbitron font for the clock numbers

---

### 📐 Angle Formula

| Hand | Formula |
|------|---------|
| **Second** | `seconds × 6°` |
| **Minute** | `(minutes + seconds/60) × 6°` |
| **Hour** | `((hours % 12) + minutes/60) × 30°` |

The continuous hour and minute hands use fractional values so they glide instead of snapping.

---

## 🔮 Future Ideas

- [ ] **Tick sound** — soft click each second via Web Audio API
- [ ] **Second hand color toggle** — cyan / pink / white
- [ ] **Rotating gradient ring** — outer border slowly spins
- [ ] **Stopwatch overlay** — secondary mode
- [ ] **Alarm** — set an alarm with browser notification
- [ ] **Light mode** — currently dark neon only

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to check the [issues page](https://github.com/abdurrahman101bd/JavaScript/issues).

---

<p align="center">
  Made with ❤️ while learning JavaScript
</p>