<script setup lang="ts">
import { useAppStore } from '@/stores/app';
import MenuPage from './MenuPage.vue';
// import BackgoundMenu from '@/components/BackgoundMenu.vue';
import GridBackground from '@/components/GridBackground.vue';
import PanelItems from './PanelItems.vue';
import { storeToRefs } from 'pinia';

const appStore = useAppStore()
const { editorModeGetters, viewModeGetters } = storeToRefs(appStore)
</script>

<template>
  <div class="px-4 pt-4 relative">
    <GridBackground
      class=" absolute left-0 top-0 w-full h-full"
      :cell-size="20"
      border-color="#d0d0d086"
      line-color="#555"
      background-color="transparent"
    />
    <MenuPage v-if="!editorModeGetters && !viewModeGetters" />
    <PanelItems />
  </div>
</template>

<style scoped></style>