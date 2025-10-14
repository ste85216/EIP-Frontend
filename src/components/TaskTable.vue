<template>
  <div class="task-table-container">
    <!-- 載入中 -->
    <div
      v-if="loading"
      class="d-flex justify-center py-8"
    >
      <v-progress-circular
        indeterminate
        color="primary"
        size="48"
      />
    </div>

    <!-- 任務分類列表 -->
    <div v-else>
      <!-- Tab 切換和搜尋區域 -->
      <div class="task-tabs-container mb-4">
        <div class="d-flex align-center justify-space-between">
          <v-tabs
            v-model="activeTab"
            color="teal-darken-1"
            align-tabs="start"
          >
            <v-tab value="in-progress">
              <v-icon class="me-2">
                mdi-clock-outline
              </v-icon>
              進行中
              <v-chip
                v-if="inProgressTasksCount > 0"
                size="x-small"
                :color="activeTab === 'in-progress' ? 'teal-darken-1' : 'grey'"
                variant="tonal"
                class="ms-2"
              >
                {{ inProgressTasksCount }}
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
          <div class="d-flex align-center">
            <v-btn
              color="blue-grey-darken-1"
              variant="outlined"
              class="me-4"
              prepend-icon="mdi-chart-box"
              @click="openStatisticsDialog"
            >
              統計
            </v-btn>
            <div class="search-container d-flex align-center">
              <!-- 統計按鈕 (僅在已完成 TAB 顯示) -->
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
      </div>

      <!-- 進行中的任務 -->
      <div v-if="activeTab === 'in-progress'">
        <!-- 空狀態提示 -->
        <div
          v-if="inProgressTaskCategories.length === 0"
          class="empty-state text-center py-12"
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

          <!-- 沒有任務分類 -->
          <div v-else>
            <v-icon
              size="56"
              color="grey-lighten-1"
              class="mb-2"
            >
              mdi-clipboard-list-outline
            </v-icon>
            <h3 class="text-h6 text-medium-emphasis mb-2">
              尚無任務分類
            </h3>
            <p class="text-body-2 text-medium-emphasis mb-4">
              <span v-if="canManageProject">點擊下方的按鈕來建立第一個任務分類</span>
              <span v-else>請聯繫團隊管理者建立任務分類</span>
            </p>
            <v-btn
              v-if="canManageProject"
              color="primary"
              variant="outlined"
              prepend-icon="mdi-plus"
              @click="openCreateCategoryDialog"
            >
              建立任務分類
            </v-btn>
          </div>
        </div>

        <!-- 任務分類展開面板 -->
        <div class="task-categories-container">
          <div
            v-for="(category, index) in inProgressTaskCategories"
            :key="category.name"
            class="task-category-panel"
          >
            <div
              class="category-header"
              @click="togglePanel(index)"
            >
              <div
                class="d-flex align-center justify-space-between w-100"
                style="height: 20px;"
              >
                <div class="d-flex align-center">
                  <span class="expand-panel-title">{{ category.name }}</span>
                  <v-chip
                    label
                    size="small"
                    class="ms-3"
                    color="light-blue-darken-3"
                    variant="tonal"
                  >
                    {{ category.tasks.length }}
                  </v-chip>
                  <div
                    v-if="canManageProject"
                    class="d-flex flex-column opacity-0 ms-2 category-sort-buttons"
                  >
                    <v-btn
                      icon
                      size="14"
                      variant="plain"
                      color="grey-darken-1"
                      :disabled="index === 0"
                      @click.stop="moveCategoryUp(index)"
                    >
                      <v-icon size="14">
                        mdi-chevron-up
                      </v-icon>
                    </v-btn>
                    <v-btn
                      icon
                      size="14"
                      variant="plain"
                      color="grey-darken-1"
                      :disabled="index === inProgressTaskCategories.length - 1"
                      @click.stop="moveCategoryDown(index)"
                    >
                      <v-icon size="14">
                        mdi-chevron-down
                      </v-icon>
                    </v-btn>
                  </div>
                  <v-btn
                    v-if="canManageProject"
                    icon
                    size="x-small"
                    variant="plain"
                    color="light-blue-darken-3"
                    class="ms-2 opacity-0 category-edit-btn"
                    @click.stop="openEditCategoryDialog(category)"
                  >
                    <v-icon size="16">
                      mdi-pencil
                    </v-icon>
                  </v-btn>
                  <!-- 可刪除狀態：直接顯示按鈕，無需 tooltip -->
                  <v-btn
                    v-if="canManageProject && canDeleteCategory(category.name)"
                    icon
                    size="x-small"
                    variant="plain"
                    color="red-lighten-1"
                    class="opacity-0 category-delete-btn"
                    @click.stop="openDeleteCategoryDialog(category)"
                  >
                    <v-icon size="16">
                      mdi-delete
                    </v-icon>
                  </v-btn>

                  <!-- 不可刪除狀態：顯示 tooltip 說明原因 -->
                  <v-tooltip
                    v-if="canManageProject && !canDeleteCategory(category.name)"
                    text="此分類下有已完成任務，無法刪除"
                    location="top"
                  >
                    <template #activator="{ props: tooltipProps }">
                      <div v-bind="tooltipProps">
                        <v-btn
                          icon
                          size="x-small"
                          variant="plain"
                          color="grey"
                          disabled
                          class="opacity-0 category-delete-btn"
                        >
                          <v-icon size="16">
                            mdi-delete
                          </v-icon>
                        </v-btn>
                      </div>
                    </template>
                  </v-tooltip>
                </div>

                <!-- 排序按鈕放在右側 -->

                <v-icon
                  :class="{ 'rotate-180': isPanelExpanded(index) }"
                  class="transition-transform"
                >
                  mdi-chevron-down
                </v-icon>
              </div>
            </div>

            <v-expand-transition>
              <div
                v-show="isPanelExpanded(index)"
                class="pa-0"
              >
                <!-- 任務表格 -->
                <div class="task-table-wrapper">
                  <v-data-table
                    :headers="tableHeaders"
                    :items="category.tasks"
                    :items-per-page="-1"
                    density="compact"
                    class="task-table"
                    hide-default-footer
                    @click:row="selectTask"
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
                        <v-text-field
                          v-if="isEditing(item, 'name')"
                          v-model="editingTask.name"
                          variant="outlined"
                          density="compact"
                          hide-details
                          class="task-name-input"
                          @blur="saveTaskName(item)"
                          @keyup.enter="saveTaskName(item)"
                          @click.stop
                        />
                        <div
                          v-else
                          class="d-flex align-center task-name-container"
                        >
                          <span
                            class="task-name"
                            :class="{ 'text-decoration-line-through': item.status === 'completed' }"
                          >
                            {{ item.name }}
                          </span>
                          <v-icon
                            size="14"
                            class="ms-1 task-name-edit-btn cursor-pointer"
                            @click.stop="startEditingTaskName(item)"
                          >
                            mdi-pencil
                          </v-icon>
                        </div>
                      </div>
                    </template>

                    <template #[`item.status`]="{ item }">
                      <v-chip
                        :color="getStatusColor(item.status)"
                        size="small"
                        variant="tonal"
                      >
                        {{ getStatusText(item.status) }}
                      </v-chip>
                    </template>

                    <template #[`item.assignee`]="{ item }">
                      <div class="d-flex align-center">
                        <v-select
                          v-if="isEditing(item, 'assignee')"
                          :model-value="editingTask.assignee?._id"
                          :items="project?.team?.members || []"
                          item-title="name"
                          item-value="_id"
                          variant="outlined"
                          density="compact"
                          hide-details
                          clearable
                          class="assignee-select"
                          @update:model-value="(value) => updateAssignee(item, value)"
                          @click.stop
                        >
                          <template #item="{ props: itemProps, item: member }">
                            <v-list-item v-bind="itemProps">
                              <template #prepend>
                                <UserAvatar
                                  :user="member.raw"
                                  size="24"
                                  avatar-class="me-2"
                                />
                              </template>
                            </v-list-item>
                          </template>
                          <template #selection="{ item: member }">
                            <UserAvatar
                              :user="member.raw"
                              size="24"
                              avatar-class="me-2"
                            />
                          </template>
                        </v-select>
                        <div
                          v-else
                          class="d-flex align-center assignee-container"
                        >
                          <v-tooltip
                            v-if="item.assignee"
                            :text="item.assignee.name"
                            location="top"
                          >
                            <template #activator="{ props: tooltipProps }">
                              <UserAvatar
                                v-bind="tooltipProps"
                                :user="item.assignee"
                                size="24"
                              />
                            </template>
                          </v-tooltip>
                          <v-avatar
                            v-else
                            size="24"
                            variant="outlined"
                            color="grey-lighten-1"
                          >
                            <v-icon
                              size="16"
                              color="grey"
                            >
                              mdi-account-outline
                            </v-icon>
                          </v-avatar>
                          <v-icon
                            size="14"
                            class="ms-1 assignee-edit-btn cursor-pointer"
                            @click.stop="startEditingAssignee(item)"
                          >
                            mdi-pencil
                          </v-icon>
                        </div>
                      </div>
                    </template>

                    <template #[`item.dueDate`]="{ item }">
                      <div class="d-flex align-center">
                        <v-date-input
                          v-if="isEditing(item, 'dueDate')"
                          :model-value="editingTask.dueDate ? new Date(editingTask.dueDate) : null"
                          variant="outlined"
                          density="compact"
                          hide-details
                          clearable
                          prepend-icon
                          ok-text="確認"
                          cancel-text="取消"
                          class="due-date-input"
                          @update:model-value="(value) => updateDueDate(item, value)"
                          @click:clear="() => updateDueDate(item, null)"
                          @click.stop
                        />
                        <div
                          v-else
                          class="d-flex align-center due-date-container"
                        >
                          <v-icon
                            v-if="item.dueDate"
                            size="16"
                            class="me-1"
                            :color="getDueDateColor(item.dueDate)"
                          >
                            mdi-calendar-clock-outline
                          </v-icon>
                          <span
                            :class="getDueDateColor(item.dueDate)"
                            class="due-date-text"
                          >
                            {{ formatDate(item.dueDate) }}
                          </span>
                          <v-icon
                            size="14"
                            class="ms-1 due-date-edit-btn cursor-pointer"
                            @click.stop="startEditingDueDate(item)"
                          >
                            mdi-pencil
                          </v-icon>
                        </div>
                      </div>
                    </template>

                    <template #[`item.collaborators`]="{ item }">
                      <div class="d-flex align-center">
                        <v-select
                          v-if="isEditing(item, 'collaborators')"
                          :model-value="editingTask.collaborators || []"
                          :items="project?.team?.members || []"
                          item-title="name"
                          item-value="_id"
                          variant="outlined"
                          density="compact"
                          hide-details
                          multiple
                          class="collaborators-select"
                          @update:model-value="(value) => updateCollaborators(item, value)"
                          @blur="saveCollaborators(item)"
                          @click.stop
                        >
                          <template #item="{ props: itemProps, item: member }">
                            <v-list-item v-bind="itemProps">
                              <template #prepend>
                                <UserAvatar
                                  :user="member.raw"
                                  size="24"
                                  avatar-class="me-2"
                                />
                              </template>
                            </v-list-item>
                          </template>
                          <template #selection="{ item: member }">
                            <UserAvatar
                              :user="member.raw"
                              size="24"
                              avatar-class="me-1"
                            />
                          </template>
                        </v-select>
                        <v-tooltip
                          v-else
                          :text="getAllCollaboratorsText(item)"
                          location="top"
                          :disabled="!getDisplayCollaborators(item)?.length"
                        >
                          <template #activator="{ props: tooltipProps }">
                            <div
                              v-bind="tooltipProps"
                              class="d-flex align-center collaborators-container"
                            >
                              <UserAvatar
                                v-for="(collaborator, idx) in getDisplayCollaborators(item)?.slice(0, 3)"
                                :key="collaborator._id"
                                :user="collaborator"
                                size="24"
                                avatar-class="collaborator-avatar"
                                :style="{ marginLeft: idx > 0 ? '-8px' : '0', zIndex: 10 - idx }"
                              />
                              <span
                                v-if="getDisplayCollaborators(item)?.length > 3"
                                class="text-caption ms-1"
                              >
                                +{{ getDisplayCollaborators(item).length - 3 }}
                              </span>
                              <v-icon
                                size="14"
                                class="ms-1 collaborators-edit-btn cursor-pointer"
                                @click.stop="startEditingCollaborators(item)"
                              >
                                mdi-pencil
                              </v-icon>
                            </div>
                          </template>
                        </v-tooltip>
                      </div>
                    </template>

                    <template #[`item.updatedAt`]="{ item }">
                      <v-tooltip
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
                        <div>
                          {{ getFullDateTime(item.updatedAt) }} , {{ item.lastModifiedBy?.name || '未知' }}
                        </div>
                      </v-tooltip>
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

                    <template #[`item.createdBy`]="{ item }">
                      <div class="d-flex align-center">
                        <v-tooltip
                          v-if="item.createdBy"
                          :text="item.createdBy.name"
                          location="top"
                        >
                          <template #activator="{ props: tooltipProps }">
                            <UserAvatar
                              v-bind="tooltipProps"
                              :user="item.createdBy"
                              size="24"
                              avatar-class="cursor-pointer"
                            />
                          </template>
                        </v-tooltip>
                        <v-avatar
                          v-else
                          size="24"
                          color="grey-lighten-1"
                        >
                          <v-icon size="16">
                            mdi-account-outline
                          </v-icon>
                        </v-avatar>
                      </div>
                    </template>


                    <template #[`item.actions`]="{ item }">
                      <div class="d-flex align-center">
                        <v-btn
                          icon
                          size="30"
                          variant="plain"
                          @click.stop="handleCompleteClick(item)"
                        >
                          <v-icon
                            :color="item.status === 'completed' ? 'green' : 'grey'"
                            size="20"
                          >
                            {{ item.status === 'completed' ? 'mdi-check-bold' : 'mdi-check-outline' }}
                          </v-icon>
                        </v-btn>
                        <v-menu>
                          <template #activator="{ props: menuProps }">
                            <v-btn
                              v-bind="menuProps"
                              icon
                              size="30"
                              variant="plain"
                              color="grey-darken-1"
                              @click.stop
                            >
                              <v-icon size="20">
                                mdi-dots-horizontal
                              </v-icon>
                            </v-btn>
                          </template>
                          <v-list
                            density="compact"
                            slim
                          >
                            <v-list-item
                              title="複製任務"
                              @click="duplicateTask(item)"
                            >
                              <template #prepend>
                                <v-icon size="18">
                                  mdi-content-copy
                                </v-icon>
                              </template>
                            </v-list-item>
                            <v-list-item
                              title="移動到其他分類"
                              @click="openMoveTaskDialog(item)"
                            >
                              <template #prepend>
                                <v-icon size="18">
                                  mdi-folder-move
                                </v-icon>
                              </template>
                            </v-list-item>
                            <v-list-item
                              v-if="canDeleteTask"
                              title="刪除任務"
                              base-color="red-darken-2"
                              @click="openDeleteTaskDialog(item)"
                            >
                              <template #prepend>
                                <v-icon size="18">
                                  mdi-delete
                                </v-icon>
                              </template>
                            </v-list-item>
                          </v-list>
                        </v-menu>
                      </div>
                    </template>

                    <template #bottom>
                      <tr class="add-task-row">
                        <td
                          colspan="8"
                          class="add-task-cell"
                        >
                          <v-btn
                            variant="text"
                            color="primary"
                            prepend-icon="mdi-plus"
                            class="ms-3 px-3"
                            @click="openCreateTaskDialog(category.name)"
                          >
                            新增任務...
                          </v-btn>
                        </td>
                      </tr>
                    </template>
                  </v-data-table>
                </div>
              </div>
            </v-expand-transition>
          </div>
        </div>

        <!-- 新增任務分類按鈕 - 放在最後一個分類下方 -->
        <div
          v-if="inProgressTaskCategories.length > 0"
          class="d-flex justify-start mt-2"
        >
          <v-btn
            v-if="canManageProject"
            variant="text"
            color="teal-darken-1"
            prepend-icon="mdi-plus"
            class="add-category-btn"
            @click="openCreateCategoryDialog"
          >
            新增任務分類
          </v-btn>
          <div
            v-else
            class="d-flex align-center text-caption text-grey-darken-1 mt-2"
          >
            <v-icon
              size="16"
              class="me-1"
              color="grey-darken-1"
            >
              mdi-information-outline
            </v-icon>
            需要團隊管理者權限才能新增任務分類
          </div>
        </div>
      </div>

      <!-- 已完成的任務 -->
      <div v-else-if="activeTab === 'completed'">
        <!-- 空狀態提示 -->
        <div
          v-if="completedTasks.length === 0"
          class="empty-state text-center py-12"
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

          <!-- 沒有已完成任務 -->
          <div v-else>
            <v-icon
              size="56"
              color="grey-lighten-1"
              class="mb-2"
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
            class="completed-tasks-table"
            @click:row="selectTask"
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

            <template #[`item.assignee`]="{ item }">
              <v-tooltip
                v-if="item.assignee"
                :text="item.assignee.name"
                location="top"
              >
                <template #activator="{ props: tooltipProps }">
                  <UserAvatar
                    v-bind="tooltipProps"
                    :user="item.assignee"
                    size="24"
                  />
                </template>
              </v-tooltip>
              <span
                v-else
                class="text-medium-emphasis"
              >-</span>
            </template>

            <template #[`item.dueDate`]="{ item }">
              <span
                v-if="item.dueDate"
              >
                {{ formatDate(item.dueDate) }}
              </span>
              <span
                v-else
                class="text-medium-emphasis"
              >-</span>
            </template>

            <template #[`item.collaborators`]="{ item }">
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
                      v-for="(collaborator, index) in getDisplayCollaborators(item)"
                      :key="collaborator._id"
                      :user="collaborator"
                      size="24"
                      avatar-class="collaborator-avatar"
                      :style="{
                        marginLeft: index > 0 ? '-8px' : '0',
                        zIndex: 10 - index
                      }"
                    />
                    <v-avatar
                      v-if="getDisplayCollaborators(item).length > 3"
                      size="24"
                      class="collaborator-avatar ms-n2"
                      color="grey-lighten-2"
                      style="z-index: 7"
                    >
                      <span class="text-caption">+{{ getDisplayCollaborators(item).length - 3 }}</span>
                    </v-avatar>
                    <span
                      v-if="!getDisplayCollaborators(item) || getDisplayCollaborators(item).length === 0"
                      class="text-medium-emphasis"
                    >
                      -
                    </span>
                  </div>
                </template>
              </v-tooltip>
            </template>

            <template #[`item.completedAt`]="{ item }">
              <v-tooltip
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
            </template>

            <template #[`item.completedBy`]="{ item }">
              <template v-if="getCompletedByUser(item)">
                <v-tooltip
                  :text="getCompletedByUser(item)?.name"
                  location="top"
                >
                  <template #activator="{ props: tooltipProps }">
                    <UserAvatar
                      v-bind="tooltipProps"
                      :user="getCompletedByUser(item)"
                      size="24"
                    />
                  </template>
                </v-tooltip>
              </template>
              <span
                v-else
                class="text-medium-emphasis"
              >-</span>
            </template>

            <template #[`item.createdBy`]="{ item }">
              <v-tooltip
                v-if="item.createdBy"
                :text="item.createdBy.name"
                location="top"
              >
                <template #activator="{ props: tooltipProps }">
                  <UserAvatar
                    v-bind="tooltipProps"
                    :user="item.createdBy"
                    size="24"
                  />
                </template>
              </v-tooltip>
              <span
                v-else
                class="text-medium-emphasis"
              >-</span>
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

            <template #[`item.actions`]="{ item }">
              <div class="d-flex justify-center">
                <v-btn
                  icon
                  size="30"
                  variant="plain"
                  color="teal-darken-1"
                  @click.stop="handleReopenClick(item)"
                >
                  <v-icon size="18">
                    mdi-undo
                  </v-icon>
                </v-btn>
                <v-menu>
                  <template #activator="{ props: menuProps }">
                    <v-btn
                      v-bind="menuProps"
                      icon
                      size="30"
                      variant="plain"
                      color="grey-darken-1"
                      @click.stop
                    >
                      <v-icon size="18">
                        mdi-dots-horizontal
                      </v-icon>
                    </v-btn>
                  </template>
                  <v-list
                    density="compact"
                    slim
                  >
                    <v-list-item
                      title="複製任務"
                      @click="duplicateTask(item)"
                    >
                      <template #prepend>
                        <v-icon size="18">
                          mdi-content-copy
                        </v-icon>
                      </template>
                    </v-list-item>
                    <v-list-item
                      title="移動到其他分類"
                      @click="openMoveTaskDialog(item)"
                    >
                      <template #prepend>
                        <v-icon size="18">
                          mdi-folder-move
                        </v-icon>
                      </template>
                    </v-list-item>
                    <v-list-item
                      v-if="canDeleteTask"
                      title="刪除任務"
                      base-color="red-darken-2"
                      @click="openDeleteTaskDialog(item)"
                    >
                      <template #prepend>
                        <v-icon size="18">
                          mdi-delete
                        </v-icon>
                      </template>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>
            </template>
          </v-data-table>
        </div>
      </div>
    </div>

    <!-- 新增任務分類對話框 -->
    <v-dialog
      v-model="createCategoryDialog"
      max-width="400px"
      persistent
    >
      <v-card class="rounded-lg">
        <div class="card-title px-6 py-2 mb-2 d-flex justify-space-between align-center bg-blue-grey-darken-2">
          <div>
            <v-icon
              size="20"
              class="me-2"
            >
              mdi-folder-plus
            </v-icon>新增任務分類
          </div>
          <v-btn
            icon
            variant="plain"
            size="36"
            class="opacity-100"
            :ripple="false"
            @click="createCategoryDialog = false"
          >
            <v-icon size="20">
              mdi-close
            </v-icon>
          </v-btn>
        </div>
        <v-card-text class="px-6 py-3">
          <div class="text-grey-darken-2 mb-4">
            請輸入新的任務分類名稱。
          </div>
          <v-text-field
            v-model="newCategoryName"
            label="分類名稱"
            variant="outlined"
            density="compact"
            hide-details
            :rules="[v => !!v || '請輸入分類名稱']"
            @keyup.enter="createCategory"
          />
        </v-card-text>
        <v-card-actions class="px-6 py-4 mb-2">
          <v-spacer />
          <v-btn
            color="grey"
            variant="outlined"
            class="me-1"
            :loading="isSubmittingCategory"
            @click="createCategoryDialog = false"
          >
            取消
          </v-btn>
          <v-btn
            color="teal-darken-1"
            variant="outlined"
            :disabled="!newCategoryName.trim() || isSubmittingCategory"
            :loading="isSubmittingCategory"
            @click="createCategory"
          >
            建立
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 編輯任務分類對話框 -->
    <v-dialog
      v-model="editCategoryDialog"
      max-width="320px"
      persistent
    >
      <v-card class="rounded-lg">
        <div class="card-title px-6 py-2 mb-2 d-flex justify-space-between align-center bg-blue-grey-darken-2">
          <div>
            <v-icon
              size="20"
              class="me-2"
            >
              mdi-pencil
            </v-icon>編輯任務分類
          </div>
          <v-btn
            icon
            variant="plain"
            size="36"
            class="opacity-100"
            :ripple="false"
            @click="editCategoryDialog = false"
          >
            <v-icon size="20">
              mdi-close
            </v-icon>
          </v-btn>
        </div>
        <v-card-text class="px-6 pt-4 pb-3">
          <v-text-field
            v-model="editingCategoryName"
            label="分類名稱"
            variant="outlined"
            density="compact"
            hide-details
            :rules="[v => !!v || '請輸入分類名稱']"
            @keyup.enter="updateCategory"
          />
        </v-card-text>
        <v-card-actions class="px-6 py-4 mb-2">
          <v-spacer />
          <v-btn
            color="grey"
            variant="outlined"
            class="me-1"
            :loading="isUpdatingCategory"
            @click="editCategoryDialog = false"
          >
            取消
          </v-btn>
          <v-btn
            color="teal-darken-1"
            variant="outlined"
            :disabled="!editingCategoryName.trim() || isUpdatingCategory"
            :loading="isUpdatingCategory"
            @click="updateCategory"
          >
            更新
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 刪除任務分類對話框 -->
    <ConfirmDeleteDialogWithTextField
      v-model="deleteCategoryDialog"
      title="確認刪除任務分類"
      :message="`您確定要刪除任務分類「<span class='font-weight-bold text-red-darken-2'>${deletingCategory?.name}</span>」嗎？此操作將同時刪除該分類下的所有任務（共 ${deletingCategory?.tasks?.length || 0} 個），且無法復原。`"
      :expected-name="deletingCategory?.name"
      input-label="任務分類名稱"
      confirm-button-text="刪除"
      @confirm="deleteCategory"
    />

    <!-- 刪除任務對話框 -->
    <ConfirmDeleteDialog
      v-model="deleteTaskDialog"
      title="確認刪除任務"
      :dialog-width="'320'"
      :message="`您確定要刪除任務「<span class='font-weight-bold text-red-darken-2'>${deletingTask?.name}</span>」嗎？此操作無法復原。`"
      confirm-button-text="刪除"
      @confirm="deleteTask"
    />

    <!-- 完成任務確認對話框 -->
    <ConfirmDialog
      v-model="confirmCompleteDialog"
      :dialog-width="'320'"
      title="確認完成任務"
      :message="`您確定要將任務「<span class='font-weight-bold text-teal-darken-2'>${completingTask?.name || ''}</span>」標記為完成嗎？`"
      confirm-button-text="確認"
      cancel-button-text="取消"
      :confirm-button-color="'teal-darken-1'"
      :header-color="'bg-teal-darken-1'"
      :header-icon="'mdi-check-circle'"
      @confirm="confirmCompleteTask"
    />

    <!-- 重新開啟任務確認對話框 -->
    <ConfirmDialog
      v-model="confirmReopenDialog"
      :dialog-width="'320'"
      title="確認重新開啟任務"
      :message="`您確定要將任務「<span class='font-weight-bold text-teal-darken-2'>${reopeningTask?.name || ''}</span>」重新開啟嗎？`"
      confirm-button-text="確認"
      cancel-button-text="取消"
      :confirm-button-color="'teal-darken-1'"
      :header-color="'bg-teal-darken-1'"
      :header-icon="'mdi-undo'"
      @confirm="confirmReopenTask"
    />

    <!-- 新增任務對話框 -->
    <v-dialog
      v-model="createTaskDialog"
      max-width="500px"
      persistent
    >
      <v-card class="rounded-lg">
        <div class="card-title px-6 py-2 mb-2 d-flex justify-space-between align-center bg-blue-grey-darken-2">
          <div>
            <v-icon
              size="20"
              class="me-2"
            >
              mdi-plus-circle
            </v-icon>新增任務
          </div>
          <v-btn
            icon
            variant="plain"
            size="36"
            class="opacity-100"
            :ripple="false"
            @click="createTaskDialog = false"
          >
            <v-icon size="20">
              mdi-close
            </v-icon>
          </v-btn>
        </div>
        <v-card-text class="px-6 py-3">
          <v-form
            ref="taskForm"
            @submit.prevent="createTask"
          >
            <v-text-field
              v-model="newTask.name"
              label="*任務名稱"
              variant="outlined"
              density="compact"
              :rules="[v => !!v || '請輸入任務名稱']"
              class="mb-4 mt-2"
            />
            <v-select
              v-model="newTask.assignee"
              label="指派對象"
              variant="outlined"
              density="compact"
              :items="project?.team?.members || []"
              item-title="name"
              item-value="_id"
              clearable
              class="mb-4"
            />
            <v-select
              v-model="newTask.collaborators"
              label="協作者"
              variant="outlined"
              density="compact"
              :items="collaboratorOptionsForCreate"
              item-title="name"
              item-value="_id"
              multiple
              chips
              clearable
              class="mb-4"
            />
            <v-date-input
              v-model="newTask.dueDate"
              label="截止日期"
              variant="outlined"
              density="compact"
              clearable
              prepend-icon
              ok-text="確認"
              cancel-text="取消"
              hide-details
              class="mb-4"
            />
          </v-form>
        </v-card-text>
        <v-card-actions class="px-6 pb-4 mb-2">
          <v-spacer />
          <v-btn
            color="grey"
            variant="outlined"
            class="me-1"
            :loading="isSubmittingTask"
            @click="createTaskDialog = false"
          >
            取消
          </v-btn>
          <v-btn
            color="teal-darken-1"
            variant="outlined"
            :disabled="!newTask.name.trim() || isSubmittingTask"
            :loading="isSubmittingTask"
            @click="createTask"
          >
            建立
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>


    <!-- 移動任務對話框 -->
    <v-dialog
      v-model="moveTaskDialog"
      max-width="360px"
      persistent
    >
      <v-card class="rounded-lg">
        <div class="card-title px-6 py-2 mb-2 d-flex justify-space-between align-center bg-blue-grey-darken-2">
          <div>
            <v-icon
              size="20"
              class="me-2"
            >
              mdi-folder-move
            </v-icon>移動任務
          </div>
          <v-btn
            icon
            variant="plain"
            size="36"
            class="opacity-100"
            :ripple="false"
            @click="moveTaskDialog = false"
          >
            <v-icon size="20">
              mdi-close
            </v-icon>
          </v-btn>
        </div>
        <v-card-text class="px-6 py-3">
          <div class="text-grey-darken-2 mb-4">
            將任務「{{ movingTask?.name }}」移動到新的分類
          </div>
          <v-select
            v-model="selectedNewCategory"
            label="選擇新分類"
            :items="getAvailableCategories"
            item-title="name"
            item-value="name"
            variant="outlined"
            density="compact"
            :rules="[v => !!v || '請選擇分類']"
          >
            <template #item="{ props: itemProps, item }">
              <v-list-item v-bind="itemProps">
                <template #prepend>
                  <v-icon
                    size="16"
                    :color="item.raw.color || 'primary'"
                  >
                    mdi-folder
                  </v-icon>
                </template>
              </v-list-item>
            </template>
          </v-select>
        </v-card-text>
        <v-card-actions class="px-6 pb-4 pt-0 mb-2">
          <v-spacer />
          <v-btn
            color="grey"
            variant="outlined"
            class="me-1"
            @click="moveTaskDialog = false"
          >
            取消
          </v-btn>
          <v-btn
            color="teal-darken-1"
            variant="outlined"
            :disabled="!selectedNewCategory"
            @click="moveTask"
          >
            移動
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 任務統計對話框 -->
    <TaskStatisticsDialog
      v-model="statisticsDialog"
      :project="project"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import { useUserStore } from '@/stores/user'
