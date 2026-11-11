/* ============================= */
/* PWA: VERSIÓN Y ARCHIVOS ESENCIALES */
/* Cambia v1 por v2, v3... al actualizar el sitio. */
/* ============================= */
const CACHE_PREFIX = 'la-odisea-pwa-';
const CACHE_NAME = CACHE_PREFIX + 'v12';
const BASE = self.registration.scope;
const ARCHIVOS = [
    "./Inicio.html",
    "./escenarios.html",
    "./icons/icon-192-v2.png",
    "./icons/icon-512-v2.png",
    "././img/Caminar.png",
    "././img/Laespatula.png",
    "././img/Lamoneda.png",
    "././img/Lavan.png",
    "././img/Mapa.png",
    "././img/ataque.png",
    "././img/cambiar.png",
    "././img/correr.png",
    "././img/elias.png",
    "././img/habilidad.png",
    "././img/imagen-circular.png",
    "././img/imagen-principal.jpeg",
    "././img/interactua.png",
    "././img/lion.png",
    "././img/nivel 1.png",
    "././img/Niverl3.jpeg",
    "././img/nose.png",
    "././img/principal.png",
    "././img/subnivel.png",
    "././img/toño.png",
    "./informacion.html",
    "./inicio.css",
    "./idioma.js",
    "./manifest.webmanifest",
    "./mecanicas.html",
    "./offline.html",
    "./personajes.html",
    "./pwa.js"
];

/* Guarda todas las páginas e imágenes antes de activar. */
self.addEventListener('install', (event) => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(ARCHIVOS.map(path => new URL(path, BASE).href));
        await self.skipWaiting();
    })());
});

/* Borra únicamente las versiones anteriores de esta aplicación. */
self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map(key => caches.delete(key)));
        await self.clients.claim();
    })());
});

/* Páginas: red primero; sin red, página guardada o aviso. */
/* Recursos: caché primero. Las API y otros dominios no se guardan. */
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);
    if (request.method !== 'GET' || url.origin !== self.location.origin || !url.href.startsWith(BASE)) return;
    if (url.pathname.startsWith(new URL('./descargas/', BASE).pathname)) return;
    const resource = new URL(url.pathname, url.origin).href;
    const known = ARCHIVOS.some(path => new URL(path, BASE).href === resource);
    if (request.mode === 'navigate') {
        event.respondWith((async () => {
            const cache = await caches.open(CACHE_NAME);
            try {
                const response = await fetch(request);
                if (response.ok && known) await cache.put(resource, response.clone());
                return response;
            } catch {
                return (await cache.match(resource)) || (await cache.match(new URL('./offline.html', BASE).href));
            }
        })());
    } else if (known) {
        event.respondWith((async () => {
            const cache = await caches.open(CACHE_NAME);
            return (await cache.match(resource)) || fetch(request);
        })());
    }
});
