const display = document.getElementById('display');
let timer = null;
let startTime = 0;
let elapsedTimer = 0;
let isRunning = false;

const start = () => {
    if (!isRunning) {
        startTime = Date.now() - elapsedTimer;
        timer = setInterval(updateDisplay, 10);
        isRunning = true;
    }
};

const stop = () => {
    if (isRunning) {
        clearInterval(timer);
        elapsedTimer = Date.now() - startTime;
        isRunning = false;
    }
};

const reset = () => {
    clearInterval(timer);
    startTime = 0;
    elapsedTimer = 0;
    isRunning = false;
    display.textContent = '00:00:00:00'
    display.classList.remove('running');
};

const updateDisplay = () => {
    const currentTime = Date.now();
    elapsedTimer = currentTime - startTime;

    let hours = Math.floor(elapsedTimer / (1000 * 60 * 60));
    let minutes = Math.floor(elapsedTimer / (1000 * 60) % 60);
    let seconds = Math.floor(elapsedTimer / 1000 % 60);
    let milliseconds = Math.floor(elapsedTimer % 1000 / 10);

    hours = String(hours).padStart(2, '0');
    minutes = String(minutes).padStart(2, '0');
    seconds = String(seconds).padStart(2, '0');
    milliseconds = String(milliseconds).padStart(2, '0');

    display.textContent = `${hours}:${minutes}:${seconds}:${milliseconds}`;
    display.classList.add('running');
};
