const dobDay = document.getElementById("dob-day");
const dobMonth = document.getElementById("dob-month");
const dobYear = document.getElementById("dob-year");
const atDay = document.getElementById("at-day");
const atMonth = document.getElementById("at-month");
const atYear = document.getElementById("at-year");

const calculateBtn = document.getElementById("calculate-btn");
const themeSwitch = document.getElementById("theme-switch");

const yearsEl = document.getElementById("years");
const monthsEl = document.getElementById("months");
const daysEl = document.getElementById("days");
const resultDateBadge = document.getElementById("result-date-badge");

const totalMonthsEl = document.getElementById("total-months");
const extraDays1El = document.getElementById("extra-days-1");
const totalWeeksEl = document.getElementById("total-weeks");
const extraDays2El = document.getElementById("extra-days-2");
const totalDaysEl = document.getElementById("total-days");
const totalHoursEl = document.getElementById("total-hours");
const totalMinutesEl = document.getElementById("total-minutes");
const totalSecondsEl = document.getElementById("total-seconds");

const dayOfWeekEl = document.getElementById("day-of-week");
const dayOfYearEl = document.getElementById("day-of-year");
const weekOfYearEl = document.getElementById("week-of-year");

const nextBirthdayText = document.getElementById("next-birthday-text");

const emptyState = document.getElementById("empty-state");
const resultContent = document.getElementById("result-content");

const monthsArray = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const today = new Date();

function populateSelects() {
  for (let i = 1; i <= 31; i++) {
    dobDay.add(new Option(i, i));
    atDay.add(new Option(i, i));
  }
  monthsArray.forEach((month, i) => {
    dobMonth.add(new Option(month, i));
    atMonth.add(new Option(month, i));
  });
  for (let i = 1900; i <= today.getFullYear(); i++) {
    dobYear.add(new Option(i, i));
    atYear.add(new Option(i, i));
  }

  dobDay.value = 1;
  dobMonth.value = 0;
  dobYear.value = 2000;

  atDay.value = today.getDate();
  atMonth.value = today.getMonth();
  atYear.value = today.getFullYear();
}

function updateDays() {
  const selectedYear = Number(dobYear.value);
  const selectedMonth = Number(dobMonth.value);
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

  const currentVal = Number(dobDay.value);
  dobDay.innerHTML = "";
  for (let i = 1; i <= daysInMonth; i++) {
    dobDay.add(new Option(i, i));
  }
  if (currentVal <= daysInMonth) dobDay.value = currentVal;
  else dobDay.value = daysInMonth;
}

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("darkmode");
}

themeSwitch.addEventListener("click", () => {
  document.body.classList.toggle("darkmode");
  const isDark = document.body.classList.contains("darkmode");
  localStorage.setItem("theme", isDark ? "dark" : "light");
});

calculateBtn.addEventListener("click", () => {
  const dob = new Date(Number(dobYear.value), Number(dobMonth.value), Number(dobDay.value));
  const ageAt = new Date(Number(atYear.value), Number(atMonth.value), Number(atDay.value));

  if (dob > ageAt) {
    alert("Date of birth cannot be after the target date.");
    return;
  }

  let years = ageAt.getFullYear() - dob.getFullYear();
  let months = ageAt.getMonth() - dob.getMonth();
  let days = ageAt.getDate() - dob.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(ageAt.getFullYear(), ageAt.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  yearsEl.textContent = years;
  monthsEl.textContent = months;
  daysEl.textContent = days;

  const totalMonths = years * 12 + months;
  totalMonthsEl.textContent = totalMonths;
  extraDays1El.textContent = days;

  const diffTime = Math.abs(ageAt - dob);
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.floor(totalDays / 7);
  const remainingDays = totalDays % 7;

  totalWeeksEl.textContent = totalWeeks;
  extraDays2El.textContent = remainingDays;

  totalDaysEl.textContent = totalDays.toLocaleString();
  totalHoursEl.textContent = (totalDays * 24).toLocaleString();
  totalMinutesEl.textContent = (totalDays * 24 * 60).toLocaleString();
  totalSecondsEl.textContent = (totalDays * 24 * 60 * 60).toLocaleString();

  resultDateBadge.textContent = ageAt.toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric"
  });

  let nextBd = new Date(ageAt.getFullYear(), dob.getMonth(), dob.getDate());
  if (nextBd < ageAt) {
    nextBd.setFullYear(nextBd.getFullYear() + 1);
  }
  const bdDiffMs = nextBd - ageAt;
  const bdDiffDays = Math.ceil(bdDiffMs / (1000 * 60 * 60 * 24));
  
  if (bdDiffDays === 0) {
    nextBirthdayText.textContent = "🎉 Happy Birthday!";
  } else {
    nextBirthdayText.textContent = `In ${bdDiffDays} day${bdDiffDays === 1 ? "" : "s"}`;
  }

  // Birthday Info (Day of Week, Day of Year, Week of Year)
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  dayOfWeekEl.textContent = daysOfWeek[dob.getDay()];

  const startOfYear = new Date(dob.getFullYear(), 0, 0);
  const diff = dob - startOfYear;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  dayOfYearEl.textContent = dayOfYear;

  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  const weekOfYear = Math.ceil(dayOfYear / 7);
  weekOfYearEl.textContent = weekOfYear;

  emptyState.hidden = true;
  resultContent.hidden = false;
});

dobMonth.addEventListener("change", updateDays);
dobYear.addEventListener("change", updateDays);

populateSelects();