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

/* Los archivos (juego y app móvil) pueden publicarse por separado del sitio. */
document.querySelectorAll('.accion-dorada[download]').forEach(descarga => {
    const avisoDescarga = descarga.closest('[data-descarga]')?.querySelector('.aviso-descarga') || document.getElementById('aviso-descarga');
    if (!avisoDescarga || !/^https?:$/.test(location.protocol)) return;
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
});
