const addBookmarkBtn = document.getElementById("add-bookmark");
const bookmarkListEl = document.getElementById("bookmark-list");
const bookmarkNameInput = document.getElementById("bookmark-name");
const bookmarkUrlInput = document.getElementById("bookmark-url");
const bookmarkTagInput = document.getElementById("bookmark-tag");
const presetTagsEl = document.getElementById("preset-tags");
const searchInput = document.getElementById("search-input");
const sortSelect = document.getElementById("sort-select");
const countBadge = document.getElementById("count-badge");
const exportBtn = document.getElementById("export-btn");
const importBtn = document.getElementById("import-btn");
const importFile = document.getElementById("import-file");
const clearAllBtn = document.getElementById("clear-all-btn");
const tagFilterBar = document.getElementById("tag-filter-bar");
const toastEl = document.getElementById("toast");

const confirmOverlay = document.getElementById("confirm-overlay");
const confirmTitle = document.getElementById("confirm-title");
const confirmMessage = document.getElementById("confirm-message");
const confirmOk = document.getElementById("confirm-ok");
const confirmCancel = document.getElementById("confirm-cancel");

const LS_KEY = "bookmarks";
let bookmarks = [];
let searchQuery = "";
let activeTagFilter = "";
let sortMode = "recent";
let editingId = null;

const TAG_COLORS = {
  Work: { color: "#15b7b9", glow: "rgba(21, 183, 185, 0.5)" },
  Dev: { color: "#8b5cf6", glow: "rgba(139, 92, 246, 0.5)" },
  Design: { color: "#ff3b5c", glow: "rgba(255, 59, 92, 0.5)" },
  Learn: { color: "#f59e0b", glow: "rgba(245, 158, 11, 0.5)" },
  Fun: { color: "#22c55e", glow: "rgba(34, 197, 94, 0.5)" },
};

function getTagColor(tag) {
  if (!tag) return { color: "var(--accent)", glow: "var(--accent-glow)" };
  if (TAG_COLORS[tag]) return TAG_COLORS[tag];
  const hash = [...tag].reduce((a, c) => a + c.charCodeAt(0), 0);
  const colors = ["#15b7b9", "#8b5cf6", "#ff3b5c", "#f59e0b", "#22c55e", "#3b82f6", "#ec4899"];
  const color = colors[hash % colors.length];
  return { color, glow: color + "80" };
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    bookmarks = raw ? JSON.parse(raw) : [];
    bookmarks = bookmarks.map((b, i) => ({
      id: b.id || `bm_${Date.now()}_${i}`,
      name: b.name,
      url: b.url,
      tag: b.tag || "",
      addedAt: b.addedAt || Date.now() - i * 1000,
      order: b.order !== undefined ? b.order : i,
    }));
  } catch {
    bookmarks = [];
  }
}

function saveToStorage() {
  localStorage.setItem(LS_KEY, JSON.stringify(bookmarks));
}

let toastTimer = null;