import { useTeamStore } from '@/stores/team'
import { usePermissionStore } from '@/stores/permission'
import UserAvatar from '@/components/UserAvatar.vue'
import TaskStatisticsDialog from '@/components/TaskStatisticsDialog.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const props = defineProps({
  project: {
    type: Object,
    required: true
  },
  taskCategories: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['task-selected', 'task-updated', 'task-deleted', 'category-updated', 'task-created', 'category-created', 'project-updated'])

const { apiAuth } = useApi()
const createSnackbar = useSnackbar()
const userStore = useUserStore()
const teamStore = useTeamStore()
const permissionStore = usePermissionStore()

// 權限檢查
const canManageProject = computed(() => {
  if (!props.project || !userStore._id) return false
  // 擁有 PROJECT_AND_TASK_MANAGE 權限的用戶可以管理任何專案
  if (permissionStore.hasPermission('PROJECT_AND_TASK_MANAGE')) return true
  // 檢查是否為專案所屬團隊的管理者
  return teamStore.isProjectTeamManager(props.project, userStore._id)
})

// 檢查是否為團隊成員（可以刪除任務）
const canDeleteTask = computed(() => {
  if (!props.project || !userStore._id) return false
  // 擁有 PROJECT_AND_TASK_MANAGE 權限的用戶可以刪除任何任務
  if (permissionStore.hasPermission('PROJECT_AND_TASK_MANAGE')) return true
  // 檢查是否為專案所屬團隊的成員
  return props.project.team?.members?.some(member => member._id === userStore._id) || false
})

