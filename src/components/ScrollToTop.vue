<template>
  <Transition name="fade">
    <v-btn
      v-show="showButton"
      icon="mdi-arrow-up"
      color="blue-grey-darken-2"
      class="scroll-to-top"
      @click="scrollToTop"
    />
  </Transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const showButton = ref(false)

const checkScroll = () => {
  showButton.value = window.scrollY > 300
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

onMounted(() => {
  window.addEventListener('scroll', checkScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', checkScroll)
})
</script>

<style scoped>
.scroll-to-top {
  height: 36px;
  width: 36px;
  position: fixed;
  bottom: 60px;
  right: 10px;
  z-index: 99;
}

@media (min-width: 600px) {
  .scroll-to-top {
    height: 40px;
    width: 40px;
  }
}

@media (min-width: 960px) {
  .scroll-to-top {
    height: 48px;
    width: 48px;
    bottom: 68px;
    right: 20px;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
