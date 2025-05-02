<template>
  <v-app>
    <v-main>
      <v-app-bar
        elevation="0"
        class="border px-8 ps-xl-12 pe-xl-15 "
        height="100"
      >
        <span>
          <v-img
            src="/src/assets/image/Ystravel_logo_horizontal.png"
            :width="150"
            class="ms-xl-3 ms-xxl-8"
          />
        </span>
        <v-spacer />
        <div class="me-xl-2">
          <v-btn
            href="https://www.ystravel.com.tw/"
            target="_blank"
            variant="plain"
            class="opacity-100 custom-btn"
            :ripple="false"
          >
            永信官網
          </v-btn>
          <v-btn
            href="https://b2b.ystravel.com.tw/member/signin/?returnUrl=%2f"
            target="_blank"
            variant="plain"
            class="opacity-100 custom-btn"
            :ripple="false"
          >
            同業網
          </v-btn>
          <v-btn
            href="https://ystravel.voyage.com.tw:8443/default_standard.asp"
            target="_blank"
            variant="plain"
            class="opacity-100 custom-btn"
            :ripple="false"
          >
            科威系統
          </v-btn>
          <v-btn
            href="https://7029.tw/finalcall/"
            target="_blank"
            variant="plain"
            class="opacity-100 custom-btn"
            :ripple="false"
          >
            FinalCall
          </v-btn>
        </div>
        <v-btn
          v-if="user.isLogin && (user.isManager || user.isAdmin || user.isUser)"
          class="ms-6 me-xl-3 me-xxl-7 rounded-0"
          variant="outlined"
          prepend-icon="mdi-arrow-left"
          color="deep-purple-darken-4"
          :ripple="false"
          flat
          to="/"
        >
          回鋭皇系統
        </v-btn>
      </v-app-bar>
      <router-view />
    </v-main>
  </v-app>
</template>
<script setup>
import { useUserStore } from '@/stores/user'

const user = useUserStore()
</script>
<style scoped lang="scss">
.custom-btn {
  border-radius: 0;
  position: relative;
  font-size: 15px;
  text-transform: none;

  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 0;
    height: 2px;
    background-color: #EF6C00;
    transition: width 0.3s ease;
    transform: translateX(-50%);
  }

  &:hover::before {
    width: 100%;
  }
}
</style>