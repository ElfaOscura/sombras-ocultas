import '../css/style.css';
import 'iconify-icon';
import { iniciarParticulas } from './particulas.js';
import { iniciarMenu } from './menu.js';
import { iniciarAnimaciones } from './animaciones.js';
import { iniciarVolverArriba } from './volver-arriba.js';
import { initModales } from './modales.js';   
import { initLibros } from './libros.js';     // nuevo
import './mapa-interactivo.js';

document.querySelectorAll('[data-anio]').forEach((el) => {
  el.textContent = new Date().getFullYear();
});


iniciarMenu();
iniciarAnimaciones();
iniciarParticulas();
iniciarVolverArriba();
initModales();
initLibros();
/*document.addEventListener('DOMContentLoaded', () => {
  // Protección de imágenes (requisito del proyecto): sin clic derecho ni arrastre
  document.addEventListener('contextmenu', (e) => {
    if (e.target instanceof HTMLImageElement) e.preventDefault();
  });
  document.addEventListener('dragstart', (e) => {
    if (e.target instanceof HTMLImageElement) e.preventDefault();
  });
});*/