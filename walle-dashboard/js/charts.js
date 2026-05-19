// ─────────────────────────────────────────────────────────────
//  charts.js — Initialisation et mise à jour des graphiques
//  Dépend de : Chart.js (chargé dans index.html)
// ─────────────────────────────────────────────────────────────

Chart.defaults.color        = '#64748b';
Chart.defaults.borderColor  = 'rgba(245,158,11,.07)';

// ── Fabrique un graphique en ligne ──────────────────────────
function makeLineChart(canvasId, hexColor, yMax) {
  const h = hexColor.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);

  return new Chart(document.getElementById(canvasId).getContext('2d'), {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        data: [],
        borderColor: hexColor,
        backgroundColor: `rgba(${r},${g},${b},0.08)`,
        borderWidth: 1.5,
        pointRadius: 0,
        fill: true,
        tension: 0.35,
      }],
    },
    options: {
      animation: false,
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          min: 0, max: yMax,
          grid: { color: 'rgba(255,255,255,.025)' },
          ticks: { font: { size: 9 }, maxTicksLimit: 4 },
        },
        x: { display: false },
      },
    },
  });
}

// ── Ajoute un point, supprime les plus anciens ──────────────
function pushChart(chart, value, maxPoints = 60) {
  chart.data.labels.push('');
  chart.data.datasets[0].data.push(value);
  if (chart.data.labels.length > maxPoints) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
  }
  chart.update();
}



const pieChart = new Chart(
  document.getElementById('pieChart').getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: ['Correct', 'Incorrect'],
      datasets: [{
        data: [0, 0],
        backgroundColor: ['rgba(16,185,129,.65)', 'rgba(239,68,68,.65)'],
        borderColor: ['#10b981', '#ef4444'],
        borderWidth: 1,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom', labels: { padding: 12, boxWidth: 10 } },
      },
      cutout: '60%',
    },
  }
);