// 響應式變數
const activeTab = ref('in-progress')
const expandedPanels = ref([])
const createCategoryDialog = ref(false)
const createTaskDialog = ref(false)
const newCategoryName = ref('')
const newTask = ref({
  name: '',
  assignee: null,
  collaborators: [],
  dueDate: null,
  category: ''
})
const isSubmittingCategory = ref(false)
const isSubmittingTask = ref(false)
const editingTask = ref(null)
const editCategoryDialog = ref(false)
const editingCategoryName = ref('')
const editingCategory = ref(null)
const isUpdatingCategory = ref(false)

// 搜尋相關變數
const searchText = ref('')
const isSearching = ref(false)
const searchTimeout = ref(null)
const isUpdatingTask = ref(false)
const deleteCategoryDialog = ref(false)
const deletingCategory = ref(null)
const deleteTaskDialog = ref(false)
const deletingTask = ref(null)


// 任務移動對話框
const moveTaskDialog = ref(false)
const movingTask = ref(null)
const selectedNewCategory = ref('')
// 完成任務確認對話框
const confirmCompleteDialog = ref(false)
const completingTask = ref(null)

// 重新開啟任務確認對話框
const confirmReopenDialog = ref(false)
const reopeningTask = ref(null)

// 統計對話框
const statisticsDialog = ref(false)

