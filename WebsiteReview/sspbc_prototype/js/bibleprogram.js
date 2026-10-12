(() => {
  const data = window.SSPBC_BIBLE_PROGRAMS || [];
  const form = document.querySelector("[data-program-filters]");
  const list = document.querySelector("[data-program-list]");
  const count = document.querySelector("[data-program-count]");
  const empty = document.querySelector("[data-program-empty]");
  const resetBtn = document.querySelector("[data-program-reset]");

  if (!form || !list) return;

  const getFilters = () => {
    const fd = new FormData(form);
    return {
      q: String(fd.get("q") || "").trim().toLowerCase(),
      day: String(fd.get("day") || ""),
      series: String(fd.get("series") || ""),
      audience: String(fd.get("audience") || ""),
      mode: String(fd.get("mode") || ""),
    };
  };

  const filtered = () => {
    const f = getFilters();
    return data.filter((item) => {
      if (f.day && item.day !== f.day) return false;
      if (f.series && item.series !== f.series) return false;
      if (f.audience && item.audience !== f.audience) return false;
      if (f.mode && item.mode !== f.mode) return false;
      if (f.q) {
        const hay = `${item.code} ${item.title} ${item.series} ${item.instructor} ${item.audienceLabel} ${item.summary}`.toLowerCase();
        if (!hay.includes(f.q)) return false;
      }
      return true;
    });
  };

  const render = () => {
    const items = filtered();
    if (count) count.textContent = `顯示 ${items.length} 個課程（共 ${data.length} 個）`;

    if (!items.length) {
      list.innerHTML = "";
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;

    list.innerHTML = items
      .map(
        (item) => `
      <article class="program-card" data-id="${item.id}">
        <div class="program-card-media">
          <img src="${item.image}" alt="" width="640" height="480" loading="lazy" />
          <span class="program-badge">${item.series}</span>
        </div>
        <div class="program-card-body">
          <p class="program-code">${item.code}</p>
          <h2>${item.title}</h2>
          <ul class="program-meta">
            <li><i class="fa-solid fa-calendar-day" aria-hidden="true"></i> ${item.dayLabel} · ${item.time}</li>
            <li><i class="fa-solid fa-location-dot" aria-hidden="true"></i> ${item.modeLabel}</li>
            <li><i class="fa-solid fa-user" aria-hidden="true"></i> 導師：${item.instructor}</li>
            <li><i class="fa-solid fa-users" aria-hidden="true"></i> 對象：${item.audienceLabel}</li>
            <li><i class="fa-solid fa-clock" aria-hidden="true"></i> ${item.period}</li>
          </ul>
          <p class="program-summary">${item.summary}</p>
          <div class="program-card-actions">
            <a class="btn btn-wine" href="register.html?program=${encodeURIComponent(item.id)}">報名</a>
          </div>
        </div>
      </article>`
      )
      .join("");
  };

  form.addEventListener("input", render);
  form.addEventListener("change", render);
  resetBtn?.addEventListener("click", () => {
    form.reset();
    render();
  });

  render();
})();
