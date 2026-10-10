const userScoreEl = document.getElementById("user_score");
const compScoreEl = document.getElementById("computer_score");
const userChoiceEl = document.getElementById("user_choice");
const compChoiceEl = document.getElementById("comp_choice");
const resultEl = document.getElementById("result");
const weaponBtns = document.querySelectorAll(".weapon-btn");
const resetBtn = document.getElementById("reset-btn");

let userScore = 0;
let computerScore = 0;

const outcomes = {
  rock: { rock: 'draw', scissor: 'win',  paper: 'lose' },
  scissor: { rock: 'lose', scissor: 'draw', paper: 'win'  },
  paper: { rock: 'win',  scissor: 'lose', paper: 'draw' }
};

const choices = ["rock", "paper", "scissor"];

const displayNames = {
  rock: "Rock",
  paper: "Paper",
  scissor: "Scissors"
};

function bump(el) {
  el.classList.remove("bump");
  void el.offsetWidth;
  el.classList.add("bump");
  setTimeout(() => el.classList.remove("bump"), 500);
}

function play(userChoice) {
  resultEl.classList.remove("win", "lose", "draw");

  const computerChoice = choices[Math.floor(Math.random() * 3)];

  userChoiceEl.textContent = displayNames[userChoice];
  compChoiceEl.textContent = displayNames[computerChoice];

  const outcome = outcomes[userChoice][computerChoice];

  if (outcome === "win") {
    userScore++;
    userScoreEl.textContent = userScore;
    bump(userScoreEl);
    resultEl.textContent = "You Win!";
    resultEl.classList.add("win");
  } else if (outcome === "lose") {
    computerScore++;
    compScoreEl.textContent = computerScore;
    bump(compScoreEl);
    resultEl.textContent = "You Lose";
    resultEl.classList.add("lose");
  } else {
    resultEl.textContent = "Draw";
    resultEl.classList.add("draw");
  }
}

weaponBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    play(btn.dataset.choice);
  });
});

resetBtn.addEventListener("click", () => {
  userScore = 0;
  computerScore = 0;
  userScoreEl.textContent = "0";
  compScoreEl.textContent = "0";
  userChoiceEl.textContent = "—";
  compChoiceEl.textContent = "—";
  resultEl.textContent = "Pick a weapon to start";
  resultEl.classList.remove("win", "lose", "draw");
});