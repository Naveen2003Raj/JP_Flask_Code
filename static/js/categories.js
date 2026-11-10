

document.addEventListener("DOMContentLoaded", function () {

  /* ==========================================================
     CATEGORY SECTION
     ========================================================== */

  const categorySection =
    document.querySelector("#categories");

  if (!categorySection) {
    return;
  }


  /* ==========================================================
     ELEMENTS
     ========================================================== */

  const tabContainer =
    categorySection.querySelector(".category-tabs");

  const tabBtns =
    categorySection.querySelectorAll(".tab-btn");

  const categoryCards =
    categorySection.querySelectorAll(".category-card");

  const additionalTabs =
    categorySection.querySelectorAll(".additional-category");

  const viewAllBtn =
    categorySection.querySelector(".view-all-btn");


  if (
    !tabContainer ||
    !tabBtns.length ||
    !categoryCards.length ||
    !viewAllBtn
  ) {
    return;
  }


  /* ==========================================================
     STATE
     ========================================================== */

  let isExpanded = false;


  /* ==========================================================
     INITIAL CATEGORY FILTERS
     ========================================================== */

  const initialCategories = [
    "photography",
    "videography",
    "scriptwriter"
  ];


  /* ==========================================================
     UPDATE TAB LABELS
     ========================================================== */



  function updateCategoryTabLabels(languageFromEvent) {

    const language =
      languageFromEvent ||
      localStorage.getItem("site-lang") ||
      "en";


    if (
      typeof translations === "undefined" ||
      !translations[language] ||
      !translations[language].categories ||
      !translations[language].categories.tabs
    ) {
      return;
    }


    const tabTranslations =
      translations[language].categories.tabs;


    /* --------------------------------------------------------
       Normal category labels
       -------------------------------------------------------- */

    categorySection
      .querySelectorAll("[data-category-key]")
      .forEach(label => {

        const key =
          label.getAttribute("data-category-key");

        if (
          key &&
          tabTranslations[key] !== undefined
        ) {

          label.textContent =
            tabTranslations[key];

        }

      });


    /* --------------------------------------------------------
       View All / View Less
       -------------------------------------------------------- */

    const viewLabel =
      viewAllBtn.querySelector(
        "[data-category-key]"
      );


    if (viewLabel) {

      if (isExpanded) {

        viewLabel.textContent =
          tabTranslations.viewLess ||
          (
            language === "ta"
              ? "குறைவாகக் காண்க"
              : "View Less"
          );

      } else {

        viewLabel.textContent =
          tabTranslations.viewAll ||
          (
            language === "ta"
              ? "அனைத்தையும் காண்க"
              : "View All"
          );

      }

    }

  }


  /* ==========================================================
     FILTER CATEGORY CONTENT
     ========================================================== */

  function filterCategories(filter) {

    categoryCards.forEach(card => {

      const cardCategory =
        card.getAttribute("data-category");


      if (cardCategory === filter) {

        card.classList.remove(
          "category-hidden"
        );

      } else {

        card.classList.add(
          "category-hidden"
        );

      }

    });

  }


  /* ==========================================================
     SET ACTIVE TAB
     ========================================================== */

  function setActiveTab(activeButton) {

    tabBtns.forEach(button => {

      button.classList.remove("active");

    });


    activeButton.classList.add("active");

  }


  /* ==========================================================
     EXPAND TAB NAMES ONLY
     
     IMPORTANT:
     This function does NOT touch category cards.
     ========================================================== */

  function expandTabs() {

    isExpanded = true;


    /* --------------------------------------------------------
       Show additional TAB BUTTONS
       -------------------------------------------------------- */

    additionalTabs.forEach(tab => {

      tab.style.display =
        "inline-flex";

    });


    /* --------------------------------------------------------
       Move View Less to the VERY LAST position
       -------------------------------------------------------- */

    tabContainer.appendChild(
      viewAllBtn
    );


    /* --------------------------------------------------------
       Update View All → View Less
       -------------------------------------------------------- */

    updateCategoryTabLabels();


    /*
       IMPORTANT:
       NO categoryCards code here.

       View All does NOT show content.
    */

  }


  /* ==========================================================
     COLLAPSE TAB NAMES
     
     IMPORTANT:
     This function does NOT show all cards.
     ========================================================== */

  function collapseTabs() {

    isExpanded = false;


    /* --------------------------------------------------------
       Hide additional TAB BUTTONS
       -------------------------------------------------------- */

    additionalTabs.forEach(tab => {

      tab.style.display =
        "none";

    });


    /* --------------------------------------------------------
       Move View All back after the initial 3 tabs
       -------------------------------------------------------- */

    const firstAdditionalTab =
      additionalTabs[0];


    if (firstAdditionalTab) {

      tabContainer.insertBefore(
        viewAllBtn,
        firstAdditionalTab
      );

    } else {

      tabContainer.appendChild(
        viewAllBtn
      );

    }


    /* --------------------------------------------------------
       Check current selected category
       -------------------------------------------------------- */

    const activeTab =
      categorySection.querySelector(
        ".tab-btn.active"
      );


    const activeFilter =
      activeTab
        ? activeTab.getAttribute("data-filter")
        : null;


    /* --------------------------------------------------------
       If an additional category was selected,
       return to Photography because that tab is hidden.
       -------------------------------------------------------- */

    if (
      activeFilter &&
      !initialCategories.includes(
        activeFilter
      )
    ) {

      const photographyTab =
        categorySection.querySelector(
          '.tab-btn[data-filter="photography"]'
        );


      if (photographyTab) {

        setActiveTab(
          photographyTab
        );

      }


      filterCategories(
        "photography"
      );

    }


    /* --------------------------------------------------------
       Update View Less → View All
       -------------------------------------------------------- */

    updateCategoryTabLabels();

  }


  /* ==========================================================
     VIEW ALL / VIEW LESS BUTTON
     ========================================================== */

  viewAllBtn.addEventListener(
    "click",
    function () {

      if (isExpanded) {

        collapseTabs();

      } else {

        expandTabs();

      }

    }
  );


  /* ==========================================================
     NORMAL CATEGORY TAB CLICK
     ========================================================== */

  tabBtns.forEach(button => {

    /* View All / View Less has separate logic */

    if (button === viewAllBtn) {
      return;
    }


    button.addEventListener(
      "click",
      function () {

        const filter =
          this.getAttribute("data-filter");


        if (!filter) {
          return;
        }


        /* ----------------------------------------------------
           Make clicked tab active
           ---------------------------------------------------- */

        setActiveTab(
          this
        );


        /* ----------------------------------------------------
           Show ONLY clicked category content
           ---------------------------------------------------- */

        filterCategories(
          filter
        );


        /* ----------------------------------------------------
           If additional category is clicked,
           keep all tabs expanded.
           ---------------------------------------------------- */

        if (
          this.classList.contains(
            "additional-category"
          )
        ) {

          isExpanded = true;


          additionalTabs.forEach(tab => {

            tab.style.display =
              "inline-flex";

          });


          /* Keep View Less at the very end */

          tabContainer.appendChild(
            viewAllBtn
          );


          updateCategoryTabLabels();

        }

      }
    );

  });


  /* ==========================================================
     LANGUAGE CHANGE
     ========================================================== */

  document.addEventListener(
    "languageChanged",
    function (event) {

      const language =
        event.detail &&
          event.detail.language
          ? event.detail.language
          : localStorage.getItem("site-lang") || "en";

      updateCategoryTabLabels(language);

    }
  );


  /* ==========================================================
     INITIAL PAGE STATE
     ========================================================== */

  isExpanded = false;


  /* Hide additional tabs */

  additionalTabs.forEach(tab => {

    tab.style.display =
      "none";

  });


  /* ----------------------------------------------------------
     Put View All after the initial 3 tabs
     ---------------------------------------------------------- */

  if (additionalTabs[0]) {

    tabContainer.insertBefore(
      viewAllBtn,
      additionalTabs[0]
    );

  }


  /* ----------------------------------------------------------
     Photography active
     ---------------------------------------------------------- */

  const photographyTab =
    categorySection.querySelector(
      '.tab-btn[data-filter="photography"]'
    );


  if (photographyTab) {

    setActiveTab(
      photographyTab
    );

  }


  /* ----------------------------------------------------------
     Show Photography content ONLY
     ---------------------------------------------------------- */

  filterCategories(
    "photography"
  );


  /* ----------------------------------------------------------
     Initial translations
     ---------------------------------------------------------- */

  updateCategoryTabLabels();

});