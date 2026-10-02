(function () {
  const ui = window.MOST_UI;
  const data = ui.data;
  const esc = ui.esc;

  const id = new URLSearchParams(window.location.search).get("id");
  const car = data.cars.find((item) => item.id === id);
  const root = document.getElementById("car-root");
  const crumbsEl = document.getElementById("crumbs");

  if (!car) {
    crumbsEl.innerHTML = ui.crumbsHtml([
      { label: "Главная", href: "index.html" },
      { label: "Каталог", href: "catalog.html" },
      { label: "Автомобиль не найден" },
    ]);
    root.innerHTML = `<div class="page-head">
      <h1>Автомобиль не найден</h1>
      <p class="lede">Возможно, его уже продали или ссылка устарела.</p>
      <div class="hero-actions"><a class="primary" href="catalog.html">Перейти в каталог</a></div>
    </div>`;
    document.getElementById("request").hidden = true;
    document.getElementById("similar-wrap").hidden = true;
    return;
  }

  const title = ui.carTitle(car);
  document.title = `${title} ${car.year} из Китая под ключ — МОСТ`;
  crumbsEl.innerHTML = ui.crumbsHtml([
    { label: "Главная", href: "index.html" },
    { label: "Каталог", href: "catalog.html" },
    { label: car.brand, href: ui.catalogUrl(car.brand) },
    { label: car.model, href: ui.catalogUrl(car.brand, car.model) },
    { label: car.trim },
  ]);

  const specs = [
    ["Состояние", ui.conditionLabel(car)],
    ["Пробег", ui.mileageLabel(car)],
    ["Год", String(car.year)],
    ["Кузов", ui.BODY[car.body]],
    ["Двигатель", car.engine],
    ["Топливо", car.fuel],
    ["Привод", car.drive],
    ["Коробка", car.gear],
    ["Цвет", car.color],
    ["Где стоит", car.city],
  ];
  if (car.rangeNote) specs.push(["Запас хода", car.rangeNote]);

  root.innerHTML = `<section class="car-hero">
      <div class="car-visual">
        <img src="${esc(ui.carImage(car))}" alt="${esc(title)}" onerror="this.remove()" />
        <span class="badge ${car.condition}">${esc(ui.conditionLabel(car))}</span>
      </div>
      <div class="car-summary">
        <p class="eyebrow">${esc(car.brand)} · ${esc(ui.BODY[car.body])}</p>
        <h1>${esc(title)}</h1>
        <p class="trim">${esc(car.trim)} · ${car.year} · ${esc(ui.mileageLabel(car))}</p>
        <ul class="points">${car.points.map((point) => `<li>${esc(point)}</li>`).join("")}</ul>
        <p class="price-big">${esc(ui.rub(ui.turnkey(car)))}</p>
        <p class="price-note">под ключ до Владивостока · ${esc(ui.cny(car.priceCny))} в Китае</p>
        <div class="car-actions">
          <a class="primary" href="#request">Оставить заявку</a>
          <a class="ghost" href="${ui.TELEGRAM_URL}" target="_blank" rel="noopener">Написать менеджеру в Telegram</a>
        </div>
      </div>
    </section>
    <section class="section car-details">
      <div>
        <h2>Характеристики</h2>
        <dl class="spec-list">
          ${specs.map(([label, value]) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join("")}
        </dl>
      </div>
      <div>
        <h2>Из чего цена</h2>
        <div class="breakdown">
          <div><span>Цена в Китае</span><b>${esc(ui.cny(car.priceCny))}</b></div>
          <div><span>В рублях, курс ${esc(ui.rateFmt.format(data.rate))}</span><b>${esc(ui.rub(ui.chinaRub(car)))}</b></div>
          <div><span>Логистика до Владивостока</span><b>${esc(ui.rub(car.logisticsRub))}</b></div>
          <div><span>Таможня и сборы, ориентир</span><b>${esc(ui.rub(car.feesRub))}</b></div>
          <div class="total"><span>Под ключ до Владивостока</span><b>${esc(ui.rub(ui.turnkey(car)))}</b></div>
        </div>
        <p class="hint">До Москвы ещё ${esc(ui.rub(data.moscowExtraRub))}. Не оферта: курс, утильсбор и комплектация на дату выпуска сумму изменят.</p>
      </div>
    </section>`;

  document.getElementById("request-title").textContent = "Заявка на " + title;

  const similar = data.cars
    .filter((item) => item.id !== car.id)
    .map((item) => ({
      item,
      score: (item.brand === car.brand ? 2 : 0) + (item.body === car.body ? 1 : 0),
      gap: Math.abs(ui.turnkey(item) - ui.turnkey(car)),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.gap - b.gap)
    .slice(0, 3)
    .map((entry) => entry.item);
  if (similar.length) {
    document.getElementById("similar").innerHTML = similar.map(ui.cardHtml).join("");
  } else {
    document.getElementById("similar-wrap").hidden = true;
  }

  ui.initRequestForm(() => `${title}, ${car.year}`);
})();
