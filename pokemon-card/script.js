const card = document.getElementById("card");
const btn  = document.getElementById("btn");

const API_URL = "https://pokeapi.co/api/v2/pokemon/";
const MAX_ID  = 898;

const TYPE_COLORS = {
  bug: "#26de81",
  dark: "#4b4b6b",
  dragon: "#5b6dee",
  electric: "#fed330",
  fairy: "#ff6bcb",
  fighting: "#d63b47",
  fire: "#f0932b",
  flying: "#a29bfe",
  ghost: "#9b59b6",
  grass: "#22c55e",
  ground: "#d4a017",
  ice: "#74b9ff",
  normal: "#95afc0",
  poison: "#a55eea",
  psychic: "#ff6b9d",
  rock: "#a67c52",
  steel: "#7f8fa6",
  water: "#0190ff",
};

const TYPE_GLOWS = {
  bug: "rgba(38, 222, 129, 0.55)",
  dark: "rgba(75, 75, 107, 0.55)",
  dragon: "rgba(91, 109, 238, 0.55)",
  electric: "rgba(254, 211, 48, 0.55)",
  fairy: "rgba(255, 107, 203, 0.55)",
  fighting: "rgba(214, 59, 71, 0.55)",
  fire: "rgba(240, 147, 43, 0.55)",
  flying: "rgba(162, 155, 254, 0.55)",
  ghost: "rgba(155, 89, 182, 0.55)",
  grass: "rgba(34, 197, 94, 0.55)",
  ground: "rgba(212, 160, 23, 0.55)",
  ice: "rgba(116, 185, 255, 0.55)",
  normal: "rgba(149, 175, 192, 0.55)",
  poison: "rgba(165, 94, 234, 0.55)",
  psychic:"rgba(255, 107, 157, 0.55)",
  rock: "rgba(166, 124, 82, 0.55)",
  steel: "rgba(127, 143, 166, 0.55)",
  water:"rgba(1, 144, 255, 0.55)",
};

let isLoading = false;

function showLoading() {
  card.innerHTML = `
    <div class="placeholder">
      <div class="loading-spinner"></div>
      <p>Fetching Pokemon...</p>
    </div>
  `;
  card.style.setProperty("--card-color", "var(--accent)");
  card.style.setProperty("--card-glow", "var(--accent-glow)");
}

function showError(message = "Failed to load. Try again!") {
  card.innerHTML = `
    <div class="placeholder">
      <div class="placeholder-icon">😕</div>
      <p>${message}</p>
    </div>
  `;
}

async function getPokeData() {
  if (isLoading) return;
  isLoading = true;

  btn.disabled = true;
  btn.innerHTML = `<span class="spinner"></span> Loading...`;

  showLoading();

  const id = Math.floor(Math.random() * MAX_ID) + 1;
  const url = `${API_URL}${id}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Network error");
    const data = await response.json();
    generateCard(data);
  } catch (err) {
    console.error(err);
    showError();
  } finally {
    btn.disabled = false;
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 11.9 13 12.5 13 14h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
      </svg>
      Generate
    `;
    isLoading = false;
  }
}

function getBestImage(sprites) {
  return (
    sprites?.other?.dream_world?.front_default ||
    sprites?.other?.["official-artwork"]?.front_default ||
    sprites?.other?.home?.front_default ||
    sprites?.front_default ||
    "" // empty → we'll show fallback
  );
}

function generateCard(data) {
  const hp = data.stats[0].base_stat;
  const imgSrc = getBestImage(data.sprites);
  const pokeName = data.name.charAt(0).toUpperCase() + data.name.slice(1);
  const statAttack = data.stats[1].base_stat;
  const statDefense = data.stats[2].base_stat;
  const statSpeed = data.stats[5].base_stat;

  const primaryType = data.types[0].type.name;
  const themeColor = TYPE_COLORS[primaryType] || TYPE_COLORS.normal;
  const themeGlow = TYPE_GLOWS[primaryType]  || TYPE_GLOWS.normal;

  card.style.setProperty("--card-color", themeColor);
  card.style.setProperty("--card-glow", themeGlow);
  card.style.borderColor = themeGlow;

  const typesHTML = data.types
    .map((t) => `<span>${t.type.name}</span>`)
    .join("");

  const imgHTML = imgSrc
    ? `<img src="${imgSrc}" alt="${pokeName}" onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${data.id}.png'" />`
    : `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${data.id}.png" alt="${pokeName}" />`;

  card.innerHTML = `
    <div class="poke-content">
      <div class="hp">
        <span class="hp-label">HP</span>
        <span class="hp-value">${hp}</span>
      </div>

      <div class="poke-img-wrap">
        ${imgHTML}
      </div>

      <h2 class="poke-name">${pokeName}</h2>

      <div class="types">${typesHTML}</div>

      <div class="stats">
        <div>
          <h3>${statAttack}</h3>
          <p>Attack</p>
        </div>
        <div>
          <h3>${statDefense}</h3>
          <p>Defense</p>
        </div>
        <div>
          <h3>${statSpeed}</h3>
          <p>Speed</p>
        </div>
      </div>
    </div>
  `;
}

btn.addEventListener("click", getPokeData);
window.addEventListener("load", getPokeData);