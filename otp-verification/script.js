const inputs = document.querySelectorAll('.otp-box');
const inputsWrap = document.getElementById('otp-inputs');
const loader = document.getElementById('otp-loader');
const successBox = document.getElementById('otp-success');
const form = document.getElementById('otp-form');
const verifyBtn = document.getElementById('verify-btn');
const resendBtn = document.getElementById('resend-btn');
const resendWrap = document.getElementById('resend-wrap');
const toastEl = document.getElementById('toast');

let timerInterval = null;
let timeLeft = 30;
let isVerifying = false;
let isVerified = false;
let resetTimeout = null;

function updateDisabledState() {
  let firstEmptyIdx = inputs.length;
  for (let i = 0; i < inputs.length; i++) {
    if (!inputs[i].value) {
      firstEmptyIdx = i;
      break;
    }
  }

  inputs.forEach((input, idx) => {
    if (isVerifying || isVerified) {
      input.disabled = true;
      return;
    }

    if (firstEmptyIdx === inputs.length) {
      input.disabled = false;
    } else {
      input.disabled = idx > firstEmptyIdx;
    }
  });
}

function checkComplete() {
  const allFilled = [...inputs].every((i) => i.value.trim() !== '');
  verifyBtn.disabled = !allFilled || isVerifying || isVerified;
  return allFilled;
}

function resetToInputState() {
  clearTimeout(resetTimeout);
  clearInterval(timerInterval);

  inputs.forEach((i) => {
    i.value = '';
    i.classList.remove('filled', 'error', 'success');
    i.disabled = true;
  });

  inputsWrap.classList.remove('hide');
  loader.classList.remove('show');
  successBox.classList.remove('show');
  verifyBtn.classList.remove('hide');
  resendWrap.classList.remove('hide');
  verifyBtn.disabled = true;
  verifyBtn.textContent = 'Verify Code';
  verifyBtn.style.background = '';
  verifyBtn.style.boxShadow = '';

  isVerifying = false;
  isVerified = false;

  updateDisabledState(); 
  inputs[0].focus();

  startTimer();
}

inputs.forEach((input, idx) => {
  input.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.slice(-1);
    e.target.value = value;

    if (value) {
      input.classList.add('filled');
    } else {
      input.classList.remove('filled');
    }

    updateDisabledState();

    const allFilled = checkComplete();

    if (value) {
      if (allFilled) {
        input.blur();
      } else if (idx < inputs.length - 1) {
        inputs[idx + 1].focus();
      }
    }
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace') {
      if (!e.target.value && idx > 0) {
        e.preventDefault();
        const prev = inputs[idx - 1];
        prev.value = '';
        prev.classList.remove('filled');
        prev.disabled = false;
        updateDisabledState();
        checkComplete();
        prev.focus();
      }
    }

    if (e.key === 'ArrowLeft' && idx > 0 && !inputs[idx - 1].disabled) {
      e.preventDefault();
      inputs[idx - 1].focus();
    }
    if (e.key === 'ArrowRight' && idx < inputs.length - 1 && !inputs[idx + 1].disabled) {
      e.preventDefault();
      inputs[idx + 1].focus();
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      const allFilled = checkComplete();
      if (allFilled && !isVerifying && !isVerified) {
        form.requestSubmit();
      }
    }
  });

  input.addEventListener('paste', (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData || window.clipboardData)
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6);

    if (!pasted) return;

    inputs.forEach((box, i) => {
      box.value = pasted[i] || '';
      box.classList.toggle('filled', !!pasted[i]);
    });

    updateDisabledState();
    const allFilled = checkComplete();

    if (allFilled) {
      inputs[inputs.length - 1].blur();
    } else {
      const nextEmpty = [...inputs].find((i) => !i.value && !i.disabled);
      if (nextEmpty) nextEmpty.focus();
    }
  });

  input.addEventListener('focus', () => {
    setTimeout(() => input.select(), 0);
  });
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (isVerifying || isVerified) return;

  const code = [...inputs].map((i) => i.value).join('');
  if (code.length !== 6) {
    showToast('Please enter all 6 digits', 'error');
    return;
  }

  isVerifying = true;
  updateDisabledState(); 

  inputs.forEach((i) => i.blur());
  inputsWrap.classList.add('hide');
  verifyBtn.classList.add('hide');
  resendWrap.classList.add('hide');
  loader.classList.add('show');

  await new Promise((resolve) => setTimeout(resolve, 1500));

  if (code === '000000') {
    loader.classList.remove('show');
    inputsWrap.classList.remove('hide');
    verifyBtn.classList.remove('hide');
    resendWrap.classList.remove('hide');

    inputs.forEach((i) => i.classList.add('error'));
    showToast('Invalid code. Please try again.', 'error');

    setTimeout(() => {
      inputs.forEach((i) => {
        i.value = '';
        i.classList.remove('error', 'filled');
      });
      isVerifying = false;
      updateDisabledState();
      checkComplete();
      inputs[0].focus();
    }, 600);
  } else {
    loader.classList.remove('show');
    successBox.classList.add('show');
    showToast('Verified successfully!', 'success');

    isVerifying = false;
    isVerified = true;

    clearInterval(timerInterval);

    resetTimeout = setTimeout(() => {
      resetToInputState();
    }, 3000);
  }
});

function startTimer() {
  clearInterval(timerInterval);
  timeLeft = 30;
  resendBtn.disabled = true;
  resendBtn.innerHTML = `Resend in <span id="timer">${timeLeft}</span>s`;

  const newTimerEl = document.getElementById('timer');

  timerInterval = setInterval(() => {
    timeLeft--;
    if (newTimerEl) newTimerEl.textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      resendBtn.disabled = false;
      resendBtn.textContent = 'Resend Code';
    }
  }, 1000);
}

resendBtn.addEventListener('click', () => {
  if (resendBtn.disabled || isVerified) return;

  inputs.forEach((i) => {
    i.value = '';
    i.classList.remove('filled', 'success', 'error');
  });

  inputsWrap.classList.remove('hide');
  successBox.classList.remove('show');
  verifyBtn.classList.remove('hide');
  verifyBtn.disabled = true;
  verifyBtn.textContent = 'Verify Code';
  verifyBtn.style.background = '';
  verifyBtn.style.boxShadow = '';

  isVerifying = false;
  isVerified = false;

  updateDisabledState();
  checkComplete();
  showToast('A new code has been sent!', 'success');
  startTimer();
  setTimeout(() => inputs[0].focus(), 100);
});

let toastTimeout = null;

function showToast(message, type = 'success') {
  toastEl.textContent = message;
  toastEl.className = `toast show ${type}`;

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toastEl.classList.remove('show');
  }, 3000);
}

updateDisabledState();
startTimer();
setTimeout(() => inputs[0].focus(), 300);