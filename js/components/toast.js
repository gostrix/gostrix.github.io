let toastEl = null;
let toastTimer = null;

function ensureToast() {
    if (!toastEl) {
        toastEl = document.createElement('div');
        toastEl.className = 'toast';
        document.body.appendChild(toastEl);
    }
    return toastEl;
}

export function showToast(message, duration = 2000) {
    const el = ensureToast();
    el.textContent = message;
    el.classList.add('visible');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        el.classList.remove('visible');
    }, duration);
}
