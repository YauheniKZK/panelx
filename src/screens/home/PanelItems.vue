<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { storeToRefs } from 'pinia'
import {
  NDrawer,
  NDrawerContent,
  NButton,
  NUpload,
  NUploadDragger,
  NIcon,
  NForm,
  NFormItem,
  NInput,
  NRadio,
  NRadioGroup,
  NAlert
} from 'naive-ui';
import { TrashOutline } from '@vicons/ionicons5'
import ImageCropperV2 from '@/components/ImageCropperV2.vue';

const { editorModeGetters } = storeToRefs(useAppStore())

// Состояния выделения
const selecting = ref(false)
const selectionConfirmed = ref(false)
const selection = ref({ x: 0, y: 0, width: 0, height: 0 })
const startPos = ref({ x: 0, y: 0 })

const defaultFormData = () => {
  return {
    image: '',
    width: 0,
    height: 0,
    description: '',
    border: null,
    isgif: false
  }
}

const formData = ref(defaultFormData())

const readonlyMode = ref(false)
const fileList = ref<any[]>([])
const preview = ref('')
const onCroppedPreview = ref('')
const isgif = ref(false)
const croppedMode = ref(false)
const fileAvatar = ref<File | null>(null)
const savedItems = ref<any>([])

const MAX_WIDTH = 200
const MAX_HEIGHT = 100

// Плавный блок за курсором
const target = ref({ x: 0, y: 0 })
const current = ref({ x: 0, y: 0 })

function updateTarget(e: MouseEvent) {
  target.value.x = e.clientX
  target.value.y = e.clientY
}

function animate() {
  if (!selectionConfirmed.value && editorModeGetters.value) {
    current.value.x += (target.value.x - current.value.x) * 0.1
    current.value.y += (target.value.y - current.value.y) * 0.1
  }
  requestAnimationFrame(animate)
}

function onMouseDown(e: MouseEvent) {
  if (!editorModeGetters.value) return
  if (selectionConfirmed.value) return

  updateTarget(e)
  selecting.value = true
  startPos.value = { x: e.clientX, y: e.clientY }
  selection.value = { x: e.clientX, y: e.clientY, width: 0, height: 0 }
}

function onMouseMove(e: MouseEvent) {
  if (!editorModeGetters.value) return
  updateTarget(e)

  if (selecting.value) {
    const dx = e.clientX - startPos.value.x
    const dy = e.clientY - startPos.value.y

    selection.value = {
      x: dx < 0 ? e.clientX : startPos.value.x,
      y: dy < 0 ? e.clientY : startPos.value.y,
      width: Math.min(Math.abs(dx), MAX_WIDTH),
      height: Math.min(Math.abs(dy), MAX_HEIGHT)
    }
  }
}

function onMouseUp() {
  if (selecting.value && selection.value.width && selection.value.height) {
    selectionConfirmed.value = true
  }
  selecting.value = false
}

function resetSelection() {
  selection.value = { x: 0, y: 0, width: 0, height: 0 }
  selectionConfirmed.value = false
  selecting.value = false
  current.value.x = target.value.x
  current.value.y = target.value.y
}

const avatarChange = async (event: any) => {
  const formatFileArray = event.file.name ? event.file.name.split('.') : null
  const formatFile =
    formatFileArray !== null ? formatFileArray[formatFileArray.length - 1].toLowerCase() : null
  if (event.fileList.length > 0) {
    if (
      formatFile === 'png' ||
      formatFile === 'jpg' ||
      formatFile === 'jpeg' ||
      formatFile === 'pdf' ||
      formatFile === 'gif'
    ) {
      if (event.fileList[0].file.size <= 2000000) {
        const input = event.file
        if (input.file) {
          fileList.value.push(event.file)
          const reader = new FileReader()
          reader.onload = async (e: any) => {
            preview.value = e.target.result
             formData.value.image = e.target.result
          }
          fileAvatar.value = input.file
          reader.readAsDataURL(input.file)
         
          if (formatFile === 'gif') {
            isgif.value = true
            formData.value.isgif = true
            croppedMode.value = false
          } else {
            isgif.value = false
            formData.value.isgif = false
            croppedMode.value = true
          }
        }
      } else {
        fileList.value = []
        preview.value = ''
        fileAvatar.value = null
      }
    } else {
      fileList.value = []
      preview.value = ''
      fileAvatar.value = null
    }
  }
}

