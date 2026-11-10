/* ============================================================
   SCROLL-REVEAL.JS
   GLOBAL BLUR-TO-SHARP SCROLL REVEAL ANIMATIONS
   Works across all pages: Index, About, Works, Gallery, Article, Video
   ============================================================ */

(function () {
    const REVEAL_SELECTOR =
        ".reveal-left, .reveal-right, .reveal-up, .reveal-down, .reveal-fade, .reveal-blur, [data-scroll-blur]";

    let observer = null;

    function initObserver() {
        if (observer) {
            return observer;
        }

        observer = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    entry.target.classList.add("is-visible");
                    entry.target.classList.add("revealed");

                    /* Animate only once when entering viewport */
                    obs.unobserve(entry.target);
                });
            },
            {
                threshold: 0.08,
                rootMargin: "0px 0px -35px 0px"
            }
        );

        return observer;
    }

    function observeElements(container = document) {
        const obs = initObserver();
        const elements = Array.from(
            container.querySelectorAll(REVEAL_SELECTOR)
        ).filter(el => !el.closest("#hero"));

        elements.forEach(el => {
            if (!el.classList.contains("is-visible")) {
                obs.observe(el);
            }
        });
    }

    // Expose globally for dynamic components (e.g. tab changes, category filters)
    window.observeRevealElements = observeElements;

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => observeElements());
    } else {
        observeElements();
    }
})();