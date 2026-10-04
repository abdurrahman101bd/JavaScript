const monthNameEl = document.getElementById("month-name");
const dayNameEl = document.getElementById("day-name");
const dayNumEl = document.getElementById("day-number");
const yearEl = document.getElementById("year");

const date = new Date();

monthNameEl.innerText = date.toLocaleString("en-US", { month: "long" });
dayNameEl.innerText = date.toLocaleString("en-US", { weekday: "long" });
dayNumEl.innerText = String(date.getDate()).padStart(2, "0");
yearEl.innerText = date.getFullYear();