// 切換面板展開狀態
const togglePanel = (index) => {
  const panelIndex = expandedPanels.value.indexOf(index)
  if (panelIndex > -1) {
    expandedPanels.value.splice(panelIndex, 1)
  } else {
    expandedPanels.value.push(index)
  }
}

// 檢查面板是否展開
const isPanelExpanded = (index) => {
  return expandedPanels.value.includes(index)
}

// 計算屬性：過濾出進行中的任務分類
const inProgressTaskCategories = computed(() => {
  let categories = props.taskCategories.map(category => {
    // 過濾出進行中的任務並排序
    const inProgressTasks = category.tasks
      .filter(task => task.status !== 'completed')
      .sort((a, b) => {
        // 先按 order 排序，再按 createdAt 排序
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order
        }
        if (a.order !== undefined && b.order === undefined) {
          return -1
        }
        if (a.order === undefined && b.order !== undefined) {
          return 1
        }
        return new Date(b.createdAt) - new Date(a.createdAt)
      })

    return {
      ...category,
      tasks: inProgressTasks
    }
  })

  // 按照 order 欄位排序
  categories.sort((a, b) => (a.order || 0) - (b.order || 0))

  // 如果有搜尋文字，進一步過濾
  if (searchText.value && searchText.value.trim()) {
    categories = categories.map(category => ({
      ...category,
      tasks: category.tasks.filter(task =>
        task.name.toLowerCase().includes(searchText.value.toLowerCase())
      )
    })).filter(category => category.tasks.length > 0) // 只保留有符合任務的分類
  }

  return categories
})

