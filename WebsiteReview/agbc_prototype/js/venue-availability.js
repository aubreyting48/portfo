(() => {
  const data = window.DEMO_VENUES;
  if (!data) return;

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
  const money = (n) => `$${Number(n).toLocaleString("en-HK")}`;

  const venueOptions = [
    ...data.rooms.map((room) => ({
      id: room.id,
      name: room.name,
      category: room.category,
      capacityLabel: room.capacityLabel,
      priceHour: room.priceHour,
      priceChristian: room.priceChristian,
      note: room.note,
      externalOk: room.externalOk,
    })),
    {
      id: "sanctuary",
      name: "一樓禮堂",
      category: "婚禮借堂",
      capacityLabel: "詳見查詢",
      priceHour: 17000,
      priceChristian: 10200,
      note: "基本收費以首兩小時計（含禮堂、空調、三角鋼琴、音響控制及清潔）",
      externalOk: true,
      isPackage: true,
    },
  ];

  const getVenue = (id) => venueOptions.find((v) => v.id === id);
  const getVenueName = (id) => getVenue(id)?.name || id;

  const reservationsFor = (venueId, dateKey) =>
    (data.reservations || []).filter(
      (item) => item.venueId === venueId && item.date === dateKey
    );

  const dayStatus = (venueId, dateKey) => {
    const items = reservationsFor(venueId, dateKey);
    if (!items.length) return "available";
    if (items.some((item) => item.status === "reserved")) return "reserved";
    return "pending";
  };

  const initSlotCalendar = (slotEl, options = {}) => {
    if (!slotEl || slotEl.dataset.availReady === "1") return;

    const selectEl = slotEl.querySelector("[data-avail-venue]");
    const titleEl = slotEl.querySelector("[data-avail-title]");
    const gridEl = slotEl.querySelector("[data-avail-grid]");
    const detailEl = slotEl.querySelector("[data-avail-detail]");
    const detailDateEl = slotEl.querySelector("[data-avail-detail-date]");
    const detailListEl = slotEl.querySelector("[data-avail-detail-list]");
    const prevBtn = slotEl.querySelector("[data-avail-prev]");
    const nextBtn = slotEl.querySelector("[data-avail-next]");
    const todayBtn = slotEl.querySelector("[data-avail-today]");
    const applyBtn = slotEl.querySelector("[data-avail-apply]");
    const venueInfoEl = slotEl.querySelector("[data-avail-venue-info]");
    const dateInput = slotEl.querySelector("[data-slot-date]");
    const timeInput = slotEl.querySelector("[data-slot-time]");
    const venueInput = slotEl.querySelector("[data-slot-venue]");

    if (!selectEl || !gridEl || !detailListEl) return;

    selectEl.innerHTML = venueOptions
      .map((v) => `<option value="${v.id}">${v.name}</option>`)
      .join("");

    const today = new Date();
    let viewYear = today.getFullYear();
    let viewMonth = today.getMonth();
    let selectedKey =
      options.date ||
      toKey(today.getFullYear(), today.getMonth(), today.getDate());
    let selectedVenueId =
      options.venueId ||
      venueOptions.find((v) => v.name === options.venue)?.id ||
      (venueOptions.some((v) => v.id === "502") ? "502" : venueOptions[0]?.id);

    if (options.date) {
      const d = parseKey(options.date);
      if (!Number.isNaN(d.getTime())) {
        viewYear = d.getFullYear();
        viewMonth = d.getMonth();
      }
    }

    const renderVenueInfo = () => {
      if (!venueInfoEl) return;
      const venue = getVenue(selectedVenueId);
      if (!venue) {
        venueInfoEl.innerHTML = "";
        return;
      }

      const priceLabel = venue.isPackage
        ? `非會友基本收費 ${money(venue.priceHour)}／首兩小時`
        : `借場費用 ${money(venue.priceHour)}／小時`;
      const altLabel = venue.isPackage
        ? `基督教團體 ${money(venue.priceChristian)}／首兩小時`
        : `基督教團體 ${money(venue.priceChristian)}／小時`;

      venueInfoEl.innerHTML = `
        <div class="avail-venue-card">
          <div class="avail-venue-card-top">
            <span class="venue-card-tag">${venue.category}</span>
            ${venue.externalOk === false ? '<span class="venue-card-badge">原則上不外借</span>' : ""}
          </div>
          <h3>${venue.name}</h3>
          <ul class="avail-venue-facts">
            <li><i class="fa-solid fa-users" aria-hidden="true"></i><span><strong>容納人數</strong>${venue.capacityLabel}</span></li>
            <li><i class="fa-solid fa-clock" aria-hidden="true"></i><span><strong>收費參考</strong>${priceLabel}</span></li>
            <li><i class="fa-solid fa-tag" aria-hidden="true"></i><span><strong>另一收費</strong>${altLabel}</span></li>
          </ul>
          ${venue.note ? `<p class="avail-venue-note">${venue.note}</p>` : ""}
        </div>
      `;
    };

    const applyToFields = (extra = {}) => {
      if (venueInput) venueInput.value = getVenueName(selectedVenueId);
      if (dateInput) dateInput.value = selectedKey;
      if (extra.time && timeInput) timeInput.value = extra.time;
    };

    const renderDetail = (key) => {
      selectedKey = key;
      const date = parseKey(key);
      const items = reservationsFor(selectedVenueId, key);
      const status = dayStatus(selectedVenueId, key);

      if (detailDateEl) {
        detailDateEl.textContent = `${formatLong(date)} · ${getVenueName(selectedVenueId)}`;
      }

      if (!items.length) {
        detailListEl.innerHTML = `
          <div class="avail-empty-card">
            <span class="avail-status-pill is-available">可申請</span>
            <p>這天暫未見預約紀錄（原型示範資料）。可套用至此時段申請欄位。</p>
          </div>
        `;
      } else {
        detailListEl.innerHTML = items
          .map(
            (item) => `
            <article class="avail-event-card is-${item.status}">
              <span class="avail-status-pill is-${item.status}">${item.status === "reserved" ? "已預約" : "審批中"}</span>
              <h3>${item.title}</h3>
              <p><i class="fa-solid fa-clock" aria-hidden="true"></i> ${item.time}</p>
            </article>
          `
          )
          .join("");

        if (status === "reserved") {
          detailListEl.innerHTML += `
            <p class="avail-warn">此日期已有預約紀錄。如仍要申請，請先聯絡本堂確認檔期。</p>
          `;
        }
      }

      if (detailEl) detailEl.hidden = false;
    };

    const renderMonth = () => {
      if (titleEl) titleEl.textContent = `${viewYear}年 ${monthLabels[viewMonth]}`;
      const firstDow = new Date(viewYear, viewMonth, 1).getDay();
      const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
      const todayKey = toKey(today.getFullYear(), today.getMonth(), today.getDate());

      const cells = [];
      for (let i = 0; i < firstDow; i += 1) {
        cells.push('<div class="avail-cell avail-cell--empty" aria-hidden="true"></div>');
      }

      for (let day = 1; day <= daysInMonth; day += 1) {
        const key = toKey(viewYear, viewMonth, day);
        const status = dayStatus(selectedVenueId, key);
        const items = reservationsFor(selectedVenueId, key);
        const isToday = key === todayKey;
        const isSelected = key === selectedKey;

        cells.push(`
          <button
            type="button"
            class="avail-cell is-${status}${isToday ? " is-today" : ""}${isSelected ? " is-selected" : ""}"
            data-date="${key}"
            aria-pressed="${isSelected ? "true" : "false"}"
            aria-label="${viewYear}年${viewMonth + 1}月${day}日，${status === "available" ? "可申請" : status === "reserved" ? "已預約" : "審批中"}"
          >
            <span class="avail-day-num">${day}</span>
            <span class="avail-cell-label">${
              status === "available"
                ? "可申請"
                : status === "reserved"
                  ? "已預約"
                  : "審批中"
            }</span>
            ${items.length > 1 ? `<span class="avail-cell-count">+${items.length - 1}</span>` : ""}
          </button>
        `);
      }

      gridEl.innerHTML = `
        <div class="avail-weekdays" aria-hidden="true">
          ${weekdayLabels.map((w) => `<span>${w}</span>`).join("")}
        </div>
        <div class="avail-days">${cells.join("")}</div>
      `;

      gridEl.querySelectorAll("[data-date]").forEach((btn) => {
        btn.addEventListener("click", () => {
          renderDetail(btn.getAttribute("data-date"));
          renderMonth();
          applyToFields();
        });
      });
    };

    const setVenue = (venueId) => {
      if (!venueId) return;
      selectedVenueId = venueId;
      if (selectEl.value !== venueId) selectEl.value = venueId;
      renderVenueInfo();
      renderMonth();
      renderDetail(selectedKey);
    };

    selectEl.addEventListener("change", () => {
      setVenue(selectEl.value);
      applyToFields();
    });

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
      renderMonth();
      renderDetail(selectedKey);
      applyToFields();
    });

    applyBtn?.addEventListener("click", () => {
      const firstItem = reservationsFor(selectedVenueId, selectedKey)[0];
      applyToFields({ time: firstItem?.time || "" });
      dateInput?.focus();
    });

    selectEl.value = selectedVenueId;
    slotEl.dataset.availReady = "1";
    renderVenueInfo();
    renderMonth();
    renderDetail(selectedKey);

    if (options.autoApply) {
      applyToFields();
    }
  };

  window.DEMO_initSlotCalendar = initSlotCalendar;
  window.DEMO_VENUE_OPTIONS = venueOptions;

  document.querySelectorAll("[data-booking-slot]").forEach((slotEl, index) => {
    const params = new URLSearchParams(window.location.search);
    initSlotCalendar(slotEl, {
      venue: params.get("venue") || undefined,
      venueId: params.get("venueId") || undefined,
      date: params.get("date") || undefined,
      autoApply: index === 0 && Boolean(params.get("venue") || params.get("venueId") || params.get("date")),
    });
  });
})();
