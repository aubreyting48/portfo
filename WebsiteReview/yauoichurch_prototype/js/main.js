(() => {
  const header = document.querySelector("[data-header]");
  const toggle = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-nav]");
  const year = document.querySelector("[data-year]");
  const slides = [...document.querySelectorAll("[data-slide]")];
  const dotsWrap = document.querySelector("[data-hero-dots]");
  const dots = dotsWrap ? [...dotsWrap.querySelectorAll("button")] : [];
  const reveals = [...document.querySelectorAll("[data-reveal]")];
  const submenuItems = [...document.querySelectorAll("[data-submenu]")];

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  const setHeaderState = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };

  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  /* Back to top */
  const backToTop = document.querySelector("[data-back-to-top]");
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
      if (window.innerWidth > 768) closeMenu();
    });
  }

  let index = 0;
  let timer;

  const goTo = (next) => {
    if (!slides.length) return;
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

  const startAutoplay = () => {
    stopAutoplay();
    if (slides.length < 2) return;
    timer = window.setInterval(() => goTo(index + 1), 6000);
  };

  const stopAutoplay = () => {
    if (timer) window.clearInterval(timer);
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

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    );

    reveals.forEach((el) => observer.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  /* Booking page mock calendar + search */
  const calRoot = document.querySelector("[data-booking-calendar]");
  if (calRoot) {
    const grid = calRoot.querySelector("[data-cal-grid]");
    const title = calRoot.querySelector("[data-cal-title]");
    const prev = calRoot.querySelector("[data-cal-prev]");
    const next = calRoot.querySelector("[data-cal-next]");
    const addBtn = document.querySelector("[data-booking-add]");
    const searchBtn = document.querySelector("[data-booking-search]");
    const panel = document.querySelector("#booking-form-panel");
    const results = document.querySelector("[data-booking-results]");
    const resultsTitle = document.querySelector("[data-results-title]");
    const resultsSummary = document.querySelector("[data-results-summary]");
    const resultsBody = document.querySelector("[data-results-body]");
    const resultsCards = document.querySelector("[data-results-cards]");
    const resultsEmpty = document.querySelector("[data-results-empty]");
    const daySlots = document.querySelector("[data-day-slots]");
    const daySlotsTitle = document.querySelector("[data-day-slots-title]");
    const daySlotList = document.querySelector("[data-day-slot-list]");
    const cancelBtn = document.querySelector("[data-booking-cancel]");
    const form = document.querySelector("[data-booking-form]");
    const success = document.querySelector("[data-booking-success]");
    const venueFilter = document.querySelector("#venue-select");
    const bookVenue = document.querySelector("#book-venue");
    const bookDate = document.querySelector("#book-date");
    const bookStart = document.querySelector("#book-start");
    const bookDuration = document.querySelector("#book-duration");
    const bookEnd = document.querySelector("#book-end");
    const slotHint = document.querySelector("[data-slot-hint]");

    const venueLabels = {
      all: "所有場地",
      yo: "活動中心",
      yauoi: "社區堂會",
      "2723": "2723室（必須有同工在場）",
      "yo-2628": "活動中心（2628室）",
    };

    const appointments = [
      { venue: "yo", date: "2026-09-05", start: "09:00", duration: 120, purpose: "崇拜預備", status: "已確認" },
      { venue: "yo", date: "2026-09-05", start: "14:00", duration: 90, purpose: "青少年聚會", status: "已確認" },
      { venue: "yo", date: "2026-09-12", start: "19:00", duration: 120, purpose: "團契聚會", status: "已確認" },
      { venue: "yo", date: "2026-09-19", start: "10:00", duration: 60, purpose: "部門會議", status: "待審批" },
      { venue: "yauoi", date: "2026-09-05", start: "11:00", duration: 90, purpose: "崇拜", status: "已確認" },
      { venue: "yauoi", date: "2026-09-05", start: "15:00", duration: 120, purpose: "兒童事工", status: "已確認" },
      { venue: "yauoi", date: "2026-09-12", start: "14:00", duration: 120, purpose: "伯特利團", status: "已確認" },
      { venue: "yauoi", date: "2026-09-26", start: "10:00", duration: 180, purpose: "培訓講座", status: "已確認" },
      { venue: "2723", date: "2026-09-12", start: "10:00", duration: 120, purpose: "鄰舍面談", status: "已確認" },
      { venue: "2723", date: "2026-09-19", start: "14:30", duration: 90, purpose: "義工會議", status: "待審批" },
      { venue: "yo-2628", date: "2026-09-05", start: "18:00", duration: 120, purpose: "小組聚會", status: "已確認" },
      { venue: "yo-2628", date: "2026-09-19", start: "09:30", duration: 60, purpose: "行政會議", status: "已確認" },
      { venue: "yo-2628", date: "2026-09-19", start: "15:00", duration: 90, purpose: "牧區會議", status: "已確認" },
    ];

    let view = new Date(2026, 8, 1);
    let activeVenue = "all";
    let selectedDay = null;

    const toMinutes = (time) => {
      const [h, m] = time.split(":").map(Number);
      return h * 60 + m;
    };

    const formatTime = (minutes) => {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    };

    const formatDuration = (mins) => {
      if (mins < 60) return `${mins} 分鐘`;
      if (mins % 60 === 0) return `${mins / 60} 小時`;
      return `${mins / 60} 小時`;
    };

    const endTimeOf = (start, duration) => formatTime(toMinutes(start) + duration);

    const filteredAppointments = () =>
      appointments
        .filter((item) => activeVenue === "all" || item.venue === activeVenue)
        .sort((a, b) => a.date.localeCompare(b.date) || toMinutes(a.start) - toMinutes(b.start));

    const appointmentsForDay = (isoDate, venueKey) =>
      appointments.filter(
        (item) =>
          item.date === isoDate &&
          (venueKey === "all" || item.venue === venueKey)
      );

    const countForDay = (isoDate) => appointmentsForDay(isoDate, activeVenue).length;

    const rangesOverlap = (startA, endA, startB, endB) => startA < endB && startB < endA;

    const hasConflict = (venue, date, start, duration) => {
      if (!venue || !date || !start || !duration) return false;
      const startMin = toMinutes(start);
      const endMin = startMin + Number(duration);
      return appointments.some((item) => {
        if (item.venue !== venue || item.date !== date) return false;
        const otherStart = toMinutes(item.start);
        const otherEnd = otherStart + item.duration;
        return rangesOverlap(startMin, endMin, otherStart, otherEnd);
      });
    };

    const bookEndDate = document.querySelector("#book-end-date");
    const repeatToggle = document.querySelector("[data-booking-repeat]");
    const repeatFields = document.querySelectorAll("[data-repeat-fields]");

    const syncRepeatFields = () => {
      const enabled = Boolean(repeatToggle?.checked);
      repeatFields.forEach((el) => {
        el.hidden = !enabled;
      });
      if (bookEndDate) {
        bookEndDate.required = enabled;
        if (!enabled) bookEndDate.value = "";
      }
      if (!enabled) {
        form?.querySelectorAll('input[name="weekday"]').forEach((input) => {
          input.checked = false;
        });
      }
    };

    const updateEndPreview = () => {
      if (!bookEnd || !slotHint) return;
      const start = bookStart?.value;
      const duration = Number(bookDuration?.value || 0);
      const venue = bookVenue?.value;
      const date = bookDate?.value;

      if (!start || !duration) {
        bookEnd.value = "";
        slotHint.textContent = "選擇開始時間與時長後，將顯示預計時段並檢查是否與現有預約重疊。";
        slotHint.classList.remove("is-conflict");
        return;
      }

      const end = endTimeOf(start, duration);
      bookEnd.value = end;
      const conflict = hasConflict(venue, date, start, duration);
      if (conflict) {
        slotHint.textContent = `時段 ${start}–${end} 與現有預約重疊，請改選其他時間或縮短時長。`;
        slotHint.classList.add("is-conflict");
      } else {
        slotHint.textContent = `預計使用時段：${start}–${end}（${formatDuration(duration)}）。同日其他時段仍可供其他組別預約。`;
        slotHint.classList.remove("is-conflict");
      }
    };

    const renderResults = () => {
      if (!results || !resultsBody) return;
      const rows = filteredAppointments();
      results.hidden = false;
      if (resultsTitle) {
        resultsTitle.textContent =
          activeVenue === "all" ? "所有場地預約一覽" : `${venueLabels[activeVenue]} 預約一覽`;
      }
      if (resultsSummary) {
        resultsSummary.textContent = `共 ${rows.length} 筆時段預約（示範資料）`;
      }
      resultsBody.innerHTML = "";
      if (resultsCards) resultsCards.innerHTML = "";
      if (resultsEmpty) resultsEmpty.hidden = rows.length > 0;

      rows.forEach((item) => {
        const timeRange = `${item.start}–${endTimeOf(item.start, item.duration)}`;
        const durationText = formatDuration(item.duration);
        const venueText = venueLabels[item.venue];

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${item.date}</td>
          <td>${timeRange}</td>
          <td>${durationText}</td>
          <td>${venueText}</td>
          <td>${item.purpose}</td>
          <td><span class="booking-status">${item.status}</span></td>
        `;
        resultsBody.appendChild(tr);

        if (resultsCards) {
          const card = document.createElement("article");
          card.className = "booking-result-card";
          card.innerHTML = `
            <div class="booking-result-card__top">
              <strong>${timeRange}</strong>
              <span class="booking-status">${item.status}</span>
            </div>
            <dl class="booking-result-card__meta">
              <div><dt>日期</dt><dd>${item.date}</dd></div>
              <div><dt>時長</dt><dd>${durationText}</dd></div>
              <div><dt>場地</dt><dd>${venueText}</dd></div>
              <div><dt>用途</dt><dd>${item.purpose}</dd></div>
            </dl>
          `;
          resultsCards.appendChild(card);
        }
      });
    };

    const renderDaySlots = (isoDate) => {
      if (!daySlots || !daySlotList) return;
      const items = appointmentsForDay(isoDate, activeVenue).sort(
        (a, b) => toMinutes(a.start) - toMinutes(b.start)
      );
      daySlots.hidden = false;
      if (daySlotsTitle) {
        const venueText = activeVenue === "all" ? "各場地" : venueLabels[activeVenue];
        daySlotsTitle.textContent = `${isoDate}｜${venueText} 時段`;
      }
      daySlotList.innerHTML = "";

      if (!items.length) {
        const li = document.createElement("li");
        li.innerHTML = `<span class="slot-time">全日開放</span><span class="slot-meta">暫無已預約時段，可新增申請</span>`;
        daySlotList.appendChild(li);
        return;
      }

      items.forEach((item) => {
        const li = document.createElement("li");
        li.className = "is-taken";
        li.innerHTML = `
          <span class="slot-time">${item.start}–${endTimeOf(item.start, item.duration)}</span>
          <span class="slot-meta">${venueLabels[item.venue]} · ${item.purpose} · ${formatDuration(item.duration)}</span>
        `;
        daySlotList.appendChild(li);
      });

      const freeHint = document.createElement("li");
      freeHint.innerHTML = `<span class="slot-time">其餘時段</span><span class="slot-meta">可給其他組別申請（請留意勿與上列重疊）</span>`;
      daySlotList.appendChild(freeHint);
    };

    const render = () => {
      if (!grid || !title) return;
      const yearNum = view.getFullYear();
      const month = view.getMonth();
      title.textContent = `${yearNum}年${month + 1}月`;

      [...grid.querySelectorAll("button")].forEach((btn) => btn.remove());

      const firstDow = new Date(yearNum, month, 1).getDay();
      const daysInMonth = new Date(yearNum, month + 1, 0).getDate();

      for (let i = 0; i < firstDow; i += 1) {
        const spacer = document.createElement("button");
        spacer.type = "button";
        spacer.disabled = true;
        spacer.style.visibility = "hidden";
        grid.appendChild(spacer);
      }

      for (let day = 1; day <= daysInMonth; day += 1) {
        const mm = String(month + 1).padStart(2, "0");
        const dd = String(day).padStart(2, "0");
        const iso = `${yearNum}-${mm}-${dd}`;
        const count = countForDay(iso);
        const btn = document.createElement("button");
        btn.type = "button";
        btn.innerHTML = `<strong>${day}</strong>`;
        if (count > 0) {
          btn.classList.add(count >= 3 ? "is-full" : "is-busy");
          btn.innerHTML += `<small>${count} 個時段</small>`;
        }
        if (selectedDay === iso) btn.classList.add("is-selected");

        btn.addEventListener("click", () => {
          selectedDay = iso;
          render();
          renderDaySlots(iso);
          if (panel) {
            panel.hidden = false;
            if (bookDate) bookDate.value = iso;
            if (bookVenue && activeVenue !== "all") bookVenue.value = activeVenue;
            updateEndPreview();
            panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
        });
        grid.appendChild(btn);
      }
    };

    searchBtn?.addEventListener("click", () => {
      activeVenue = venueFilter?.value || "all";
      renderResults();
      render();
      if (selectedDay) renderDaySlots(selectedDay);
      results?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    prev?.addEventListener("click", () => {
      view = new Date(view.getFullYear(), view.getMonth() - 1, 1);
      render();
    });
    next?.addEventListener("click", () => {
      view = new Date(view.getFullYear(), view.getMonth() + 1, 1);
      render();
    });

    addBtn?.addEventListener("click", () => {
      if (!panel) return;
      panel.hidden = false;
      if (bookVenue && activeVenue !== "all") bookVenue.value = activeVenue;
      else if (bookVenue && venueFilter && venueFilter.value !== "all") {
        bookVenue.value = venueFilter.value;
      }
      updateEndPreview();
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    cancelBtn?.addEventListener("click", () => {
      if (panel) panel.hidden = true;
      if (success) success.hidden = true;
      form?.reset();
      syncRepeatFields();
      updateEndPreview();
    });

    repeatToggle?.addEventListener("change", syncRepeatFields);

    [bookStart, bookDuration, bookVenue, bookDate].forEach((el) => {
      el?.addEventListener("change", updateEndPreview);
    });

    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      const venue = bookVenue?.value;
      const date = bookDate?.value;
      const start = bookStart?.value;
      const duration = Number(bookDuration?.value || 0);

      if (repeatToggle?.checked) {
        const weekdays = [...(form?.querySelectorAll('input[name="weekday"]:checked') || [])];
        if (!bookEndDate?.value) {
          bookEndDate?.focus();
          return;
        }
        if (weekdays.length === 0) {
          if (slotHint) {
            slotHint.textContent = "重覆借用請至少選擇一個星期。";
            slotHint.classList.add("is-conflict");
          }
          return;
        }
      }

      if (hasConflict(venue, date, start, duration)) {
        updateEndPreview();
        return;
      }
      if (success) success.hidden = false;
    });

    syncRepeatFields();
    render();
  }
})();
