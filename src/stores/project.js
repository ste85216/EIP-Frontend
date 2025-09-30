import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useProjectStore = defineStore('project', () => {
  // 狀態
  const projects = ref([])
  const loading = ref(false)

  // 動作
  const setProjects = (newProjects) => {
    projects.value = newProjects
  }

  const updateProject = (projectId, updates) => {
    const projectIndex = projects.value.findIndex(p => p._id === projectId)
    if (projectIndex !== -1) {
      // 專案已存在，更新它
      const updatedProject = { ...projects.value[projectIndex] }

      // 逐一更新每個欄位，特別處理 favorites
      Object.keys(updates).forEach(key => {
        if (key === 'favorites' && Array.isArray(updates.favorites)) {
          // 深拷貝 favorites 陣列，確保每個 favorite 物件結構完整
          updatedProject.favorites = updates.favorites.map(fav => ({
            ...fav,
            user: fav.user ? {
              _id: fav.user._id,
              name: fav.user.name,
              email: fav.user.email
            } : fav.user
          }))
        } else {
          updatedProject[key] = updates[key]
        }
      })

      // 特別處理 status 欄位（包括 undefined 值）
      if (Object.prototype.hasOwnProperty.call(updates, 'status')) {
        updatedProject.status = updates.status
      }

      projects.value[projectIndex] = updatedProject
    } else {
      // 專案不存在，添加它
      const newProject = { _id: projectId }

      // 逐一添加每個欄位，特別處理 favorites
      Object.keys(updates).forEach(key => {
        if (key === 'favorites' && Array.isArray(updates.favorites)) {
          // 深拷貝 favorites 陣列，確保每個 favorite 物件結構完整
          newProject.favorites = updates.favorites.map(fav => ({
            ...fav,
            user: fav.user ? {
              _id: fav.user._id,
              name: fav.user.name,
              email: fav.user.email
            } : fav.user
          }))
        } else {
          newProject[key] = updates[key]
        }
      })

      // 特別處理 status 欄位（包括 undefined 值）
      if (Object.prototype.hasOwnProperty.call(updates, 'status')) {
        newProject.status = updates.status
      }

      projects.value.push(newProject)
    }
  }

  const addProject = (project) => {
    projects.value.push(project)
  }

  const removeProject = (projectId) => {
    const index = projects.value.findIndex(p => p._id === projectId)
    if (index !== -1) {
      projects.value.splice(index, 1)
    }
  }

  const getProjectById = (projectId) => {
    return projects.value.find(p => p._id === projectId)
  }

  return {
    // 狀態
    projects,
    loading,
    // 動作
    setProjects,
    updateProject,
    addProject,
    removeProject,
    getProjectById
  }
})
