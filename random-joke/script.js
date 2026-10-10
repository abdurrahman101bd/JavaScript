const jokeContainer = document.getElementById("joke");
const jokeBox = document.getElementById("joke-box");
const btn = document.getElementById("btn");
const emojiEl = document.getElementById("emoji");
const copyBtn = document.getElementById("copy-btn");
const favBtn = document.getElementById("fav-btn");
const historyBtn = document.getElementById("history-btn");
const categoryBtns  = document.querySelectorAll(".cat-btn");
const sidePanel = document.getElementById("sidePanel");
const sideOverlay = document.getElementById("sideOverlay");
const sideTitle = document.getElementById("sideTitle");
const sideBody = document.getElementById("sideBody");
const closePanelBtn = document.getElementById("closePanel");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const toastEl = document.getElementById("toast");
const confirmOverlay = document.getElementById("confirmOverlay");
const confirmTitle = document.getElementById("confirmTitle");
const confirmMessage = document.getElementById("confirmMessage");
const confirmOk = document.getElementById("confirmOk");
const confirmCancel  = document.getElementById("confirmCancel");

let currentJoke = null;
let selectedCategory = "Any";
let isLoading = false;

const LS_FAVORITES = "joke_favorites";
const LS_HISTORY = "joke_history";
const LS_LAST_CATEGORY = "joke_last_category";
const MAX_HISTORY = 10;

const EMOJI_SETS = {
  Any: ["😂", "🤣", "😆", "😁", "🙃", "😜", "🤪", "😹"],
  Programming: ["💻", "👨‍💻", "🐛", "⌨️", "🖥️", "🤖", "⚙️", "🧠"],
  Pun: ["😏", "🤭", "😄", "🙃", "😆", "🤪", "😉"],
  Dark: ["💀", "🖤", "🌑", "🕶️", "☠️", "🥀"],
  Spooky:["🎃", "👻", "🧛", "🕷️", "🦇", "💀", "🕸️", "🌙"],
  Christmas: ["🎄", "🎅", "❄️", "🎁", "⛄", "🔔", "🦌", "🌟"],
};

function getEmojiForCategory(cat) {
  const set = EMOJI_SETS[cat] || EMOJI_SETS.Any;
  return set[Math.floor(Math.random() * set.length)];
}

const CATEGORY_FLAGS = {
  Any: "nsfw,religious,political,racist,sexist,explicit",
  Programming: "nsfw,religious,political,racist,sexist",
  Pun: "nsfw,religious,political,racist,sexist",
  Dark: "nsfw,religious,political,racist,sexist",
  Spooky: "nsfw,political,racist,sexist",
  Christmas: "nsfw,religious,political,racist,sexist",
};

function getFlagsForCategory(cat) {
  return CATEGORY_FLAGS[cat] || CATEGORY_FLAGS.Any;
}

const CATEGORY_CLASS = {
  Any: "cat-any",
  Programming: "cat-programming",
  Pun: "cat-pun",
  Dark: "cat-dark",
  Spooky: "cat-spooky",
  Christmas: "cat-christmas",
};

const ALL_CAT_CLASSES = Object.values(CATEGORY_CLASS);

function applyCategoryTheme(cat) {
  const cls = CATEGORY_CLASS[cat] || CATEGORY_CLASS.Any;
  const wrapper = document.querySelector(".wrapper");
  wrapper.classList.remove(...ALL_CAT_CLASSES);
  wrapper.classList.add(cls);
  document.body.classList.remove(...ALL_CAT_CLASSES);
  document.body.classList.add(cls);
}

function getFavorites() {
  try { return JSON.parse(localStorage.getItem(LS_FAVORITES)) || []; }
  catch { return []; }
}

function saveFavorites(list) {
  localStorage.setItem(LS_FAVORITES, JSON.stringify(list));
}

function getHistory() {
  try { return JSON.parse(localStorage.getItem(LS_HISTORY)) || []; }
  catch { return []; }
}

