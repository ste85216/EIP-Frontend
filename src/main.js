/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'
import vue3GoogleLogin from 'vue3-google-login'
import VueEasyLightbox from 'vue-easy-lightbox'

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'

// Directives
import { vPermission, vAnyPermission, vAllPermissions, vRole } from '@/directives/permission'

const app = createApp(App)
app.use(vue3GoogleLogin, {
  clientId: '890205288379-2bm447qt1rj7jkooc7luqej83if9inp4.apps.googleusercontent.com'
})
app.use(VueEasyLightbox)

// 註冊權限指令
app.directive('permission', vPermission)
app.directive('any-permission', vAnyPermission)
app.directive('all-permissions', vAllPermissions)
app.directive('role', vRole)

registerPlugins(app)

app.mount('#app')
