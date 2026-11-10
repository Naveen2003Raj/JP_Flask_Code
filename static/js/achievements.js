/* ============================================================
   ACHIEVEMENTS — SCROLL-TRIGGERED STAT COUNTER
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
  const statNumbers =
    document.querySelectorAll(
      ".achievements-section .stat-number"
    );
  const statsSection =
    document.querySelector(
      ".achievements-section"
    );
  if (!statsSection || !statNumbers.length) {
    return;
  }
  let animatedStats = false;
  function animateCounters() {
    statNumbers.forEach(stat => {
      const target =
        parseInt(
          stat.getAttribute("data-target"),
          10
        );
      const suffix =
        stat.getAttribute("data-suffix") || "";

      if (isNaN(target)) {
        return;
      }
      let count = 0;
      const speed =
        Math.max(
          1,
          Math.ceil(target / 40)
        );


      function updateCount() {
        count += speed;
        if (count < target) {
          stat.textContent =
            count + suffix;
          setTimeout(
            updateCount,
            30
          );
        } else {
          stat.textContent =
            target + suffix;
        }
      }
      updateCount();
    });
  }


  const observer =
    new IntersectionObserver(
      function (entries, observer) {
        if (
          entries[0].isIntersecting &&
          !animatedStats
        ) {
          animateCounters();
          animatedStats = true;
          observer.disconnect();
        }

      },
      {
        threshold: 0.3
      }
    );
  observer.observe(statsSection);

});