const handleRemove = () => {
  fileList.value = []
  preview.value = ''
}

const onCropped = (dataUrl: string | null) => {
  onCroppedPreview.value = dataUrl ? dataUrl : ''
  formData.value.image = dataUrl ? onCroppedPreview.value : preview.value
}

const resetSelectionImage = () => {
  onCroppedPreview.value = ''
  preview.value = ''
  handleRemove()
  croppedMode.value = false
  formData.value = defaultFormData()
}

const saveSelection = () => {
  savedItems.value.push({
    ...formData.value,
    width: selection.value.width,
    height: selection.value.height
  })
  selectionConfirmed.value = false
  resetSelectionImage()
  console.log('savedItems.value', savedItems.value)
}

onMounted(() => {
  window.addEventListener('mousedown', onMouseDown)
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
  window.addEventListener('mousemove', updateTarget)
  requestAnimationFrame(animate)
})

onUnmounted(() => {
  window.removeEventListener('mousedown', onMouseDown)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
  window.removeEventListener('mousemove', updateTarget)
})
</script>

<template>
  <!-- Инфо-блок у курсора -->
  <div
    v-if="editorModeGetters && !selectionConfirmed"
    class="smooth-follow"
    :style="{ left: current.x + 'px', top: current.y + 'px' }"
  >
    <template v-if="selection.width && selection.height">
      <div class="flex flex-col">
        
        <p>Ширина: {{ selection.width }}px <span class="text-[#311d1d]">{{ ' (Макс. 200px)' }}</span></p>
        <p>Высота: {{ selection.height }}px <span class="text-[#311d1d]">{{ ' (Макс. 100px)' }}</span></p>
        <p>Площадь: {{ selection.width * selection.height }} px²</p>
      </div>
    </template>
    <template v-else>
      Выделите область, чтобы приобрести.
    </template>
  </div>

  <!-- Прямоугольник выделения -->
  <div
    v-if="selecting || selectionConfirmed"
    class="selection-box"
    :style="{
      left: selection.x + 'px',
      top: selection.y + 'px',
      width: selection.width + 'px',
      height: selection.height + 'px'
    }"
  >
    <img
      v-if="onCroppedPreview && onCroppedPreview !== '' ? true : preview && preview !== '' ? true : false"
      :src="onCroppedPreview && onCroppedPreview !== '' ? onCroppedPreview : preview"
      class="preview-selection"
      :class="isgif ? 'object-contain' : 'object-cover'"
    />
  </div>

  <n-drawer v-model:show="selectionConfirmed" :width="502" :placement="'right'">
    <n-drawer-content>
      <div class="flex flex-col gap-4">
        <span>
          Ширина: {{ selection.width }}px,
        </span>
        <span>
          Высота: {{ selection.height }}px,
        </span>
         <span>
          Площадь: {{ selection.width * selection.height }} px²
        </span>
        <span>Стосимость: {{ '99 stars' }}</span>
        <n-form ref="formRef" :model="formData" class="w-full">
          <n-form-item :show-label="false" path="description" class="grow">
             <n-input
              v-model:value="formData.description"
              type="textarea"
              maxlength="100"
              show-count
              placeholder="Описание"
            />
          </n-form-item>
          <n-form-item :show-label="false" path="border" class="grow">
            <div class="flex flex-col">
              <span>{{ 'Нужна рамка для выделения?' }}</span>
              <n-radio-group v-model:value="formData.border" name="radiogroup">
                <div class="flex flex-wrap gap-6">
                  <div class="flex flex-col gap-4">
                    <n-radio
                      :value="'border1'"
                      :label="'Border 1 (+50 stars)'"
                    />
                    <div class="border-item border1-item"></div>
                  </div>
                  <div class="flex flex-col gap-4">
                      <n-radio
                        :value="'border2'"
                        :label="'Border 2 (+50 stars)'"
                      />
                      <div class="border-item border2-item"></div>
                    </div>
                </div>
              </n-radio-group>
            </div>
          </n-form-item>
          <n-alert type="info" :bordered="false" class="mb-4">
            - Gif изображения нельзя обрезать
          </n-alert>
          <n-upload
            v-if="!croppedMode"
            type="file"
            class="w-full mb-4"
            style="max-width: 100%"
            :file-list="fileList"
            :disabled="readonlyMode"
            :show-file-list="false"
            :max="1"
            accept=".jpeg, .jpg, .png, .gif"
            :class="readonlyMode ? `readonlyMode` : ``"
            @change="avatarChange"
            @remove="handleRemove"
          >
            <n-upload-dragger
              class="relative for-hover flex justify-between"
              style="
                max-width: 100%;
                width: 100%;
                height: 130px;
                border-radius: 8px;
                padding: 16px !important;
                border: 1px dashed #0064b066;
              "
            >
              <div
                v-if="preview !== ''"
                class="absolute w-full hover-remove-avatar left-[16px] top-[16px]"
                :style="`height: ${selection.height}px; width: ${selection.width}px; border-radius: 8px`"
              >
                <n-button text @click.stop="handleRemove">
                  <n-icon size="24" color="#ffffff">
                    <TrashOutline />
                  </n-icon>
                </n-button>
              </div>
              <div v-if="preview === ''" class="w-[96px]"></div>
              <img
                v-if="preview !== ''"
                :src="preview"
                style="object-fit: contain; border-radius: 8px; width: 96px; height: 96px"
              />
              <div class="flex flex-col items-center justify-center h-full">
                <span class="text-[16px] font-[600] leading-[24px] flex mb-[8px]">
                  {{ 'Загрузка' }}
                </span>
                <span class="text-[14px] text-center">
                  <span class="text-[#0064B0] cursor-pointer">{{ 'Выберите файл, или перетащите в эту область' }}</span>
                  {{ 'который хотите поставить' }}
                </span>
              </div>
              <div class="w-[80px]"></div>
            </n-upload-dragger>
          </n-upload>
        </n-form>
        <div class="flex flex-col py-4">
          <ImageCropperV2
            v-if="!isgif && (preview && preview !== '') || (onCroppedPreview && onCroppedPreview !== '')"
            :preview="preview"
            :selection="selection"
            @cropped="onCropped"
          />
        </div>
        <n-button @click="saveSelection">
          <span>Сохранить</span>
        </n-button>
        <n-button @click="resetSelectionImage">
          <span>Сбросить Изображение</span>
        </n-button>
        <n-button @click="resetSelection">
          <span>Сбросить</span>
        </n-button>
      </div>
    </n-drawer-content>
  </n-drawer>

  <!-- Карта или сцена -->
  <div class="min-w-[2000px] min-h-[2000px] flex flex-wrap gap-1">
    <div v-for="(item, i) in savedItems" :key="i" class="thumb-card self-baseline">
      <div 
        class="thumb-img" 
        :style="{
          width: item.width + 'px',
          height: item.height + 'px',
          border: item.border ? '2px solid #c0392b' : 'none'
        }"
      >
        <img :src="item.image" class="w-full max-w-full h-auto max-h-full" :class="item.isgif ? 'object-contain' : 'object-cover'" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.smooth-follow {
  position: fixed;
  padding: 12px;
  background: #929092;
  color: #fff;
  font-weight: bold;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.35);
  transform: translate(20%, -120%);
  pointer-events: none;
  z-index: 1001;
}

.selection-box {
  position: fixed;
  background: rgba(0, 128, 255, 0.2);
  border: 2px dashed #007bff;
  pointer-events: none;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.fixed-info {
  position: fixed;
  padding: 10px 14px;
  background: #333;
  color: #fff;
  border-radius: 6px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  font-size: 14px;
  z-index: 1002;
}

.fixed-info button {
  display: block;
  margin-top: 8px;
  padding: 6px 12px;
  background: #e74c3c;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.fixed-info button:hover {
  background: #c0392b;
}
.preview-selection {
  max-height: 100%;
  max-width: 100%;
  width: 100%;
}

.border-item {
  width: 80px;
  height: 80px;
}

.border1-item {
  border: 2px solid #c0392b;
}

.border2-item {
  border: 2px solid #c0392b;
}

.thumb-card {
  box-shadow: rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px;
}

.thumb-img {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
