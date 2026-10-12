(() => {
  const header = document.querySelector("[data-header]");
  const toggle = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-nav]");
  const year = document.querySelector("[data-year]");
  const slides = [...document.querySelectorAll("[data-slide]")];
  const dotsWrap = document.querySelector("[data-hero-dots]");
  const dots = dotsWrap ? [...dotsWrap.querySelectorAll("button")] : [];
  const backToTop = document.querySelector("[data-back-to-top]");

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  const setHeaderState = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
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

  const searchToggle = document.querySelector("[data-search-toggle]");
  const searchPanel = document.querySelector("[data-search-panel]");
  const searchInput = searchPanel?.querySelector("[data-search-input]");

  const closeSearchPanel = () => {
    if (!searchToggle || !searchPanel) return;
    searchPanel.classList.remove("is-open");
    searchPanel.hidden = true;
    searchToggle.setAttribute("aria-expanded", "false");
    searchToggle.setAttribute("aria-label", "開啟搜尋");
  };

  const openSearchPanel = () => {
    if (!searchToggle || !searchPanel) return;
    searchPanel.hidden = false;
    searchPanel.classList.add("is-open");
    searchToggle.setAttribute("aria-expanded", "true");
    searchToggle.setAttribute("aria-label", "關閉搜尋");
    window.requestAnimationFrame(() => searchInput?.focus());
  };

  if (searchToggle && searchPanel) {
    searchToggle.addEventListener("click", (event) => {
      event.stopPropagation();
      if (searchPanel.classList.contains("is-open")) closeSearchPanel();
      else openSearchPanel();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeSearchPanel();
    });

    window.addEventListener("resize", () => {
      if (!window.matchMedia("(max-width: 992px)").matches) closeSearchPanel();
    });
  }

  if (toggle && nav) {
    const submenuItems = [...document.querySelectorAll("[data-submenu]")];

    const closeAllSubmenus = () => {
      submenuItems.forEach((item) => {
        item.classList.remove("is-open");
        const button = item.querySelector(":scope > [data-submenu-toggle]");
        if (button) button.setAttribute("aria-expanded", "false");
      });
    };

    const closeMenu = () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "開啟選單");
      closeAllSubmenus();
    };

    const openMenu = () => {
      nav.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "關閉選單");
    };

    toggle.addEventListener("click", () => {
      if (nav.classList.contains("is-open")) closeMenu();
      else openMenu();
    });

    submenuItems.forEach((item) => {
      const button = item.querySelector(":scope > [data-submenu-toggle]");
      if (!button) return;

      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const willOpen = !item.classList.contains("is-open");

        const parentList = item.parentElement;
        if (parentList) {
          [...parentList.children].forEach((sibling) => {
            if (sibling !== item && sibling.matches?.("[data-submenu]")) {
              sibling.classList.remove("is-open");
              const sibBtn = sibling.querySelector(":scope > [data-submenu-toggle]");
              if (sibBtn) sibBtn.setAttribute("aria-expanded", "false");
            }
          });
        }

        item.classList.toggle("is-open", willOpen);
        button.setAttribute("aria-expanded", willOpen ? "true" : "false");
      });
    });

    nav.querySelectorAll(".nav-list > li > a, .submenu a").forEach((link) => {
      link.addEventListener("click", () => {
        if (window.matchMedia("(max-width: 992px)").matches) closeMenu();
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (!nav.contains(target) && !toggle.contains(target)) {
        closeAllSubmenus();
      }
    });

    window.addEventListener("resize", () => {
      if (!window.matchMedia("(max-width: 992px)").matches) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* Hero slider */
  if (slides.length) {
    let index = 0;
    let timer = 0;

    const goTo = (next) => {
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach((dot, i) => {
        const active = i === index;
        dot.classList.toggle("is-active", active);
        dot.setAttribute("aria-selected", active ? "true" : "false");
      });
    };

    const stopAutoplay = () => {
      if (timer) window.clearInterval(timer);
    };

    const startAutoplay = () => {
      stopAutoplay();
      if (slides.length < 2) return;
      timer = window.setInterval(() => goTo(index + 1), 6000);
    };

    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => {
        goTo(i);
        startAutoplay();
      });
    });

    const hero = document.querySelector("[data-hero]");
    if (hero) {
      hero.addEventListener("mouseenter", stopAutoplay);
      hero.addEventListener("mouseleave", startAutoplay);
      hero.addEventListener("focusin", stopAutoplay);
      hero.addEventListener("focusout", startAutoplay);
    }

    goTo(0);
    startAutoplay();
  }

  /* Impact count-up */
  const countEls = [...document.querySelectorAll("[data-count]")];
  if (countEls.length) {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = 1600;

    const formatCount = (value, target) => {
      if (target >= 1000) return value.toLocaleString("en-US");
      return String(value);
    };

    const animateCount = (el) => {
      const target = Number(el.getAttribute("data-count")) || 0;
      const suffix = el.getAttribute("data-suffix") || "";
      if (prefersReduced || target <= 0) {
        el.textContent = `${formatCount(target, target)}${suffix}`;
        return;
      }

      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(target * eased);
        el.textContent = `${formatCount(current, target)}${suffix}`;
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            animateCount(entry.target);
            obs.unobserve(entry.target);
          });
        },
        { threshold: 0.4 }
      );
      countEls.forEach((el) => observer.observe(el));
    } else {
      countEls.forEach(animateCount);
    }
  }

  /* Service cards fade-in up */
  const serviceCards = [...document.querySelectorAll(".service-card")];
  if (serviceCards.length) {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || !("IntersectionObserver" in window)) {
      serviceCards.forEach((card) => card.classList.add("is-visible"));
    } else {
      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          });
        },
        { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
      );
      serviceCards.forEach((card) => observer.observe(card));
    }
  }

  /* Milestone fade-in up */
  const milestoneItems = [...document.querySelectorAll(".milestone-item")];
  if (milestoneItems.length) {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || !("IntersectionObserver" in window)) {
      milestoneItems.forEach((item) => item.classList.add("is-visible"));
    } else {
      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          });
        },
        { threshold: 0.18, rootMargin: "0px 0px -6% 0px" }
      );
      milestoneItems.forEach((item) => observer.observe(item));
    }
  }

  const yearSelect = document.querySelector('.page-filters select[name="year"]');
  if (yearSelect) {
    yearSelect.addEventListener("change", () => {
      const year = yearSelect.value;
      if (!year) return;
      const target = document.getElementById(`year-${year}`);
      if (!target) return;
      target.classList.add("is-visible");
      const header = document.querySelector("[data-header]");
      const offset = (header?.offsetHeight || 0) + 16;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    });
  }

  /* Image zoom lightbox */
  const zoomButtons = [...document.querySelectorAll("[data-zoom]")];
  if (zoomButtons.length) {
    const lightbox = document.createElement("div");
    lightbox.className = "zoom-lightbox";
    lightbox.hidden = true;
    lightbox.innerHTML = '<button class="zoom-lightbox-close" type="button" aria-label="關閉">×</button><img alt="" />';
    document.body.appendChild(lightbox);
    const lightboxImg = lightbox.querySelector("img");
    const closeBtn = lightbox.querySelector(".zoom-lightbox-close");
    let lastFocus = null;

    const closeZoom = () => {
      lightbox.hidden = true;
      lightboxImg.removeAttribute("src");
      document.body.style.overflow = "";
      lastFocus?.focus();
    };

    zoomButtons.forEach((button) => {
      button.addEventListener("click", () => {
        lastFocus = button;
        lightboxImg.src = button.getAttribute("data-zoom-src") || "";
        lightboxImg.alt = button.getAttribute("data-zoom-alt") || "";
        lightbox.hidden = false;
        document.body.style.overflow = "hidden";
        closeBtn.focus();
      });
    });

    closeBtn.addEventListener("click", closeZoom);
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) closeZoom();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !lightbox.hidden) closeZoom();
    });
  }

  /* Donation flow */
  const donateFlow = document.querySelector("[data-donate-flow]");
  if (donateFlow) {
    const step1 = donateFlow.querySelector('[data-donate-step="1"]');
    const step2 = donateFlow.querySelector('[data-donate-step="2"]');
    const typeCards = [...donateFlow.querySelectorAll("[data-donate-type]")];
    const programCards = [...donateFlow.querySelectorAll("[data-donate-program]")];
    const nextBtn = donateFlow.querySelector("[data-donate-next]");
    const backBtn = donateFlow.querySelector("[data-donate-back]");
    const step1Hint = donateFlow.querySelector("[data-donate-step1-hint]");
    const summaryProgram = donateFlow.querySelector("[data-donate-summary-program]");
    const summaryType = donateFlow.querySelector("[data-donate-summary-type]");
    const amountBtns = [...donateFlow.querySelectorAll("[data-amount]")];
    const amountInput = donateFlow.querySelector("[data-donate-amount-input]");
    const freqOnce = donateFlow.querySelector("#freq-once");
    const freqMonthly = donateFlow.querySelector("#freq-monthly");

    const typeLabels = {
      once: "一次性捐款",
      monthly: "月捐計劃",
      yearly: "年捐計劃",
    };

    let selectedType = "once";
    let selectedProgram = null;

    const syncNextState = () => {
      const ready = Boolean(selectedProgram);
      if (nextBtn) nextBtn.disabled = !ready;
      if (step1Hint) step1Hint.hidden = ready;
    };

    const selectType = (card) => {
      selectedType = card.getAttribute("data-donate-type") || "once";
      typeCards.forEach((other) => {
        const on = other === card;
        other.classList.toggle("is-selected", on);
        other.setAttribute("aria-checked", on ? "true" : "false");
      });
      if (freqOnce && freqMonthly) {
        if (selectedType === "monthly" || selectedType === "yearly") {
          freqMonthly.checked = true;
        } else {
          freqOnce.checked = true;
        }
      }
      if (summaryType) summaryType.textContent = typeLabels[selectedType] || typeLabels.once;
    };

    const selectProgram = (card) => {
      selectedProgram = card;
      programCards.forEach((other) => {
        const on = other === card;
        other.classList.toggle("is-selected", on);
        other.setAttribute("aria-checked", on ? "true" : "false");
        const cta = other.querySelector("[data-donate-select]");
        if (cta) cta.textContent = on ? "已選擇" : "選擇此項目";
      });
      if (summaryProgram) {
        summaryProgram.textContent = card.getAttribute("data-program-title") || "—";
      }
      const suggested = Number(card.getAttribute("data-suggested"));
      if (suggested && amountInput) {
        amountInput.value = String(suggested);
        amountBtns.forEach((btn) => {
          btn.classList.toggle("is-selected", Number(btn.getAttribute("data-amount")) === suggested);
        });
      }
      syncNextState();
    };

    const detailModalEl = document.getElementById("donate-detail-modal");
    const detailTitle = detailModalEl?.querySelector("[data-detail-title]");
    const detailCategory = detailModalEl?.querySelector("[data-detail-category]");
    const detailAmount = detailModalEl?.querySelector("[data-detail-amount]");
    const detailBody = detailModalEl?.querySelector("[data-detail-body]");
    const detailSelectBtn = detailModalEl?.querySelector("[data-detail-select]");
    let detailTargetCard = null;
    const detailModal =
      detailModalEl && window.bootstrap?.Modal
        ? window.bootstrap.Modal.getOrCreateInstance(detailModalEl)
        : null;

    const openProgramDetail = (card) => {
      detailTargetCard = card;
      if (detailTitle) detailTitle.textContent = card.getAttribute("data-program-title") || "";
      if (detailCategory) detailCategory.textContent = card.getAttribute("data-program-category") || "";
      const amount = card.getAttribute("data-program-amount");
      if (detailAmount) {
        detailAmount.hidden = !amount;
        detailAmount.textContent = amount ? `參考金額：${amount}` : "";
      }
      if (detailBody) {
        detailBody.textContent =
          card.getAttribute("data-program-detail") ||
          card.querySelector(".donate-program-card-desc")?.textContent ||
          "";
      }
      detailModal?.show();
    };

    typeCards.forEach((card) => {
      card.addEventListener("click", () => selectType(card));
    });

    programCards.forEach((card) => {
      card.querySelector("[data-donate-select]")?.addEventListener("click", (event) => {
        event.stopPropagation();
        selectProgram(card);
      });
      card.querySelector("[data-donate-detail]")?.addEventListener("click", (event) => {
        event.stopPropagation();
        openProgramDetail(card);
      });
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          selectProgram(card);
        }
      });
    });

    detailSelectBtn?.addEventListener("click", () => {
      if (detailTargetCard) selectProgram(detailTargetCard);
      detailModal?.hide();
    });

    amountBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const value = btn.getAttribute("data-amount") || "";
        amountBtns.forEach((other) => other.classList.toggle("is-selected", other === btn));
        if (amountInput) amountInput.value = value;
      });
    });

    amountInput?.addEventListener("input", () => {
      const value = Number(amountInput.value);
      amountBtns.forEach((btn) => {
        btn.classList.toggle("is-selected", Number(btn.getAttribute("data-amount")) === value);
      });
    });

    const showStep = (step) => {
      if (!step1 || !step2) return;
      const goStep2 = step === 2;
      step1.hidden = goStep2;
      step2.hidden = !goStep2;
      window.scrollTo({ top: donateFlow.offsetTop - 24, behavior: "smooth" });
    };

    nextBtn?.addEventListener("click", () => {
      if (!selectedProgram) {
        if (step1Hint) step1Hint.hidden = false;
        return;
      }
      if (summaryType) summaryType.textContent = typeLabels[selectedType] || typeLabels.once;
      showStep(2);
    });

    backBtn?.addEventListener("click", () => showStep(1));

    syncNextState();
  }

  /* News list pagination */
  const newsList = document.querySelector("[data-news-list]");
  const newsPagination = document.querySelector("[data-news-pagination] .pagination");
  if (newsList && newsPagination) {
    const items = [...newsList.querySelectorAll("[data-news-item]")];
    const perPage = Math.max(1, Number(newsList.getAttribute("data-per-page")) || 6);
    const totalPages = Math.max(1, Math.ceil(items.length / perPage));
    let currentPage = 1;

    const renderPage = (page) => {
      currentPage = Math.min(Math.max(1, page), totalPages);
      const start = (currentPage - 1) * perPage;
      const end = start + perPage;

      items.forEach((item, index) => {
        item.hidden = index < start || index >= end;
      });

      newsPagination.innerHTML = "";

      const addItem = (label, pageNum, options = {}) => {
        const li = document.createElement("li");
        li.className = "page-item";
        if (options.active) li.classList.add("active");
        if (options.disabled) li.classList.add("disabled");

        const el = document.createElement(options.disabled || options.active ? "span" : "button");
        el.className = "page-link";
        el.textContent = label;
        if (options.active) el.setAttribute("aria-current", "page");
        if (options.disabled) el.setAttribute("aria-disabled", "true");
        if (el.tagName === "BUTTON") {
          el.type = "button";
          el.addEventListener("click", () => {
            renderPage(pageNum);
            newsList.scrollIntoView({ behavior: "smooth", block: "start" });
          });
        }
        li.appendChild(el);
        newsPagination.appendChild(li);
      };

      addItem("上一頁", currentPage - 1, { disabled: currentPage === 1 });
      for (let i = 1; i <= totalPages; i += 1) {
        addItem(String(i), i, { active: i === currentPage });
      }
      addItem("下一頁", currentPage + 1, { disabled: currentPage === totalPages });
    };

    renderPage(1);
  }

  /* Join form: show "其他" input only when selected */
  document.querySelectorAll("[data-other-group]").forEach((group) => {
    const radios = [...group.querySelectorAll('input[type="radio"]')];
    const otherPanel = group.querySelector("[data-other-field]");
    const otherInput = otherPanel?.querySelector("input");
    if (!radios.length || !otherPanel || !otherInput) return;

    const syncOther = () => {
      const showOther = radios.some((radio) => radio.checked && radio.hasAttribute("data-other-trigger"));
      otherPanel.hidden = !showOther;
      otherInput.disabled = !showOther;
      otherInput.required = showOther;
      if (!showOther) otherInput.value = "";
    };

    radios.forEach((radio) => radio.addEventListener("change", syncOther));
    syncOther();
  });

  /* Join form captcha */
  const captchaRoot = document.querySelector("[data-captcha]");
  if (captchaRoot) {
    const codeEl = captchaRoot.querySelector("[data-captcha-code]");
    const inputEl = captchaRoot.querySelector("[data-captcha-input]");
    const refreshBtn = captchaRoot.querySelector("[data-captcha-refresh]");
    const errorEl = captchaRoot.querySelector("[data-captcha-error]");
    const form = captchaRoot.closest("form");
    let captchaValue = "";

    const generateCaptcha = () => {
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let next = "";
      for (let i = 0; i < 5; i += 1) {
        next += chars[Math.floor(Math.random() * chars.length)];
      }
      captchaValue = next;
      if (codeEl) codeEl.textContent = next;
      if (inputEl) inputEl.value = "";
      if (errorEl) errorEl.hidden = true;
    };

    refreshBtn?.addEventListener("click", generateCaptcha);
    generateCaptcha();

    form?.addEventListener("submit", (event) => {
      const typed = (inputEl?.value || "").trim().toUpperCase();
      if (typed !== captchaValue) {
        event.preventDefault();
        generateCaptcha();
        if (errorEl) errorEl.hidden = false;
        inputEl?.focus();
      }
    });
  }
})();
