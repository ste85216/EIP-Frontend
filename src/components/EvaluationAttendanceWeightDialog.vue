<template>
  <v-dialog
    v-model="isOpen"
    max-width="520"
    persistent
    @click:outside="closeDialog"
    @keydown.esc="closeDialog"
  >
    <v-card class="rounded-lg">
      <v-card-title class="d-flex align-center px-6 py-2 bg-teal-darken-2">
        <v-icon
          icon="mdi-calendar-check"
          :size="smAndUp ? '20' : '18'"
          color="white"
          class="me-2"
        />
        <span class="card-title text-white">出勤權重設定</span>
        <v-spacer />
        <v-btn
          icon
          variant="plain"
          class="opacity-100"
          :ripple="false"
          color="white"
          :size="smAndUp ? '36' : '32'"
          @click="closeDialog"
        >
          <v-icon :size="smAndUp ? '22' : '18'">
            mdi-close
          </v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="px-6 py-6">
        <v-form
          ref="addFormRef"
          @submit.prevent="addOrUpdate"
        >
          <v-row>
            <v-col
              cols="5"
              class="pb-1"
            >
              <v-text-field
                v-model.number="form.year"
                label="* 年度"
                variant="outlined"
                density="compact"
                type="number"
                min="2000"
                max="2100"
                :rules="[
                  v => (v != null && v !== '' && !isNaN(v)) || '請輸入年度',
                  v => (v >= 2000 && v <= 2100) || '年度需介於 2000-2100'
                ]"
              />
            </v-col>
            <v-col
              cols="5"
              class="pb-1"
            >
              <v-text-field
                v-model.number="form.weight"
                label="* 權重 (0-1)"
                variant="outlined"
                density="compact"
                type="number"
                step="0.01"
                min="0"
                max="1"
                placeholder="0.2 = 20%"
                :rules="[
                  v => (v != null && v !== '' && !isNaN(v)) || '請輸入權重',
                  v => (v >= 0 && v <= 1) || '權重需介於 0-1'
                ]"
              />
            </v-col>
            <v-col
              cols="2"
              class="d-flex align-center pb-5"
            >
              <v-btn
                color="teal-darken-2"
                variant="outlined"
                size="small"
                :loading="submitting"
                @click="addOrUpdate"
              >
                儲存
              </v-btn>
            </v-col>
          </v-row>
        </v-form>

        <v-table
          v-if="list.length > 0"
          class="mt-4 border rounded"
          density="compact"
        >
          <thead>
            <tr>
              <th>年度</th>
              <th>出勤權重</th>
              <th class="text-right">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in list"
              :key="item.year"
            >
              <td>{{ item.year }}</td>
              <td>{{ Math.round((item.weight || 0) * 100) }}%</td>
              <td class="text-right">
                <v-btn
                  icon
                  variant="text"
                  size="x-small"
                  color="red-lighten-1"
                  @click="removeItem(item.year)"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
        <div
          v-else
          class="text-center pt-6 pb-4 text-grey"
        >
          尚無設定
        </div>
      </v-card-text>
    </v-card>

    <ConfirmDialog
      v-model="deleteConfirmDialog.open"
      dialog-width="360"
      title="確認刪除"
      :message="deleteConfirmMessage"
      confirm-button-text="確認刪除"
      confirm-button-color="red-lighten-1"
      header-color="bg-red-lighten-1"
      header-icon="mdi-delete-alert"
      @confirm="onConfirmDelete"
    />
  </v-dialog>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { useDisplay } from 'vuetify'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'updated'])

const { smAndUp } = useDisplay()
const { apiAuth } = useApi()
const createSnackbar = useSnackbar()

const isOpen = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const list = ref([])
const loading = ref(false)
const submitting = ref(false)
const addFormRef = ref(null)
const form = reactive({
  year: null,
  weight: null
})

const deleteConfirmDialog = reactive({ open: false, year: null, templateCount: 0 })

const deleteConfirmMessage = computed(() => {
  const y = deleteConfirmDialog.year
  const n = deleteConfirmDialog.templateCount
  let msg = `確定要刪除 ${y || ''} 年度的出勤權重設定嗎？`
  if (n > 0) {
    msg += `<br><br><span class="text-orange-darken-1">該年度已有 ${n} 個表單模板，其部分權重是依當前出勤權重設定的。刪除後若不調整表單，總分可能不正確。</span>`
  }
  return msg
})

async function fetchTemplateCheck (year) {
  try {
    const { data } = await apiAuth.get('/evaluation-attendance-weights/check-templates', { params: { year } })
    return data?.result ?? { count: 0 }
  } catch {
    return { count: 0 }
  }
}

async function fetchList () {
  loading.value = true
  try {
    const { data } = await apiAuth.get('/evaluation-attendance-weights')
    list.value = data?.result || []
  } catch (err) {
    createSnackbar({
      text: err?.response?.data?.message || '載入失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    loading.value = false
  }
}

async function addOrUpdate () {
  const result = await addFormRef.value?.validate()
  if (!result?.valid) return

  const yearNum = Number(form.year)
  const exists = list.value.some(item => item.year === yearNum)
  if (exists) {
    createSnackbar({
      text: '該年度已存在設定，請至下方列表刪除後再新增',
      snackbarProps: { color: 'red-lighten-1' }
    })
    return
  }

  await doAdd()
}

async function doAdd () {
  submitting.value = true
  try {
    await apiAuth.post('/evaluation-attendance-weights', {
      year: form.year,
      weight: form.weight
    })
    createSnackbar({ text: '儲存成功', snackbarProps: { color: 'teal-lighten-1' } })
    form.year = null
    form.weight = null
    await fetchList()
    emit('updated')
  } catch (err) {
    createSnackbar({
      text: err?.response?.data?.message || '儲存失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    submitting.value = false
  }
}

async function removeItem (year) {
  deleteConfirmDialog.year = year
  const { count } = await fetchTemplateCheck(year)
  deleteConfirmDialog.templateCount = count ?? 0
  deleteConfirmDialog.open = true
}

async function onConfirmDelete () {
  const year = deleteConfirmDialog.year
  if (year == null) return
  try {
    await apiAuth.delete(`/evaluation-attendance-weights/${year}`)
    createSnackbar({ text: '已刪除', snackbarProps: { color: 'teal-lighten-1' } })
    await fetchList()
    emit('updated')
  } catch (err) {
    createSnackbar({
      text: err?.response?.data?.message || '刪除失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

function closeDialog () {
  emit('update:modelValue', false)
}

watch(() => props.modelValue, (v) => {
  if (v) fetchList()
})
</script>
