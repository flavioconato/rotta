/* Waynder — service worker
   Due cache distinte:
   - APP: i file dell'applicazione, aggiornati a ogni nuova versione
   - TILES: le piastrelle della mappa già viste, per navigare senza rete
   I tile sono a numero chiuso: oltre il limite si buttano i più vecchi,
   altrimenti dopo qualche esplorazione l'app occuperebbe centinaia di MB. */

const VERSION   = 'v52';
const APP_CACHE = 'rotta-app-' + VERSION;
/* La cache delle mappe NON porta la versione: le piastrelle scaricate prima di
   partire devono sopravvivere agli aggiornamenti dell'app, altrimenti un
   aggiornamento in viaggio cancellerebbe le mappe offline. */
const TILE_CACHE= 'rotta-tiles';
const TILE_MAX  = 1200;   // ~40-60 MB, copre ampiamente una regione come la Scozia

const APP_FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './ripristino.html',
  './ispira/index.json',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-storage-compat.js'
];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(APP_CACHE);
    // addAll fallisce tutto se un file non risponde: li aggiungo uno a uno
    await Promise.all(APP_FILES.map(f =>
      c.add(new Request(f, {cache:'reload'})).catch(() => {})
    ));
    /* niente skipWaiting qui: il nuovo worker resta in attesa finché l'utente
       non preme "Aggiorna". Attivarlo d'ufficio mentre la pagina è aperta
       genera l'avviso ricorrente. */
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(k => k.startsWith('rotta-') && k !== APP_CACHE && k !== TILE_CACHE)
      .map(k => caches.delete(k)));
    /* niente clients.claim(): prendendo il controllo della pagina già aperta
       faceva apparire un controller mentre il worker era ancora in attesa,
       e la pagina interpretava la cosa come "nuova versione disponibile".
       Il controllo passa al reload, che è il momento giusto. */
  })());
});

/* mantiene la cache dei tile sotto il tetto, eliminando i più vecchi */
async function trimTiles(){
  const c = await caches.open(TILE_CACHE);
  const keys = await c.keys();
  if(keys.length <= TILE_MAX) return;
  const excess = keys.length - TILE_MAX;
  for(let i = 0; i < excess; i++) await c.delete(keys[i]);
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);

  /* Il documento dell'app: prima la rete, poi la cache.
     Con la cache per prima un aggiornamento si vedeva solo al secondo
     avvio — si restava sempre una versione indietro. Ora online si apre
     l'ultima versione, offline si ricade sulla copia salvata. */
  if(req.mode === 'navigate'){
    e.respondWith((async () => {
      const c = await caches.open(APP_CACHE);
      try{
        const res = await fetch(req);
        if(res && res.status === 200) c.put(req, res.clone());
        return res;
      }catch(err){
        return (await c.match(req, {ignoreSearch:true}))
            || (await c.match('./index.html'))
            || new Response('Offline', {status:503, headers:{'Content-Type':'text/plain'}});
      }
    })());
    return;
  }

  // Tile della mappa: prima la cache, poi la rete che aggiorna in silenzio
  if(/basemaps\.cartocdn\.com|tile\.openstreetmap\.org/.test(url.hostname)){
    e.respondWith((async () => {
      const c = await caches.open(TILE_CACHE);
      const hit = await c.match(req);
      if(hit) return hit;
      try{
        const res = await fetch(req);
        if(res && res.status === 200){ c.put(req, res.clone()); trimTiles(); }
        return res;
      }catch(err){
        // offline e tile mai visto: trasparente, così la mappa resta usabile
        return new Response('', {status: 504});
      }
    })());
    return;
  }

  /* Dati vivi — ricerca luoghi, percorsi, meteo, foto, suggerimenti di viaggio:
     solo rete. Servirli dalla cache non ha senso, e soprattutto la cache di
     ripiego confronta gli indirizzi IGNORANDO i parametri: due domande diverse
     allo stesso servizio si sarebbero scambiate la risposta. */
  if(/nominatim\.openstreetmap\.org|router\.project-osrm\.org|api\.open-meteo\.com|wikimedia\.org|wikipedia\.org|wikidata\.org|overpass/.test(url.hostname)) return;

  // Sincronizzazione condivisa (Firebase): solo rete, il worker non deve interferire
  // con le connessioni lunghe di Firestore né con l'autenticazione
  if(/firestore\.googleapis\.com|firebasestorage\.googleapis\.com|identitytoolkit\.googleapis\.com|securetoken\.googleapis\.com|firebaseinstallations\.googleapis\.com/.test(url.hostname)) return;

  /* Da qui in avanti si cachea: solo i file dell'app e le librerie note.
     Qualunque altro servizio esterno passa diretto alla rete — una cache che
     ignora i parametri è sicura solo per indirizzi senza parametri. */
  const sameOrigin = url.origin === self.location.origin;
  if(!sameOrigin && !/cdnjs\.cloudflare\.com|www\.gstatic\.com/.test(url.hostname)) return;

  e.respondWith((async () => {
    const c = await caches.open(APP_CACHE);
    const hit = await c.match(req, sameOrigin ? {ignoreSearch:true} : undefined);
    const net = fetch(req).then(res => {
      if(res && res.status === 200 && url.protocol.startsWith('http')) c.put(req, res.clone());
      return res;
    }).catch(() => null);
    return hit || (await net) || new Response('Offline', {status:503, headers:{'Content-Type':'text/plain'}});
  })());
});

/* consente alla pagina di forzare l'aggiornamento e di chiedere quale versione gira */
self.addEventListener('message', e => {
  if(e.data === 'skipWaiting') self.skipWaiting();
  if(e.data === 'version'){
    const p = e.ports && e.ports[0];
    if(p) p.postMessage({version: VERSION});
    else if(e.source) e.source.postMessage({version: VERSION});
  }
});
