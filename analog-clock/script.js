const hourHand = document.getElementById("hand-hour");
const minuteHand = document.getElementById("hand-minute");
const secondHand = document.getElementById("hand-second");

function updateClock() {
  const now = new Date();

  const ms = now.getMilliseconds();
  const seconds = now.getSeconds() + ms / 1000;
  const minutes = now.getMinutes() + seconds / 60;
  const hours = (now.getHours() % 12) + minutes / 60;

  const secondAngle = seconds * 6;
  const minuteAngle = minutes * 6;
  const hourAngle = hours * 30;

  secondHand.style.transform = `rotate(${secondAngle}deg)`;
  minuteHand.style.transform = `rotate(${minuteAngle}deg)`;
  hourHand.style.transform = `rotate(${hourAngle}deg)`;

  requestAnimationFrame(updateClock);
}

requestAnimationFrame(updateClock);