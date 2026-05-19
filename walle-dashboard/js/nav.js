// ─────────────────────────────────────────────────────────────
//  nav.js — Gestion de la navigation entre les pages
// ─────────────────────────────────────────────────────────────

const TAB_KEYS = ['dashboard', 'validation', 'control'];

function goTab(name) {
  document.querySelectorAll('.tab').forEach((tab, i) =>
    tab.classList.toggle('active', TAB_KEYS[i] === name)
  );
  document.querySelectorAll('.page').forEach(page =>
    page.classList.toggle('active', page.id === 'page-' + name)
  );
}
