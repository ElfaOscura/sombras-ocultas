// src/js/modales.js  (REEMPLAZA el archivo actual)
// Se auto-inicia: basta con  import './modales.js';  en main.js
// Modales <dialog> con animación GSAP (fade + scale) de entrada y salida.
// Uso: data-modal-abrir="id-del-dialog" · data-modal-cerrar · Esc · clic fuera.
import { gsap } from 'gsap';

const reducirMovimiento = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let ultimoDisparador = null;

function abrir(dialog, disparador) {
  if (!dialog || dialog.open) return;
  ultimoDisparador = disparador || null;
  gsap.killTweensOf(dialog);
  dialog.showModal();

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

function cerrar(dialog) {
  if (!dialog || !dialog.open || dialog.dataset.cerrando) return;
  dialog.dataset.cerrando = '1';
  gsap.killTweensOf(dialog);

  const terminar = () => {
    dialog.close();
    delete dialog.dataset.cerrando;
    gsap.set(dialog, { clearProps: 'opacity,transform,--fondo' });
    if (ultimoDisparador && document.contains(ultimoDisparador)) ultimoDisparador.focus();
  };

  if (reducirMovimiento()) return terminar();

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