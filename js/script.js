/* ============================================================
   PORTFOLIO INTERACTIONS
   Smooth nav close, scroll-aware navbar, clipboard copy, marquee
   ============================================================ */

const startPortfolio = () => {
  initNavbarScrollState();
  initActiveNavOnScroll();
  initMobileNavClose();
  initEmailCopy();
  initMarqueePause();
  initWireframeLightbox();
  initShowcaseJump();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startPortfolio);
} else {
  startPortfolio();
}

/* --------------------------------------------------------------
   Navbar: deepen background once the page has been scrolled
   -------------------------------------------------------------- */
function initNavbarScrollState() {
  const nav = document.getElementById("mainNav");
  if (!nav) return;

  const update = () => {
    nav.classList.toggle("is-scrolled", window.scrollY > 24);
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
}

/* --------------------------------------------------------------
   Highlight the nav link that matches the section in view
   -------------------------------------------------------------- */
function initActiveNavOnScroll() {
  if (document.body.dataset.lockNav === "true") return;

  const links = document.querySelectorAll(".navbar .nav-link");
  const sections = ["about", "work", "process", "contact"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if (!links.length || !sections.length) return;

  const setActive = (id) => {
    links.forEach((link) => {
      const isMatch = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("active", isMatch);
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    },
    {
      rootMargin: "-40% 0px -50% 0px",
      threshold: 0.1
    }
  );

  sections.forEach((section) => observer.observe(section));
}

/* --------------------------------------------------------------
   Close the Bootstrap collapse menu after a nav link is chosen
   -------------------------------------------------------------- */
function initMobileNavClose() {
  const collapseEl = document.getElementById("navbarNav");
  if (!collapseEl || typeof bootstrap === "undefined") return;

  const collapse = bootstrap.Collapse.getOrCreateInstance(collapseEl, {
    toggle: false
  });

  collapseEl.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      if (window.getComputedStyle(collapseEl).display !== "none" && collapseEl.classList.contains("show")) {
        collapse.hide();
      }
    });
  });
}

/* --------------------------------------------------------------
   Click-to-copy email with a short-lived confirmation tooltip
   -------------------------------------------------------------- */
function initEmailCopy() {
  const copyBtn = document.getElementById("copyEmailBtn");
  const emailLink = document.getElementById("emailLink");
  const tooltip = document.getElementById("copyTooltip");
  if (!copyBtn || !emailLink || !tooltip) return;

  const email = emailLink.dataset.email || emailLink.textContent.trim();

  const showCopied = () => {
    copyBtn.classList.add("is-copied");
    copyBtn.querySelector("span").textContent = "Copied";
    tooltip.classList.add("is-visible");

    window.setTimeout(() => {
      copyBtn.classList.remove("is-copied");
      copyBtn.querySelector("span").textContent = "Copy";
      tooltip.classList.remove("is-visible");
    }, 1800);
  };

  const copyEmail = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(email);
      } else {
        fallbackCopy(email);
      }
      showCopied();
    } catch (error) {
      fallbackCopy(email);
      showCopied();
    }
  };

  copyBtn.addEventListener("click", copyEmail);
}

function fallbackCopy(text) {
  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.style.position = "absolute";
  field.style.left = "-9999px";
  document.body.appendChild(field);
  field.select();
  document.execCommand("copy");
  document.body.removeChild(field);
}

/* --------------------------------------------------------------
   Marquees: CSS handles the infinite loops and hover pause.
   This JS also pauses a track when it receives keyboard focus.
   -------------------------------------------------------------- */
function initMarqueePause() {
  document.querySelectorAll(".marquee").forEach((marquee) => {
    const track = marquee.querySelector(".marquee-track");
    if (!track) return;

    const pause = () => {
      track.style.animationPlayState = "paused";
    };
    const play = () => {
      track.style.animationPlayState = "running";
    };

    marquee.addEventListener("mouseenter", pause);
    marquee.addEventListener("mouseleave", play);
    marquee.addEventListener("focusin", pause);
    marquee.addEventListener("focusout", play);
  });
}

/* --------------------------------------------------------------
   Wireframe gallery: click a square thumbnail to enlarge it
   -------------------------------------------------------------- */
