<template>
  <v-container max-width="1920">
    <!-- 標題區域 -->
    <v-row class="mt-1 mx-0 px-2 rounded-lg bg-white">
      <v-col class="d-flex align-center pb-4 px-2">
        <span class="page-title">我的任務</span>
      </v-col>
    </v-row>

    <!-- 任務表格區域 -->
    <v-row class="mt-1 mx-0">
      <v-col>
        <v-card
          class="rounded-lg border pt-3"
          elevation="0"
        >
          <!-- 載入中 -->
          <div
            v-if="loading"
            class="d-flex justify-center py-16"
          >
            <v-progress-circular
              indeterminate
              color="grey"
              size="64"
            />
          </div>

          <!-- 任務表格 -->
          <div v-else>
            <!-- Tab 切換和搜尋區域 -->
            <div class="task-tabs-container mb-4">
              <div class="d-flex align-center justify-space-between">
                <v-tabs
                  v-model="activeTab"
                  color="teal-darken-1"
                  show-arrows
                  align-tabs="start"
                >
                  <v-tab value="assigned">
                    <v-icon class="me-2">
                      mdi-account-arrow-right
                    </v-icon>
                    進行中 (被指派)
                    <v-chip
                      v-if="assignedTasksCount > 0"
                      size="x-small"
                      :color="activeTab === 'assigned' ? 'teal-darken-1' : 'grey'"
                      variant="tonal"
                      class="ms-2"
                    >
                      {{ assignedTasksCount }}
                    </v-chip>
                  </v-tab>
                  <v-tab value="collaborating">
                    <v-icon class="me-2">
                      mdi-account-multiple
                    </v-icon>
                    進行中 (協作者)
                    <v-chip
                      v-if="collaboratingTasksCount > 0"
                      size="x-small"
                      :color="activeTab === 'collaborating' ? 'teal-darken-1' : 'grey'"
                      variant="tonal"
                      class="ms-2"
                    >
                      {{ collaboratingTasksCount }}
                    </v-chip>
                  </v-tab>
                  <v-tab
                    value="dueSoon"
                    color="orange-darken-1"
                  >
                    <v-icon class="me-2">
                      mdi-clock-alert-outline
                    </v-icon>
                    即將截止
                    <v-chip
                      v-if="dueSoonTasksCount > 0"
                      size="x-small"
                      :color="activeTab === 'dueSoon' ? 'orange-darken-1' : 'grey'"
                      variant="tonal"
                      class="ms-2"
                    >
                      {{ dueSoonTasksCount }}
                    </v-chip>
                  </v-tab>
                  <v-tab
                    value="overdue"
                    color="red-darken-1"
                  >
                    <v-icon class="me-2">
                      mdi-alert-circle-outline
                    </v-icon>
                    已逾期
                    <v-chip
                      v-if="overdueTasksCount > 0"
                      size="x-small"
                      :color="activeTab === 'overdue' ? 'red-darken-1' : 'grey'"
                      variant="tonal"
                      class="ms-2"
                    >
                      {{ overdueTasksCount }}
                    </v-chip>
                  </v-tab>
                  <v-tab value="completed">
                    <v-icon class="me-2">
                      mdi-check-circle-outline
                    </v-icon>
                    已完成
                    <v-chip
                      v-if="completedTasksCount > 0"
                      size="x-small"
                      :color="activeTab === 'completed' ? 'green-darken-1' : 'grey'"
                      variant="tonal"
                      class="ms-2"
                    >
                      {{ completedTasksCount }}
                    </v-chip>
                  </v-tab>
                </v-tabs>

                <!-- 搜尋區域 -->
                <div class="search-container me-3">
                  <v-text-field
                    v-model="searchText"
                    label="搜尋任務名稱"
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                    density="compact"
                    hide-details
                    clearable
                    class="search-field"
                    :loading="isSearching"
                    @input="handleSearch"
                  />
                </div>
              </div>
            </div>

            <!-- 我被指派的任務 -->
            <div v-if="activeTab === 'assigned'">
              <!-- 空狀態提示 -->
              <div
                v-if="assignedTasks.length === 0"
                class="text-center py-12"
              >
                <!-- 搜尋無結果 -->
                <div v-if="hasSearchText">
                  <v-icon
                    size="56"
                    color="grey-lighten-1"
                    class="mb-2"
                  >
                    mdi-magnify-remove
                  </v-icon>
                  <h3 class="text-h6 text-medium-emphasis mb-2">
                    沒有搜尋到相關任務
                  </h3>
                  <p class="text-body-2 text-medium-emphasis mb-4">
                    請嘗試其他搜尋關鍵字
                  </p>
                </div>

                <!-- 沒有被指派的任務 -->
                <div v-else>
                  <v-icon
                    size="64"
                    color="grey-lighten-1"
                    class="mb-4"
                  >
                    mdi-account-arrow-right
                  </v-icon>
                  <h3 class="text-h6 text-medium-emphasis mb-2">
                    尚無被指派的任務
                  </h3>
                  <p class="text-body-2 text-medium-emphasis">
                    您還沒有被指派任何任務
                  </p>
                </div>
              </div>

              <!-- 被指派任務列表 -->
              <div v-else>
                <v-data-table
                  :headers="tableHeaders"
                  :items="assignedTasks"
                  :items-per-page="20"
                  hover
                  density="compact"
                  class="my-tasks-table"
                  @click:row="openTaskSidebar"
                >
                  <template #[`item.name`]="{ item }">
                    <div class="d-flex align-center">
                      <v-icon
                        :color="item.status === 'completed' ? 'teal-lighten-1' : 'grey-lighten-1'"
                        class="me-2 pt-1"
                        size="20"
                      >
                        {{ item.status === 'completed' ? 'mdi-check-circle' : 'mdi-check-circle-outline' }}
                      </v-icon>
                      <span
                        class="task-name"
                        :class="{ 'text-decoration-line-through': item.status === 'completed' }"
                      >
                        {{ item.name }}
                      </span>
                    </div>
                  </template>

                  <template #[`item.dueDate`]="{ item }">
                    <div class="d-flex align-center">
                      <v-icon
                        v-if="item.dueDate"
                        size="16"
                        class="me-1"
                        :color="getDueDateColor(item.dueDate)"
                      >
                        mdi-calendar-clock-outline
                      </v-icon>
                      <span
                        v-if="item.dueDate"
                        :class="getDueDateColor(item.dueDate)"
                        class="due-date-text"
                      >
                        {{ formatDate(item.dueDate) }}
                      </span>
                      <span
                        v-else
                        class="text-medium-emphasis"
                      >
                        -
                      </span>
                    </div>
                  </template>

                  <template #[`item.collaborators`]="{ item }">
                    <div class="d-flex align-center">
                      <v-tooltip
                        :text="getAllCollaboratorsText(item)"
                        location="top"
                        :disabled="!getDisplayCollaborators(item)?.length"
                      >
                        <template #activator="{ props: tooltipProps }">
                          <div
                            v-bind="tooltipProps"
                            class="d-flex align-center"
                          >
                            <UserAvatar
                              v-for="(collaborator, index) in getDisplayCollaborators(item)?.slice(0, 3)"
                              :key="collaborator._id"
                              :user="collaborator"
                              size="24"
                              avatar-class="collaborator-avatar"
                              :style="{
                                marginLeft: index > 0 ? '-8px' : '0',
                                zIndex: 10 - index
                              }"
                            />
                            <span
                              v-if="getDisplayCollaborators(item)?.length > 3"
                              class="text-caption ms-1"
                            >
                              +{{ getDisplayCollaborators(item).length - 3 }}
                            </span>
                            <span
                              v-if="!getDisplayCollaborators(item) || getDisplayCollaborators(item).length === 0"
                              class="text-medium-emphasis"
                            >
                              -
                            </span>
                          </div>
                        </template>
                      </v-tooltip>
                    </div>
                  </template>

                  <template #[`item.project`]="{ item }">
                    <div class="d-flex align-center">
                      <v-icon
                        :color="item.project?.iconColor === 'white' ? 'grey-lighten-1' : item.project?.iconColor"
                        size="20"
                        class="me-2"
                      >
                        mdi-square-rounded
                      </v-icon>
                      <span
                        class="project-name"
                        @click.stop="navigateToProject(item)"
                      >
                        {{ item.project?.name || '未知專案' }}
                      </span>
                    </div>
                  </template>

                  <template #[`item.category`]="{ item }">
                    <v-chip
                      label
                      size="small"
                      color="blue-darken-2"
                    >
                      {{ item.category || '未分類' }}
                    </v-chip>
                  </template>

                  <template #[`item.updatedAt`]="{ item }">
                    <v-tooltip
                      :text="getFullDateTime(item.updatedAt)"
                      location="top"
                    >
                      <template #activator="{ props: tooltipProps }">
                        <span
                          v-bind="tooltipProps"
                          class="cursor-pointer"
                        >
                          {{ formatDate(item.updatedAt) }}
                        </span>
                      </template>
                    </v-tooltip>
                  </template>
                </v-data-table>
              </div>
            </div>

            <!-- 我是協作者的任務 -->
            <div v-else-if="activeTab === 'collaborating'">
              <!-- 空狀態提示 -->
              <div
                v-if="collaboratingTasks.length === 0"
                class="text-center py-12"
              >
                <!-- 搜尋無結果 -->
                <div v-if="hasSearchText">
                  <v-icon
                    size="56"
                    color="grey-lighten-1"
                    class="mb-2"
                  >
                    mdi-magnify-remove
                  </v-icon>
                  <h3 class="text-h6 text-medium-emphasis mb-2">
                    沒有搜尋到相關任務
                  </h3>
                  <p class="text-body-2 text-medium-emphasis mb-4">
                    請嘗試其他搜尋關鍵字
                  </p>
                </div>

                <!-- 沒有協作的任務 -->
                <div v-else>
                  <v-icon
                    size="64"
                    color="grey-lighten-1"
                    class="mb-4"
                  >
                    mdi-account-multiple
                  </v-icon>
                  <h3 class="text-h6 text-medium-emphasis mb-2">
                    尚無協作的任務
                  </h3>
                  <p class="text-body-2 text-medium-emphasis">
                    您還沒有參與任何協作任務
                  </p>
                </div>
              </div>

              <!-- 協作任務列表 -->
              <div v-else>
                <v-data-table
                  :headers="tableHeaders"
                  :items="collaboratingTasks"
                  :items-per-page="20"
                  hover
                  density="compact"
                  class="my-tasks-table"
                  @click:row="openTaskSidebar"
                >
                  <template #[`item.name`]="{ item }">
                    <div class="d-flex align-center">
                      <v-icon
                        :color="item.status === 'completed' ? 'teal-lighten-1' : 'grey-lighten-1'"
                        class="me-2 pt-1"
                        size="20"
                      >
                        {{ item.status === 'completed' ? 'mdi-check-circle' : 'mdi-check-circle-outline' }}
                      </v-icon>
                      <span
                        class="task-name"
                        :class="{ 'text-decoration-line-through': item.status === 'completed' }"
                      >
                        {{ item.name }}
                      </span>
                    </div>
                  </template>

                  <template #[`item.dueDate`]="{ item }">
                    <div class="d-flex align-center">
                      <v-icon
                        v-if="item.dueDate"
                        size="16"
                        class="me-1"
                        :color="getDueDateColor(item.dueDate)"
                      >
                        mdi-calendar-clock-outline
                      </v-icon>
                      <span
                        v-if="item.dueDate"
                        :class="getDueDateColor(item.dueDate)"
                        class="due-date-text"
                      >
                        {{ formatDate(item.dueDate) }}
                      </span>
                      <span
                        v-else
                        class="text-medium-emphasis"
                      >
                        -
                      </span>
                    </div>
                  </template>

                  <template #[`item.collaborators`]="{ item }">
                    <div class="d-flex align-center">
                      <v-tooltip
                        :text="getAllCollaboratorsText(item)"
                        location="top"
                        :disabled="!getDisplayCollaborators(item)?.length"
                      >
                        <template #activator="{ props: tooltipProps }">
                          <div
                            v-bind="tooltipProps"
                            class="d-flex align-center"
                          >
                            <UserAvatar
                              v-for="(collaborator, index) in getDisplayCollaborators(item)?.slice(0, 3)"
                              :key="collaborator._id"
                              :user="collaborator"
                              size="24"
                              avatar-class="collaborator-avatar"
                              :style="{
                                marginLeft: index > 0 ? '-8px' : '0',
                                zIndex: 10 - index
                              }"
                            />
                            <span
                              v-if="getDisplayCollaborators(item)?.length > 3"
                              class="text-caption ms-1"
                            >
                              +{{ getDisplayCollaborators(item).length - 3 }}
                            </span>
                            <span
                              v-if="!getDisplayCollaborators(item) || getDisplayCollaborators(item).length === 0"
                              class="text-medium-emphasis"
                            >
                              -
                            </span>
                          </div>
                        </template>
                      </v-tooltip>
                    </div>
                  </template>

                  <template #[`item.project`]="{ item }">
                    <div class="d-flex align-center">
                      <v-icon
                        :color="item.project?.iconColor === 'white' ? 'grey-lighten-1' : item.project?.iconColor"
                        size="20"
                        class="me-2"
                      >
                        mdi-square-rounded
                      </v-icon>
                      <span
                        class="project-name"
                        @click.stop="navigateToProject(item)"
                      >
                        {{ item.project?.name || '未知專案' }}
                      </span>
                    </div>
                  </template>

                  <template #[`item.category`]="{ item }">
                    <v-chip
                      label
                      size="small"
                      color="blue-darken-2"
                    >
                      {{ item.category || '未分類' }}
                    </v-chip>
                  </template>

                  <template #[`item.updatedAt`]="{ item }">
                    <v-tooltip
                      :text="getFullDateTime(item.updatedAt)"
                      location="top"
                    >
                      <template #activator="{ props: tooltipProps }">
                        <span
                          v-bind="tooltipProps"
                          class="cursor-pointer"
                        >
                          {{ formatDate(item.updatedAt) }}
                        </span>
                      </template>
                    </v-tooltip>
                  </template>
                </v-data-table>
              </div>
            </div>

            <!-- 即將截止的任務 -->
            <div v-else-if="activeTab === 'dueSoon'">
              <!-- 空狀態提示 -->
              <div
                v-if="dueSoonTasks.length === 0"
                class="text-center py-12"
              >
                <!-- 搜尋無結果 -->
                <div v-if="hasSearchText">
                  <v-icon
                    size="56"
                    color="grey-lighten-1"
                    class="mb-2"
                  >
                    mdi-magnify-remove
                  </v-icon>
                  <h3 class="text-h6 text-medium-emphasis mb-2">
                    沒有搜尋到相關任務
                  </h3>
                  <p class="text-body-2 text-medium-emphasis mb-4">
                    請嘗試其他搜尋關鍵字
                  </p>
                </div>

                <!-- 沒有即將截止的任務 -->
                <div v-else>
                  <v-icon
                    size="64"
                    color="grey-lighten-1"
                    class="mb-4"
                  >
                    mdi-clock-alert-outline
                  </v-icon>
                  <h3 class="text-h6 text-medium-emphasis mb-2">
                    尚無即將截止的任務
                  </h3>
                  <p class="text-body-2 text-medium-emphasis">
                    10天內即將截止的任務會顯示在這裡
                  </p>
                </div>
              </div>

              <!-- 即將截止任務列表 -->
              <div v-else>
                <v-data-table
                  :headers="tableHeaders"
                  :items="dueSoonTasks"
                  :items-per-page="20"
                  hover
                  density="compact"
                  class="my-tasks-table"
                  @click:row="openTaskSidebar"
                >
                  <template #[`item.name`]="{ item }">
                    <div class="d-flex align-center">
                      <v-icon
                        :color="item.status === 'completed' ? 'teal-lighten-1' : 'grey-lighten-1'"
                        class="me-2 pt-1"
                        size="20"
                      >
                        {{ item.status === 'completed' ? 'mdi-check-circle' : 'mdi-check-circle-outline' }}
                      </v-icon>
                      <span
                        class="task-name"
                        :class="{ 'text-decoration-line-through': item.status === 'completed' }"
                      >
                        {{ item.name }}
                      </span>
                    </div>
                  </template>

                  <template #[`item.dueDate`]="{ item }">
                    <div class="d-flex align-center">
                      <v-icon
                        v-if="item.dueDate"
                        size="16"
                        class="me-1"
                        :color="getDueDateColor(item.dueDate)"
                      >
                        mdi-calendar-clock-outline
                      </v-icon>
                      <span
                        v-if="item.dueDate"
                        :class="getDueDateColor(item.dueDate)"
                        class="due-date-text"
                      >
                        {{ formatDate(item.dueDate) }}
                      </span>
                      <span
                        v-else
                        class="text-medium-emphasis"
                      >
                        -
                      </span>
                    </div>
                  </template>

                  <template #[`item.collaborators`]="{ item }">
                    <div class="d-flex align-center">
                      <v-tooltip
                        :text="getAllCollaboratorsText(item)"
                        location="top"
                        :disabled="!getDisplayCollaborators(item)?.length"
                      >
                        <template #activator="{ props: tooltipProps }">
                          <div
                            v-bind="tooltipProps"
                            class="d-flex align-center"
                          >
                            <UserAvatar
                              v-for="(collaborator, index) in getDisplayCollaborators(item)?.slice(0, 3)"
                              :key="collaborator._id"
                              :user="collaborator"
                              size="24"
                              avatar-class="collaborator-avatar"
                              :style="{
                                marginLeft: index > 0 ? '-8px' : '0',
                                zIndex: 10 - index
                              }"
                            />
                            <span
                              v-if="getDisplayCollaborators(item)?.length > 3"
                              class="text-caption ms-1"
                            >
                              +{{ getDisplayCollaborators(item).length - 3 }}
                            </span>
                            <span
                              v-if="!getDisplayCollaborators(item) || getDisplayCollaborators(item).length === 0"
                              class="text-medium-emphasis"
                            >
                              -
                            </span>
                          </div>
                        </template>
                      </v-tooltip>
                    </div>
                  </template>

                  <template #[`item.project`]="{ item }">
                    <div class="d-flex align-center">
                      <v-icon
                        :color="item.project?.iconColor === 'white' ? 'grey-lighten-1' : item.project?.iconColor"
                        size="20"
                        class="me-2"
                      >
                        mdi-square-rounded
                      </v-icon>
                      <span
                        class="project-name"
                        @click.stop="navigateToProject(item)"
                      >
                        {{ item.project?.name || '未知專案' }}
                      </span>
                    </div>
                  </template>

                  <template #[`item.category`]="{ item }">
                    <v-chip
                      label
                      size="small"
                      color="blue-darken-2"
                    >
                      {{ item.category || '未分類' }}
                    </v-chip>
                  </template>

                  <template #[`item.updatedAt`]="{ item }">
                    <v-tooltip
                      :text="getFullDateTime(item.updatedAt)"
                      location="top"
                    >
                      <template #activator="{ props: tooltipProps }">
                        <span
                          v-bind="tooltipProps"
                          class="cursor-pointer"
                        >
                          {{ formatDate(item.updatedAt) }}
                        </span>
                      </template>
                    </v-tooltip>
                  </template>
                </v-data-table>
              </div>
            </div>

            <!-- 已逾期的任務 -->
            <div v-else-if="activeTab === 'overdue'">
              <!-- 空狀態提示 -->
              <div
                v-if="overdueTasks.length === 0"
                class="text-center py-12"
              >
                <!-- 搜尋無結果 -->
                <div v-if="hasSearchText">
                  <v-icon
                    size="56"
                    color="grey-lighten-1"
                    class="mb-2"
                  >
                    mdi-magnify-remove
                  </v-icon>
                  <h3 class="text-h6 text-medium-emphasis mb-2">
                    沒有搜尋到相關任務
                  </h3>
                  <p class="text-body-2 text-medium-emphasis mb-4">
                    請嘗試其他搜尋關鍵字
                  </p>
                </div>

                <!-- 沒有已逾期的任務 -->
                <div v-else>
                  <v-icon
                    size="64"
                    color="grey-lighten-1"
                    class="mb-4"
                  >
                    mdi-alert-circle-outline
                  </v-icon>
                  <h3 class="text-h6 text-medium-emphasis mb-2">
                    尚無已逾期的任務
                  </h3>
                  <p class="text-body-2 text-medium-emphasis">
                    已逾期的任務會顯示在這裡
                  </p>
                </div>
              </div>

              <!-- 已逾期任務列表 -->
              <div v-else>
                <v-data-table
                  :headers="tableHeaders"
                  :items="overdueTasks"
                  :items-per-page="20"
                  hover
                  density="compact"
                  class="my-tasks-table"
                  @click:row="openTaskSidebar"
                >
                  <template #[`item.name`]="{ item }">
                    <div class="d-flex align-center">
                      <v-icon
                        :color="item.status === 'completed' ? 'teal-lighten-1' : 'grey-lighten-1'"
                        class="me-2 pt-1"
                        size="20"
                      >
                        {{ item.status === 'completed' ? 'mdi-check-circle' : 'mdi-check-circle-outline' }}
                      </v-icon>
                      <span
                        class="task-name"
                        :class="{ 'text-decoration-line-through': item.status === 'completed' }"
                      >
                        {{ item.name }}
                      </span>
                    </div>
                  </template>

                  <template #[`item.dueDate`]="{ item }">
                    <div class="d-flex align-center">
                      <v-icon
                        v-if="item.dueDate"
                        size="16"
                        class="me-1"
                        :color="getDueDateColor(item.dueDate)"
                      >
                        mdi-calendar-clock-outline
                      </v-icon>
                      <span
                        v-if="item.dueDate"
                        :class="getDueDateColor(item.dueDate)"
                        class="due-date-text"
                      >
                        {{ formatDate(item.dueDate) }}
                      </span>
                      <span
                        v-else
                        class="text-medium-emphasis"
                      >
                        -
                      </span>
                    </div>
                  </template>

                  <template #[`item.collaborators`]="{ item }">
                    <div class="d-flex align-center">
                      <v-tooltip
                        :text="getAllCollaboratorsText(item)"
                        location="top"
                        :disabled="!getDisplayCollaborators(item)?.length"
                      >
                        <template #activator="{ props: tooltipProps }">
                          <div
                            v-bind="tooltipProps"
                            class="d-flex align-center"
                          >
                            <UserAvatar
                              v-for="(collaborator, index) in getDisplayCollaborators(item)?.slice(0, 3)"
                              :key="collaborator._id"
                              :user="collaborator"
                              size="24"
                              avatar-class="collaborator-avatar"
                              :style="{
                                marginLeft: index > 0 ? '-8px' : '0',
                                zIndex: 10 - index
                              }"
                            />
                            <span
                              v-if="getDisplayCollaborators(item)?.length > 3"
                              class="text-caption ms-1"
                            >
                              +{{ getDisplayCollaborators(item).length - 3 }}
                            </span>
                            <span
                              v-if="!getDisplayCollaborators(item) || getDisplayCollaborators(item).length === 0"
                              class="text-medium-emphasis"
                            >
                              -
                            </span>
                          </div>
                        </template>
                      </v-tooltip>
                    </div>
                  </template>

                  <template #[`item.project`]="{ item }">
                    <div class="d-flex align-center">
                      <v-icon
                        :color="item.project?.iconColor === 'white' ? 'grey-lighten-1' : item.project?.iconColor"
                        size="20"
                        class="me-2"
                      >
                        mdi-square-rounded
                      </v-icon>
                      <span
                        class="project-name"
                        @click.stop="navigateToProject(item)"
                      >
                        {{ item.project?.name || '未知專案' }}
                      </span>
                    </div>
                  </template>

                  <template #[`item.category`]="{ item }">
                    <v-chip
                      label
                      size="small"
                      color="blue-darken-2"
                    >
                      {{ item.category || '未分類' }}
                    </v-chip>
                  </template>

                  <template #[`item.updatedAt`]="{ item }">
                    <v-tooltip
                      :text="getFullDateTime(item.updatedAt)"
                      location="top"
                    >
                      <template #activator="{ props: tooltipProps }">
                        <span
                          v-bind="tooltipProps"
                          class="cursor-pointer"
                        >
                          {{ formatDate(item.updatedAt) }}
                        </span>
                      </template>
                    </v-tooltip>
                  </template>
                </v-data-table>
              </div>
            </div>

            <!-- 已完成的任務 -->
            <div v-else-if="activeTab === 'completed'">
              <!-- 空狀態提示 -->
              <div
                v-if="completedTasks.length === 0"
                class="text-center py-12"
              >
                <!-- 搜尋無結果 -->
                <div v-if="hasSearchText">
                  <v-icon
                    size="56"
                    color="grey-lighten-1"
                    class="mb-2"
                  >
                    mdi-magnify-remove
                  </v-icon>
                  <h3 class="text-h6 text-medium-emphasis mb-2">
                    沒有搜尋到相關任務
                  </h3>
                  <p class="text-body-2 text-medium-emphasis">
                    請嘗試其他搜尋關鍵字
                  </p>
                </div>

                <!-- 沒有已完成的任務 -->
                <div v-else>
                  <v-icon
                    size="64"
                    color="grey-lighten-1"
                    class="mb-4"
                  >
                    mdi-check-circle-outline
                  </v-icon>
                  <h3 class="text-h6 text-medium-emphasis mb-2">
                    尚無已完成的任務
                  </h3>
                  <p class="text-body-2 text-medium-emphasis">
                    完成的任務會顯示在這裡
                  </p>
                </div>
              </div>

              <!-- 已完成任務列表 -->
              <div v-else>
                <v-data-table
                  :headers="completedTableHeaders"
                  :items="completedTasks"
                  :items-per-page="20"
                  hover
                  density="compact"
                  class="my-tasks-table"
                  @click:row="openTaskSidebar"
                >
                  <template #[`item.name`]="{ item }">
                    <div class="d-flex align-center">
                      <v-icon
                        color="teal"
                        class="me-2 pt-1"
                        size="20"
                      >
                        mdi-check-circle
                      </v-icon>
                      <span
                        class="task-name"
                      >
                        {{ item.name }}
                      </span>
                    </div>
                  </template>

                  <template #[`item.dueDate`]="{ item }">
                    <div class="d-flex align-center">
                      <v-icon
                        v-if="item.dueDate"
                        size="16"
                        class="me-1"
                      >
                        mdi-calendar-clock-outline
                      </v-icon>
                      <span
                        v-if="item.dueDate"
                        class="text-medium-emphasis"
                      >
                        {{ formatDate(item.dueDate) }}
                      </span>
                      <span
                        v-else
                        class="text-medium-emphasis"
                      >
                        -
                      </span>
                    </div>
                  </template>

                  <template #[`item.collaborators`]="{ item }">
                    <div class="d-flex align-center">
                      <v-tooltip
                        :text="getAllCollaboratorsText(item)"
                        location="top"
                        :disabled="!getDisplayCollaborators(item)?.length"
                      >
                        <template #activator="{ props: tooltipProps }">
                          <div
                            v-bind="tooltipProps"
                            class="d-flex align-center"
                          >
                            <UserAvatar
                              v-for="(collaborator, index) in getDisplayCollaborators(item)?.slice(0, 3)"
                              :key="collaborator._id"
                              :user="collaborator"
                              size="24"
                              avatar-class="collaborator-avatar"
                              :style="{
                                marginLeft: index > 0 ? '-8px' : '0',
                                zIndex: 10 - index
                              }"
                            />
                            <span
                              v-if="getDisplayCollaborators(item)?.length > 3"
                              class="text-caption ms-1"
                              style="color: rgb(var(--v-theme-on-surface-variant)); font-weight: 500;"
                            >
                              +{{ getDisplayCollaborators(item).length - 3 }}
                            </span>
                            <span
                              v-if="!getDisplayCollaborators(item) || getDisplayCollaborators(item).length === 0"
                              class="text-medium-emphasis"
                            >
                              -
                            </span>
                          </div>
                        </template>
                      </v-tooltip>
                    </div>
                  </template>

                  <template #[`item.project`]="{ item }">
                    <div class="d-flex align-center">
                      <v-icon
                        :color="item.project?.iconColor === 'white' ? 'grey-lighten-1' : item.project?.iconColor"
                        size="20"
                        class="me-2"
                      >
                        mdi-square-rounded
                      </v-icon>
                      <span
                        class="project-name"
                        @click.stop="navigateToProject(item)"
                      >
                        {{ item.project?.name || '未知專案' }}
                      </span>
                    </div>
                  </template>

                  <template #[`item.category`]="{ item }">
                    <v-chip
                      label
                      size="small"
                      color="blue-darken-2"
                    >
                      {{ item.category || '未分類' }}
                    </v-chip>
                  </template>

                  <template #[`item.completedBy`]="{ item }">
                    <div class="d-flex align-center">
                      <v-tooltip
                        v-if="item.completedBy"
                        :text="item.completedBy.name"
                        location="top"
                      >
                        <template #activator="{ props: tooltipProps }">
                          <div
                            v-bind="tooltipProps"
                            class="d-flex align-center"
                          >
                            <UserAvatar
                              :user="item.completedBy"
                              size="24"
                              avatar-class="me-2"
                            />
                          </div>
                        </template>
                      </v-tooltip>
                      <span
                        v-else
                        class="text-medium-emphasis"
                      >
                        -
                      </span>
                    </div>
                  </template>

                  <template #[`item.completedAt`]="{ item }">
                    <v-tooltip
                      v-if="item.completedAt"
                      :text="getFullDateTime(item.completedAt)"
                      location="top"
                    >
                      <template #activator="{ props: tooltipProps }">
                        <span
                          v-bind="tooltipProps"
                          class="cursor-pointer"
                        >
                          {{ formatDate(item.completedAt) }}
                        </span>
                      </template>
                    </v-tooltip>
                    <span
                      v-else
                      class="text-caption text-medium-emphasis"
                    >
                      -
                    </span>
                  </template>

                  <template #[`item.updatedAt`]="{ item }">
                    <v-tooltip
                      :text="getFullDateTime(item.updatedAt)"
                      location="top"
                    >
                      <template #activator="{ props: tooltipProps }">
                        <span
                          v-bind="tooltipProps"
                          class="cursor-pointer"
                        >
                          {{ formatDate(item.updatedAt) }}
                        </span>
                      </template>
                    </v-tooltip>
                  </template>
                </v-data-table>
              </div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- 任務詳情側邊欄 -->
    <TaskSidebar
      v-model="taskSidebarOpen"
      :task="selectedTask"
      :project="selectedTask?.project"
      @task-updated="handleTaskUpdated"
      @task-deleted="handleTaskDeleted"
    />
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { definePage } from 'vue-router/auto'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import { useUserStore } from '@/stores/user'
import UserAvatar from '@/components/UserAvatar.vue'
import TaskSidebar from '@/components/TaskSidebar.vue'

