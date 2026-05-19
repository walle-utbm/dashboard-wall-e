//  config.js — Paramètres globaux
//  Modifier BASE_URL si la Pi change d'adresse.
//  Si le dashboard est servi directement par la Pi,
//  laisser BASE_URL = "" pour utiliser des URLs relatives.

const BASE_URL = "http://192.168.137.160:8000";  // "" si servi par la Pi
const POLL_MS  = 500;   // Intervalle de polling des données (ms)
const CAM_MS   = 3000;  // Intervalle de rafraîchissement caméra (ms)

// Chemin de l'image caméra (statique ou endpoint live)
const CAM_PATH = "/images/current.jpg";

// Plage de température affichée sur le thermomètre (°C)
const TEMP_MIN = 35;
const TEMP_MAX = 45;
