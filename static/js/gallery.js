document.addEventListener(
    "DOMContentLoaded",
    function () {

        const filterButtons =
            document.querySelectorAll(
                "[data-gallery-filter]"
            );

        const galleryCards =
            document.querySelectorAll(
                "[data-gallery-category]"
            );

        const additionalTabs =
            document.querySelectorAll(
                ".additional-gallery-category"
            );

        const viewButton =
            document.querySelector(
                "[data-gallery-view-toggle]"
            );

        const viewText =
            viewButton
                ? viewButton.querySelector(
                    "[data-gallery-view-text]"
                )
                : null;


        const initialCategories = [
            "filmBlackWhite",
            "filmColour",
            "digital"
        ];


        let expanded = false;

        let activeCategory =
            "filmBlackWhite";


        /* ========================================================
           IMAGE LOADING
           ======================================================== */

        galleryCards.forEach(card => {

            const img =
                card.querySelector(
                    ".gallery-img-wrap img"
                );

            if (!img) {
                return;
            }


            const markLoaded =
                () => {

                    img.classList.add(
                        "img-loaded"
                    );

                };


            if (
                img.complete &&
                img.naturalWidth > 0
            ) {

                markLoaded();

            } else {

                img.addEventListener(
                    "load",
                    markLoaded,
                    { once: true }
                );

                img.addEventListener(
                    "error",
                    markLoaded,
                    { once: true }
                );

            }

        });


        /* ========================================================
           GET TRANSLATION
           ======================================================== */

        function getTranslation(
            path,
            fallback
        ) {

            if (
                typeof galleryTranslations ===
                "undefined"
            ) {
                return fallback;
            }


            const language =
                localStorage.getItem(
                    "site-lang"
                ) || "en";


            const value =
                path
                    .split(".")
                    .reduce(
                        (obj, key) =>
                            obj &&
                                obj[key] !== undefined
                                ? obj[key]
                                : undefined,
                        galleryTranslations[
                        language
                        ]
                    );


            return value !== undefined
                ? value
                : fallback;
        }


        /* ========================================================
           UPDATE VIEW BUTTON TEXT
           ======================================================== */

        function updateViewButtonText() {

            if (
                !viewText
            ) {
                return;
            }


            const key =
                expanded
                    ? "tabs.viewLess"
                    : "tabs.viewAll";


            const fallback =
                expanded
                    ? "View Less"
                    : "View All";


            /*
             * Do not force text here if the
             * typing system is currently running.
             *
             * The typing system will update
             * the button automatically.
             */

            viewText.textContent =
                getTranslation(
                    key,
                    fallback
                );

        }


        /* ========================================================
           SHOW CATEGORY
           ======================================================== */

        function showCategory(
            category
        ) {

            activeCategory =
                category;


            galleryCards.forEach(
                card => {

                    const cardCategory =
                        card.dataset.galleryCategory;


                    const shouldShow =
                        cardCategory ===
                        category;


                    if (
                        shouldShow
                    ) {

                        card.classList.remove(
                            "gc-hidden"
                        );

                        card.style.display =
                            "flex";

                    } else {

                        card.classList.add(
                            "gc-hidden"
                        );

                        card.style.display =
                            "none";

                    }

                }
            );


            filterButtons.forEach(
                button => {

                    button.classList.toggle(
                        "active",
                        button.dataset.galleryFilter ===
                        category
                    );

                }
            );


            /*
             * Trigger entrance animation
             * only for currently visible cards.
             */

            const visibleCards =
                Array.from(
                    galleryCards
                ).filter(
                    card =>
                        card.dataset.galleryCategory ===
                        category
                );


            visibleCards.forEach(
                (card, index) => {

                    card.classList.remove(
                        "filter-enter"
                    );

                    void card.offsetWidth;

                    card.style.animationDelay =
                        `${index * 80}ms`;

                    card.classList.add(
                        "filter-enter"
                    );

                }
            );

        }


        /* ========================================================
           EXPAND
           ======================================================== */

        function expandTabs() {

            expanded =
                true;


            if (
                viewButton
            ) {

                viewButton.classList.add(
                    "is-view-less"
                );

            }


            additionalTabs.forEach(
                tab => {

                    tab.style.display =
                        "inline-flex";

                }
            );


            updateViewButtonText();

        }


        /* ========================================================
           COLLAPSE
           ======================================================== */

        function collapseTabs() {

            expanded =
                false;


            if (
                viewButton
            ) {

                viewButton.classList.remove(
                    "is-view-less"
                );

            }


            additionalTabs.forEach(
                tab => {

                    tab.style.display =
                        "none";

                }
            );


            /*
             * If user was on an additional
             * category, return to first category.
             */

            if (
                !initialCategories.includes(
                    activeCategory
                )
            ) {

                showCategory(
                    "filmBlackWhite"
                );

            }


            updateViewButtonText();

        }


        /* ========================================================
           VIEW ALL / VIEW LESS
           ======================================================== */

        if (
            viewButton
        ) {

            viewButton.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    event.stopPropagation();


                    if (
                        expanded
                    ) {

                        collapseTabs();

                    } else {

                        expandTabs();

                    }

                }
            );

        }


        /* ========================================================
           CATEGORY BUTTONS
           ======================================================== */

        filterButtons.forEach(
            button => {

                button.addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();

                        event.stopPropagation();


                        const category =
                            this.dataset.galleryFilter;


                        if (
                            !category
                        ) {
                            return;
                        }


                        showCategory(
                            category
                        );

                    }
                );

            }
        );


        /* ========================================================
           INITIAL STATE
           ======================================================== */

        additionalTabs.forEach(
            tab => {

                tab.style.display =
                    "none";

            }
        );


        /*
         * Only Film Black & White
         * content initially visible.
         */

        showCategory(
            "filmBlackWhite"
        );


        updateViewButtonText();

    }
);