const slideEl = document.querySelector(".slide");
const nextBtn = document.querySelector(".next");
const prevBtn = document.querySelector(".prev");
const dotsEl = document.querySelector(".dots");

let totalItems = slideEl.children.length;
let currentIndex = 0;

function buildDots() {
  dotsEl.innerHTML = "";
  for (let i = 0; i < totalItems; i++) {
    const dot = document.createElement("span");
    dot.className = "dot" + (i === currentIndex ? " active" : "");
    dot.addEventListener("click", () => goToIndex(i));
    dotsEl.appendChild(dot);
  }
}

function updateDots() {
  const dots = dotsEl.querySelectorAll(".dot");
  dots.forEach((dot, i) => {
    dot.classList.toggle("active", i === currentIndex);
  });
}

function goToIndex(target) {
  const diff = (target - currentIndex + totalItems) % totalItems;
  for (let i = 0; i < diff; i++) {
    const items = slideEl.querySelectorAll(".item");
    slideEl.appendChild(items[0]);
  }
  currentIndex = target;
  updateDots();
}

nextBtn.addEventListener("click", () => {
  const items = slideEl.querySelectorAll(".item");
  slideEl.appendChild(items[0]);
  currentIndex = (currentIndex + 1) % totalItems;
  updateDots();
});

prevBtn.addEventListener("click", () => {
  const items = slideEl.querySelectorAll(".item");
  slideEl.prepend(items[items.length - 1]);
  currentIndex = (currentIndex - 1 + totalItems) % totalItems;
  updateDots();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") nextBtn.click();
  if (e.key === "ArrowLeft") prevBtn.click();
});

let touchStartX = 0;
let touchEndX = 0;

slideEl.addEventListener("touchstart", (e) => {
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

slideEl.addEventListener("touchend", (e) => {
  touchEndX = e.changedTouches[0].screenX;
  const diff = touchStartX - touchEndX;
  if (Math.abs(diff) > 50) {
    if (diff > 0) nextBtn.click();
    else prevBtn.click();
  }
}, { passive: true });

buildDots();