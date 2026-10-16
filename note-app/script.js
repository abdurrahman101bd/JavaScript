document.addEventListener("DOMContentLoaded", function () {
  const notesContainer = document.getElementById("notesContainer");
  const addNoteModal = document.getElementById("addNoteModal");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const noteForm = document.getElementById("noteForm");
  const modalTitle = document.getElementById("modalTitle");
  const submitBtnLabel = document.getElementById("submitBtnLabel");
  const searchInput = document.getElementById("searchInput");
  const clearSearchBtn = document.getElementById("clearSearchBtn");
  const filterSelect = document.getElementById("filterSelect");
  const emptyState = document.getElementById("emptyState");
  const confirmModal = document.getElementById("confirmModal");
  const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
  const confirmText = document.getElementById("confirmText");
  const fabAddBtn = document.getElementById("fabAddBtn");
  const clearAllBtn = document.getElementById("clearAllBtn");
  const themeToggle = document.getElementById("themeToggle");
  const exportBtn = document.getElementById("exportBtn");
  const scrollTopBtn = document.getElementById("scrollTopBtn");
  const detailModal = document.getElementById("detailModal");
  const closeDetailBtn = document.getElementById("closeDetailBtn");
  const detailTag = document.getElementById("detailTag");
  const detailTitle = document.getElementById("detailTitle");
  const detailContent = document.getElementById("detailContent");
  const detailDate = document.getElementById("detailDate");
  const detailPinBtn = document.getElementById("detailPinBtn");
  const detailEditBtn = document.getElementById("detailEditBtn");
  const detailCopyBtn = document.getElementById("detailCopyBtn");
  const detailDeleteBtn = document.getElementById("detailDeleteBtn");
  const noteTitle = document.getElementById("noteTitle");
  const noteContent = document.getElementById("noteContent");
  const titleCount = document.getElementById("titleCount");
  const contentCount = document.getElementById("contentCount");
  const toastContainer = document.getElementById("toastContainer");

  const NOTE_COLORS = ["yellow", "pink", "blue", "green", "purple", "orange"];
  const THEME_KEY = "notes-theme";

  let notes = JSON.parse(localStorage.getItem("notes")) || [];
  notes = notes.map((n, i) => ({
    id: n.id || `legacy-${i}-${Date.now()}`,
    pinned: n.pinned || false,
    color: n.color || NOTE_COLORS[i % NOTE_COLORS.length],
    ...n,
  }));

  let noteToDeleteId = null;
  let noteInDetailId = null;
  let editingNoteId = null;
  let confirmMode = "single";

  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme) {
    document.documentElement.setAttribute("data-theme", savedTheme);
  }
  updateThemeIcon();

  function updateThemeIcon() {
    const current = document.documentElement.getAttribute("data-theme");
    const isDark =
      current === "dark" ||
      (!current && window.matchMedia("(prefers-color-scheme: dark)").matches);
    themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  }

  themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const isDark = current === "dark" || (!current && window.matchMedia("(prefers-color-scheme: dark)").matches);
    const next = isDark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(THEME_KEY, next);
    updateThemeIcon();
    toast(`Switched to ${next} mode`, "info");
  });

  renderNotes();
  updateEmptyState();

  fabAddBtn.addEventListener("click", openAddNoteModal);
  closeModalBtn.addEventListener("click", closeAddNoteModal);
  noteForm.addEventListener("submit", handleNoteSubmit);

  searchInput.addEventListener("input", () => {
    clearSearchBtn.classList.toggle("visible", searchInput.value.length > 0);
    filterNotes();
  });

  clearSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    clearSearchBtn.classList.remove("visible");
    filterNotes();
    searchInput.focus();
  });

  filterSelect.addEventListener("change", filterNotes);
  cancelDeleteBtn.addEventListener("click", closeConfirmModal);
  confirmDeleteBtn.addEventListener("click", confirmDelete);

  clearAllBtn.addEventListener("click", () => {
    if (notes.length === 0) {
      toast("No notes to clear", "warn");
      return;
    }
    confirmMode = "all";
    confirmText.textContent = `Delete all ${notes.length} note(s)? This cannot be undone.`;
    openConfirmModal();
  });

  closeDetailBtn.addEventListener("click", closeDetailModal);
  detailPinBtn.addEventListener("click", togglePinFromDetail);
  detailEditBtn.addEventListener("click", editFromDetail);
  detailCopyBtn.addEventListener("click", copyNoteFromDetail);
  detailDeleteBtn.addEventListener("click", () => {
    noteToDeleteId = noteInDetailId;
    confirmMode = "single";
    confirmText.textContent = "Are you sure you want to delete this note?";
    openConfirmModal();
  });

  [addNoteModal, confirmModal, detailModal].forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("active");
        document.body.style.overflow = "auto";
      }
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      [addNoteModal, confirmModal, detailModal].forEach((m) => m.classList.remove("active"));
      document.body.style.overflow = "auto";
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "n") {
      e.preventDefault();
      openAddNoteModal();
    }
  });

  window.addEventListener("scroll", () => {
    scrollTopBtn.classList.toggle("visible", window.scrollY > 400);
  });
  scrollTopBtn.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" })
  );

  exportBtn.addEventListener("click", () => {
    if (notes.length === 0) {
      toast("No notes to export", "warn");
      return;
    }
    const dataStr = JSON.stringify(notes, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `notes-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Notes exported", "success");
  });

  noteTitle.addEventListener("input", () => {
    titleCount.textContent = noteTitle.value.length;
    updateCountColor(titleCount, noteTitle.value.length, 60);
  });
  noteContent.addEventListener("input", () => {
    contentCount.textContent = noteContent.value.length;
    updateCountColor(contentCount, noteContent.value.length, 1000);
  });

  function updateCountColor(el, len, max) {
    el.classList.toggle("warn", len > max * 0.75 && len < max);
    el.classList.toggle("max", len >= max);
  }

  function renderNotes(notesToRender = notes) {
    notesContainer.innerHTML = "";

    const sorted = [...notesToRender].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.date) - new Date(a.date);
    });

    sorted.forEach((note) => {
      const card = document.createElement("div");
      card.className = `note-card color-${note.color || "yellow"}${note.pinned ? " pinned" : ""}`;
      card.dataset.id = note.id;

      card.innerHTML = `
        <div class="note-header">
          <h3 class="note-title">${escapeHtml(note.title)}</h3>
          <div class="note-actions">
            <button class="icon-btn pin-btn${note.pinned ? " active" : ""}" data-action="pin" title="${note.pinned ? "Unpin" : "Pin"}">
              <i class="fas fa-thumbtack"></i>
            </button>
            <button class="icon-btn edit-btn" data-action="edit" title="Edit">
              <i class="fas fa-pen"></i>
            </button>
            <button class="icon-btn delete-btn" data-action="delete" title="Delete">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <p class="note-text">${escapeHtml(note.content)}</p>
        <div class="note-footer">
          <span class="note-tag">${getTagIcon(note.tag)} ${getTagName(note.tag)}</span>
          <span class="note-date">${formatDate(note.date)}</span>
        </div>
      `;

      card.addEventListener("click", (e) => {
        if (e.target.closest("button")) return;
        openDetailModal(note.id);
      });

      card
        .querySelector('[data-action="pin"]')
        .addEventListener("click", (e) => {
          e.stopPropagation();
          togglePin(note.id);
        });

      card
        .querySelector('[data-action="edit"]')
        .addEventListener("click", (e) => {
          e.stopPropagation();
          openEditNoteModal(note.id);
        });

      card
        .querySelector('[data-action="delete"]')
        .addEventListener("click", (e) => {
          e.stopPropagation();
          noteToDeleteId = note.id;
          confirmMode = "single";
          confirmText.textContent = "Are you sure you want to delete this note?";
          openConfirmModal();
        });

      notesContainer.appendChild(card);
    });
  }

  function togglePin(id) {
    const note = notes.find((n) => n.id === id);
    if (!note) return;
    note.pinned = !note.pinned;
    saveNotes();
    filterNotes();
    toast(note.pinned ? "Note pinned 📌" : "Note unpinned", "success");
  }

  function togglePinFromDetail() {
    if (!noteInDetailId) return;
    togglePin(noteInDetailId);
    openDetailModal(noteInDetailId);
  }

  function copyNoteFromDetail() {
    const note = notes.find((n) => n.id === noteInDetailId);
    if (!note) return;
    const text = `${note.title}\n\n${note.content}`;
    navigator.clipboard
      .writeText(text)
      .then(() => toast("Copied to clipboard", "success"))
      .catch(() => toast("Copy failed", "error"));
  }

  function openDetailModal(id) {
    const note = notes.find((n) => n.id === id);
    if (!note) return;

    noteInDetailId = id;
    detailTag.innerHTML = `<span class="note-tag" style="background: rgba(99,102,241,0.12); color:#4f46e5;">${getTagIcon(note.tag)} ${getTagName(note.tag)}</span>`;
    detailTitle.textContent = note.title;
    detailContent.textContent = note.content;
    detailDate.innerHTML = `<i class="fas fa-clock"></i> ${formatFullDate(note.date)}`;
    detailPinBtn.classList.toggle("active", !!note.pinned);
    detailModal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeDetailModal() {
    detailModal.classList.remove("active");
    document.body.style.overflow = "auto";
    noteInDetailId = null;
  }

  function editFromDetail() {
    if (!noteInDetailId) return;
    const id = noteInDetailId;
    closeDetailModal();
    setTimeout(() => openEditNoteModal(id), 180);
  }

  function getTagIcon(tag) {
    return (
      {
        work: '<i class="fas fa-briefcase"></i>',
        personal: '<i class="fas fa-user"></i>',
        ideas: '<i class="fas fa-lightbulb"></i>',
        reminders: '<i class="fas fa-bell"></i>',
      }[tag] || ""
    );
  }

  function getTagName(tag) {
    return (
      {
        work: "Work",
        personal: "Personal",
        ideas: "Ideas",
        reminders: "Reminders",
      }[tag] || tag
    );
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    const diffMs = Date.now() - date;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH}h ago`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 7) return `${diffD}d ago`;
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatFullDate(dateString) {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function openAddNoteModal() {
    editingNoteId = null;
    modalTitle.textContent = "New Note";
    submitBtnLabel.textContent = "Save Note";
    noteForm.reset();
    titleCount.textContent = "0";
    contentCount.textContent = "0";
    titleCount.className = "char-count";
    contentCount.className = "char-count";
    const defaultTag = document.querySelector('input[name="noteTag"][value="ideas"]');
    if (defaultTag) defaultTag.checked = true;

    addNoteModal.classList.add("active");
    document.body.style.overflow = "hidden";
    setTimeout(() => noteTitle.focus(), 300);
  }

  function closeAddNoteModal() {
    addNoteModal.classList.remove("active");
    document.body.style.overflow = "auto";
    noteForm.reset();
    editingNoteId = null;
  }

  function openEditNoteModal(id) {
    const note = notes.find((n) => n.id === id);
    if (!note) return;

    editingNoteId = id;
    modalTitle.textContent = "Edit Note";
    submitBtnLabel.textContent = "Update Note";

    noteTitle.value = note.title;
    noteContent.value = note.content;
    titleCount.textContent = note.title.length;
    contentCount.textContent = note.content.length;
    updateCountColor(titleCount, note.title.length, 60);
    updateCountColor(contentCount, note.content.length, 1000);

    const tagRadio = document.querySelector(`input[name="noteTag"][value="${note.tag}"]`);
    if (tagRadio) tagRadio.checked = true;

    addNoteModal.classList.add("active");
    document.body.style.overflow = "hidden";
    setTimeout(() => noteTitle.focus(), 300);
  }

  function openConfirmModal() {
    confirmModal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeConfirmModal() {
    confirmModal.classList.remove("active");
    document.body.style.overflow = "auto";
    noteToDeleteId = null;
    confirmMode = "single";
  }

  function handleNoteSubmit(e) {
    e.preventDefault();
    const title = noteTitle.value.trim();
    const content = noteContent.value.trim();
    const tag = document.querySelector('input[name="noteTag"]:checked').value;

    if (!title || !content) return;

    if (editingNoteId) {
      const note = notes.find((n) => n.id === editingNoteId);
      if (!note) return;
      note.title = title;
      note.content = content;
      note.tag = tag;
      note.date = new Date().toISOString();
      saveNotes();
      closeAddNoteModal();
      filterNotes();
      toast("Note updated ✏️", "success");
    } else {
      const newNote = {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2),
        title, content, tag,
        color:
          NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)],
        pinned: false,
        date: new Date().toISOString(),
      };
      notes.unshift(newNote);
      saveNotes();
      closeAddNoteModal();
      filterNotes();
      updateEmptyState();
      toast("Note saved ✨", "success");
    }
  }

  function confirmDelete() {
    if (confirmMode === "all") {
      const count = notes.length;
      notes = [];
      saveNotes();
      closeConfirmModal();
      filterNotes();
      updateEmptyState();
      toast(`Deleted ${count} note(s)`, "success");
      return;
    }

    if (noteToDeleteId) {
      notes = notes.filter((n) => n.id !== noteToDeleteId);
      saveNotes();
      closeConfirmModal();
      closeDetailModal();
      filterNotes();
      updateEmptyState();
      toast("Note deleted 🗑️", "success");
    }
  }

  function saveNotes() {
    localStorage.setItem("notes", JSON.stringify(notes));
  }

  function filterNotes() {
    const searchTerm = searchInput.value.toLowerCase();
    const filterValue = filterSelect.value;

    let filtered = notes;
    if (searchTerm) {
      filtered = filtered.filter(
        (n) => n.title.toLowerCase().includes(searchTerm) || n.content.toLowerCase().includes(searchTerm)
      );
    }
    if (filterValue !== "all") {
      filtered = filtered.filter((n) => n.tag === filterValue);
    }

    renderNotes(filtered);
    updateEmptyState(filtered);
  }

  function updateEmptyState(list = notes) {
    emptyState.style.display = list.length === 0 ? "block" : "none";
  }

  function toast(msg, type = "info") {
    const icons = {
      success: "fa-circle-check",
      info: "fa-circle-info",
      warn: "fa-triangle-exclamation",
      error: "fa-circle-xmark",
    };
    const el = document.createElement("div");
    el.className = `toast toast-${type}`;
    el.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i><span>${escapeHtml(
      msg
    )}</span>`;
    toastContainer.appendChild(el);

    setTimeout(() => {
      el.classList.add("removing");
      setTimeout(() => el.remove(), 300);
    }, 2600);
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
});