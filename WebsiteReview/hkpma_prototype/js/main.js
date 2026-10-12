(() => {
  const header = document.querySelector("[data-header]");
  const toggle = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-nav]");
  const year = document.querySelector("[data-year]");
  const submenuItems = document.querySelectorAll("[data-submenu]");

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  const setHeaderState = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };

  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  const closeAllSubmenus = () => {
    submenuItems.forEach((item) => {
      item.classList.remove("is-open");
      const button = item.querySelector("[data-submenu-toggle]");
      if (button) button.setAttribute("aria-expanded", "false");
    });
  };

  submenuItems.forEach((item) => {
    const button = item.querySelector("[data-submenu-toggle]");
    if (!button) return;

    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const willOpen = !item.classList.contains("is-open");
      closeAllSubmenus();
      if (willOpen) {
        item.classList.add("is-open");
        button.setAttribute("aria-expanded", "true");
      }
    });
  });

  if (toggle && nav) {
    const closeMenu = () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
      closeAllSubmenus();
    };

    const openMenu = () => {
      nav.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close menu");
    };

    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.contains("is-open");
      if (isOpen) closeMenu();
      else openMenu();
    });

    nav.querySelectorAll(".nav-list > li > a, .submenu a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    document.addEventListener("click", (event) => {
      if (!nav.contains(event.target) && !toggle.contains(event.target)) {
        closeAllSubmenus();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) {
        closeMenu();
      }
    });
  }

  const enquiryForm = document.querySelector("[data-enquiry-form]");
  if (enquiryForm) {
    const success = document.querySelector("[data-form-success]");
    enquiryForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!enquiryForm.reportValidity()) return;
      enquiryForm.reset();
      if (success) {
        success.hidden = false;
        success.focus?.();
      }
    });
  }
})();
