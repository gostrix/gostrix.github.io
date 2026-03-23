import { getModels } from '../api.js';
import { backButton } from '../components/nav.js';

// Only innerHTML usage is backButton() which outputs static trusted SVG.
// All dynamic model data is rendered with safe DOM methods.

export async function renderModels(container, brandId) {
    const page = document.createElement('div');
    page.className = 'page';
    const cont = document.createElement('div');
    cont.className = 'container';

    const navEl = document.createElement('div');
    navEl.innerHTML = backButton('All Brands', '#/brands');
    cont.appendChild(navEl);

    const header = document.createElement('div');
    header.className = 'page-header';
    const h1 = document.createElement('h1');
    h1.className = 'page-title';
    h1.textContent = brandId.toUpperCase();
    const sub = document.createElement('p');
    sub.className = 'page-subtitle';
    sub.textContent = 'Loading models...';
    header.appendChild(h1);
    header.appendChild(sub);
    cont.appendChild(header);

    const formGroup = document.createElement('div');
    formGroup.className = 'form-group';
    const filterInput = document.createElement('input');
    filterInput.type = 'text';
    filterInput.className = 'input';
    filterInput.placeholder = 'Filter models...';
    filterInput.autocomplete = 'off';
    filterInput.spellcheck = false;
    formGroup.appendChild(filterInput);
    cont.appendChild(formGroup);

    const modelsList = document.createElement('div');
    modelsList.className = 'loading';
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    modelsList.appendChild(spinner);
    modelsList.appendChild(document.createTextNode('Loading models...'));
    cont.appendChild(modelsList);

    page.appendChild(cont);
    container.textContent = '';
    container.appendChild(page);

    try {
        const models = await getModels(brandId);
        sub.textContent = `${models.length} models`;
        renderModelList(modelsList, brandId, models);

        filterInput.addEventListener('input', () => {
            const q = filterInput.value.trim().toLowerCase();
            const filtered = q ? models.filter(m =>
                m.model.toLowerCase().includes(q)
            ) : models;
            renderModelList(modelsList, brandId, filtered);
        });
    } catch {
        modelsList.textContent = 'Brand not found';
        modelsList.className = 'empty-state';
    }
}

function renderModelList(listEl, brandId, models) {
    listEl.textContent = '';
    listEl.className = 'model-list';

    if (models.length === 0) {
        listEl.className = 'empty-state';
        listEl.textContent = 'No models found';
        return;
    }

    models.forEach(m => {
        const item = document.createElement('div');
        item.className = 'model-item';
        item.addEventListener('click', () => {
            location.hash = `#/brands/${brandId}/${encodeURIComponent(m.model)}`;
        });

        const name = document.createElement('span');
        name.className = 'model-name';
        name.textContent = m.model;

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

        item.appendChild(name);
        item.appendChild(arrow);
        listEl.appendChild(item);
    });
}
