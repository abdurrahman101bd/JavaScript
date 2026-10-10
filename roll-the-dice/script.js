const images = [
  "dice-01.svg",
  "dice-02.svg",
  "dice-03.svg",
  "dice-04.svg",
  "dice-05.svg",
  "dice-06.svg",
];

const dice = document.querySelectorAll(".dice-slot img");
const slots  = document.querySelectorAll(".dice-slot");
const totalEl = document.getElementById("total");
const rollBtn = document.getElementById("roll-btn");

let isRolling = false;

function roll() {
  if (isRolling) return;
  isRolling = true;
  rollBtn.disabled = true;

  dice.forEach((die) => die.classList.add("shake"));
  slots.forEach((slot) => slot.classList.add("rolling"));

  setTimeout(() => {
    dice.forEach((die) => die.classList.remove("shake"));
    slots.forEach((slot) => slot.classList.remove("rolling"));

    const dieOneValue = Math.floor(Math.random() * 6);
    const dieTwoValue = Math.floor(Math.random() * 6);

    document.getElementById("die-1").setAttribute("src", images[dieOneValue]);
    document.getElementById("die-2").setAttribute("src", images[dieTwoValue]);

    const total = (dieOneValue + 1) + (dieTwoValue + 1);

    totalEl.textContent = total;
    totalEl.classList.remove("bump");
    void totalEl.offsetWidth;
    totalEl.classList.add("bump");

    isRolling = false;
    rollBtn.disabled = false;
  }, 1000);
}

rollBtn.addEventListener("click", roll);

roll();