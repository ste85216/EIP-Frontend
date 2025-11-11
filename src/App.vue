<template>
  <div id="app-scale-wrapper">
    <v-app>
      <v-main>
        <router-view />
      </v-main>
      <ScrollToTop />
    </v-app>
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import ScrollToTop from '@/components/ScrollToTop.vue'

const appStore = useAppStore()

// 監聽縮放變化並套用到全域
watch(() => appStore.uiScale, (newScale) => {
  appStore.applyScale(newScale)
}, { immediate: true })

// 掛載時套用縮放
onMounted(() => {
  appStore.applyScale(appStore.uiScale)
})
</script>
