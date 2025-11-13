<template>
  <v-dialog
    v-model="dialog"
    max-width="900"
  >
    <v-card class="rounded-lg">
      <v-card-title class="d-flex align-center ps-6 pe-4 py-1 bg-blue-grey-darken-2 mb-2">
        <v-icon
          class="me-2"
          size="20"
        >
          mdi-image
        </v-icon>
        <span class="card-title text-white">變更背景圖片</span>
        <v-spacer />
        <v-btn
          v-permission="'SYSTEM_BACKGROUND_IMAGE_READ'"
          variant="outlined"
          color="white"
          class="me-4"
          size="small"
          @click="showUsageStats"
        >
          使用統計
        </v-btn>
        <v-btn
          icon
          variant="plain"
          color="white"
          class="opacity-100"
          :size="buttonSize"
          :ripple="false"
          @click="closeDialog"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text class="px-5 pb-0 pt-6">
        <v-row>
          <v-col
            v-for="(bg, index) in paginatedBackgrounds"
            :key="index"
            cols="12"
            sm="6"
            md="4"
            class="text-center"
          >
            <v-card
              class="cursor-pointer border rounded-lg"
              elevation="0"
              @click="selectedBackground = bg.url"
            >
              <v-img
                :src="bg.url"
                height="180"
                cover
              >
                <div class="d-flex align-center justify-center h-100">
                  <v-icon
                    v-if="selectedBackground === bg.url"
                    color="white"
                    size="40"
                    class="pt-5"
                  >
                    mdi-check-circle
                  </v-icon>
                </div>
              </v-img>
              <v-card-text class="pa-2">
                <div class="sub-title">
                  {{ bg.name }}
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- 分頁組件 -->
        <v-pagination
          v-if="totalPages > 1"
          v-model="currentPage"
          :length="totalPages"
          :total-visible="3"
          class="mt-4"
          size="x-small"
          variant="flat"
          color="blue-grey-darken-2"
        />
      </v-card-text>
      <v-card-actions class="px-5 mb-3 mt-1">
        <v-spacer />
        <v-btn
          color="grey-darken-1"
          variant="outlined"
          :size="smAndUp ? 'default' : 'small'"
          @click="closeDialog"
        >
          取消
        </v-btn>
        <v-btn
          color="blue-grey-darken-2"
          variant="outlined"
          :size="smAndUp ? 'default' : 'small'"
          class="ms-1"
          :loading="isUpdating"
          @click="handleConfirm"
        >
          確認
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useDisplay } from 'vuetify'

const { mdAndUp, smAndUp } = useDisplay()

const buttonSize = computed(() => mdAndUp.value ? 'default' : 'small')

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  currentBackground: {
    type: String,
    default: ''
  },
  isUpdating: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'confirm', 'show-usage-stats'])

// 背景圖片選項
const backgroundOptions = ref([
  {
    name: '野火燎原',
    url: 'https://eip.ystravel.com.tw/uploads/card-bg/bg_profile_flame.png'
  },
  {
    name: '迷幻星空',
    url: 'https://eip.ystravel.com.tw/uploads/card-bg/bg_profile_purplesky.png'
  },
  {
    name: '小木屋',
    url: 'https://eip.ystravel.com.tw/uploads/card-bg/bg_profile_cabin.png'
  },
  {
    name: '機器人',
    url: 'https://eip.ystravel.com.tw/uploads/card-bg/bg_profile_robot.png'
  },
  {
    name: '靜謐之森',
    url: 'https://eip.ystravel.com.tw/uploads/card-bg/bg_profile_snowforest.png'
  },
  {
    name: '日出',
    url: 'https://eip.ystravel.com.tw/uploads/card-bg/bg_profile_sunrise.png'
  },
  {
    name: '龍貓',
    url: 'https://eip.ystravel.com.tw/uploads/card-bg/bg_profile_totoro.png'
  },
  {
    name: '移動城堡',
    url: 'https://eip.ystravel.com.tw/uploads/card-bg/bg_profile_castle.png'
  },
  {
    name: '霍格華茲',
    url: 'https://eip.ystravel.com.tw/uploads/card-bg/bg_profile_hogwarts.png'
  },
  {
    name: '咖波',
    url: 'https://eip.ystravel.com.tw/uploads/card-bg/bg_profile_capoo.png'
  },
  {
    name: '水晶球',
    url: 'https://eip.ystravel.com.tw/uploads/card-bg/bg_profile_pokemon.png'
  },
  {
    name: 'Pingu',
    url: 'https://eip.ystravel.com.tw/uploads/card-bg/bg_profile_pingu.png'
  },
  {
    name: '史迪奇',
    url: 'https://eip.ystravel.com.tw/uploads/card-bg/bg_profile_stitch.png'
  },
  {
    name: '鳥居',
    url: 'https://eip.ystravel.com.tw/uploads/card-bg/bg_profile_shrine.png'
  },
  {
    name: '胡蝶忍',
    url: 'https://eip.ystravel.com.tw/uploads/card-bg/bg_profile_kochoshinobu.png'
  },
  {
    name: 'Chiikawa',
    url: 'https://eip.ystravel.com.tw/uploads/card-bg/bg_profile_chiikawa.png'
  },
  {
    name: '紫月',
    url: 'https://eip.ystravel.com.tw/uploads/card-bg/bg_profile_purplemoon.png'
  },
  {
    name: '小新',
    url: 'https://eip.ystravel.com.tw/uploads/card-bg/bg_profile_shinchan.png'
  }
])

// 分頁相關
const currentPage = ref(1)
const itemsPerPage = 6
const selectedBackground = ref('')

// 計算屬性
const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const totalPages = computed(() => {
  return Math.ceil(backgroundOptions.value.length / itemsPerPage)
})

const paginatedBackgrounds = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return backgroundOptions.value.slice(start, end)
})

// 監聽對話框開啟
watch(dialog, (newVal) => {
  if (newVal) {
    selectedBackground.value = props.currentBackground || ''
    currentPage.value = 1 // 重置到第一頁
  }
})

// 關閉對話框
const closeDialog = () => {
  dialog.value = false
}

// 確認選擇
const handleConfirm = () => {
  emit('confirm', selectedBackground.value)
}

// 顯示使用統計
const showUsageStats = () => {
  emit('show-usage-stats')
}
</script>

<style lang="scss" scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
