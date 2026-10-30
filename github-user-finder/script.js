// ELEMENTS
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search");
const searchBtn = document.getElementById("search-btn");
const clearRecentBtn = document.getElementById("clear-recent");
const profileContainer = document.getElementById("profile-container");
const emptyState = document.getElementById("empty-state");
const errorContainer = document.getElementById("error-container");
const errorTitle = document.getElementById("error-title");
const errorDesc = document.getElementById("error-desc");
const recentSearchesEl = document.getElementById("recent-searches");
const recentChipsEl = document.getElementById("recent-chips");
const toastEl = document.getElementById("toast");

// Profile
const avatar = document.getElementById("avatar");
const profileLink = document.getElementById("profile-link");
const nameElement = document.getElementById("name");
const usernameElement = document.getElementById("username");
const bioElement = document.getElementById("bio");
const locationElement = document.getElementById("location");
const locationContainer = document.getElementById("location-container");
const joinedDateElement = document.getElementById("joined-date");
const followersEl = document.getElementById("followers");
const followingEl = document.getElementById("following");
const reposEl = document.getElementById("repos");
const companyElement  = document.getElementById("company");
const companyContainer = document.getElementById("company-container");
const blogElement = document.getElementById("blog");
const blogContainer = document.getElementById("blog-container");

// Repos
const reposContainer = document.getElementById("repos-container");
const reposCount = document.getElementById("repos-count");
const reposSortSelect = document.getElementById("repos-sort");
const showMoreBtn = document.getElementById("show-more");

//  STATE
const GITHUB_API = "https://api.github.com/users";
const LS_RECENT  = "gh_finder_recent";
const MAX_RECENT = 4;

let allRepos = [];
let displayedCount = 0;
const PAGE_SIZE = 6;

