document.addEventListener("DOMContentLoaded", () => {
  const socket = io();
  const email = localStorage.getItem("email");
  if (!email) return location="/";

  document.getElementById("user").innerText = email;
  document.getElementById("logoutBtn").onclick = () => {
    localStorage.clear();
    location="/";
  };

  const dashboardView = document.getElementById("dashboardView");
  const marketsView = document.getElementById("marketsView");
  const portfolioView = document.getElementById("portfolioView");

  const navDashboard = document.getElementById("navDashboard");
  const navMarkets = document.getElementById("navMarkets");
  const navPortfolio = document.getElementById("navPortfolio");

  function showView(view, nav) {
    [dashboardView, marketsView, portfolioView].forEach(v => v.classList.add("hidden"));
    view.classList.remove("hidden");
    [navDashboard, navMarkets, navPortfolio].forEach(n => n.classList.remove("active"));
    nav.classList.add("active");
  }

  navDashboard.onclick = () => showView(dashboardView, navDashboard);
  navMarkets.onclick = () => showView(marketsView, navMarkets);
  navPortfolio.onclick = () => showView(portfolioView, navPortfolio);

  const pricesDiv = document.getElementById("prices");
  const portfolioList = document.getElementById("portfolioList");

  let subscribed = [];
  let lastPrices = {};
  let chart;
  let chartData = [];

  document.getElementById("subBtn").onclick = () => {
    subscribed = [...document.querySelectorAll("#stockList input:checked")].map(cb => cb.value);
    if (subscribed.length === 0) return alert("Select stocks");
    portfolioList.innerHTML = subscribed.map(s => `<div>${s}</div>`).join("");
    if (!chart) initChart();
  };

  document.getElementById("unsubBtn").onclick = () => {
    subscribed = [];
    pricesDiv.innerHTML = "";
    portfolioList.innerHTML = "";
    chartData = [];
    if (chart) chart.update();
  };

  socket.on("prices", prices => {
    pricesDiv.innerHTML = "";

    subscribed.forEach(s => {
      const p = prices[s];
      const prev = lastPrices[s] ?? p;

      const diff = p - prev;
      const diffAbs = Math.abs(diff).toFixed(2);
      const diffPct = prev ? ((diff / prev) * 100).toFixed(2) : "0.00";

      const isUp = diff > 0;
      const isDown = diff < 0;

      const arrow = isUp ? "↑" : isDown ? "↓" : "";
      const sign = isUp ? "+" : isDown ? "-" : "";
      const trend = isUp ? "up" : isDown ? "down" : "";

      pricesDiv.innerHTML += `
        <div class="card ${trend}">
          <h4>${s}</h4>
          <p>$${p}</p>
          <small class="change ${trend}">
            ${arrow} ${sign}${diffAbs} (${sign}${diffPct}%)
          </small>
        </div>
      `;

      lastPrices[s] = p;
    });

    if (chart && subscribed[0]) {
      chartData.push(prices[subscribed[0]]);
      if (chartData.length > 20) chartData.shift();
      chart.data.labels = chartData.map((_, i) => i + 1);
      chart.data.datasets[0].data = chartData;
      chart.update();
    }
  });

  function initChart() {
    chart = new Chart(document.getElementById("chart"), {
      type: "line",
      data: {
        labels: [],
        datasets: [{
          label: "Price",
          data: [],
          borderWidth: 2,
          tension: 0.3
        }]
      }
    });
  }
});
