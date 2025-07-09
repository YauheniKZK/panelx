import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

type TypeError = 'default' | 'info' | 'success' | 'warning' | 'error'

interface ContentError {
  value: string
}

export const useErrorsStore = defineStore('errors', () => {
  // --------State---------
  const showError = ref(false)
  const titleError = ref('Error')
  const contentError = ref<ContentError[]>([])
  const typeError = ref<TypeError>('default')
  const contentDinamic = ref('')

  const serverError = ref(false)

  // --------Getters---------

  const getShowError = computed(() => showError.value)
  const getTitleError = computed(() => titleError.value)
  const getContentError = computed(() => contentError.value)
  const getTypeError = computed(() => typeError.value)
  const getContentDinamic = computed(() => contentDinamic.value)
  const serverErrorGetters = computed(() => serverError.value)

  // --------Action---------

  function setServerError(val: boolean) {
    serverError.value = val
  }

  function setError(
    show: boolean,
    title: string,
    content: ContentError[],
    type: TypeError,
    valueDinamic: string
  ) {
    showError.value = show
    titleError.value = title
    contentError.value = content
    typeError.value = type
    contentDinamic.value = valueDinamic
  }
  function resetError() {
    showError.value = false
    titleError.value = 'Error'
    contentError.value = [{ value: 'An error has occurred' }]
    typeError.value = 'default'
    contentDinamic.value = ''
  }
  return {
    showError,
    titleError,
    contentError,
    typeError,
    setError,
    resetError,
    contentDinamic,
    getShowError,
    getTitleError,
    getContentError,
    getTypeError,
    getContentDinamic,
    setServerError,
    serverErrorGetters
  }
})