function showToast(message, type = "success") {
  toastEl.textContent = message;
  toastEl.className = `toast show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2200);
}

function showConfirm({ title = "Are you sure?", message = "This action cannot be undone.", okText = "Confirm", cancelText = "Cancel" } = {}) {
  return new Promise((resolve) => {
    confirmTitle.textContent = title;
    confirmMessage.textContent = message;
    confirmOk.textContent = okText;
    confirmCancel.textContent = cancelText;
    confirmOverlay.classList.add("show");

    function cleanup() {
      confirmOverlay.classList.remove("show");
      confirmOk.removeEventListener("click", onOk);
      confirmCancel.removeEventListener("click", onCancel);
      confirmOverlay.removeEventListener("click", onOverlay);
      document.removeEventListener("keydown", onKey);
    }
    function onOk() { cleanup(); resolve(true); }
    function onCancel() { cleanup(); resolve(false); }
    function onOverlay(e) { if (e.target === confirmOverlay) onCancel(); }
    function onKey(e) {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter") onOk();
    }

    confirmOk.addEventListener("click", onOk);
    confirmCancel.addEventListener("click", onCancel);
    confirmOverlay.addEventListener("click", onOverlay);
    document.addEventListener("keydown", onKey);
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function normalizeUrl(url) {
  url = url.trim();
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;
  return url;
}

function getDomain(url) {
  try { return new URL(url).hostname; }
  catch { return url; }
}

function getFaviconUrl(url) {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch { return ""; }
}

function isDuplicate(name, url) {
  return bookmarks.some(
    (b) => b.url.toLowerCase() === url.toLowerCase() || b.name.toLowerCase() === name.toLowerCase()
  );
}

function renderTagFilterBar() {
  const tagCounts = {};
  bookmarks.forEach((b) => {
    if (b.tag) tagCounts[b.tag] = (tagCounts[b.tag] || 0) + 1;
  });

  const tags = Object.keys(tagCounts).sort();

  if (tags.length === 0) {
    tagFilterBar.classList.remove("has-tags");
    tagFilterBar.innerHTML = "";
    return;
  }

  tagFilterBar.classList.add("has-tags");
  tagFilterBar.innerHTML = "";

  const allChip = document.createElement("button");
  allChip.className = "tag-filter" + (activeTagFilter === "" ? " active" : "");
  allChip.innerHTML = `All <span class="tag-count">${bookmarks.length}</span>`;
  allChip.addEventListener("click", () => {
    activeTagFilter = "";
    render();
  });
  tagFilterBar.appendChild(allChip);

  tags.forEach((tag) => {
    const { color, glow } = getTagColor(tag);
    const chip = document.createElement("button");
    chip.className = "tag-filter" + (activeTagFilter === tag ? " active" : "");
    chip.style.setProperty("--tag-color", color);
    chip.style.setProperty("--tag-glow", glow);
    chip.innerHTML = `${escapeHtml(tag)} <span class="tag-count">${tagCounts[tag]}</span>`;
    chip.addEventListener("click", () => {
      activeTagFilter = activeTagFilter === tag ? "" : tag;
      render();
    });
    tagFilterBar.appendChild(chip);
  });
}

function render() {
  renderTagFilterBar();

  let filtered = bookmarks.filter((b) => {
    if (activeTagFilter && b.tag !== activeTagFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      b.url.toLowerCase().includes(q) ||
      (b.tag || "").toLowerCase().includes(q)
    );
  });

  const isCustomSort = sortMode === "custom";
  filtered = [...filtered].sort((a, b) => {
    if (sortMode === "name") return a.name.localeCompare(b.name);
    if (sortMode === "url") return a.url.localeCompare(b.url);
    if (sortMode === "custom") return a.order - b.order;
    return b.addedAt - a.addedAt;
  });

  bookmarkListEl.innerHTML = "";

  if (filtered.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    if (bookmarks.length === 0) {
      empty.innerHTML = `<div class="empty-state-icon">📌</div><p>No bookmarks yet.<br/>Add your first one above!</p>`;
    } else if (activeTagFilter) {
      empty.innerHTML = `<div class="empty-state-icon">🏷️</div><p>No bookmarks with tag "<strong>${escapeHtml(activeTagFilter)}</strong>"</p>`;
    } else {
      empty.innerHTML = `<div class="empty-state-icon">🔍</div><p>No bookmarks match "<strong>${escapeHtml(searchQuery)}</strong>"</p>`;
    }
    bookmarkListEl.appendChild(empty);
  } else {
    filtered.forEach((b) => bookmarkListEl.appendChild(createItem(b, isCustomSort)));
  }

  countBadge.textContent = bookmarks.length;
}

function createItem(bookmark, isDragEnabled) {
  const li = document.createElement("li");
  li.className = "bookmark-item";
  li.dataset.id = bookmark.id;

  if (editingId === bookmark.id) {
    li.classList.add("editing");
    li.innerHTML = `
      <div class="edit-form">
        <input type="text" class="edit-name" value="${escapeHtml(bookmark.name)}" maxlength="60" />
        <input type="url" class="edit-url" value="${escapeHtml(bookmark.url)}" maxlength="500" />
        <input type="text" class="edit-tag-input" value="${escapeHtml(bookmark.tag || "")}" placeholder="Tag (optional)" maxlength="20" />
        <div class="edit-actions">
          <button class="edit-save">Save</button>
          <button class="edit-cancel">Cancel</button>
        </div>
      </div>
    `;

    const saveBtn = li.querySelector(".edit-save");
    const cancelBtn = li.querySelector(".edit-cancel");
    const nameField = li.querySelector(".edit-name");
    const urlField = li.querySelector(".edit-url");
    const tagField = li.querySelector(".edit-tag-input");

    saveBtn.addEventListener("click", () => {
      const newName = nameField.value.trim();
      const newUrl  = normalizeUrl(urlField.value.trim());
      if (!newName || !newUrl) {
        showToast("Name and URL are required", "error");
        return;
      }
      bookmark.name = newName;
      bookmark.url  = newUrl;
      bookmark.tag  = tagField.value.trim();
      editingId = null;
      saveToStorage();
      render();
      showToast("Bookmark updated", "success");
    });

    cancelBtn.addEventListener("click", () => {
      editingId = null;
      render();
    });

    nameField.focus();
    return li;
  }

  const favicon = getFaviconUrl(bookmark.url);
  const tagInfo = bookmark.tag ? getTagColor(bookmark.tag) : null;

  li.innerHTML = `
    ${isDragEnabled ? `
      <div class="drag-handle" title="Drag to reorder">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <circle cx="9" cy="6" r="1.5"/>
          <circle cx="15" cy="6" r="1.5"/>
          <circle cx="9" cy="12" r="1.5"/>
          <circle cx="15" cy="12" r="1.5"/>
          <circle cx="9" cy="18" r="1.5"/>
          <circle cx="15" cy="18" r="1.5"/>
        </svg>
      </div>
    ` : ""}
    <div class="favicon">
      ${favicon ? `<img src="${favicon}" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><span class="fallback" style="display:none">${escapeHtml(bookmark.name.charAt(0).toUpperCase())}</span>` : `<span class="fallback">${escapeHtml(bookmark.name.charAt(0).toUpperCase())}</span>`}
    </div>
    <div class="bookmark-content">
      <a class="bookmark-name" href="${escapeHtml(bookmark.url)}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(bookmark.name)}">${escapeHtml(bookmark.name)}</a>
      <span class="bookmark-url" title="${escapeHtml(bookmark.url)}">${escapeHtml(getDomain(bookmark.url))}</span>
      ${tagInfo ? `<span class="bookmark-tag-badge" style="--tag-color:${tagInfo.color}">${escapeHtml(bookmark.tag)}</span>` : ""}
    </div>
    <div class="bookmark-actions">
      <button class="action-btn copy-btn" title="Copy URL">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
      </button>
      <button class="action-btn edit-btn" title="Edit">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      </button>
      <button class="action-btn delete delete-btn" title="Delete">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
      </button>
    </div>
  `;

  li.querySelector(".copy-btn").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(bookmark.url);
      showToast("URL copied!", "success");
    } catch {
      showToast("Copy failed", "error");
    }
  });

  li.querySelector(".edit-btn").addEventListener("click", () => {
    editingId = bookmark.id;
    render();
  });

  li.querySelector(".delete-btn").addEventListener("click", async () => {
    const confirmed = await showConfirm({
      title: "Delete bookmark?",
      message: `"${bookmark.name}" will be permanently removed.`,
      okText: "Delete",
    });
    if (!confirmed) return;
    bookmarks = bookmarks.filter((b) => b.id !== bookmark.id);
    saveToStorage();
    render();
    showToast("Bookmark deleted", "success");
  });

  if (isDragEnabled) {
    li.setAttribute("draggable", "true");
    setupDragEvents(li);
  }

  return li;
}

let draggedId = null;

function setupDragEvents(li) {
  li.addEventListener("dragstart", (e) => {
    draggedId = li.dataset.id;
    li.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", draggedId);
  });

  li.addEventListener("dragend", () => {
    li.classList.remove("dragging");
    document.querySelectorAll(".bookmark-item").forEach((el) => el.classList.remove("drag-over"));
    draggedId = null;
  });

  li.addEventListener("dragover", (e) => {
    e.preventDefault();
    if (!draggedId || draggedId === li.dataset.id) return;
    li.classList.add("drag-over");
  });

  li.addEventListener("dragleave", () => {
    li.classList.remove("drag-over");
  });

  li.addEventListener("drop", (e) => {
    e.preventDefault();
    li.classList.remove("drag-over");
    if (!draggedId || draggedId === li.dataset.id) return;

    const fromIdx = bookmarks.findIndex((b) => b.id === draggedId);
    const toIdx   = bookmarks.findIndex((b) => b.id === li.dataset.id);

    if (fromIdx === -1 || toIdx === -1) return;

    const [moved] = bookmarks.splice(fromIdx, 1);
    bookmarks.splice(toIdx, 0, moved);

    bookmarks.forEach((b, i) => (b.order = i));

    saveToStorage();
    render();
    showToast("Order updated", "success");
  });
}

function addBookmark() {
  const name = bookmarkNameInput.value.trim();
  let url = bookmarkUrlInput.value.trim();
  const tag = bookmarkTagInput.value.trim();

  if (!name || !url) {
    showToast("Please fill in name and URL", "error");
    return;
  }

  url = normalizeUrl(url);

  try { new URL(url); }
  catch {
    showToast("Invalid URL format", "error");
    return;
  }

  if (isDuplicate(name, url)) {
    showToast("Bookmark already exists", "error");
    return;
  }

  bookmarks.unshift({
    id: `bm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name,
    url,
    tag,
    addedAt: Date.now(),
    order: 0,
  });

  bookmarks.forEach((b, i) => (b.order = i));

  saveToStorage();
  render();

  bookmarkNameInput.value = "";
  bookmarkUrlInput.value = "";
  bookmarkTagInput.value = "";
  clearPresetTagsActive();
  bookmarkNameInput.focus();

  countBadge.classList.remove("bump");
  void countBadge.offsetWidth;
  countBadge.classList.add("bump");

  showToast("Bookmark added!", "success");
}