// 計算屬性：是否有搜尋文字
const hasSearchText = computed(() => {
  return searchText.value && searchText.value.trim().length > 0
})

// 計算屬性：所有已完成的任務
const completedTasks = computed(() => {
  const allTasks = []
  props.taskCategories.forEach(category => {
    category.tasks.forEach(task => {
      if (task.status === 'completed') {
        allTasks.push(task)
      }
    })
  })

  // 如果有搜尋文字，過濾任務
  let filteredTasks = allTasks
  if (searchText.value && searchText.value.trim()) {
    filteredTasks = allTasks.filter(task =>
      task.name.toLowerCase().includes(searchText.value.toLowerCase())
    )
  }

  // 按完成日期排序（最新的在前）
  return filteredTasks.sort((a, b) => {
    // 先按完成日期排序
    const dateComparison = new Date(b.completedAt) - new Date(a.completedAt)
    if (dateComparison !== 0) {
      return dateComparison
    }
    // 如果完成日期相同，按 order 排序
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order
    }
    return 0
  })
})

// 計算屬性：進行中任務總數
const inProgressTasksCount = computed(() => {
  return inProgressTaskCategories.value.reduce((total, category) => total + category.tasks.length, 0)
})

// 計算屬性：已完成任務總數
const completedTasksCount = computed(() => {
  return completedTasks.value.length
})

// 檢查分類是否可以刪除（只有當分類下沒有已完成任務時才能刪除）
const canDeleteCategory = (categoryName) => {
  // 檢查已完成任務中是否有該分類的任務
  const hasCompletedTasks = completedTasks.value.some(task => task.category === categoryName)
  return !hasCompletedTasks
}

// 表格標頭定義（進行中任務）
const tableHeaders = [
  { title: '名稱', key: 'name', sortable: true },
  { title: '狀態', key: 'status', sortable: true },
  { title: '指派對象', key: 'assignee', sortable: true },
  { title: '截止日期', key: 'dueDate', sortable: true },
  { title: '協作者', key: 'collaborators', sortable: false },
  { title: '上次修改時間', key: 'updatedAt', sortable: true },
  { title: '建立者', key: 'createdBy', sortable: true },
  { title: '操作', key: 'actions', align: 'center', sortable: false, width: '80px' }
]

// 已完成任務表格標頭
const completedTableHeaders = [
  { title: '名稱', key: 'name', sortable: true },
  { title: '分類', key: 'category', sortable: true },
  { title: '指派對象', key: 'assignee', sortable: true },
  { title: '截止日期', key: 'dueDate', sortable: true },
  { title: '協作者', key: 'collaborators', sortable: false },
  { title: '完成者', key: 'completedBy', sortable: true },
  { title: '完成於', key: 'completedAt', sortable: true },
  { title: '建立者', key: 'createdBy', sortable: true },
  { title: '操作', key: 'actions', align: 'center', sortable: false, width: '80px' }
]

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

// 將可能為 ObjectId 或完整物件的使用者欄位正規化為完整物件，供顯示使用
const resolveUser = (user) => {
  if (!user) return null
  if (typeof user === 'object' && user._id) return user
  // 嘗試從團隊成員中找到對應的使用者
  const id = typeof user === 'string' ? user : user?._id
  const fromMembers = props.project?.team?.members?.find(m => m._id === id)
  if (fromMembers) return fromMembers
  const fromManagers = props.project?.team?.managers?.find(m => m._id === id)
  if (fromManagers) return fromManagers
  return null
}

// 供模板使用，並在未解析到使用者時輸出調試資訊
const getCompletedByUser = (task) => {
  const raw = task?.completedBy
  const resolved = resolveUser(raw)
  if (!resolved) {
    console.log('[TaskTable] 無法解析完成者', {
      taskId: task?._id,
      completedByRaw: raw,
      teamMembers: (props.project?.team?.members || []).map(u => u._id),
      teamManagers: (props.project?.team?.managers || []).map(u => u._id)
    })
  }
  return resolved
}

// 取得狀態顏色
const getStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return 'orange'
    case 'in_progress':
      return 'blue'
    case 'completed':
      return 'green'
    default:
      return 'grey'
  }
}

