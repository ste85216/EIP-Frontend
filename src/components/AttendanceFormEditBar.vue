<template>
  <template v-if="showBar">
    <v-card
      class="attendance-form-edit-bar rounded-0"
      elevation="0"
    >
      <div class="d-flex align-center px-4 px-sm-6 py-3">
        <v-btn
          prepend-icon="mdi-arrow-left"
          variant="text"
          color="blue-grey-darken-2"
          class="px-2"
          :ripple="false"
          @click="bar.goBack()"
        >
          返回表單列表
        </v-btn>
        <v-spacer />
        <v-btn
          color="teal-darken-1"
          variant="elevated"
          :loading="isSubmitting"
          :disabled="isLoading"
          @click="bar.submit()"
        >
          儲存
        </v-btn>
      </div>
    </v-card>
    <div
      class="attendance-form-edit-bar-spacer"
      aria-hidden="true"
    />
  </template>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAttendanceFormEditBar } from '@/composables/useAttendanceFormEditBar'

const route = useRoute()
const bar = useAttendanceFormEditBar()

const isLoading = computed(() => !!bar.loading?.value)
const isSubmitting = computed(() => !!bar.submitting?.value)

const showBar = computed(() => {
  return bar.visible && /^\/attendanceFormTemplateManagement\/[^/]+$/.test(route.path)
})
</script>

<style scoped>
.attendance-form-edit-bar {
  position: fixed;
  top: calc(100px + var(--marquee-height, 0px));
  left: var(--v-layout-left, 0);
  right: var(--v-layout-right, 0);
  z-index: 10;
  background: #fff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.attendance-form-edit-bar-spacer {
  height: 56px;
  flex-shrink: 0;
}
</style>
