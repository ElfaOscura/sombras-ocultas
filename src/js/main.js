import '../css/style.css';
import 'iconify-icon';
import { iniciarModales } from './modales.js';
import { iniciarParticulas } from './particulas.js';
import { iniciarMenu } from './menu.js';
import { iniciarAnimaciones } from './animaciones.js';
import { iniciarVolverArriba } from './volver-arriba.js';


document.querySelectorAll('[data-anio]').forEach((el) => {
  el.textContent = new Date().getFullYear();
});

iniciarModales();
iniciarMenu();
iniciarAnimaciones();
iniciarParticulas();
iniciarVolverArriba();