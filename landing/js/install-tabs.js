/*
 * landing/js/install-tabs.js
 *
 * Dual-mode install section.
 *
 *   Desktop ( >= 768px ):
 *     Tab bar along the top. Clicking a tab reveals the matching
 *     panel, hides the rest.
 *
 *   Mobile ( < 768px ):
 *     Accordion. Every panel header becomes a button; panels toggle
 *     open/closed independently. The first one starts open.
 *
 * The two modes share the same .install-panel markup. CSS flips
 * the layout by breakpoint — this script wires up behavior for
 * both and re-initializes on resize crossings.
 */

var MOBILE_BP = 767;

function qs(sel, root) { return (root || document).querySelector(sel); }
function qsa(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

function setupDesktop() {
    var tabs = qsa('.install-tab');
    var panels = qsa('.install-panel');
    if (!tabs.length || !panels.length) return;

    // Strip any accordion heads previously injected in mobile mode.
    qsa('.accordion-head').forEach(function(h) { h.remove(); });
    panels.forEach(function(p) {
        var body = p.querySelector('.accordion-body');
        if (body) {
            // unwrap: move body children back into the panel directly
            while (body.firstChild) p.appendChild(body.firstChild);
            body.remove();
        }
    });

    tabs.forEach(function(tab, i) {
        tab.addEventListener('click', function() {
            tabs.forEach(function(t) { t.classList.remove('active'); });
            panels.forEach(function(p) { p.classList.remove('active'); });
            tab.classList.add('active');
            if (panels[i]) panels[i].classList.add('active');
        });
    });

    // Ensure one panel is active.
    if (!tabs.some(function(t) { return t.classList.contains('active'); })) {
        tabs[0].classList.add('active');
        panels[0].classList.add('active');
    }
}

function setupMobile() {
    var panels = qsa('.install-panel');
    if (!panels.length) return;

    panels.forEach(function(panel, i) {
        if (panel.querySelector('.accordion-head')) return; // already built

        var label = panel.getAttribute('data-label') || ('Option ' + (i + 1));

        // Wrap existing children (except head) into .accordion-body.
        var body = document.createElement('div');
        body.className = 'accordion-body';
        while (panel.firstChild) body.appendChild(panel.firstChild);

        var head = document.createElement('button');
        head.type = 'button';
        head.className = 'accordion-head';
        head.innerHTML =
            '<span>' + label + '</span>' +
            '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">' +
            '  <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
            '</svg>';

        panel.appendChild(head);
        panel.appendChild(body);

        head.addEventListener('click', function() {
            panel.classList.toggle('active');
        });
    });

    // Open the first panel by default.
    if (!panels.some(function(p) { return p.classList.contains('active'); })) {
        panels[0].classList.add('active');
    }
}

function apply() {
    if (window.matchMedia('(max-width: ' + MOBILE_BP + 'px)').matches) {
        setupMobile();
    } else {
        setupDesktop();
    }
}

/*
 * Activate the install panel whose data-tab attribute matches the
 * given name. Works in both desktop (tab) and mobile (accordion)
 * modes — for the mobile accordion we open the chosen panel and
 * close the rest so the user lands exactly on the right section.
 */
function activateTab(name) {
    var panels = qsa('.install-panel');
    var tabs = qsa('.install-tab');
    var targetIdx = -1;

    panels.forEach(function(p, i) {
        if (p.getAttribute('data-tab') === name) targetIdx = i;
    });
    if (targetIdx < 0) return;

    panels.forEach(function(p, i) {
        p.classList.toggle('active', i === targetIdx);
    });
    tabs.forEach(function(t, i) {
        t.classList.toggle('active', i === targetIdx);
    });
}

export function initInstallTabs() {
    apply();

    // Re-apply when crossing breakpoint. Track last state to avoid
    // re-running on every resize tick.
    var wasMobile = window.matchMedia('(max-width: ' + MOBILE_BP + 'px)').matches;
    window.addEventListener('resize', function() {
        var isMobile = window.matchMedia('(max-width: ' + MOBILE_BP + 'px)').matches;
        if (isMobile !== wasMobile) {
            wasMobile = isMobile;
            apply();
        }
    });

    // Platform chips in the hero (and anywhere else on the page) can
    // pre-select a specific install method via data-install-tab. The
    // browser still scrolls to #install because the link's href
    // remains a hash anchor — we just also open the right tab.
    document.addEventListener('click', function(e) {
        var link = e.target.closest('[data-install-tab]');
        if (!link) return;
        var name = link.getAttribute('data-install-tab');
        // Defer so the hash-scroll happens first; then the panel
        // becomes active right as the user's view arrives.
        setTimeout(function() { activateTab(name); }, 0);
    });
}
