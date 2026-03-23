import { showToast } from './toast.js';

export function copyButton(text, id) {
    return `<button class="btn-copy" data-copy="${id}" data-text="${escapeAttr(text)}" title="Copy to clipboard">
        <svg viewBox="0 0 16 16" fill="none">
            <rect x="5" y="5" width="9" height="9" rx="1" stroke="currentColor" stroke-width="1.5"/>
            <path d="M3 11V3h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
    </button>`;
}

function escapeAttr(s) {
    return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function initCopyButtons(container) {
    container.querySelectorAll('.btn-copy').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const text = btn.dataset.text;
            try {
                await navigator.clipboard.writeText(text);
                btn.classList.add('copied');
                showToast('Copied to clipboard');
                setTimeout(() => btn.classList.remove('copied'), 1500);
            } catch {
                showToast('Failed to copy');
            }
        });
    });
}
