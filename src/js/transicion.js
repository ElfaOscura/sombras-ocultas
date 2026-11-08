/* ==========================================================================
   Transición entre páginas · Sombras Ocultas
   Guárdalo como src/js/transicion.js e impórtalo en main.js:
       import './transicion.js';
   Requiere el bloque HTML de transicion.html (id="transicion-pagina") en cada página.
   ========================================================================== */
import { gsap } from 'gsap';

const overlay = document.getElementById('transicion-pagina');

if (overlay) {
  const reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const contenido = overlay.querySelectorAll('[data-transicion-logo], p, .transicion-barra');

  const TIEMPO_MINIMO = reducirMovimiento ? 0 : 450; // ms que se ve la carga al llegar
  const TIEMPO_MAXIMO = 4000; // ms: si la página tarda más, se muestra igual
  const DURACION_ENTRADA = reducirMovimiento ? 0.01 : 0.45; // s al salir de una página
  const DURACION_SALIDA = reducirMovimiento ? 0.01 : 0.7; // s al llegar a una página

  let navegando = false;
  let revelada = false;

  const ocultarOverlay = () => {
    overlay.inert = true;
    overlay.setAttribute('aria-hidden', 'true');
  };

  const mostrarOverlay = () => {
    overlay.inert = false;
    overlay.removeAttribute('aria-hidden');
  };

  /* ---- Al llegar: se descubre la página ---- */
  const revelar = () => {
    if (revelada) return;
    revelada = true;

    const espera = Math.max(0, TIEMPO_MINIMO - performance.now());
    gsap
      .timeline({ delay: espera / 1000, onComplete: ocultarOverlay })
      .to(contenido, { autoAlpha: 0, scale: 1.08, duration: DURACION_SALIDA * 0.6, ease: 'power2.in' })
      .to(overlay, { autoAlpha: 0, duration: DURACION_SALIDA, ease: 'power2.out' }, '-=0.2');
  };

  if (document.readyState === 'complete') {
    revelar();
  } else {
    window.addEventListener('load', revelar, { once: true });
    window.setTimeout(revelar, TIEMPO_MAXIMO); // seguro por si algún recurso se atasca
  }

  /* ---- Botón "atrás/adelante": la página puede venir de caché con la carga visible ---- */
  window.addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    navegando = false;
    revelada = true;
    gsap.set(overlay, { autoAlpha: 0 });
    gsap.set(contenido, { autoAlpha: 1, scale: 1 });
    ocultarOverlay();
  });

  /* ---- Al salir: se cubre la página y luego se navega ---- */
  const irA = (destino) => {
    if (navegando) return;
    navegando = true;
    mostrarOverlay();

    gsap.set(contenido, { autoAlpha: 1, scale: 1 });
    gsap.to(overlay, {
      autoAlpha: 1,
      duration: DURACION_ENTRADA,
      ease: 'power2.inOut',
      onComplete: () => {
        window.location.href = destino;
      },
    });

    // Seguro: si algo falla con la animación, navega igualmente
    window.setTimeout(() => {
      window.location.href = destino;
    }, 1500);
  };

  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    const enlace = e.target.closest('a[href]');
    if (!enlace) return;
    if (enlace.target && enlace.target !== '_self') return; // pestañas nuevas
    if (enlace.hasAttribute('download')) return;

    const url = new URL(enlace.href, window.location.href);
    if (url.origin !== window.location.origin) return; // enlaces externos, mailto:, tel:...
    if (url.pathname === window.location.pathname && url.search === window.location.search) return; // misma página / #ancla

    e.preventDefault();
    irA(url.href);
  });
}