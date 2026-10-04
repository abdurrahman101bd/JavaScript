const monthEl = document.querySelector(".date h1");
const fullDateEl = document.querySelector(".date p");
const daysEl = document.querySelector(".days");

const today = new Date();
const monthInx = today.getMonth();
const year = today.getFullYear();
const lastDay = new Date(year, monthInx + 1, 0).getDate();
const rawFirst = new Date(year, monthInx, 1).getDay();
const firstDay = rawFirst === 0 ? 6 : rawFirst - 1;

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

monthEl.innerText = months[monthInx];
fullDateEl.innerText = today.toDateString();

let days = "";

for (let i = 0; i < firstDay; i++) {
  days += `<div class="empty"></div>`;
}

for (let i = 1; i <= lastDay; i++) {
  const weekdayIdx = (firstDay + i - 1) % 7;
  const isWeekend = weekdayIdx === 5 || weekdayIdx === 6;
  const isToday = i === today.getDate();

  const classes = [
    isToday ? "today" : "",
    isWeekend && !isToday ? "weekend-day" : "",
  ].filter(Boolean).join(" ");

  days += `<div class="${classes}" style="animation-delay:${i * 15}ms">${i}</div>`;
}

daysEl.innerHTML = days;