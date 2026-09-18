const textarea = document.querySelector('.container textarea');
const charCount = document.getElementById('char-count');
const copyBtn = document.getElementById('btn-copy');
const clearBtn = document.getElementById('btn-clear');
const uppercaseBtn = document.getElementById('btn-uppercase');
const lowercaseBtn = document.getElementById('btn-lowercase');
const capitalizeBtn = document.getElementById('btn-capitalize');
const removeSpacesBtn = document.getElementById('btn-remove-spaces');
const modalOverlay = document.getElementById('clear-modal');
const cancelBtn = document.getElementById('btn-modal-cancel');
const confirmBtn = document.getElementById('btn-modal-confirm');

function updateCharCount() {
    const len = textarea.value.length;
    charCount.textContent = `${len} ${len === 1 ? 'character' : 'characters'}`;
}

textarea.addEventListener('input', updateCharCount);
updateCharCount(); 

clearBtn.addEventListener('click', () => {
    modalOverlay.classList.add('active');
});

cancelBtn.addEventListener('click', () => {
    modalOverlay.classList.remove('active');
});

modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        modalOverlay.classList.remove('active');
    }
});

confirmBtn.addEventListener('click', () => {
    textarea.value = '';
    updateCharCount();
    modalOverlay.classList.remove('active');
});

const copyHTML = copyBtn.innerHTML;
let copyTimeout;

copyBtn.addEventListener('click', () => {
    if (!textarea.value) return;

    navigator.clipboard.writeText(textarea.value).then(() => {
        copyBtn.innerHTML =
            '<span class="btn-icon material-symbols-outlined">check</span> Copied!';

        clearTimeout(copyTimeout);
        copyTimeout = setTimeout(() => {
            copyBtn.innerHTML = copyHTML;
        }, 2000);
    });
});

document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
        if (document.activeElement !== textarea) {
            e.preventDefault();
            copyBtn.click();
        }
    }

    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
        modalOverlay.classList.remove('active');
    }
});

uppercaseBtn.addEventListener('click', () => {
    textarea.value = textarea.value.toUpperCase();
    updateCharCount();
});

lowercaseBtn.addEventListener('click', () => {
    textarea.value = textarea.value.toLowerCase();
    updateCharCount();
});

capitalizeBtn.addEventListener('click', () => {
    if (!textarea.value) return;
    textarea.value = textarea.value
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    updateCharCount();
});

removeSpacesBtn.addEventListener('click', () => {
    textarea.value = textarea.value.replace(/\s+/g, ' ').trim();
    updateCharCount();
});