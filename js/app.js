(function () {
  const data = window.MOST;
  const rubFmt = new Intl.NumberFormat("ru-RU");
  const rateFmt = new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  const BODY = {
    sedan: "Седан",
    liftback: "Лифтбек",
    crossover: "Кроссовер",
    suv: "Внедорожник",
    minivan: "Минивэн",
  };
  const BODY_ORDER = ["sedan", "liftback", "crossover", "suv", "minivan"];
  const TONE = {
    BYD: "#13241f",
    Geely: "#152033",
    Chery: "#2a1414",
    Tank: "#1c2218",
    "Li Auto": "#241c14",
    Zeekr: "#1a1a1a",
    Changan: "#141c2e",
    Exeed: "#241820",
    Toyota: "#2a1614",
    Hongqi: "#2a1216",
    Voyah: "#17141f",
  };

  const state = {
    condition: "all",
    brand: "all",
    body: "all",
    sort: "turnkey-asc",
    q: "",
  };

  const grid = document.getElementById("catalog-grid");
  const countEl = document.getElementById("result-count");
  const emptyEl = document.getElementById("catalog-empty");
  const dialog = document.getElementById("car-dialog");
  const form = document.getElementById("request-form");
  const formError = document.getElementById("form-error");
  const formSuccess = document.getElementById("form-success");

  function esc(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function rub(n) {
    return rubFmt.format(n) + " ₽";
  }

  function cny(n) {
    return rubFmt.format(n) + " ¥";
  }

  function chinaRub(car) {
    return Math.round(car.priceCny * data.rate);
  }

  function turnkey(car) {
    return chinaRub(car) + car.logisticsRub + car.feesRub;
  }

  function carsWord(n) {
    const n10 = n % 10;
    const n100 = n % 100;
    if (n10 === 1 && n100 !== 11) return "автомобиль";
    if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return "автомобиля";
    return "автомобилей";
  }

  function conditionLabel(car) {
    return car.condition === "new" ? "Новый" : "С пробегом";
  }

  function mileageLabel(car) {
    if (car.condition === "new" && car.mileageKm === 0) return "Без пробега";
    return rubFmt.format(car.mileageKm) + " км";
  }

  function carTitle(car) {
    return car.brand + " " + car.model;
  }

  function filtered() {
    const q = state.q.trim().toLowerCase();
    const list = data.cars.filter((car) => {
      if (state.condition !== "all" && car.condition !== state.condition) return false;
      if (state.brand !== "all" && car.brand !== state.brand) return false;
      if (state.body !== "all" && car.body !== state.body) return false;
      if (!q) return true;
      const hay = [car.brand, car.model, car.trim, car.fuel, car.city, BODY[car.body]]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });

    const dir = state.sort.endsWith("asc") ? 1 : -1;
    list.sort((a, b) => {
      if (state.sort.startsWith("year")) return (a.year - b.year) * dir;
      if (state.sort.startsWith("mileage")) return (a.mileageKm - b.mileageKm) * dir;
      return (turnkey(a) - turnkey(b)) * dir;
    });
    return list;
  }

  function fillFilters() {
    const brand = document.getElementById("brand");
    const brands = [...new Set(data.cars.map((car) => car.brand))].sort((a, b) =>
      a.localeCompare(b, "ru")
    );
    brand.innerHTML =
      `<option value="all">Все бренды</option>` +
      brands.map((name) => `<option value="${esc(name)}">${esc(name)}</option>`).join("");

    const bodies = BODY_ORDER.filter((key) => data.cars.some((car) => car.body === key));
    document.getElementById("body").innerHTML =
      `<option value="all">Любой кузов</option>` +
      bodies.map((key) => `<option value="${key}">${BODY[key]}</option>`).join("");

    const select = document.getElementById("car-select");
    const options = data.cars
      .slice()
      .sort((a, b) => carTitle(a).localeCompare(carTitle(b), "ru"))
      .map(
        (car) =>
          `<option value="${esc(car.id)}">${esc(carTitle(car))}, ${car.year} — ${esc(rub(turnkey(car)))}</option>`
      )
      .join("");
    select.insertAdjacentHTML("beforeend", options);
  }

  function renderHero() {
    const prices = data.cars.map(turnkey);
    const min = Math.min(...prices);
    document.getElementById("stat-count").textContent = String(data.cars.length);
    document.getElementById("stat-min").textContent = "от " + rub(min);
    document.getElementById("rate-value").textContent = rateFmt.format(data.rate) + " ₽";
    document.getElementById("as-of").textContent = data.asOf;
    document.getElementById("moscow-extra").textContent = rub(data.moscowExtraRub);

    const featured = data.cars.filter((car) => car.featured);
    document.getElementById("featured").innerHTML = featured
      .map((car) => {
        return `<button type="button" class="feature" data-id="${esc(car.id)}">
          <span>${esc(carTitle(car))}</span>
          <span>${esc(rub(turnkey(car)))}</span>
          <small>${esc(conditionLabel(car))} · ${car.year}</small>
        </button>`;
      })
      .join("");
  }

  function render() {
    const cars = filtered();
    countEl.textContent =
      cars.length === data.cars.length
        ? `В каталоге ${cars.length} ${carsWord(cars.length)}`
        : `Показано ${cars.length} ${carsWord(cars.length)} из ${data.cars.length}`;

    emptyEl.hidden = cars.length !== 0;
    grid.innerHTML = cars
      .map((car) => {
        const tone = TONE[car.brand] || "#171512";
        return `<article class="card">
          <button type="button" class="card-open" data-id="${esc(car.id)}">
            <span class="visual" style="background:${tone}">
              <span class="badge ${car.condition}">${esc(conditionLabel(car))}</span>
              <span class="visual-brand">${esc(car.brand)}</span>
              <span class="visual-meta">${esc(BODY[car.body])} · ${esc(car.city)}</span>
            </span>
            <span class="card-body">
              <span class="kicker">${car.year} · ${esc(mileageLabel(car))}</span>
              <span class="model">${esc(car.model)}</span>
              <span class="trim">${esc(car.trim)} · ${esc(car.fuel)} · ${esc(car.drive)}</span>
              <span class="card-foot">
                <span class="price">${esc(rub(turnkey(car)))}</span>
                <span class="price-note">под ключ до Владивостока</span>
                <span class="price-cny">${esc(cny(car.priceCny))} в Китае</span>
              </span>
            </span>
          </button>
        </article>`;
      })
      .join("");
  }

  function openCar(id) {
    const car = data.cars.find((item) => item.id === id);
    if (!car) return;
    dialog.dataset.carId = car.id;
    const rows = [
      ["Состояние", conditionLabel(car)],
      ["Пробег", mileageLabel(car)],
      ["Кузов", BODY[car.body]],
      ["Двигатель", car.engine],
      ["Привод", car.drive],
      ["Коробка", car.gear],
      ["Цвет", car.color],
      ["Где стоит", car.city],
    ];
    if (car.rangeNote) rows.push(["Запас хода", car.rangeNote]);

    dialog.innerHTML = `<div class="dialog-card">
      <div class="dialog-top">
        <p class="kicker">${esc(car.brand)} · ${esc(BODY[car.body])}</p>
        <button type="button" class="btn-text" data-close>Закрыть</button>
      </div>
      <h2 id="dialog-title">${esc(carTitle(car))}</h2>
      <p class="trim">${esc(car.trim)} · ${car.year}</p>
      <ul class="points">
        ${car.points.map((point) => `<li>${esc(point)}</li>`).join("")}
      </ul>
      <dl class="spec-list">
        ${rows
          .map(
            ([label, value]) =>
              `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`
          )
          .join("")}
      </dl>
      <div class="breakdown">
        <div><span>Цена в Китае</span><b>${esc(cny(car.priceCny))}</b></div>
        <div><span>В рублях, курс ${esc(rateFmt.format(data.rate))}</span><b>${esc(rub(chinaRub(car)))}</b></div>
        <div><span>Логистика до Владивостока</span><b>${esc(rub(car.logisticsRub))}</b></div>
        <div><span>Таможня и сборы, ориентир</span><b>${esc(rub(car.feesRub))}</b></div>
        <div class="total"><span>Под ключ до Владивостока</span><b>${esc(rub(turnkey(car)))}</b></div>
      </div>
      <p class="hint">До Москвы в этом ориентире ещё ${esc(rub(data.moscowExtraRub))}. Не оферта: курс, утильсбор и комплектация на дату выпуска сумму изменят.</p>
      <button type="button" class="primary" data-request>Заявка на ${esc(carTitle(car))}</button>
    </div>`;
    dialog.showModal();
  }

  function selectForRequest(id) {
    form.hidden = false;
    formSuccess.hidden = true;
    document.getElementById("car-select").value = id || "";
    const request = document.getElementById("request");
    request.scrollIntoView({ behavior: "smooth", block: "start" });
    document.getElementById("client-name").focus();
  }

  function resetFilters() {
    state.condition = "all";
    state.brand = "all";
    state.body = "all";
    state.sort = "turnkey-asc";
    state.q = "";
    document.getElementById("q").value = "";
    document.getElementById("brand").value = "all";
    document.getElementById("body").value = "all";
    document.getElementById("sort").value = "turnkey-asc";
    document.querySelectorAll("[data-condition]").forEach((button) => {
      button.setAttribute("aria-pressed", button.dataset.condition === "all" ? "true" : "false");
    });
    render();
  }

  document.querySelectorAll("[data-condition]").forEach((button) => {
    button.addEventListener("click", () => {
      state.condition = button.dataset.condition;
      document.querySelectorAll("[data-condition]").forEach((item) => {
        item.setAttribute("aria-pressed", item === button ? "true" : "false");
      });
      render();
    });
  });

  document.getElementById("q").addEventListener("input", (event) => {
    state.q = event.target.value;
    render();
  });
  document.getElementById("brand").addEventListener("change", (event) => {
    state.brand = event.target.value;
    render();
  });
  document.getElementById("body").addEventListener("change", (event) => {
    state.body = event.target.value;
    render();
  });
  document.getElementById("sort").addEventListener("change", (event) => {
    state.sort = event.target.value;
    render();
  });
  document.getElementById("reset-filters").addEventListener("click", resetFilters);

  document.getElementById("featured").addEventListener("click", (event) => {
    const button = event.target.closest("[data-id]");
    if (button) openCar(button.dataset.id);
  });
  grid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-id]");
    if (button) openCar(button.dataset.id);
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
    if (event.target.closest("[data-close]")) dialog.close();
    if (event.target.closest("[data-request]")) {
      const id = dialog.dataset.carId;
      dialog.close();
      selectForRequest(id);
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("client-name").value.trim();
    const phone = document.getElementById("client-phone").value.trim();
    const digits = phone.replace(/\D/g, "");
    const carId = document.getElementById("car-select").value;
    const city = document.getElementById("city").value;
    const comment = document.getElementById("comment").value.trim();

    if (name.length < 2) {
      formError.textContent = "Напишите, как к вам обращаться.";
      document.getElementById("client-name").focus();
      return;
    }
    if (digits.length < 10) {
      formError.textContent = "Нужен телефон: не меньше 10 цифр.";
      document.getElementById("client-phone").focus();
      return;
    }

    formError.textContent = "";
    const car = data.cars.find((item) => item.id === carId);
    const carLine = car ? `${carTitle(car)}, ${car.year}` : "Пока не выбрал";
    form.hidden = true;
    formSuccess.hidden = false;
    formSuccess.innerHTML = `<h3>Заявка собрана</h3>
      <p>На сервер она не уходит: это витрина без приёма заявок. Ниже то, что вы ввели.</p>
      <dl class="spec-list">
        <div><dt>Имя</dt><dd>${esc(name)}</dd></div>
        <div><dt>Телефон</dt><dd>${esc(phone)}</dd></div>
        <div><dt>Автомобиль</dt><dd>${esc(carLine)}</dd></div>
        <div><dt>Город</dt><dd>${esc(city)}</dd></div>
        ${comment ? `<div><dt>Комментарий</dt><dd>${esc(comment)}</dd></div>` : ""}
      </dl>
      <button type="button" class="primary" id="another">Новая заявка</button>`;
  });

  formSuccess.addEventListener("click", (event) => {
    if (event.target.id !== "another") return;
    form.reset();
    form.hidden = false;
    formSuccess.hidden = true;
    document.getElementById("client-name").focus();
  });

  fillFilters();
  renderHero();
  render();
})();
