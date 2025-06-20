<template>
  <h1>行銷美編需求申請單</h1>
</template>
<script setup>
import { definePage } from 'vue-router/auto'
import UserRole from '@/enums/UserRole'

definePage({
  meta: {
    title: '行銷美編需求申請單 | GInternational',
    login: true,
    roles: [UserRole.MARKETING, UserRole.ADMIN,UserRole.DESIGNER,UserRole.MANAGER]
  }
})
</script>