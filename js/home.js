(function () {
  const ui = window.MOST_UI;
  const data = ui.data;

  const picker = document.getElementById("picker");
  const brandSelect = document.getElementById("pick-brand");
  const modelSelect = document.getElementById("pick-model");
  const submit = document.getElementById("pick-submit");

  function countFor(brand, model) {
    return data.cars.filter((car) => (!brand || car.brand === brand) && (!model || car.model === model)).length;
  }

  function fillModels() {
    const brand = brandSelect.value;
    if (brand) {
      ui.fillSelect(modelSelect, ui.models(brand), "Все модели " + brand);
      modelSelect.disabled = false;
    } else {
      ui.fillSelect(modelSelect, [], "Сначала выберите марку");
      modelSelect.disabled = true;
    }
  }

  function updateSubmit() {
    const brand = brandSelect.value;
    if (!brand) {
      submit.textContent = "Смотреть весь каталог";
      return;
    }
    const n = countFor(brand, modelSelect.value);
    submit.textContent = `Показать ${n} ${ui.carsWord(n)}`;
  }

  ui.fillSelect(brandSelect, ui.brands(), "Выберите марку");
  fillModels();
  updateSubmit();

  brandSelect.addEventListener("change", () => {
    fillModels();
    updateSubmit();
  });

  modelSelect.addEventListener("change", () => {
    updateSubmit();
    if (modelSelect.value) window.location.href = ui.catalogUrl(brandSelect.value, modelSelect.value);
  });

  picker.addEventListener("submit", (event) => {
    event.preventDefault();
    window.location.href = ui.catalogUrl(brandSelect.value, modelSelect.value);
  });

  // The browser restores the brand value on "Back", but not the model options built by script.
  window.addEventListener("pageshow", () => {
    fillModels();
    updateSubmit();
  });

  const prices = data.cars.map(ui.turnkey);
  document.getElementById("stat-count").textContent = String(data.cars.length);
  document.getElementById("stat-brands").textContent = String(ui.brands().length);
  document.getElementById("stat-min").textContent = "от " + ui.rub(Math.min(...prices));

  document.getElementById("brand-grid").innerHTML = ui
    .brands()
    .map((brand) => {
      const cars = data.cars.filter((car) => car.brand === brand);
      const min = Math.min(...cars.map(ui.turnkey));
      return `<a class="brand-tile" href="${ui.esc(ui.catalogUrl(brand))}">
        <span class="brand-name">${ui.esc(brand)}</span>
        <span class="brand-models">${ui.esc(ui.models(brand).join(" · "))}</span>
        <span class="brand-meta">${cars.length} ${ui.carsWord(cars.length)} · от ${ui.esc(ui.rub(min))}</span>
      </a>`;
    })
    .join("");

  document.getElementById("popular-grid").innerHTML = data.cars
    .filter((car) => car.featured)
    .map(ui.cardHtml)
    .join("");

  document.getElementById("rate-value").textContent = ui.rateFmt.format(data.rate) + " ₽";
  document.getElementById("as-of").textContent = data.asOf;
  document.getElementById("moscow-extra").textContent = ui.rub(data.moscowExtraRub);
})();
