/* ==========================================================================
   MAPA INTERACTIVO · lógica (sin librerías: zoom, arrastre y pellizco propios)
   Uso: importa este archivo desde main.js →  import './mapa-interactivo.js';
   Se activa solo en páginas que tengan un elemento [data-mapa].
   ========================================================================== */
import { GEO } from './mapa-geo.js';
import { REINOS } from './mapa-datos.js';

const W0 = 1600, H0 = 926, SVGNS = 'http://www.w3.org/2000/svg';
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function iniciar(root) {
  const $ = (s) => root.querySelector(s);
  const stage = $('[data-mapa-escenario]');
  const world = $('[data-mapa-mundo]');
  const gAreas = $('[data-mapa-areas]');
  const pDim = $('[data-mapa-oscuro]'), pSel = $('[data-mapa-sel]'), pHi = $('[data-mapa-hi]');
  const tip = $('[data-mapa-tip]');
  const panel = $('[data-mapa-ficha]'), body = $('[data-mapa-cuerpo]');
  const legend = $('[data-mapa-leyenda]');
  const marco = $('[data-mapa-marco]'), sitio = $('[data-mapa-sitio]');

  // Al abrir una ficha, el mapa se traslada a este contenedor que cubre toda la pantalla
  const portal = document.createElement('div');
  portal.className = 'mapa mapa-portal';
  portal.setAttribute('role', 'dialog');
  portal.setAttribute('aria-modal', 'true');
  portal.setAttribute('aria-label', 'Ficha del reino');

  const porId = Object.fromEntries(REINOS.map((r, i) => [r.id, Object.assign(r, { i })]));
  const mqApilado = window.matchMedia('(max-width:860px)');
  const sinMovimiento = window.matchMedia('(prefers-reduced-motion:reduce)');

  let W = 0, H = 0, s0 = 1, k = 1, tx = 0, ty = 0, sel = null, lado = 'right', ultimoFoco = null;
  let expandido = false, tCierre = 0, bloqueo = false, inertPrevio = [], overflowPrevio = '';
  const M = 16; // margen de la ficha respecto al borde
  const marcar = (cls, on) => { root.classList.toggle(cls, on); portal.classList.toggle(cls, on); };
  const variable = (n, v) => { root.style.setProperty(n, v); portal.style.setProperty(n, v); };

  /* ---------- Protección de imágenes: sin clic derecho ni arrastre ---------- */
  [root, portal].forEach((el) => {
    el.addEventListener('contextmenu', (e) => { if (e.target.closest('[data-mapa-escenario], img')) e.preventDefault(); });
    el.addEventListener('dragstart', (e) => { if (e.target.closest('img')) e.preventDefault(); });
  });

  /* ---------- Construcción: áreas clicables y leyenda ---------- */
  REINOS.forEach((r) => {
    const g = GEO[r.id]; if (!g) return;
    const p = document.createElementNS(SVGNS, 'path');
    p.setAttribute('d', g.d); p.setAttribute('class', 'mapa-area'); p.dataset.id = r.id;
    p.setAttribute('tabindex', '0'); p.setAttribute('role', 'button');
    p.setAttribute('aria-label', `${r.nombre}, ${r.etiqueta}. Abrir ficha`);
    gAreas.appendChild(p);

    const b = document.createElement('button');
    b.type = 'button'; b.dataset.id = r.id; b.setAttribute('aria-pressed', 'false');
    b.className = 'mapa-chip'; b.style.setProperty('--c', r.mapa);
    b.innerHTML = `<i aria-hidden="true"></i>${esc(r.nombre)}`;
    legend.appendChild(b);
  });

  /* ---------- Cámara ---------- */
  // El mapa se ajusta ("contain") al escenario; el sobrante lo cubre la copia desenfocada del fondo
  function medir() { W = stage.clientWidth; H = stage.clientHeight; s0 = Math.min(W / W0, H / H0); }
  const reservado = () => (mqApilado.matches ? 0 : panel.offsetWidth + M + 10);
  function ajustar(s, x, y) { // centra el eje que cabe entero y limita el que desborda
    const cx = W0 * s <= W ? (W - W0 * s) / 2 : Math.min(0, Math.max(W - W0 * s, x));
    const cy = H0 * s <= H ? (H - H0 * s) / 2 : Math.min(0, Math.max(H - H0 * s, y));
    return [cx, cy];
  }
  function limitar() { [tx, ty] = ajustar(s0 * k, tx, ty); }
  function aplicar(animar) {
    world.classList.toggle('is-anim', !!animar && !sinMovimiento.matches);
    world.style.transform = `translate3d(${tx}px,${ty}px,0) scale(${s0 * k})`;
    stage.classList.toggle('is-zoom', k > 1.01);
  }
  function zoomEn(cx, cy, nk, animar) {
    nk = Math.min(6, Math.max(1, nk));
    const r = nk / k;
    tx = cx - (cx - tx) * r; ty = cy - (cy - ty) * r; k = nk;
    limitar(); aplicar(animar);
  }
  function inicio(animar) { k = 1; [tx, ty] = ajustar(s0, 0, 0); aplicar(animar); }

  // Cámara que deja el reino centrado en la zona libre (la que no tapa la ficha)
  function plan(id, ld) {
    const [x0, y0, x1, y1] = GEO[id].bbox, pw = reservado(), aw = W - pw;
    const bw = (x1 - x0) * s0, bh = (y1 - y0) * s0;
    const nk = Math.min(3.2, Math.max(1, Math.min((aw * 0.68) / bw, (H * 0.68) / bh)));
    const s = s0 * nk, ax = ld === 'left' ? pw : 0;
    const [ntx, nty] = ajustar(s, ax + aw / 2 - ((x0 + x1) / 2) * s, H / 2 - ((y0 + y1) / 2) * s);
    const L = x0 * s + ntx, R = x1 * s + ntx;
    const lo = ld === 'left' ? 0 : W - pw, hi = ld === 'left' ? pw : W;
    return { k: nk, tx: ntx, ty: nty, lado: ld, solape: Math.max(0, Math.min(R, hi) - Math.max(L, lo)) };
  }
  function ladoFicha(ld, abierta) {
    lado = ld;
    const pw = panel.offsetWidth, abierto = ld === 'right' ? W - 2 * M - pw : 0;
    const cerrado = ld === 'right' ? W : -(pw + 40);
    panel.style.setProperty('--tx', `${abierta ? abierto : cerrado}px`);
  }
  function enfocar(id, animar) {
    if (!GEO[id]) return;
    const a = plan(id, 'right'), b = plan(id, 'left');
    const mejor = !mqApilado.matches && b.solape < a.solape - 8 ? b : a; // el lado que menos tapa al reino
    k = mejor.k; tx = mejor.tx; ty = mejor.ty;
    aplicar(animar); ladoFicha(mejor.lado, true);
  }

  /* ---------- Pantalla completa: el mapa pasa a un contenedor que cubre toda la ventana ---------- */
  function bloquearFondo(on) {
    if (on) {
      inertPrevio = [...document.body.children].filter((el) => el !== portal && el.tagName !== 'SCRIPT').map((el) => [el, el.inert]);
      inertPrevio.forEach(([el]) => { el.inert = true; });
      overflowPrevio = document.documentElement.style.overflow;
      document.documentElement.style.overflow = 'hidden';
    } else {
      inertPrevio.forEach(([el, v]) => { el.inert = v; });
      inertPrevio = [];
      document.documentElement.style.overflow = overflowPrevio;
    }
  }
  function expandir() {
    clearTimeout(tCierre);
    if (expandido) { portal.classList.add('is-visible'); return; }
    expandido = true;
    document.body.appendChild(portal);
    portal.appendChild(marco);
    marcar('is-expanded', true);
    bloquearFondo(true);
    bloqueo = true; medir(); inicio(false); void world.offsetWidth; // parte de la vista completa y de ahí se acerca
    requestAnimationFrame(() => portal.classList.add('is-visible'));
    setTimeout(() => { bloqueo = false; }, 160);
  }
  function contraer() {
    portal.classList.remove('is-visible');
    clearTimeout(tCierre);
    tCierre = setTimeout(() => {
      sitio.appendChild(marco);
      portal.remove();
      expandido = false; marcar('is-expanded', false);
      bloquearFondo(false);
      medir(); inicio(false); ladoFicha(lado, false);
      if (ultimoFoco && document.contains(ultimoFoco)) { try { ultimoFoco.focus({ preventScroll: true }); } catch (e) { /* noop */ } }
      ultimoFoco = null;
    }, 340);
  }

  /* ---------- Resaltes ---------- */
  function resaltar(id) {
    const r = id && porId[id];
    if (!r || id === sel) pHi.classList.remove('on');
    else { pHi.setAttribute('d', GEO[id].d); pHi.style.setProperty('--c', r.mapa); pHi.classList.add('on'); }
    legend.querySelectorAll('button').forEach((b) => b.classList.toggle('is-hover', b.dataset.id === id && id !== sel));
  }
  function mostrarTip(id, x, y) {
    const r = porId[id];
    if (!r || id === sel) { tip.classList.remove('on'); return; }
    tip.textContent = `${r.nombre} · ${r.etiqueta}`; tip.style.setProperty('--c', r.mapa);
    const tw = tip.offsetWidth, th = tip.offsetHeight;
    let px = x + 16, py = y + 18;
    if (px + tw > W - 8) px = x - tw - 12;
    if (py + th > H - 8) py = y - th - 12;
    tip.style.transform = `translate(${Math.max(8, px)}px,${Math.max(8, py)}px)`;
    tip.classList.add('on');
  }

  /* ---------- Ficha ---------- */
  function fila(etq, valor) { return `<dt>${esc(etq)}</dt><dd>${valor}</dd>`; }
  function pintarFicha(r) {
    const f = [];
    if (r.cultura) f.push(fila('Cultura', esc(r.cultura)));
    if (r.ubicacion) f.push(fila('Ubicación', esc(r.ubicacion)));
    if (r.arma) f.push(fila('Arma sagrada', `<span class="mapa-punto" style="background:${esc(r.arma.color)}" aria-hidden="true"></span><span><strong>${esc(r.arma.nombre)}</strong> · ${esc(r.arma.descripcion)}</span>`));
    if (r.significado) f.push(fila('Significado', esc(r.significado)));
    if (r.portador) f.push(fila('Portador', esc(r.portador)));
    (r.datos || []).forEach((d) => f.push(fila(d[0], esc(d[1]))));

    let h = '';
    h += `<img class="mapa-escudo" src="${esc(r.escudo)}" alt="Escudo de ${esc(r.nombre)}" draggable="false" />`;
    h += `<p class="subtitulo mapa-tipo">${esc(r.tipo)}</p>`;
    h += `<h2 class="font-titulo titulo-plata mapa-titulo" id="mapa-ficha-titulo" tabindex="-1">${esc(r.nombre)}</h2>`;
    h += `<p class="subtitulo mapa-etiqueta">${esc(r.etiqueta)}</p>`;
    if (r.lema) h += `<p class="mapa-lema">${esc(r.lema)}</p>`;
    h += '<hr class="mapa-filo" />';
    if (r.resumen) h += `<p class="mapa-texto">${esc(r.resumen)}</p>`;
    if (f.length) h += `<dl class="mapa-datos">${f.join('')}</dl>`;
    if (r.proteccion) h += `<p class="mapa-texto"><strong>Protección divina:</strong> ${esc(r.proteccion)}</p>`;
    if (r.aliados && r.aliados.length) {
      h += '<h3 class="mapa-h3">Alianzas</h3><div class="mapa-enlaces">' +
        r.aliados.filter((a) => porId[a]).map((a) => `<button type="button" class="mapa-chip" data-ir="${a}" style="--c:${porId[a].mapa}"><i aria-hidden="true"></i>${esc(porId[a].nombre)}</button>`).join('') + '</div>';
    }
    if (r.grupos && r.grupos.length) {
      h += '<h3 class="mapa-h3">Casas y grupos</h3><ul class="mapa-grupos">' +
        r.grupos.map((g) => `<li><b>${esc(g.nombre)}</b>${g.tipo ? `<small>${esc(g.tipo)}</small>` : ''}${g.texto ? `<p>${esc(g.texto)}</p>` : ''}</li>`).join('') + '</ul>';
    }
    if (r.enlace) h += `<div class="mapa-pie"><a class="boton" href="${esc(r.enlace.href)}">${esc(r.enlace.texto)}</a></div>`;

    body.innerHTML = h;
    const img = body.querySelector('.mapa-escudo');
    if (img) img.addEventListener('error', () => img.remove());
    body.scrollTop = 0;
    body.classList.remove('is-in'); void body.offsetWidth; body.classList.add('is-in');
  }

  function abrir(id, origen) {
    const r = porId[id]; if (!r || !GEO[id]) return;
    const yaAbierta = !!sel;
    sel = id;
    if (origen && !yaAbierta) ultimoFoco = origen;
    variable('--reino', r.reino); variable('--reino-borde', r.borde);
    pSel.setAttribute('d', GEO[id].d); pSel.style.setProperty('--c', r.mapa); pSel.style.setProperty('--a', r.borde);
    pDim.setAttribute('d', `M0 0H${W0}V${H0}H0Z${GEO[id].d}`);
    resaltar(null); tip.classList.remove('on');
    pintarFicha(r);
    expandir();
    marcar('is-open', true); panel.inert = false;
    legend.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.id === id)));
    enfocar(id, true);
    try { history.replaceState(null, '', `#${id}`); } catch (e) { /* sin historial */ }
    if (!yaAbierta || mqApilado.matches) {
      const t = body.querySelector('#mapa-ficha-titulo');
      setTimeout(() => {
        try { t.focus({ preventScroll: true }); } catch (e) { /* noop */ }
        if (mqApilado.matches) panel.scrollIntoView({ behavior: sinMovimiento.matches ? 'auto' : 'smooth', block: 'nearest' });
      }, 350);
    }
  }
  function cerrar() {
    if (!sel) return;
    sel = null;
    marcar('is-open', false); panel.inert = true; ladoFicha(lado, false);
    legend.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', 'false'));
    inicio(true);
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* sin historial */ }
    contraer();
  }
  const paso = (n) => abrir(REINOS[(porId[sel].i + n + REINOS.length) % REINOS.length].id);

  /* ---------- Eventos: ficha, leyenda, teclado ---------- */
  panel.addEventListener('click', (e) => {
    if (e.target.closest('[data-cerrar]')) return cerrar();
    const n = e.target.closest('[data-paso]'); if (n) return paso(+n.dataset.paso);
    const g = e.target.closest('[data-ir]'); if (g) return abrir(g.dataset.ir);
  });
  legend.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (sel === b.dataset.id) return cerrar();
    abrir(b.dataset.id, b);
  });
  legend.addEventListener('pointerover', (e) => { const b = e.target.closest('button'); if (b && e.pointerType === 'mouse') resaltar(b.dataset.id); });
  legend.addEventListener('pointerleave', () => resaltar(null));
  gAreas.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrir(e.target.dataset.id, e.target); } });
  gAreas.addEventListener('focusin', (e) => { if (e.target.dataset.id) resaltar(e.target.dataset.id); });
  gAreas.addEventListener('focusout', () => resaltar(null));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && sel) cerrar(); });
  $('[data-mapa-ctl]').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    const z = b.dataset.z;
    if (z === 'home') { sel ? cerrar() : inicio(true); return; }
    const pw = sel ? reservado() : 0, cx = lado === 'left' ? pw + (W - pw) / 2 : (W - pw) / 2;
    zoomEn(cx, H / 2, k * (z === 'in' ? 1.6 : 1 / 1.6), true);
  });

  /* ---------- Puntero: hover, clic, arrastre y pellizco ---------- */
  const ptrs = new Map(); let movido = false, bajoEl = null, sx = 0, sy = 0, pellizco = null;
  const rect = () => stage.getBoundingClientRect();
  const areaDe = (el) => (el && el.closest ? el.closest('.mapa-area') : null);

  stage.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' || ptrs.size) return;
    const el = areaDe(e.target), r = rect();
    if (el) { resaltar(el.dataset.id); mostrarTip(el.dataset.id, e.clientX - r.left, e.clientY - r.top); }
    else { resaltar(null); tip.classList.remove('on'); }
  });
  stage.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') { resaltar(null); tip.classList.remove('on'); } });

  stage.addEventListener('pointerdown', (e) => {
    if (e.target.closest('[data-mapa-ctl]')) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptrs.size === 1) { movido = false; bajoEl = e.target; sx = e.clientX; sy = e.clientY; }
    if (ptrs.size === 2) { movido = true; pellizco = estadoPellizco(); }
    tip.classList.remove('on');
  });
  function estadoPellizco() {
    const [a, b] = [...ptrs.values()], r = rect();
    return { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, x: (a.x + b.x) / 2 - r.left, y: (a.y + b.y) / 2 - r.top };
  }
  window.addEventListener('pointermove', (e) => {
    const p = ptrs.get(e.pointerId); if (!p) return;
    if (ptrs.size === 1) {
      if (!movido && Math.hypot(e.clientX - sx, e.clientY - sy) < 6) return;
      movido = true;
      if (k > 1.01) { stage.classList.add('is-arrastre'); tx += e.clientX - p.x; ty += e.clientY - p.y; limitar(); aplicar(false); }
      p.x = e.clientX; p.y = e.clientY;
    } else if (ptrs.size === 2 && pellizco) {
      p.x = e.clientX; p.y = e.clientY;
      const n = estadoPellizco();
      tx += n.x - pellizco.x; ty += n.y - pellizco.y;
      zoomEn(n.x, n.y, (k * n.d) / pellizco.d, false);
      pellizco = n;
    }
  });
  function soltar(e) {
    if (!ptrs.has(e.pointerId)) return;
    const unico = ptrs.size === 1;
    ptrs.delete(e.pointerId);
    stage.classList.remove('is-arrastre');
    if (ptrs.size < 2) pellizco = null;
    if (unico && !movido && e.type === 'pointerup') {
      const el = areaDe(bajoEl);
      if (el) abrir(el.dataset.id, el);
      else if (sel) cerrar();
    }
  }
  window.addEventListener('pointerup', soltar);
  window.addEventListener('pointercancel', soltar);

  // En la página, sin Ctrl/⌘ la rueda hace scroll; en pantalla completa (o con Ctrl/⌘ / pellizco) acerca el mapa
  stage.addEventListener('wheel', (e) => {
    if (!(e.ctrlKey || e.metaKey || expandido)) return;
    e.preventDefault();
    const r = rect();
    zoomEn(e.clientX - r.left, e.clientY - r.top, k * Math.exp(-e.deltaY * 0.0022), false);
  }, { passive: false });

  /* ---------- Arranque y redimensionado ---------- */
  function disponer() { if (bloqueo) return; medir(); if (sel) enfocar(sel, false); else { inicio(false); ladoFicha(lado, false); } }
  if ('ResizeObserver' in window) new ResizeObserver(disponer).observe(stage); else window.addEventListener('resize', disponer);
  if (mqApilado.addEventListener) mqApilado.addEventListener('change', disponer);
  disponer();

  function desdeHash() {
    const id = decodeURIComponent(location.hash.slice(1));
    if (id && porId[id]) abrir(id); else if (!id && sel) cerrar();
  }
  window.addEventListener('hashchange', desdeHash);
  if (location.hash) requestAnimationFrame(desdeHash);
}

function arrancar() { document.querySelectorAll('[data-mapa]').forEach(iniciar); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar); else arrancar();