<template>
  <v-app>
    <v-main>
      <router-view />
    </v-main>
    <ScrollToTop />
  </v-app>
</template>

<script setup>
import ScrollToTop from '@/components/ScrollToTop.vue'
</script>
