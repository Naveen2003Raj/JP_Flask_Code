/* ============================================================
   LANG.JS
   Global EN / TA language controller

   EN button always sets English.
   Tamil button always sets Tamil.

   This is NOT a toggle.
   ============================================================ */

(function () {

    const STORAGE_KEY = "site-lang";
    const FADE_MS = 250;

    function setActiveLanguage(lang) {

        const englishBtn = document.getElementById("englishBtn");
        const tamilBtn = document.getElementById("tamilBtn");

        if (englishBtn) {
            englishBtn.classList.toggle(
                "active",
                lang === "en"
            );
        }

        if (tamilBtn) {
            tamilBtn.classList.toggle(
                "active",
                lang === "ta"
            );
        }

        const langToggle =
            document.getElementById("langToggle");

        if (langToggle) {
            langToggle.setAttribute(
                "aria-label",
                lang === "en"
                    ? "Current language: English"
                    : "Current language: Tamil"
            );
        }
    }


    function resolveNamespace(lang, namespace) {

        if (
            !namespace ||
            !translations[lang]
        ) {
            return undefined;
        }

        return namespace
            .split(".")
            .reduce(
                (node, segment) =>
                    node ? node[segment] : undefined,
                translations[lang]
            );
    }


    function swapRegularText(lang) {

        /*
           Normal elements using:
           data-en="English"
           data-ta="Tamil"
        */

        document
            .querySelectorAll("[data-en]")
            .forEach(element => {

                const text =
                    lang === "ta"
                        ? element.getAttribute("data-ta")
                        : element.getAttribute("data-en");

                if (text !== null) {
                    element.textContent = text;
                }

            });


        /*
           Placeholder translations
        */

        document
            .querySelectorAll("[data-en-placeholder]")
            .forEach(element => {

                const text =
                    lang === "ta"
                        ? element.getAttribute(
                            "data-ta-placeholder"
                        )
                        : element.getAttribute(
                            "data-en-placeholder"
                        );

                if (text !== null) {
                    element.setAttribute(
                        "placeholder",
                        text
                    );
                }

            });

    }


    function swapKeyText(lang) {

        if (
            typeof translations === "undefined"
        ) {
            return;
        }

        document
            .querySelectorAll("[data-key]")
            .forEach(element => {

                /*
                   HERO is controlled by hero-typing.js.

                   Do NOT overwrite Hero typing content here.
                */

                if (element.closest("#hero")) {
                    return;
                }


                const key =
                    element.dataset.key.trim();

                const group =
                    element.closest(
                        "[data-typewrite-group]"
                    );

                const namespace =
                    group &&
                    (
                        group.dataset.i18nSection ||
                        group.id
                    );

                const dictionary =
                    namespace
                        ? resolveNamespace(
                            lang,
                            namespace
                        )
                        : undefined;

                const html =
                    dictionary
                        ? dictionary[key]
                        : undefined;


                if (html === undefined) {

                    console.warn(
                        `lang.js: Translation not found for ` +
                        `data-key="${key}"` +
                        (
                            namespace
                                ? ` in "${namespace}" ` +
                                `(lang="${lang}")`
                                : ""
                        )
                    );

                    return;
                }


                /*
                   innerHTML is required because
                   translations contain <strong>, <em>, etc.
                */

                element.innerHTML = html;

            });

    }


    function applyLanguage(lang, animate = true) {

        if (
            lang !== "en" &&
            lang !== "ta"
        ) {
            lang = "en";
        }


        const regularNodes =
            document.querySelectorAll(
                "[data-en]"
            );

        const keyNodes =
            Array.from(
                document.querySelectorAll(
                    "[data-key]"
                )
            )
                .filter(
                    element =>
                        !element.closest("#hero")
                );


        if (!animate) {

            swapRegularText(lang);
            swapKeyText(lang);

            document.documentElement
                .setAttribute(
                    "lang",
                    lang
                );

            localStorage.setItem(
                STORAGE_KEY,
                lang
            );

            setActiveLanguage(lang);

            /*
               Tell Hero about the language.
            */

            document.dispatchEvent(
                new CustomEvent(
                    "languageChanged",
                    {
                        detail: {
                            language: lang
                        }
                    }
                )
            );

            return;
        }


        regularNodes.forEach(element => {
            element.classList.add("lang-fade");
        });

        keyNodes.forEach(element => {
            element.classList.add("lang-fade");
        });


        setTimeout(() => {

            swapRegularText(lang);
            swapKeyText(lang);

            document.documentElement
                .setAttribute(
                    "lang",
                    lang
                );

            localStorage.setItem(
                STORAGE_KEY,
                lang
            );

            setActiveLanguage(lang);


            /*
               Tell Hero about the language.
            */

            document.dispatchEvent(
                new CustomEvent(
                    "languageChanged",
                    {
                        detail: {
                            language: lang
                        }
                    }
                )
            );


            regularNodes.forEach(element => {
                element.classList.remove(
                    "lang-fade"
                );
            });

            keyNodes.forEach(element => {
                element.classList.remove(
                    "lang-fade"
                );
            });

        }, FADE_MS);

    }


    function initLanguage() {

        const savedLanguage =
            localStorage.getItem(STORAGE_KEY) || "en";

        applyLanguage(savedLanguage, false);


        const langToggle =
            document.getElementById("langToggle");

        if (langToggle) {

            langToggle.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();

                    const currentLanguage =
                        localStorage.getItem(STORAGE_KEY) || "en";

                    const nextLanguage =
                        currentLanguage === "en"
                            ? "ta"
                            : "en";

                    applyLanguage(
                        nextLanguage,
                        true
                    );

                }
            );

        }
    }


    document.addEventListener(
        "DOMContentLoaded",
        initLanguage
    );

})();