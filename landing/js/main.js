/*
 * landing/js/main.js
 *
 * Entry point for the landing page. Each concern lives in its own
 * module — this file only orchestrates initialization order.
 *
 * Order matters: bg-scroll must run before story-observer so the
 * palette is already being painted by the time scenes start
 * revealing; tabs must be wired up before install-scroll anchors
 * can target their panels.
 */

import { initBgScroll }      from './bg-scroll.js';
import { initStoryObserver } from './story-observer.js';
import { initGifTilt }       from './gif-tilt.js';
import { initCopy }          from './copy-command.js';
import { initStars }         from './github-stars.js';
import { initInstallTabs }   from './install-tabs.js';

function start() {
    initBgScroll();
    initStoryObserver();
    initGifTilt();
    initCopy();
    initInstallTabs();
    // Star badge is async — don't let it block the rest.
    initStars();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
} else {
    start();
}
