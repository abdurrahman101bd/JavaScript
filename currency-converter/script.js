const converterForm = document.getElementById("converter-form");
const fromCurrency = document.getElementById("from-currency");
const toCurrency = document.getElementById("to-currency");
const amountInput = document.getElementById("amount");
const convertBtn = document.getElementById("convert-btn");
const swapBtn = document.getElementById("swap-btn");
const fromFlag = document.getElementById("from-flag");
const toFlag = document.getElementById("to-flag");
const amountPrefix = document.getElementById("amount-prefix");

const resultValue = document.getElementById("result-value");
const resultCurrency = document.getElementById("result-currency");
const resultRate = document.getElementById("result-rate");
const resultMeta = document.getElementById("result-meta");
const metaFrom = document.getElementById("meta-from");
const metaTo = document.getElementById("meta-to");
const metaUpdated = document.getElementById("meta-updated");
const toastEl = document.getElementById("toast");

const chartWrap = document.getElementById("chart-wrap");
const chartLoading = document.getElementById("chart-loading");
const chartPair = document.getElementById("chart-pair");
const chartCanvas = document.getElementById("rate-chart");

const API_BASE = "https://api.exchangerate-api.com/v4/latest";
const FRANKFURTER_BASE = "https://api.frankfurter.dev/v2";
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

let ratesCache = {};
let currenciesLoaded = false;
let rateChart = null;

const DEFAULT_FROM = "USD";
const DEFAULT_TO   = "BDT";

const CURRENCY_FLAGS = {
  USD: "🇺🇸", EUR: "🇪🇺", GBP: "🇬🇧", JPY: "🇯🇵", CNY: "🇨🇳",
  AUD: "🇦🇺", CAD: "🇨🇦", CHF: "🇨🇭", HKD: "🇭🇰", SGD: "🇸🇬",
  INR: "🇮🇳", BDT: "🇧🇩", PKR: "🇵🇰", LKR: "🇱🇰", NPR: "🇳🇵",
  KRW: "🇰🇷", MYR: "🇲🇾", THB: "🇹🇭", IDR: "🇮🇩", PHP: "🇵🇭",
  VND: "🇻🇳", TRY: "🇹🇷", RUB: "🇷🇺", BRL: "🇧🇷", MXN: "🇲🇽",
  ZAR: "🇿🇦", AED: "🇦🇪", SAR: "🇸🇦", QAR: "🇶🇦", KWD: "🇰🇼",
  EGP: "🇪🇬", NGN: "🇳🇬", KES: "🇰🇪", ILS: "🇮🇱", NZD: "🇳🇿",
  SEK: "🇸🇪", NOK: "🇳🇴", DKK: "🇩🇰", PLN: "🇵🇱", CZK: "🇨🇿",
  HUF: "🇭🇺", RON: "🇷🇴", BGN: "🇧🇬", ISK: "🇮🇸", MAD: "🇲🇦",
};

const CURRENCY_SYMBOLS = {
  USD: "$", EUR: "€", GBP: "£", JPY: "¥", CNY: "¥", INR: "₹", BDT: "৳",
  KRW: "₩", THB: "฿", PHP: "₱", VND: "₫", RUB: "₽", TRY: "₺",
  NGN: "₦", ILS: "₪", AUD: "A$", CAD: "C$", HKD: "HK$", SGD: "S$",
  NZD: "NZ$", BRL: "R$", MXN: "MX$", ZAR: "R", PKR: "₨", LKR: "Rs",
  NPR: "₨",
};

const FRANKFURTER_SUPPORTED = new Set([
  "USD","EUR","GBP","JPY","AUD","CAD","CHF","CNY","HKD","SGD",
  "INR","BDT","PKR","LKR","NPR","KRW","MYR","THB","IDR","PHP",
  "VND","TRY","RUB","BRL","MXN","ZAR","AED","SAR","QAR","KWD",
  "EGP","NGN","KES","ILS","NZD","SEK","NOK","DKK","PLN","CZK",
  "HUF","RON","BGN","ISK","MAD",
]);

