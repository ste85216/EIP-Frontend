import { ref, computed } from 'vue'

const visible = ref(false)
const loadingRef = ref(null)
const barSubmitting = ref(false)
const submitFormFn = ref(null)
const goBackFn = ref(null)

export function useAttendanceFormEditBar () {
  const loading = computed(() => loadingRef.value?.value ?? false)
  const submitting = computed(() => barSubmitting.value)

  function register (params) {
    visible.value = true
    loadingRef.value = params.loading
    submitFormFn.value = params.submitForm
    goBackFn.value = params.goBack
  }

  function unregister () {
    visible.value = false
    loadingRef.value = null
    barSubmitting.value = false
    submitFormFn.value = null
    goBackFn.value = null
  }

  async function submit () {
    const fn = submitFormFn.value
    if (!fn) return
    barSubmitting.value = true
    try {
      await fn()
    } finally {
      barSubmitting.value = false
    }
  }

  function goBack () {
    goBackFn.value?.()
  }

  return {
    visible,
    loading,
    submitting,
    register,
    unregister,
    submit,
    goBack
  }
}