// 頁面定義
definePage({
  meta: {
    title: '首頁 | 專案與任務管理',
    login: true,
    permission: 'PROJECT_AND_TASK_MANAGEMENT_READ'
  }
})

// 引入常數
const router = useRouter()
const { apiAuth } = useApi()
const createSnackbar = useSnackbar()
const user = useUserStore()

// 響應式變數
const myTasks = ref([])
const loading = ref(true)
const taskSidebarOpen = ref(false)
const selectedTask = ref(null)
const activeTab = ref('assigned')

// 搜尋相關變數
const searchText = ref('')
const isSearching = ref(false)
const searchTimeout = ref(null)

// 表格標頭定義
const tableHeaders = [
  { title: '任務名稱', key: 'name', sortable: true },
  { title: '截止日期', key: 'dueDate', sortable: true },
  { title: '協作者', key: 'collaborators', sortable: false },
  { title: '專案', key: 'project', sortable: true },
  { title: '分類', key: 'category', sortable: true },
  { title: '上次修改', key: 'updatedAt', sortable: true }
]

// 已完成任務表格標頭
const completedTableHeaders = [
  { title: '任務名稱', key: 'name', sortable: true },
  { title: '截止日期', key: 'dueDate', sortable: true },
  { title: '協作者', key: 'collaborators', sortable: false },
  { title: '專案', key: 'project', sortable: true },
  { title: '分類', key: 'category', sortable: true },
  { title: '完成者', key: 'completedBy', sortable: true },
  { title: '完成於', key: 'completedAt', sortable: true },
  { title: '上次修改', key: 'updatedAt', sortable: true }
]

