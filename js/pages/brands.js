import { getBrands } from '../api.js';
import { backButton } from '../components/nav.js';

// Static page shell uses innerHTML with hardcoded strings only.
// Dynamic brand data is rendered with safe DOM methods (createElement + textContent).

export async function renderBrands(container) {
    // Build page shell with safe static content
    const page = document.createElement('div');
    page.className = 'page';
    const cont = document.createElement('div');
    cont.className = 'container';
    cont.innerHTML = backButton('Home', '#/');

    const header = document.createElement('div');
    header.className = 'page-header';
    const h1 = document.createElement('h1');
    h1.className = 'page-title';
    h1.textContent = 'All Brands';
    const sub = document.createElement('p');
    sub.className = 'page-subtitle';
    sub.id = 'brands-count';
    sub.textContent = 'Loading...';
    header.appendChild(h1);
    header.appendChild(sub);
    cont.appendChild(header);

    const formGroup = document.createElement('div');
    formGroup.className = 'form-group';
    const filterInput = document.createElement('input');
    filterInput.type = 'text';
    filterInput.id = 'brand-filter';
    filterInput.className = 'input';
    filterInput.placeholder = 'Filter brands...';
    filterInput.autocomplete = 'off';
    filterInput.spellcheck = false;
    formGroup.appendChild(filterInput);
    cont.appendChild(formGroup);

    const alphabetBar = document.createElement('div');
    alphabetBar.id = 'alphabet-bar';
    cont.appendChild(alphabetBar);

    const brandsList = document.createElement('div');
    brandsList.id = 'brands-list';
    brandsList.className = 'loading';
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    brandsList.appendChild(spinner);
    brandsList.appendChild(document.createTextNode('Loading brands...'));
    cont.appendChild(brandsList);

    page.appendChild(cont);
    container.textContent = '';
    container.appendChild(page);

    try {
        const brands = await getBrands();
        sub.textContent = `${brands.length} brands`;
        renderBrandList(alphabetBar, brandsList, brands);

        filterInput.addEventListener('input', () => {
            const q = filterInput.value.trim().toLowerCase();
            const filtered = q ? brands.filter(b =>
                b.brand.toLowerCase().includes(q) || b.brand_id.includes(q)
            ) : brands;
            renderBrandList(alphabetBar, brandsList, filtered);
        });
    } catch {
        brandsList.textContent = 'Failed to load brands';
    }
}

function renderBrandList(barEl, listEl, brands) {
    const groups = {};
    brands.forEach(b => {
        const letter = b.brand[0].toUpperCase();
        const key = /[A-Z]/.test(letter) ? letter : '#';
        if (!groups[key]) groups[key] = [];
        groups[key].push(b);
    });

    const sortedKeys = Object.keys(groups).sort((a, b) => {
        if (a === '#') return -1;
        if (b === '#') return 1;
        return a.localeCompare(b);
    });

    // Alphabet bar
    barEl.className = 'alphabet-bar';
    barEl.textContent = '';
    '#ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(letter => {
        const btn = document.createElement('button');
        btn.className = 'alphabet-letter';
        btn.textContent = letter;
        if (groups[letter]) {
            btn.classList.add('active');
            btn.addEventListener('click', () => {
                const target = listEl.querySelector(`[data-letter="${letter}"]`);
                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        } else {
            btn.classList.add('disabled');
        }
        barEl.appendChild(btn);
    });

    // Brand grid
    listEl.textContent = '';
    listEl.className = '';

    sortedKeys.forEach(letter => {
        const group = document.createElement('div');
        group.className = 'letter-group';
        group.setAttribute('data-letter', letter);

        const title = document.createElement('div');
        title.className = 'letter-group-title';
        title.textContent = letter;
        group.appendChild(title);

        const grid = document.createElement('div');
        grid.className = 'brand-grid';

        groups[letter].forEach(b => {
            const card = document.createElement('div');
            card.className = 'card card-clickable';
            card.addEventListener('click', () => {
                location.hash = `#/brands/${b.brand_id}`;
            });

            const name = document.createElement('div');
            name.style.cssText = 'font-weight: 600; font-size: var(--text-sm);';
            name.textContent = b.brand;
            card.appendChild(name);

            grid.appendChild(card);
        });

        group.appendChild(grid);
        listEl.appendChild(group);
    });
}
