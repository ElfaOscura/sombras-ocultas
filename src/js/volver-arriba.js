/** Botón "volver arriba": aparece al bajar y sube suavemente. */
export function iniciarVolverArriba() {
  const boton = document.querySelector('[data-volver-arriba]');
  if (!boton) return;

  const actualizar = () => {
    boton.dataset.visible = String(window.scrollY > 500);
  };

  window.addEventListener('scroll', actualizar, { passive: true });
  actualizar();

  boton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}