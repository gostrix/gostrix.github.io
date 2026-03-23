import { getStreams } from '../api.js';
import { backButton } from '../components/nav.js';
import { buildStreamURL } from '../url-builder.js';
import { initCopyButtons, copyButton } from '../components/copy-button.js';

// innerHTML usage: static SVG icons and backButton (hardcoded trusted strings only).
// All dynamic data (URLs, model names, notes, credentials) uses textContent or escapeAttr.

export async function renderStreams(container, brandId, model) {
    const page = document.createElement('div');
    page.className = 'page';
    const cont = document.createElement('div');
    cont.className = 'container';

    const navEl = document.createElement('div');
    navEl.innerHTML = backButton(brandId.toUpperCase(), `#/brands/${brandId}`);
    cont.appendChild(navEl);

    const header = document.createElement('div');
    header.className = 'page-header';
    const h1 = document.createElement('h1');
    h1.className = 'page-title';
    h1.textContent = brandId.toUpperCase();
    const sub = document.createElement('p');
    sub.className = 'page-subtitle';
    sub.textContent = decodeURIComponent(model);
    header.appendChild(h1);
    header.appendChild(sub);
    cont.appendChild(header);

    // Credentials bar (static structure, safe)
    const creds = document.createElement('div');
    creds.className = 'credentials-bar';
    creds.innerHTML = `
        <div class="form-row">
            <div>
                <label class="label">IP Address</label>
                <input type="text" id="cred-ip" class="input" placeholder="192.168.1.100" autocomplete="off" spellcheck="false">
            </div>
            <div>
                <label class="label">Username</label>
                <input type="text" id="cred-user" class="input" placeholder="admin" autocomplete="off">
            </div>
            <div>
                <label class="label">Password</label>
                <input type="password" id="cred-pass" class="input" placeholder="password" autocomplete="off">
            </div>
            <div>
                <label class="label">Channel</label>
                <input type="number" id="cred-channel" class="input" value="0" min="0" max="255">
            </div>
        </div>
        <div class="privacy-note">
            <svg viewBox="0 0 16 16" fill="none">
                <path d="M8 1a4 4 0 00-4 4v2H3a1 1 0 00-1 1v6a1 1 0 001 1h10a1 1 0 001-1V8a1 1 0 00-1-1h-1V5a4 4 0 00-4-4zm-2 4a2 2 0 114 0v2H6V5z" fill="currentColor"/>
            </svg>
            Credentials stay in your browser. Nothing is sent to our servers.
        </div>`;
    cont.appendChild(creds);

    const streamList = document.createElement('div');
    streamList.className = 'loading';
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    streamList.appendChild(spinner);
    streamList.appendChild(document.createTextNode('Loading streams...'));
    cont.appendChild(streamList);

    const contributeEl = document.createElement('div');
    contributeEl.style.cssText = 'text-align: center; margin-top: var(--space-6);';
    const contributeLink = document.createElement('a');
    contributeLink.href = `#/contribute?brand=${encodeURIComponent(brandId)}&model=${encodeURIComponent(model)}`;
    contributeLink.className = 'btn btn-outline';
    contributeLink.textContent = '+ Contribute a stream URL';
    contributeEl.appendChild(contributeLink);
    cont.appendChild(contributeEl);

    page.appendChild(cont);
    container.textContent = '';
    container.appendChild(page);

    let streams = [];
    try {
        streams = await getStreams(brandId, model);
        renderStreamList(streamList, streams, getCredentials());
    } catch {
        streamList.textContent = 'No streams found';
        streamList.className = 'empty-state';
        return;
    }

    const inputs = cont.querySelectorAll('#cred-ip, #cred-user, #cred-pass, #cred-channel');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            renderStreamList(streamList, streams, getCredentials());
        });
    });
}

function getCredentials() {
    return {
        ip: (document.getElementById('cred-ip') || {}).value || '',
        username: (document.getElementById('cred-user') || {}).value || '',
        password: (document.getElementById('cred-pass') || {}).value || '',
        channel: parseInt((document.getElementById('cred-channel') || {}).value || '0', 10),
    };
}

