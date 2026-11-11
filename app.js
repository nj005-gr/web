/* ============================================================
   LA ODISEA · Interacciones del sitio
   Navbar inteligente, modo noche, animaciones de cómic,
   fondos interactivos y selección de personaje.
   ============================================================ */
(() => {
  const raiz = document.documentElement;
  raiz.classList.add('js');
  const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const enIngles = () => raiz.lang === 'en';

  /* ---------- Barra de vida = avance del scroll ---------- */
  const barra = document.querySelector('.progreso span');
  const cab = document.querySelector('.header');
  const botonMenu = document.querySelector('.menu-toggle');
  let yPrev = scrollY, enEspera = false;

  const alDesplazar = () => {
    enEspera = false;
    const y = scrollY;
    const max = raiz.scrollHeight - innerHeight;
    if (barra) barra.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

    /* Navbar: se oculta al bajar y regresa con rebote al subir */
    if (cab) {
      const delta = y - yPrev;
      const menuAbierto = botonMenu?.getAttribute('aria-expanded') === 'true';
      if (y < 90) cab.classList.remove('oculto');
      else if (delta > 6 && !menuAbierto) cab.classList.add('oculto'), cab.classList.remove('vuelve');
      else if (delta < -6 && cab.classList.contains('oculto')) {
        cab.classList.remove('oculto', 'vuelve');
        void cab.offsetWidth;            // reinicia la animación
        cab.classList.add('vuelve');
      }
    }
    yPrev = y;
  };
  addEventListener('scroll', () => {
    if (!enEspera) { enEspera = true; requestAnimationFrame(alDesplazar); }
  }, { passive: true });
  alDesplazar();
  cab?.addEventListener('focusin', () => cab.classList.remove('oculto'));

  /* ---------- Menú en móvil ---------- */
  if (botonMenu && cab) {
    const cerrar = () => botonMenu.setAttribute('aria-expanded', 'false');
    botonMenu.addEventListener('click', () => {
      botonMenu.setAttribute('aria-expanded', String(botonMenu.getAttribute('aria-expanded') !== 'true'));
    });
    cab.addEventListener('click', (e) => { if (e.target.closest('.menu a')) cerrar(); });
    cab.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && botonMenu.getAttribute('aria-expanded') === 'true') { cerrar(); botonMenu.focus(); }
    });
    document.addEventListener('click', (e) => { if (!cab.contains(e.target)) cerrar(); });
  }

  /* ---------- Modo noche (recuerda la elección) ---------- */
  const botonTema = document.querySelector('.tema');
  const pintarTema = () => {
    if (!botonTema) return;
    const noche = raiz.dataset.tema === 'noche';
    const en = enIngles();
    botonTema.setAttribute('aria-pressed', String(noche));
    botonTema.setAttribute('aria-label', en
      ? (noche ? 'Switch to day mode' : 'Switch to night mode')
      : (noche ? 'Cambiar a modo día' : 'Cambiar a modo noche'));
    /* El texto muestra a qué modo se cambia al pulsar */
    const txt = botonTema.querySelector('.tema-txt');
    if (txt) txt.textContent = en ? (noche ? 'Day mode' : 'Night mode') : (noche ? 'Modo día' : 'Modo noche');
  };
  botonTema?.addEventListener('click', () => {
    raiz.dataset.tema = raiz.dataset.tema === 'noche' ? 'dia' : 'noche';
    try { localStorage.setItem('la-odisea-tema', raiz.dataset.tema); } catch { /* sin almacenamiento */ }
    pintarTema();
  });
  pintarTema();
  new MutationObserver(pintarTema).observe(raiz, { attributes: true, attributeFilter: ['lang'] });

  /* ---------- Entrada tipo viñeta de cómic ---------- */
  document.querySelectorAll('.peleadores-fila, .mundos-rejilla, .items, .controles, .tarjetas').forEach((grupo) => {
    [...grupo.children].forEach((el, i) => el.style.setProperty('--i', i % 6));
  });
  const animables = document.querySelectorAll('.rev, h2.pop');
  if ('IntersectionObserver' in window && !reducido) {
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    animables.forEach((el) => io.observe(el));
  } else {
    animables.forEach((el) => el.classList.add('visto'));
  }

  /* ---------- Selección de personaje ---------- */
  const pestanas = [...document.querySelectorAll('.ficha[role="tab"]')];
  if (pestanas.length) {
    const elegir = (ficha, enfocar = false) => {
      pestanas.forEach((p) => {
        const activa = p === ficha;
        p.setAttribute('aria-selected', String(activa));
        p.tabIndex = activa ? 0 : -1;
        const panel = document.getElementById(p.getAttribute('aria-controls'));
        if (!panel) return;
        panel.hidden = !activa;
        panel.classList.toggle('entra', activa);
      });
      if (enfocar) ficha.focus();
    };
    pestanas.forEach((p, i) => {
      p.addEventListener('click', () => {
        elegir(p);
        const panel = document.getElementById(p.getAttribute('aria-controls'));
        if (panel && panel.getBoundingClientRect().top > innerHeight * 0.75) {
          panel.scrollIntoView({ behavior: reducido ? 'auto' : 'smooth', block: 'center' });
        }
      });
      p.addEventListener('keydown', (e) => {
        const paso = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (!paso) return;
        e.preventDefault();
        elegir(pestanas[(i + paso + pestanas.length) % pestanas.length], true);
      });
    });
    const inicial = pestanas.find((p) => '#' + p.dataset.personaje === location.hash) || pestanas[0];
    elegir(inicial);
  }

  if (reducido) return;

  /* ---------- Fondos con profundidad: los objetos siguen al cursor ---------- */
  const flotantes = [...document.querySelectorAll('.flota')];
  const puntero = matchMedia('(pointer: fine)').matches;
  if (flotantes.length && puntero) {
    let mx = 0, my = 0, pendiente = false;
    addEventListener('pointermove', (e) => {
      mx = e.clientX / innerWidth - 0.5;
      my = e.clientY / innerHeight - 0.5;
      if (pendiente) return;
      pendiente = true;
      requestAnimationFrame(() => {
        pendiente = false;
        flotantes.forEach((f) => {
          const p = Number(f.dataset.prof) || 20;
          f.style.transform = `translate(${mx * p}px, ${my * p}px) rotate(${mx * p * 0.6}deg)`;
        });
      });
    }, { passive: true });
  }

  /* ---------- Chispas del cursor (canvas) ---------- */
  const lienzo = document.getElementById('chispas');
  const ctx = lienzo?.getContext('2d');
  const chispas = [];
  const colores = ['#FFC21A', '#5ED13A', '#FF7A1A', '#ffffff'];
  let animando = false;
  const soltar = (x, y, n = 1, fuerza = 2) => {
    if (!ctx) return;
    for (let i = 0; i < n && chispas.length < 160; i++) {
      const a = Math.random() * Math.PI * 2;
      chispas.push({ x, y, vx: Math.cos(a) * fuerza * Math.random(), vy: Math.sin(a) * fuerza * Math.random() - 0.5, vida: 1, t: 4 + Math.random() * 6, c: colores[(Math.random() * colores.length) | 0] });
    }
    if (!animando) { animando = true; requestAnimationFrame(bucle); }
  };
  const bucle = () => {
    ctx.clearRect(0, 0, lienzo.width, lienzo.height);
    for (let i = chispas.length - 1; i >= 0; i--) {
      const c = chispas[i];
      c.x += c.vx; c.y += c.vy; c.vy += 0.06; c.vida -= 0.025;
      if (c.vida <= 0) { chispas.splice(i, 1); continue; }
      ctx.globalAlpha = c.vida; ctx.fillStyle = c.c; ctx.strokeStyle = '#12141F'; ctx.lineWidth = 2;
      ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.vida * 6);
      ctx.fillRect(-c.t / 2, -c.t / 2, c.t, c.t); ctx.strokeRect(-c.t / 2, -c.t / 2, c.t, c.t);
      ctx.restore();
    }
    if (chispas.length) requestAnimationFrame(bucle);
    else { animando = false; ctx.clearRect(0, 0, lienzo.width, lienzo.height); }   // el bucle descansa si no hay chispas
  };
  if (ctx) {
    const ajustar = () => { lienzo.width = innerWidth; lienzo.height = innerHeight; };
    addEventListener('resize', ajustar);
    ajustar();
    if (puntero) addEventListener('pointermove', (e) => { if (Math.random() < 0.4) soltar(e.clientX, e.clientY, 1); }, { passive: true });
  }

  /* ---------- Clic = estallido de cómic ---------- */
  const sonidos = ['¡POW!', '¡BAM!', '¡ZAP!', '¡CRASH!', '¡WHAM!'];
  const fondos = ['#FFC21A', '#5ED13A', '#FF7A1A', '#E8352E'];
  addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    const s = document.createElement('span');
    s.className = 'estallido';
    s.setAttribute('aria-hidden', 'true');
    s.textContent = sonidos[(Math.random() * sonidos.length) | 0];
    s.style.left = e.clientX + 'px';
    s.style.top = e.clientY + 'px';
    s.style.background = fondos[(Math.random() * fondos.length) | 0];
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 750);
    soltar(e.clientX, e.clientY, 14, 5);
  });
})();