function getFlag(code) {
  return CURRENCY_FLAGS[code] || "🌎";
}

function getSymbol(code) {
  return CURRENCY_SYMBOLS[code] || code;
}

function isChartable(from, to) {
  return (
    FRANKFURTER_SUPPORTED.has(from) &&
    FRANKFURTER_SUPPORTED.has(to) &&
    from !== to
  );
}

let toastTimer = null;
function showToast(message, type = "success") {
  toastEl.textContent = message;
  toastEl.className = `toast show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2400);
}

async function getRates(base) {
  const now = Date.now();
  const cached = ratesCache[base];

  if (cached && now - cached.time < CACHE_TTL) {
    return cached.rates;
  }

  const response = await fetch(`${API_BASE}/${base}`);
  if (!response.ok) throw new Error("Failed to fetch rates");
  const data = await response.json();

  ratesCache[base] = { rates: data.rates, time: now };
  return data.rates;
}

async function fetchCurrencies() {
  try {
    const rates = await getRates("USD");
    const currencies = Object.keys(rates).sort();

    fromCurrency.innerHTML = "";
    toCurrency.innerHTML = "";

    currencies.forEach((code) => {
      const opt1 = document.createElement("option");
      opt1.value = code;
      opt1.textContent = code;
      fromCurrency.appendChild(opt1);

      const opt2 = document.createElement("option");
      opt2.value = code;
      opt2.textContent = code;
      toCurrency.appendChild(opt2);
    });

    fromCurrency.value = currencies.includes(DEFAULT_FROM) ? DEFAULT_FROM : currencies[0];
    toCurrency.value   = currencies.includes(DEFAULT_TO) ? DEFAULT_TO : currencies[1] || currencies[0];

    updateFlags();
    amountPrefix.textContent = getSymbol(fromCurrency.value);

    currenciesLoaded = true;
    await convertCurrency();
  } catch (err) {
    console.error(err);
    showToast("Failed to load currencies. Check connection.", "error");
    resultRate.innerHTML = `<span style="color: #fca5a5;">Failed to load rates</span>`;
  }
}

function updateFlags() {
  fromFlag.textContent = getFlag(fromCurrency.value);
  toFlag.textContent = getFlag(toCurrency.value);
  amountPrefix.textContent = getSymbol(fromCurrency.value);
}

async function convertCurrency(e) {
  if (e) e.preventDefault();

  if (!currenciesLoaded) return;

  const amount = parseFloat(amountInput.value);
  const from = fromCurrency.value;
  const to = toCurrency.value;

  if (isNaN(amount) || amount < 0) {
    showToast("Please enter a valid amount", "error");
    amountInput.focus();
    return;
  }

  if (from === to) {
    resultValue.textContent = amount.toFixed(2);
    resultCurrency.textContent = to;
    resultRate.textContent = "Same currency — no conversion needed";
    resultMeta.hidden = false;
    metaFrom.textContent = from;
    metaTo.textContent = to;
    metaUpdated.textContent = "just now";

    hideChart();
    return;
  }

  convertBtn.disabled = true;
  convertBtn.textContent = "Converting...";
  resultRate.innerHTML = `<span class="rate-loading">Fetching rate...</span>`;

  try {
    const rates = await getRates(from);
    const rate  = rates[to];

    if (!rate) throw new Error("Rate not available");

    const converted = amount * rate;

    const formatted = converted >= 1000
      ? converted.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : converted.toFixed(2);

    resultValue.textContent = formatted;
    resultCurrency.textContent = to;

    resultValue.classList.remove("flash");
    void resultValue.offsetWidth;
    resultValue.classList.add("flash");

    resultRate.textContent = `1 ${from} = ${rate.toFixed(4)} ${to}`;

    resultMeta.hidden = false;
    metaFrom.textContent = from;
    metaTo.textContent = to;
    metaUpdated.textContent = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    renderChart(from, to);
  } catch (err) {
    console.error(err);
    showToast("Conversion failed. Try again.", "error");
    resultRate.innerHTML = `<span style="color: #fca5a5;">Conversion failed</span>`;
    hideChart();
  } finally {
    convertBtn.disabled = false;
    convertBtn.textContent = "Convert";
  }
}

function hideChart() {
  chartWrap.hidden = true;
  chartLoading.hidden = true;
  if (rateChart) {
    rateChart.destroy();
    rateChart = null;
  }
}

async function fetchHistoricalSeries(from, to, days = 7) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days);

  const fromStr = start.toISOString().slice(0, 10);
  const toStr = end.toISOString().slice(0, 10);

  const url = `${FRANKFURTER_BASE}/rates?from=${fromStr}&to=${toStr}&base=${from}&quotes=${to}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Frankfurter fetch failed");

  const data = await res.json();

  if (!Array.isArray(data)) throw new Error("Unexpected response format");

  data.sort((a, b) => a.date.localeCompare(b.date));
  return data;
}

