/* ==========================================================================
   MAPA INTERACTIVO · CONTENIDO DE LOS REINOS  (esta es la parte que editas)
   --------------------------------------------------------------------------
   Los textos salen de la página de Mapa publicada del sitio. Revisa que
   coincidan palabra por palabra con tu original antes de publicar.

   id         identificador (también sirve de enlace directo: mapa.html#rims)
   tipo       texto pequeño sobre el título
   nombre     título de la ficha
   etiqueta   subtítulo (el de la tarjeta del sitio)
   escudo     imagen del escudo (public/images/escudos/…)
   reino      color base de la ficha (tiñe el cristal, igual que --reino en style.css)
   borde      tono visible para filos, etiquetas y botón (igual que --reino-borde)
   mapa       color con el que se resalta el territorio sobre el mapa
   cultura, portador, lema, ubicacion, resumen, proteccion, significado   (opcionales)
   arma       { nombre, descripcion, color }                                (opcional)
   datos      [["Etiqueta", "Valor"], …]                                    (opcional)
   grupos     [{ nombre, tipo, texto }, …]  casas, gremios, facciones       (opcional)
   aliados    ids de otros reinos, se muestran como enlaces                 (opcional)
   enlace     { texto, href }                                               (opcional)
   Lo que dejes vacío simplemente no se muestra.
   ========================================================================== */

const SIETE = 'Uno de los Siete Reinos';
const INDEPENDIENTE = 'Región independiente';

