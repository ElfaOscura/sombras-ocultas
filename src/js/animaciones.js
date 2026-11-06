import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ---------- HERO: entrada al cargar ---------- */
function heroEntrada() {
  if (!document.querySelector('#titulo')) return; // solo en la portada
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.2 });

  // Espectro y subtítulo
  tl.from('.espectro-bg img', { opacity: 0, scale: 1.15, duration: 2.5, ease: 'power2.out' }, 0);
  tl.from('.contenido-titulo .subtitulo', { opacity: 0, y: 20, letterSpacing: '0.6em', duration: 1.6 }, 0.6);

  // Solo en escritorio (en móvil esas columnas están ocultas)
  if (!matchMedia('(min-width: 768px)').matches) return;

  // El arco se dibuja de arriba abajo
  document.querySelectorAll('.arco-nav path').forEach((p) => {
    try {
      const len = p.getTotalLength();
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      tl.to(p, { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut' }, 0.2);
    } catch (_) {}
  });

  // Iconos: entran desde los lados girando, uno tras otro
  const izq = gsap.utils.toArray('[data-hero-lado="izq"] .nav-link');
  const der = gsap.utils.toArray('[data-hero-lado="der"] .nav-link');
  const entrada = { opacity: 0, scale: 0.3, duration: 1.1, stagger: 0.2, ease: 'back.out(1.7)' };

  tl.from(izq, { ...entrada, x: -90, rotation: -120 }, 0.4);
  tl.from(der, { ...entrada, x: 90, rotation: 120 }, 0.4);

  // Después de entrar, flotan suavemente (cada uno a su ritmo)
  tl.add(() => {
    [...izq, ...der].forEach((el, i) => {
      gsap.to(el, {
        y: i % 2 ? -7 : 7,
        duration: 2.6 + i * 0.35,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
    });
  });
}

/* ---------- HERO: efectos al hacer scroll ---------- */
function heroScroll() {
  if (!document.querySelector('#titulo')) return; // solo en la portada
  const st = { trigger: '#titulo', start: 'top top', end: 'bottom top', scrub: true };

  // Parallax: el espectro y la niebla se mueven más lento que el resto
  gsap.to('.espectro-bg img', { yPercent: 18, scale: 1.12, ease: 'none', scrollTrigger: st });
  gsap.to('.niebla-hero', { yPercent: 25, ease: 'none', scrollTrigger: st });

  // El título sube y se desvanece
  gsap.to('.contenido-titulo', { y: -90, opacity: 0, ease: 'none', scrollTrigger: st });

  // Las columnas de iconos se retiran hacia los lados
  gsap.to('[data-hero-lado="izq"]', { xPercent: -70, opacity: 0, ease: 'none', scrollTrigger: st });
  gsap.to('[data-hero-lado="der"]', { xPercent: 70, opacity: 0, ease: 'none', scrollTrigger: st });
}

/* ---------- SECCIÓN 2: Johari ---------- */
function seccionJohari() {
  const s = '#johari';
  if (!document.querySelector(s)) return;

  const tl = gsap.timeline({
    defaults: { ease: 'power3.out' },
    scrollTrigger: { trigger: s, start: 'top 72%', once: true },
  });

  tl.from(s, { opacity: 0, y: 110, scale: 0.94, duration: 1.1 })
    .from(`${s} .adorno`, { opacity: 0, scaleX: 0.2, duration: 1 }, 0.3)
    .from(`${s} .esquina`, { opacity: 0, scale: 0.4, duration: 0.8, stagger: 0.1 }, 0.5)
    // Imagen: pasa de transparente y borrosa a nítida
    .from(`${s} figure img[src*="Johari"]`, {
      opacity: 0,
      filter: 'blur(24px)',
      scale: 1.2,
      duration: 1.8,
      ease: 'power2.out',
      clearProps: 'filter', // quita el filtro al terminar para no gastar rendimiento
    }, 0.4)
    // Texto en cascada desde la derecha
    .from(`${s} .grid > div:last-child > *`, { opacity: 0, x: 50, duration: 0.9, stagger: 0.15 }, 0.7);
}

/* ---------- PÁGINAS INTERIORES: cabecera ----------
   Uso: <header data-cabecera> con elementos [data-cabecera-item] (migas, título, subtítulo)
   y, opcionalmente, una imagen [data-cabecera-fondo] que hace parallax al bajar. */
function cabeceraInterior() {
  const cab = document.querySelector('[data-cabecera]');
  if (!cab) return;

  gsap.from(cab.querySelectorAll('[data-cabecera-item]'), {
    opacity: 0,
    y: 26,
    duration: 1,
    stagger: 0.15,
    delay: 0.15,
    ease: 'power3.out',
  });

  gsap.from(cab.querySelectorAll('.espectro-bg img'), { opacity: 0, scale: 1.12, duration: 2, ease: 'power2.out' });

  const fondo = cab.querySelector('[data-cabecera-fondo]');
  if (fondo) {
    gsap.to(fondo, {
      yPercent: 15,
      ease: 'none',
      scrollTrigger: { trigger: cab, start: 'top top', end: 'bottom top', scrub: true },
    });
  }
}

/* ---------- Imágenes que pasan de borrosas a nítidas al entrar en pantalla ----------
   Uso: <img data-enfoque ...> */
function imagenesEnfoque() {
  gsap.utils.toArray('[data-enfoque]').forEach((img) => {
    gsap.from(img, {
      opacity: 0,
      filter: 'blur(22px)',
      scale: 1.15,
      duration: 1.6,
      ease: 'power2.out',
      clearProps: 'filter',
      scrollTrigger: { trigger: img.closest('figure') || img, start: 'top 85%', once: true },
    });
  });
}

/* ---------- Principal ---------- */
export function iniciarAnimaciones() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  gsap.from('#nav', { y: -30, opacity: 0, duration: 0.8, ease: 'power3.out' });

  heroEntrada();
  heroScroll();
  seccionJohari();
  cabeceraInterior();
  imagenesEnfoque();

  const elementos = gsap.utils.toArray('[data-reveal]');
  if (!elementos.length) return;

  gsap.set(elementos, { opacity: 0, y: 30 });
  ScrollTrigger.batch(elementos, {
    start: 'top 88%',
    once: true,
    onEnter: (lote) =>
      gsap.to(lote, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        stagger: 0.12,
        overwrite: true,
      }),
  });
}