// 取得狀態文字
const getStatusText = (status) => {
  switch (status) {
    case 'pending':
      return '待處理'
    case 'in_progress':
      return '進行中'
    case 'completed':
      return '已完成'
    default:
      return '未知'
  }
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

// 選擇任務
const selectTask = (event, { item }) => {
  console.log('TaskTable 選擇的任務資料:', item)
  emit('task-selected', item)
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

// 點擊完成按鈕
const handleCompleteClick = (task) => {
  if (task.status !== 'completed') {
    completingTask.value = task
    confirmCompleteDialog.value = true
  } else {
    // 改為未完成
    toggleTaskCompletion(task, false)
  }
}

// 切換任務完成狀態（可指定完成或未完成）
const toggleTaskCompletion = async (task, toCompleted = true) => {
  try {
    const payload = toCompleted
      ? { status: 'completed', completedBy: userStore._id }
      : { status: 'pending', completedBy: null, completedAt: null }

    const { data } = await apiAuth.put(`/tasks/${task._id}`, payload)

    if (data.success) {
      // 後端若只回傳 completedBy 為 ObjectId，前端先補上完整 user 以利顯示
      const returned = data.data || {}
      if (returned.completedBy && typeof returned.completedBy === 'string') {
        const self = (props.project?.team?.members || []).find(m => m._id === returned.completedBy)
          || (props.project?.team?.managers || []).find(m => m._id === returned.completedBy)
          || { _id: userStore._id, name: userStore.name, email: userStore.email, avatar: userStore.avatar }
        returned.completedBy = self
      }
      emit('task-updated', returned)
      createSnackbar({
        text: toCompleted ? '任務已完成' : '任務已標記為未完成',
        snackbarProps: { color: 'teal-lighten-1' }
      })
    }
  } catch (error) {
    console.error('更新任務狀態失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '更新任務狀態失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 確認完成任務
const confirmCompleteTask = async () => {
  if (!completingTask.value) return
  const task = completingTask.value
  confirmCompleteDialog.value = false
  await toggleTaskCompletion(task, true)
  completingTask.value = null
}

// 開啟新增任務分類對話框
const openCreateCategoryDialog = () => {
  newCategoryName.value = ''
  createCategoryDialog.value = true
}

// 開啟統計對話框
const openStatisticsDialog = () => {
  statisticsDialog.value = true
}

// 開啟編輯任務分類對話框
const openEditCategoryDialog = (category) => {
  editingCategory.value = category
  editingCategoryName.value = category.name
  editCategoryDialog.value = true
}

// 開啟刪除任務分類對話框
const openDeleteCategoryDialog = (category) => {
  deletingCategory.value = category
  deleteCategoryDialog.value = true
}

// 開啟刪除任務對話框
const openDeleteTaskDialog = (task) => {
  if (!task || !task._id) {
    console.error('任務資料不完整:', task)
    createSnackbar({
      text: '任務資料不完整，無法刪除',
      snackbarProps: { color: 'red-lighten-1' }
    })
    return
  }
  deletingTask.value = task
  deleteTaskDialog.value = true
}

// 建立任務分類
const createCategory = async () => {
  if (!newCategoryName.value.trim()) return

  const trimmedName = newCategoryName.value.trim()

  try {
    isSubmittingCategory.value = true

    // 使用最新的專案資料來建立分類
    const currentCategories = props.project.taskCategories || []
    console.log('🔍 新增分類時的專案資料:', {
      projectId: props.project._id,
      categoriesCount: currentCategories.length,
      categories: currentCategories.map(cat => ({ name: cat.name, order: cat.order }))
    })

    // 檢查分類名稱是否重複
    const isDuplicate = currentCategories.some(cat => cat.name === trimmedName)
    if (isDuplicate) {
      createSnackbar({
        text: `分類名稱「${trimmedName}」已存在，請使用不同的名稱`,
        snackbarProps: { color: 'red-lighten-1' }
      })
      return
    }

    // 計算新分類的 order（使用最大 order + 1）
    const maxOrder = currentCategories.length > 0
      ? Math.max(...currentCategories.map(cat => cat.order || 0))
      : -1

    const newCategory = {
      name: trimmedName,
      order: maxOrder + 1
    }

    const { data } = await apiAuth.put(`/projects/${props.project._id}`, {
      taskCategories: [...currentCategories, newCategory]
    })

    if (data.success) {
      createCategoryDialog.value = false
      newCategoryName.value = ''
      // 發送新分類資料給父組件，讓父組件直接更新本地狀態
      emit('category-created', {
        category: newCategory,
        project: data.data
      })
      createSnackbar({
        text: '任務分類建立成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
    }
  } catch (error) {
    console.error('建立任務分類失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '建立任務分類失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    isSubmittingCategory.value = false
  }
}

// 更新任務分類
const updateCategory = async () => {
  if (!editingCategoryName.value.trim() || !editingCategory.value) return

  try {
    isUpdatingCategory.value = true

    // 使用最新的專案資料來更新分類
    const currentCategories = props.project.taskCategories || []
    const updatedCategories = currentCategories.map(category => {
      if (category.name === editingCategory.value.name) {
        return {
          ...category,
          name: editingCategoryName.value.trim()
        }
      }
      return category
    })

    const { data } = await apiAuth.put(`/projects/${props.project._id}`, {
      taskCategories: updatedCategories
    })

    if (data.success) {
      editCategoryDialog.value = false
      editingCategoryName.value = ''
      editingCategory.value = null

      // 傳遞後端返回的完整資料給父組件，讓父組件直接更新本地狀態
      emit('category-updated', {
        project: data.data,
        categoryNameChanges: data.categoryNameChanges || []
      })

      // 顯示後端返回的詳細訊息，包括是否有同步更新任務
      createSnackbar({
        text: data.message || '任務分類更新成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })

      // 如果有分類名稱變更，記錄日誌供調試
      if (data.categoryNameChanges && data.categoryNameChanges.length > 0) {
        console.log('✅ 分類名稱變更詳情：', data.categoryNameChanges)
      }
    }
  } catch (error) {
    console.error('更新任務分類失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '更新任務分類失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    isUpdatingCategory.value = false
  }
}

// 刪除任務分類
const deleteCategory = async () => {
  if (!deletingCategory.value || !deletingCategory.value.name) {
    console.error('刪除任務分類失敗: 分類資料不完整')
    createSnackbar({
      text: '刪除任務分類失敗: 分類資料不完整',
      snackbarProps: { color: 'red-lighten-1' }
    })
    return
  }

  try {
    // 使用新的專門 API 來刪除分類
    const encodedCategoryName = encodeURIComponent(deletingCategory.value.name)
    const { data } = await apiAuth.delete(`/projects/${props.project._id}/categories/${encodedCategoryName}`)

    if (data.success) {
      deleteCategoryDialog.value = false
      deletingCategory.value = null

      // 傳遞後端返回的完整資料給父組件，讓父組件直接更新本地狀態
      emit('category-updated', {
        project: data.data,
        categoryNameChanges: [] // 刪除操作沒有名稱變更
      })

      createSnackbar({
        text: data.message || '任務分類刪除成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
    }
  } catch (error) {
    console.error('刪除任務分類失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '刪除任務分類失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 刪除任務
const deleteTask = async () => {
  if (!deletingTask.value || !deletingTask.value._id) {
    console.error('刪除任務失敗: 任務資料不完整')
    createSnackbar({
      text: '刪除任務失敗: 任務資料不完整',
      snackbarProps: { color: 'red-lighten-1' }
    })
    return
  }

  try {
    const { data } = await apiAuth.delete(`/tasks/${deletingTask.value._id}`)
    if (data.success) {
      const deletedTaskId = deletingTask.value._id
      deleteTaskDialog.value = false
      deletingTask.value = null
      emit('task-deleted', deletedTaskId)
      createSnackbar({
        text: '任務刪除成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
    }
  } catch (error) {
    console.error('刪除任務失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '刪除任務失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 重新開啟任務（從已完成狀態改為進行中）
const reopenTask = async (task) => {
  try {
    // 根據是否有指派對象來決定狀態
    // 如果有指派對象，狀態應該是 'in_progress'，否則為 'pending'
    const newStatus = task.assignee ? 'in_progress' : 'pending'

    const { data } = await apiAuth.put(`/tasks/${task._id}`, {
      status: newStatus,
      completedAt: null
    })

    if (data.success) {
      // 更新任務狀態
      const updatedTask = data.data

      // 更新任務分類中的任務
      props.taskCategories.forEach(category => {
        const taskIndex = category.tasks.findIndex(t => t._id === task._id)
        if (taskIndex !== -1) {
          category.tasks[taskIndex] = updatedTask
        }
      })

      emit('task-updated', updatedTask)

      createSnackbar({
        text: '任務已重新開啟',
        snackbarProps: { color: 'teal-lighten-1' }
      })
    }
  } catch (error) {
    console.error('重新開啟任務失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '重新開啟任務失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 點擊重新開啟按鈕（觸發確認）
const handleReopenClick = (task) => {
  reopeningTask.value = task
  confirmReopenDialog.value = true
}

// 確認重新開啟任務
const confirmReopenTask = async () => {
  if (!reopeningTask.value) return
  const task = reopeningTask.value
  confirmReopenDialog.value = false
  await reopenTask(task)
  reopeningTask.value = null
}

// 開啟新增任務對話框
const openCreateTaskDialog = (categoryName) => {
  newTask.value = {
    name: '',
    assignee: null,
    collaborators: [],
    dueDate: null,
    category: categoryName
  }
  createTaskDialog.value = true
}

// 建立任務
const createTask = async () => {
  if (!newTask.value.name.trim()) return

  try {
    isSubmittingTask.value = true

    const submitData = {
      name: newTask.value.name.trim(),
      assignee: newTask.value.assignee,
      collaborators: newTask.value.collaborators || [],
      dueDate: newTask.value.dueDate ? (newTask.value.dueDate instanceof Date ? newTask.value.dueDate.toISOString() : newTask.value.dueDate) : null,
      category: newTask.value.category,
      project: props.project._id
    }

    const { data } = await apiAuth.post('/tasks', submitData)

    if (data.success) {
      createTaskDialog.value = false
      // 發送新任務資料給父組件，讓父組件直接更新本地狀態
      emit('task-created', {
        task: data.data,
        category: newTask.value.category
      })
      createSnackbar({
        text: '任務建立成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
    }
  } catch (error) {
    console.error('建立任務失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '建立任務失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    isSubmittingTask.value = false
  }
}


// 開始編輯任務名稱
const startEditingTaskName = (task) => {
  editingTask.value = {
    ...task,
    editingField: 'name'
  }
}

// 開始編輯指派對象
const startEditingAssignee = (task) => {
  editingTask.value = {
    ...task,
    editingField: 'assignee',
    // 確保協作者是 ID 陣列格式
    collaborators: task.collaborators?.map(c => {
      return typeof c === 'object' ? c._id : c
    }).filter(Boolean) || []
  }
}

// 開始編輯截止日期
const startEditingDueDate = (task) => {
  editingTask.value = {
    ...task,
    editingField: 'dueDate',
    // 確保協作者是 ID 陣列格式
    collaborators: task.collaborators?.map(c => {
      return typeof c === 'object' ? c._id : c
    }).filter(Boolean) || []
  }
}

// 開始編輯協作者
const startEditingCollaborators = (task) => {
  editingTask.value = {
    ...task,
    editingField: 'collaborators',
    // 確保協作者是 ID 陣列格式
    collaborators: task.collaborators?.map(c => {
      return typeof c === 'object' ? c._id : c
    }).filter(Boolean) || []
  }
}

// 取消編輯任務
const cancelEditingTask = () => {
  editingTask.value = null
}


// 更新任務
const updateTask = async (taskId, updates) => {
  try {
    isUpdatingTask.value = true

    const { data } = await apiAuth.put(`/tasks/${taskId}`, updates)

    if (data.success) {
      emit('task-updated', data.data)
      editingTask.value = null
      createSnackbar({
        text: '任務更新成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
    }
  } catch (error) {
    console.error('更新任務失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '更新任務失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  } finally {
    isUpdatingTask.value = false
  }
}

// 現在使用 UserAvatar 組件，不再需要直接使用這些函數

// 更新指派對象
const updateAssignee = async (task, newAssigneeId) => {
  // 比較原始指派對象和新指派對象
  const originalAssigneeId = task.assignee?._id || task.assignee
  const hasChanged = originalAssigneeId !== newAssigneeId

  console.log('指派對象變更檢查:', {
    original: originalAssigneeId,
    new: newAssigneeId,
    hasChanged
  })

  // 只有當指派對象真的有變更時才發送更新請求
  if (hasChanged) {
    // 根據是否有指派對象來決定狀態
    const newStatus = newAssigneeId ? 'in_progress' : 'pending'
    await updateTask(task._id, { assignee: newAssigneeId, status: newStatus })
  } else {
    console.log('指派對象沒有變更，跳過更新')
  }
}

// 更新截止日期
const updateDueDate = async (task, newDueDate) => {
  const dueDate = newDueDate ? (newDueDate instanceof Date ? newDueDate.toISOString() : newDueDate) : null

  // 比較原始截止日期和新截止日期
  const originalDueDate = task.dueDate ? (task.dueDate instanceof Date ? task.dueDate.toISOString() : task.dueDate) : null
  const hasChanged = originalDueDate !== dueDate

  console.log('截止日期變更檢查:', {
    original: originalDueDate,
    new: dueDate,
    hasChanged
  })

  // 只有當截止日期真的有變更時才發送更新請求
  if (hasChanged) {
    await updateTask(task._id, { dueDate })
  } else {
    console.log('截止日期沒有變更，跳過更新')
  }

  // 已由日期元件的事件直接呼叫 updateDueDate
}

// 更新協作者
const updateCollaborators = async (task, newCollaborators) => {
  // 更新本地編輯狀態，不立即提交
  if (editingTask.value && editingTask.value._id === task._id) {
    // 確保 newCollaborators 是有效的 ID 陣列
    const validCollaborators = (newCollaborators || []).filter(id => id && typeof id === 'string')
    editingTask.value.collaborators = validCollaborators
    console.log('更新協作者:', validCollaborators) // 調試用
  }
}

// 保存任務名稱
const saveTaskName = async (task) => {
  if (editingTask.value && editingTask.value._id === task._id) {
    const newName = editingTask.value.name?.trim()
    if (newName && newName !== task.name) {
      await updateTask(task._id, { name: newName })
    }
  }
}

// 保存協作者變更
const saveCollaborators = async (task) => {
  if (editingTask.value && editingTask.value._id === task._id) {
    const newCollaborators = editingTask.value.collaborators || []
    // 確保協作者是有效的 ID 陣列
    const validCollaborators = newCollaborators.filter(id => id && typeof id === 'string')

    // 取得原始協作者 ID 陣列
    const originalCollaborators = (task.collaborators || []).map(c => {
      return typeof c === 'object' ? c._id : c
    }).filter(Boolean)

    // 比較協作者是否有變更
    const hasChanged = JSON.stringify(originalCollaborators.sort()) !== JSON.stringify(validCollaborators.sort())

    console.log('協作者變更檢查:', {
      original: originalCollaborators,
      new: validCollaborators,
      hasChanged
    })

    // 只有當協作者真的有變更時才發送更新請求
    if (hasChanged) {
      await updateTask(task._id, { collaborators: validCollaborators })
    } else {
      console.log('協作者沒有變更，跳過更新')
    }
  }
}

// 檢查是否正在編輯
const isEditing = (task, field = null) => {
  if (!editingTask.value || editingTask.value._id !== task._id) {
    return false
  }

  // 如果沒有指定欄位，檢查是否正在編輯任何欄位
  if (!field) {
    return true
  }

  // 檢查是否正在編輯特定欄位
  return editingTask.value.editingField === field
}

// 獲取顯示用的協作者數據
const getDisplayCollaborators = (task) => {
  // 如果正在編輯，使用編輯中的協作者數據
  if (isEditing(task) && editingTask.value) {
    // 從編輯狀態的 ID 陣列轉換為完整的用戶對象
    const collaboratorIds = editingTask.value.collaborators || []
    return collaboratorIds.map(id => {
      // 從團隊成員中找到對應的用戶對象
      return props.project?.team?.members?.find(member => member._id === id)
    }).filter(Boolean) // 過濾掉找不到的用戶
  }
  // 否則使用原始的協作者數據
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

// 監聽任務分類變化，自動展開所有面板
watch(() => inProgressTaskCategories.value, (newCategories, oldCategories) => {
  // 如果是第一次載入且沒有展開的面板，展開所有面板
  if (newCategories.length > 0 && expandedPanels.value.length === 0) {
    expandedPanels.value = newCategories.map((_, index) => index)
    return
  }

  // 檢查是否有新增的分類
  if (oldCategories && newCategories.length > oldCategories.length) {
    // 找出新增的分類並自動展開
    const oldCategoryNames = new Set(oldCategories.map(cat => cat.name))
    newCategories.forEach((category, index) => {
      if (!oldCategoryNames.has(category.name)) {
        // 這是新增的分類，自動展開
        if (!expandedPanels.value.includes(index)) {
          expandedPanels.value.push(index)
        }
      }
    })
  }

  // 如果分類數量減少了，需要調整展開面板的索引
  if (oldCategories && newCategories.length < oldCategories.length) {
    // 過濾掉超出範圍的索引
    expandedPanels.value = expandedPanels.value.filter(index => index < newCategories.length)
  }
}, { immediate: true })

// 監聽 ESC 鍵取消編輯
const handleKeydown = (event) => {
  if (event.key === 'Escape' && editingTask.value) {
    cancelEditingTask()
  }
}

// 監聽點擊外部區域取消編輯
const handleClickOutside = (event) => {
  if (editingTask.value) {
    // 檢查點擊的目標是否在編輯區域內
    const isEditingElement = event.target.closest('.assignee-select, .due-date-input, .collaborators-select, .task-name-input')

    // 檢查是否點擊了日期選擇器的彈出視窗
    const isDatePickerPopup = event.target.closest('.v-date-picker, .v-picker, .v-overlay__content')

    // 檢查是否點擊了下拉選單的彈出視窗
    const isSelectPopup = event.target.closest('.v-overlay__content .v-list, .v-menu__content')

    if (!isEditingElement && !isDatePickerPopup && !isSelectPopup) {
      cancelEditingTask()
    }
  }
}

// 任務分類排序功能
const moveCategoryUp = async (index) => {
  if (index === 0) return

  try {
    // 立即更新本地狀態，不等待 API 回應
    const newCategories = [...props.project.taskCategories]
    // 交換位置
    const temp = newCategories[index]
    newCategories[index] = newCategories[index - 1]
    newCategories[index - 1] = temp

    // 更新 order 欄位
    const reorderedCategories = newCategories.map((category, idx) => ({
      ...category,
      order: idx
    }))

    // 直接更新專案的任務分類資料
    const updatedProject = {
      ...props.project,
      taskCategories: reorderedCategories
    }

    // 通知父組件更新專案資料
    emit('project-updated', updatedProject)

    // 在背景發送 API 請求，不顯示載入動畫
    try {
      await apiAuth.put(`/projects/${props.project._id}/categories/order`, {
        taskCategories: reorderedCategories.map(cat => ({
          name: cat.name,
          color: cat.color || 'grey',
          order: cat.order
        }))
      })
      console.log('✅ 任務分類排序 API 更新成功')
    } catch (error) {
      console.error('❌ 任務分類排序 API 更新失敗:', error)
      // 如果 API 失敗，顯示錯誤訊息但不影響 UI
      createSnackbar({
        text: '排序更新失敗，請重新整理頁面',
        snackbarProps: { color: 'red-lighten-1' }
      })
    }
  } catch (error) {
    console.error('❌ 任務分類排序本地更新失敗:', error)
    createSnackbar({
      text: '排序更新失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

const moveCategoryDown = async (index) => {
  if (index === props.project.taskCategories.length - 1) return

  try {
    // 立即更新本地狀態，不等待 API 回應
    const newCategories = [...props.project.taskCategories]
    // 交換位置
    const temp = newCategories[index]
    newCategories[index] = newCategories[index + 1]
    newCategories[index + 1] = temp

    // 更新 order 欄位
    const reorderedCategories = newCategories.map((category, idx) => ({
      ...category,
      order: idx
    }))

    // 直接更新專案的任務分類資料
    const updatedProject = {
      ...props.project,
      taskCategories: reorderedCategories
    }

    // 通知父組件更新專案資料
    emit('project-updated', updatedProject)

    // 在背景發送 API 請求，不顯示載入動畫
    try {
      await apiAuth.put(`/projects/${props.project._id}/categories/order`, {
        taskCategories: reorderedCategories.map(cat => ({
          name: cat.name,
          color: cat.color || 'grey',
          order: cat.order
        }))
      })
      console.log('✅ 任務分類排序 API 更新成功')
    } catch (error) {
      console.error('❌ 任務分類排序 API 更新失敗:', error)
      // 如果 API 失敗，顯示錯誤訊息但不影響 UI
      createSnackbar({
        text: '排序更新失敗，請重新整理頁面',
        snackbarProps: { color: 'red-lighten-1' }
      })
    }
  } catch (error) {
    console.error('❌ 任務分類排序本地更新失敗:', error)
    createSnackbar({
      text: '排序更新失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}


// 開啟移動任務對話框
const openMoveTaskDialog = (task) => {
  movingTask.value = task
  selectedNewCategory.value = task.category || ''
  moveTaskDialog.value = true
}

// 移動任務到新分類
const moveTask = async () => {
  if (!movingTask.value || !selectedNewCategory.value) return

  try {
    const { data } = await apiAuth.put(`/tasks/${movingTask.value._id}`, {
      category: selectedNewCategory.value
    })

    if (data.success) {
      emit('task-updated', data.data)
      moveTaskDialog.value = false
      movingTask.value = null
      selectedNewCategory.value = ''

      createSnackbar({
        text: '任務分類更新成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
    }
  } catch (error) {
    console.error('移動任務失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '移動任務失敗',
      snackbarProps: { color: 'red-lighten-1' }
    })
  }
}

// 取得可用的分類選項（包含所有專案分類）
const getAvailableCategories = computed(() => {
  const categories = props.project?.taskCategories || []
  return categories
})

// 新增任務對話框可選協作者（不包含自己）
const collaboratorOptionsForCreate = computed(() => {
  const members = props.project?.team?.members || []
  return members.filter(member => member && member._id !== userStore._id)
})

// 複製任務：僅複製名稱與描述，其餘欄位不帶入
const duplicateTask = async (task) => {
  try {
    // 產生複製名稱，處理可能的重複名稱
    const baseName = `${task.name}-複本`
    let finalName = baseName

    // 嘗試建立任務，若名稱衝突再以 (2) 重試一次
    const attemptCreate = async (nameToUse) => {
      const { data } = await apiAuth.post('/tasks', {
        name: nameToUse,
        description: task.description || '',
        category: task.category || '',
        project: props.project._id
      })
      return data
    }

    let resp = await attemptCreate(finalName)
    if (!resp.success) throw new Error(resp.message || '複製任務失敗')

    // 若成功
    if (resp.success) {
      emit('task-created', { task: resp.data, category: task.category || '' })
      createSnackbar({
        text: '任務複製成功',
        snackbarProps: { color: 'teal-lighten-1' }
      })
      return
    }
  } catch (firstError) {
    // 若為名稱重複（後端 409），改用名稱 (2) 再嘗試一次
    const backendMsg = firstError?.response?.data?.message || ''
    const isDuplicate = backendMsg.includes('已存在') || firstError?.response?.status === 409
    if (!isDuplicate) {
      console.error('複製任務失敗:', firstError)
      createSnackbar({
        text: backendMsg || '複製任務失敗',
        snackbarProps: { color: 'red-lighten-1' }
      })
      return
    }

    try {
      const nameWithIdx = `${task.name}-複本 (2)`
      const { data } = await apiAuth.post('/tasks', {
        name: nameWithIdx,
        description: task.description || '',
        category: task.category || '',
        project: props.project._id
      })
      if (data.success) {
        emit('task-created', { task: data.data, category: task.category || '' })
        createSnackbar({
          text: '任務複製成功',
          snackbarProps: { color: 'teal-lighten-1' }
        })
        return
      }
      throw new Error(data.message || '複製任務失敗')
    } catch (secondError) {
      console.error('複製任務失敗 (第二次嘗試):', secondError)
      createSnackbar({
        text: secondError?.response?.data?.message || '複製任務失敗',
        snackbarProps: { color: 'red-lighten-1' }
      })
    }
  }
}

// 組件掛載時添加事件監聽器
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('click', handleClickOutside)
})

// 組件卸載時移除事件監聽器
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('click', handleClickOutside)
})
</script>



<style lang="scss" scoped>
.task-table-container {
  background-color: rgb(var(--v-theme-surface));
  padding: 16px 28px;
}

.task-tabs-container {
  border-bottom: 1px solid rgb(var(--v-theme-outline-variant));
}

.search-container {
  min-width: 280px;
  max-width: 400px;
}



.task-categories-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-category-panel {
  border: 1px solid #ddd;
  border-radius: 12px;
  overflow: hidden;
}

.category-header {
  padding: 12px 16px;
  background-color: #eceff1;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.category-header:hover {
  background-color: #ddd;
}

.transition-transform {
  transition: transform 0.2s ease;
}

.rotate-180 {
  transform: rotate(180deg);
}

.task-table-wrapper {
  overflow: hidden;
}

.task-table {
  border-radius: 0;
}

.completed-tasks-table {
  border: 1px solid rgb(var(--v-theme-outline-variant));
  :deep(tbody tr:nth-child(odd)) {
    background-color: #f5f7f8;
  }
}

.task-table :deep(.v-data-table__td) {
  border-bottom: 1px solid rgb(var(--v-theme-outline-variant));
  height: 40px;
}

.task-table :deep(.v-data-table__th) {
  padding: 12px 16px !important;
  font-weight: 600;
  border-bottom: 1px solid #ddd;
}

.task-table :deep(.v-data-table__tr) {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.task-table :deep(tbody tr:nth-child(odd)) {
  background-color: #f9f9f9;
}

.task-table :deep(.v-data-table__tr:hover) {
  background-color: #eee;
}

.task-name {
  font-weight: 500;
}

.collaborator-avatar {
  border: 1px solid white;
}

.cursor-pointer {
  cursor: pointer;
}

.category-header:hover .category-edit-btn,
.category-header:hover .category-delete-btn,
.category-header:hover .category-sort-buttons {
  opacity: 1 !important;
}


/* 任務行 hover 效果 - 每個欄位獨立 */
.task-table :deep(.task-name-container:hover) .task-name-edit-btn {
  opacity: 1 !important;
}

.task-table :deep(.assignee-container:hover) .assignee-edit-btn {
  opacity: 1 !important;
}

.task-table :deep(.due-date-container:hover) .due-date-edit-btn {
  opacity: 1 !important;
}

.task-table :deep(.collaborators-container:hover) .collaborators-edit-btn {
  opacity: 1 !important;
}

/* 預設隱藏所有編輯按鈕 */
.task-table :deep(.task-name-edit-btn),
.task-table :deep(.assignee-edit-btn),
.task-table :deep(.due-date-edit-btn),
.task-table :deep(.collaborators-edit-btn) {
  opacity: 0 !important;
  transition: opacity 0.2s ease;
}

.assignee-select,
.due-date-input,
.collaborators-select,
.task-name-input {
  min-width: 120px;
  max-width: 200px;
}

.task-name-container {
  flex: 1;
  min-width: 0;
}

.task-name {
  word-break: break-word;
  overflow-wrap: break-word;
}

.add-task-row {
  padding: 4px 0;
  border-top: 1px solid #ddd;
}

.add-task-cell {
  text-align: center;
}



.add-category-btn {
  font-weight: 500;
  text-transform: none;
  letter-spacing: normal;
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

/* 響應式設計 */
@media (max-width: 768px) {
  .task-table :deep(.v-data-table__td),
  .task-table :deep(.v-data-table__th) {
    padding: 8px 12px;
  }

  .task-name-column,
  .assignee-column,
  .due-date-column,
  .collaborators-column,
  .last-modified-column,
  .completed-column,
  .creator-column,
  .actions-column {
    min-width: 80px;
  }
}
</style>
