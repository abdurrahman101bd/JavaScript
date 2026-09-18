const projects = [
  {
    title: "Text Utils",
    description: "A fast, fully client-side tool to transform your text easily (UPPERCASE, lowercase, Capitalize, Remove Spaces, and quick copying).",
    thumbnail: "assets/TextUtils.png",
    live: "https://abdurrahman101bd.github.io/JavaScript/TextUtils",
    repo: "https://github.com/abdurrahman101bd/JavaScript/tree/main/TextUtils"
  },{
    title: "TODO APP",
    description: "This project is a secure and interactive To-Do List web app where users can add, edit, delete, and mark tasks as completed.",
    thumbnail: "assets/todo-app.png",
    live: "https://abdurrahman101bd.github.io/JavaScript/todo-app",
    repo: "https://github.com/abdurrahman101bd/JavaScript/tree/main/todo-app"
  },{
    title: "Stopwatch",
    description: "A simple digital stopwatch that counts time in HH:MM:SS:MS format (hours, minutes, seconds, milliseconds) with Start, Stop, and Reset controls.",
    thumbnail: "assets/stopwatch.png",
    live: "https://abdurrahman101bd.github.io/JavaScript/stopwatch",
    repo: "https://github.com/abdurrahman101bd/JavaScript/tree/main/stopwatch"
  },{
    title: "Theme Switch",
    description: "A simple light and dark theme switcher using DOM manipulation and localStorage.",
    thumbnail: "assets/theme-switch.png",
    live: "https://abdurrahman101bd.github.io/JavaScript/theme-switch",
    repo: "https://github.com/abdurrahman101bd/JavaScript/tree/main/theme-switch"
  }
];

const projectGrid = document.getElementById("project-grid");
const projectCount = document.getElementById("project-count");
const themeSwitch = document.getElementById("theme-switch");
const themeLabel = themeSwitch.querySelector(".theme-label");
const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const ICONS = {
  live: '<svg viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>',
  repo: '<svg viewBox="0 0 640 640"><path d="M280.5 426.5C214.5 418.5 168 371 168 309.5C168 284.5 177 257.5 192 239.5C185.5 223 186.5 188 194 173.5C214 171 241 181.5 257 196C276 190 296 187 320.5 187C345 187 365 190 383 195.5C398.5 181.5 426 171 446 173.5C453 187 454 222 447.5 239C463.5 258 472 283.5 472 309.5C472 371 425.5 417.5 358.5 426C375.5 437 387 461 387 488.5L387 540.5C387 555.5 399.5 564 414.5 558C505 523.5 576 433 576 321C576 179.5 461 64 319.5 64C178 64 64 179.5 64 321C64 432 134.5 524 229.5 558.5C243 563.5 256 554.5 256 541L256 501C249 504 240 506 232 506C199 506 179.5 488 165.5 454.5C160 441 154 433 142.5 431.5C136.5 431 134.5 428.5 134.5 425.5C134.5 419.5 144.5 415 154.5 415C169 415 181.5 424 194.5 442.5C204.5 457 215 463.5 227.5 463.5C240 463.5 248 459 259.5 447.5C268 439 274.5 431.5 280.5 426.5z"/></svg>'
};

function createProjectCard(project) {
  const card = document.createElement("article");
  card.className = "project-card";

  const thumb = document.createElement("div");
  thumb.className = "project-thumb";

  if (project.thumbnail) {
    const image = document.createElement("img");
    image.src = project.thumbnail;
    image.alt = `${project.title} thumbnail`;
    image.loading = "lazy";
    thumb.appendChild(image);
  } else {
    const placeholder = document.createElement("div");
    placeholder.className = "thumb-placeholder";
    placeholder.textContent = "</>";
    thumb.appendChild(placeholder);
  }

  const body = document.createElement("div");
  body.className = "project-body";

  const title = document.createElement("h3");
  title.textContent = project.title || "Untitled Project";

  const description = document.createElement("p");
  description.className = "project-description";
  description.textContent = project.description || "";
  if (!project.description) description.classList.add("empty");

  const actions = document.createElement("div");
  actions.className = "project-actions";

  actions.appendChild(createProjectLink(project.live, "Live demo", "project-button live-button", ICONS.live));
  actions.appendChild(createProjectLink(project.repo, "View source on GitHub", "project-button repo-button", ICONS.repo));

  body.append(title, description, actions);
  card.append(thumb, body);

  return card;
}

