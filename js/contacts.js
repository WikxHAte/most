(function () {
  const ui = window.MOST_UI;
  const data = ui.data;

  const select = document.getElementById("car-select");
  select.insertAdjacentHTML(
    "beforeend",
    data.cars
      .slice()
      .sort((a, b) => ui.carTitle(a).localeCompare(ui.carTitle(b), "ru", { numeric: true }))
      .map(
        (car) =>
          `<option value="${ui.esc(car.id)}">${ui.esc(ui.carTitle(car))}, ${car.year} — ${ui.esc(ui.rub(ui.turnkey(car)))}</option>`
      )
      .join("")
  );

  ui.initRequestForm(() => {
    const car = data.cars.find((item) => item.id === select.value);
    return car ? `${ui.carTitle(car)}, ${car.year}` : "Пока не выбрал";
  });
})();
