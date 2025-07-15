import { defineStore } from 'pinia';
import { computed, ref } from 'vue';


export const useAppStore = defineStore('app', () => {

  // ------------STATE------------

  const editorMode = ref(false)
  const viewMode = ref(false)

  // ------------GETTERS------------

  const editorModeGetters = computed(() => editorMode.value)
  const viewModeGetters = computed(() => viewMode.value)

  // ------------ACTION------------

  function setEditorMode(bol: boolean) {
    editorMode.value = bol
  }
  function setViewMode(bol: boolean) {
    viewMode.value = bol
  }

  return {
    editorModeGetters,
    setEditorMode,
    viewModeGetters,
    setViewMode
  };
});
