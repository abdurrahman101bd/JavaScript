const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("statusText");
const restartBtn = document.getElementById("restart");

let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let gameActive = true;

const winPatterns = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

function renderBoard() {
  cells.forEach((cell, i) => {
    const val = board[i];
    cell.textContent = val;
    if (val) cell.setAttribute("data-mark", val);
    else cell.removeAttribute("data-mark");
  });
}

function checkWinner() {
  for (const pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], pattern: pattern };
    }
  }
  if (!board.includes("")) return { winner: "tie", pattern: null };
  return null;
}

function updateStatus() {
  const result = checkWinner();
  statusText.classList.remove("win", "tie");

  if (result?.winner === "tie") {
    statusText.textContent = "It's a tie!";
    statusText.classList.add("tie");
    gameActive = false;
    cells.forEach(c => c.classList.add("locked"));
  } else if (result?.winner) {
    statusText.textContent = `Player ${result.winner} wins!`;
    statusText.classList.add("win");
    gameActive = false;

    result.pattern.forEach(i => cells[i].classList.add("win-cell"));

    cells.forEach(c => c.classList.add("locked"));
    winConfetti();
  } else {
    statusText.textContent = `Player ${currentPlayer}'s turn`;
  }
}

function handleCellClick(e) {
  const cell = e.currentTarget;
  const index = Number(cell.getAttribute("cellIndex"));

  if (!gameActive || board[index] !== "") return;

  board[index] = currentPlayer;
  renderBoard();

  const result = checkWinner();
  if (result) {
    updateStatus();
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  statusText.textContent = `Player ${currentPlayer}'s turn`;
  statusText.classList.remove("win", "tie");
}

function restartGame() {
  board = ["", "", "", "", "", "", "", "", ""];
  currentPlayer = "X";
  gameActive = true;
  renderBoard();
  cells.forEach(c => {
    c.classList.remove("locked");
    c.classList.remove("win-cell");
  });
  statusText.classList.remove("win", "tie");
  statusText.textContent = `Player ${currentPlayer}'s turn`;
}

function initGame() {
  renderBoard();

  cells.forEach(cell => {
    cell.removeEventListener("click", handleCellClick);
    cell.addEventListener("click", handleCellClick);
  });

  restartBtn.removeEventListener("click", restartGame);
  restartBtn.addEventListener("click", restartGame);

  statusText.textContent = `Player ${currentPlayer}'s turn`;
}

initGame();

function winConfetti() {
  const count = 200;
  const defaults = { origin: { y: 0.7 } };

  function fire(ratio, opts) {
    confetti(
      Object.assign({}, defaults, opts, {
        particleCount: Math.floor(count * ratio),
      })
    );
  }

  fire(0.25, { spread: 26, startVelocity: 55 });
  fire(0.2, { spread: 60 });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  fire(0.1, { spread: 120, startVelocity: 45 });
}