function saveHistory(list) {
  localStorage.setItem(LS_HISTORY, JSON.stringify(list));
}

function isFavorited(jokeText) {
  return getFavorites().some((f) => f.joke === jokeText);
}

function saveLastCategory(cat) {
  localStorage.setItem(LS_LAST_CATEGORY, cat);
}

function getLastCategory() {
  const saved = localStorage.getItem(LS_LAST_CATEGORY);
  return (saved && CATEGORY_CLASS[saved]) ? saved : "Any";
}

let toastTimer = null;
function showToast(message, type = "info") {
  toastEl.textContent = message;
  toastEl.className = `toast show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2200);
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
    ta.style.top = "0";
    ta.style.left = "0";
    ta.style.opacity = "0";
    ta.style.pointerEvents = "none";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    ta.setSelectionRange(0, ta.value.length);
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch (err) { return false; }
}

function showConfirm({
  title = "Are you sure?",
  message = "This action cannot be undone.",
  okText = "Confirm",
  cancelText = "Cancel",
  danger = true,
} = {}) {
  return new Promise((resolve) => {
    confirmTitle.textContent = title;
    confirmMessage.textContent = message;
    confirmOk.textContent = okText;
    confirmCancel.textContent = cancelText;
    confirmOk.classList.toggle("danger", danger);

    confirmOverlay.classList.add("show");
    setTimeout(() => confirmOk.focus(), 100);

    function cleanup() {
      confirmOverlay.classList.remove("show");
      confirmOk.removeEventListener("click", onOk);
      confirmCancel.removeEventListener("click", onCancel);
      confirmOverlay.removeEventListener("click", onOverlayClick);
      document.removeEventListener("keydown", onKey);
    }
    function onOk() { cleanup(); resolve(true); }
    function onCancel() { cleanup(); resolve(false); }
    function onOverlayClick(e) { if (e.target === confirmOverlay) onCancel(); }
    function onKey(e) {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter") onOk();
    }

    confirmOk.addEventListener("click", onOk);
    confirmCancel.addEventListener("click", onCancel);
    confirmOverlay.addEventListener("click", onOverlayClick);
    document.addEventListener("keydown", onKey);
  });
}

categoryBtns.forEach((b) => {
  b.addEventListener("click", () => {
    categoryBtns.forEach((x) => x.classList.remove("active"));
    b.classList.add("active");
    selectedCategory = b.dataset.cat;
    saveLastCategory(selectedCategory);
    applyCategoryTheme(selectedCategory);
    getJoke();
  });
});

async function getJoke() {
  if (isLoading) return;
  isLoading = true;

  btn.disabled = true;
  btn.innerHTML = `<span class="spinner"></span> Loading...`;
  jokeBox.classList.add("loading");
  jokeContainer.classList.remove("fade");

  const cat = selectedCategory;
  const flags = getFlagsForCategory(cat);

  const urls = [
    `https://v2.jokeapi.dev/joke/${cat}?blacklistFlags=${flags}&type=single`,
    `https://v2.jokeapi.dev/joke/Any?blacklistFlags=${flags}&type=single`,
  ];

  let jokeText = null;
  let category = cat;

  try {
    for (const url of urls) {
      try {
        const response = await fetch(url);
        if (!response.ok) continue;
        const item = await response.json();
        if (item.error) continue;
        if (item.joke) {
          jokeText = item.joke;
          category = item.category || cat;
          break;
        }
      } catch (e) { continue; }
    }

    if (!jokeText) throw new Error("No joke found");

    setTimeout(() => {
      jokeContainer.textContent = jokeText;
      emojiEl.textContent = getEmojiForCategory(category);

      currentJoke = { joke: jokeText, category };
      applyCategoryTheme(category);
      updateFavButton();
      requestAnimationFrame(() => jokeContainer.classList.add("fade"));
      addToHistory(currentJoke);
    }, 250);

  } catch (err) {
    console.error(err);
    setTimeout(() => {
      jokeContainer.textContent = "Oops! Couldn't fetch a joke. Please try again.";
      requestAnimationFrame(() => jokeContainer.classList.add("fade"));
    }, 250);
  } finally {
    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5.5-2.5l7.51-3.49L17.5 6.5 9.99 9.99 6.5 17.5zm5.5-6.6c.61 0 1.1.49 1.1 1.1s-.49 1.1-1.1 1.1-1.1-.49-1.1-1.1.49-1.1 1.1-1.1z"/>
        </svg>
        Get Random Joke
      `;
      jokeBox.classList.remove("loading");
      isLoading = false;
    }, 500);
  }
}

btn.addEventListener("click", getJoke);

function addToHistory(jokeObj) {
  if (!jokeObj || !jokeObj.joke) return;
  let history = getHistory();
  history = history.filter((h) => h.joke !== jokeObj.joke);
  history.unshift({
    joke: jokeObj.joke,
    category: jokeObj.category || "Any",
    time: Date.now(),
  });
  history = history.slice(0, MAX_HISTORY);
  saveHistory(history);
}

function updateFavButton() {
  if (!currentJoke) {
    favBtn.classList.remove("active");
    return;
  }
  favBtn.classList.toggle("active", isFavorited(currentJoke.joke));
}

favBtn.addEventListener("click", () => {
  if (!currentJoke) {
    showToast("No joke to favorite yet!", "error");
    return;
  }
  let favorites = getFavorites();
  const exists = favorites.some((f) => f.joke === currentJoke.joke);

  if (exists) {
    favorites = favorites.filter((f) => f.joke !== currentJoke.joke);
    saveFavorites(favorites);
    favBtn.classList.remove("active");
    showToast("Removed from favorites", "info");
  } else {
    favorites.unshift({
      joke: currentJoke.joke,
      category: currentJoke.category,
      time: Date.now(),
    });
    saveFavorites(favorites);
    favBtn.classList.add("active");
    showToast("Added to favorites! ⭐", "success");
  }
});

favBtn.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  openPanel("favorites");
});

copyBtn.addEventListener("click", async () => {
  if (!currentJoke || !currentJoke.joke) {
    showToast("No joke to copy!", "error");
    return;
  }
  const ok = await copyToClipboard(currentJoke.joke);
  showToast(ok ? "Copied to clipboard! 📋" : "Copy failed", ok ? "success" : "error");
});

function openPanel(mode) {
  if (mode === "favorites") {
    sideTitle.textContent = "Favorites";
    clearHistoryBtn.classList.remove("show");
    renderFavorites();
  } else {
    sideTitle.textContent = "History";
    clearHistoryBtn.classList.add("show");
    renderHistory();
  }
  sidePanel.classList.add("open");
  sideOverlay.classList.add("show");
}

function closePanel() {
  sidePanel.classList.remove("open");
  sideOverlay.classList.remove("show");
}

historyBtn.addEventListener("click", () => openPanel("history"));
closePanelBtn.addEventListener("click", closePanel);
sideOverlay.addEventListener("click", closePanel);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && sidePanel.classList.contains("open")) closePanel();
});

clearHistoryBtn.addEventListener("click", async () => {
  if (getHistory().length === 0) {
    showToast("History already empty", "info");
    return;
  }
  const confirmed = await showConfirm({
    title: "Clear all history?",
    message: "This action cannot be undone. All your saved jokes will be permanently removed.",
    okText: "Clear All",
    cancelText: "Cancel",
    danger: true,
  });
  if (!confirmed) return;
  saveHistory([]);
  renderHistory();
  showToast("History cleared 🗑️", "success");
});

function renderFavorites() {
  const favorites = getFavorites();
  sideBody.innerHTML = "";

  if (favorites.length === 0) {
    sideBody.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⭐</div>
        <p>No favorites yet.<br/>Tap the star button to save a joke!</p>
      </div>`;
    return;
  }

  favorites.forEach((fav, idx) => {
    const item = document.createElement("div");
    item.className = "joke-item";
    item.style.animationDelay = `${idx * 40}ms`;
    item.innerHTML = `
      <div class="joke-item-meta">
        <span class="joke-item-cat">${fav.category || "Any"}</span>
        <span>${formatTime(fav.time)}</span>
      </div>
      <div class="joke-item-text">${escapeHtml(fav.joke)}</div>
      <div class="joke-item-actions">
        <button class="mini-btn" data-action="copy">Copy</button>
        <button class="mini-btn danger" data-action="remove">Remove</button>
      </div>`;

    item.querySelector('[data-action="copy"]').addEventListener("click", async () => {
      const ok = await copyToClipboard(fav.joke);
      showToast(ok ? "Copied! 📋" : "Copy failed", ok ? "success" : "error");
    });

    item.querySelector('[data-action="remove"]').addEventListener("click", async () => {
      const confirmed = await showConfirm({
        title: "Remove from favorites?",
        message: "This joke will be removed from your favorites list.",
        okText: "Remove",
        cancelText: "Keep",
        danger: true,
      });
      if (!confirmed) return;
      const updated = getFavorites().filter((f) => f.joke !== fav.joke);
      saveFavorites(updated);
      renderFavorites();
      updateFavButton();
      showToast("Removed from favorites", "info");
    });

    sideBody.appendChild(item);
  });
}

