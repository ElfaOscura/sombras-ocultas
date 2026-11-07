// src/js/modales.js  (REEMPLAZA el archivo actual)
// Se auto-inicia: basta con  import './modales.js';  en main.js
// Modales <dialog> con animación GSAP: fade + scale, y variante "libro" (data-libro) que abre la tapa.
// Uso: data-modal-abrir="id-del-dialog" · data-modal-cerrar · Esc · clic fuera.
import { gsap } from 'gsap';

const reducirMovimiento = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let ultimoDisparador = null;

const esEscritorio = () => window.matchMedia('(min-width: 768px)').matches;

function partesLibro(dialog) {
  return {
    tapa: dialog.querySelector('[data-tapa]'),
    sombra: dialog.querySelector('[data-sombra]'),
    contenido: dialog.querySelectorAll('[data-pagina] > *'),
  };
}

// ---------- Modal normal: fade + scale ----------
function abrirNormal(dialog) {
  const contenido = dialog.querySelectorAll(':scope > div > *');

  if (reducirMovimiento()) {
    gsap.set(dialog, { opacity: 1, scale: 1, y: 0, '--fondo': 1 });
    return;
  }

  gsap.fromTo(
    dialog,
    { opacity: 0, scale: 0.92, y: 28, '--fondo': 0 },
    { opacity: 1, scale: 1, y: 0, '--fondo': 1, duration: 0.5, ease: 'power3.out' }
  );
  gsap.fromTo(
    contenido,
    { opacity: 0, y: 14 },
    { opacity: 1, y: 0, duration: 0.45, stagger: 0.08, delay: 0.1, ease: 'power2.out', clearProps: 'all' }
  );
}

// ---------- Modal "libro": la tapa gira sobre el lomo y descubre la sinopsis ----------
function abrirLibro(dialog) {
  const { tapa, sombra, contenido } = partesLibro(dialog);
  const desk = esEscritorio();
  const giro = desk ? -180 : -100; // en móvil no hay hoja izquierda: la tapa solo se aparta

  gsap.set(tapa, { transformOrigin: '0% 50%' });

  if (reducirMovimiento()) {
    gsap.set(dialog, { opacity: 1, '--fondo': 1 });
    gsap.set(tapa, { rotationY: giro, autoAlpha: desk ? 1 : 0 });
    return;
  }

  // Libro cerrado: en escritorio se desplaza para que la portada quede centrada en pantalla
  gsap.set(dialog, { opacity: 0, scale: 0.9, y: 24, xPercent: desk ? -25 : 0, '--fondo': 0 });
  gsap.set(tapa, { rotationY: 0, autoAlpha: 1 });
  gsap.set(sombra, { opacity: 0.55 });
  gsap.set(contenido, { opacity: 0, y: 12 });

  dialog._tl = gsap
    .timeline()
    .to(dialog, { opacity: 1, scale: 1, y: 0, '--fondo': 1, duration: 0.55, ease: 'power3.out' })
    .to(tapa, { rotationY: giro, duration: 1.2, ease: 'power2.inOut' }, '+=0.25')
    .to(dialog, { xPercent: 0, duration: 1.2, ease: 'power2.inOut' }, '<')
    .to(sombra, { opacity: 0, duration: 1.2, ease: 'power1.out' }, '<')
    .to(contenido, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }, '-=0.5')
    .set(tapa, { autoAlpha: desk ? 1 : 0 });
}

function cerrarLibro(dialog, terminar) {
  const { tapa, sombra, contenido } = partesLibro(dialog);
  const desk = esEscritorio();

  dialog._tl = gsap
    .timeline({ onComplete: terminar })
    .to(contenido, { opacity: 0, duration: 0.2 })
    .set(tapa, { autoAlpha: 1 })
    .to(tapa, { rotationY: 0, duration: 0.9, ease: 'power2.inOut' })
    .to(dialog, { xPercent: desk ? -25 : 0, duration: 0.9, ease: 'power2.inOut' }, '<')
    .to(sombra, { opacity: 0.55, duration: 0.9 }, '<')
    .to(dialog, { opacity: 0, scale: 0.92, y: 18, '--fondo': 0, duration: 0.35, ease: 'power2.in' });
}

function abrir(dialog, disparador) {
  if (!dialog || dialog.open) return;
  ultimoDisparador = disparador || null;
  gsap.killTweensOf(dialog);
  if (dialog._tl) dialog._tl.kill();
  dialog.showModal();

  if (dialog.hasAttribute('data-libro')) abrirLibro(dialog);
  else abrirNormal(dialog);
}

function cerrar(dialog) {
  if (!dialog || !dialog.open || dialog.dataset.cerrando) return;
  dialog.dataset.cerrando = '1';
  gsap.killTweensOf(dialog);
  if (dialog._tl) dialog._tl.kill();

  const esLibro = dialog.hasAttribute('data-libro');

  const terminar = () => {
    dialog.close();
    delete dialog.dataset.cerrando;
    gsap.set(dialog, { clearProps: 'opacity,transform,--fondo' });
    if (esLibro) {
      const { tapa, sombra, contenido } = partesLibro(dialog);
      gsap.set([tapa, sombra, ...contenido], { clearProps: 'all' });
    }
    if (ultimoDisparador && document.contains(ultimoDisparador)) ultimoDisparador.focus();
  };

  if (reducirMovimiento()) return terminar();
  if (esLibro) return cerrarLibro(dialog, terminar);

  gsap.to(dialog, {
    opacity: 0,
    scale: 0.94,
    y: 18,
    '--fondo': 0,
    duration: 0.3,
    ease: 'power2.in',
    onComplete: terminar,
  });
}

let iniciado = false;

export function initModales() {
  if (iniciado) return; // evita registrar los eventos dos veces
  iniciado = true;

  // Abrir
  document.addEventListener('click', (e) => {
    const disparador = e.target.closest('[data-modal-abrir]');
    if (disparador) {
      e.preventDefault();
      abrir(document.getElementById(disparador.dataset.modalAbrir), disparador);
      return;
    }

    // Cerrar con botón
    const botonCerrar = e.target.closest('[data-modal-cerrar]');
    if (botonCerrar) {
      cerrar(botonCerrar.closest('dialog'));
      return;
    }

    // Cerrar al hacer clic en el fondo (el propio <dialog>, no su contenido)
    if (e.target instanceof HTMLDialogElement && e.target.open) cerrar(e.target);
  });

  // Esc: cancelamos el cierre nativo para animarlo con GSAP
  document.addEventListener(
    'cancel',
    (e) => {
      if (e.target instanceof HTMLDialogElement) {
        e.preventDefault();
        cerrar(e.target);
      }
    },
    true
  );
}

// Se inicia solo al importar el archivo, sin depender de cómo lo llame main.js
initModales();