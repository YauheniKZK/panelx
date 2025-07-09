<script lang="ts" setup>
import { NModal, NIcon } from 'naive-ui'
import { watch } from 'vue'

const props = defineProps({
  showModal: {
    type: Boolean,
    default: false
  },
  width: {
    type: String,
    default: '600px'
  },
  maxWidth: {
    type: String,
    default: '100%'
  },
  noMaskColor: {
    type: Boolean,
    default: false
  },
  px: {
    type: String,
    default: '16px'
  }
})

defineEmits(['close'])

watch(
  () => props.showModal,
  (newVal) => {
    if (newVal && props.noMaskColor) {
      document.querySelector('body')?.classList.add('no-mask-color')
    } else {
      setTimeout(() => {
        document.querySelector('body')?.classList.remove('no-mask-color')
      }, 400)
    }
  }
)
</script>

<template>
  <n-modal
    :show="showModal"
    preset="card"
    :bordered="false"
    :closable="false"
    class="custom1-card"
    style="padding-bottom: 15px; border-radius: 8px"
    :style="`max-width: ${maxWidth}; width: ${width}`"
    :content-style="`padding-left: ${px};padding-right: ${px};`"
    :header-style="'padding-left: 16px;padding-right: 16px;padding-bottom: 0;'"
    @mask-click="$emit('close')"
  >
    <template #header>{{ '' }}</template>
    <template #header-extra>
      <n-icon :size="32" class="cursor-pointer" @click="$emit('close')">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M24 8L8 24" stroke="#101623" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M8 8L24 24" stroke="#101623" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </n-icon>
    </template>
    <slot name="content" />
  </n-modal>
</template>

<style scoped></style>
