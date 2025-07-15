<template>
  <div class="workzone">
    <h3 class="title">Рабочая зона</h3>

    <!-- Контролы зума -->
    <div class="controls">
      <button @click="zoomOut">−</button>
      <input
        type="range"
        min="0.2"
        max="3"
        step="0.1"
        v-model.number="scale"
      />
      <button @click="zoomIn">+</button>
      <span class="scale-label">{{ (scale * 100).toFixed(0) }}%</span>
    </div>

    <!-- Область редактирования -->
    <div
      class="container"
      ref="containerRef"
      @wheel.prevent="onWheel"
    >
      <img
        ref="imgRef"
        :src="preview"
        class="image"
        @load="onImageLoad"
        @mousedown.prevent="startDrag"
        :style="imageStyle"
      />

      <!-- Рамка обрезки по центру -->
      <div
        v-if="selection.width && selection.height"
        class="overlay"
        :style="{
          width:  selection.width  + 'px',
          height: selection.height + 'px'
        }"
      ></div>
    </div>

    <!-- Кнопка обрезки -->
    <n-button class="btn" @click="cropImage" block>
      Обрезать изображение
    </n-button>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick, onBeforeUnmount } from 'vue'
import { NButton } from 'naive-ui'

const props = defineProps<{
  preview: string
  selection: { width: number; height: number }
}>()

const emit = defineEmits<{
  (e: 'cropped', dataUrl: string): void
}>()

// DOM refs
const containerRef = ref<HTMLDivElement | null>(null)
const imgRef       = ref<HTMLImageElement | null>(null)

// зум
const scale = ref(1)
function clamp(v: number, min: number, max: number) {
  return v < min ? min : v > max ? max : v
}
function zoomIn()  { scale.value = clamp(scale.value + 0.1, 0.2, 3) }
function zoomOut() { scale.value = clamp(scale.value - 0.1, 0.2, 3) }
function onWheel(e: WheelEvent) {
  const step = e.deltaY < 0 ? 0.1 : -0.1
  scale.value = clamp(scale.value + step, 0.2, 3)
}

// панорамирование
const offset = reactive({ x: 0, y: 0 })
let dragging = false
const startPt = { x: 0, y: 0 }

function startDrag(e: MouseEvent) {
  dragging = true
  startPt.x = e.clientX
  startPt.y = e.clientY
  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup', onUp)
}

function onDrag(e: MouseEvent) {
  if (!dragging) return
  offset.x += e.clientX - startPt.x
  offset.y += e.clientY - startPt.y
  startPt.x = e.clientX
  startPt.y = e.clientY
}

function onUp() {
  dragging = false
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', onUp)
}

// стиль для <img>
const imageStyle = computed(() => ({
  transform:       `translate(${offset.x}px, ${offset.y}px) scale(${scale.value})`,
  transformOrigin: 'top left'
}))

// центрируем картинку под рамкой после любого new preview load
function onImageLoad() {
  nextTick(() => {
    const img = imgRef.value
    const ctn = containerRef.value
    if (!img || !ctn) return

    // сброс масштаба на 1 и позиционирование по центру рамки
    scale.value = 1
    const dispW = img.clientWidth
    const dispH = img.clientHeight

    // центровка в контейнере
    const cx = (ctn.clientWidth  - props.selection.width ) / 2
    const cy = (ctn.clientHeight - props.selection.height) / 2

    // смещение картинки так, чтобы обрезанный участок лег в рамку
    offset.x = cx - (dispW  - props.selection.width)/2
    offset.y = cy - (dispH  - props.selection.height)/2
  })
}

// обрезка по центру рамки
function cropImage() {
  const img = imgRef.value
  if (!img || !props.preview) return

  // масштаб натурального к отображённому (с учётом scale.value)
  const dispW  = img.clientWidth  * scale.value
  const dispH  = img.clientHeight * scale.value
  const scaleX = img.naturalWidth  / dispW
  const scaleY = img.naturalHeight / dispH

  // рамка в центре контейнера
  const cw = containerRef.value!.clientWidth
  const ch = containerRef.value!.clientHeight
  const cx = (cw - props.selection.width ) / 2
  const cy = (ch - props.selection.height) / 2

  // координаты в натуральных px
  const sx = (cx - offset.x)         * scaleX
  const sy = (cy - offset.y)         * scaleY
  const sw =  props.selection.width  * scaleX
  const sh =  props.selection.height * scaleY

  const canvas = document.createElement('canvas')
  canvas.width  = sw
  canvas.height = sh
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh)

  const dataUrl = canvas.toDataURL()
  emit('cropped', dataUrl)

  // после emit новый preview придёт, onImageLoad автоматически центрирует
}

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', onUp)
})
</script>

<style scoped>
.workzone {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  height: 300px;
  margin: 24px auto;
  padding: 16px;
  background: #f5f7fa;
  border: 1px solid #dde2e6;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.title {
  margin: 0 0 8px;
  font-size: 18px;
  color: #333;
  text-align: center;
}

.controls {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.controls button {
  width: 28px;
  height: 28px;
  font-size: 18px;
}
.controls input {
  flex: 1;
}
.scale-label {
  width: 40px;
  text-align: right;
}

.container {
  position: relative;
  flex: 1;
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
  user-select: none;
}

.image {
  position: absolute;
  top: 0;
  left: 0;
  cursor: grab;
  user-select: none;
  transition: transform 0.05s;
}

.overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 2px dashed #e74c3c;
  background: rgba(231, 76, 60, 0.15);
  box-sizing: border-box;
  pointer-events: none;
  z-index: 2;
}

.btn {
  margin-top: 8px;
}
</style>
