// service-worker.js - Jazz Chords PWA
const CACHE_NAME = 'jazz-chords-v2.8';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './chords.js',
  './keyboard.js',
  './detector.js',
  './audio-manager.js',
  './staff.js',
  './ui.js',
  './manifest.json',
  './icons/icon-72.png',
  './icons/icon-96.png',
  './icons/icon-128.png',
  './icons/icon-144.png',
  './icons/icon-152.png',
  './icons/icon-192.png',
  './icons/icon-384.png',
  './icons/icon-512.png'
];

// Ressources externes à mettre en cache
const EXTERNAL_ASSETS = [
  'https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js'
];

// Installation : mise en cache des ressources
self.addEventListener('install', (event) => {
  console.log('[SW] Installation...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Mise en cache des ressources locales');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        // Mettre en cache les ressources externes séparément (peut échouer)
        return caches.open(CACHE_NAME).then((cache) => {
          return Promise.allSettled(
            EXTERNAL_ASSETS.map(url => 
              fetch(url).then(response => {
                if (response.ok) {
                  return cache.put(url, response);
                }
              }).catch(() => console.log('[SW] Impossible de cacher:', url))
            )
          );
        });
      })
      .then(() => {
        console.log('[SW] Installation terminée');
        return self.skipWaiting();
      })
  );
});

// Activation : nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activation...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Suppression ancien cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log('[SW] Activation terminée');
      return self.clients.claim();
    })
  );
});

// Fetch : stratégie Cache First, puis réseau
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Ne pas intercepter les requêtes vers les samples audio (Salamander)
  if (url.href.includes('tonejs.github.io/audio/salamander')) {
    // Network first pour les samples audio (ils sont gros)
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Optionnel : mettre en cache les samples téléchargés
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback sur le cache si hors-ligne
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // Pour les autres requêtes : Cache First
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(event.request)
          .then((response) => {
            // Ne pas cacher les requêtes non-GET ou les erreurs
            if (!response || response.status !== 200 || event.request.method !== 'GET') {
              return response;
            }
            
            // Cloner la réponse pour la mettre en cache
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
            
            return response;
          });
      })
  );
});

// Message pour forcer la mise à jour
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
