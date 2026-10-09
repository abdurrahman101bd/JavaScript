const root = document.documentElement;
const card = document.getElementById('card');
const btns = document.querySelectorAll('.themes .btn');
const followBtn = document.getElementById('followBtn');
const darkToggle = document.getElementById('darkToggle');
const counters = document.querySelectorAll('[data-count]');

function applyTheme(color, save = true) {
  root.style.setProperty('--theme-color', color);
  btns.forEach(b => {
    b.classList.toggle('active', b.dataset.color.toLowerCase() === color.toLowerCase());
  });
  document.querySelector('.blob1').style.background =
    `radial-gradient(circle, ${color} 0%, rgba(0,0,0,0) 70%)`;
  if (save) localStorage.setItem('theme-color', color);
}

btns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    applyTheme(btn.dataset.color);
  });
});

(function initTheme() {
  const saved = localStorage.getItem('theme-color');
  if (saved) {
    applyTheme(saved, false);
    return;
  }
  const h = new Date().getHours();
  let auto;
  if (h >= 5  && h < 12) auto = '#f4b932';
  else if (h >= 12 && h < 17) auto = '#3498db';
  else if (h >= 17 && h < 21) auto = '#ff1756';
  else auto = '#8e44ad';
  applyTheme(auto, false);
})();

const savedDark = localStorage.getItem('dark-mode') === '1';
if (savedDark) document.body.classList.add('dark');

darkToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  localStorage.setItem('dark-mode', isDark ? '1' : '0');
});

let tiltEnabled = true;
document.addEventListener('mousemove', (e) => {
  if (!tiltEnabled) return;
  const rect = card.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top  + rect.height / 2;
  const dx = (e.clientX - cx) / rect.width;
  const dy = (e.clientY - cy) / rect.height;
  const rotateY = dx * 12;
  const rotateX = -dy * 12;
  card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
});

document.addEventListener('mouseleave', () => {
  card.style.transform = '';
});

let dragging = false;
let dragStartX = 0;
let dragStartHue = 0;
let currentHue = 350;

function hexToHue(hex) {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0,2), 16) / 255;
  const g = parseInt(hex.substring(2,4), 16) / 255;
  const b = parseInt(hex.substring(4,6), 16) / 255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h = 0;
  const d = max - min;
  if (d === 0) h = 0;
  else if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h = Math.round(h * 60);
  if (h < 0) h += 360;
  return h;
}

card.addEventListener('mousedown', (e) => {
  if (e.target.closest('button')) return;
  dragging = true;
  tiltEnabled = false;
  dragStartX = e.clientX;
  const current = getComputedStyle(root).getPropertyValue('--theme-color').trim();
  dragStartHue = hexToHue(current.startsWith('#') ? current : '#ff1756');
  currentHue = dragStartHue;
  card.style.transition = 'none';
  card.style.cursor = 'grabbing';
});

window.addEventListener('mousemove', (e) => {
  if (!dragging) return;
  const dx = e.clientX - dragStartX;
  currentHue = (dragStartHue + dx * 0.6 + 360) % 360;
  const color = `hsl(${currentHue}, 80%, 55%)`;
  root.style.setProperty('--theme-color', color);
  document.querySelector('.blob1').style.background =
    `radial-gradient(circle, ${color} 0%, rgba(0,0,0,0) 70%)`;
  btns.forEach(b => b.classList.remove('active'));
});

window.addEventListener('mouseup', () => {
  if (!dragging) return;
  dragging = false;
  tiltEnabled = true;
  card.style.transition = '';
  card.style.cursor = '';
  const hex = hslToHex(currentHue, 80, 55);
  localStorage.setItem('theme-color', hex);
});

function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = x => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

let following = localStorage.getItem('following') === '1';
function renderFollow() {
  followBtn.textContent = following ? 'Following ✓' : 'Follow';
  followBtn.classList.toggle('following', following);
}
renderFollow();

followBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  following = !following;
  localStorage.setItem('following', following ? '1' : '0');
  renderFollow();
  followBtn.classList.remove('pop');
  void followBtn.offsetWidth;
  followBtn.classList.add('pop');
  if (following) burstConfetti(e.clientX, e.clientY);
});

const canvas = document.getElementById('confetti');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function burstConfetti(x, y) {
  const colors = ['#ff1756', '#3498db', '#1cb65d', '#8e44ad', '#f4b932', '#ffffff'];
  for (let i = 0; i < 70; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 3 + Math.random() * 7;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 3,
      size: 4 + Math.random() * 5,
      color: colors[(Math.random() * colors.length) | 0],
      rotation: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      life: 1
    });
  }
}

function loopConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach((p, i) => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.18;
    p.vx *= 0.99;
    p.rotation += p.vr;
    p.life -= 0.012;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.globalAlpha = Math.max(p.life, 0);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
    ctx.restore();

    if (p.life <= 0 || p.y > canvas.height + 50) particles.splice(i, 1);
  });
  requestAnimationFrame(loopConfetti);
}
loopConfetti();

function animateCount(el) {
  const target = parseFloat(el.dataset.count);
  const divide = parseFloat(el.dataset.divide || '1');
  const suffix = el.dataset.suffix || '';
  const duration = 1400;
  const start = performance.now();

  function frame(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    const value = (target / divide) * eased;
    el.textContent = (divide > 1 ? value.toFixed(1) : Math.floor(value)) + suffix;
    if (t < 1) requestAnimationFrame(frame);
    else el.textContent = (divide > 1 ? (target / divide).toFixed(1) : target) + suffix;
  }
  requestAnimationFrame(frame);
}

const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      counters.forEach(animateCount);
      io.disconnect();
    }
  });
}, { threshold: 0.3 });
io.observe(card);
