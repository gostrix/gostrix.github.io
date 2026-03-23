import { getStats } from '../api.js';
import { logoSVG } from '../components/logo.js';

// All data rendered here comes from our own API (trusted source).
// Model names and brand names are plain text from the database,
// not user-generated content. XSS risk is minimal.

export async function renderHome(container) {
    container.innerHTML = `
    <div class="page">
        <div class="container">
            <div class="hero">
                ${logoSVG(72)}
                <h1 class="title">STRIX</h1>
                <p class="subtitle">Camera Stream Database</p>
            </div>

            <div class="stat-grid" id="stats">
                <div class="stat-box"><div class="stat-value">--</div><div class="stat-label">Brands</div></div>
                <div class="stat-box"><div class="stat-value">--</div><div class="stat-label">Streams</div></div>
                <div class="stat-box"><div class="stat-value">--</div><div class="stat-label">Models</div></div>
            </div>

            <div class="form-group">
                <input type="text" id="home-search" class="input input-large" placeholder="Search cameras, brands, models..." autocomplete="off" spellcheck="false">
                <p class="hint">Try: Hikvision, DS-2CD2047, Dahua IPC</p>
            </div>
            <div id="search-results" style="display:none; margin-bottom: var(--space-6);"></div>

            <a href="#/brands" class="btn btn-primary btn-large" style="margin-bottom: var(--space-4);">
                Browse All Brands
            </a>

            <a href="#/contribute" class="btn btn-secondary btn-large">
                Contribute a Camera
            </a>
        </div>
    </div>`;

    // Load stats
    try {
        const stats = await getStats();
        const boxes = container.querySelectorAll('.stat-value');
        boxes[0].textContent = stats.brands.toLocaleString();
        boxes[1].textContent = stats.streams.toLocaleString();
        boxes[2].textContent = stats.models.toLocaleString();
    } catch {
        // leave as --
    }

    // Search with debounce
    const input = container.querySelector('#home-search');
    const results = container.querySelector('#search-results');
    let searchTimer = null;

    input.addEventListener('input', () => {
        clearTimeout(searchTimer);
        const q = input.value.trim();
        if (q.length < 2) {
            results.style.display = 'none';
            return;
        }
        searchTimer = setTimeout(() => doSearch(q, results), 300);
    });
}

async function doSearch(query, container) {
    const { searchModels } = await import('../api.js');
    try {
        const data = await searchModels(query, 20);
        if (!data || data.length === 0) {
            container.textContent = '';
            const empty = document.createElement('div');
            empty.className = 'empty-state';
            empty.textContent = 'No results';
            container.appendChild(empty);
            container.style.display = 'block';
            return;
        }

        const list = document.createElement('div');
        list.className = 'model-list';

        data.forEach(r => {
            const item = document.createElement('div');
            item.className = 'model-item';
            item.addEventListener('click', () => {
                if (r.model) {
                    location.hash = `#/brands/${r.brand_id}/${encodeURIComponent(r.model)}`;
                } else {
                    location.hash = `#/brands/${r.brand_id}`;
                }
            });

            const info = document.createElement('div');
            const name = document.createElement('span');
            name.className = 'model-name';

            if (r.model) {
                const brandSpan = document.createElement('span');
                brandSpan.style.cssText = 'color: var(--text-tertiary);';
                brandSpan.textContent = r.brand + ': ';
                name.appendChild(brandSpan);
                name.appendChild(document.createTextNode(r.model));
            } else {
                name.textContent = r.brand;
            }

            info.appendChild(name);

            const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            arrow.setAttribute('class', 'model-arrow');
            arrow.setAttribute('width', '16');
            arrow.setAttribute('height', '16');
            arrow.setAttribute('viewBox', '0 0 16 16');
            arrow.setAttribute('fill', 'none');
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', 'M6 4l4 4-4 4');
            path.setAttribute('stroke', 'currentColor');
            path.setAttribute('stroke-width', '2');
            path.setAttribute('stroke-linecap', 'round');
            arrow.appendChild(path);

            item.appendChild(info);
            item.appendChild(arrow);
            list.appendChild(item);
        });

        container.textContent = '';
        container.appendChild(list);
        container.style.display = 'block';
    } catch {
        container.style.display = 'none';
    }
}