// 計算屬性：是否有搜尋文字
const hasSearchText = computed(() => {
  return searchText.value && searchText.value.trim().length > 0
})

// 計算屬性：我被指派的任務（未完成）
const assignedTasks = computed(() => {
  let tasks = myTasks.value.filter(task =>
    task.status !== 'completed' && task.assignee?._id === user._id
  )

  // 如果有搜尋文字，過濾任務
  if (hasSearchText.value) {
    tasks = tasks.filter(task =>
      task.name.toLowerCase().includes(searchText.value.toLowerCase())
    )
  }

  // 按截止日期排序：逾期 > 即將截止 > 無截止日期
  return tasks.sort((a, b) => {
    // 如果都沒有截止日期，按更新時間排序
    if (!a.dueDate && !b.dueDate) {
      return new Date(b.updatedAt) - new Date(a.updatedAt)
    }

    // 如果只有一個有截止日期，有截止日期的排前面
    if (!a.dueDate) return 1
    if (!b.dueDate) return -1

    // 按截止日期排序（越接近的排越前面）
    return new Date(a.dueDate) - new Date(b.dueDate)
  })
})

// 計算屬性：我是協作者的任務（未完成）
const collaboratingTasks = computed(() => {
  let tasks = myTasks.value.filter(task =>
    task.status !== 'completed' &&
    task.assignee?._id !== user._id &&
    task.collaborators?.some(collaborator => collaborator._id === user._id)
  )

  // 如果有搜尋文字，過濾任務
  if (hasSearchText.value) {
    tasks = tasks.filter(task =>
      task.name.toLowerCase().includes(searchText.value.toLowerCase())
    )
  }

  // 按截止日期排序：逾期 > 即將截止 > 無截止日期
  return tasks.sort((a, b) => {
    // 如果都沒有截止日期，按更新時間排序
    if (!a.dueDate && !b.dueDate) {
      return new Date(b.updatedAt) - new Date(a.updatedAt)
    }

    // 如果只有一個有截止日期，有截止日期的排前面
    if (!a.dueDate) return 1
    if (!b.dueDate) return -1

    // 按截止日期排序（越接近的排越前面）
    return new Date(a.dueDate) - new Date(b.dueDate)
  })
})

