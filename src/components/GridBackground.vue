<template>
  <canvas ref="canvas" class="grid-canvas"></canvas>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';

interface Props {
  /** Размер стороны одной ячейки сетки в пикселях */
  cellSize: number;
  /** Цвет линий сетки (границ ячеек) */
  borderColor?: string;
  /** Фоновый цвет под сеткой */
  backgroundColor?: string;
}

const props = defineProps<Props>();
const canvas = ref<HTMLCanvasElement>();
let ctx: CanvasRenderingContext2D | null = null;

/** Перерисовывает размер холста и сетку */
function resizeAndDraw() {
  if (!canvas.value || !ctx) return;

  const { cellSize, borderColor = '#444', backgroundColor = 'transparent' } = props;
  const width = canvas.value.clientWidth;
  const height = canvas.value.clientHeight;

  // Настраиваем внутренние размеры холста
  canvas.value.width = width;
  canvas.value.height = height;

  // Фон
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);

  // Настройка линий сетки
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 1;

  // Вертикальные границы ячеек
  for (let x = 0; x <= width; x += cellSize) {
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, height);
    ctx.stroke();
  }

  // Горизонтальные границы ячеек
  for (let y = 0; y <= height; y += cellSize) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(width, y + 0.5);
    ctx.stroke();
  }
}

onMounted(() => {
  if (!canvas.value) return;
  ctx = canvas.value.getContext('2d');
  resizeAndDraw();
  window.addEventListener('resize', resizeAndDraw);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeAndDraw);
});

watch(() => props.cellSize, resizeAndDraw);
watch(() => props.borderColor, resizeAndDraw);
watch(() => props.backgroundColor, resizeAndDraw);
</script>

<style scoped>
.grid-canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
