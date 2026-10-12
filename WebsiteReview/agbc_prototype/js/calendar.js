(() => {
  const data = window.DEMO_CALENDAR;
  if (!data) return;

  const gridEl = document.querySelector("[data-cal-grid]");
  const titleEl = document.querySelector("[data-cal-title]");
  const detailEl = document.querySelector("[data-cal-detail]");
  const detailDateEl = document.querySelector("[data-cal-detail-date]");
  const detailListEl = document.querySelector("[data-cal-detail-list]");
  const prevBtn = document.querySelector("[data-cal-prev]");
  const nextBtn = document.querySelector("[data-cal-next]");
  const todayBtn = document.querySelector("[data-cal-today]");

  if (!gridEl || !titleEl || !detailListEl) return;

  const weekdayLabels = ["日", "一", "二", "三", "四", "五", "六"];
  const monthLabels = [
    "一月",
    "二月",
    "三月",
    "四月",
    "五月",
    "六月",
    "七月",
    "八月",
    "九月",
    "十月",
    "十一月",
    "十二月",
  ];

  const pad = (n) => String(n).padStart(2, "0");
  const toKey = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
  const parseKey = (key) => {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m - 1, d);
  };
  const formatLong = (date) => {
    const w = weekdayLabels[date.getDay()];
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日（星期${w}）`;
  };

  const findWeekendKey = (date) => {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dow = d.getDay();
    if (dow === 6) return toKey(d.getFullYear(), d.getMonth(), d.getDate());
    if (dow === 0) {
      d.setDate(d.getDate() - 1);
      return toKey(d.getFullYear(), d.getMonth(), d.getDate());
    }
    return null;
  };

  const getEventsForDate = (date) => {
    const key = toKey(date.getFullYear(), date.getMonth(), date.getDate());
    const dow = date.getDay();
    const events = [];

    (data.recurring || [])
      .filter((item) => item.dow === dow)
      .forEach((item) => {
        const event = { ...item };
        if (item.category === "崇拜") {
          const weekendKey = findWeekendKey(date);
          const worship = weekendKey ? data.worshipWeekends?.[weekendKey] : null;
          if (worship) {
            if (worship.topic) event.topic = worship.topic;
            if (worship.scripture) event.scripture = worship.scripture;
            if (worship.speaker) event.speaker = worship.speaker;
            if (worship.note) {
              event.note = [event.note, worship.note].filter(Boolean).join("；");
            }
            if (worship.communion) event.communion = true;
          }
        }
        events.push(event);
      });

    (data.specials?.[key] || []).forEach((item) => events.push({ ...item }));
    return events;
  };

  const today = new Date();
  let viewYear = data.year;
  let viewMonth = today.getFullYear() === data.year ? today.getMonth() : 0;
  let selectedKey = toKey(today.getFullYear(), today.getMonth(), today.getDate());

  if (today.getFullYear() !== data.year) {
    selectedKey = `${data.year}-01-01`;
    viewMonth = 0;
  }

  const renderDetail = (key) => {
    const date = parseKey(key);
    const events = getEventsForDate(date);
    selectedKey = key;

    if (detailDateEl) detailDateEl.textContent = formatLong(date);
    if (detailEl) detailEl.hidden = false;

    if (!events.length) {
      detailListEl.innerHTML =
        '<p class="cal-empty">這天暫無特別活動。例行聚會請參閱崇拜時間表。</p>';
      return;
    }

    detailListEl.innerHTML = events
      .map((event) => {
        const meta = [
          event.time,
          event.location,
          event.speaker ? `講員：${event.speaker}` : "",
          event.communion ? "主餐禮" : "",
        ]
          .filter(Boolean)
          .join(" · ");

        return `
          <article class="cal-event-card" data-category="${event.category || "其他"}">
            <span class="cal-event-tag">${event.category || "活動"}</span>
            <h3>${event.title}</h3>
            ${event.topic ? `<p class="cal-event-topic">講題：${event.topic}</p>` : ""}
            ${event.scripture ? `<p class="cal-event-scripture">經文：${event.scripture}</p>` : ""}
            ${meta ? `<p class="cal-event-meta">${meta}</p>` : ""}
            ${event.note ? `<p class="cal-event-note">${event.note}</p>` : ""}
          </article>
        `;
      })
      .join("");
  };

  const renderMonth = () => {
    titleEl.textContent = `${viewYear}年 ${monthLabels[viewMonth]}`;
    const firstDow = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const todayKey = toKey(today.getFullYear(), today.getMonth(), today.getDate());

    const cells = [];
    for (let i = 0; i < firstDow; i += 1) {
      cells.push('<div class="cal-cell cal-cell--empty" aria-hidden="true"></div>');
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const key = toKey(viewYear, viewMonth, day);
      const date = new Date(viewYear, viewMonth, day);
      const events = getEventsForDate(date);
      const hasSpecial = (data.specials?.[key] || []).length > 0;
      const hasWorship = date.getDay() === 0 || date.getDay() === 6;
      const isToday = key === todayKey;
      const isSelected = key === selectedKey;
      const preview = events
        .filter((e) => e.category !== "兒童")
        .slice(0, 2)
        .map((e) => `<span class="cal-dot-label">${e.title}</span>`)
        .join("");

      cells.push(`
        <button
          type="button"
          class="cal-cell${hasSpecial ? " has-special" : ""}${hasWorship ? " has-worship" : ""}${hasSpecial || hasWorship || events.length ? " has-event" : ""}${isToday ? " is-today" : ""}${isSelected ? " is-selected" : ""}"
          data-date="${key}"
          aria-pressed="${isSelected ? "true" : "false"}"
          aria-label="${viewYear}年${viewMonth + 1}月${day}日，共${events.length}項"
        >
          <span class="cal-day-num">${day}</span>
          <span class="cal-cell-preview">${preview || (events.length ? `<span class="cal-dot"></span>` : "")}</span>
        </button>
      `);
    }

    gridEl.innerHTML = `
      <div class="cal-weekdays" aria-hidden="true">
        ${weekdayLabels.map((w) => `<span>${w}</span>`).join("")}
      </div>
      <div class="cal-days">${cells.join("")}</div>
    `;

    gridEl.querySelectorAll("[data-date]").forEach((btn) => {
      btn.addEventListener("click", () => {
        renderDetail(btn.getAttribute("data-date"));
        renderMonth();
        detailEl?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    });
  };

  prevBtn?.addEventListener("click", () => {
    viewMonth -= 1;
    if (viewMonth < 0) {
      viewMonth = 11;
      viewYear -= 1;
    }
    renderMonth();
  });

  nextBtn?.addEventListener("click", () => {
    viewMonth += 1;
    if (viewMonth > 11) {
      viewMonth = 0;
      viewYear += 1;
    }
    renderMonth();
  });

  todayBtn?.addEventListener("click", () => {
    viewYear = today.getFullYear();
    viewMonth = today.getMonth();
    selectedKey = toKey(today.getFullYear(), today.getMonth(), today.getDate());
    renderDetail(selectedKey);
    renderMonth();
  });

  renderDetail(selectedKey);
  renderMonth();
})();
