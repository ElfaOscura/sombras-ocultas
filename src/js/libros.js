// src/js/libros.js  (ARCHIVO NUEVO)
// Se auto-inicia: basta con  import './libros.js';  en main.js
// Entrada escalonada (stagger) de las portadas con GSAP + ScrollTrigger.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Hover con GSAP: el libro se endereza y crece hacia el frente (sin irse de lado), sigue al cursor
// y los vecinos se encogen un poco. Se apaga con prefers-reduced-motion y en pantallas táctiles.
function initHoverLibros(slots) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const libros = [...slots].map((s) => s.querySelector('.libro'));
  const pose = libros.map((l) => ({
    ry: parseFloat(getComputedStyle(l).getPropertyValue('--ry')) || 0,
    tz: parseFloat(getComputedStyle(l).getPropertyValue('--tz')) || 0,
  }));

  // GSAP toma el control del transform (misma pose que define el CSS)
  libros.forEach((l, i) => gsap.set(l, { rotationY: pose[i].ry, z: pose[i].tz, rotationX: 0, x: 0, y: 0, scale: 1 }));

  const reposo = () =>
    gsap.to(libros, {
      rotationY: (i) => pose[i].ry,
      rotationX: 0,
      z: (i) => pose[i].tz,
      x: 0,
      y: 0,
      scale: 1,
      duration: 0.9,
      ease: 'elastic.out(1, 0.7)',
      overwrite: 'auto',
    });

  slots.forEach((slot, i) => {
    const libro = libros[i];
    const activo = libro.classList.contains('libro-activo');

    const entrar = () => {
      slot.dataset.hover = '';

      const zNuevo = activo ? 60 : 30;

      // La perspectiva empuja hacia afuera lo que se acerca a cámara. Compensamos en X
      // para que el libro crezca "hacia el frente" sin desplazarse hacia un lado.
      const est = slot.closest('.estanteria');
      const P = parseFloat(getComputedStyle(est).perspective) || 1200;
      const re = est.getBoundingClientRect();
      const rs = slot.getBoundingClientRect();
      const c0 = rs.left + rs.width / 2 - (re.left + re.width / 2);
      const compX = c0 * ((P - zNuevo) / (P - pose[i].tz) - 1);

      gsap.to(libro, {
        rotationY: 0,
        z: zNuevo,
        x: compX,
        y: activo ? -18 : -8,
        scale: activo ? 1.22 : 1.05,
        duration: 0.6,
        ease: 'back.out(1.5)',
        overwrite: 'auto',
      });

      // Los demás solo se encogen un poco (no se mueven de lado)
      libros.forEach((otro, j) => {
        if (j === i) return;
        gsap.to(otro, { scale: 0.96, duration: 0.6, ease: 'power3.out', overwrite: 'auto' });
      });
    };

    const salir = () => {
      delete slot.dataset.hover;
      reposo();
    };

    slot.addEventListener('pointerenter', (e) => e.pointerType !== 'touch' && entrar());
    slot.addEventListener('pointerleave', (e) => e.pointerType !== 'touch' && salir());
    slot.addEventListener('focusin', entrar);
    slot.addEventListener('focusout', salir);

    // Inclinación siguiendo al cursor
    slot.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      const r = slot.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(libro, {
        rotationY: px * (activo ? 14 : 8),
        rotationX: -py * (activo ? 12 : 6),
        duration: 0.4,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    });
  });
}

export function initLibros() {
  const fila = document.querySelector('.estanteria-fila');
  if (!fila) return;

  const slots = fila.querySelectorAll('.libro-slot');
  const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (sinMovimiento) {
    gsap.set(slots, { clearProps: 'all' });
    return;
  }

  initHoverLibros(slots);

  // Estado inicial (evita parpadeo)
  gsap.set(slots, { opacity: 0, y: 70, scale: 0.85, rotateX: -12, transformOrigin: '50% 100%' });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: fila,
      start: 'top 80%',
      once: true,
    },
  });

  tl.to(
    slots,
    {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      duration: 0.9,
      ease: 'back.out(1.4)',
      stagger: { each: 0.12, from: 'start' },
      clearProps: 'transform',
    },
  );
}

// Se inicia solo cuando el DOM está listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLibros, { once: true });
} else {
  initLibros();
}