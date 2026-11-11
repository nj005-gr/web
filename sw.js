/* ============================= */
/* PWA: VERSIÓN Y ARCHIVOS ESENCIALES */
/* Cambia v1 por v2, v3... al actualizar el sitio. */
/* ============================= */
const CACHE_PREFIX = 'la-odisea-pwa-';
const CACHE_NAME = CACHE_PREFIX + 'v19';
const BASE = self.registration.scope;
const ARCHIVOS = [
    "./Index.html",
    "./escenarios.html",
    "./informacion.html",
    "./mecanicas.html",
    "./personajes.html",
    "./offline.html",
    "./estilos.css",
    "./fuentes.css",
    "./app.js",
    "./idioma.js",
    "./pwa.js",
    "./manifest.webmanifest",
    "./icons/icon-192-v2.png",
    "./icons/icon-512-v2.png",
    "./icons/icon-512-maskable.png",
    "./fonts/Barlow-400-normal.woff2",
    "./fonts/Barlow-500-normal.woff2",
    "./fonts/Barlow-600-normal.woff2",
    "./fonts/BarlowCondensed-600-normal.woff2",
    "./fonts/BarlowCondensed-800-italic.woff2",
    "./fonts/BarlowCondensed-800-normal.woff2",
    "./fonts/BowlbyOne-400-normal.woff2",
    "./fonts/PressStart2P-400-normal.woff2",
    "./img/opt/arena-lion.webp",
    "./img/opt/atacar.webp",
    "./img/opt/caminar.webp",
    "./img/opt/correr.webp",
    "./img/opt/cubrirse.webp",
    "./img/opt/elias.webp",
    "./img/opt/emblema.webp",
    "./img/opt/espatula.webp",
    "./img/opt/habilidad.webp",
    "./img/opt/hero-fondo.webp",
    "./img/opt/hero.webp",
    "./img/opt/hero-poster.webp",
    "./img/opt/interactuar.webp",
    "./img/opt/laboratorio.webp",
    "./img/opt/lion.webp",
    "./img/opt/mapa.webp",
    "./img/opt/moneda.webp",
    "./img/opt/nivel1.webp",
    "./img/opt/subnivel.webp",
    "./img/opt/tono.webp",
    "./img/opt/van.webp",
    "./img/opt/vicente.webp",
    "./img/opt/victor.webp"
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
