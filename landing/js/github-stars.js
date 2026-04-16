/*
 * landing/js/github-stars.js
 *
 * Fetches the live star count of eduard256/Strix from the public
 * GitHub REST API and drops it into the topbar badge. Degrades
 * gracefully: the badge renders with a placeholder "—" first; if
 * the network call fails (rate-limit / offline), the placeholder
 * stays and nothing breaks.
 */

var REPO = 'eduard256/Strix';
var CACHE_KEY = 'strix:github:stars';
var CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

function format(n) {
    if (typeof n !== 'number' || isNaN(n)) return null;
    if (n >= 1000) {
        var k = n / 1000;
        // 1.2k for 1000..9999, 12k for 10000+
        return (k >= 10 ? k.toFixed(0) : k.toFixed(1).replace(/\.0$/, '')) + 'k';
    }
    return String(n);
}

function readCache() {
    try {
        var raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        var obj = JSON.parse(raw);
        if (Date.now() - obj.ts > CACHE_TTL_MS) return null;
        return obj.count;
    } catch (e) { return null; }
}

function writeCache(count) {
    try {
        localStorage.setItem(CACHE_KEY,
            JSON.stringify({ count: count, ts: Date.now() }));
    } catch (e) {}
}

export async function initStars() {
    var slot = document.querySelector('.topbar-star-count');
    if (!slot) return;

    // Seed with cached value immediately if available so the badge
    // doesn't flash "—" on every reload.
    var cached = readCache();
    if (cached !== null) {
        slot.textContent = format(cached);
    }

    try {
        var r = await fetch('https://api.github.com/repos/' + REPO, {
            headers: { 'Accept': 'application/vnd.github+json' }
        });
        if (!r.ok) return;
        var data = await r.json();
        if (typeof data.stargazers_count === 'number') {
            writeCache(data.stargazers_count);
            slot.textContent = format(data.stargazers_count);
        }
    } catch (e) {
        // Network error — keep whatever is there.
    }
}
