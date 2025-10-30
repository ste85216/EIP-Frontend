<template>
  <v-card
    class="marquee-card  rounded-0"
    elevation="0"
    :style="{
      visibility: showMarquee ? 'visible' : 'hidden',
      height: showMarquee ? undefined : '0px',
      padding: showMarquee ? undefined : '0',
      borderWidth: showMarquee ? undefined : '0',
      overflow: 'hidden'
    }"
  >
    <v-card-text class="d-flex align-center px-3 py-2">
      <v-avatar
        size="28"
        class="me-3 marquee-icon"
        color="white"
      >
        <v-icon
          size="16"
          color="#555"
        >
          mdi-bullhorn
        </v-icon>
      </v-avatar>

      <div
        ref="wrapperRef"
        class="marquee-wrapper"
      >
        <div
          v-if="marqueeItems.length > 0"
          :key="marqueeKey"
          ref="trackRef"
          class="marquee-track"
          :style="{
            animationDuration: marqueeDuration,
            '--wrapper': String(wrapperWidth),
            '--text': String(trackWidth),
            visibility: isAnimating ? 'visible' : 'hidden',
            opacity: isAnimating ? 1 : 0,
            transform: 'translateX(' + (wrapperWidth) + 'px)'
          }"
          @animationend="handleTrackEnd"
        >
          <div
            v-for="(item, i) in marqueeItems"
            :key="`item-${i}-${item.type}`"
            class="marquee-item"
          >
            <v-chip
              size="x-small"
              :color="getAnnouncementTypeColor(item.type)"
              variant="flat"
              class="me-2"
              label
            >
              <v-icon
                size="11"
                color="white"
                class="me-1"
              >
                {{ getAnnouncementTypeIcon(item.type) }}
              </v-icon>
              {{ getAnnouncementTypeText(item.type) }}
            </v-chip>
            <span class="marquee-text">{{ item.text }}</span>
          </div>
        </div>
      </div>

      <div class="d-flex align-center ms-3">
        <v-btn
          variant="outlined"
          size="x-small"
          color="white"
          height="28"
          @click="suppressToday()"
        >
          <v-icon
            size="15"
            color="white"
            style="margin-right: 2px;"
          >
            mdi-close
          </v-icon>
          今日不再顯示
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useApi } from '@/composables/axios'


const { apiAuth } = useApi()

// 後端內容
const marqueeItems = ref([])
const wrapperRef = ref(null)
const trackRef = ref(null)
const wrapperWidth = ref(0)
const trackWidth = ref(0)

// 顯示/隱藏與版本控管（避免初次載入閃現，預設為隱藏）
const showMarquee = ref(false)
const contentVersion = ref(null)
const broadcastVersion = ref(null)
const STORAGE_SUPPRESS_UNTIL = 'ginternational-marquee-suppress-until'
const STORAGE_SUPPRESS_BROADCAST = 'ginternational-marquee-suppress-broadcast'
const STORAGE_SUPPRESS_AT = 'ginternational-marquee-suppress-at'

const isSuppressedForToday = () => {
  try {
    const until = Number(localStorage.getItem(STORAGE_SUPPRESS_UNTIL) || 0)
    const now = Date.now()
    return until && now < until
  } catch { return false }
}

const updateVisibility = () => {
  if (marqueeItems.value.length === 0) {
    showMarquee.value = false
    return
  }
  if (isSuppressedForToday()) {
    // 今日被抑制：沒有重新推播就關閉，有重新推播則先不顯示，交由 startIfAllowed 量測完成後再顯示
    try {
      const suppressedAt = Number(localStorage.getItem(STORAGE_SUPPRESS_AT) || 0)
      const broadcastMs = broadcastVersion.value ? new Date(broadcastVersion.value).getTime() : 0
      const allowed = broadcastMs > suppressedAt
      if (!allowed) {
        showMarquee.value = false
      }
    } catch { showMarquee.value = false }
  } else {
    // 不在抑制期間：先不顯示，交由 startIfAllowed 控制（避免未量測閃現）
  }
}

