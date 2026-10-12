(() => {
  const form = document.querySelector("[data-booking-form]");
  const slotsHost = document.querySelector("[data-booking-slots]");
  const addBtn = document.querySelector("[data-add-slot]");
  const alertEl = document.querySelector("[data-booking-alert]");
  const optionsEl = document.querySelector("[data-venue-options]");
  const todayInput = form?.querySelector("[data-today-default]");
  const MAX_SLOTS = 3;

  if (!form || !slotsHost) return;

  if (todayInput && !todayInput.value) {
    const today = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    todayInput.value = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  }

  if (optionsEl && window.DEMO_VENUES?.rooms) {
    optionsEl.innerHTML = window.DEMO_VENUES.rooms
      .map((room) => `<option value="${room.name}"></option>`)
      .concat('<option value="一樓禮堂"></option>')
      .join("");
  }

  const syncTotal = () => {
    const totalEl = form.querySelector("[data-donation-total]");
    const donationInputs = [...form.querySelectorAll("[data-donation]")];
    const total = donationInputs.reduce((sum, input) => {
      const value = Number(input.value);
      return sum + (Number.isFinite(value) ? value : 0);
    }, 0);
    if (totalEl) totalEl.value = String(total);
  };

  const reindexSlots = () => {
    const slots = [...slotsHost.querySelectorAll("[data-booking-slot]")];
    slots.forEach((slot, index) => {
      const n = index + 1;
      slot.dataset.slotIndex = String(n);

      const title = slot.querySelector("[data-slot-title]");
      if (title) {
        title.innerHTML =
          n === 1
            ? `時段 ${n} <span class="req">*</span>`
            : `時段 ${n} <span class="booking-optional">選填</span>`;
      }

      const labels = slot.querySelectorAll(".row.g-3 .form-label");
      const dateInput = slot.querySelector("[data-slot-date]");
      const timeInput = slot.querySelector("[data-slot-time]");
      const venueInput = slot.querySelector("[data-slot-venue]");
      const donationInput = slot.querySelector("[data-donation]");
      const removeBtn = slot.querySelector("[data-remove-slot]");

      if (dateInput) {
        dateInput.id = `slot-date-${n}`;
        dateInput.name = n === 1 ? "eventDate" : `slotDate${n}`;
        dateInput.required = n === 1;
        labels[0]?.setAttribute("for", dateInput.id);
      }
      if (timeInput) {
        timeInput.id = `slot-time-${n}`;
        timeInput.name = `slotTime${n}`;
        timeInput.required = n === 1;
        labels[1]?.setAttribute("for", timeInput.id);
      }
      if (venueInput) {
        venueInput.id = `slot-venue-${n}`;
        venueInput.name = `slotVenue${n}`;
        venueInput.required = n === 1;
        labels[2]?.setAttribute("for", venueInput.id);
      }
      if (donationInput) {
        donationInput.id = `slot-donation-${n}`;
        donationInput.name = `slotDonation${n}`;
        labels[3]?.setAttribute("for", donationInput.id);
      }
      if (removeBtn) removeBtn.hidden = n === 1;
    });

    if (addBtn) {
      addBtn.disabled = slots.length >= MAX_SLOTS;
      addBtn.innerHTML =
        slots.length >= MAX_SLOTS
          ? "已達最多 3 個時段"
          : '<i class="fa-solid fa-plus" aria-hidden="true"></i> 新增時段';
    }

    syncTotal();
  };

  const slotTemplate = (n) => `
    <div class="booking-slot" data-booking-slot data-slot-index="${n}">
      <div class="booking-slot-head">
        <h4 data-slot-title>時段 ${n} <span class="booking-optional">選填</span></h4>
        <button type="button" class="c-btn c-btn--outline c-btn--sm" data-remove-slot>
          <i class="fa-solid fa-trash-can" aria-hidden="true"></i> 移除此時段
        </button>
      </div>

      <div class="venue-availability venue-availability--embedded">
        <div class="avail-toolbar">
          <label class="venue-field avail-venue-field">
            <span>場地檔期一覽</span>
            <select data-avail-venue></select>
          </label>
          <div class="avail-legend">
            <span><i class="avail-dot is-available" aria-hidden="true"></i> 可申請</span>
            <span><i class="avail-dot is-reserved" aria-hidden="true"></i> 已預約</span>
            <span><i class="avail-dot is-pending" aria-hidden="true"></i> 審批中</span>
          </div>
        </div>

        <div class="avail-venue-info" data-avail-venue-info></div>

        <div class="avail-layout">
          <div class="avail-board">
            <div class="calendar-toolbar">
              <h3 data-avail-title>月曆</h3>
              <div class="calendar-nav">
                <button type="button" class="c-btn c-btn--outline c-btn--sm" data-avail-prev aria-label="上一個月">
                  <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
                </button>
                <button type="button" class="c-btn c-btn--outline c-btn--sm" data-avail-today>今天</button>
                <button type="button" class="c-btn c-btn--outline c-btn--sm" data-avail-next aria-label="下一個月">
                  <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
                </button>
              </div>
            </div>
            <div class="avail-grid" data-avail-grid></div>
          </div>

          <aside class="avail-detail" data-avail-detail aria-live="polite">
            <h3 data-avail-detail-date>選擇日期</h3>
            <div class="avail-detail-list" data-avail-detail-list></div>
            <button type="button" class="c-btn c-btn--primary c-btn--sm avail-book-btn" data-avail-apply>
              套用至此時段
            </button>
          </aside>
        </div>
      </div>

      <div class="row g-3">
        <div class="col-md-6 col-lg-3">
          <label class="form-label" for="slot-date-${n}">借用日期</label>
          <input class="form-control" id="slot-date-${n}" name="slotDate${n}" type="date" data-slot-date />
        </div>
        <div class="col-md-6 col-lg-3">
          <label class="form-label" for="slot-time-${n}">借用時間</label>
          <input class="form-control" id="slot-time-${n}" name="slotTime${n}" type="text" placeholder="例如：14:00–16:00" data-slot-time />
        </div>
        <div class="col-md-6 col-lg-3">
          <label class="form-label" for="slot-venue-${n}">借用場地</label>
          <input class="form-control" id="slot-venue-${n}" name="slotVenue${n}" type="text" list="venue-options" placeholder="場地名稱或房間編號" data-slot-venue />
        </div>
        <div class="col-md-6 col-lg-3">
          <label class="form-label" for="slot-donation-${n}">借用場地奉獻 ($)</label>
          <input class="form-control booking-donation" id="slot-donation-${n}" name="slotDonation${n}" type="number" min="0" step="1" data-donation />
        </div>
      </div>
    </div>
  `;

  addBtn?.addEventListener("click", () => {
    const count = slotsHost.querySelectorAll("[data-booking-slot]").length;
    if (count >= MAX_SLOTS) return;

    const n = count + 1;
    slotsHost.insertAdjacentHTML("beforeend", slotTemplate(n));
    const newSlot = slotsHost.querySelector("[data-booking-slot]:last-child");
    window.DEMO_initSlotCalendar?.(newSlot, { autoApply: false });
    reindexSlots();
    newSlot?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  slotsHost.addEventListener("click", (event) => {
    const removeBtn = event.target.closest("[data-remove-slot]");
    if (!removeBtn) return;
    const slot = removeBtn.closest("[data-booking-slot]");
    if (!slot || slot.dataset.slotIndex === "1") return;
    slot.remove();
    reindexSlots();
  });

  form.addEventListener("input", (event) => {
    if (event.target.matches("[data-donation]")) syncTotal();
  });

  form.addEventListener("reset", () => {
    window.setTimeout(() => {
      [...slotsHost.querySelectorAll("[data-booking-slot]")].forEach((slot, index) => {
        if (index > 0) slot.remove();
      });
      const first = slotsHost.querySelector("[data-booking-slot]");
      if (first) {
        first.dataset.availReady = "0";
        window.DEMO_initSlotCalendar?.(first, { autoApply: false });
      }
      reindexSlots();
      if (alertEl) {
        alertEl.hidden = true;
        alertEl.textContent = "";
      }
      if (todayInput) {
        const today = new Date();
        const pad = (n) => String(n).padStart(2, "0");
        todayInput.value = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
      }
    }, 0);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    syncTotal();

    if (alertEl) {
      alertEl.hidden = false;
      alertEl.className = "booking-alert is-success";
      alertEl.textContent =
        "申請已記錄（原型示範）。正式網站將會把資料送交本堂跟進，同工稍後與你聯絡確認。";
    }

    form.scrollIntoView({ behavior: "smooth", block: "end" });
  });

  reindexSlots();
})();
