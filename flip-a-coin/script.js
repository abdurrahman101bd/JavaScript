const coin = document.getElementById('coin');
const flipBtn = document.getElementById('flip-button');
const resetBtn = document.getElementById('reset-button');
const headsCount = document.getElementById('heads-count');
const tailsCount = document.getElementById('tails-count');

let heads = 0;
let tails = 0;

flipBtn.addEventListener('click', () => {
  const isHeads = Math.random() < 0.5;
  coin.style.animation = 'none';
  void coin.offsetWidth;

  const animationName = isHeads ? 'spin-heads' : 'spin-tails';
  coin.style.animation = `${animationName} 3s cubic-bezier(0.3, 0.7, 0.4, 1) forwards`;

  disableButton();

  setTimeout(() => {
    if (isHeads) {
      heads++;
      headsCount.textContent = heads;
      bump(headsCount);
    } else {
      tails++;
      tailsCount.textContent = tails;
      bump(tailsCount);
    }
  }, 3000);
});

resetBtn.addEventListener('click', () => {
  coin.style.animation = 'none';
  void coin.offsetWidth;

  heads = 0;
  tails = 0;
  headsCount.textContent = '0';
  tailsCount.textContent = '0';

  bump(headsCount);
  bump(tailsCount);
});

function bump(el) {
  el.classList.remove('bump');
  void el.offsetWidth;
  el.classList.add('bump');
  setTimeout(() => el.classList.remove('bump'), 500);
}

function disableButton() {
  flipBtn.disabled = true;
  setTimeout(() => {
    flipBtn.disabled = false;
  }, 3000);
}