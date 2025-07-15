<template>
  <div class="fire-container">
    <canvas ref="canvasRef"></canvas>
    <div class="logs-panel">
      <div
        v-for="n in logsCount"
        :key="n"
        class="log"
        @click="addLog"
        title="Подкинуть дрова"
      ></div>
      <div v-if="logsCount === 0" class="no-logs">Дров больше нет</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onBeforeUnmount, ref } from 'vue';

export default defineComponent({
  name: 'FireCanvasLifeCycle',
  setup() {
    const canvasRef = ref<HTMLCanvasElement|null>(null);
    let ctx!: CanvasRenderingContext2D;
    let animationId: number;

    // состояние жизненного цикла огня
    const fireLife = ref(100);
    const maxLife   = ref(100);
    const lifeDecay = 0.02;     // единиц жизни в кадр
    const lifePerLog = 80;      // сколько единиц жизни даёт одно дрово

    // дрова в «запасе»
    const logsCount = ref(5);

    // частицы пламени и искр
    interface Particle { x:number; y:number; vx:number; vy:number; alpha:number; size:number; life:number; decay:number }
    interface Spark    { x:number; y:number; vx:number; vy:number; alpha:number; size:number; life:number }

    const fireParticles: Particle[] = [];
    const sparks: Spark[] = [];

    const INITIAL_FIRE = 100;
    const MAX_FIRE     = 200;
    const SPARK_RATE   = 0.03;   // шанс за кадр
    const FIRE_RATE    = 0.3;    // шанс за кадр

    // создаём новую частицу пламени
    function createFire(): Particle {
      const W = ctx.canvas.width, H = ctx.canvas.height;
      return {
        x: W/2 + (Math.random()-0.5)*20,
        y: H - 10,
        vx: (Math.random()-0.5)*0.2,
        vy: -(0.4 + Math.random()*0.6),
        alpha: 0.8 + Math.random()*0.2,
        size: 2 + Math.random()*3,
        life: 40 + Math.random()*40,
        decay: 0.01 + Math.random()*0.01,
      };
    }

    // создаём искру
    function createSpark(): Spark {
      const W = ctx.canvas.width, H = ctx.canvas.height;
      return {
        x: W/2 + (Math.random()-0.5)*30,
        y: H - 6,
        vx: (Math.random()-0.5)*1,
        vy: -(1 + Math.random()*1),
        alpha: 1,
        size: 1 + Math.random()*1.5,
        life: 30 + Math.random()*30,
      };
    }

    // рисуем бревна у костра
    function drawLogsBase() {
      const W = ctx.canvas.width, H = ctx.canvas.height;
      ctx.save();
      ctx.translate(W/2, H - 3);
      ctx.fillStyle = '#6b4f2b';
      ctx.strokeStyle = '#533d29';
      ctx.lineWidth = 1;
      ctx.rotate(-0.4);
      ctx.fillRect(-25, -2, 50, 4);
      ctx.strokeRect(-25, -2, 50, 4);
      ctx.rotate(0.8);
      ctx.fillRect(-25, -2, 50, 4);
      ctx.strokeRect(-25, -2, 50, 4);
      ctx.restore();
    }

    // основной цикл анимации
    function animate() {
      const W = ctx.canvas.width, H = ctx.canvas.height;

      // убывает жизнь огня
      if (fireLife.value > 0) {
        fireLife.value = Math.max(0, fireLife.value - lifeDecay);
      }
      const intensity = fireLife.value / maxLife.value;

      // фон
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, W, H);

      drawLogsBase();

      // обновляем и рисуем частицы пламени
      for (let i = fireParticles.length - 1; i >= 0; i--) {
        const p = fireParticles[i];
        p.x += p.vx;  p.y += p.vy;
        p.life -= 1;  p.alpha -= p.decay;

        // пиксельное пламя с лёгким фликером
        const flicker = 0.9 + Math.random()*0.2;
        const alpha   = Math.max(0, p.alpha * flicker * intensity);
        const size    = Math.ceil(p.size * (0.9 + Math.random()*0.2)) ;
        const grad    = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size);

        grad.addColorStop(0,   `rgba(255,200,60,${alpha})`);
        grad.addColorStop(0.5, `rgba(255,80,0,${alpha*0.6})`);
        grad.addColorStop(1,   'rgba(0,0,0,0)');

        ctx.fillStyle = grad;
        ctx.fillRect(
          Math.floor(p.x - size/2),
          Math.floor(p.y - size/2),
          size, size
        );

        // удаляем потухшие
        if (p.life <= 0 || p.alpha <= 0) {
          fireParticles.splice(i, 1);
        }
      }

      // спавним новые частицы по интенсивности
      if (
        fireLife.value > 0 &&
        fireParticles.length < MAX_FIRE &&
        Math.random() < FIRE_RATE * intensity
      ) {
        fireParticles.push(createFire());
      }

      // спавн искр
      if (fireLife.value > 0 && Math.random() < SPARK_RATE) {
        sparks.push(createSpark());
      }

      // обновляем и рисуем искры
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;    s.y += s.vy;
        s.vy += 0.02;   // гравитация
        s.life -= 1;    s.alpha -= 0.03;

        const sz = Math.ceil(s.size);
        ctx.fillStyle = `rgba(255,255,200,${Math.max(0, s.alpha)})`;
        ctx.fillRect(Math.floor(s.x), Math.floor(s.y), sz, sz);

        if (s.life <= 0 || s.alpha <= 0) {
          sparks.splice(i, 1);
        }
      }

      animationId = requestAnimationFrame(animate);
    }

    // подкидываем дрова
    function addLog() {
      if (logsCount.value <= 0) return;
      logsCount.value--;
      fireLife.value  += lifePerLog;
      maxLife.value   += lifePerLog;

      // немедленно оживим немного огня
      for (let i = 0; i < 20 && fireParticles.length < MAX_FIRE; i++) {
        fireParticles.push(createFire());
      }
    }

    onMounted(() => {
      const canvas = canvasRef.value!;
      const w = window.innerWidth;
      const h = window.innerHeight * 0.8;
      const SCALE = 6;

      // низкое разрешение + масштабирование для пиксель-арта
      canvas.width  = Math.floor(w / SCALE);
      canvas.height = Math.floor(h / SCALE);
      canvas.style.width  = `${w}px`;
      canvas.style.height = `${h}px`;

      ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = false;

      // начальное пламя
      for (let i = 0; i < INITIAL_FIRE; i++) {
        fireParticles.push(createFire());
      }

      animate();
    });

    onBeforeUnmount(() => {
      cancelAnimationFrame(animationId);
    });

    return {
      canvasRef,
      logsCount,
      addLog
    };
  }
});
</script>

<style scoped>
.fire-container {
  position: relative;
  text-align: center;
}

canvas {
  background: #111;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  display: block;
  margin: 0 auto;
}

.logs-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.log {
  width: 40px;
  height: 15px;
  background: #6b4f2b;
  border: 2px solid #533d29;
  border-radius: 3px;
  cursor: pointer;
}

.no-logs {
  color: #eee;
  font-size: 14px;
}
</style>
