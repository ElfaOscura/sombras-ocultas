// Modales de los reinos (<dialog> nativo)
// Abrir:  <button data-modal-abrir="id-del-dialog">
// Cerrar: <button data-modal-cerrar> dentro del <dialog>, Esc o clic fuera

export function iniciarModales() {
  const root = document.documentElement;

  function bloquearScroll() {
    const barra = window.innerWidth - root.clientWidth;
    root.style.overflow = 'hidden';
    if (barra > 0) root.style.paddingRight = `${barra}px`;
  }

  function desbloquearScroll() {
    if (document.querySelector('dialog[open]')) return;
    root.style.overflow = '';
    root.style.paddingRight = '';
  }

  // Un solo listener para todo: abrir, cerrar con la X y cerrar al pulsar el fondo
  document.addEventListener('click', (e) => {
    const abrir = e.target.closest('[data-modal-abrir]');
    if (abrir) {
      const dialog = document.getElementById(abrir.dataset.modalAbrir);
      if (dialog && typeof dialog.showModal === 'function' && !dialog.open) {
        bloquearScroll();
        dialog.showModal();
      }
      return;
    }

    const cerrar = e.target.closest('[data-modal-cerrar]');
    if (cerrar) {
      cerrar.closest('dialog')?.close();
      return;
    }

    // Clic en el fondo oscuro: el propio <dialog> es el target
    if (e.target instanceof HTMLDialogElement && e.target.open) {
      e.target.close();
    }
  });

  // "close" no burbujea, pero sí se puede captar en la fase de captura
  document.addEventListener(
    'close',
    (e) => {
      if (e.target instanceof HTMLDialogElement) desbloquearScroll();
    },
    true
  );

  console.info('[modales] iniciado'); // bórralo cuando compruebes que funciona
}