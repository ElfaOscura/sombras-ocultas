import { tsParticles } from '@tsparticles/engine';
import { loadSlim } from '@tsparticles/slim';

/**
 * Polvo gris flotando (el mismo efecto de la web principal, pero en plata).
 * Ajusta aquí cantidad, tamaño, colores y velocidad.
 */
export async function iniciarParticulas() {
  // El humo solo existe en el hero del inicio
  iniciarHumo();

  const contenedor = document.getElementById('particulas');
  if (!contenedor) return;

  const reducirMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esMovil = matchMedia('(max-width: 767px)').matches;

  await loadSlim(tsParticles);

  await tsParticles.load({
    id: 'particulas',
    options: {
      fullScreen: { enable: false },
      background: { color: 'transparent' },
      fpsLimit: 60,
      detectRetina: true,
      pauseOnBlur: true,
      particles: {
        number: {
          value: esMovil ? 35 : 75, // cantidad de motas
          density: { enable: true, width: 1920, height: 1080 },
        },
        color: { value: ['#94a3b8', '#b8c2d3', '#cbd5e1', '#e2e8f0'] }, // grises
        shape: { type: 'circle' },
        opacity: {
          value: { min: 0.08, max: 0.5 },
          animation: { enable: true, speed: 0.35, sync: false, startValue: 'random' },
        },
        size: { value: { min: 0.6, max: 2.2 } },
        move: {
          enable: !reducirMovimiento,
          speed: { min: 0.08, max: 0.45 }, // lento, como polvo en suspensión
          direction: 'none',
          random: true,
          straight: false,
          outModes: { default: 'out' },
        },
      },
      interactivity: { events: { onHover: { enable: false }, onClick: { enable: false } } },
    },
  });
}

/**
 * Efecto humo del hero (canvas #smokeCanvas).
 * Si la página no tiene ese canvas (páginas interiores), no hace nada.
 */
function iniciarHumo() {
  const canvas = document.getElementById('smokeCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  const particles = [];
  const numParticles = 25; // Cantidad equilibrada para buen rendimiento y densidad

  class SmokeParticle {
    constructor() {
      this.reset();
    }

    reset() {
      // Posición inicial aleatoria a lo largo del ancho, saliendo desde abajo
      this.x = Math.random() * canvas.width;
      this.y = canvas.height + Math.random() * 150;

      // Tamaño inicial y final (el humo se expande a medida que sube)
      this.size = Math.random() * 40 + 30;
      this.maxSize = this.size * 3.5;

      // Velocidades
      this.speedY = Math.random() * 0.8 + 0.4; // Velocidad de subida lenta
      this.angle = Math.random() * Math.PI * 2; // Ángulo para movimiento ondulante
      this.spin = (Math.random() - 0.5) * 0.01; // Velocidad de rotación

      // Opacidad inicial baja y vida útil
      this.opacity = 0;
      this.peakOpacity = Math.random() * 0.08 + 0.03; // Humo sutil y translúcido
      this.life = 0;
      this.maxLife = Math.random() * 300 + 200;
    }

    update() {
      this.life++;
      this.y -= this.speedY;

      // Movimiento ondulante de lado a lado (efecto corriente de aire)
      this.angle += 0.02;
      this.x += Math.sin(this.angle) * 0.6;

      // El humo se expande conforme sube
      if (this.size < this.maxSize) {
        this.size += 0.15;
      }

      // Control de opacidad (fade in al nacer, fade out al morir)
      if (this.life < 50) {
        this.opacity = (this.life / 50) * this.peakOpacity;
      } else if (this.life > this.maxLife - 50) {
        this.opacity = ((this.maxLife - this.life) / 50) * this.peakOpacity;
      }

      // Reiniciar partícula si llega al límite de vida o sale de la pantalla
      if (this.life >= this.maxLife || this.y < -100) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle * 0.2); // Rotación sutil de la voluta

      // Gradiente radial para imitar la densidad irregular del humo
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
      gradient.addColorStop(0, `rgba(245, 245, 255, ${this.opacity})`);
      gradient.addColorStop(0.5, `rgba(220, 220, 230, ${this.opacity * 0.6})`);
      gradient.addColorStop(1, 'rgba(200, 200, 220, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Inicializar partículas
  for (let i = 0; i < numParticles; i++) {
    particles.push(new SmokeParticle());
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p) => {
      p.update();
      p.draw();
    });

    requestAnimationFrame(animate);
  }

  animate();
}