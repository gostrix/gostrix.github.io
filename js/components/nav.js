export function backButton(text, hash) {
    return `<button class="nav-back" onclick="location.hash='${hash}'">
        <svg viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        ${text}
    </button>`;
}
