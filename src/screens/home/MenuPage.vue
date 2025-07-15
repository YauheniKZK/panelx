<template>
  <div class="canvas-background">
    <canvas ref="canvas" id="bg-canvas"></canvas>
  </div>

  <div class="menu-block">
    <div class="flex flex-col items-end gap-8">
      <div class="perspective-[1000px]">
        <n-button text :text-color="'#fff'" @click="setEditorMode(true)" >
          <span class="text-[38px] text-custom">Выбрать свое место</span>
        </n-button>
      </div>
      <div class="perspective-[1000px]">
        <n-button text :text-color="'#fff'" @click="setViewMode(true)" >
          <span class="text-[38px] text-custom">Изучить территорию</span>
        </n-button>
      </div>
      <div class="perspective-[1000px] w-full">
        <div class="divider w-full"></div>
      </div>
      <div class="perspective-[1000px]">
        <n-button text :text-color="'#fff'" @click="setViewMode(true)" >
          <span class="text-[38px] text-custom">Место</span>
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useAppStore } from '@/stores/app';
import { NButton } from 'naive-ui';

interface Particle {
  x: number;
  y: number;
  dx: number;
  dy: number;
  size: number;
  shape: 'square' | 'circle' | 'triangle' | 'diamond';
}

interface Bubble {
  particleIndex: number;
  start: number;
}

const appStore = useAppStore();
const { setEditorMode, setViewMode } = appStore;

const canvas = ref<HTMLCanvasElement>();
let ctx: CanvasRenderingContext2D;
const dpr = window.devicePixelRatio || 1;
let particles: Particle[] = [];
let bubbles: Bubble[] = [];
let spawnTimer: number;

function spawnBubble() {
  const idx = Math.floor(Math.random() * particles.length);
  bubbles.push({ particleIndex: idx, start: performance.now() });
  setTimeout(() => {
    bubbles.shift();
    spawnTimer = window.setTimeout(spawnBubble, 2000 + Math.random() * 3000);
  }, 3000);
}

function drawShape(p: Particle) {
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  const s = p.size;
  switch (p.shape) {
    case 'square':
      ctx.fillRect(p.x, p.y, s, s);
      break;
    case 'circle':
      ctx.beginPath();
      ctx.arc(p.x + s / 2, p.y + s / 2, s / 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'triangle':
      ctx.beginPath();
      ctx.moveTo(p.x, p.y + s);
      ctx.lineTo(p.x + s / 2, p.y);
      ctx.lineTo(p.x + s, p.y + s);
      ctx.closePath();
      ctx.fill();
      break;
    case 'diamond':
      ctx.beginPath();
      ctx.moveTo(p.x + s / 2, p.y);
      ctx.lineTo(p.x + s, p.y + s / 2);
      ctx.lineTo(p.x + s / 2, p.y + s);
      ctx.lineTo(p.x, p.y + s / 2);
      ctx.closePath();
      ctx.fill();
      break;
  }
}

function roundRect(x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}

function resizeCanvas() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  canvas.value!.style.width = `${vw}px`;
  canvas.value!.style.height = `${vh}px`;
  canvas.value!.width = vw * dpr;
  canvas.value!.height = vh * dpr;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
}

onMounted(() => {
  if (!canvas.value) return;
  ctx = canvas.value.getContext('2d')!;
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  particles = Array.from({ length: 120 }).map(() => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    dx: (Math.random() - 0.5) * 0.5,
    dy: (Math.random() - 0.5) * 0.5,
    size: Math.random() * 4 + 1,
    shape: ['square', 'circle', 'triangle', 'diamond'][Math.floor(Math.random() * 4)] as Particle['shape']
  }));

  spawnBubble();

  const draw = () => {
    ctx.fillStyle = '#3D365C';
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    particles.forEach(p => {
      drawShape(p);
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0 || p.x > window.innerWidth) p.dx *= -1;
      if (p.y < 0 || p.y > window.innerHeight) p.dy *= -1;
    });

    bubbles.forEach(b => {
      const elapsed = performance.now() - b.start;
      if (elapsed > 3000) return;

      const p = particles[b.particleIndex];
      const boxW = 60, boxH = 28, tailOffset = 12, tailW = 8;
      const fadeInTime = 400;
      const fadeOutTime = 400;
      const lifeTime = 3000;

      const growScale = elapsed < fadeInTime
        ? elapsed / fadeInTime
        : elapsed > lifeTime - fadeOutTime
        ? (lifeTime - elapsed) / fadeOutTime
        : 1;
      const opacity = Math.max(0, Math.min(1, growScale)) * 0.85;

      ctx.save();
      // появление и исчезновение из точки частицы
      ctx.translate(p.x, p.y);
      ctx.scale(growScale, growScale);
      ctx.globalAlpha = opacity;

      ctx.fillStyle = 'rgba(30,30,30,1)';
      roundRect(-boxW / 2, -boxH - tailOffset, boxW, boxH, 6);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-tailW, -tailOffset);
      ctx.lineTo(tailW, -tailOffset);
      ctx.closePath();
      ctx.fill();

      const dotCount = 3, dotR = 3, spacing = 12;
      const cycle = (elapsed % 600) / 600;
      for (let i = 0; i < dotCount; i++) {
        const phase = (cycle * dotCount - i + dotCount) % dotCount;
        const dotAlpha = phase < 0.3 ? 1 : 0.2;
        ctx.beginPath();
        ctx.arc(
          -spacing + i * spacing,
          -boxH / 2 - tailOffset,
          dotR,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = `rgba(255,255,255,${dotAlpha * opacity})`;
        ctx.fill();
      }

      ctx.restore();
    });

    requestAnimationFrame(draw);
  };

  draw();
});

onBeforeUnmount(() => {
  clearTimeout(spawnTimer);
  window.removeEventListener('resize', resizeCanvas);
});
</script>

<style scoped>
.canvas-background {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
}
#bg-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.menu-block {
  position: fixed;
  inset: 0;
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: flex-end;
  padding: 16px 10vw;
  background-color: rgba(20, 20, 20, 0.1);
  backdrop-filter: blur(1px);
  -webkit-backdrop-filter: blur(1px);
  z-index: 1;
}

.menu-block .text-custom {
  font-family: 'Orbitron', sans-serif;
  font-size: 28px;
  color: #ccc;
  letter-spacing: 1px;
  text-transform: uppercase;
  transform: rotateY(-50deg);
  transform-origin: right center;
  perspective: 1000px;
  opacity: 0.9;
  filter: drop-shadow(16px 16px 6px rgba(0, 0, 0, 0.3));
}

.divider {
  transform: rotateY(-50deg);
  transform-origin: right center;
  filter: drop-shadow(16px 16px 6px rgba(0, 0, 0, 0.3));
  width: 100%;
  height: 2px;
  background: #adadad;
}
</style>
