/* ============================================================
   SECTION-TYPING.JS
   NON-HERO SECTION TYPING
   ============================================================ */

const SECTION_TYPE_SPEED = 18; // ms per character

// Activate typewrite-ready state immediately so browser hides un-typed text until its exact turn
document.documentElement.classList.add("js-typewrite-ready");

document.addEventListener("DOMContentLoaded", function () {

    // Pre-cache source nodes for every typewrite element immediately on DOM ready
    document.querySelectorAll("[data-typewrite]").forEach(el => {
        if (!el._originalSourceNodes) {
            el._originalSourceNodes = Array.from(el.childNodes).map(n => n.cloneNode(true));
        }
    });

    const groups =
        document.querySelectorAll(
            "[data-typewrite-group]"
        );

    if (!groups.length) {
        return;
    }


    /* ========================================================
       CURRENT LANGUAGE
       ======================================================== */

    let currentLanguage =
        localStorage.getItem("site-lang") || "en";


    /* ========================================================
       TRACK GROUPS THAT HAVE ALREADY BEEN TYPED
       ======================================================== */

    const typedGroups = new Set();


    /* ========================================================
       SLEEP HELPER
       ======================================================== */

    const sleep = ms =>
        new Promise(resolve =>
            setTimeout(resolve, ms)
        );


    /* ========================================================
       RESOLVE TRANSLATION NAMESPACE
       ======================================================== */

    function resolveNamespace(
        lang,
        namespace
    ) {

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
                    node
                        ? node[segment]
                        : undefined,
                translations[lang]
            );
    }


    /* ========================================================
       GET SOURCE NODES
       ======================================================== */

    function getSourceNodes(element) {

        let html;


        /* ----------------------------------------------------
           1. TRANSLATION USING data-key
           ---------------------------------------------------- */

        if (
            element.dataset.key !== undefined
        ) {

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

            const dict =
                namespace
                    ? resolveNamespace(
                        currentLanguage,
                        namespace
                    )
                    : undefined;

            html =
                dict
                    ? dict[key]
                    : undefined;


            if (html === undefined) {

                console.warn(
                    `section-typing.js: no translation found for data-key="${key}"` +
                    (
                        namespace
                            ? ` in "${namespace}"`
                            : " — its group has no id/data-i18n-section"
                    )
                );
            }
        }


        /* ----------------------------------------------------
           2. DIRECT data-en / data-ta
           ---------------------------------------------------- */

        else if (
            element.dataset.en !== undefined
        ) {

            html =
                currentLanguage === "ta" &&
                    element.dataset.ta
                    ? element.dataset.ta
                    : element.dataset.en;
        }


        /* ----------------------------------------------------
           CONVERT HTML STRING INTO NODES
           ---------------------------------------------------- */

        if (
            html !== undefined &&
            html !== null
        ) {

            const holder =
                document.createElement("span");

            holder.innerHTML = html;

            return Array.from(
                holder.childNodes
            );
        }


        /* ----------------------------------------------------
           FALLBACK
           ---------------------------------------------------- */

        if (!element._originalSourceNodes) {
            element._originalSourceNodes = Array.from(element.childNodes).map(n => n.cloneNode(true));
        }

        return element._originalSourceNodes.map(node =>
            node.cloneNode(true)
        );
    }


    /* ========================================================
       TYPE ONE SOURCE NODE
       ======================================================== */

    async function typeNode(
        sourceNode,
        targetParent
    ) {

        /* ----------------------------------------------------
           TEXT NODE
           ---------------------------------------------------- */

        if (
            sourceNode.nodeType ===
            Node.TEXT_NODE
        ) {

            const text =
                sourceNode.textContent;

            const textNode =
                document.createTextNode("");

            targetParent.appendChild(
                textNode
            );


            for (
                let i = 0;
                i < text.length;
                i++
            ) {

                textNode.data +=
                    text[i];

                await sleep(
                    SECTION_TYPE_SPEED
                );
            }

            return;
        }


        /* ----------------------------------------------------
           ELEMENT NODE
           ---------------------------------------------------- */

        if (
            sourceNode.nodeType ===
            Node.ELEMENT_NODE
        ) {

            const clone =
                document.createElement(
                    sourceNode.tagName
                );


            /* Copy attributes */

            for (
                const attr of
                sourceNode.attributes
            ) {

                clone.setAttribute(
                    attr.name,
                    attr.value
                );
            }


            targetParent.appendChild(
                clone
            );


            /* Type child nodes */

            for (
                const child of
                Array.from(
                    sourceNode.childNodes
                )
            ) {

                await typeNode(
                    child,
                    clone
                );
            }
        }
    }


    /* ========================================================
       TYPE ONE ELEMENT
       ======================================================== */

    async function typeElement(
        element
    ) {

        const sourceNodes =
            getSourceNodes(element);


        /* Make element active (visible) and clear current content */
        element.classList.add("typewrite-active");
        element.textContent = "";


        /* Type content */
        for (
            const node of sourceNodes
        ) {

            await typeNode(
                node,
                element
            );
        }

        /* Mark complete so it remains permanently visible */
        element.classList.remove("typewrite-active");
        element.classList.add("typewrite-done");
    }


    /* ========================================================
       RUN ONE GROUP
       ======================================================== */

    async function runGroup(
        group,
        force = false
    ) {

        if (
            typedGroups.has(group) &&
            !force
        ) {
            return;
        }

        const elements =
            group.querySelectorAll(
                "[data-typewrite]"
            );

        if (force) {
            typedGroups.delete(group);
            elements.forEach(el => {
                el.classList.remove("typewrite-done", "typewrite-active");
            });
        }


        typedGroups.add(group);


        /*
         * Run typewriters one by one sequentially.
         * All elements remain hidden until their exact turn!
         */
        for (const element of elements) {
            await typeElement(element);
        }
    }


    /* ========================================================
       INTERSECTION OBSERVER
       ======================================================== */

    const observer =
        new IntersectionObserver(
            (entries, obs) => {

                entries.forEach(entry => {

                    if (
                        !entry.isIntersecting
                    ) {
                        return;
                    }


                    runGroup(
                        entry.target
                    );


                    /*
                     * Type only once when
                     * entering viewport.
                     */

                    obs.unobserve(
                        entry.target
                    );

                });

            },
            {
                threshold: 0.15,

                rootMargin:
                    "0px 0px -50px 0px"
            }
        );


    /* ========================================================
       WATCH ALL TYPEWRITING GROUPS
       ======================================================== */

    groups.forEach(group => {

        observer.observe(group);

    });


    /* ========================================================
       LANGUAGE CHANGE
       --------------------------------------------------------
       When English ↔ Tamil is selected:
       - Update current language
       - Re-type groups that were already typed
       - Leave groups that haven't appeared yet for
         normal IntersectionObserver typing
       ======================================================== */

    document.addEventListener(
        "languageChanged",
        function (event) {

            currentLanguage =
                event.detail &&
                    event.detail.language
                    ? event.detail.language
                    : localStorage.getItem(
                        "site-lang"
                    ) || "en";


            groups.forEach(group => {

                /*
                 * Only re-type groups that have
                 * already been displayed/typed.
                 */

                if (
                    typedGroups.has(group)
                ) {

                    runGroup(
                        group,
                        true
                    );

                }

            });

        }
    );

});