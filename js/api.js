const API_BASE = 'https://apistrix.webaweba.com';

async function fetchJSON(path) {
    const res = await fetch(API_BASE + path);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
}

export async function getBrands() {
    return fetchJSON('/api/brands');
}

export async function getModels(brandId) {
    return fetchJSON(`/api/brands/${encodeURIComponent(brandId)}`);
}

export async function getStreams(brandId, model) {
    return fetchJSON(`/api/brands/${encodeURIComponent(brandId)}/${encodeURIComponent(model)}`);
}

export async function searchModels(query, limit = 50) {
    return fetchJSON(`/api/search?q=${encodeURIComponent(query)}&limit=${limit}`);
}

export async function getStats() {
    return fetchJSON('/api/stats');
}

export async function submitContribution(data) {
    const res = await fetch(API_BASE + '/api/contribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return res.json();
}
