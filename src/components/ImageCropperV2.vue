<template>
  <div class="cropper-wrapper">
    <h3 class="cropper-title">Рабочая зона</h3>

    <!-- сам Cropper -->
    <Cropper
      ref="cropperRef"
      :src="preview"
      
      v-model:stencil="stencil"
      v-model:zoom="zoom"
      v-model:translate="translate"

      :stencil-size="{ width: selection.width, height: selection.height }"
      :stencil-props="stencilProps"
      :image-restriction="'none'"
      :zoom-options="{ minScale: 0.05, maxScale: 5, step: 0.01 }"
      :auto-zoom="false"

      class="cropper-box"
    />

    <!-- кнопка обрезки -->
    <n-button class="btn" block @click="cropImage(false)">
      Не обрезать изображение
    </n-button>
    <n-button class="btn" block @click="cropImage(true)">
      Обрезать изображение
    </n-button>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { Cropper, RectangleStencil } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'
import { NButton } from 'naive-ui'

interface Selection {
  x: number
  y: number
  width: number
  height: number
}

const props = defineProps<{
  preview: string
  selection: Selection
}>()

const emit = defineEmits<{
  (e: 'update:selection', sel: Selection): void
  (e: 'cropped', dataUrl: string | null): void
}>()

// Pan & zoom
const zoom = ref(1)
const translate = reactive({ x: 0, y: 0 })
const clamp = (v: number, min: number, max: number) => (v < min ? min : v > max ? max : v)
const zoomIn  = () => (zoom.value = clamp(zoom.value + 0.1, 0.05, 5))
const zoomOut = () => (zoom.value = clamp(zoom.value - 0.1, 0.05, 5))

// единый stencil для v-model
const stencil = ref({
  type: 'rectangle',
  coordinates: { ...props.selection },
})

// синхронизируем внешний selection → stencil
watch(
  () => props.selection,
  (sel) => {
    stencil.value = {
      type: 'rectangle',
      coordinates: {
        x: sel.x,
        y: sel.y,
        width: sel.width,
        height: sel.height,
      },
    }
  },
  { immediate: true }
)

// эмитим наружу каждый раз, когда рамку двигают или изменяют размер
watch(
  () => stencil.value.coordinates,
  (coords) => {
    emit('update:selection', {
      x: coords.x,
      y: coords.y,
      width: coords.width,
      height: coords.height,
    })
  },
  { deep: true }
)

// props для самой рамки
const stencilProps = computed(() => ({
  stencilComponent: RectangleStencil,
  handlers:         { corners: true, edges: true },
  movable:          true,
  scalable:         true,
  centered:         false,
}))

// ref на Cropper-инстанс
const cropperRef = ref<InstanceType<typeof Cropper> | null>(null)

// по нажатию «Обрезать» рендерим canvas и эмитим dataUrl
function cropImage(bol: boolean) {
  const cropper = cropperRef.value
  if (!cropper) return

  const { canvas } = cropper.getResult()
  if (!canvas) return
  const dataUrl = canvas.toDataURL()
  if (bol) {
    emit('cropped', dataUrl)
  } else {
    emit('cropped', null)
  }
  

  // сбросим pan/zoom для нового preview
  zoom.value  = 1
  translate.x = 0
  translate.y = 0
}
</script>

<style scoped>
.cropper-wrapper {
  width: 100%;
  margin: 24px auto;
}

.cropper-title {
  font-size: 18px;
  text-align: center;
  margin-bottom: 8px;
}

.cropper-box {
  width: 100%;
  height: 300px;
  background: #fafafa;
  border-radius: 4px;
  overflow: hidden;
}

.cropper-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 12px 0;
}

.cropper-controls input {
  flex: 1;
}

.cropper-controls button {
  width: 28px;
  height: 28px;
  font-size: 18px;
  cursor: pointer;
}

.cropper-controls span {
  width: 50px;
  text-align: right;
}

.btn {
  margin-top: 8px;
}
</style>
