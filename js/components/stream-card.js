import { copyButton } from './copy-button.js';

const PROTOCOL_ICONS = {
    rtsp: '<svg width="14" height="14" viewBox="0 0 20 20" fill="none"><rect x="3" y="4" width="14" height="12" rx="1" stroke="currentColor" stroke-width="1.5"/><path d="M14 14l-3-2-3 2V8l3 2 3-2v6z" fill="currentColor"/></svg>',
    rtsps: '<svg width="14" height="14" viewBox="0 0 20 20" fill="none"><rect x="3" y="4" width="14" height="12" rx="1" stroke="currentColor" stroke-width="1.5"/><path d="M14 14l-3-2-3 2V8l3 2 3-2v6z" fill="currentColor"/><circle cx="16" cy="6" r="3" fill="#10b981" stroke="currentColor" stroke-width="1"/></svg>',
    http: '<svg width="14" height="14" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5"/><path d="M10 2a15 15 0 010 16M10 2a15 15 0 000 16M2 10h16" stroke="currentColor" stroke-width="1.5"/></svg>',
    https: '<svg width="14" height="14" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5"/><path d="M10 2a15 15 0 010 16M10 2a15 15 0 000 16M2 10h16" stroke="currentColor" stroke-width="1.5"/><circle cx="16" cy="6" r="3" fill="#10b981" stroke="currentColor" stroke-width="1"/></svg>',
    bubble: '<svg width="14" height="14" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.5"/><circle cx="7" cy="9" r="1.5" fill="currentColor"/><circle cx="10" cy="9" r="1.5" fill="currentColor"/><circle cx="13" cy="9" r="1.5" fill="currentColor"/></svg>',
    rtmp: '<svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M7 6l6 4-6 4V6z" fill="currentColor"/><circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5"/></svg>',
    mms: '<svg width="14" height="14" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5"/><path d="M6 10h8M10 6v8" stroke="currentColor" stroke-width="1.5"/></svg>',
};

function getIcon(protocol) {
    return PROTOCOL_ICONS[protocol] || PROTOCOL_ICONS.http;
}

function truncateURL(url, max = 55) {
    return url.length > max ? url.substring(0, max) + '...' : url;
}

export function streamCard(stream, index, builtUrl) {
    const portStr = stream.port > 0 ? `:${stream.port}` : '';

    return `
    <div class="stream-item" data-index="${index}">
        <div class="stream-item-header" data-index="${index}">
            <div class="stream-item-main">
                <div class="stream-info-left">
                    <div class="stream-type-badge">
                        ${getIcon(stream.protocol)}
                        <span>${stream.protocol}</span>
                    </div>
                    ${portStr ? `<span class="stream-port-badge">${portStr}</span>` : ''}
                    <div class="stream-url-preview">${truncateURL(stream.url)}</div>
                </div>
                <button class="stream-toggle" data-index="${index}" aria-label="Toggle details">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="chevron">
                        <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </button>
            </div>
            <div class="stream-actions">
                ${copyButton(builtUrl || stream.url, index)}
            </div>
        </div>
        <div class="stream-item-details">
            <div class="stream-details-content">
                <div class="stream-url-full">${stream.url}</div>
                ${builtUrl ? `
                <div class="stream-url-built">
                    <span class="url-text">${builtUrl}</span>
                    ${copyButton(builtUrl, index + '-built')}
                </div>` : ''}
                ${stream.notes ? `<div class="stream-notes">${stream.notes}</div>` : ''}
            </div>
        </div>
    </div>`;
}

export function initStreamCards(container) {
    container.querySelectorAll('.stream-item-header').forEach(header => {
        header.addEventListener('click', (e) => {
            if (e.target.closest('.btn-copy')) return;
            const item = header.closest('.stream-item');
            item.classList.toggle('expanded');
        });
    });
}