function renderStreamList(listEl, streams, credentials) {
    listEl.textContent = '';
    listEl.className = 'stream-list';

    if (streams.length === 0) {
        listEl.className = 'empty-state';
        listEl.textContent = 'No streams found';
        return;
    }

    streams.forEach((stream, index) => {
        const builtUrl = credentials.ip ? buildStreamURL(stream, credentials) : null;

        const item = document.createElement('div');
        item.className = 'stream-item';

        // Header row
        const headerEl = document.createElement('div');
        headerEl.className = 'stream-item-header';

        const main = document.createElement('div');
        main.className = 'stream-item-main';

        const infoLeft = document.createElement('div');
        infoLeft.className = 'stream-info-left';

        // Protocol badge (static SVG)
        const badge = document.createElement('div');
        badge.className = 'stream-type-badge';
        badge.innerHTML = getProtocolIcon(stream.protocol);
        const badgeText = document.createElement('span');
        badgeText.textContent = stream.protocol;
        badge.appendChild(badgeText);
        infoLeft.appendChild(badge);

        if (stream.port > 0) {
            const port = document.createElement('span');
            port.className = 'stream-port-badge';
            port.textContent = `:${stream.port}`;
            infoLeft.appendChild(port);
        }

        const urlPreview = document.createElement('div');
        urlPreview.className = 'stream-url-preview';
        urlPreview.textContent = truncate(stream.url, 55);
        infoLeft.appendChild(urlPreview);

        main.appendChild(infoLeft);

        // Chevron toggle (static SVG)
        const toggle = document.createElement('button');
        toggle.className = 'stream-toggle';
        toggle.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="chevron"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
        main.appendChild(toggle);

        headerEl.appendChild(main);

        // Copy button for URL
        const actions = document.createElement('div');
        actions.className = 'stream-actions';
        const copyEl = document.createElement('div');
        copyEl.innerHTML = copyButton(builtUrl || stream.url, `s-${index}`);
        actions.appendChild(copyEl.firstElementChild);
        headerEl.appendChild(actions);

        item.appendChild(headerEl);

        // Expandable details
        const details = document.createElement('div');
        details.className = 'stream-item-details';
        const detailsContent = document.createElement('div');
        detailsContent.className = 'stream-details-content';

        const urlFull = document.createElement('div');
        urlFull.className = 'stream-url-full';
        urlFull.textContent = stream.url;
        detailsContent.appendChild(urlFull);

        if (builtUrl) {
            const built = document.createElement('div');
            built.className = 'stream-url-built';
            const urlText = document.createElement('span');
            urlText.className = 'url-text';
            urlText.textContent = builtUrl;
            built.appendChild(urlText);
            const builtCopyEl = document.createElement('div');
            builtCopyEl.innerHTML = copyButton(builtUrl, `b-${index}`);
            built.appendChild(builtCopyEl.firstElementChild);
            detailsContent.appendChild(built);
        }

        if (stream.notes) {
            const notes = document.createElement('div');
            notes.className = 'stream-notes';
            notes.textContent = stream.notes;
            detailsContent.appendChild(notes);
        }

        details.appendChild(detailsContent);
        item.appendChild(details);

        headerEl.addEventListener('click', (e) => {
            if (e.target.closest('.btn-copy')) return;
            item.classList.toggle('expanded');
        });

        listEl.appendChild(item);
    });

    initCopyButtons(listEl);
}

function getProtocolIcon(protocol) {
    const icons = {
        rtsp: '<svg width="14" height="14" viewBox="0 0 20 20" fill="none"><rect x="3" y="4" width="14" height="12" rx="1" stroke="currentColor" stroke-width="1.5"/><path d="M14 14l-3-2-3 2V8l3 2 3-2v6z" fill="currentColor"/></svg>',
        rtsps: '<svg width="14" height="14" viewBox="0 0 20 20" fill="none"><rect x="3" y="4" width="14" height="12" rx="1" stroke="currentColor" stroke-width="1.5"/><path d="M14 14l-3-2-3 2V8l3 2 3-2v6z" fill="currentColor"/></svg>',
        http: '<svg width="14" height="14" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5"/><path d="M10 2a15 15 0 010 16M10 2a15 15 0 000 16M2 10h16" stroke="currentColor" stroke-width="1.5"/></svg>',
        https: '<svg width="14" height="14" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5"/><path d="M10 2a15 15 0 010 16M10 2a15 15 0 000 16M2 10h16" stroke="currentColor" stroke-width="1.5"/></svg>',
        bubble: '<svg width="14" height="14" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.5"/><circle cx="7" cy="9" r="1.5" fill="currentColor"/><circle cx="10" cy="9" r="1.5" fill="currentColor"/><circle cx="13" cy="9" r="1.5" fill="currentColor"/></svg>',
        rtmp: '<svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M7 6l6 4-6 4V6z" fill="currentColor"/><circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5"/></svg>',
    };
    return icons[protocol] || icons.http;
}

function truncate(s, max) {
    return s.length > max ? s.substring(0, max) + '...' : s;
}
