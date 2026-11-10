document.addEventListener("DOMContentLoaded", function () {

    const carousel =
        document.querySelector(".testimonial-carousel");

    const cards =
        document.querySelectorAll(".testimonial-card");

    const prevBtn =
        document.getElementById("testimonialPrev");

    const nextBtn =
        document.getElementById("testimonialNext");

    if (!carousel || !cards.length) {
        return;
    }


    /* ========================================================
       SETTINGS
       ======================================================== */

    const AUTO_PLAY_TIME = 3000;

    let currentIndex = 0;
    let autoPlay = null;


    /* ========================================================
       GET CURRENT CARD WIDTH
       ======================================================== */

    function getCardWidth() {

        const card = cards[0];

        if (!card) {
            return 0;
        }

        const cardStyle =
            window.getComputedStyle(card);

        const carouselStyle =
            window.getComputedStyle(carousel);

        const gap =
            parseFloat(carouselStyle.columnGap) ||
            parseFloat(carouselStyle.gap) ||
            0;

        return card.offsetWidth + gap;
    }


    /* ========================================================
       MOVE CAROUSEL
       ======================================================== */

    function moveCarousel(direction) {

        const cardWidth =
            getCardWidth();

        if (!cardWidth) {
            return;
        }


        currentIndex += direction;


        /* Loop to first */

        if (currentIndex >= cards.length) {
            currentIndex = 0;
        }


        /* Loop to last */

        if (currentIndex < 0) {
            currentIndex = cards.length - 1;
        }


        carousel.scrollTo({

            left:
                currentIndex * cardWidth,

            behavior: "smooth"

        });

    }


    /* ========================================================
       NEXT
       ======================================================== */

    if (nextBtn) {

        nextBtn.addEventListener(
            "click",
            function () {

                moveCarousel(1);

                restartAutoPlay();

            }
        );

    }


    /* ========================================================
       PREVIOUS
       ======================================================== */

    if (prevBtn) {

        prevBtn.addEventListener(
            "click",
            function () {

                moveCarousel(-1);

                restartAutoPlay();

            }
        );

    }


    /* ========================================================
       START AUTOPLAY
       3 SECONDS
       ======================================================== */

    function startAutoPlay() {

        stopAutoPlay();

        autoPlay = setInterval(
            function () {

                moveCarousel(1);

            },
            AUTO_PLAY_TIME
        );

    }


    /* ========================================================
       STOP AUTOPLAY
       ======================================================== */

    function stopAutoPlay() {

        if (autoPlay) {

            clearInterval(autoPlay);

            autoPlay = null;

        }

    }


    /* ========================================================
       RESTART AUTOPLAY
       ======================================================== */

    function restartAutoPlay() {

        stopAutoPlay();

        startAutoPlay();

    }


    /* ========================================================
       PAUSE ON HOVER
       ======================================================== */

    const wrapper =
        document.querySelector(
            ".testimonial-carousel-wrapper"
        );


    if (wrapper) {

        wrapper.addEventListener(
            "mouseenter",
            function () {

                stopAutoPlay();

            }
        );


        wrapper.addEventListener(
            "mouseleave",
            function () {

                startAutoPlay();

            }
        );

    }


    /* ========================================================
       RESIZE
       ======================================================== */

    window.addEventListener(
        "resize",
        function () {

            const cardWidth =
                getCardWidth();

            if (!cardWidth) {
                return;
            }


            carousel.scrollTo({

                left:
                    currentIndex * cardWidth,

                behavior: "auto"

            });

        }
    );


    /* ========================================================
       START
       ======================================================== */

    startAutoPlay();


    /* ========================================================
       TESTIMONIAL MODAL
       ======================================================== */

    const modal =
        document.getElementById(
            "testimonialModal"
        );

    const modalImage =
        document.getElementById(
            "modalTestimonialImage"
        );

    const modalName =
        document.getElementById(
            "modalTestimonialName"
        );

    const modalRole =
        document.getElementById(
            "modalTestimonialRole"
        );

    const modalDescription =
        document.getElementById(
            "modalTestimonialDescription"
        );


    /* ========================================================
       OPEN MODAL
       ======================================================== */

    window.openTestimonialModal =
        function (id) {

            const card =
                document.querySelector(
                    `.testimonial-card[data-testimonial="${id}"]`
                );


            if (!card || !modal) {
                return;
            }


            const image =
                card.querySelector(
                    ".testimonial-avatar"
                );

            const name =
                card.querySelector(
                    ".author-name"
                );

            const role =
                card.querySelector(
                    ".author-role"
                );


            const language =
                localStorage.getItem(
                    "site-lang"
                ) || "en";


            const data =
                translations?.[language]
                    ?.testimonials
                ?.[`review${id}`];


            /* ------------------------------------------------
               IMAGE
               ------------------------------------------------ */

            if (image && modalImage) {

                modalImage.src =
                    image.src;

                modalImage.alt =
                    name
                        ? name.textContent
                        : "";

            }


            /* ------------------------------------------------
               NAME
               ------------------------------------------------ */

            if (modalName && name) {

                modalName.textContent =
                    name.textContent;

            }


            /* ------------------------------------------------
               ROLE
               ------------------------------------------------ */

            if (modalRole && role) {

                modalRole.textContent =
                    role.textContent;

            }


            /* ------------------------------------------------
               FULL DESCRIPTION
               ------------------------------------------------ */

            if (
                modalDescription &&
                data
            ) {

                modalDescription.textContent =
                    data.description;

            }


            /* ------------------------------------------------
               SHOW MODAL
               ------------------------------------------------ */

            modal.classList.add(
                "active"
            );

            modal.setAttribute(
                "aria-hidden",
                "false"
            );

            document.body.style.overflow =
                "hidden";


            stopAutoPlay();

        };


    /* ========================================================
       CLOSE MODAL
       ======================================================== */

    window.closeTestimonialModal =
        function () {

            if (!modal) {
                return;
            }


            modal.classList.remove(
                "active"
            );

            modal.setAttribute(
                "aria-hidden",
                "true"
            );

            document.body.style.overflow =
                "";


            startAutoPlay();

        };


    /* ========================================================
       CLICK OUTSIDE
       ======================================================== */

    const overlay =
        modal?.querySelector(
            ".testimonial-modal-overlay"
        );


    if (overlay) {

        overlay.addEventListener(
            "click",
            window.closeTestimonialModal
        );

    }


    /* ========================================================
       ESC KEY
       ======================================================== */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape" &&
                modal &&
                modal.classList.contains(
                    "active"
                )
            ) {

                window.closeTestimonialModal();

            }

        }
    );

});