// 計算屬性：已完成的任務
const completedTasks = computed(() => {
  let tasks = myTasks.value.filter(task => task.status === 'completed')

  // 如果有搜尋文字，過濾任務
  if (hasSearchText.value) {
    tasks = tasks.filter(task =>
      task.name.toLowerCase().includes(searchText.value.toLowerCase())
    )
  }

  // 按完成時間排序（最新完成的排前面）
  return tasks.sort((a, b) => {
    const aCompletedAt = a.completedAt || a.updatedAt
    const bCompletedAt = b.completedAt || b.updatedAt
    return new Date(bCompletedAt) - new Date(aCompletedAt)
  })
})

// 計算屬性：被指派任務總數
const assignedTasksCount = computed(() => {
  return assignedTasks.value.length
})

// 計算屬性：協作任務總數
const collaboratingTasksCount = computed(() => {
  return collaboratingTasks.value.length
})

// 計算屬性：已完成任務總數
const completedTasksCount = computed(() => {
  return completedTasks.value.length
})

// 計算屬性：即將截止的任務（10天內）
const dueSoonTasks = computed(() => {
  let tasks = myTasks.value.filter(task => {
    if (task.status === 'completed' || !task.dueDate) return false

    const today = new Date()
    const dueDate = new Date(task.dueDate)
    const diffTime = dueDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    // 10天內且未逾期
    return diffDays >= 0 && diffDays <= 10
  })

  // 如果有搜尋文字，過濾任務
  if (hasSearchText.value) {
    tasks = tasks.filter(task =>
      task.name.toLowerCase().includes(searchText.value.toLowerCase())
    )
  }

  // 按截止日期排序（越接近的排越前面）
  return tasks.sort((a, b) => {
    return new Date(a.dueDate) - new Date(b.dueDate)
  })
})