function createProjectLink(url, label, className, iconHTML) {
  const isRealLink = typeof url === "string" && url.trim() !== "" && url !== "#";

  const el = document.createElement(isRealLink ? "a" : "span");
  el.className = isRealLink ? className : `${className} disabled`;
  el.innerHTML = `${iconHTML}<span class="sr-only">${label}</span>`;
  el.title = label;
  el.setAttribute("aria-label", label);

  if (isRealLink) {
    el.href = url;
    el.target = "_blank";
    el.rel = "noopener noreferrer";
  } else {
    el.setAttribute("aria-disabled", "true");
  }

  return el;
}

function renderProjects() {
  projectGrid.replaceChildren();

  projects.forEach((project) => {
    projectGrid.appendChild(createProjectCard(project));
  });

  projectCount.textContent = String(projects.length).padStart(2, "0");
}

function updateThemeLabel() {
  const isDark = document.body.classList.contains("darkmode");
  themeLabel.textContent = isDark ? "Light mode" : "Dark mode";
  themeSwitch.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
}

function enableDarkMode() {
  document.body.classList.add("darkmode");
  localStorage.setItem("darkmode", "active");
  updateThemeLabel();
}

function disableDarkMode() {
  document.body.classList.remove("darkmode");
  localStorage.setItem("darkmode", "inactive");
  updateThemeLabel();
}

const savedTheme = localStorage.getItem("darkmode");
if (savedTheme === "active") {
  enableDarkMode();
} else {
  updateThemeLabel();
}

themeSwitch.addEventListener("click", () => {
  if (document.body.classList.contains("darkmode")) {
    disableDarkMode();
  } else {
    enableDarkMode();
  }
});

function closeMenu() {
  navLinks.classList.remove("open");
  menuToggle.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open menu");
}

