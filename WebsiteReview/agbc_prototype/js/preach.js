(() => {
  const data = window.DEMO_PREACH;
  if (!data) return;

  const form = document.querySelector("[data-preach-filters]");
  const listEl = document.querySelector("[data-preach-list]");
  const countEl = document.querySelector("[data-preach-count]");
  const emptyEl = document.querySelector("[data-preach-empty]");
  const resetBtn = document.querySelector("[data-preach-reset]");
  const paginationEl = document.querySelector("[data-preach-pagination]");
  const playerEl = document.querySelector("[data-preach-player]");
  const playerTitle = document.querySelector("[data-preach-player-title]");
  const playerMeta = document.querySelector("[data-preach-player-meta]");
  const audioEl = document.querySelector("[data-preach-audio]");
  const PAGE_SIZE = 6;

  if (!form || !listEl) return;

  let currentPage = 1;
  let currentId = null;

  const speakers = [...new Set(data.sermons.map((s) => s.speaker))].sort((a, b) =>
    a.localeCompare(b, "zh-Hant")
  );
  const speakerSelect = form.querySelector('[name="speaker"]');
  if (speakerSelect) {
    speakerSelect.innerHTML =
      '<option value="">全部講員</option>' +
      speakers.map((name) => `<option value="${name}">${name}</option>`).join("");
  }

  const formatDate = (iso) => {
    const [y, m, d] = iso.split("-");
    return `${y}年${Number(m)}月${Number(d)}日`;
  };

  const getFilters = () => {
    const fd = new FormData(form);
    return {
      q: String(fd.get("q") || "").trim().toLowerCase(),
      speaker: String(fd.get("speaker") || ""),
      service: String(fd.get("service") || ""),
    };
  };

  const filtered = () => {
    const f = getFilters();
    return data.sermons.filter((item) => {
      if (f.speaker && item.speaker !== f.speaker) return false;
      if (f.service && item.service !== f.service) return false;
      if (f.q) {
        const hay = `${item.title} ${item.scripture} ${item.speaker} ${item.summary}`.toLowerCase();
        if (!hay.includes(f.q)) return false;
      }
      return true;
    });
  };

  const playSermon = (item) => {
    currentId = item.id;
    if (playerEl) playerEl.hidden = false;
    if (playerTitle) playerTitle.textContent = item.title;
    if (playerMeta) {
      playerMeta.textContent = `${formatDate(item.date)} · ${item.service} · ${item.speaker} · ${item.scripture}`;
    }
    if (audioEl) {
      audioEl.src = item.audio;
      audioEl.play().catch(() => {});
    }
    listEl.querySelectorAll("[data-sermon-id]").forEach((card) => {
      card.classList.toggle("is-playing", card.getAttribute("data-sermon-id") === item.id);
    });
    playerEl?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const renderPagination = (totalItems, totalPages) => {
    if (!paginationEl) return;

    if (totalPages <= 1) {
      paginationEl.hidden = true;
      paginationEl.innerHTML = "";
      return;
    }

    paginationEl.hidden = false;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
      .map(
        (page) => `
        <button
          type="button"
          class="preach-page-btn${page === currentPage ? " is-active" : ""}"
          data-page="${page}"
          aria-label="第 ${page} 頁"
          ${page === currentPage ? 'aria-current="page"' : ""}
        >${page}</button>
      `
      )
      .join("");

    paginationEl.innerHTML = `
      <button type="button" class="c-btn c-btn--outline c-btn--sm" data-page-prev ${currentPage <= 1 ? "disabled" : ""} aria-label="上一頁">
        <i class="fa-solid fa-chevron-left" aria-hidden="true"></i> 上一頁
      </button>
      <div class="preach-page-numbers">${pages}</div>
      <button type="button" class="c-btn c-btn--outline c-btn--sm" data-page-next ${currentPage >= totalPages ? "disabled" : ""} aria-label="下一頁">
        下一頁 <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
      </button>
    `;
  };

  const render = () => {
    const items = filtered();
    const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * PAGE_SIZE;
    const shown = items.slice(start, start + PAGE_SIZE);

    if (countEl) {
      if (!items.length) {
        countEl.textContent = "顯示 0 篇講道";
      } else {
        const from = start + 1;
        const to = start + shown.length;
        countEl.textContent = `顯示第 ${from}–${to} 篇，共 ${items.length} 篇 · 第 ${currentPage} / ${totalPages} 頁`;
      }
    }

    if (!items.length) {
      listEl.innerHTML = "";
      if (emptyEl) emptyEl.hidden = false;
      renderPagination(0, 0);
      return;
    }

    if (emptyEl) emptyEl.hidden = true;

    listEl.innerHTML = shown
      .map(
        (item) => `
        <article class="preach-card${currentId === item.id ? " is-playing" : ""}" data-sermon-id="${item.id}">
          <div class="preach-card-main">
            <div class="preach-card-meta">
              <time datetime="${item.date}">${formatDate(item.date)}</time>
              <span class="preach-service">${item.service}</span>
              <span class="preach-duration">${item.duration}</span>
            </div>
            <h3>${item.title}</h3>
            <p class="preach-scripture"><i class="fa-solid fa-book-bible" aria-hidden="true"></i> ${item.scripture}</p>
            <p class="preach-speaker"><i class="fa-solid fa-user" aria-hidden="true"></i> ${item.speaker}</p>
            <p class="preach-summary">${item.summary}</p>
          </div>
          <div class="preach-card-actions">
            <button type="button" class="c-btn c-btn--primary c-btn--sm" data-play-id="${item.id}">
              <i class="fa-solid fa-play" aria-hidden="true"></i> 收聽
            </button>
          </div>
        </article>
      `
      )
      .join("");

    renderPagination(items.length, totalPages);
  };

  const goToPage = (page) => {
    currentPage = page;
    render();
    listEl.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  form.addEventListener("input", () => {
    currentPage = 1;
    render();
  });
  form.addEventListener("change", () => {
    currentPage = 1;
    render();
  });

  resetBtn?.addEventListener("click", () => {
    form.reset();
    currentPage = 1;
    render();
  });

  listEl.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-play-id]");
    if (!btn) return;
    const item = data.sermons.find((s) => s.id === btn.getAttribute("data-play-id"));
    if (item) playSermon(item);
  });

  paginationEl?.addEventListener("click", (event) => {
    const prev = event.target.closest("[data-page-prev]");
    const next = event.target.closest("[data-page-next]");
    const pageBtn = event.target.closest("[data-page]");
    const items = filtered();
    const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));

    if (prev && currentPage > 1) {
      goToPage(currentPage - 1);
      return;
    }
    if (next && currentPage < totalPages) {
      goToPage(currentPage + 1);
      return;
    }
    if (pageBtn) {
      const page = Number(pageBtn.getAttribute("data-page"));
      if (page && page !== currentPage) goToPage(page);
    }
  });

  render();
})();
