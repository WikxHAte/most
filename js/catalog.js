(function () {
  const ui = window.MOST_UI;
  const data = ui.data;

  const SORTS = ["turnkey-asc", "turnkey-desc", "year-desc", "mileage-asc"];
  const allBrands = ui.brands();
  const params = new URLSearchParams(window.location.search);

  const state = {
    brand: "",
    model: "",
    condition: "all",
    body: "all",
    sort: "turnkey-asc",
  };

  const brandParam = params.get("brand");
  if (brandParam && allBrands.includes(brandParam)) state.brand = brandParam;
  const modelParam = params.get("model");
  if (state.brand && modelParam && ui.models(state.brand).includes(modelParam)) state.model = modelParam;
  if (params.get("condition") === "used") state.condition = "used";
  const bodyParam = params.get("body");
  if (bodyParam && ui.BODY[bodyParam]) state.body = bodyParam;
  const sortParam = params.get("sort");
  if (sortParam && SORTS.includes(sortParam)) state.sort = sortParam;

  const brandSelect = document.getElementById("brand");
  const modelSelect = document.getElementById("model");
  const bodySelect = document.getElementById("body");
  const sortSelect = document.getElementById("sort");
  const conditionButtons = document.querySelectorAll("[data-condition]");
  const grid = document.getElementById("catalog-grid");
  const countEl = document.getElementById("result-count");
  const emptyEl = document.getElementById("catalog-empty");

  ui.fillSelect(brandSelect, allBrands, "Все марки");
  const bodies = ui.BODY_ORDER.filter((key) => data.cars.some((car) => car.body === key));
  bodySelect.innerHTML =
    `<option value="all">Любой кузов</option>` +
    bodies.map((key) => `<option value="${key}">${ui.BODY[key]}</option>`).join("");

  function fillModels() {
    if (state.brand) {
      ui.fillSelect(modelSelect, ui.models(state.brand), "Все модели");
      modelSelect.disabled = false;
    } else {
      ui.fillSelect(modelSelect, [], "Сначала выберите марку");
      modelSelect.disabled = true;
    }
    modelSelect.value = state.model;
  }

  function syncControls() {
    brandSelect.value = state.brand;
    fillModels();
    bodySelect.value = state.body;
    sortSelect.value = state.sort;
    conditionButtons.forEach((button) => {
      button.setAttribute("aria-pressed", button.dataset.condition === state.condition ? "true" : "false");
    });
  }

  function syncUrl() {
    const next = new URLSearchParams();
    if (state.brand) next.set("brand", state.brand);
    if (state.model) next.set("model", state.model);
    if (state.condition !== "all") next.set("condition", state.condition);
    if (state.body !== "all") next.set("body", state.body);
    if (state.sort !== "turnkey-asc") next.set("sort", state.sort);
    const query = next.toString();
    window.history.replaceState(null, "", "catalog.html" + (query ? "?" + query : ""));
  }

  function filtered() {
    const list = data.cars.filter((car) => {
      if (state.brand && car.brand !== state.brand) return false;
      if (state.model && car.model !== state.model) return false;
      if (state.condition !== "all" && car.condition !== state.condition) return false;
      if (state.body !== "all" && car.body !== state.body) return false;
      return true;
    });
    const dir = state.sort.endsWith("asc") ? 1 : -1;
    list.sort((a, b) => {
      if (state.sort.startsWith("year")) return (a.year - b.year) * dir;
      if (state.sort.startsWith("mileage")) return (a.mileageKm - b.mileageKm) * dir;
      return (ui.turnkey(a) - ui.turnkey(b)) * dir;
    });
    return list;
  }

  function renderHead(cars) {
    const title = state.model ? `${state.brand} ${state.model}` : state.brand || "Все автомобили";
    document.getElementById("catalog-title").textContent = title;
    document.title = `${title} из Китая под ключ — МОСТ`;

    const crumbs = [{ label: "Главная", href: "index.html" }, { label: "Каталог", href: "catalog.html" }];
    if (state.brand) crumbs.push({ label: state.brand, href: ui.catalogUrl(state.brand) });
    if (state.model) crumbs.push({ label: state.model });
    document.getElementById("crumbs").innerHTML = ui.crumbsHtml(crumbs);

    const min = cars.length ? Math.min(...cars.map(ui.turnkey)) : 0;
    document.getElementById("catalog-lede").textContent = cars.length
      ? `${cars.length} ${ui.carsWord(cars.length)}, от ${ui.rub(min)} под ключ до Владивостока.`
      : "По этим условиям сейчас ничего нет.";
  }

  function render() {
    const cars = filtered();
    renderHead(cars);
    countEl.textContent = `Найдено: ${cars.length} ${ui.carsWord(cars.length)}`;
    grid.innerHTML = cars.map(ui.cardHtml).join("");
    emptyEl.hidden = cars.length !== 0;
    syncUrl();
  }

  brandSelect.addEventListener("change", () => {
    state.brand = brandSelect.value;
    state.model = "";
    fillModels();
    render();
  });
  modelSelect.addEventListener("change", () => {
    state.model = modelSelect.value;
    render();
  });
  bodySelect.addEventListener("change", () => {
    state.body = bodySelect.value;
    render();
  });
  sortSelect.addEventListener("change", () => {
    state.sort = sortSelect.value;
    render();
  });
  conditionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.condition = button.dataset.condition;
      syncControls();
      render();
    });
  });
  document.getElementById("reset-filters").addEventListener("click", () => {
    state.brand = "";
    state.model = "";
    state.condition = "all";
    state.body = "all";
    state.sort = "turnkey-asc";
    syncControls();
    render();
  });

  syncControls();
  render();
})();