menuToggle.addEventListener("click", (event) => {
  event.stopPropagation();
  const isOpen = navLinks.classList.toggle("open");
  menuToggle.classList.toggle("open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("click", (event) => {
  if (!navLinks.classList.contains("open")) return;
  if (navLinks.contains(event.target) || menuToggle.contains(event.target)) return;
  closeMenu();
});

function typeLines(container, lines, { charDelay = 16, lineGap = 180, onDone } = {}) {
  container.replaceChildren();

  if (prefersReducedMotion) {
    lines.forEach((tokens) => {
      const p = document.createElement("p");
      tokens.forEach(({ text, cls }) => {
        if (cls) {
          const span = document.createElement("span");
          span.className = cls;
          span.textContent = text;
          p.appendChild(span);
        } else {
          p.appendChild(document.createTextNode(text));
        }
      });
      container.appendChild(p);
    });
    if (onDone) onDone();
    return;
  }

  let lineIndex = 0;

  function typeNextLine() {
    if (lineIndex >= lines.length) {
      if (onDone) onDone();
      return;
    }

    const tokens = lines[lineIndex];
    const p = document.createElement("p");
    container.appendChild(p);

    if (tokens.length === 0) {
      lineIndex += 1;
      setTimeout(typeNextLine, lineGap / 2);
      return;
    }

    let tokenIndex = 0;
    let charIndex = 0;
    let currentSpan = null;

    function typeNextChar() {
      const token = tokens[tokenIndex];

      if (!currentSpan) {
        if (token.cls) {
          currentSpan = document.createElement("span");
          currentSpan.className = token.cls;
          p.appendChild(currentSpan);
        } else {
          currentSpan = document.createTextNode("");
          p.appendChild(currentSpan);
        }
      }

      currentSpan.textContent += token.text[charIndex];
      charIndex += 1;

      if (charIndex >= token.text.length) {
        tokenIndex += 1;
        charIndex = 0;
        currentSpan = null;
      }

      if (tokenIndex >= tokens.length) {
        lineIndex += 1;
        setTimeout(typeNextLine, lineGap);
        return;
      }

      setTimeout(typeNextChar, charDelay + Math.random() * 12);
    }
    typeNextChar();
  }
  typeNextLine();
}

const heroCodeLines = [
  [{ text: "// javascript-journey.js", cls: "comment" }],
  [],
  [{ text: "const", cls: "purple" }, { text: " skills = [" }],
  [{ text: "  " }, { text: "'Variables'", cls: "orange" }, { text: "," }],
  [{ text: "  " }, { text: "'Functions'", cls: "orange" }, { text: "," }],
  [{ text: "  " }, { text: "'DOM'", cls: "orange" }, { text: "," }],
  [{ text: "  " }, { text: "'Events'", cls: "orange" }, { text: "," }],
  [{ text: "  " }, { text: "'Async JavaScript'", cls: "orange" }],
  [{ text: "];" }],
  [],
  [{ text: "const", cls: "purple" }, { text: " " },
    { text: "learn", cls: "blue" }, { text: " = (skill) =>" }],
  [{ text: "  console.log(" },
    { text: "`Learning ${skill}...`", cls: "orange" }, { text: ");" }],
  [],
  [{ text: "skills." }, { text: "forEach", cls: "blue" }, { text: "(learn);" }]
];

const heroOutputLines = [
  [{ text: "▸ ", cls: "arrow" }, { text: "Learning Variables..." }],
  [{ text: "▸ ", cls: "arrow" }, { text: "Learning Functions..." }],
  [{ text: "▸ ", cls: "arrow" }, { text: "Learning DOM..." }],
  [{ text: "▸ ", cls: "arrow" }, { text: "Learning Events..." }],
  [{ text: "▸ ", cls: "arrow" }, { text: "Learning Async JavaScript..." }],
  [],
  [{ text: "✓ ", cls: "arrow" }, { text: "JavaScript journey in progress..." }]
];

function runHeroTypewriter() {
  const heroCode = document.getElementById("hero-code");
  const codeOutput = document.getElementById("code-output");
  const codeStatus = document.getElementById("code-status");
  if (!heroCode) return;

  typeLines(heroCode, heroCodeLines, {
    charDelay: 14,
    lineGap: 130,
    onDone: () => {
      const lastLine = heroCode.lastElementChild;
      if (lastLine) {
        const cursor = document.createElement("span");
        cursor.className = "type-cursor";
        lastLine.appendChild(cursor);
      }
      typeLines(codeOutput, heroOutputLines, {
        charDelay: 10,
        lineGap: 160,
        onDone: () => codeStatus.classList.add("visible")
      });
    }
  });
}

function animateLearningList() {
  const items = document.querySelectorAll(".learning-item");

  if (prefersReducedMotion) {
    items.forEach((item) => item.classList.add("show"));
    return;
  }

  items.forEach((item, index) => {
    setTimeout(() => {
      item.classList.add("show");
    }, index * 180);
  });
}

let learningAnimated = false;
const aboutSection = document.getElementById("about");

if (aboutSection && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !learningAnimated) {
        learningAnimated = true;
        animateLearningList();
        observer.disconnect();
      }
    });
  }, { threshold: 0.35 });

  observer.observe(aboutSection);
} else {
  animateLearningList();
}

document.getElementById("year").textContent = new Date().getFullYear();

renderProjects();
window.addEventListener("load", () => {
  setTimeout(runHeroTypewriter, 300);
});