// 計算屬性：已逾期的任務
const overdueTasks = computed(() => {
  let tasks = myTasks.value.filter(task => {
    if (task.status === 'completed' || !task.dueDate) return false

    const today = new Date()
    const dueDate = new Date(task.dueDate)
    const diffTime = dueDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    // 已逾期
    return diffDays < 0
  })

  // 如果有搜尋文字，過濾任務
  if (hasSearchText.value) {
    tasks = tasks.filter(task =>
      task.name.toLowerCase().includes(searchText.value.toLowerCase())
    )
  }

  // 按逾期天數排序（逾期越久的排越前面）
  return tasks.sort((a, b) => {
    return new Date(a.dueDate) - new Date(b.dueDate)
  })
})

// 計算屬性：即將截止任務總數
const dueSoonTasksCount = computed(() => {
  return dueSoonTasks.value.length
})

// 計算屬性：已逾期任務總數
const overdueTasksCount = computed(() => {
  return overdueTasks.value.length
})

// 取得我的任務（輕量，不含描述/評論/附件）
const fetchMyTasks = async () => {
  try {
    loading.value = true
    const { data } = await apiAuth.get('/tasks/my-tasks', { params: { lite: true } })
    if (data.success) {
      myTasks.value = data.data
    }
  } catch (error) {
    console.error('取得我的任務失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '取得我的任務失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-TW', {
    month: 'numeric',
    day: 'numeric'
  })
}

