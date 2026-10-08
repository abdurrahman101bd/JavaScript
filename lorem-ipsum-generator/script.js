document.getElementById("theme-switch").addEventListener("click", () => {
  document.body.classList.toggle("darkmode");
  const isDark = document.body.classList.contains("darkmode");
  localStorage.setItem("theme", isDark ? "dark" : "light");
});

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("darkmode");
}

const outputBox = document.getElementById("outputBox");
const tagsSelect = document.getElementById("tags");
const paragraphsSlider = document.getElementById("paragraphs");
const wordsSlider = document.getElementById("words");
const paragraphsValue = document.getElementById("paragraphsValue");
const wordsValue = document.getElementById("wordsValue");
const copyBtn = document.getElementById("copyBtn");
const clearBtn = document.getElementById("clearBtn");

const ALLOWED_TAGS = ["p", "h1", "h2", "h3", "h4", "h5", "h6", "span"];

function createOptionsUI() {
  ALLOWED_TAGS.forEach((tag) => {
    const option = document.createElement("option");
    option.value = tag;
    option.textContent = `<${tag}>`;
    tagsSelect.appendChild(option);
  });

  paragraphsSlider.addEventListener("input", () => {
    paragraphsValue.textContent = paragraphsSlider.value;
  });

  wordsSlider.addEventListener("input", () => {
    wordsValue.textContent = wordsSlider.value;
  });

  document.getElementById("generate").addEventListener("click", generateLoremIpsum);
}

function generateLoremIpsum() {
  const paragraphs = parseInt(paragraphsSlider.value, 10) || 1;
  const rawTag = tagsSelect.value;
  const includeHtml = document.getElementById("include").value;
  const wordsPerParagraph = parseInt(wordsSlider.value, 10) || 1;
  const tag = ALLOWED_TAGS.includes(rawTag) ? rawTag : "p";
  const text = buildOutputText(paragraphs, tag, includeHtml, wordsPerParagraph);

  outputBox.textContent = text;
  outputBox.dataset.lastText = text;
}

function buildOutputText(paragraphs, tag, includeHtml, wordsPerParagraph) {
  const parts = [];
  for (let i = 0; i < paragraphs; i++) {
    const words = generateWords(wordsPerParagraph);
    if (includeHtml === "Yes") {
      parts.push(`<${tag}>${words}</${tag}>`);
    } else {
      parts.push(words);
    }
  }
  return parts.join("\n\n");
}

const LOREM_FULL = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Diam in arcu cursus euismod quis viverra nibh. Nunc aliquet bibendum enim facilisis gravida neque convallis a cras. Sagittis purus sit amet volutpat consequat mauris. Duis ultricies lacus sed turpis tincidunt id. Consequat interdum varius sit amet mattis vulputate. Enim sed faucibus turpis in eu. Ridiculus mus mauris vitae ultricies leo integer malesuada nunc vel. Nulla pharetra diam sit amet nisl suscipit. Lobortis elementum nibh tellus molestie nunc non blandit massa enim. Dis parturient montes nascetur ridiculus mus. Justo nec ultrices dui sapien eget. Enim tortor at auctor urna nunc. Dictumst quisque sagittis purus sit amet volutpat consequat mauris nunc.`;
const LOREM_WORDS = LOREM_FULL.split(/\s+/).filter((w) => w.length > 0);

function generateWords(numWords) {
  if (numWords <= LOREM_WORDS.length) {
    return LOREM_WORDS.slice(0, numWords).join(" ");
  }
  let result = [];
  while (result.length < numWords) {
    result = result.concat(LOREM_WORDS);
  }
  return result.slice(0, numWords).join(" ");
}

copyBtn.addEventListener("click", async () => {
  const text = outputBox.dataset.lastText || outputBox.textContent;
  if (!text || !text.trim()) return;

  try {
    await navigator.clipboard.writeText(text);
    showCopiedState();
  } catch (err) {
    fallbackCopy(text);
    showCopiedState();
  }
});

function showCopiedState() {
  copyBtn.classList.add("copied");
  const original = copyBtn.innerHTML;
  copyBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!`;
  setTimeout(() => {
    copyBtn.classList.remove("copied");
    copyBtn.innerHTML = original;
  }, 1600);
}

function fallbackCopy(text) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand("copy"); } catch (e) {}
  document.body.removeChild(ta);
}

clearBtn.addEventListener("click", () => {
  outputBox.textContent = "";
  delete outputBox.dataset.lastText;
});

createOptionsUI();