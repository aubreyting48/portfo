(() => {
  const carouselEl = document.getElementById("heroCarousel");
  const indicators = document.querySelectorAll("#heroIndicators button");

  if (carouselEl && indicators.length) {
    carouselEl.addEventListener("slid.bs.carousel", (event) => {
      indicators.forEach((btn, index) => {
        const active = index === event.to;
        btn.classList.toggle("active", active);
        if (active) btn.setAttribute("aria-current", "true");
        else btn.removeAttribute("aria-current");
      });
    });
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const paths = [...document.querySelectorAll(".hero-curve")];

  if (!paths.length) return;

  if (reduceMotion) {
    paths.forEach((path) => {
      path.style.strokeDasharray = "none";
      path.style.strokeDashoffset = "0";
      path.style.opacity = "1";
    });
    return;
  }

  // Slightly different timing per curve so they don't move in lockstep.
  const curveTimings = [
    { drawIn: 1200, hold: 1500, drawOut: 1200, cycle: 8000, startDelay: 0 },
    { drawIn: 1450, hold: 1580, drawOut: 1300, cycle: 7600, startDelay: 280 },
    { drawIn: 1100, hold: 1460, drawOut: 1400, cycle: 8400, startDelay: 520 },
  ];

  const resetPath = (path, length) => {
    path.style.transition = "none";
    path.style.opacity = "1";
    path.style.strokeDasharray = String(length);
    path.style.strokeDashoffset = String(length);
    path.getBoundingClientRect();
  };

  const playCurveCycle = (path, length, timing) => {
    resetPath(path, length);

    window.setTimeout(() => {
      path.style.transition = `stroke-dashoffset ${timing.drawIn}ms ease-out`;
      path.style.strokeDashoffset = "0";

      window.setTimeout(() => {
        path.style.transition = `stroke-dashoffset ${timing.drawOut}ms ease-in`;
        path.style.strokeDashoffset = String(-length);

        window.setTimeout(() => {
          path.style.transition = "none";
          path.style.strokeDashoffset = String(length);
          path.style.opacity = "0";
        }, timing.drawOut + 30);
      }, timing.drawIn + timing.hold);
    }, 0);
  };

  paths.forEach((path, index) => {
    const length = path.getTotalLength();
    const timing = curveTimings[index] || curveTimings[0];

    const run = () => playCurveCycle(path, length, timing);

    window.setTimeout(() => {
      run();
      window.setInterval(run, timing.cycle);
    }, timing.startDelay);
  });
})();