// 格式化完整日期時間
const getFullDateTime = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

// 取得截止日期顏色
const getDueDateColor = (dueDate) => {
  if (!dueDate) return 'text-medium-emphasis'

  const today = new Date()
  const due = new Date(dueDate)
  const diffTime = due - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  // 已逾期 - 紅色
  if (diffDays < 0) return 'text-red-darken-1'

  // 當天、1天、3天內 - 紫色
  if (diffDays <= 3) return 'text-purple-darken-1'

  // 5天、10天內 - 淺藍色
  if (diffDays <= 10) return 'text-light-blue-accent-4'

  // 超過10天 - 灰色
  return 'text-medium-emphasis'
}


// 獲取顯示用的協作者數據
const getDisplayCollaborators = (task) => {
  return task.collaborators || []
}

// 獲取所有協作者的文本（用於 tooltip）
const getAllCollaboratorsText = (task) => {
  const collaborators = getDisplayCollaborators(task)
  if (!collaborators || collaborators.length === 0) {
    return '無協作者'
  }
  return `${collaborators.map(c => c.name).join('、')}`
}

// 開啟任務側邊欄
const openTaskSidebar = (event, { item }) => {
  selectedTask.value = item
  taskSidebarOpen.value = true
}

// 跳轉到專案詳情頁面
const navigateToProject = (item) => {
  if (item.project?._id) {
    router.push(`/projectAndTaskManagement/projects/${item.project._id}`)
  }
}

