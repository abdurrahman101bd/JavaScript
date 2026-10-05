const toastStack = document.getElementById('toastStack');

const TOAST_ICONS = {
  success: '<svg viewBox="0 -960 960 960"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>',
  error: '<svg viewBox="0 -960 960 960"><path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"/></svg>',
  warning: '<svg viewBox="0 -960 960 960"><path d="M40-120 480-880 920-120H40Zm82-80h716L480-760 122-200Zm358-40q17 0 28.5-11.5T520-280q0-17-11.5-28.5T480-320q-17 0-28.5 11.5T440-280q0 17 11.5 28.5T480-240Zm-40-120h80v-200h-80v200Zm40-100Z"/></svg>',
  info: '<svg viewBox="0 -960 960 960"><path d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"/></svg>',
};

const DEFAULT_MESSAGES = {
  success: 'Operation completed successfully',
  error: 'Something went wrong',
  warning: 'Please review this carefully',
  info: 'Here is some useful information',
};

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      return null;
    }
  }
  return audioCtx;
}

function playSound(type) {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();

  const configs = {
    success: { freqs: [660, 880], times: [0, 0.12], dur: 0.18, gain: 0.08 },
    error: { freqs: [400, 250], times: [0, 0.14], dur: 0.20, gain: 0.09 },
    warning: { freqs: [520, 420], times: [0, 0.14], dur: 0.18, gain: 0.08 },
    info: { freqs: [600, 720], times: [0, 0.10], dur: 0.15, gain: 0.06 },
  };

  const cfg = configs[type] || configs.info;
  const now = ctx.currentTime;

  cfg.freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type === 'error' ? 'sawtooth' : 'sine';
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0, now + cfg.times[i]);
    gain.gain.linearRampToValueAtTime(cfg.gain, now + cfg.times[i] + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + cfg.times[i] + cfg.dur);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + cfg.times[i]);
    osc.stop(now + cfg.times[i] + cfg.dur + 0.02);
  });
}

function removeToast(el, delay = 400) {
  if (!el || !el.parentNode) return;
  el.classList.remove('show');
  setTimeout(() => el.remove(), delay);
}

function showMessage(text, type = 'info', duration = 2800) {
  if (!TOAST_ICONS[type]) type = 'info';
  if (!text) text = DEFAULT_MESSAGES[type];

  const MAX_STACK = 5;
  const existing = toastStack.querySelectorAll('.enc-toast');
  if (existing.length >= MAX_STACK) {
    removeToast(existing[0], 0);
  }

  const el = document.createElement('div');
  el.className = `enc-toast ${type}`;
  el.setAttribute('role', type === 'error' ? 'alert' : 'status');
  el.style.setProperty('--toast-duration', `${duration}ms`);

  el.innerHTML = `
    ${TOAST_ICONS[type]}
    <span>${escapeHtml(text)}</span>
  `;

  toastStack.appendChild(el);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => el.classList.add('show'));
  });

  playSound(type);

  const timeout = setTimeout(() => removeToast(el), duration);

  el.addEventListener('mouseenter', () => clearTimeout(timeout));
  el.addEventListener('mouseleave', () => {
    setTimeout(() => removeToast(el), 800);
  });
}

document.querySelectorAll('.btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const type = btn.dataset.type;
    showMessage(DEFAULT_MESSAGES[type], type);
  });
});
