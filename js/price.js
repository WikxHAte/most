(function () {
  const ui = window.MOST_UI;
  const data = ui.data;
  const esc = ui.esc;

  document.getElementById("rate-value").textContent = ui.rateFmt.format(data.rate) + " ₽";
  document.getElementById("as-of").textContent = data.asOf;
  document.getElementById("moscow-extra").textContent = ui.rub(data.moscowExtraRub);

  const car = data.cars.reduce((min, item) => (ui.turnkey(item) < ui.turnkey(min) ? item : min));
  document.getElementById("example-title").textContent =
    `${ui.carTitle(car)} ${car.trim}, ${car.year} — ${ui.conditionLabel(car).toLowerCase()}, самая доступная машина в каталоге.`;
  document.getElementById("example-breakdown").innerHTML = `
    <div><span>Цена в Китае</span><b>${esc(ui.cny(car.priceCny))}</b></div>
    <div><span>В рублях, курс ${esc(ui.rateFmt.format(data.rate))}</span><b>${esc(ui.rub(ui.chinaRub(car)))}</b></div>
    <div><span>Логистика до Владивостока</span><b>${esc(ui.rub(car.logisticsRub))}</b></div>
    <div><span>Таможня и сборы, ориентир</span><b>${esc(ui.rub(car.feesRub))}</b></div>
    <div class="total"><span>Под ключ до Владивостока</span><b>${esc(ui.rub(ui.turnkey(car)))}</b></div>`;
  document.getElementById("example-link").href = ui.carUrl(car);
})();
