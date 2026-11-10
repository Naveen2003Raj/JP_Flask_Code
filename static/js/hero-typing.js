/* ============================================================
   HERO-TYPING.JS
   HERO SEQUENTIAL REVEAL + TYPING WITH BLINKING CURSOR
   + HERO CAROUSEL + ABOUT CAROUSEL
   ============================================================ */

const HERO_NAME_TYPE_SPEED = 65;
const HERO_SUBTITLE_TYPE_SPEED = 24;

const HERO_CAROUSEL_INTERVAL = 3500;
const ABOUT_CAROUSEL_INTERVAL = 3500;


document.addEventListener("DOMContentLoaded", function () {

    /* ========================================================
       LANGUAGE
       ======================================================== */

    let currentLanguage =
        localStorage.getItem("site-lang") || "en";

    let typingSession = 0;
    let hasRunInitialSequence = false;

    const englishBtn =
        document.getElementById("englishBtn");

    const tamilBtn =
        document.getElementById("tamilBtn");

    const sleep = ms =>
        new Promise(resolve => setTimeout(resolve, ms));

    /* ========================================================
       GRAPHEME SEGMENTER (TAMIL & ENGLISH SUPPORT)
       ======================================================== */

    function getGraphemes(text, lang) {
        if (!text) return [];
        if (typeof Intl !== "undefined" && Intl.Segmenter) {
            try {
                const segmenter = new Intl.Segmenter(lang === "ta" ? "ta" : "en", {
                    granularity: "grapheme"
                });
                return Array.from(segmenter.segment(text), s => s.segment);
            } catch (e) {
                // fallback below
            }
        }
        return Array.from(text);
    }

    /* ========================================================
       GET HERO TRANSLATION
       ======================================================== */

    function getHeroText(key) {
        if (
            typeof translations === "undefined" ||
            !translations[currentLanguage] ||
            translations[currentLanguage][key] === undefined
        ) {
            return "";
        }

        const value =
            translations[currentLanguage][key];

        if (Array.isArray(value)) {
            return value.join(" • ");
        }

        return value;
    }

    /* ========================================================
       HERO STATIC TRANSLATIONS
       ======================================================== */

    function applyHeroStaticTranslations(lang) {
        document
            .querySelectorAll("#hero [data-en][data-ta]")
            .forEach(element => {
                element.textContent =
                    lang === "ta"
                        ? element.dataset.ta
                        : element.dataset.en;
            });
    }

    /* ========================================================
       HERO BADGE
       ======================================================== */

    function updateHeroTag(lang) {
        const tag = document.getElementById("heroTag");
        if (!tag) return;

        if (translations && translations[lang] && translations[lang].tag) {
            tag.textContent = translations[lang].tag;
        }
    }

    /* ========================================================
       TYPE HERO NAME (ONE-TIME WITH BLINKING CURSOR)
       ======================================================== */

    async function typeHeroName(text, session) {
        const heroName = document.getElementById("heroName");
        if (!heroName) return false;

        heroName.innerHTML = "";

        const textSpan = document.createElement("span");
        textSpan.className = "hero-name-text";
        heroName.appendChild(textSpan);

        const cursorSpan = document.createElement("span");
        cursorSpan.className = "hero-cursor";
        cursorSpan.setAttribute("aria-hidden", "true");
        heroName.appendChild(cursorSpan);

        const graphemes = getGraphemes(text, currentLanguage);

        for (let i = 0; i < graphemes.length; i++) {
            if (session !== typingSession) {
                return false;
            }

            textSpan.textContent += graphemes[i];

            await sleep(HERO_NAME_TYPE_SPEED);
        }

        // Animation finishes one time. The blinking cursor remains intact.
        return true;
    }

    /* ========================================================
       TYPE SUBTITLE TEXT
       ======================================================== */

    async function typeSubtitle(text, session) {
        const subtitle = document.getElementById("typingSubtitle");
        if (!subtitle) return;

        subtitle.textContent = "";

        const graphemes = getGraphemes(text, currentLanguage);

        for (let i = 0; i < graphemes.length; i++) {
            if (session !== typingSession) {
                return false;
            }

            subtitle.textContent += graphemes[i];

            await sleep(HERO_SUBTITLE_TYPE_SPEED);
        }

        return true;
    }

    /* ========================================================
       HERO SEQUENTIAL REVEAL & TYPING
       ======================================================== */

    async function startHeroSequence(isLanguageSwitch = false) {
        typingSession++;
        const session = typingSession;

        const heroBadge = document.querySelector("#hero .hero-badge");
        const heroNameWrap = document.getElementById("heroNameWrap");
        const heroName = document.getElementById("heroName");
        const heroSubtitle = document.querySelector("#hero .hero-subtitle");
        const heroQuote = document.querySelector("#hero .hero-quote");
        const heroIntro = document.querySelector("#hero .hero-intro");
        const heroCta = document.querySelector("#hero .hero-cta");
        const heroMedia = document.querySelector("#hero .hero-media");

        updateHeroTag(currentLanguage);
        applyHeroStaticTranslations(currentLanguage);

        const nameText = getHeroText("name") || "Jeeva Ponnuchamy";
        const rolesText = getHeroText("roles");
        const quoteText = getHeroText("quote");
        const introText = getHeroText("description");

        if (heroQuote) {
            heroQuote.textContent = quoteText;
        }

        if (heroIntro) {
            heroIntro.textContent = introText;
        }

        if (isLanguageSwitch) {
            // Already revealed: update content smoothly and re-type name
            if (heroBadge) heroBadge.classList.add("is-visible");
            if (heroNameWrap) heroNameWrap.classList.add("is-visible");
            if (heroName) heroName.classList.add("is-visible");
            if (heroSubtitle) heroSubtitle.classList.add("is-visible");
            if (heroQuote) heroQuote.classList.add("is-visible");
            if (heroIntro) heroIntro.classList.add("is-visible");
            if (heroCta) heroCta.classList.add("is-visible");
            if (heroMedia) heroMedia.classList.add("is-visible");

            const subtitle = document.getElementById("typingSubtitle");
            if (subtitle) {
                subtitle.textContent = rolesText;
            }

            await typeHeroName(nameText, session);
            return;
        }

        // ONE BY ONE REVEAL

        // 1. Badge reveals
        if (heroBadge) {
            heroBadge.classList.add("is-visible");
            await sleep(280);
            if (session !== typingSession) return;
        }

        // 2. Name reveals and types (one-time animation with persistent blinking cursor)
        if (heroNameWrap) {
            heroNameWrap.classList.add("is-visible");
        }
        if (heroName) {
            heroName.classList.add("is-visible");
        }

        await typeHeroName(nameText, session);
        if (session !== typingSession) return;
        await sleep(240);

        // 3. Subtitle reveals and types
        if (heroSubtitle) {
            heroSubtitle.classList.add("is-visible");
            await typeSubtitle(rolesText, session);
            if (session !== typingSession) return;
            await sleep(220);
        }

        // 4. Quote reveals
        if (heroQuote) {
            heroQuote.classList.add("is-visible");
            await sleep(240);
            if (session !== typingSession) return;
        }

        // 5. Intro description reveals
        if (heroIntro) {
            heroIntro.classList.add("is-visible");
            await sleep(240);
            if (session !== typingSession) return;
        }

        // 6. Action buttons reveal
        if (heroCta) {
            heroCta.classList.add("is-visible");
            await sleep(200);
            if (session !== typingSession) return;
        }

        // 7. Media portrait carousel reveals
        if (heroMedia) {
            heroMedia.classList.add("is-visible");
        }

        hasRunInitialSequence = true;
    }

    /* Expose globally for preloader callback */
    window.startHeroSequence = function () {
        startHeroSequence(false);
    };

    /* ========================================================
       SWITCH HERO LANGUAGE
       ======================================================== */

    function switchHeroLanguage(lang) {
        currentLanguage = lang;

        if (englishBtn) {
            englishBtn.classList.toggle("active", lang === "en");
        }

        if (tamilBtn) {
            tamilBtn.classList.toggle("active", lang === "ta");
        }

        const titleWrap = document.querySelector(".hero-title-wrap");
        if (titleWrap) {
            titleWrap.dataset.lang = lang;
        }

        applyHeroStaticTranslations(lang);
        updateHeroTag(lang);

        if (hasRunInitialSequence) {
            startHeroSequence(true);
        }
    }

    /* ========================================================
       RECEIVE LANGUAGE CHANGE FROM lang.js
       ======================================================== */

    document.addEventListener("languageChanged", function (event) {
        const lang = event.detail.language;
        switchHeroLanguage(lang);
    });

    /* ========================================================
       INITIAL HERO LANGUAGE & FALLBACK START
       ======================================================== */

    switchHeroLanguage(currentLanguage);

    // Fallback trigger in case page has no preloader or preloader completed early
    setTimeout(() => {
        if (!hasRunInitialSequence) {
            const hasPreloader = document.documentElement.classList.contains("has-preloader");
            if (!hasPreloader) {
                startHeroSequence(false);
            }
        }
    }, 300);

    // Hard fallback after 3200ms
    setTimeout(() => {
        if (!hasRunInitialSequence) {
            startHeroSequence(false);
        }
    }, 3200);


    /* ========================================================
       HERO CAROUSEL
       ======================================================== */

    const heroSlides =
        document.querySelectorAll(
            "#heroCarousel img"
        );

    const heroDots =
        document.querySelectorAll(
            "#heroDots .dot"
        );

    let heroCurrentSlide = 0;


    function showHeroSlide(index) {

        heroSlides.forEach(
            slide => {
                slide.classList.remove(
                    "active"
                );
            }
        );


        heroDots.forEach(
            dot => {
                dot.classList.remove(
                    "active"
                );
            }
        );


        if (heroSlides[index]) {

            heroSlides[index]
                .classList.add(
                    "active"
                );

        }


        if (heroDots[index]) {

            heroDots[index]
                .classList.add(
                    "active"
                );

        }

    }


    /* Hero dots */

    heroDots.forEach(
        (dot, index) => {

            dot.addEventListener(
                "click",
                function () {

                    heroCurrentSlide =
                        index;

                    showHeroSlide(
                        heroCurrentSlide
                    );

                }
            );

        }
    );


    /* Hero autoplay */

    if (
        heroSlides.length > 1
    ) {

        setInterval(
            function () {

                heroCurrentSlide =
                    (
                        heroCurrentSlide + 1
                    ) %
                    heroSlides.length;

                showHeroSlide(
                    heroCurrentSlide
                );

            },
            HERO_CAROUSEL_INTERVAL
        );

    }


    /* ========================================================
       ABOUT CAROUSEL
       Same behavior as Hero
       ======================================================== */

    const aboutSlides =
        document.querySelectorAll(
            "#aboutCarousel img"
        );

    const aboutDots =
        document.querySelectorAll(
            "#aboutDots .dot"
        );

    let aboutCurrentSlide = 0;


    function showAboutSlide(index) {

        aboutSlides.forEach(
            slide => {
                slide.classList.remove(
                    "active"
                );
            }
        );


        aboutDots.forEach(
            dot => {
                dot.classList.remove(
                    "active"
                );
            }
        );


        if (aboutSlides[index]) {

            aboutSlides[index]
                .classList.add(
                    "active"
                );

        }


        if (aboutDots[index]) {

            aboutDots[index]
                .classList.add(
                    "active"
                );

        }

    }


    /* About dots */

    aboutDots.forEach(
        (dot, index) => {

            dot.addEventListener(
                "click",
                function () {

                    aboutCurrentSlide =
                        index;

                    showAboutSlide(
                        aboutCurrentSlide
                    );

                }
            );

        }
    );


    /* About autoplay */

    if (
        aboutSlides.length > 1
    ) {

        setInterval(
            function () {

                aboutCurrentSlide =
                    (
                        aboutCurrentSlide + 1
                    ) %
                    aboutSlides.length;

                showAboutSlide(
                    aboutCurrentSlide
                );

            },
            ABOUT_CAROUSEL_INTERVAL
        );

    }

});
