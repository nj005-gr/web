/* ============================= */
/* PWA: ESTADO DE LA CONEXIÓN */
/* ============================= */
function mostrarConexion() {
    const aviso = document.getElementById('pwa-estado');
    if (!aviso) return;
    aviso.hidden = navigator.onLine;
    aviso.textContent = document.documentElement.lang === 'en'
        ? "Offline: you're browsing the saved version of La Odisea."
        : 'Sin conexión: estás consultando la versión guardada de La Odisea.';
}
window.addEventListener('online', mostrarConexion);
window.addEventListener('offline', mostrarConexion);
mostrarConexion();

/* ============================= */
/* PWA: REGISTRO DEL SERVICE WORKER */
/* ============================= */
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', async () => {
        try {
            await navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' });
            await navigator.serviceWorker.ready;
            console.info('La Odisea: service worker activo y recursos guardados.');
        } catch (error) {
            console.error('No se pudo preparar La Odisea sin conexión:', error);
        }
    });
}

/* ============================= */
/* MENÚ PRINCIPAL */
/* ============================= */
function configurarMenu(raiz = document) {
    const botonMenu = raiz.querySelector('.menu-toggle');
    if (!botonMenu) return;
    const encabezado = botonMenu.closest('.header');
    encabezado.classList.add('menu-interactivo');

    botonMenu.addEventListener('click', () => {
        const abierto = botonMenu.getAttribute('aria-expanded') === 'true';
        botonMenu.setAttribute('aria-expanded', String(!abierto));
    });

    encabezado.addEventListener('click', event => {
        if (event.target.closest('.menu a')) botonMenu.setAttribute('aria-expanded', 'false');
    });

    encabezado.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && botonMenu.offsetWidth && botonMenu.getAttribute('aria-expanded') === 'true') {
            botonMenu.setAttribute('aria-expanded', 'false');
            botonMenu.focus();
        }
    });
}


configurarMenu();

/* El archivo del juego puede publicarse por separado del sitio. */
const descarga = document.querySelector('.accion-dorada[download]');
const avisoDescarga = document.getElementById('aviso-descarga');

if (descarga && avisoDescarga && /^https?:$/.test(location.protocol)) {
    fetch(descarga.href, { method: 'HEAD', cache: 'no-cache' }).then(respuesta => {
        const tipo = respuesta.headers.get('Content-Type') || '';
        if (respuesta.ok && !tipo.includes('text/html')) {
            avisoDescarga.hidden = true;
        } else if (respuesta.status === 404 || (respuesta.ok && tipo.includes('text/html'))) {
            descarga.addEventListener('click', evento => {
                evento.preventDefault();
                avisoDescarga.focus();
            });
        }
    }).catch(() => {
        // El enlace sigue disponible cuando el servidor no responde a HEAD.
    });
}
