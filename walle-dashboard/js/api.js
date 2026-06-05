//  api.js — Communications avec la Raspberry Pi
//  Dépend de : config.js, ui.js, charts.js

// Polling des données capteurs (/data)
/*
async function pollData() {
  try {
    const res  = await fetch(BASE_URL + '/data');
    const data = await res.json();

    setStatus(true);
    setTimestamp();

    // Vitesse socle
    const spd = data.speed || 0;
    setSpeed(spd);

    // Temps de tri
    if (data.processing_time != null) {
      const pt = parseFloat(data.processing_time).toFixed(1);
      document.getElementById('proc-val').textContent = pt + ' s';
    }

    if (data.battery     != null) setBattery(data.battery);
    if (data.temperature != null) setTemperature(data.temperature);

    // Déchets — mis à jour uniquement via /validate (pas d'auto-incrément côté Pi)
    setWaste(data.nb_objects_correct || 0, data.nb_objects_incorrect || 0);

    // Dernière classification (page 2)
    if (data.last_class)
      document.getElementById('robot-class').textContent = data.last_class.toUpperCase();

  } catch (err) {
    setStatus(false);
  }
}
*/

function startSSE() {
    const es = new EventSource(BASE_URL + '/stream');

    es.onopen = () => {
        setStatus(true);
        setTimestamp();
    };

    es.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setStatus(true);
        setTimestamp();
        
	// Vitesse socle
    	const spd = data.speed || 0;
    	setSpeed(spd);

    	// Temps de tri
    	if (data.processing_time != null) {
      		const pt = parseFloat(data.processing_time).toFixed(1);
      		document.getElementById('proc-val').textContent = pt + ' s';
    	}

    	if (data.battery     != null) setBattery(data.battery);
    	if (data.temperature != null) setTemperature(data.temperature);

    	// Déchets — mis à jour uniquement via /validate (pas d'auto-incrément côté Pi)
    	setWaste(data.nb_objects_correct || 0, data.nb_objects_incorrect || 0);

    	// Dernière classification (page 2)
    	if (data.last_class)
      		document.getElementById('robot-class').textContent = data.last_class.toUpperCase();
    };

    es.onerror = () => {
        setStatus(false);
    };
}


// Rafraîchissement de l'image caméra
// Image statique servie par FastAPI StaticFiles.
// Sur la Pi, dans main.py :
//   from fastapi.staticfiles import StaticFiles
//   app.mount("/images", StaticFiles(directory="images"), name="images")
// Placer les images dans un dossier "images/" à côté de main.py.
// Renommer l'image courante "current.jpg" pour qu'elle s'affiche ici.
function refreshCamera() {
  const src = BASE_URL + CAM_PATH + '?t=' + Date.now();
  document.getElementById('cam-img').src = src;
  document.getElementById('val-img').src  = src;
  document.getElementById('cam-ts').textContent = new Date().toLocaleTimeString('fr-FR');
}

// Validation classification (page 2)
// result : 'correct' | 'incorrect' | 'skip'
let sessionCorrect   = 0;
let sessionIncorrect = 0;

async function sendValidation(result) {
  if (result === 'skip') {
    showFeedback('skip', 'Ignoré - image non exploitable');
    return;
  }

  showFeedback('pend', 'Envoi en cours...');

  try {
    const res  = await fetch(BASE_URL + '/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correct: result === 'correct', timestamp: Date.now() }),
    });
    const data = await res.json();

    const label = result === 'correct' ? 'CORRECT' : 'INCORRECT';
    showFeedback('ok', `Pi a reçu : ${label}` + (data.message ? ' — ' + data.message : ''));

    if (result === 'correct') {
      sessionCorrect++;
      document.getElementById('s-ok').textContent = sessionCorrect;
    } else {
      sessionIncorrect++;
      document.getElementById('s-ko').textContent = sessionIncorrect;
    }

  } catch (err) {
    showFeedback('err', 'Erreur - Raspberry Pi injoignable');
  }
}

// Envoi d'une commande moteur (page 3)
async function sendCommand(part, action) {
  const log  = document.getElementById('cmd-log');
  const ts   = new Date().toLocaleTimeString('fr-FR');
  const line = document.createElement('div');
  line.className = 'll p';
  line.innerHTML =
    `<span class="lts">[${ts}]</span><span class="lc">${part.toUpperCase()} → ${action}</span>`;
  log.prepend(line);

  try {
    const res  = await fetch(BASE_URL + '/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ part, action, timestamp: Date.now() }),
    });
    const data = await res.json();
    line.className   = 'll s';
    line.innerHTML  += `<span class="ack ok">${data.ack || 'ACK'}</span>`;
  } catch (err) {
    line.className   = 'll e';
    line.innerHTML  += `<span class="ack err">no route</span>`;
  }

  // Garder le log sous 60 lignes
  while (log.children.length > 60) log.removeChild(log.lastChild);
}
