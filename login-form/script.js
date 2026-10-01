"use strict";

const loginForm = document.getElementById("loginForm");
const loginDialog = document.getElementById("loginDialog");
const forgotDialog = document.getElementById("forgotDialog");
const forgotForm = document.getElementById("forgotForm");
const signupDialog = document.getElementById("signupDialog");
const signupForm = document.getElementById("signupForm");
const dialogs = document.querySelectorAll(".dialog-overlay");
const resultIcon = document.getElementById("resultIcon");
const resultTitle = document.getElementById("resultTitle");
const resultText = document.getElementById("resultText");
const resultButton = document.getElementById("loginClose");

document.getElementById("theme-switch").addEventListener("click", () => {
  document.body.classList.toggle("darkmode");

  if (document.body.classList.contains("darkmode")) {
    localStorage.setItem("theme", "dark");}
  else {
    localStorage.setItem("theme", "light");
  }
});

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("darkmode");
}

document.querySelectorAll("[data-toggle-pass]").forEach((button) => {
  button.addEventListener("click", () => {
    const inputId = button.dataset.togglePass;
    const input = document.getElementById(inputId);
    const icon = button.querySelector(".icon");

    if (input.type === "password") {
      input.type = "text";
      icon.classList.remove("ri-eye-line");
      icon.classList.add("ri-eye-off-line");
      button.setAttribute("aria-label", "Hide password");
    } else {
      input.type = "password";
      icon.classList.remove("ri-eye-off-line");
      icon.classList.add("ri-eye-line");
      button.setAttribute("aria-label", "Show password");
    }
  });
});

document.querySelectorAll(".input-pass").forEach((input) => {
  input.addEventListener("input", () => {
    const wrapper = input.closest(".input");

    if (input.value !== "") {
      wrapper.classList.add("has-value");
    } else {
      wrapper.classList.remove("has-value");
    }
  });
});

function openDialog(dialog) {
  dialog.classList.add("show");
  dialog.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeDialog(dialog) {
  dialog.classList.remove("show");
  dialog.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  resultIcon.innerHTML = '<i class="ri-check-line"></i>';
  resultTitle.textContent = "Login successful";
  resultText.textContent = "Welcome back! Redirecting you to the dashboard…";
  resultButton.innerHTML = 'Continue <i class="ri-arrow-right-line"></i>';
  openDialog(loginDialog);
  loginForm.reset();
});

resultButton.addEventListener("click", () => closeDialog(loginDialog));

document.getElementById("forgotLink").addEventListener("click", (event) => {
  event.preventDefault();
  openDialog(forgotDialog);
});

forgotForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = document.getElementById("forgotEmail").value;
  resultIcon.innerHTML = '<i class="ri-mail-send-line"></i>';
  resultTitle.textContent = "Reset link sent";
  resultText.textContent = `A reset link was sent to ${email}.`;
  resultButton.innerHTML = 'Done <i class="ri-check-line"></i>';
  closeDialog(forgotDialog);
  openDialog(loginDialog);
  forgotForm.reset();
  loginForm.reset();
});

document.getElementById("signupLink").addEventListener("click", (event) => {
  event.preventDefault();
  openDialog(signupDialog);
});

signupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  resultIcon.innerHTML = '<i class="ri-user-add-line"></i>';
  resultTitle.textContent = "Account created";
  resultText.textContent = "Your account has been created successfully!";
  resultButton.innerHTML = 'Continue <i class="ri-arrow-right-line"></i>';
  closeDialog(signupDialog);
  openDialog(loginDialog);
  signupForm.reset();
  loginForm.reset();
});

document.querySelectorAll("[data-close]").forEach((button) => {
  button.addEventListener("click", () => {
    const dialogId = button.dataset.close;
    const dialog = document.getElementById(dialogId);
    closeDialog(dialog);
  });
});

dialogs.forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      closeDialog(dialog);
    }
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    dialogs.forEach((dialog) => {
      closeDialog(dialog);
    });
  }
});