//  TOAST
let toastTimer = null;
function showToast(message, type = "success") {
  toastEl.textContent = message;
  toastEl.className = `gh-toast show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2400);
}

//  RECENT SEARCHES
function getRecentSearches() {
  try {
    return JSON.parse(localStorage.getItem(LS_RECENT)) || [];
  } catch {
    return [];
  }
}

function saveRecentSearch(username) {
  let recent = getRecentSearches();
  recent = recent.filter((u) => u.toLowerCase() !== username.toLowerCase());
  recent.unshift(username);
  recent = recent.slice(0, MAX_RECENT);
  localStorage.setItem(LS_RECENT, JSON.stringify(recent));
  renderRecent();
}

function renderRecent() {
  const recent = getRecentSearches();
  if (recent.length === 0) {
    recentSearchesEl.hidden = true;
    return;
  }
  recentSearchesEl.hidden = false;
  recentChipsEl.innerHTML = "";

  recent.forEach((username) => {
    const chip = document.createElement("div");
    chip.className = "gh-recent-chip";

    const label = document.createElement("span");
    label.className = "chip-label";
    label.textContent = username;
    label.addEventListener("click", () => {
      searchInput.value = username;
      searchUser();
    });

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "chip-remove";
    removeBtn.setAttribute("aria-label", `Remove ${username} from recent`);
    removeBtn.title = `Remove ${username}`;
    removeBtn.innerHTML = `
      <svg viewBox="0 0 16 16" fill="currentColor">
        <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"/>
      </svg>
    `;

    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      removeRecentSearch(username);
    });

    chip.appendChild(label);
    chip.appendChild(removeBtn);
    recentChipsEl.appendChild(chip);
  });
}

// Remove single recent search
function removeRecentSearch(username) {
  let recent = getRecentSearches();
  recent = recent.filter((u) => u.toLowerCase() !== username.toLowerCase());
  localStorage.setItem(LS_RECENT, JSON.stringify(recent));
  renderRecent();
  showToast(`Removed "${username}"`, "success");
}

// Clear recent searches
clearRecentBtn.addEventListener("click", () => {
  const recent = getRecentSearches();
  if (recent.length === 0) return;

  localStorage.removeItem(LS_RECENT);
  renderRecent();
  showToast("Recent searches cleared", "success");
});

//  SEARCH USER
async function searchUser() {
  const username = searchInput.value.trim();

  if (!username) {
    showToast("Please enter a username", "error");
    searchInput.focus();
    return;
  }

  profileContainer.hidden = true;
  emptyState.hidden = true;
  errorContainer.hidden = true;

  searchBtn.disabled = true;
  searchBtn.querySelector(".btn-label").hidden = true;
  searchBtn.querySelector(".spinner").hidden = false;

  try {
    const response = await fetch(`${GITHUB_API}/${username}`);

    if (response.status === 404) {
      showError("User not found", `No GitHub user named "${username}"`);
      return;
    }

    if (response.status === 403) {
      showError("Rate limit reached", "GitHub API rate limit exceeded. Try again in a minute.");
      return;
    }

    if (!response.ok) {
      throw new Error("Failed to fetch user");
    }

    const userData = await response.json();
    displayUserData(userData);

    profileContainer.hidden = false;
    emptyState.hidden = true;
    errorContainer.hidden = true;

    saveRecentSearch(userData.login);
    await fetchRepositories(userData.login);

  } catch (err) {
    console.error(err);
    showError("Something went wrong", "Please check your connection and try again");
  } finally {
    searchBtn.disabled = false;
    searchBtn.querySelector(".btn-label").hidden = false;
    searchBtn.querySelector(".spinner").hidden = true;
  }
}

//  DISPLAY USER
function displayUserData(user) {
  avatar.src = user.avatar_url;
  avatar.alt = `${user.login}'s avatar`;

  nameElement.textContent = user.name || user.login;
  usernameElement.textContent = `@${user.login}`;

  if (user.bio) {
    bioElement.textContent = user.bio;
    bioElement.hidden = false;
  } else {
    bioElement.hidden = true;
  }

  if (user.company) {
    companyContainer.hidden = false;
    companyElement.textContent = user.company;
  } else {
    companyContainer.hidden = true;
  }

  if (user.location) {
    locationContainer.hidden = false;
    locationElement.textContent = user.location;
  } else {
    locationContainer.hidden = true;
  }

  if (user.blog) {
    blogContainer.hidden = false;
    blogElement.textContent = cleanBlogUrl(user.blog);
    blogElement.href = user.blog.startsWith("http") ? user.blog : `https://${user.blog}`;
  } else {
    blogContainer.hidden = true;
  }

  joinedDateElement.textContent = formatDate(user.created_at);
  profileLink.href = user.html_url;

  followersEl.textContent = formatNumber(user.followers);
  followingEl.textContent = formatNumber(user.following);
  reposEl.textContent = formatNumber(user.public_repos);
}

//  FETCH REPOS
async function fetchRepositories(username) {
  showReposSkeleton();

  try {
    const response = await fetch(
      `${GITHUB_API}/${username}/repos?per_page=100&sort=updated`
    );

    if (!response.ok) throw new Error("Failed to fetch repos");

    const reposData = await response.json();
    allRepos = reposData;
    displayedCount = 0;

    reposCount.textContent = allRepos.length;
    renderRepos(true);

  } catch (err) {
    console.error(err);
    reposContainer.innerHTML = `<div class="gh-repos-empty"><p>Failed to load repositories</p></div>`;
    showMoreBtn.hidden = true;
  }
}

//  RENDER REPOS
function renderRepos(reset = false) {
  if (reset) {
    reposContainer.innerHTML = "";
    displayedCount = 0;
  }

  const sorted = sortRepos(allRepos, reposSortSelect.value);
  const slice = sorted.slice(displayedCount, displayedCount + PAGE_SIZE);

  if (allRepos.length === 0) {
    reposContainer.innerHTML = `<div class="gh-repos-empty"><p>No public repositories</p></div>`;
    showMoreBtn.hidden = true;
    return;
  }

  slice.forEach((repo, i) => {
    const card = createRepoCard(repo);
    card.style.animationDelay = `${i * 40}ms`;
    reposContainer.appendChild(card);
  });

  displayedCount += slice.length;

  if (displayedCount < sorted.length) {
    showMoreBtn.hidden = false;
  } else {
    showMoreBtn.hidden = true;
  }
}

