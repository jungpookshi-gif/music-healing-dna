// Public settings only. Never put credentials here.
window.MHD_CONFIG = Object.freeze({
  appsScriptUrl: '', // Google Apps Script /exec URL (or private CORS proxy); takes priority.
  endpoint: '',
  adminApi: '', // HTTPS backend base URL, e.g. https://backend.example/api/
  tracks: {
    relax: {title:'', src:'', bpm:'', genre:''},
    energy: {title:'', src:'', bpm:'', genre:''}
  }
});
// src: a relative path such as assets/music/relax.mp3 (relative to repo root).
// No music files were included in the upload. Empty presets are blocked in real mode.
// ?test=1 (or #thu) enables sample synthetic sounds, always is_simulated=1.
// endpoint: HTTPS URL accepting JSON and returning 2xx + {"ok":true}; requires CORS.
