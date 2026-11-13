// Public settings only. Never put credentials here.
window.MHD_CONFIG = Object.freeze({
  appsScriptUrl: 'https://script.google.com/macros/s/AKfycbzITrFAe5iQI5zgqk8MDBE0Uw9cpCsMbMeo9SRClY8lUtqlRzfQY0o-CwCyG08wmth9/exec', // Deployed Google Apps Script backend.
  endpoint: '',
  adminApi: '', // HTTPS backend base URL, e.g. https://backend.example/api/
  tracks: {
    "relax": [
        {
            "title": "Dreams Become Real — Kevin MacLeod",
            "src": "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Dreams%20Become%20Real.mp3",
            "bpm": 60,
            "genre": "classical_piano",
            "source": "https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1500027"
        },
        {
            "title": "Meditation Impromptu 01 — Kevin MacLeod",
            "src": "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Meditation%20Impromptu%2001.mp3",
            "bpm": "",
            "genre": "classical_piano",
            "source": "https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100163"
        }
    ],
    "energy": [
        {
            "title": "Electrodoodle — Kevin MacLeod",
            "src": "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Electrodoodle.mp3",
            "bpm": 120,
            "genre": "other",
            "source": "https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1200079"
        },
        {
            "title": "EDM Detection Mode — Kevin MacLeod",
            "src": "https://incompetech.com/music/royalty-free/mp3-royaltyfree/EDM%20Detection%20Mode.mp3",
            "bpm": 128,
            "genre": "other",
            "source": "https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1500026"
        }
    ]
}
});
// src: a relative path such as assets/music/relax.mp3 (relative to repo root).
// Original licensed recordings stream directly from the artist; see music-credits.html.
// Each condition accepts an array; legacy single-track objects remain supported.
// ?test=1 (or #thu) enables sample synthetic sounds, always is_simulated=1.
// endpoint: HTTPS URL accepting JSON and returning 2xx + {"ok":true}; requires CORS.
