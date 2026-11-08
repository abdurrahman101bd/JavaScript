const resultElement = document.getElementById("result");
const historyElement = document.getElementById("history");

const clearBtn = document.getElementById("clear-button");
const deleteBtn = document.getElementById("delete-button");
const divideBtn = document.getElementById("divide-button");
const multiplyBtn = document.getElementById("multiply-button");
const subtractBtn = document.getElementById("subtract-button");
const addBtn = document.getElementById("add-button");
const decimalBtn = document.getElementById("decimal-button");
const equalBtn = document.getElementById("equal-button");
const numberBtns = document.querySelectorAll(".number");

let currentInput = "0";
let previousOperand = null;
let operation = null;
let shouldResetInput = false;

function updateDisplay() {
  resultElement.textContent = currentInput;
  if (operation && previousOperand !== null) {
    const opMap = { "+": "+", "-": "−", "*": "×", "/": "÷" };
    historyElement.textContent = `${previousOperand} ${opMap[operation]} ${
      shouldResetInput ? "" : currentInput
    }`;
  } else {
    historyElement.textContent = "";
  }
}

function appendNumber(num) {
  if (currentInput === "0" || shouldResetInput) {
    currentInput = num === "." ? "0." : num;
    shouldResetInput = false;
  } else {
    if (num === "." && currentInput.includes(".")) return;
    currentInput += num;
  }
  updateDisplay();
}

function selectOperator(op) {
  if (operation && previousOperand !== null && !shouldResetInput) {
    calculateResult();
  }
  operation = op;
  previousOperand = currentInput;
  shouldResetInput = true;
  updateDisplay();
}

function calculateResult() {
  if (operation === null || previousOperand === null) return;
  const prev = parseFloat(previousOperand);
  const current = parseFloat(currentInput);
  if (isNaN(prev) || isNaN(current)) return;

  let evalResult = 0;
  switch (operation) {
    case "+": evalResult = prev + current; break;
    case "-": evalResult = prev - current; break;
    case "*": evalResult = prev * current; break;
    case "/": evalResult = current === 0 ? "Error" : prev / current; break;
    default: return;
  }

  currentInput = evalResult.toString();
  operation = null;
  previousOperand = null;
  shouldResetInput = true;
  updateDisplay();
}

function clearDisplay() {
  currentInput = "0";
  previousOperand = null;
  operation = null;
  shouldResetInput = false;
  updateDisplay();
}

numberBtns.forEach((btn) =>
  btn.addEventListener("click", () => appendNumber(btn.textContent))
);

decimalBtn.addEventListener("click", () => appendNumber("."));
addBtn.addEventListener("click", () => selectOperator("+"));
subtractBtn.addEventListener("click", () => selectOperator("-"));
multiplyBtn.addEventListener("click", () => selectOperator("*"));
divideBtn.addEventListener("click", () => selectOperator("/"));
clearBtn.addEventListener("click", clearDisplay);

deleteBtn.addEventListener("click", () => {
  if (shouldResetInput) return;
  currentInput = currentInput.slice(0, -1);
  if (currentInput === "") currentInput = "0";
  updateDisplay();
});

equalBtn.addEventListener("click", () => {
  if (operation === null) return;
  calculateResult();
});

document.addEventListener("keydown", (e) => {
  if (e.key >= "0" && e.key <= "9") appendNumber(e.key);
  if (e.key === ".") appendNumber(".");
  if (e.key === "+") selectOperator("+");
  if (e.key === "-") selectOperator("-");
  if (e.key === "*") selectOperator("*");
  if (e.key === "/") { e.preventDefault(); selectOperator("/"); }
  if (e.key === "Enter" || e.key === "=") equalBtn.click();
  if (e.key === "Backspace") deleteBtn.click();
  if (e.key === "Escape") clearDisplay();
});

updateDisplay();