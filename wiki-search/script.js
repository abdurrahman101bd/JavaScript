const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search");
const searchBtn = searchForm.querySelector(".search-btn");
const searchResults = document.getElementById("results");
const resultsHead = document.getElementById("results-head");
const resultsLabel = document.getElementById("results-label");
const resultsCount = document.getElementById("results-count");

const API_URL = "https://en.wikipedia.org/w/api.php?action=query&list=search&prop=info&inprop=url&utf8=&format=json&origin=*&srlimit=20&srsearch=";

let isLoading = false;

function showEmptyState() {
  searchResults.innerHTML = `
    <div class="empty-state">
      <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
      <p class="empty-title">Search Wikipedia</p>
      <p class="empty-desc">Enter any topic to explore results</p>
    </div>
  `;
  resultsHead.hidden = true;
}

function showError(message) {
  searchResults.innerHTML = `
    <div class="error-state">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
  resultsHead.hidden = true;
}

function showLoading() {
  searchResults.innerHTML = "";
  for (let i = 0; i < 3; i++) {
    const sk = document.createElement("div");
    sk.className = "result";
    sk.style.animation = "none";
    sk.style.opacity = "0.6";
    sk.innerHTML = `
      <div style="height:18px;width:50%;background:var(--border);border-radius:4px;margin-bottom:10px;"></div>
      <div style="height:12px;width:35%;background:var(--border);border-radius:4px;margin-bottom:14px;"></div>
      <div style="height:12px;width:90%;background:var(--border);border-radius:4px;margin-bottom:6px;"></div>
      <div style="height:12px;width:70%;background:var(--border);border-radius:4px;"></div>
    `;
    searchResults.appendChild(sk);
  }
  resultsHead.hidden = true;
}

async function getResults(query) {
  if (isLoading) return;
  isLoading = true;

  searchBtn.disabled = true;
  searchBtn.querySelector(".btn-label").hidden = true;
  searchBtn.querySelector(".spinner").hidden = false;

  showLoading();

  try {
    const response = await fetch(API_URL + encodeURIComponent(query));
    if (!response.ok) throw new Error("Network error");
    const data = await response.json();

    const items = data?.query?.search || [];

    if (items.length === 0) {
      showError("No results found. Please try another search.");
      return;
    }

    displayResults(items, query);
  } catch (err) {
    console.error(err);
    showError("Something went wrong. Please check your connection.");
  } finally {
    searchBtn.disabled = false;
    searchBtn.querySelector(".btn-label").hidden = false;
    searchBtn.querySelector(".spinner").hidden = true;
    isLoading = false;
  }
}

function displayResults(items, query) {
  searchResults.innerHTML = "";
  resultsHead.hidden = false;
  resultsLabel.textContent = `Results for "${query}"`;
  resultsCount.textContent = items.length;

  items.forEach((item, idx) => {
    const url = `https://en.wikipedia.org/?curid=${item.pageid}`;

    const card = document.createElement("a");
    card.className = "result";
    card.href = url;
    card.target = "_blank";
    card.rel = "noopener noreferrer";
    card.style.animationDelay = `${idx * 30}ms`;
    card.style.textDecoration = "none";
    card.style.color = "inherit";

    card.innerHTML = `
      <span class="result-title">${escapeHtml(item.title)}</span>
      <span class="result-url">${url}</span>
      <p class="result-snippet">${item.snippet}</p>
    `;

    searchResults.appendChild(card);
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();

  if (!query) {
    showError("Search cannot be empty. Please enter a search term.");
    searchInput.focus();
    return;
  }

  getResults(query);
});

showEmptyState();
searchInput.focus();