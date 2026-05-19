//  main.js - Point d'entrée : initialisation et boucles
//  Dépend de : config.js, nav.js, ui.js, charts.js, api.js

function init() {
  // État initial de l'interface avant le premier poll
  setBattery(85);
  setTemperature(37);
  setSpeed(0);

  // Premier appel immédiat
  pollData();
  refreshCamera();

  // Boucles périodiques
  setInterval(pollData,     POLL_MS);
  setInterval(refreshCamera, CAM_MS);
}

// Effacer le journal des commandes
function clearLog() {
  document.getElementById('cmd-log').innerHTML = '';
}

document.addEventListener('DOMContentLoaded', init);
