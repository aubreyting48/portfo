(() => {
  const data = window.DEMO_VENUES;
  if (!data) return;

  const grid = document.querySelector("[data-venue-grid]");
  const countEl = document.querySelector("[data-venue-count]");
  const emptyEl = document.querySelector("[data-venue-empty]");
  const form = document.querySelector("[data-venue-filters]");
  const resetBtn = document.querySelector("[data-venue-reset]");
  const sanctuaryEl = document.querySelector("[data-venue-sanctuary]");

  if (!grid || !form) return;

  const money = (n) => `$${Number(n).toLocaleString("en-HK")}`;

  const getFilters = () => {
    const fd = new FormData(form);
    return {
      q: String(fd.get("q") || "").trim().toLowerCase(),
      category: String(fd.get("category") || ""),
      capacityMin: Number(fd.get("capacityMin") || 0),
      priceMax: Number(fd.get("priceMax") || 0),
      rate: String(fd.get("rate") || "general"),
      externalOnly: fd.get("externalOnly") === "on",
      sort: String(fd.get("sort") || "name"),
    };
  };

  const priceOf = (room, rate) =>
    rate === "christian" ? room.priceChristian : room.priceHour;

  const matches = (room, f) => {
    if (f.q) {
      const hay = `${room.name} ${room.category} ${room.note}`.toLowerCase();
      if (!hay.includes(f.q)) return false;
    }
    if (f.category && room.category !== f.category) return false;
    if (f.capacityMin > 0) {
      // Room must be able to hold at least this many people.
      if (!room.capacityMax || room.capacityMax < f.capacityMin) return false;
    }
    if (f.priceMax > 0 && priceOf(room, f.rate) > f.priceMax) return false;
    if (f.externalOnly && room.externalOk === false) return false;
    return true;
  };

  const sortRooms = (rooms, f) => {
    const sorted = [...rooms];
    sorted.sort((a, b) => {
      if (f.sort === "price-asc") return priceOf(a, f.rate) - priceOf(b, f.rate);
      if (f.sort === "price-desc") return priceOf(b, f.rate) - priceOf(a, f.rate);
      if (f.sort === "capacity-asc") return (a.capacityMax || 0) - (b.capacityMax || 0);
      if (f.sort === "capacity-desc") return (b.capacityMax || 0) - (a.capacityMax || 0);
      return a.name.localeCompare(b.name, "zh-Hant");
    });
    return sorted;
  };

  const cardHtml = (room, f) => {
    const price = priceOf(room, f.rate);
    const alt =
      f.rate === "christian"
        ? `一般借場 ${money(room.priceHour)}／小時`
        : `基督教團體 ${money(room.priceChristian)}／小時`;
    const bookingUrl = `venue-booking.html?venue=${encodeURIComponent(room.name)}&venueId=${encodeURIComponent(room.id)}#venue-availability`;

    return `
      <article class="venue-card" data-category="${room.category}">
        <div class="venue-card-top">
          <span class="venue-card-tag">${room.category}</span>
          ${room.externalOk === false ? '<span class="venue-card-badge">原則上不外借</span>' : ""}
        </div>
        <h3>${room.name}</h3>
        <ul class="venue-card-facts">
          <li>
            <i class="fa-solid fa-users" aria-hidden="true"></i>
            <span><strong>容納人數</strong>${room.capacityLabel}</span>
          </li>
          <li>
            <i class="fa-solid fa-clock" aria-hidden="true"></i>
            <span><strong>${f.rate === "christian" ? "團體優惠" : "借場費用"}</strong>${money(price)}／小時</span>
          </li>
          <li>
            <i class="fa-solid fa-tag" aria-hidden="true"></i>
            <span><strong>另一收費</strong>${alt}</span>
          </li>
        </ul>
        ${room.note ? `<p class="venue-card-note">${room.note}</p>` : ""}
        <div class="venue-card-actions">
          <a class="c-btn c-btn--outline c-btn--sm" href="${bookingUrl}">查看檔期</a>
          <a class="c-btn c-btn--primary c-btn--sm" href="${bookingUrl}">立即申請</a>
        </div>
      </article>
    `;
  };

  const render = () => {
    const f = getFilters();
    const filtered = sortRooms(data.rooms.filter((room) => matches(room, f)), f);

    if (countEl) {
      countEl.textContent = `顯示 ${filtered.length} / ${data.rooms.length} 個場地`;
    }

    if (!filtered.length) {
      grid.innerHTML = "";
      if (emptyEl) emptyEl.hidden = false;
      return;
    }

    if (emptyEl) emptyEl.hidden = true;
    grid.innerHTML = filtered.map((room) => cardHtml(room, f)).join("");
  };

  const renderSanctuary = () => {
    if (!sanctuaryEl || !data.sanctuary) return;
    const s = data.sanctuary;
    sanctuaryEl.innerHTML = `
      <div class="venue-sanctuary-head">
        <h2>${s.name}</h2>
        <p>基本收費包括禮堂、空調、三角鋼琴、音響控制及清潔（首兩小時）。</p>
      </div>
      <div class="venue-sanctuary-grid">
        ${s.packages
          .map(
            (pkg) => `
          <article class="venue-card venue-card--package">
            <div class="venue-card-top">
              <span class="venue-card-tag">婚禮借堂</span>
            </div>
            <h3>${pkg.audience}</h3>
            <p class="venue-package-price">${money(pkg.base)}<span>／${pkg.baseNote}</span></p>
            <ul class="venue-card-facts">
              <li><i class="fa-solid fa-music" aria-hidden="true"></i><span><strong>電子琴</strong>${money(pkg.keyboard)}／兩小時</span></li>
              <li><i class="fa-solid fa-drum" aria-hidden="true"></i><span><strong>電子鼓</strong>${money(pkg.drums)}／兩小時</span></li>
              <li><i class="fa-solid fa-hourglass-half" aria-hidden="true"></i><span><strong>逾時</strong>${money(pkg.overtime)}／小時</span></li>
              <li><i class="fa-solid fa-shield-halved" aria-hidden="true"></i><span><strong>按金</strong>${money(pkg.deposit)}</span></li>
              <li><i class="fa-solid fa-calendar-day" aria-hidden="true"></i><span><strong>公眾假期附加</strong>${money(pkg.holidaySurcharge)}</span></li>
            </ul>
            <div class="venue-card-actions">
              <a class="c-btn c-btn--outline c-btn--sm" href="venue-booking.html?venue=${encodeURIComponent("一樓禮堂")}&venueId=sanctuary#venue-availability">查看檔期</a>
              <a class="c-btn c-btn--primary c-btn--sm" href="venue-booking.html?venue=${encodeURIComponent("一樓禮堂")}&venueId=sanctuary#venue-availability">立即申請</a>
            </div>
          </article>
        `
          )
          .join("")}
      </div>
      <ul class="venue-extra-notes">
        ${s.extraNotes.map((n) => `<li>${n}</li>`).join("")}
      </ul>
    `;
  };

  form.addEventListener("input", render);
  form.addEventListener("change", render);
  resetBtn?.addEventListener("click", () => {
    form.reset();
    render();
  });

  render();
  renderSanctuary();
})();
