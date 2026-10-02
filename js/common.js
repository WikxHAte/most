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

  function carImage(car) {
    return "img/" + encodeURIComponent(car.id) + ".jpg";
  }

  function cardHtml(car) {
    return `<a class="card" href="${esc(carUrl(car))}">
      <span class="visual">
        <img src="${esc(carImage(car))}" alt="${esc(carTitle(car))}" loading="lazy" onerror="this.remove()" />
        <span class="badge ${car.condition}">${esc(conditionLabel(car))}</span>
      </span>
      <span class="card-body">
        <span class="kicker">${esc(car.brand)} · ${car.year} · ${esc(mileageLabel(car))}</span>
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

  function initRequestForm(carLine) {
    const form = document.getElementById("request-form");
    const formError = document.getElementById("form-error");
    const formSuccess = document.getElementById("form-success");
    const nameInput = document.getElementById("client-name");
    const phoneInput = document.getElementById("client-phone");

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = nameInput.value.trim();
      const phone = phoneInput.value.trim();
      const city = document.getElementById("city").value;
      const comment = document.getElementById("comment").value.trim();

      if (name.length < 2) {
        formError.textContent = "Напишите, как к вам обращаться.";
        nameInput.focus();
        return;
      }
      if (phone.replace(/\D/g, "").length < 10) {
        formError.textContent = "Нужен телефон: не меньше 10 цифр.";
        phoneInput.focus();
        return;
      }

      formError.textContent = "";
      form.hidden = true;
      formSuccess.hidden = false;
      formSuccess.innerHTML = `<h3>Заявка собрана</h3>
        <p>На сервер она не уходит: это витрина без приёма заявок. Отправьте эти данные в
          <a href="${TELEGRAM_URL}" target="_blank" rel="noopener">Telegram менеджера</a> — так заявка точно дойдёт.</p>
        <dl class="spec-list">
          <div><dt>Имя</dt><dd>${esc(name)}</dd></div>
          <div><dt>Телефон</dt><dd>${esc(phone)}</dd></div>
          <div><dt>Автомобиль</dt><dd>${esc(carLine())}</dd></div>
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
      nameInput.focus();
    });
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
    carImage,
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
    initRequestForm,
  };
})();
