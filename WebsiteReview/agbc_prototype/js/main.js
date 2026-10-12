(() => {
  const header = document.querySelector("[data-header]");
  const toggle = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-nav]");
  const year = document.querySelector("[data-year]");
  const backToTop = document.querySelector("[data-back-to-top]");
  const desktopMq = window.matchMedia("(min-width: 993px)");

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  const setHeaderState = () => {
    if (!header) return;
    const y = window.scrollY || window.pageYOffset || 0;
    const scrolled = header.classList.contains("is-scrolled");
    // Hysteresis avoids flicker when scrolling near the top threshold.
    if (!scrolled && y > 48) {
      header.classList.add("is-scrolled");
    } else if (scrolled && y < 12) {
      header.classList.remove("is-scrolled");
    }
  };

  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  if (backToTop) {
    const syncBackToTop = () => {
      backToTop.classList.toggle("is-visible", window.scrollY > 420);
    };
    syncBackToTop();
    window.addEventListener("scroll", syncBackToTop, { passive: true });
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  if (toggle && nav) {
    const submenuItems = [...document.querySelectorAll("[data-submenu]")];

    const setExpanded = (item, open) => {
      item.classList.toggle("is-open", open);
      const button = item.querySelector("[data-submenu-toggle]");
      if (button) button.setAttribute("aria-expanded", open ? "true" : "false");
    };

    const closeAllSubmenus = () => {
      submenuItems.forEach((item) => setExpanded(item, false));
    };

    const closeNav = () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "開啟選單");
      closeAllSubmenus();
    };

    toggle.addEventListener("click", () => {
      const open = !nav.classList.contains("is-open");
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "關閉選單" : "開啟選單");
      if (!open) closeAllSubmenus();
    });

    submenuItems.forEach((item) => {
      const button = item.querySelector("[data-submenu-toggle]");
      if (!button) return;

      button.addEventListener("click", (event) => {
        // Desktop: hover / focus-within opens the submenu; ignore click toggle.
        if (desktopMq.matches) {
          event.preventDefault();
          return;
        }

        event.stopPropagation();
        const willOpen = !item.classList.contains("is-open");
        closeAllSubmenus();
        setExpanded(item, willOpen);
      });

      item.addEventListener("mouseenter", () => {
        if (!desktopMq.matches) return;
        button.setAttribute("aria-expanded", "true");
      });

      item.addEventListener("mouseleave", () => {
        if (!desktopMq.matches) return;
        if (!item.matches(":focus-within")) {
          button.setAttribute("aria-expanded", "false");
        }
      });
    });

    document.addEventListener("click", (event) => {
      if (!header?.contains(event.target)) closeNav();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeNav();
    });

    const onViewportChange = () => {
      if (desktopMq.matches) closeNav();
    };

    if (typeof desktopMq.addEventListener === "function") {
      desktopMq.addEventListener("change", onViewportChange);
    } else {
      window.addEventListener("resize", onViewportChange);
    }
  }
})();