function createRepoCard(repo) {
  const card = document.createElement("div");
  card.className = "gh-repo-card";

  const description = repo.description || "No description provided.";
  const updatedAt = formatRelativeTime(repo.updated_at);
  const visibility = repo.visibility || "public";

  card.innerHTML = `
    <a href="${repo.html_url}" target="_blank" rel="noopener" class="gh-repo-name">
      ${escapeHtml(repo.name)}
      <span class="gh-repo-visibility">${visibility}</span>
    </a>
    <p class="gh-repo-desc">${escapeHtml(description)}</p>
    <div class="gh-repo-meta">
      ${repo.language ? `
        <span class="gh-repo-meta-item">
          <span class="gh-repo-lang-dot" style="background:${getLangColor(repo.language)}"></span>
          ${escapeHtml(repo.language)}
        </span>
      ` : ""}
      <span class="gh-repo-meta-item">
        <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
          <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"></path>
        </svg>
        ${formatNumber(repo.stargazers_count)}
      </span>
      <span class="gh-repo-meta-item">
        <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
          <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"></path>
        </svg>
        ${formatNumber(repo.forks_count)}
      </span>
      <span class="gh-repo-meta-item">${updatedAt}</span>
    </div>
  `;
  return card;
}

function showReposSkeleton() {
  reposContainer.innerHTML = "";
  reposCount.textContent = "—";
  showMoreBtn.hidden = true;
  for (let i = 0; i < 3; i++) {
    const sk = document.createElement("div");
    sk.className = "gh-skeleton";
    sk.innerHTML = `
      <div class="gh-skeleton-line title"></div>
      <div class="gh-skeleton-line text"></div>
      <div class="gh-skeleton-line meta"></div>
    `;
    reposContainer.appendChild(sk);
  }
}

//  SORT
function sortRepos(repos, mode) {
  const copy = [...repos];
  if (mode === "stars") {
    return copy.sort((a, b) => b.stargazers_count - a.stargazers_count);
  }
  if (mode === "name") {
    return copy.sort((a, b) => a.name.localeCompare(b.name));
  }
  return copy.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
}

//  ERROR
function showError(title, message) {
  errorTitle.textContent = title;
  errorDesc.textContent = message;

  profileContainer.hidden = true;
  emptyState.hidden = true;
  errorContainer.hidden = false;

  reposContainer.innerHTML = `<div class="gh-repos-empty"><p>No user selected</p></div>`;
  reposCount.textContent = "—";
  showMoreBtn.hidden = true;
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatRelativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days < 1) return "today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

function formatNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
}

function cleanBlogUrl(url) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function getLangColor(lang) {
  const colors = {
    JavaScript: "#f1e05a",
    TypeScript: "#3178c6",
    Python: "#3572A5",
    HTML: "#e34c26",
    CSS: "#563d7c",
    Java: "#b07219",
    "C++": "#f34b7d",
    C: "#555555",
    "C#": "#178600",
    Go: "#00ADD8",
    Rust: "#dea584",
    Ruby: "#701516",
    PHP: "#4F5D95",
    Swift: "#ffac45",
    Kotlin: "#A97BFF",
    Shell: "#89e051",
    Dart: "#00B4AB",
    Vue: "#41b883",
    Svelte: "#ff3e00",
    Lua: "#000080",
    Perl: "#0298c3",
    Scala: "#c22d40",
    Elixir: "#6e4a7e",
    Haskell: "#5e5086",
    R: "#198CE7",
    "Jupyter Notebook": "#DA5B0B",
    Dockerfile: "#384d54",
  };
  return colors[lang] || "#8b949e";
}

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  searchUser();
});

reposSortSelect.addEventListener("change", () => {
  if (allRepos.length > 0) renderRepos(true);
});

showMoreBtn.addEventListener("click", () => {
  renderRepos(false);
});

//  INIT
renderRecent();
searchInput.value = "abdurrahman101bd";
searchUser();