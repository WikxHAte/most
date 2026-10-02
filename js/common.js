(function () {
  const data = window.MOST;
  const numFmt = new Intl.NumberFormat("ru-RU");
  const rateFmt = new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  const TELEGRAM_URL = "https://t.me/wiKxhaTe";
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
    BMW: "#121b2a",
    "Mercedes-Benz": "#1c1c1f",
  };

  function esc(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function rub(n) {
    return numFmt.format(n) + " ₽";
  }

  function cny(n) {
    return numFmt.format(n) + " ¥";
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
    return numFmt.format(car.mileageKm) + " км";
  }

  function carTitle(car) {
    return car.brand + " " + car.model;
  }

  function brands() {
    return [...new Set(data.cars.map((car) => car.brand))].sort((a, b) => a.localeCompare(b, "ru"));
  }

  function models(brand) {
    return [...new Set(data.cars.filter((car) => car.brand === brand).map((car) => car.model))].sort(
      (a, b) => a.localeCompare(b, "ru", { numeric: true })
    );
  }

  function catalogUrl(brand, model) {
    const params = new URLSearchParams();
    if (brand) params.set("brand", brand);
    if (brand && model) params.set("model", model);
    const query = params.toString();
    return "catalog.html" + (query ? "?" + query : "");
  }

  function carUrl(car) {
    return "car.html?id=" + encodeURIComponent(car.id);
  }

  function cardHtml(car) {
    const tone = TONE[car.brand] || "#171512";
    return `<a class="card" href="${esc(carUrl(car))}">
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
    </a>`;
  }

  function fillSelect(select, values, placeholder) {
    select.innerHTML =
      `<option value="">${esc(placeholder)}</option>` +
      values.map((value) => `<option value="${esc(value)}">${esc(value)}</option>`).join("");
  }

  function crumbsHtml(items) {
    return items
      .map((item, index) => {
        const last = index === items.length - 1;
        if (last || !item.href) return `<span${last ? ' aria-current="page"' : ""}>${esc(item.label)}</span>`;
        return `<a href="${esc(item.href)}">${esc(item.label)}</a>`;
      })
      .join('<span class="crumb-sep" aria-hidden="true">/</span>');
  }

  document.querySelectorAll("[data-copy]").forEach((button) => {
    const label = button.textContent;
    button.addEventListener("click", async () => {
      const text = button.dataset.copy;
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const input = document.createElement("textarea");
        input.value = text;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        input.remove();
      }
      button.textContent = "Скопировано";
      setTimeout(() => {
        button.textContent = label;
      }, 2000);
    });
  });

  window.MOST_UI = {
    data,
    TELEGRAM_URL,
    BODY,
    BODY_ORDER,
    TONE,
    esc,
    rub,
    cny,
    rateFmt,
    chinaRub,
    turnkey,
    carsWord,
    conditionLabel,
    mileageLabel,
    carTitle,
    brands,
    models,
    catalogUrl,
    carUrl,
    cardHtml,
    fillSelect,
    crumbsHtml,
  };
})();
