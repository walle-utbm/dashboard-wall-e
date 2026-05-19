// ─────────────────────────────────────────────────────────────
//  ui.js — Mise à jour des composants visuels du DOM
//  Dépend de : config.js, charts.js
// ─────────────────────────────────────────────────────────────

// ── Batterie ────────────────────────────────────────────────
function setBattery(pct) {
  const value = parseFloat(pct).toFixed(1);  // 1 décimale
  document.getElementById('batt-val').innerHTML =
    value + '<span class="sc-unit">%</span>';

  const fill = document.getElementById('batt-fill');
  fill.style.width = parseFloat(value) + '%';
  fill.className = 'batt-fill';

  const lbl = document.getElementById('batt-lbl');
  if (pct <= 20) {
    fill.classList.add('low');
    lbl.textContent = '⚠ Faible';  lbl.style.color = 'var(--red)';
  } else if (pct <= 50) {
    fill.classList.add('med');
    lbl.textContent = 'Moyenne';   lbl.style.color = 'var(--accent)';
  } else {
    fill.classList.add('hi');
    lbl.textContent = 'OK';        lbl.style.color = 'var(--green)';
  }
}

// ── Température — affichage adapté à la plage TEMP_MIN/TEMP_MAX ─
function setTemperature(t) {
  const N = 16;
  document.getElementById('temp-val').innerHTML =
    parseFloat(t).toFixed(1) + '<span class="sc-unit">°C</span>';

  const segs   = document.getElementById('temp-segs');
  const filled = Math.max(0, Math.round(((t - TEMP_MIN) / (TEMP_MAX - TEMP_MIN)) * N));
  segs.innerHTML = '';
  for (let i = 0; i < N; i++) {
    const s = document.createElement('div');
    s.className = 'tseg';
    if (i < filled) {
      const ratio = i / N;
      s.style.background = ratio < 0.5 ? '#10b981' : ratio < 0.8 ? '#f59e0b' : '#ef4444';
    }
    segs.appendChild(s);
  }

  const lbl = document.getElementById('temp-lbl');
  if      (t < TEMP_MIN + 5) { lbl.textContent = 'Nominal'; lbl.style.color = 'var(--green)'; }
  else if (t < TEMP_MAX - 2) { lbl.textContent = 'Chaud';   lbl.style.color = 'var(--accent)'; }
  else                        { lbl.textContent = '⚠ Élevé'; lbl.style.color = 'var(--red)'; }
}

// ── Vitesse socle ────────────────────────────────────────────
function setSpeed(v) {
  document.getElementById('spd-val').innerHTML = v + '<span class="sc-unit"> /20</span>';
  const sub = document.getElementById('spd-sub');
  if      (v === 0) { sub.textContent = 'Arrêté'; sub.style.color = 'var(--dim)'; }
  else if (v < 10)  { sub.textContent = 'Lent';   sub.style.color = 'var(--accent)'; }
  else              { sub.textContent = 'Rapide';  sub.style.color = 'var(--green)'; }
}

// ── Compteurs déchets + taux de réussite ────────────────────
function setWaste(correct, incorrect) {
  document.getElementById('correct-val').textContent   = correct;
  document.getElementById('incorrect-val').textContent = incorrect;
  const total = correct + incorrect;
  document.getElementById('rate-val').innerHTML =
    (total ? Math.round(correct / total * 100) : '--') + '<span class="sc-unit">%</span>';
  pieChart.data.datasets[0].data = [correct, incorrect];
  pieChart.update();
}

// ── Statut de connexion (header) ─────────────────────────────
function setStatus(online) {
  document.getElementById('status-dot').className   = online ? 'dot' : 'dot err';
  document.getElementById('status-text').textContent = online ? 'CONNECTÉ' : 'DÉCONNECTÉ';
}

// ── Horodatage (header) ──────────────────────────────────────
function setTimestamp() {
  document.getElementById('last-ts').textContent =
    new Date().toLocaleTimeString('fr-FR');
}

// ── Feedback validation (page 2) ─────────────────────────────
function showFeedback(type, message, durationMs = 3500) {
  const fb = document.getElementById('val-fb');
  fb.style.display = 'block';
  fb.className = 'fb ' + type;  // 'ok' | 'err' | 'pend' | 'skip'
  fb.textContent = message;
  if (durationMs > 0) setTimeout(() => { fb.style.display = 'none'; }, durationMs);
}
