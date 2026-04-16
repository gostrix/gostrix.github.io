/*
 * landing/js/bg-scroll.js
 *
 * Scroll-driven interpolation of the blob palette. As the user
 * scrolls down the page, progress moves from 0 to 1 across the full
 * document. We interpolate between N "zone" palettes so the fixed
 * background layer slowly shifts through a spectrum without ever
 * leaving the purple family.
 *
 * The mesh base (bg-base) additionally rotates its hue in CSS via
 * filter: hue-rotate() tied to the same --scroll-progress variable.
 */

// Per-zone palettes. Each zone contributes 4 [r,g,b] colors — one
// per blob. Zones are interpolated pairwise as scroll progress
// crosses them.
var PALETTES = {
    violet: [
        [139, 92, 246],   // main
        [99, 102, 241],   // indigo
        [167, 139, 250],  // light
        [192, 132, 252],  // pink-violet
    ],
    indigo: [
        [99, 102, 241],
        [79, 70, 229],
        [129, 140, 248],
        [139, 92, 246],
    ],
    magenta: [
        [192, 132, 252],
        [217, 70, 239],
        [236, 72, 153],
        [139, 92, 246],
    ],
    deep: [
        [124, 58, 237],
        [79, 70, 229],
        [139, 92, 246],
        [109, 40, 217],
    ],
};

// Zone sequence across the page. Seven stops chosen so each story
// scene and the install section each land on its own shade. The
// closing entry is "violet" again so the page arc comes home.
var ZONE_ORDER = ['violet', 'violet', 'indigo', 'magenta', 'magenta', 'deep', 'violet'];

function lerp(a, b, t) {
    return Math.round(a + (b - a) * t);
}

function lerpColor(a, b, t) {
    return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

// Compute the interpolated 4-color palette at a given 0..1 progress.
function paletteAt(progress) {
    var p = Math.max(0, Math.min(1, progress));
    var scaled = p * (ZONE_ORDER.length - 1);
    var idx = Math.floor(scaled);
    var frac = scaled - idx;

    var current = PALETTES[ZONE_ORDER[idx]];
    var next = PALETTES[ZONE_ORDER[Math.min(idx + 1, ZONE_ORDER.length - 1)]];

    return [
        lerpColor(current[0], next[0], frac),
        lerpColor(current[1], next[1], frac),
        lerpColor(current[2], next[2], frac),
        lerpColor(current[3], next[3], frac),
    ];
}

var ticking = false;

function paintBackground() {
    var scrollY = window.scrollY || window.pageYOffset;
    var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    var progress = maxScroll > 0 ? scrollY / maxScroll : 0;

    var palette = paletteAt(progress);
    var root = document.documentElement;

    root.style.setProperty('--scroll-progress', progress.toFixed(3));
    for (var i = 0; i < 4; i++) {
        var rgb = palette[i];
        root.style.setProperty('--blob-' + (i + 1) + '-r', rgb[0]);
        root.style.setProperty('--blob-' + (i + 1) + '-g', rgb[1]);
        root.style.setProperty('--blob-' + (i + 1) + '-b', rgb[2]);
    }

    ticking = false;
}

function onScroll() {
    if (!ticking) {
        window.requestAnimationFrame(paintBackground);
        ticking = true;
    }
}

export function initBgScroll() {
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', paintBackground);
    paintBackground();
}