const startIfAllowed = () => {
  if (marqueeItems.value.length === 0) return
  // 判斷是否允許顯示
  let allowed = true
  if (isSuppressedForToday()) {
    try {
      const suppressedAt = Number(localStorage.getItem(STORAGE_SUPPRESS_AT) || 0)
      const broadcastMs = broadcastVersion.value ? new Date(broadcastVersion.value).getTime() : 0
      allowed = broadcastMs > suppressedAt
    } catch { allowed = false }
  }
  if (!allowed) return

  if (!wrapperWidth.value || !trackWidth.value) {
    let tries = 0
    const maxTries = 8
    const tryMeasure = () => {
      tries++
      measure()
      if (!wrapperWidth.value || !trackWidth.value) {
        if (tries >= maxTries) {
          // fallback
          if (!wrapperWidth.value) {
            wrapperWidth.value = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0, 1024)
            console.warn('[Marquee] fallback wrapperWidth=', wrapperWidth.value)
          }
          if (!trackWidth.value) {
            try {
              const text = trackRef.value?.textContent || ''
              trackWidth.value = Math.max(text.length * 10, 300)
            } catch { trackWidth.value = 600 }
            console.warn('[Marquee] fallback trackWidth=', trackWidth.value)
          }
        } else {
          requestAnimationFrame(tryMeasure)
          return
        }
      }
      showMarquee.value = true
      restartAnimation()
    }
    requestAnimationFrame(tryMeasure)
    return
  }
  showMarquee.value = true
  restartAnimation()
}

const measure = () => {
  try {
    wrapperWidth.value = wrapperRef.value ? wrapperRef.value.clientWidth : 0
    trackWidth.value = trackRef.value ? trackRef.value.scrollWidth : 0
  } catch {
    wrapperWidth.value = 0
    trackWidth.value = 0
    console.warn('[Marquee] measure: failed, set widths=0')
  }
}

const fetchActive = async () => {
  try {
    const { data } = await apiAuth.get('/marquees/active')
    if (data.success) {
      const list = data.result || []
      marqueeItems.value = list.map(item => ({ id: item._id, type: item.type, text: item.content }))
      await nextTick()
      measure()
      updateVisibility()
      startIfAllowed()
    }
  } catch {
    marqueeItems.value = []
    updateVisibility()
  }
}

const fetchVersionAndSync = async () => {
  try {
    const { data } = await apiAuth.get('/marquees/version')
    if (data.success) {
      const newContent = data.result?.contentVersion || null
      const newBroadcast = data.result?.broadcastVersion || null
      const contentChanged = contentVersion.value !== newContent
      const prevBroadcast = broadcastVersion.value
      const broadcastChangedRaw = prevBroadcast !== newBroadcast
      const suppressedAt = Number(localStorage.getItem(STORAGE_SUPPRESS_AT) || 0)
      const broadcastMs = newBroadcast ? new Date(newBroadcast).getTime() : 0
      const broadcastChanged = broadcastChangedRaw && broadcastMs > suppressedAt && !!prevBroadcast
      contentVersion.value = newContent
      broadcastVersion.value = newBroadcast
      // 僅 content 改變時，不解除抑制，但仍更新 track 以符合最新內容
      if (contentChanged) await fetchActive()
      // 無論如何更新可視狀態（抑制由 broadcast 判定）
      updateVisibility()
      if (broadcastChanged) {
        // 重新測量並強制啟動
        let tries = 0
        const maxTries = 8
        const tryStart = () => {
          tries++
          measure()
          if (!wrapperWidth.value || !trackWidth.value) {
            if (tries < maxTries) {
              requestAnimationFrame(tryStart)
              return
            }
          }
          if (!wrapperWidth.value) {
            wrapperWidth.value = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0, 1024)
          }
          if (!trackWidth.value) {
            try {
              const text = trackRef.value?.textContent || ''
              trackWidth.value = Math.max(text.length * 10, 300)
            } catch { trackWidth.value = 600 }
          }
          showMarquee.value = true
          restartAnimation()
        }
        requestAnimationFrame(tryStart)
      } else {
        startIfAllowed()
      }
    }
  } catch {
    // ignore
  }
}

