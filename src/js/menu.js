/** Cabecera de escritorio (partials/header.html): marca la página actual. */
function marcarEnlaceActivo() {
  const cabecera = document.querySelector('[data-header]');
  if (!cabecera) return;

  const normalizar = (url) =>
    new URL(url, location.href).pathname.replace(/index\.html$/, '').replace(/\/$/, '');
  const actual = normalizar(location.href);

  cabecera.querySelectorAll('a[href]').forEach((a) => {
    if (normalizar(a.getAttribute('href')) !== actual) return;
    a.setAttribute('aria-current', 'page');
    // Si está dentro de un desplegable, resalta también el enlace principal del grupo
    const grupo = a.closest('[data-grupo]');
    grupo?.querySelector(':scope > a')?.setAttribute('data-actual', 'true');
  });
}

/** Menú móvil y submenús desplegables. */
export function iniciarMenu() {
  marcarEnlaceActivo();

  const boton = document.querySelector('[data-menu-btn]');
  const menu = document.querySelector('[data-menu]');
  if (!boton || !menu) return;

  const alternar = (abrir) => {
    menu.hidden = !abrir;
    boton.setAttribute('aria-expanded', String(abrir));
    boton.setAttribute('aria-label', abrir ? 'Cerrar menú' : 'Abrir menú');
    const icono = boton.querySelector('iconify-icon');
    if (icono) icono.setAttribute('icon', abrir ? 'lucide:x' : 'lucide:menu');
  };

  boton.addEventListener('click', () => alternar(menu.hidden));
  
  // Cerrar menú general al hacer clic en un enlace final
  menu.addEventListener('click', (e) => {
    if (e.target.closest('a') && !e.target.closest('[data-submenu-btn]')) {
      alternar(false);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') alternar(false);
  });

  // --- Lógica para desplegar submenús móviles mediante la flecha ---
  const botonesSubmenu = menu.querySelectorAll('[data-submenu-btn]');
  botonesSubmenu.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const grupo = btn.closest('.nav-movil-grupo');
      const submenu = grupo.querySelector('[data-submenu]');
      const iconoFlecha = btn.querySelector('iconify-icon');
      const estaAbierto = !submenu.hidden;

      // Alternar estado del submenú
      submenu.hidden = estaAbierto;
      btn.setAttribute('aria-expanded', String(!estaAbierto));

      // Rotar la flecha suavemente
      if (iconoFlecha) {
        iconoFlecha.style.transform = estaAbierto ? 'rotate(0deg)' : 'rotate(180deg)';
      }
    });
  });
}