// 搜尋處理函數
const handleSearch = () => {
  // 清除之前的 timeout
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  // 設置新的 timeout，延遲 300ms 執行搜尋
  searchTimeout.value = setTimeout(() => {
    // 搜尋邏輯已經在 computed 屬性中處理
    // 這裡可以添加額外的搜尋邏輯，比如 API 調用
  }, 300)
}

// 處理任務更新
const handleTaskUpdated = (updatedTask) => {
  // 更新任務列表中的任務資料
  const taskIndex = myTasks.value.findIndex(t => t._id === updatedTask._id)
  if (taskIndex !== -1) {
    // 保留原有的專案資料，避免 iconColor 丟失
    const originalTask = myTasks.value[taskIndex]
    const mergedTask = {
      ...updatedTask,
      project: {
        ...originalTask.project,
        ...updatedTask.project
      }
    }
    myTasks.value[taskIndex] = mergedTask
  }

  // 如果當前選中的任務被更新，也要更新選中的任務
  if (selectedTask.value && selectedTask.value._id === updatedTask._id) {
    // 同樣保留原有的專案資料
    const originalTask = selectedTask.value
    const mergedTask = {
      ...updatedTask,
      project: {
        ...originalTask.project,
        ...updatedTask.project
      }
    }
    selectedTask.value = mergedTask
  }
}