function initWireframeLightbox() {
  const lightbox = document.getElementById("wireframeLightbox");
  const image = document.getElementById("lightboxImage");
  const caption = document.getElementById("lightboxCaption");
  const closeBtn = document.getElementById("lightboxClose");
  const stage = document.getElementById("lightboxStage");
  if (!lightbox || !image || !caption || !closeBtn) return;

  const open = (src, alt, label) => {
    image.src = src;
    image.alt = alt || label || "Preview";
    caption.textContent = label || "";
    if (stage) stage.scrollTop = 0;
    lightbox.hidden = false;
    closeBtn.focus();
  };

  const close = () => {
    lightbox.hidden = true;
    image.removeAttribute("src");
  };

  document.addEventListener("click", (event) => {
    const thumb = event.target.closest(".wireframe-thumb");
    if (!thumb) return;
    event.preventDefault();
    const img = thumb.querySelector("img");
    open(
      thumb.dataset.full || (img && img.src),
      img && img.alt,
      thumb.dataset.caption || ""
    );
  });

  closeBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    close();
  });

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      close();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !lightbox.hidden) {
      event.preventDefault();
      event.stopPropagation();
      close();
    }
  }, true);
}

/* --------------------------------------------------------------
   Internal showcase: sticky section dropdown under the navbar
   -------------------------------------------------------------- */
function initShowcaseJump() {
  const bar = document.getElementById("showcaseJumpbar");
  const button = document.getElementById("showcaseJumpBtn");
  const items = document.querySelectorAll(".showcase-jump-menu .dropdown-item");
  if (!bar || !button || !items.length) return;

  const sentinel = document.createElement("div");
  sentinel.className = "showcase-jumpbar-sentinel";
  sentinel.setAttribute("aria-hidden", "true");
  bar.parentNode.insertBefore(sentinel, bar);

  const navHeight = () => {
    const nav = document.getElementById("mainNav");
    return nav ? nav.offsetHeight : 72;
  };

  const applyStuck = (shouldStick) => {
    const isStuck = bar.classList.contains("is-stuck");
    if (shouldStick && !isStuck) {
      sentinel.style.height = `${bar.offsetHeight}px`;
      bar.style.top = `${navHeight()}px`;
      bar.classList.add("is-stuck");
    } else if (!shouldStick && isStuck) {
      bar.classList.remove("is-stuck");
      bar.style.top = "";
      sentinel.style.height = "";
    }
  };

  const pinBar = () => {
    applyStuck(sentinel.getBoundingClientRect().top <= navHeight());
  };

  const pinObserver = new IntersectionObserver(
    ([entry]) => {
      applyStuck(!entry.isIntersecting && entry.boundingClientRect.top <= navHeight());
    },
    {
      root: null,
      threshold: 0,
      rootMargin: `-${navHeight()}px 0px 0px 0px`
    }
  );
  pinObserver.observe(sentinel);

  const setCurrent = (id, label) => {
    if (button.textContent === label) {
      items.forEach((item) => item.classList.toggle("active", item.dataset.section === id));
      return;
    }
    button.textContent = label;
    items.forEach((item) => {
      const isMatch = item.dataset.section === id;
      item.classList.toggle("active", isMatch);
      if (isMatch) {
        item.setAttribute("aria-current", "true");
      } else {
        item.removeAttribute("aria-current");
      }
    });
  };

  items.forEach((item) => {
    item.addEventListener("click", () => {
      setCurrent(item.dataset.section, item.textContent.trim());
    });
  });

  const sections = [...items]
    .map((item) => document.getElementById(item.dataset.section))
    .filter(Boolean);

  const markerOffset = () => navHeight() + bar.offsetHeight + 16;

  const updateFromScroll = () => {
    pinBar();
    if (!sections.length) return;
    const offset = markerOffset();
    let current = sections[0];
    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= offset) {
        current = section;
      }
    });
    const item = [...items].find((el) => el.dataset.section === current.id);
    if (item) {
      setCurrent(item.dataset.section, item.textContent.trim());
    }
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      updateFromScroll();
      ticking = false;
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  window.addEventListener("hashchange", onScroll);
  updateFromScroll();
}