async function renderChart(from, to) {
  hideChart();

  if (!isChartable(from, to)) {
    return;
  }

  chartLoading.hidden = false;
  chartPair.textContent = `${from} → ${to}`;

  try {
    const series = await fetchHistoricalSeries(from, to, 7);

    if (!series || series.length < 2) {
      chartLoading.hidden = true;
      return;
    }

    const labels = series.map((d) => {
      const dt = new Date(d.date);
      return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    });

    const values = series.map((d) => d.rate);

    chartLoading.hidden = true;
    chartWrap.hidden = false;

    if (rateChart) {
      rateChart.destroy();
      rateChart = null;
    }

    const ctx = chartCanvas.getContext("2d");

    const gradient = ctx.createLinearGradient(0, 0, 0, 90);
    gradient.addColorStop(0, "rgba(200, 150, 24, 0.35)");
    gradient.addColorStop(1, "rgba(200, 150, 24, 0)");

    rateChart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            data: values,
            borderColor: "#c89618",
            backgroundColor: gradient,
            borderWidth: 2,
            fill: true,
            tension: 0.35,
            pointRadius: 0,
            pointHoverRadius: 4,
            pointHoverBackgroundColor: "#c89618",
            pointHoverBorderColor: "#fff",
            pointHoverBorderWidth: 1.5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 600,
          easing: "easeOutCubic",
        },
        interaction: {
          intersect: false,
          mode: "index",
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(10, 30, 20, 0.95)",
            titleColor: "rgba(232, 243, 236, 0.7)",
            titleFont: { family: "DM Mono", size: 10 },
            bodyColor: "#fff",
            bodyFont: { family: "DM Mono", size: 12, weight: "500" },
            borderColor: "rgba(200, 150, 24, 0.4)",
            borderWidth: 1,
            padding: 10,
            cornerRadius: 6,
            displayColors: false,
            callbacks: {
              label: (ctx) => {
                const val = ctx.parsed.y;
                return `${val.toFixed(4)} ${to}`;
              },
            },
          },
        },
        scales: {
          x: {
            display: false,
          },
          y: {
            display: false,
            suggestedMin: Math.min(...values) * 0.998,
            suggestedMax: Math.max(...values) * 1.002,
          },
        },
      },
    });
  } catch (err) {
    console.error("Chart error:", err);
    chartLoading.hidden = true;
    chartWrap.hidden = true;
  }
}

swapBtn.addEventListener("click", async () => {
  if (!currenciesLoaded) return;
  const tmp = fromCurrency.value;
  fromCurrency.value = toCurrency.value;
  toCurrency.value = tmp;
  updateFlags();
  await convertCurrency();
});

amountInput.addEventListener("input", () => {
  clearTimeout(amountInput._timer);
  amountInput._timer = setTimeout(convertCurrency, 400);
});

fromCurrency.addEventListener("change", async () => {
  updateFlags();
  await convertCurrency();
});

toCurrency.addEventListener("change", async () => {
  updateFlags();
  await convertCurrency();
});

converterForm.addEventListener("submit", convertCurrency);

window.addEventListener("load", fetchCurrencies);