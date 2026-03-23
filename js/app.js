import { renderHome } from './pages/home.js';
import { renderBrands } from './pages/brands.js';
import { renderModels } from './pages/models.js';
import { renderStreams } from './pages/streams.js';
import { renderContribute } from './pages/contribute.js';

const app = document.getElementById('app');

async function route() {
    const hash = location.hash || '#/';
    const parts = hash.replace('#/', '').split('/').map(decodeURIComponent);

    // #/
    if (!parts[0] || parts[0] === '') {
        await renderHome(app);
    }
    // #/brands
    else if (parts[0] === 'brands' && !parts[1]) {
        await renderBrands(app);
    }
    // #/brands/{brand_id}
    else if (parts[0] === 'brands' && parts[1] && !parts[2]) {
        await renderModels(app, parts[1]);
    }
    // #/brands/{brand_id}/{model}
    else if (parts[0] === 'brands' && parts[1] && parts[2]) {
        await renderStreams(app, parts[1], parts[2]);
    }
    // #/contribute
    else if (parts[0].startsWith('contribute')) {
        await renderContribute(app);
    }
    // fallback
    else {
        await renderHome(app);
    }

    // scroll to top on navigation
    window.scrollTo(0, 0);
}

window.addEventListener('hashchange', route);
route();
