import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTeamStore = defineStore('team', () => {
  // 狀態
  const teams = ref([])
  const loading = ref(false)

  // 動作
  const setTeams = (newTeams) => {
    teams.value = newTeams
  }

  const addTeam = (team) => {
    teams.value.push(team)
  }

  const updateTeam = (teamId, updates) => {
    const teamIndex = teams.value.findIndex(t => t._id === teamId)
    if (teamIndex !== -1) {
      // 團隊已存在，更新它
      teams.value[teamIndex] = { ...teams.value[teamIndex], ...updates }
    } else {
      // 團隊不存在，添加它
      teams.value.push({ _id: teamId, ...updates })
    }
  }

  const removeTeam = (teamId) => {
    const index = teams.value.findIndex(t => t._id === teamId)
    if (index !== -1) {
      teams.value.splice(index, 1)
    }
  }

  const getTeamById = (teamId) => {
    return teams.value.find(t => t._id === teamId)
  }

  const getUserTeams = (userId) => {
    return teams.value.filter(team => {
      return team.members?.some(member => member._id === userId)
    })
  }

  // 檢查用戶是否為指定團隊的管理者
  const isTeamManager = (teamId, userId) => {
    const team = getTeamById(teamId)
    if (!team || !team.managers) return false
    return team.managers.some(manager => manager._id === userId)
  }

  // 檢查用戶是否為專案所屬團隊的管理者
  const isProjectTeamManager = (project, userId) => {
    if (!project || !project.team || !userId) return false
    const teamId = typeof project.team === 'string' ? project.team : project.team._id
    if (!teamId) return false
    return isTeamManager(teamId, userId)
  }

  return {
    // 狀態
    teams,
    loading,
    // 動作
    setTeams,
    addTeam,
    updateTeam,
    removeTeam,
    getTeamById,
    getUserTeams,
    isTeamManager,
    isProjectTeamManager
  }
})
