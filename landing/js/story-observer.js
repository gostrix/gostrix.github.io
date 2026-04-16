/*
 * landing/js/story-observer.js
 *
 * IntersectionObserver-based reveal for every section that has a
 * .scene-halo child or is otherwise meant to animate on entry.
 * We add .in-view when the section crosses a sensible threshold
 * and remove it only when the section leaves the viewport by more
 * than the de-hysteresis buffer — prevents flicker on scroll-up.
 */

export function initStoryObserver() {
    // Any top-level section marked with these selectors can animate
    // in on visibility.
    var targets = document.querySelectorAll(
        '.scene, .manifesto, .contribute, .install, .mid-cta'
    );

    if (!('IntersectionObserver' in window)) {
        // Fallback — just reveal everything statically.
        targets.forEach(function(el) { el.classList.add('in-view'); });
        return;
    }

    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            } else if (entry.intersectionRatio < 0.05) {
                // Scrolled well past — let it reset so revisiting the
                // section re-plays the reveal (user specifically asked
                // for this behaviour).
                entry.target.classList.remove('in-view');
            }
        });
    }, {
        threshold: [0, 0.05, 0.25],
        rootMargin: '0px 0px -10% 0px',
    });

    targets.forEach(function(el) { observer.observe(el); });
}
