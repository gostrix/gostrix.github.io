/*
 * landing/js/copy-command.js
 *
 * Copy-to-clipboard helper for every element annotated with data-copy.
 * The attribute value is the exact text that lands on the clipboard
 * (this lets the visual label differ from the copied payload, e.g.
 * the UI shows "bash <(curl …)" but the clipboard receives the full
 * command with no truncation).
 *
 * Toast feedback is rendered through a single global .toast element
 * (see end.css). A secondary container-scoped copy indicator is
 * applied via the .copied class on the button itself.
 */

function ensureToast() {
    var el = document.querySelector('.toast');
    if (el) return el;
    el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML =
        '<svg viewBox="0 0 16 16" fill="none">' +
        '  <path d="M3 8l3 3 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
        '</svg>' +
        '<span class="toast-text">Copied</span>';
    document.body.appendChild(el);
    return el;
}

function showToast(message) {
    var toast = ensureToast();
    toast.querySelector('.toast-text').textContent = message || 'Copied';
    toast.classList.add('visible');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(function() {
        toast.classList.remove('visible');
    }, 1800);
}

async function copy(text) {
    // Preferred path — secure-context async Clipboard API.
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (e) { /* fall through to textarea fallback */ }
    }
    // Fallback for http:// contexts or older Safari.
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'absolute';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
    return ok;
}

export function initCopy() {
    document.addEventListener('click', async function(e) {
        var btn = e.target.closest('[data-copy]');
        if (!btn) return;

        e.preventDefault();

        var text = btn.getAttribute('data-copy');
        var ok = await copy(text);

        if (ok) {
            btn.classList.add('copied');
            setTimeout(function() { btn.classList.remove('copied'); }, 1500);
            showToast('Copied to clipboard');
        } else {
            showToast('Copy failed — long-press to copy manually');
        }
    });
}
