<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif">

<p align="center">
  <img src="/assets/blob-maker.png" alt="cover">
</p>

<h1 align="center">Blob Maker</h1>

<p align="center">
  A clean, modern CSS blob generator built with vanilla JavaScript — featuring live preview, dark mode, corner radius controls, and instant CSS output.
</p>

<p align="center">
  <a href="https://abdurrahman101bd.github.io/JavaScript/blob-maker">
    <img src="https://img.shields.io/badge/Live%20Demo-Click%20Here-brightgreen?style=for-the-badge&logo=google-chrome" alt="Live Demo">
  </a>
  <img src="https://img.shields.io/badge/Made%20with-HTML%20%7C%20CSS%20%7C%20JS-orange?style=for-the-badge" alt="Tech">
</p>

> Built while learning JavaScript.

---

## ✨ Features

- **Live blob preview** — see changes instantly as you adjust sliders
- **4 corner radius controls** — independent top-left, top-right, bottom-right, bottom-left
- **Custom width & height** — from 60px to 500px
- **Auto-generated CSS** — ready-to-copy `border-radius` code
- **One-click copy** — copies with clipboard API + fallback for mobile
- **Shape classifier** — dynamic label (Circle, Soft, Organic, Wild) based on corner variance
- **Dark mode** — with smooth theme transitions
- **System preference detection** — auto-selects light/dark on first visit
- **Theme persistence** — remembers your choice via localStorage
- **Animated theme toggle** — moon ↔ sun icon morph with rotation
- **Reset button** — restores all values to defaults
- **Live stats** — width, height, shape shown below the preview
- **Grid stage** — subtle grid background for precision alignment
- **Toast notifications** — clean success/error feedback
- **Fully responsive** — two-panel desktop layout collapses to stacked on mobile
- **Premium typography** — Inter for UI, JetBrains Mono for code

---

### 🎨 Border Radius Formula

```
border-radius:
  TL%  (100-TL)%  (100-BR)%  BR%  /
  BL%  TR%        (100-TR)%  (100-BL)%
```

The slash separates horizontal and vertical radii — this is what creates the organic blob shape.

---

## 🔮 Future Ideas

- [ ] **Color picker** — customize the blob's gradient
- [ ] **Gradient presets** — predefined color schemes
- [ ] **Save to favorites** — persist custom blobs
- [ ] **Export as PNG** — canvas-based download
- [ ] **Randomize** — one-click random shape
- [ ] **Animated morph** — keyframe-based blob animation
- [ ] **Share URL** — encode settings in the URL hash

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to check the [issues page](https://github.com/abdurrahman101bd/JavaScript/issues).

---

<p align="center">
  Made with ❤️ while learning JavaScript
</p>