<template>
  <template v-if="showBar">
    <v-card
      class="evaluation-batch-detail-bar rounded-0"
      elevation="0"
    >
      <div class="d-flex align-center px-4 px-sm-6 py-3">
        <v-btn
          prepend-icon="mdi-arrow-left"
          variant="text"
          color="blue-grey-darken-2"
          class="px-2"
          :ripple="false"
          :to="'/evaluationManagement'"
          exact
        >
          返回考核管理
        </v-btn>
        <v-spacer />
        <template v-if="canManageEvaluation">
          <v-btn
            v-if="isSent"
            color="teal-darken-1"
            variant="outlined"
            prepend-icon="mdi-bell-ring-outline"
            class="me-2"
            :disabled="resendNotifyDisabled"
            @click="bar.resendBatchNotification()"
          >
            再次通知
          </v-btn>
          <v-btn
            v-if="isSent"
            color="teal-darken-2"
            variant="outlined"
            prepend-icon="mdi-check-circle"
            class="opacity-60 me-2"
            disabled
          >
            已發送
          </v-btn>
          <v-btn
            v-if="isSent"
            color="orange-darken-2"
            variant="outlined"
            prepend-icon="mdi-undo"
            :loading="isSubmitting"
            @click="bar.recallBatch()"
          >
            收回
          </v-btn>
          <v-btn
            v-else
            color="teal-darken-1"
            variant="elevated"
            prepend-icon="mdi-send"
            :loading="isSubmitting"
            :disabled="isLoading || !canSend"
            @click="bar.sendBatch()"
          >
            發送考核
          </v-btn>
        </template>
        <v-chip
          v-else-if="isSent"
          color="teal-darken-2"
          variant="tonal"
          size="small"
          class="me-2"
        >
          已發送
        </v-chip>
      </div>
    </v-card>
    <div
      class="evaluation-batch-detail-bar-spacer"
      aria-hidden="true"
    />
  </template>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useEvaluationBatchDetailBar } from '@/composables/useEvaluationBatchDetailBar'
import { usePermissionStore } from '@/stores/permission'

const route = useRoute()
const bar = useEvaluationBatchDetailBar()
const permissionStore = usePermissionStore()
const canManageEvaluation = computed(() => permissionStore.hasPermission('EVALUATION_MANAGEMENT_MANAGE'))

const isLoading = computed(() => !!bar.loading?.value)
const isSubmitting = computed(() => !!bar.submitting?.value)
const isSent = computed(() => bar.batch?.value?.status === 'sent')

const COOLDOWN_MS = 10 * 60 * 1000

const resendNotifyDisabled = computed(() => {
  const t = bar.batch?.value?.lastManualBatchNotifyAt
  if (!t) return false
  return Date.now() - new Date(t).getTime() < COOLDOWN_MS
})

const canSend = computed(() => {
  const b = bar.batch?.value
  const evals = bar.evaluations?.value ?? []
  return b?.status === 'draft' && evals.length > 0
})

const showBar = computed(() => {
  return bar.visible && /^\/evaluationManagement\/[^/]+$/.test(route.path)
})
</script>

<style scoped>
.evaluation-batch-detail-bar {
  position: fixed;
  top: calc(100px + var(--marquee-height, 0px));
  left: var(--v-layout-left, 0);
  right: var(--v-layout-right, 0);
  z-index: 10;
  background: #fff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.evaluation-batch-detail-bar-spacer {
  height: 56px;
  flex-shrink: 0;
}
</style>