// 處理任務刪除
const handleTaskDeleted = (deletedTaskId) => {
  // 從任務列表中移除已刪除的任務
  myTasks.value = myTasks.value.filter(t => t._id !== deletedTaskId)

  // 如果當前選中的任務被刪除，關閉側邊欄
  if (selectedTask.value && selectedTask.value._id === deletedTaskId) {
    selectedTask.value = null
    taskSidebarOpen.value = false
  }
}

// 組件掛載時載入資料
onMounted(() => {
  fetchMyTasks()
})
</script>

<style lang="scss" scoped>
.page-title {
  color: #333;
}

.my-tasks-table :deep(.v-data-table__wrapper) {
  border-radius: 8px;
}

.my-tasks-table :deep(.v-data-table__td) {
  padding: 12px 16px;
  border-bottom: 1px solid rgb(var(--v-theme-outline-variant));
}

.my-tasks-table :deep(.v-data-table__th) {
  padding: 12px 16px;
  font-weight: 600;
}

.my-tasks-table :deep(.v-data-table__tr) {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.my-tasks-table :deep(tbody tr:nth-child(odd)) {
  background-color: #f9f9f9;
}

.my-tasks-table :deep(.v-data-table__tr:hover) {
  background-color: #eee;
}

.task-name {
  font-weight: 500;
}

.project-name {
  font-weight: 500;
  &:hover {
    color: #546E7A;
    text-decoration: underline;
  }
}



.collaborator-avatar {
  border: 1px solid white;
}

.cursor-pointer {
  cursor: pointer;
}

.task-tabs-container {
  border-bottom: 1px solid rgb(var(--v-theme-outline-variant));
}

.search-container {
  min-width: 280px;
  max-width: 400px;
}

.search-field {
  max-width: 280px;
}

/* 截止日期文字樣式 */
.due-date-text {
  font-size: 0.875rem;
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
  text-align: center;
}

/* 緊急任務（10天內）使用粗體 */
.due-date-text.text-red-darken-1,
.due-date-text.text-purple-darken-1,
.due-date-text.text-light-blue-accent-4 {
  font-weight: 600;
}

/* 不緊急任務（超過10天）使用正常字重 */
.due-date-text.text-medium-emphasis {
  font-weight: 400;
}

@media (max-width: 1280px) {
  .search-container {
    min-width: 200px;
    max-width: 250px;
  }

  .search-field {
    max-width: 200px;
  }
}

/* 響應式設計 */
@media (max-width: 768px) {
  .my-tasks-table :deep(.v-data-table__td),
  .my-tasks-table :deep(.v-data-table__th) {
    padding: 8px 12px;
  }

  .search-container {
    min-width: 200px;
    max-width: 250px;
  }

  .search-field {
    max-width: 200px;
  }
}

</style>

<route lang="yaml">
  meta:
    layout: ProjectAndTask
</route>
