<template>
  <v-menu
    v-model="isOpen"
    :close-on-content-click="false"
    location="top"
    transition="scale-transition"
  >
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        color="amber-darken-4"
        icon="mdi-help-circle"
        class="tour-guide-btn"
        elevation="4"
      />
    </template>

    <v-card
      min-width="300"
      max-width="440"
      class="tour-guide-card rounded-lg px-4 pt-2 mb-2"
    >
      <v-card-text class="pa-4">
        <div class="d-flex justify-space-between align-center mb-4">
          <div class="tour-guide-title">
            歡迎使用功能導覽
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            color="blue-grey-darken-2"
            @click="isOpen = false"
          />
        </div>

        <div class="mb-4 text-grey-darken-2">
          請選擇以下功能將為您進行說明:
        </div>

        <v-timeline density="compact">
          <v-timeline-item
            v-for="(step, index) in tourSteps"
            :key="index"
            :dot-color="currentStep === index ? 'amber-darken-4' : 'blue-grey-darken-2'"
            size="small"
            class="timeline-item"
            @click="goToStep(index)"
          >
            <div
              class="tour-step"
              :class="{ 'active-step': currentStep === index }"
            >
              <div class="d-flex align-center">
                <v-icon
                  :icon="step.icon"
                  size="18"
                  class="me-2"
                  :color="currentStep === index ? 'amber-darken-4' : 'blue-grey-darken-2'"
                />
                <div>
                  <div class="tour-step-title">
                    {{ step.title }}
                  </div>
                  <div
                    v-if="currentStep === index"
                    class="tour-step-description text-amber-darken-4"
                  >
                    {{ step.description }}
                  </div>
                </div>
              </div>
            </div>
          </v-timeline-item>
        </v-timeline>

        <v-card-actions class="pa-0 mt-4">
          <v-spacer />
          <v-btn
            v-if="currentStep > 0"
            color="blue-grey-darken-2"
            @click="prevStep"
          >
            上一步
          </v-btn>
          <v-btn
            v-if="currentStep < tourSteps.length - 1"
            color="blue-grey-darken-2"
            @click="nextStep"
          >
            下一步
          </v-btn>
          <v-btn
            v-else
            color="blue-grey-darken-2"
            @click="finishTour"
          >
            完成導覽
          </v-btn>
        </v-card-actions>
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const user = useUserStore()
const isOpen = ref(false)
const currentStep = ref(0)

// 定義導覽步驟
const tourSteps = [
  {
    icon: 'mdi-login-variant',
    title: '員工登入',
    description: '請點擊右上角的「 登入 」按鈕，使用您的公司 Google 帳號進行登入。登入成功後系統會自動載入您所屬公司的資料。'
  },
  {
    icon: 'mdi-magnify',
    title: '搜尋功能',
    description: '1. 您可以使用上方的搜尋條件（來源、業務、日期、地區、結果）去搜尋特定紀錄。 2. 「 業務 」、「 地區 」可使用輸入的方式快速找到選項。 3. 右側重置按鈕，可快速重置搜尋條件。 4. 畫面中間右測的「 快速搜尋 」也可搜尋特定條件的紀錄。'
  },
  {
    icon: 'mdi-account-switch',
    title: '業務輪流表',
    description: '點擊「 業務輪流表 」按鈕可以查看目前公司的業務排序。'
  },
  {
    icon: 'mdi-calendar-month',
    title: '查看本月',
    description: '點擊「 查看本月 」按鈕可以快速查看當月份的所有詢問紀錄。'
  },
  {
    icon: 'mdi-table',
    title: '表格相關',
    description: '1. 點擊詢問內容的「 連結 」可打開該連結網址。 2.「 稱謂 」、「 業務 」、「 詢問結果 」可直接點擊修改。 3. 「 進度 / 備註 」可點擊最右側圖示打開對話框進行新增或查看。'
  },
  {
    icon: 'mdi-help-circle-outline',
    title: '詢問結果',
    description: '當詢問結果欲修改成「 不成交 」或是「 其他 」時，會跳出「 進度 / 備註 - 歷史紀錄 」 對話框，請新增一筆紀錄說明原因。'
  },
  {
    icon: 'mdi-timer-sand',
    title: '登入時效',
    description: '右上角會顯示剩餘的登入時間。時效到期後需要重新登入。若有操作頁面功能或是重新整理頁面，時效會重新計算。'
  },
  {
    icon: 'mdi-logout',
    title: '登出功能',
    description: '如果要提前登出，可以點擊右上角員工姓名旁的登出按鈕。'
  }
]

// 檢查是否為首次訪問
const checkFirstVisit = () => {
  if (user.isLogin) return

  const hasVisited = localStorage.getItem('hasVisitedB2CStatistics')
  if (!hasVisited) {
    isOpen.value = true
    localStorage.setItem('hasVisitedB2CStatistics', 'true')
  }
}

// 下一步
const nextStep = () => {
  if (currentStep.value < tourSteps.length - 1) {
    currentStep.value++
  }
}

// 上一步
const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

// 前往特定步驟
const goToStep = (step) => {
  currentStep.value = step
}

// 完成導覽
const finishTour = () => {
  isOpen.value = false
  currentStep.value = 0
}

// 組件掛載時檢查是否為首次訪問
onMounted(() => {
  checkFirstVisit()
})

defineExpose({
  openTour: () => {
    currentStep.value = 0
    isOpen.value = true
  }
})
</script>

<style lang="scss" scoped>
.tour-guide-btn {
  position: fixed;
  bottom: 24px;
  left: 24px;
  z-index: 100;
}

.tour-guide-title {
  font-size: 20px;
  font-weight: 900;
  color: #37474F;
}

.tour-guide-card {
  border: 12px solid #FFB74D !important;
  .tour-step {
    padding: 8px 12px;
    margin-left: 8px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }

    &.active-step {
      background-color: #FFF8E1;
      color: #FF6F00;
      font-weight: 500;

      .tour-step-title {
        color: #FF6F00;
      }
    }

    .tour-step-title {
      font-size: 14px;
      font-weight: 600;
      line-height: 1.4;
      color: #455A64;
    }

    .tour-step-description {
      font-size: 13px;
      margin-top: 4px;
      line-height: 1.5;
    }
  }
}

.timeline-item {
  cursor: pointer;

  :deep(.v-timeline-divider__dot) {
    cursor: pointer;

    &:hover {
      transform: scale(1.1);
      transition: transform 0.2s ease;
    }
  }
}

:deep(.v-timeline) {
  .v-timeline-item:first-child {
    .v-timeline-item__body {
      margin-left: 0 !important;
    }
    .tour-step {
      margin-left: 8px;
    }
  }
  .v-timeline-item {
    &::before {
      display: none;
    }
  }
}
</style>
