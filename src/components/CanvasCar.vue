<template>
  <canvas
    ref="canvas"
    :width="canvasWidth"
    :height="canvasHeight"
    @pointerdown="handleClick"
  ></canvas>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue'

/** Принимаемые настройки фона и модели */
const props = defineProps<{
  backgroundColor?: string
  modelColor?: string
}>()

/** Цвета по умолчанию */
const backgroundColor = props.backgroundColor ?? '#222'
const modelColor      = props.modelColor      ?? '#eee'

/** Размеры канваса, автоматически подстраиваются под окно */
const canvasWidth  = ref(window.innerWidth)
const canvasHeight = ref(window.innerHeight)
const canvas       = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D

/** Центр и углы контейнера */
let x = canvasWidth.value / 2
let y = canvasHeight.value / 2
let curContAngle = 0
let tgtContAngle = 0

/** Угол модели, её скорость (для пружины) */
let curModelRel = 0
let tgtModelRel = 0
let modelVel    = 0

/** Параметры пружинной анимации */
const STIFFNESS       = 200
const DAMPING         = 20
const OVERSHOOT_ANGLE = 10
const OVERSHOOT_TIME  = 200

let overshootActive    = false
let overshootTimerId: number | null = null

/** Движение и вращение контейнера */
let isMoving = false
let velocity = 0
const MOVE_SPEED = 2
const ROT_SPEED  = 180

/** Серии кликов и углы наклона */
const TURN_CONT      = 15
const TURN_MODEL_ADD = 25
const MAX_MODEL      = 45
const SERIES_TIMEOUT = 800

let clickCount    = 0
let lastClickTime = 0
let lastFrameTime = performance.now()

/** Отступ от краёв, чтобы машинка не выезжала */
const BOUNDARY_MARGIN = 25

/** Обновление размеров при изменении окна */
function updateCanvasSize() {
  canvasWidth.value  = window.innerWidth
  canvasHeight.value = window.innerHeight

  // зажим центра внутри новых границ
  x = Math.max(BOUNDARY_MARGIN, Math.min(canvasWidth.value  - BOUNDARY_MARGIN, x))
  y = Math.max(BOUNDARY_MARGIN, Math.min(canvasHeight.value - BOUNDARY_MARGIN, y))
}

onMounted(() => {
  if (canvas.value) {
    ctx = canvas.value.getContext('2d')!
    requestAnimationFrame(draw)
  }
  window.addEventListener('resize', updateCanvasSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateCanvasSize)
})

/** Обработка кликов/тапов */
function handleClick() {
  const now = performance.now()
  if (now - lastClickTime > SERIES_TIMEOUT) {
    clickCount = 0
    overshootActive = false
    if (overshootTimerId != null) {
      clearTimeout(overshootTimerId)
      overshootTimerId = null
    }
  }
  clickCount++
  lastClickTime = now

  if (!isMoving && clickCount === 1) {
    isMoving = true
    velocity = MOVE_SPEED
    return
  }
  if (clickCount > 2) {
    tgtContAngle += TURN_CONT
    tgtModelRel  = Math.min(tgtModelRel + TURN_MODEL_ADD, MAX_MODEL)
  }
}

/** Основной цикл отрисовки */
function draw() {
  const now = performance.now()
  const dt  = (now - lastFrameTime) / 1000
  lastFrameTime = now

  // окончание серии — запускаем отскок
  if (now - lastClickTime > SERIES_TIMEOUT && !overshootActive) {
    overshootActive = true
    tgtModelRel = -OVERSHOOT_ANGLE
    overshootTimerId = window.setTimeout(() => {
      tgtModelRel = 0
      overshootTimerId = null
    }, OVERSHOOT_TIME)
  }

  // плавный поворот контейнера
  const diffC = tgtContAngle - curContAngle
  if (Math.abs(diffC) > 0.01) {
    curContAngle += Math.sign(diffC) * ROT_SPEED * dt
    if (Math.sign(diffC) !== Math.sign(tgtContAngle - curContAngle)) {
      curContAngle = tgtContAngle
    }
  }

  // пружинная анимация модели
  const disp    = curModelRel - tgtModelRel
  const springF = -STIFFNESS * disp
  const dampF   = -DAMPING * modelVel
  const acc     = springF + dampF
  modelVel    += acc * dt
  curModelRel += modelVel * dt

  // движение и ограничение по границам
  if (isMoving) {
    const rad = (curContAngle * Math.PI) / 180
    x += Math.cos(rad) * velocity
    y += Math.sin(rad) * velocity
    x = Math.max(BOUNDARY_MARGIN, Math.min(canvasWidth.value  - BOUNDARY_MARGIN, x))
    y = Math.max(BOUNDARY_MARGIN, Math.min(canvasHeight.value - BOUNDARY_MARGIN, y))
  }

  // отрисовка фона
  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, canvasWidth.value, canvasHeight.value)

  // контейнер и модель
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate((curContAngle * Math.PI) / 180)

  // направляющая линия
  ctx.beginPath()
  ctx.strokeStyle = modelColor
  ctx.lineWidth = 2
  ctx.moveTo(0, 0)
  ctx.lineTo(30, 0)
  ctx.stroke()

  // моделька
  ctx.save()
  ctx.rotate((curModelRel * Math.PI) / 180)
  ctx.fillStyle = modelColor
  ctx.fillRect(-20, -10, 40, 20)
  ctx.restore()

  ctx.restore()
  requestAnimationFrame(draw)
}
</script>
