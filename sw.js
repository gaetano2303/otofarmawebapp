const CACHE_NAME = 'otofarma-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/css/style.css',
  '/assets/js/script.js',
  '/assets/images/logo-otofarma.png',
  '/assets/images/icons/appicon.png',
  '/assets/images/icons/ear-left.svg',
  '/assets/images/icons/facebook.svg',
  '/assets/images/icons/instagram.svg',
  '/assets/images/icons/linkedin.svg',
  '/assets/images/icons/whatsapp.svg',
  '/assets/images/icons/youtube.svg',
  '/assets/images/products/prodotto_endo.png',
  '/assets/images/products/prodotto_cic.png',
  '/assets/images/products/prodotto_retro.png',
  '/assets/images/products/accessorio_remote.png',
  '/assets/images/products/accessorio_tv.png',
  '/assets/images/products/accessorio_charger.png',
  '/assets/images/products/accessorio_powerbank.png',
  '/assets/images/products/accessorio_app.png',
  '/data/farmacie.csv',
  'https://fonts.googleapis.com/css?family=Inter:400,600&display=swap',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

// Installazione del Service Worker
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Cache aperta');
        return cache.addAll(urlsToCache);
      })
  );
});

// Intercettazione delle richieste di rete
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Restituisce la risorsa dalla cache se disponibile
        if (response) {
          return response;
        }
        
        // Altrimenti, effettua la richiesta di rete
        return fetch(event.request).then(function(response) {
          // Controlla se abbiamo ricevuto una risposta valida
          if(!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clona la risposta
          var responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(function(cache) {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(function() {
          // Se la rete non è disponibile, prova a servire una pagina offline
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
      }
    )
  );
});

// Aggiornamento del Service Worker
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Rimozione cache obsoleta:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
