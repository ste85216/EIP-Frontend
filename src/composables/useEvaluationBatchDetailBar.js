import { ref, computed } from 'vue'

const visible = ref(false)
const loadingRef = ref(null)
const barSubmitting = ref(false)
const sendBatchFn = ref(null)
const recallBatchFn = ref(null)
const resendBatchNotificationFn = ref(null)
const goBackFn = ref(null)
const batchRef = ref(null)
const evaluationsRef = ref([])

export function useEvaluationBatchDetailBar () {
  const loading = computed(() => loadingRef.value?.value ?? false)
  const submitting = computed(() => barSubmitting.value)
  const batch = computed(() => batchRef.value?.value ?? null)
  const evaluations = computed(() => evaluationsRef.value?.value ?? [])

  function register (params) {
    visible.value = true
    loadingRef.value = params.loading
    sendBatchFn.value = params.sendBatch
    recallBatchFn.value = params.recallBatch
    resendBatchNotificationFn.value = params.resendBatchNotification ?? null
    goBackFn.value = params.goBack
    batchRef.value = params.batch
    evaluationsRef.value = params.evaluations
  }

  function unregister () {
    visible.value = false
    loadingRef.value = null
    barSubmitting.value = false
    sendBatchFn.value = null
    recallBatchFn.value = null
    resendBatchNotificationFn.value = null
    goBackFn.value = null
    batchRef.value = null
    evaluationsRef.value = []
  }

  async function sendBatch () {
    const fn = sendBatchFn.value
    if (!fn) return
    barSubmitting.value = true
    try {
      await fn()
    } finally {
      barSubmitting.value = false
    }
  }

  async function recallBatch () {
    const fn = recallBatchFn.value
    if (!fn) return
    barSubmitting.value = true
    try {
      await fn()
    } finally {
      barSubmitting.value = false
    }
  }

  function resendBatchNotification () {
    resendBatchNotificationFn.value?.()
  }

  function goBack () {
    goBackFn.value?.()
  }

  function setSubmitting (val) {
    barSubmitting.value = !!val
  }

  return {
    visible,
    loading,
    submitting,
    batch,
    evaluations,
    register,
    unregister,
    sendBatch,
    recallBatch,
    resendBatchNotification,
    goBack,
    setSubmitting
  }
}