let versionTimer = null
onMounted(async () => {
  await fetchVersionAndSync()
  versionTimer = setInterval(fetchVersionAndSync, 60000)
  window.addEventListener('resize', onResize)
})
onUnmounted(() => { if (versionTimer) clearInterval(versionTimer); window.removeEventListener('resize', onResize) })
const onResize = () => { measure(); restartAnimation() }

const suppressToday = () => {
  try {
    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999)
    localStorage.setItem(STORAGE_SUPPRESS_UNTIL, String(endOfDay.getTime()))
    localStorage.setItem(STORAGE_SUPPRESS_BROADCAST, broadcastVersion.value || '')
    localStorage.setItem(STORAGE_SUPPRESS_AT, String(Date.now()))
  } catch {
    // ignore
  }
  updateVisibility()
  // 立即隱藏並停止動畫，避免子元素殘留顯示
  showMarquee.value = false
  isAnimating.value = false
  marqueeKey.value++
}

// 移除設定 UI（改由 MarqueeEditorDialog 在管理頁操作）

// 全部逐條連續播放（整輪一次）
const marqueeKey = ref(0)
const isAnimating = ref(false)
const marqueeDuration = computed(() => {
  const distance = wrapperWidth.value + trackWidth.value
  const speedPxPerSec = 60 // 慢速
  const seconds = Math.max(10, Math.min(60, distance / speedPxPerSec))
  return `${seconds}s`
})
const restartAnimation = () => { marqueeKey.value++; isAnimating.value = true }
const handleTrackEnd = async () => {
  // 播完一輪，停頓 1 秒再重來（避免靜止時內容閃現，先隱藏）
  isAnimating.value = false
  await new Promise(resolve => setTimeout(resolve, 1000))
  requestAnimationFrame(() => {
    measure()
    restartAnimation()
  })
}
watch(marqueeItems, async () => {
  await nextTick()
  measure()
  restartAnimation()
})

// 類型樣式映射
const getAnnouncementTypeColor = (type) => {
  const colorMap = {
    system: 'blue-darken-2',
    update: 'cyan-darken-3',
    announcement: 'grey-darken-2',
    maintenance: 'red-darken-1',
    event: 'indigo-darken-1'
  }
  return colorMap[type] || 'grey'
}

const getAnnouncementTypeText = (type) => {
  const typeMap = {
    system: '系統',
    update: '更新',
    announcement: '一般',
    maintenance: '維護',
    event: '活動'
  }
  return typeMap[type] || '一般'
}

const getAnnouncementTypeIcon = (type) => {
  const iconMap = {
    system: 'mdi-cog-outline',
    update: 'mdi-refresh',
    announcement: 'mdi-bullhorn-outline',
    maintenance: 'mdi-wrench-outline',
    event: 'mdi-calendar-star'
  }
  return iconMap[type] || 'mdi-file-document-outline'
}
</script>

<style lang="scss" scoped>
.marquee-card {
  background: #555;
  overflow: hidden;
}

.marquee-wrapper {
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
  flex: 1;
  height: 28px;
}

.marquee-track {
  position: absolute;
  white-space: nowrap;
  will-change: transform;
  display: inline-flex;
  align-items: center;
  color: #fff;
  animation-name: marquee-left-once;
  animation-timing-function: linear;
  animation-iteration-count: 1;
  animation-fill-mode: forwards;
}

@keyframes marquee-left-once {
  0% { transform: translateX(calc(var(--wrapper) * 1px)); }
  100% { transform: translateX(calc(-1px * var(--text))); }
}

.marquee-item { display: inline-flex; align-items: center; margin-right: 36px; }

.marquee-text {
  font-size: 14px;
  font-weight: 500;
  color: #fff;
}

.marquee-action {
  margin-left: auto;
}
</style>