function clearPresetTagsActive() {
  presetTagsEl.querySelectorAll(".preset-tag").forEach((b) => b.classList.remove("active"));
}

presetTagsEl.querySelectorAll(".preset-tag").forEach((btn) => {
  btn.addEventListener("click", () => {
    const tag = btn.dataset.tag;
    if (btn.classList.contains("active")) {
      btn.classList.remove("active");
      bookmarkTagInput.value = "";
    } else {
      clearPresetTagsActive();
      btn.classList.add("active");
      bookmarkTagInput.value = tag;
    }
  });
});

bookmarkTagInput.addEventListener("input", () => {
  const val = bookmarkTagInput.value.trim().toLowerCase();
  const activeBtn = [...presetTagsEl.querySelectorAll(".preset-tag")].find(
    (b) => b.dataset.tag.toLowerCase() === val
  );
  presetTagsEl.querySelectorAll(".preset-tag").forEach((b) => b.classList.remove("active"));
  if (activeBtn) activeBtn.classList.add("active");
});

addBookmarkBtn.addEventListener("click", addBookmark);

[bookmarkNameInput, bookmarkUrlInput, bookmarkTagInput].forEach((input) => {
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addBookmark();
    }
  });
});

searchInput.addEventListener("input", () => {
  searchQuery = searchInput.value.trim();
  render();
});