function renderHistory() {
  const history = getHistory();
  sideBody.innerHTML = "";

  if (history.length === 0) {
    sideBody.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📜</div>
        <p>No jokes yet.<br/>Your last ${MAX_HISTORY} jokes will show here.</p>
      </div>`;
    return;
  }

  history.forEach((h, idx) => {
    const favorited = isFavorited(h.joke);
    const item = document.createElement("div");
    item.className = "joke-item";
    item.style.animationDelay = `${idx * 40}ms`;
    item.innerHTML = `
      <div class="joke-item-meta">
        <span class="joke-item-cat">${h.category || "Any"}</span>
        <span>${formatTime(h.time)}</span>
      </div>
      <div class="joke-item-text">${escapeHtml(h.joke)}</div>
      <div class="joke-item-actions">
        <button class="mini-btn" data-action="copy">Copy</button>
        <button class="mini-btn star-btn ${favorited ? "active" : ""}" data-action="fav" title="Favorite">
          ${favorited ? "★ Saved" : "☆ Save"}
        </button>
        <button class="mini-btn danger" data-action="remove">Remove</button>
      </div>`;

    item.querySelector('[data-action="copy"]').addEventListener("click", async () => {
      const ok = await copyToClipboard(h.joke);
      showToast(ok ? "Copied! 📋" : "Copy failed", ok ? "success" : "error");
    });

    item.querySelector('[data-action="fav"]').addEventListener("click", () => {
      const favorites = getFavorites();
      const exists = favorites.some((f) => f.joke === h.joke);
      if (exists) {
        saveFavorites(favorites.filter((f) => f.joke !== h.joke));
        showToast("Removed from favorites", "info");
      } else {
        favorites.unshift({
          joke: h.joke,
          category: h.category,
          time: Date.now(),
        });
        saveFavorites(favorites);
        showToast("Added to favorites! ⭐", "success");
      }
      updateFavButton();
      renderHistory();
    });

    item.querySelector('[data-action="remove"]').addEventListener("click", async () => {
      const confirmed = await showConfirm({
        title: "Remove from history?",
        message: "This joke will be removed from your history list.",
        okText: "Remove",
        cancelText: "Keep",
        danger: true,
      });
      if (!confirmed) return;
      const updated = getHistory().filter((x) => x.joke !== h.joke);
      saveHistory(updated);
      renderHistory();
      showToast("Removed from history", "info");
    });

    sideBody.appendChild(item);
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function formatTime(ts) {
  if (!ts) return "just now";
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

const lastCategory = getLastCategory();
selectedCategory = lastCategory;

categoryBtns.forEach((b) => {
  b.classList.toggle("active", b.dataset.cat === lastCategory);
});

applyCategoryTheme(selectedCategory);
getJoke();