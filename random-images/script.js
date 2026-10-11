const imagesContainer = document.getElementById("images");
const generateBtn = document.getElementById("generate-btn");
const countBtns = document.querySelectorAll(".count-btn");

const lightbox = document.getElementById("lightbox");
const lightboxOverlay = document.getElementById("lightboxOverlay");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxDownload = document.getElementById("lightboxDownload");

const WIDTH  = 600;
const HEIGHT = 600;

let imageCount = 3;
let isLoading  = false;
let currentLightboxUrl = "";

function getRandomImageUrl() {
  const seed = Math.random().toString(36).slice(2, 10);
  return `https://picsum.photos/seed/${seed}/${WIDTH}/${HEIGHT}`;
}

function updateGridColumns(count) {
  imagesContainer.style.setProperty("--cols", count === 1 ? 1 : 3);
}

async function downloadImage(url, filename = null) {
  if (!url) return;

  const name = filename || `random-image-${Date.now()}.jpg`;

  try {
    const response = await fetch(url, { mode: "cors" });
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();

    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  } catch (err) {
    window.open(url, "_blank", "noopener");
  }
}

function createCard(index) {
  const card = document.createElement("div");
  card.className = "img-card";
  card.style.animationDelay = `${index * 70}ms`;

  const badge = document.createElement("div");
  badge.className = "badge";
  badge.textContent = index + 1;

  const skeleton = document.createElement("div");
  skeleton.className = "skeleton";

  const img = document.createElement("img");
  img.alt = `Random image ${index + 1}`;
  img.loading = "lazy";
  img.decoding = "async";

  const dlBtn = document.createElement("button");
  dlBtn.className = "download-btn";
  dlBtn.title = "Download";
  dlBtn.setAttribute("aria-label", "Download image");
  dlBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z"/></svg>`;

  dlBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    downloadImage(img.src, `random-image-${index + 1}.jpg`);
  });

  card.addEventListener("click", () => {
    if (!img.src || !img.classList.contains("loaded")) return;
    openLightbox(img.src);
  });

  img.addEventListener("load", () => {
    img.classList.add("loaded");
    skeleton.classList.add("hide");
    card.classList.add("loaded-card");
  });

  img.addEventListener("error", () => {
    skeleton.classList.add("hide");
    card.classList.add("loaded-card");
    card.innerHTML = `
      <div style="
        width:100%;height:100%;display:flex;
        align-items:center;justify-content:center;
        font-size:32px;opacity:0.4;
      ">🖼️</div>
    `;
  });

  card.appendChild(skeleton);
  card.appendChild(badge);
  card.appendChild(img);
  card.appendChild(dlBtn);

  return { card, img };
}

function generateImages() {
  if (isLoading) return;
  isLoading = true;

  generateBtn.disabled = true;
  generateBtn.innerHTML = `<span class="spinner"></span> Loading...`;

  updateGridColumns(imageCount);

  const oldCards = imagesContainer.querySelectorAll(".img-card");
  const clearDelay = oldCards.length > 0 ? 350 : 0;

  oldCards.forEach((c, i) => {
    c.style.animationDelay = `${i * 40}ms`;
    c.classList.add("flip-out");
  });

  setTimeout(() => {
    imagesContainer.innerHTML = "";

    const imagePromises = [];

    for (let i = 0; i < imageCount; i++) {
      const { card, img } = createCard(i);
      card.classList.add("flip-in"); 

      const promise = new Promise((resolve) => {
        const done = () => resolve();
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
      });

      img.src = getRandomImageUrl();
      imagesContainer.appendChild(card);
      imagePromises.push(promise);
    }

    Promise.all(imagePromises).then(() => {
      setTimeout(() => {
        generateBtn.disabled = false;
        generateBtn.innerHTML = `
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
          </svg>
          Generate Images
        `;
        isLoading = false;
      }, 200);
    });
  }, clearDelay);
}

countBtns.forEach((b) => {
  b.addEventListener("click", () => {
    if (isLoading) return;

    countBtns.forEach((x) => x.classList.remove("active"));
    b.classList.add("active");
    imageCount = parseInt(b.dataset.count, 10);

    generateImages();
  });
});

function openLightbox(url) {
  if (!url) return;
  currentLightboxUrl = url;
  lightboxImg.src = url;
  lightbox.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  lightbox.classList.remove("show");
  document.body.style.overflow = "";
  setTimeout(() => {
    lightboxImg.src = "";
    currentLightboxUrl = "";
  }, 350);
}

lightboxOverlay.addEventListener("click", closeLightbox);

lightboxDownload.addEventListener("click", (e) => {
  e.stopPropagation();
  if (currentLightboxUrl) {
    downloadImage(currentLightboxUrl, `random-image-${Date.now()}.jpg`);
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && lightbox.classList.contains("show")) {
    closeLightbox();
  }
});

generateBtn.addEventListener("click", generateImages);

updateGridColumns(imageCount);
generateImages();