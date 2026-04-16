/*
 * landing/js/gif-tilt.js
 *
 * Scroll-scrubbed 3D tilt for the hero-to-story bridge image.
 * As the bridge frame enters the viewport from below, we interpolate
 * rotateX from about -22deg (lying flat "on a table" behind the
 * hero) toward 0deg (upright, fully facing the viewer). Driven by
 * the frame's own getBoundingClientRect() so it never drifts out of
 * sync with the scroll position.
 */

var START_ANGLE = -22;   // degrees when bridge first appears from below
var END_ANGLE   = 0;     // degrees when bridge is centered in viewport
var START_Z     = -40;   // px on Z — feeds the parallax depth
var END_Z       = 0;

function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
}

function tick(frame) {
    var rect = frame.getBoundingClientRect();
    var vh = window.innerHeight;

    // Progress: 0 when the frame's top sits at vh (just entering),
    // 1 when its center crosses the viewport center.
    var frameCenter = rect.top + rect.height / 2;
    var viewportCenter = vh / 2;

    // Distance from entering-below (rect.top = vh) to centered
    // (frameCenter = viewportCenter).
    var enterFrom = vh;
    var enterTo = viewportCenter;
    var delta = enterFrom - enterTo;

    var pos = enterFrom - frameCenter;
    var progress = clamp(pos / delta, 0, 1);

    var angle = START_ANGLE + (END_ANGLE - START_ANGLE) * progress;
    var z = START_Z + (END_Z - START_Z) * progress;

    frame.style.transform =
        'rotateX(' + angle.toFixed(2) + 'deg) translateZ(' + z.toFixed(0) + 'px)';
}

export function initGifTilt() {
    var frame = document.querySelector('.gif-bridge-frame');
    if (!frame) return;

    var ticking = false;

    function onScroll() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                tick(frame);
                ticking = false;
            });
            ticking = true;
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    tick(frame);
}
