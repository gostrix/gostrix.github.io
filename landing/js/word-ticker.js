/*
 * landing/js/word-ticker.js
 *
 * Slot-machine word ticker in the hero. Auto-only — cycles through
 * a list of interchangeable nouns every AUTO_INTERVAL_MS. User
 * interaction (drag, wheel, keyboard) is intentionally not wired
 * up: the ticker is a display element, not a control, and mustn't
 * hijack scroll or focus.
 *
 * Rendering — the cylinder is a list of spans stacked vertically.
 * Translating it by -line_height * index brings the Nth word into
 * the active (centered) slot. The list is padded with duplicates at
 * both ends so when the index wraps we can jump back invisibly
 * without a visible snap.
 */

var WORDS = [
    'cameras.',
    'network.',
    'streams.',
    'rules.',
    'stack.',
    'hardware.',
    'privacy.',
    'data.',
    'footage.',
    'home.',
];

var AUTO_INTERVAL_MS = 1500;   // time between automatic advances
var SNAP_MS          = 500;    // matches the transition in hero.css

var BUFFER = 3; // duplicate N items at each end for seamless wrap

function createCylinder(host) {
    // Build a padded list: [last-3, last-2, last-1, ...WORDS, 0, 1, 2]
    // The real range starts at index BUFFER and has length WORDS.length.
    var padded = [];
    for (var i = 0; i < BUFFER; i++) {
        padded.push(WORDS[(WORDS.length - BUFFER + i + WORDS.length) % WORDS.length]);
    }
    for (var j = 0; j < WORDS.length; j++) padded.push(WORDS[j]);
    for (var k = 0; k < BUFFER; k++) padded.push(WORDS[k % WORDS.length]);

    host.textContent = '';
    padded.forEach(function(w) {
        var el = document.createElement('span');
        el.className = 'ticker-word';
        el.textContent = w;
        host.appendChild(el);
    });

    return {
        items: Array.from(host.children),
        realStart: BUFFER,
        realEnd: BUFFER + WORDS.length,
    };
}

function getLineHeight(ticker) {
    var computed = getComputedStyle(ticker);
    var lh = parseFloat(computed.getPropertyValue('--line-h')) || null;
    if (lh && !isNaN(lh)) return lh;
    var word = ticker.querySelector('.ticker-word');
    return word ? word.offsetHeight : 64;
}

export function initWordTicker() {
    var cylinder = document.getElementById('hero-ticker');
    if (!cylinder) return;
    var ticker = cylinder.closest('.ticker');

    var built = createCylinder(cylinder);
    var items = built.items;
    var realStart = built.realStart;
    var realEnd = built.realEnd;
    var total = WORDS.length;

    var virtualIdx = realStart;
    var lineH = getLineHeight(ticker);

    // The cylinder's CSS baseline already applies translateY(-lineH)
    // so the middle row of the three-row viewport is the active
    // slot. We override the transform here to set the absolute
    // position — adding back that -lineH so the math lines up.
    function setCylinderTransform(animated) {
        var y = -(virtualIdx * lineH) + lineH;
        cylinder.style.transition = animated ? '' : 'none';
        cylinder.style.transform = 'translateY(' + y + 'px)';
    }

    function updateActiveClass() {
        items.forEach(function(el) { el.classList.remove('active'); });
        var realIndex = ((virtualIdx - realStart) % total + total) % total;
        var centerDomIdx = realStart + realIndex;
        if (items[centerDomIdx]) items[centerDomIdx].classList.add('active');
    }

    // When the virtual index has drifted into the padding clones we
    // silently jump back to the equivalent position in the real
    // range. Called after each animated transition finishes.
    function normalizeIndex() {
        if (virtualIdx < realStart || virtualIdx >= realEnd) {
            var realRelative = ((virtualIdx - realStart) % total + total) % total;
            virtualIdx = realStart + realRelative;
            setCylinderTransform(false);
            // Force reflow so the next animated transform actually animates.
            void cylinder.offsetHeight;
        }
    }

    function advance(delta) {
        virtualIdx += delta;
        setCylinderTransform(true);
        updateActiveClass();
        setTimeout(normalizeIndex, SNAP_MS + 20);
    }

    // ─── Auto-cycle ──────────────────────────────────────────────
    var autoTimer = null;
    function startAuto() {
        if (autoTimer) return;
        autoTimer = setInterval(function() { advance(1); }, AUTO_INTERVAL_MS);
    }

    // Keep lineH current through viewport resizes.
    window.addEventListener('resize', function() {
        lineH = getLineHeight(ticker);
        setCylinderTransform(false);
    });

    // Respect the user's motion preferences — freeze on "cameras."
    var reducedMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    setCylinderTransform(false);
    updateActiveClass();
    if (!reducedMotion) {
        // Small delay so the hero entrance animation finishes before
        // the ticker starts moving — otherwise the two animations
        // collide visually.
        setTimeout(startAuto, 1200);
    }
}
