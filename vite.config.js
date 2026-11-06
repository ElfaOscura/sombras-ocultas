import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { globSync } from 'glob';
import { readFileSync } from 'node:fs';
import { resolve, basename, relative } from 'node:path';

/**
 * Parciales HTML: <!--@include partials/nav.html-->
 * Se reemplazan por el contenido del archivo (en dev y en build).
 * Más adelante cada parcial se convierte en un header.php / footer.php.
 */
const incluirParciales = () => ({
  name: 'incluir-parciales',
  transformIndexHtml: {
    order: 'pre',
    handler(html) {
      return html.replace(/<!--@include\s+(.+?)\s*-->/g, (_, ruta) =>
        readFileSync(resolve(__dirname, 'src', ruta.trim()), 'utf-8'),
      );
    },
  },
});
// 1. Define los nombres exactos de los archivos HTML que quieres ignorar
const archivosIgnorados = ['guia-estilos.html', 'plantillas-secciones.html'];

// Busca todos los .html en la raíz y en cualquier subcarpeta (excepto src/partials/ y node_modules/)
const paginas = Object.fromEntries(
  globSync('**/*.html', {
    cwd: __dirname,
    ignore: ['node_modules/**', 'dist/**', 'src/partials/**'], // Evita procesar componentes parciales como páginas
  })
    .filter((f) => !archivosIgnorados.includes(basename(f)))
    .map((f) => [
      // Mantiene la estructura de carpetas en la clave para evitar colisiones de nombres
      relative(__dirname, resolve(__dirname, f)).replace(/\.html$/, ''),
      resolve(__dirname, f),
    ])
);


export default defineConfig({
  // El sitio vive en naidiart.com/sombras-ocultas/
  base: '/sombras-ocultas/',
  plugins: [tailwindcss(), incluirParciales()],
  build: {
    rollupOptions: { 
      input: paginas,
      output: {
        // Nombra los scripts principales sin hashes aleatorios
        entryFileNames: 'assets/[name].js',
        // Nombra los fragmentos o chunks adicionales de código
        chunkFileNames: 'assets/[name].js',
        // Fuerza a que las hojas de estilo se llamen siempre style.css (o conserve su nombre base sin hash)
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'assets/style.css';
          }
          return 'assets/[name][extname]';
        }
      }
    },
  },
});
