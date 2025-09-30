# UserAvatar 組件使用說明

## 概述
`UserAvatar` 是一個統一的用戶頭像顯示組件，會自動處理：
- 自定義頭像的顯示
- 預設頭像時顯示彩色背景 + 姓名縮寫
- 無頭像時顯示預設圖示

## 使用方法

### 基本用法
```vue
<template>
  <UserAvatar :user="user" />
</template>

<script setup>
import UserAvatar from '@/components/UserAvatar.vue'

const user = {
  name: '陳至傑',
  avatar: 'https://example.com/avatar.jpg' // 或預設頭像 URL
}
</script>
```

### 自定義大小
```vue
<UserAvatar :user="user" size="32" />
<UserAvatar :user="user" size="48" />
```

### 自定義樣式
```vue
<UserAvatar 
  :user="user" 
  size="40" 
  avatar-class="me-2 border" 
/>
```

## 功能特點

### 1. 自動頭像類型檢測
- **自定義頭像**：顯示用戶上傳的圖片
- **預設頭像**：顯示彩色背景 + 姓名縮寫
- **無頭像**：顯示預設帳戶圖示

### 2. 一致性顏色生成
- 根據用戶姓名生成一致的顏色
- 同一個姓名總是得到相同的顏色
- 支援 18 種 Vuetify 顏色

### 3. 響應式字體大小
- 字體大小會根據頭像大小自動調整
- 確保在不同尺寸下都有良好的可讀性

## 在 Store 中的工具函數

### 直接使用工具函數
```javascript
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 檢查是否為預設頭像
const isDefault = userStore.isDefaultAvatar(user.avatar)

// 取得姓名縮寫
const initials = userStore.getInitials(user.name)

// 取得頭像顏色
const color = userStore.getAvatarColor(user.name)

// 取得完整頭像資訊
const avatarInfo = userStore.getUserAvatarInfo(user)
```

## 整合到現有組件

### 替換現有的 v-avatar
```vue
<!-- 舊的寫法 -->
<v-avatar size="32">
  <v-img v-if="user.avatar" :src="user.avatar" />
  <v-icon v-else>mdi-account</v-icon>
</v-avatar>

<!-- 新的寫法 -->
<UserAvatar :user="user" size="32" />
```

### 在列表中使用
```vue
<template>
  <v-list>
    <v-list-item v-for="user in users" :key="user._id">
      <template #prepend>
        <UserAvatar :user="user" size="32" avatar-class="me-2" />
      </template>
      <v-list-item-title>{{ user.name }}</v-list-item-title>
    </v-list-item>
  </v-list>
</template>
```

## 注意事項

1. **用戶物件結構**：確保用戶物件包含 `name` 和 `avatar` 欄位
2. **預設頭像檢測**：系統會自動檢測包含 `avatar_purple_robot` 或 `avatar_robot` 的 URL
3. **顏色一致性**：同一個姓名在不同地方會顯示相同的顏色
4. **響應式設計**：組件會根據大小自動調整字體和圖示大小