sortSelect.addEventListener("change", () => {
  sortMode = sortSelect.value;
  render();
});

// Clear all
clearAllBtn.addEventListener("click", async () => {
  if (bookmarks.length === 0) {
    showToast("No bookmarks to clear", "error");
    return;
  }
  const confirmed = await showConfirm({
    title: "Clear all bookmarks?",
    message: `All ${bookmarks.length} bookmarks will be permanently deleted.`,
    okText: "Clear All",
  });
  if (!confirmed) return;
  bookmarks = [];
  saveToStorage();
  render();
  showToast("All bookmarks cleared", "success");
});

exportBtn.addEventListener("click", () => {
  if (bookmarks.length === 0) {
    showToast("No bookmarks to export", "error");
    return;
  }
  const data = JSON.stringify(bookmarks, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `bookmarks-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("Bookmarks exported", "success");
});

importBtn.addEventListener("click", () => importFile.click());
importFile.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const data = JSON.parse(ev.target.result);
      if (!Array.isArray(data)) throw new Error("Invalid format");
      const valid = data.filter((b) => b && typeof b.name === "string" && typeof b.url === "string");
      if (valid.length === 0) throw new Error("No valid bookmarks");
      let added = 0;
      valid.forEach((b) => {
        const url = normalizeUrl(b.url);
        if (!isDuplicate(b.name, url)) {
          bookmarks.unshift({
            id: `bm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            name: b.name,
            url,
            tag: b.tag || "",
            addedAt: b.addedAt || Date.now(),
            order: 0,
          });
          added++;
        }
      });
      bookmarks.forEach((b, i) => (b.order = i));
      saveToStorage();
      render();
      showToast(`Imported ${added} bookmark${added !== 1 ? "s" : ""}`, "success");
    } catch (err) {
      showToast("Invalid file format", "error");
    }
  };
  reader.readAsText(file);
  importFile.value = "";
});

document.addEventListener("keydown", (e) => {
  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

  if (ctrlKey && e.key.toLowerCase() === "n") {
    e.preventDefault();
    bookmarkNameInput.focus();
    bookmarkNameInput.select();
    return;
  }

  if (ctrlKey && (e.key.toLowerCase() === "f" || e.key.toLowerCase() === "k")) {
    e.preventDefault();
    searchInput.focus();
    searchInput.select();
    return;
  }

  if (e.key === "Escape") {
    if (editingId) {
      editingId = null;
      render();
      return;
    }
    if (searchQuery) {
      searchQuery = "";
      searchInput.value = "";
      render();
      return;
    }
    if (activeTagFilter) {
      activeTagFilter = "";
      render();
    }
  }
});

loadFromStorage();
render();
bookmarkNameInput.focus();