export const REINOS = [
  {
    id: 'archinon',
    tipo: SIETE,
    nombre: 'Archinón',
    etiqueta: 'Ottoms-Archinón',
    escudo: '/images/escudos/archinon.webp',
    reino: '#1e3a8a', borde: '#3b82f6', mapa: '#2f45e0',
    cultura: 'Inspirada en el antiguo Imperio otomano.',
    arma: { nombre: 'Galaxy', descripcion: 'espada de doble hoja curvada con mango central, azul oscuro. Arma única por su diseño exótico y letal.', color: '#1e3a8a' },
    grupos: [
      { nombre: 'Los 7 Ladrones', tipo: 'Grupo delictivo', texto: 'Liderados por Déximir. Operan desde la ciudad de Goordes.' }
    ],
    aliados: ['egosth'],
    enlace: { texto: 'Sitios de interés', href: '/sombras-ocultas/mapa/sitios-archinon.html' }
  },
  {
    id: 'sheironeison',
    tipo: SIETE,
    nombre: 'Sheironeison',
    etiqueta: 'Las Tierras Blancas del Norte',
    escudo: '/images/escudos/sheironeison.webp',
    reino: '#9333ea', borde: '#a855f7', mapa: '#9333ea',
    cultura: 'Inspirada en la Rusia medieval y en la antigua era vikinga. Es el reino más apartado y gélido.',
    arma: { nombre: 'Une', descripcion: 'hacha doble, morada.', color: '#9333ea' },
    portador: 'El Rey de las tierras blancas'
  },
  {
    id: 'egosth',
    tipo: SIETE,
    nombre: 'Egosth',
    etiqueta: 'El Imperio del Sol Eterno',
    escudo: '/images/escudos/egosth.webp',
    reino: '#facc15', borde: '#facc15', mapa: '#e0a800',
    cultura: 'Reflejo del Antiguo Egipto, con grandes conocimientos y arquitectura monumental.',
    arma: { nombre: 'Tuné', descripcion: 'hoz, amarilla.', color: '#facc15' },
    portador: 'El Rey del desierto',
    datos: [['Gobernantes', 'Rey Arhestan y Príncipe Gahiji']],
    aliados: ['archinon']
  },
  {
    id: 'rims',
    tipo: SIETE,
    nombre: 'Rims',
    etiqueta: 'El Gran Valle',
    escudo: '/images/escudos/rims.webp',
    reino: '#f97316', borde: '#fb923c', mapa: '#f97316',
    cultura: 'Basada en la Europa medieval del siglo XII, con caballeros, castillos y un estricto código feudal.',
    arma: { nombre: 'Shirne', descripcion: 'daga, naranja.', color: '#f97316' },
    portador: 'El Rey del Gran Valle',
    grupos: [
      { nombre: 'Casa Valeni', tipo: 'Casa noble',
        texto: 'Nobles criadores de caballos, descendientes de Albino. Están emparentados por sangre con la familia real de Rims, pues Albino fue hermano de Rims, el primer rey.' }
    ],
    enlace: { texto: 'Sitios de interés', href: '/sombras-ocultas/mapa/sitios-rims.html' }
  },
  {
    id: 'bulpiks',
    tipo: SIETE,
    nombre: 'Bulpiks',
    etiqueta: 'El Reino de Sharnath',
    escudo: '/images/escudos/bulpiks.webp',
    reino: '#000000', borde: '#94a3b8', mapa: '#1f2937',
    cultura: 'Herederos de Mesopotamia y de la antigua Persia, cuna de la civilización y el comercio.',
    arma: { nombre: 'Arumi', descripcion: 'lanza, negra.', color: '#000000' },
    portador: 'El Rey de Sharnath'
  },
  {
    id: 'arabs',
    tipo: SIETE,
    nombre: 'Arabs',
    etiqueta: 'Los Jinetes de medio oriente',
    escudo: '/images/escudos/arabs.webp',
    reino: '#dc2626', borde: '#f87171', mapa: '#dc2626',
    cultura: 'Mezcla vibrante inspirada en la antigua cultura semita.',
    arma: { nombre: 'Rum', descripcion: 'cimitarra, roja.', color: '#dc2626' },
    portador: 'El Rey de Arabs'
  },
  {
    id: 'lailshirem',
    tipo: SIETE,
    nombre: 'LailShirem',
    etiqueta: 'Tierra de los elfos',
    escudo: '/images/escudos/lailshirem.webp',
    reino: '#16a34a', borde: '#4ade80', mapa: '#3f8f10',
    resumen: 'Pueblo de las estrellas y maestros de la humanidad. Viven en la ciudad de las siete torres, en el norte congelado. Son seres de luz pura regidos por Gaven, un líder cuyo rostro es desconocido.',
    arma: { nombre: 'Oruma', descripcion: 'espada ojival, verde.', color: '#16a34a' },
    significado: 'Representa la vida y la esencia de los Lailshir, y el vínculo entre la magia estelar y la naturaleza.'
  },
  {
    id: 'tianxia',
    tipo: INDEPENDIENTE,
    nombre: 'Tianxia',
    etiqueta: 'Los Reinos del Lejano Oriente',
    escudo: '/images/escudos/tianxia.webp',
    reino: '#3b82f6', borde: '#60a5fa', mapa: '#2563eb',
    lema: '«Bajo el cielo, un solo destino»',
    cultura: 'Se inspira en la antigua cultura asiática.',
    ubicacion: 'Al noreste, más allá de Sharnath, bajo la tutela de Manar.',
    proteccion: 'Manar, dios del fuego y la forja, los protege directamente, por lo que Gedu consideró que no necesitaban las armas de las Siete Torres.'
  },
  {
    id: 'dharmapala',
    tipo: INDEPENDIENTE,
    nombre: 'Dharmapala',
    etiqueta: 'Los Reinos del Lejano Oriente',
    escudo: '/images/escudos/dharmapala.webp',
    reino: '#3b82f6', borde: '#60a5fa', mapa: '#0e7490',
    lema: '«La Ley es el camino; la Paz, el refugio»',
    cultura: 'Se inspira en la antigua cultura hindú y tibetana.',
    ubicacion: 'Al noreste, más allá de Sharnath, bajo la tutela de Manar.',
    proteccion: 'Manar, dios del fuego y la forja, los protege directamente, por lo que Gedu consideró que no necesitaban las armas de las Siete Torres.'
  }
];