const btn12 = document.getElementById('btn-12');
const btn24 = document.getElementById('btn-24');
const hhEl = document.getElementById('hh');
const mmEl = document.getElementById('mm');
const ssEl = document.getElementById('ss');
const ampm = document.getElementById('ampm');
const dateEl = document.getElementById('date');
const dayEl = document.getElementById('day');
const greetingEl = document.getElementById('greeting');
const mainEl = document.querySelector('main');
const yearEl = document.getElementById('year');

let hour12 = true;

const pad = (n) => String(n).padStart(2, '0');

let weatherText = "";
let weatherLoaded = false;

async function fetchWeather() {
  if (!navigator.geolocation) {
    weatherText = "";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;

      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`;
        const res = await fetch(url);
        const data = await res.json();

        const temp = Math.round(data.current.temperature_2m);
        const code = data.current.weather_code;

        weatherText = `, ${temp}°C ${weatherEmoji(code)}`;
        weatherLoaded = true;

        updateGreeting(new Date().getHours());
      } catch (err) {
        console.error("Weather fetch failed:", err);
        weatherText = "";
      }
    },
    () => {
      weatherText = "";
    }
  );
}

function weatherEmoji(code) {
  if (code === 0) return "☀️";
  if (code >= 1 && code <= 3) return "🌤️";
  if (code === 45 || code === 48) return "🌫️";
  if (code >= 51 && code <= 67) return "🌧️";
  if (code >= 71 && code <= 77) return "❄️";
  if (code >= 80 && code <= 82) return "🌦️";
  if (code >= 95) return "⛈️";
  return "🌡️";
}

function getGreeting(hour) {
  if (hour >= 5 && hour < 12)  return { base: "Good morning",  theme: "morning" };
  if (hour >= 12 && hour < 17) return { base: "Good afternoon", theme: "afternoon" };
  if (hour >= 17 && hour < 21) return { base: "Good evening",  theme: "evening" };
  return { base: "Good night", theme: "night" };
}

let lastGreeting = "";

function updateGreeting(hour) {
  const { base, theme } = getGreeting(hour);
  const fullText = weatherText ? `${base}${weatherText}` : base;

  if (fullText !== lastGreeting) {
    greetingEl.classList.add('fade');

    setTimeout(() => {
      greetingEl.textContent = fullText;
      greetingEl.setAttribute('data-time', theme);
      mainEl.setAttribute('data-theme', theme);
      greetingEl.classList.remove('fade');
    }, 400);

    lastGreeting = fullText;
  }
}

function updateClock() {
  const now = new Date();
  let h = now.getHours();
  const m = now.getMinutes();
  const s = now.getSeconds();

  let amPm = "";

  if (hour12) {
    amPm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    ampm.style.display = "inline-block";
  } else {
    ampm.style.display = "none";
  }

  hhEl.textContent = pad(h);
  mmEl.textContent = pad(m);
  ssEl.textContent = pad(s);
  ampm.textContent = amPm;

  dateEl.textContent = now.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  dayEl.textContent = now.toLocaleDateString("en-US", {
    weekday: "long"
  });

  updateGreeting(now.getHours());
}

btn12.addEventListener("click", () => {
  hour12 = true;
  btn12.classList.add("active");
  btn24.classList.remove("active");
  updateClock();
});

btn24.addEventListener("click", () => {
  hour12 = false;
  btn12.classList.remove("active");
  btn24.classList.add("active");
  updateClock();
});

updateClock();
setInterval(updateClock, 1000);
fetchWeather();

if (yearEl) {
  yearEl.textContent = `© ${new Date().getFullYear()}`;
}