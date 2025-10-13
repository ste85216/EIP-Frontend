<template>
  <v-app>
    <v-app-bar
      elevation="0"
      color="#2f2f2f"
      border="b-sm"
      height="100"
      class="position-fixed border-surface-bright"
    >
      <v-btn
        icon
        color="white"
        :size="!smAndUp ? 32 : 36"
        class="mx-2 mx-sm-3"
        @click.stop="toggleDrawer"
      >
        <v-icon :size="!smAndUp ? 20 : 24">
          mdi-menu
        </v-icon>
      </v-btn>
      <router-link
        to="/projectAndTaskManagement"
        class="d-flex align-center text-decoration-none"
      >
        <!-- <img
          src="/src/assets/image/ProjectAndTask_Logo.png"
          width="210"
          class="pt-3 ms-1"
        > -->
        <v-icon
          :size="titleIconSize"
          color="white"
        >
          mdi-checkbox-marked-circle-plus-outline
        </v-icon>
        <span class="project-and-task-title text-white">
          專案與任務管理
        </span>
      </router-link>
      <v-spacer />

      <!-- 收件匣按鈕 -->
      <NotificationInbox v-if="user.isLogin" />

      <v-btn
        v-if="user.isLogin && smAndUp"
        class="me-4 ms-2 rounded-0"
        variant="outlined"
        prepend-icon="mdi-arrow-left"
        color="white"
        :ripple="false"
        :size="buttonSize"
        flat
        to="/"
      >
        回永信系統
      </v-btn>
      <v-btn
        v-if="user.isLogin && !smAndUp"
        icon
        class="me-4 rounded-0"
        variant="outlined"
        color="white"
        :ripple="false"
        size="22"
        flat
        to="/"
      >
        <v-icon
          size="18"
          color="white"
        >
          mdi-arrow-left
        </v-icon>
      </v-btn>
    </v-app-bar>

    <v-navigation-drawer
      v-if="mdAndUp"
      v-model="drawer"
      :width="drawerWidth"
      color="#2f2f2f"
      class="border-0"
      :rail="rail"
      permanent
      :expand-on-hover="rail"
      :transition="isResizing ? false : 'drawer-transition'"
      :class="['position-fixed', { resizing: isResizing }]"
    >
      <v-list
        v-model:opened="openedGroups"
        v-model:selected="selectedItem"
        class="pa-0"
        density="compact"
        open-strategy="multiple"
        select-strategy="single-leaf"
      >
        <!-- 用戶名片卡片 -->
        <div v-if="!rail">
          <v-card
            elevation="0"
            rounded="0"
            height="174"
            width="280"
            class="pa-0 card-bg position-relative"
            :class="{ 'loaded': isBackgroundLoaded }"
            :style="{ backgroundImage: `url(${getBackgroundImage()})` }"
          >
            <!-- 添加 skeleton -->
            <v-skeleton-loader
              v-if="!isBackgroundLoaded"
              class="position-absolute w-100 h-100 pa-0 ma-0"
            />

            <!-- 添加隱藏的圖片用於預加載 -->
            <img
              :src="getBackgroundImage()"
              alt="background"
              style="display: none;"
              @load="handleImageLoad"
            >
            <div class="card-blur pt-2 pb-4 px-2">
              <v-card-title
                class="ps-5 pb-3 d-flex justify-space-between pe-2"
              >
                <UserAvatar
                  :user="user"
                  size="48"
                  avatar-class="me-3"
                  style="box-shadow: 0 0 10px rgba(255,255,255,1);"
                />
              </v-card-title>
              <v-card-text style="letter-spacing: 2px; color: white; line-height: 24px;">
                <v-row>
                  <v-col
                    cols="12"
                    class="ps-4 pb-0 pt-4"
                  >
                    <span style="font-size: 17px; font-weight: 600;">{{ user.name }}</span>
                  </v-col>
                  <v-col
                    cols="12"
                    class="ps-4 pb-0 pt-0"
                  >
                    <span>{{ user.userId }}</span>
                    <span v-if="user.isAdmin">{{ user.adminId }}</span>
                  </v-col>
                  <v-col
                    cols="12"
                    class="ps-4 pb-0 pt-0"
                  >
                    {{ getDisplayRole() }}
                  </v-col>
                </v-row>
              </v-card-text>
            </div>
          </v-card>
        </div>

        <!-- 基本功能按鈕 - 所有人都可以看到 -->
        <v-list-item
          to="/projectAndTaskManagement"
          value="home"
          color="white"
          class="mt-2"
        >
          <template #prepend>
            <v-icon>
              mdi-home
            </v-icon>
          </template>
          <v-list-item-title>
            <span
              class="font-weight-bold"
            >首頁</span>
          </v-list-item-title>
        </v-list-item>

        <v-divider class="my-2" />

        <!-- 已加星號區塊 -->
        <v-list-group
          value="favorites"
          class="mb-2"
          fluid
        >
          <template #activator="{ props: groupProps }">
            <v-list-item
              v-bind="groupProps"
              variant="outlined"
              color="white"
              :class="rail ? 'rounded-lg ps-3 mx-1' : 'rounded-lg mx-2'"
            >
              <template #prepend>
                <v-icon>
                  mdi-star
                </v-icon>
              </template>
              <v-list-item-title>
                <span>已加星號</span>
              </v-list-item-title>
            </v-list-item>
          </template>

          <!-- 已加星號的專案列表 -->
          <div
            v-for="project in displayedFavoriteProjects"
            :key="`favorite-${project._id}`"
            class="project-item-container"
          >
            <v-list-item
              :to="`/projectAndTaskManagement/projects/${project._id}`"
              :value="`favorite-${project._id}`"
              class="project-list-item pe-12"
            >
              <template #prepend>
                <v-icon :color="project.iconColor">
                  mdi-square-rounded
                </v-icon>
              </template>
              <v-list-item-title>{{ project.name }}</v-list-item-title>
            </v-list-item>
            <div class="color-button-container pe-2">
              <v-menu>
                <template #activator="{ props: menuProps }">
                  <v-btn
                    v-if="showColorButton && canManageProjectColor(project)"
                    v-bind="menuProps"
                    icon="mdi-palette"
                    size="x-small"
                    variant="text"
                    color="white"
                    @click.stop.prevent
                  />
                </template>
                <v-list
                  slim
                  density="compact"
                >
                  <v-list-item
                    @click="updateProjectColor(project._id, undefined)"
                  >
                    <template #prepend>
                      <v-icon>mdi-square-rounded-outline</v-icon>
                    </template>
                    <v-list-item-title>無色</v-list-item-title>
                  </v-list-item>
                  <v-list-item
                    v-for="color in colorOptions"
                    :key="color.value"
                    @click="updateProjectColor(project._id, color.value)"
                  >
                    <template #prepend>
                      <v-icon :color="color.value">
                        mdi-square-rounded
                      </v-icon>
                    </template>
                    <v-list-item-title>{{ color.title }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </div>

          <!-- 如果沒有已加星號的專案，顯示提示 -->
          <v-list-item
            v-if="favoriteProjects.length === 0"
            disabled
            color="white"
          >
            <template #prepend>
              <v-icon color="grey-lighten-4">
                mdi-star-outline
              </v-icon>
            </template>
            <v-list-item-title class="text-grey-lighten-4">
              尚無已加星號的專案
            </v-list-item-title>
          </v-list-item>
        </v-list-group>

        <!-- 專案區塊 -->
        <v-list-group
          value="projects"
          class="mb-2"
          fluid
        >
          <template #activator="{ props: groupProps }">
            <v-list-item
              v-bind="groupProps"
              variant="outlined"
              color="white"
              :class="rail ? 'rounded-lg ps-3 mx-1' : 'rounded-lg mx-2'"
            >
              <template #prepend>
                <v-icon>
                  mdi-folder-multiple
                </v-icon>
              </template>
              <v-list-item-title>
                <span>專案</span>
              </v-list-item-title>
              <template #append>
                <v-btn
                  v-if="canCreateProject"
                  icon="mdi-plus"
                  size="22"
                  variant="text"
                  color="white"
                  @click.stop="openCreateProjectDialog"
                />
              </template>
            </v-list-item>
          </template>

          <!-- 用戶所屬的專案列表（最多顯示10個） -->
          <div
            v-for="project in displayedProjects"
            :key="project._id"
            class="project-item-container"
          >
            <v-list-item
              :to="`/projectAndTaskManagement/projects/${project._id}`"
              :value="`project-${project._id}`"
              class="project-list-item"
            >
              <template #prepend>
                <v-icon :color="project.iconColor">
                  mdi-square-rounded
                </v-icon>
              </template>
              <v-list-item-title class="pe-8">
                {{ project.name }}
              </v-list-item-title>
            </v-list-item>
            <div class="color-button-container pe-2">
              <v-menu>
                <template #activator="{ props: menuProps }">
                  <v-btn
                    v-if="showColorButton && canManageProjectColor(project)"
                    v-bind="menuProps"
                    icon="mdi-palette"
                    size="x-small"
                    variant="text"
                    color="white"
                    @click.stop.prevent
                  />
                </template>
                <v-list
                  slim
                  density="compact"
                >
                  <v-list-item
                    @click="updateProjectColor(project._id, undefined)"
                  >
                    <template #prepend>
                      <v-icon>mdi-square-rounded-outline</v-icon>
                    </template>
                    <v-list-item-title>無色</v-list-item-title>
                  </v-list-item>
                  <v-list-item
                    v-for="color in colorOptions"
                    :key="color.value"
                    @click="updateProjectColor(project._id, color.value)"
                  >
                    <template #prepend>
                      <v-icon :color="color.value">
                        mdi-square-rounded
                      </v-icon>
                    </template>
                    <v-list-item-title>{{ color.title }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </div>

          <!-- 查看我的專案 -->
          <v-list-item
            to="/projectAndTaskManagement/projects"
            :value="'my-projects'"
            color="white"
          >
            <template #prepend>
              <v-icon>mdi-arrow-right</v-icon>
            </template>
            <v-list-item-title class="text-grey">
              查看我的專案
            </v-list-item-title>
          </v-list-item>

          <!-- 如果沒有專案，顯示提示 -->
          <v-list-item
            v-if="userProjects.length === 0"
            disabled
            color="white"
          >
            <template #prepend>
              <v-icon color="grey-lighten-4">
                mdi-information-outline
              </v-icon>
            </template>
            <v-list-item-title class="text-grey-lighten-4">
              尚無專案
            </v-list-item-title>
          </v-list-item>
        </v-list-group>

        <!-- 團隊區塊 -->
        <v-list-group
          value="teams"
          fluid
        >
          <template #activator="{ props: groupProps }">
            <v-list-item
              v-bind="groupProps"
              variant="outlined"
              :class="rail ? 'rounded-lg ps-3 mx-1' : 'rounded-lg mx-2'"
              color="white"
            >
              <template #prepend>
                <v-icon>
                  mdi-account-group
                </v-icon>
              </template>
              <v-list-item-title>
                <span>團隊</span>
              </v-list-item-title>
              <template #append>
                <v-btn
                  v-if="permissionStore.hasPermission('TEAM_CREATE')"
                  icon="mdi-plus"
                  size="22"
                  variant="text"
                  color="white"
                  @click.stop="openCreateTeamDialog"
                />
              </template>
            </v-list-item>
          </template>

          <!-- 用戶所屬的團隊列表（最多顯示10個） -->
          <v-list-item
            v-for="team in displayedTeams"
            :key="team._id"
            :to="`/projectAndTaskManagement/teams/${team._id}`"
            :value="`team-${team._id}`"
            color="white"
          >
            <template #prepend>
              <v-icon>mdi-account-multiple</v-icon>
            </template>
            <v-list-item-title>{{ team.name }}</v-list-item-title>
          </v-list-item>

          <!-- 查看我的團隊 -->
          <v-list-item
            to="/projectAndTaskManagement/teams"
            :value="'my-teams'"
            color="white"
          >
            <template #prepend>
              <v-icon>mdi-arrow-right</v-icon>
            </template>
            <v-list-item-title class="text-grey">
              查看我的團隊
            </v-list-item-title>
          </v-list-item>

          <!-- 如果沒有團隊，顯示提示 -->
          <v-list-item
            v-if="teamStore.getUserTeams(user._id).length === 0"
            disabled
            color="white"
          >
            <template #prepend>
              <v-icon color="grey-lighten-4">
                mdi-information-outline
              </v-icon>
            </template>
            <v-list-item-title class="text-grey-lighten-4">
              尚無團隊
            </v-list-item-title>
          </v-list-item>
        </v-list-group>
      </v-list>

      <!-- 可拖曳的調整區域 -->
      <div
        v-if="!rail"
        class="resize-handle"
        @mousedown="startResize"
      />
    </v-navigation-drawer>

    <v-navigation-drawer
      v-if="!mdAndUp"
      v-model="mdDrawer"
      border="0"
      color="#2f2f2f"
      class="rounded-be-xl position-fixed"
    >
      <v-list
        v-model:opened="openedGroups"
        v-model:selected="selectedItem"
        class="h-100 pa-0 overflow-auto"
        density="compact"
        open-strategy="multiple"
        select-strategy="single-leaf"
      >
        <!-- 用戶名片卡片 -->
        <v-card
          elevation="0"
          rounded="0"
          height="172"
          class="pa-0 card-bg"
          :class="{ 'loaded': isBackgroundLoaded }"
          :style="{ backgroundImage: `url(${getBackgroundImage()})` }"
        >
          <!-- 添加 skeleton -->
          <v-skeleton-loader
            v-if="!isBackgroundLoaded"
            class="position-absolute w-100 h-100 pa-0 ma-0"
          />

          <!-- 添加隱藏的圖片用於預加載 -->
          <img
            :src="getBackgroundImage()"
            alt="background"
            style="display: none;"
            @load="handleImageLoad"
          >
          <div class="card-blur pt-2 pb-4 px-2">
            <v-card-title class="ps-5 pb-3">
              <UserAvatar
                :user="user"
                size="48"
                avatar-class="me-3"
                style="box-shadow: 0 0 10px rgba(255,255,255,1);"
              />
            </v-card-title>
            <v-card-text style="letter-spacing: 2px; color: white; line-height: 24px;">
              <v-row>
                <v-col
                  cols="12"
                  class="ps-4 pb-0 pt-4"
                >
                  <span style="font-size: 17px; font-weight: 600;">{{ user.name }}</span>
                </v-col>
                <v-col
                  cols="12"
                  class="ps-4 pb-0 pt-0"
                >
                  <span>{{ user.userId }}</span>
                  <span v-if="user.isAdmin">{{ user.adminId }}</span>
                </v-col>
                <v-col
                  cols="12"
                  class="ps-4 pb-0 pt-0"
                >
                  {{ getDisplayRole() }}
                </v-col>
              </v-row>
            </v-card-text>
          </div>
        </v-card>

        <v-divider class="my-2" />

        <!-- 基本功能按鈕 - 所有人都可以看到 -->
        <v-list-item
          to="/projectAndTaskManagement"
          value="home"
          color="white"
        >
          <template #prepend>
            <v-icon>mdi-home</v-icon>
          </template>
          <v-list-item-title>首頁</v-list-item-title>
        </v-list-item>

        <v-divider />

        <!-- 已加星號區塊 -->
        <v-list-group
          value="favorites"
          fluid
        >
          <template #activator="{ props: groupProps }">
            <v-list-item
              v-bind="groupProps"
              color="white"
            >
              <template #prepend>
                <v-icon>mdi-star</v-icon>
              </template>
              <v-list-item-title>已加星號</v-list-item-title>
            </v-list-item>
          </template>

          <!-- 已加星號的專案列表 -->
          <div
            v-for="project in displayedFavoriteProjects"
            :key="`favorite-${project._id}`"
            class="project-item-container"
          >
            <v-list-item
              :to="`/projectAndTaskManagement/projects/${project._id}`"
              :value="`favorite-${project._id}`"
              color="white"
              class="project-list-item pe-12"
            >
              <template #prepend>
                <v-icon :color="project.iconColor">
                  mdi-square-rounded
                </v-icon>
              </template>
              <v-list-item-title>{{ project.name }}</v-list-item-title>
            </v-list-item>
            <div class="color-button-container pe-2">
              <v-menu>
                <template #activator="{ props: menuProps }">
                  <v-btn
                    v-if="showColorButton && canManageProjectColor(project)"
                    v-bind="menuProps"
                    icon="mdi-palette"
                    size="x-small"
                    variant="text"
                    color="white"
                    @click.stop.prevent
                  />
                </template>
                <v-list
                  slim
                  density="compact"
                >
                  <v-list-item
                    @click="updateProjectColor(project._id, undefined)"
                  >
                    <template #prepend>
                      <v-icon>mdi-square-rounded-outline</v-icon>
                    </template>
                    <v-list-item-title>無色</v-list-item-title>
                  </v-list-item>
                  <v-list-item
                    v-for="color in colorOptions"
                    :key="color.value"
                    @click="updateProjectColor(project._id, color.value)"
                  >
                    <template #prepend>
                      <v-icon :color="color.value">
                        mdi-square-rounded
                      </v-icon>
                    </template>
                    <v-list-item-title>{{ color.title }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </div>

          <!-- 如果沒有已加星號的專案，顯示提示 -->
          <v-list-item
            v-if="favoriteProjects.length === 0"
            disabled
            color="white"
          >
            <template #prepend>
              <v-icon color="grey-lighten-4">
                mdi-star-outline
              </v-icon>
            </template>
            <v-list-item-title class="text-grey-lighten-4">
              尚無已加星號的專案
            </v-list-item-title>
          </v-list-item>
        </v-list-group>

        <!-- 專案區塊 -->
        <v-list-group
          value="projects"
          fluid
        >
          <template #activator="{ props: groupProps }">
            <v-list-item
              v-bind="groupProps"
              color="white"
            >
              <template #prepend>
                <v-icon>mdi-folder-multiple</v-icon>
              </template>
              <v-list-item-title>專案</v-list-item-title>
              <template #append>
                <v-btn
                  v-if="canCreateProject"
                  icon="mdi-plus"
                  size="x-small"
                  variant="text"
                  color="white"
                  @click.stop="openCreateProjectDialog"
                />
              </template>
            </v-list-item>
          </template>

          <!-- 用戶所屬的專案列表（最多顯示10個） -->
          <div
            v-for="project in displayedProjects"
            :key="project._id"
            class="project-item-container"
          >
            <v-list-item
              :to="`/projectAndTaskManagement/projects/${project._id}`"
              :value="`project-${project._id}`"
              color="white"
              class="project-list-item pe-12"
            >
              <template #prepend>
                <v-icon :color="project.iconColor">
                  mdi-square-rounded
                </v-icon>
              </template>
              <v-list-item-title>{{ project.name }}</v-list-item-title>
            </v-list-item>
            <div class="color-button-container pe-2">
              <v-menu>
                <template #activator="{ props: menuProps }">
                  <v-btn
                    v-if="showColorButton && canManageProjectColor(project)"
                    v-bind="menuProps"
                    icon="mdi-palette"
                    size="x-small"
                    variant="text"
                    color="white"
                    @click.stop.prevent
                  />
                </template>
                <v-list
                  slim
                  density="compact"
                >
                  <v-list-item
                    @click="updateProjectColor(project._id, undefined)"
                  >
                    <template #prepend>
                      <v-icon>mdi-square-rounded-outline</v-icon>
                    </template>
                    <v-list-item-title>無色</v-list-item-title>
                  </v-list-item>
                  <v-list-item
                    v-for="color in colorOptions"
                    :key="color.value"
                    @click="updateProjectColor(project._id, color.value)"
                  >
                    <template #prepend>
                      <v-icon :color="color.value">
                        mdi-square-rounded
                      </v-icon>
                    </template>
                    <v-list-item-title>{{ color.title }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </div>

          <!-- 查看我的專案 -->
          <v-list-item
            to="/projectAndTaskManagement/projects"
            :value="'my-projects'"
            color="white"
          >
            <template #prepend>
              <v-icon>mdi-arrow-right</v-icon>
            </template>
            <v-list-item-title class="text-grey">
              查看我的專案
            </v-list-item-title>
          </v-list-item>

          <!-- 如果沒有專案，顯示提示 -->
          <v-list-item
            v-if="userProjects.length === 0"
            disabled
            color="white"
          >
            <template #prepend>
              <v-icon color="grey-lighten-4">
                mdi-information-outline
              </v-icon>
            </template>
            <v-list-item-title class="text-grey-lighten-4">
              尚無專案
            </v-list-item-title>
          </v-list-item>
        </v-list-group>

        <!-- 團隊區塊 -->
        <v-list-group
          value="teams"
          fluid
        >
          <template #activator="{ props: groupProps }">
            <v-list-item
              v-bind="groupProps"
              color="white"
            >
              <template #prepend>
                <v-icon>mdi-account-group</v-icon>
              </template>
              <v-list-item-title>團隊</v-list-item-title>
              <template #append>
                <v-btn
                  v-if="permissionStore.hasPermission('PROJECT_AND_TASK_MANAGE')"
                  icon="mdi-plus"
                  size="x-small"
                  variant="text"
                  color="white"
                  @click.stop="openCreateTeamDialog"
                />
              </template>
            </v-list-item>
          </template>

          <!-- 用戶所屬的團隊列表（最多顯示10個） -->
          <v-list-item
            v-for="team in displayedTeams"
            :key="team._id"
            :to="`/projectAndTaskManagement/teams/${team._id}`"
            :value="`team-${team._id}`"
            color="white"
          >
            <template #prepend>
              <v-icon>mdi-account-multiple</v-icon>
            </template>
            <v-list-item-title>{{ team.name }}</v-list-item-title>
          </v-list-item>

          <!-- 查看我的團隊 -->
          <v-list-item
            to="/projectAndTaskManagement/teams"
            :value="'my-teams'"
            color="white"
          >
            <template #prepend>
              <v-icon>mdi-arrow-right</v-icon>
            </template>
            <v-list-item-title class="text-grey">
              查看我的團隊
            </v-list-item-title>
          </v-list-item>

          <!-- 如果沒有團隊，顯示提示 -->
          <v-list-item
            v-if="teamStore.getUserTeams(user._id).length === 0"
            disabled
            color="white"
          >
            <template #prepend>
              <v-icon color="grey-lighten-4">
                mdi-information-outline
              </v-icon>
            </template>
            <v-list-item-title class="text-grey-lighten-4">
              尚無團隊
            </v-list-item-title>
          </v-list-item>
        </v-list-group>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <router-view />
    </v-main>

    <!-- 新增團隊對話框 -->
    <CreateTeamDialog
      v-model="createTeamDialog"
      @team-created="handleTeamCreated"
    />

    <!-- 新增專案對話框 -->
    <CreateProjectDialog
      v-model="createProjectDialog"
      @project-created="handleProjectCreated"
    />
  </v-app>
</template>
<script setup>
import { ref, watch, onMounted, computed, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useProjectStore } from '@/stores/project'
import { useTeamStore } from '@/stores/team'
import { usePermissionStore } from '@/stores/permission'
import { useDisplay } from 'vuetify'
import { useApi } from '@/composables/axios'
import { roleNames } from '@/enums/UserRole'
import UserAvatar from '@/components/UserAvatar.vue'
import CreateTeamDialog from '@/components/CreateTeamDialog.vue'
import CreateProjectDialog from '@/components/CreateProjectDialog.vue'
import NotificationInbox from '@/components/NotificationInbox.vue'

const { mdAndUp, lgAndUp, name: breakpoint } = useDisplay()
const route = useRoute()

const drawer = ref(true)
const mdDrawer = ref(false)
const rail = ref(false)
const showColorButton = ref(false)
const drawerWidth = ref(280)
const isResizing = ref(false)
const startX = ref(0)
const startWidth = ref(0)
const selectedItem = ref([])
let animationFrameId = null
const user = useUserStore()
const projectStore = useProjectStore()
const teamStore = useTeamStore()
const permissionStore = usePermissionStore()
const { smAndUp } = useDisplay()
const { apiAuth } = useApi()

// 名片卡片相關狀態
const isBackgroundLoaded = ref(false)
const isAvatarLoaded = ref(false)
const userRbacRoles = ref([]) // 用戶的 RBAC 角色

const titleIconSize = computed(() => {
  if (!smAndUp.value) return '20'  // 小螢幕
  if (!mdAndUp.value) return '24'  // sm-lg
  return '28'  // lg以上
})

// 對話框狀態
const createTeamDialog = ref(false)
const createProjectDialog = ref(false)

// 用戶專案列表
const userProjects = ref([])

// 控制群組展開狀態 - 使用陣列格式，預設展開已加星號、專案和團隊
const openedGroups = ref(['favorites', 'projects', 'teams'])

// 從 localStorage 恢復展開狀態
const loadOpenedGroups = () => {
  try {
    const saved = localStorage.getItem('projectAndTask_openedGroups')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) {
        openedGroups.value = parsed
      }
    }
  } catch (error) {
    console.error('載入展開狀態失敗:', error)
  }
}

// 保存展開狀態到 localStorage
const saveOpenedGroups = () => {
  try {
    localStorage.setItem('projectAndTask_openedGroups', JSON.stringify(openedGroups.value))
  } catch (error) {
    console.error('保存展開狀態失敗:', error)
  }
}

const buttonSize = computed(() => !smAndUp.value ? 'small' : 'default')

// 名片卡片相關方法
const handleImageLoad = () => {
  isBackgroundLoaded.value = true
}

const handleAvatarLoad = () => {
  nextTick(() => {
    isAvatarLoaded.value = true
  })
}

const getRoleTitle = (roleValue) => {
  return roleNames[roleValue] || '未知'
}

// 獲取用戶 RBAC 角色
const loadUserRbacRoles = async () => {
  if (!user.isLogin) return

  try {
    const result = await permissionStore.getUserRoles(user._id)
    userRbacRoles.value = result || []
  } catch (error) {
    console.error('載入用戶角色失敗:', error)
    userRbacRoles.value = []
  }
}

// 顯示角色資訊的函數
const getDisplayRole = () => {
  if (userRbacRoles.value.length === 0) {
    // 如果沒有 RBAC 角色，回退到舊的 role 系統
    return getRoleTitle(user.role) || '未知'
  }

  if (userRbacRoles.value.length === 1) {
    return userRbacRoles.value[0].role?.name || '未知角色'
  }

  // 多個角色時，根據 level 排序，顯示權重最高的角色
  const sortedRoles = userRbacRoles.value.sort((a, b) => {
    const levelA = a.role?.level || 0
    const levelB = b.role?.level || 0

    // 先按 level 排序（降序）
    if (levelA !== levelB) {
      return levelB - levelA
    }

    // 如果 level 相同，按角色名稱排序（升序）
    const nameA = a.role?.name || ''
    const nameB = b.role?.name || ''
    return nameA.localeCompare(nameB)
  })

  return sortedRoles[0].role?.name || '未知角色'
}


const getBackgroundImage = () => {
  if (user.backgroundImage) {
    return user.backgroundImage
  }
  // 預設背景圖片
  return 'https://eip.ystravel.com.tw/uploads/card-bg/bg_profile_flame.png'
}

// 是否具備任一團隊管理者身分
const canCreateProject = computed(() => {
  const teams = teamStore.teams || []
  return teams.some(t => t?.managers?.some(m => m._id === user._id))
})

// 檢查用戶是否可以管理該專案的顏色
const canManageProjectColor = (project) => {
  // 如果用戶有 PROJECT_AND_TASK_MANAGE 權限，可以管理任何專案
  if (permissionStore.hasPermission('PROJECT_AND_TASK_MANAGE')) {
    return true
  }

  // 檢查用戶是否為該專案所屬團隊的管理者
  if (project.team?.managers) {
    return project.team.managers.some(manager => manager._id === user._id)
  }

  return false
}

// 動態控制 mx-2 的類別 - 在 rail 狀態下不使用 mx-2
// const titleItemClass = computed(() => {
//   const baseClasses = 'mx-1 ps-3 mt-2 rounded-lg'
//   return rail.value ? baseClasses : `${baseClasses} mx-2`
// })

// 已加星號的專案列表
const favoriteProjects = computed(() => {
  // 優先使用 project store 中的最新資料，如果沒有則使用 userProjects
  const projects = projectStore.projects.length > 0 ? projectStore.projects : userProjects.value
  return projects.filter(project => {
    // 檢查專案所屬的團隊是否包含當前用戶
    const isTeamMember = project.team?.members?.some(member => member._id === user._id)
    if (!isTeamMember) return false

    // 排除已完成的專案
    if (project.status === 'completed') return false

    // 檢查是否被當前用戶收藏 - 修復 fav.user._id 可能為 undefined 的問題
    return project.favorites?.some(fav => {
      // 如果 fav.user 是字串，直接比較
      if (typeof fav.user === 'string') {
        return fav.user === user._id
      }
      // 如果 fav.user 是物件，比較 _id
      return fav.user?._id === user._id
    })
  })
})

// 已加星號專案不設定上限
const displayedFavoriteProjects = computed(() => {
  return favoriteProjects.value
})

// 限制顯示的專案數量（最多10個，排除已加星號的專案）
const displayedProjects = computed(() => {
  // 優先使用 project store 中的最新資料，如果沒有則使用 userProjects
  const projects = projectStore.projects.length > 0 ? projectStore.projects : userProjects.value
  const nonFavoriteProjects = projects.filter(project => {
    // 檢查專案所屬的團隊是否包含當前用戶
    const isTeamMember = project.team?.members?.some(member => member._id === user._id)
    if (!isTeamMember) return false

    // 排除已完成的專案
    if (project.status === 'completed') return false

    // 排除已加星號的專案 - 修復 fav.user._id 可能為 undefined 的問題
    return !project.favorites?.some(fav => {
      // 如果 fav.user 是字串，直接比較
      if (typeof fav.user === 'string') {
        return fav.user === user._id
      }
      // 如果 fav.user 是物件，比較 _id
      return fav.user?._id === user._id
    })
  })
  return nonFavoriteProjects.slice(0, 10)
})

// 限制顯示的團隊數量（最多10個）
const displayedTeams = computed(() => {
  return teamStore.getUserTeams(user._id).slice(0, 10)
})

// 顏色選項
const colorOptions = [
  { title: '紅色', value: 'red-accent-3' },
  { title: '粉色', value: 'pink-accent-2' },
  { title: '紫色', value: 'purple-accent-1' },
  { title: '深紫', value: 'deep-purple-accent-1' },
  { title: '靛藍', value: 'indigo-accent-2' },
  { title: '藍色', value: '#92a9d1' },
  { title: '淺藍', value: 'light-blue-accent-3' },
  { title: '青色', value: '#46b5ac' },
  { title: '青綠', value: 'teal-accent-2' },
  { title: '綠色', value: 'green-accent-3' },
  { title: '翠綠', value: '#009572' },
  { title: '黃色', value: '#efbf59' },
  { title: '深橙', value: 'deep-orange-accent-3' }
]


// 控制抽屜展開的函數
const toggleDrawer = () => {
  if (!mdAndUp.value) {
    // SM 以下，切換 mdDrawer
    mdDrawer.value = !mdDrawer.value
  } else {
    // SM 以上，切換 rail 狀態
    rail.value = !rail.value
  }
}

// 監聽螢幕尺寸變化
watch(() => breakpoint.value, () => {
  if (lgAndUp.value) {
    // XL 以上，預設展開
    rail.value = false
  } else if (mdAndUp.value) {
    // SM 到 XL 之間，預設收合（只顯示圖示）
    rail.value = true
  }
}, { immediate: true })

// 監聽 openedGroups 變化並保存到 localStorage
watch(openedGroups, () => {
  saveOpenedGroups()
}, { deep: true })

// 根據當前路由更新選中的項目
const updateSelectedItem = () => {
  const currentPath = route.path

  // 首頁
  if (currentPath === '/projectAndTaskManagement') {
    selectedItem.value = ['home']
    return
  }

  // 專案頁面
  if (currentPath.startsWith('/projectAndTaskManagement/projects/')) {
    const projectId = currentPath.split('/').pop()
    // 檢查是否為已加星號的專案
    const favoriteProject = favoriteProjects.value.find(p => p._id === projectId)
    if (favoriteProject) {
      selectedItem.value = [`favorite-${projectId}`]
    } else {
      selectedItem.value = [`project-${projectId}`]
    }
    return
  }

  // 團隊頁面
  if (currentPath.startsWith('/projectAndTaskManagement/teams/')) {
    const teamId = currentPath.split('/').pop()
    selectedItem.value = [`team-${teamId}`]
    return
  }

  // 我的專案頁面
  if (currentPath === '/projectAndTaskManagement/projects') {
    selectedItem.value = ['my-projects']
    return
  }

  // 我的團隊頁面
  if (currentPath === '/projectAndTaskManagement/teams') {
    selectedItem.value = ['my-teams']
    return
  }


  // 預設清空選中項目
  selectedItem.value = []
}

// 監聽路由變化
watch(() => route.path, () => {
  updateSelectedItem()
}, { immediate: true })

// 調色盤按鈕顯示邏輯
let colorButtonTimer = null
let isInitialized = false

// 清除定時器的函數
const clearColorButtonTimer = () => {
  if (colorButtonTimer) {
    clearTimeout(colorButtonTimer)
    colorButtonTimer = null
  }
}

// 更新調色盤按鈕顯示狀態的函數
const updateColorButtonVisibility = (immediate = false) => {
  clearColorButtonTimer()

  if (!mdAndUp.value) {
    // 小螢幕：根據 mdDrawer 狀態決定
    if (immediate || !isInitialized) {
      showColorButton.value = mdDrawer.value
    } else {
      if (mdDrawer.value) {
        // 小螢幕側邊欄開啟時，延遲 0.1 秒後顯示按鈕
        colorButtonTimer = setTimeout(() => {
          showColorButton.value = true
        }, 100)
      } else {
        // 小螢幕側邊欄關閉時，立即隱藏按鈕
        showColorButton.value = false
      }
    }
  } else {
    // 大螢幕：根據 rail 狀態決定
    if (immediate || !isInitialized) {
      showColorButton.value = !rail.value
    } else {
      if (!rail.value) {
        // 非 rail 狀態時，延遲 0.1 秒後顯示按鈕
        colorButtonTimer = setTimeout(() => {
          showColorButton.value = true
        }, 100)
      } else {
        // rail 狀態時，立即隱藏按鈕
        showColorButton.value = false
      }
    }
  }
}

// 監聽 rail 狀態變化，控制調色盤按鈕的顯示
watch(rail, () => {
  updateColorButtonVisibility()
})

// 監聽小螢幕側邊欄狀態變化，控制調色盤按鈕的顯示
watch(mdDrawer, () => {
  updateColorButtonVisibility()
})

// 監聽螢幕尺寸變化，重新計算調色盤按鈕顯示狀態
watch(() => breakpoint.value, () => {
  updateColorButtonVisibility() // 螢幕尺寸變化時也使用延遲邏輯
})

// 組件掛載時設置初始狀態
onMounted(async () => {
  // 載入展開狀態
  loadOpenedGroups()

  if (lgAndUp.value) {
    rail.value = false // XL 以上，預設展開
  } else if (mdAndUp.value) {
    rail.value = true // SM 到 XL 之間，預設收合
  }

  // 初始化時立即設置調色盤按鈕顯示狀態（不使用延遲）
  updateColorButtonVisibility(true)

  // 標記為已初始化，後續狀態變化將使用延遲邏輯
  isInitialized = true

  // 載入用戶 RBAC 角色
  await loadUserRbacRoles()

  // 載入用戶團隊和專案
  if (user.isLogin) {
    fetchUserTeams()
    fetchUserProjects()
  }
})

// 開啟新增團隊對話框
const openCreateTeamDialog = () => {
  createTeamDialog.value = true
}

// 開啟新增專案對話框
const openCreateProjectDialog = () => {
  createProjectDialog.value = true
}

// 載入用戶所屬的團隊
const fetchUserTeams = async () => {
  try {
    const { data } = await apiAuth.get('/teams/my-teams')
    if (data.success) {
      // 將用戶的團隊存到 store 中
      teamStore.setTeams(data.data)
    }
  } catch (error) {
    console.error('載入用戶團隊失敗:', error)
  }
}

// 載入用戶所屬的專案
const fetchUserProjects = async () => {
  try {
    const { data } = await apiAuth.get('/projects')
    if (data.success) {
      // 將所有專案存到 project store 中
      projectStore.setProjects(data.data)

      // 過濾出包含當前用戶的專案（通過團隊成員身份）
      userProjects.value = data.data.filter(project => {
        // 檢查專案所屬的團隊是否包含當前用戶
        const isTeamMember = project.team?.members?.some(member => member._id === user._id)
        return isTeamMember
      })
    }
  } catch (error) {
    console.error('載入用戶專案失敗:', error)
  }
}

// 處理團隊建立完成
const handleTeamCreated = (team) => {
  console.log('團隊建立成功:', team)
  // 將新團隊添加到 store
  teamStore.addTeam(team)
}

// 處理專案建立完成
const handleProjectCreated = (project) => {
  console.log('專案建立成功:', project)
  // 直接將新專案添加到 store 中
  projectStore.addProject(project)
  // 重新載入專案列表以確保數據同步
  fetchUserProjects()
}

// 更新專案顏色
const updateProjectColor = async (projectId, color) => {
  try {
    // 當 color 為 undefined 時，傳送 null 給後端（後端會轉換為 'white'）
    const updateData = color ? { iconColor: color } : { iconColor: null }
    const { data } = await apiAuth.put(`/projects/${projectId}`, updateData)

    if (data.success) {
      // 更新專案 store 中的完整資料
      projectStore.updateProject(projectId, data.data)

      // 更新本地專案列表中的顏色
      const project = userProjects.value.find(p => p._id === projectId)
      if (project) {
        // 直接使用後端返回的顏色值
        project.iconColor = data.data.iconColor
        // 同時更新收藏狀態
        project.favorites = data.data.favorites
      }
    }
  } catch (error) {
    console.error('更新專案顏色失敗:', error)
  }
}

// 側邊欄寬度調整功能
const startResize = (event) => {
  isResizing.value = true
  startX.value = event.clientX
  startWidth.value = drawerWidth.value

  // 添加 body 類別來防止文字選擇
  document.body.classList.add('resizing')

  document.addEventListener('mousemove', resizeDrawer)
  document.addEventListener('mouseup', stopResize)
  event.preventDefault()
}

const resizeDrawer = (event) => {
  if (isResizing.value) {
    // 取消之前的動畫幀
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
    }

    // 使用 requestAnimationFrame 確保平滑更新
    animationFrameId = requestAnimationFrame(() => {
      const deltaX = event.clientX - startX.value
      const newWidth = startWidth.value + deltaX

      // 設定最小和最大寬度限制
      drawerWidth.value = Math.max(200, Math.min(500, newWidth))
    })
  }
}

const stopResize = () => {
  isResizing.value = false

  // 取消任何待處理的動畫幀
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }

  // 移除 body 類別
  document.body.classList.remove('resizing')

  document.removeEventListener('mousemove', resizeDrawer)
  document.removeEventListener('mouseup', stopResize)
}

// 監聽 avatar 變化時重置 loading 狀態
watch(() => user.avatar, (newAvatar) => {
  if (newAvatar) {
    isAvatarLoaded.value = false
    const img = new Image()
    img.onload = () => {
      nextTick(() => {
        handleAvatarLoad()
      })
    }
    img.onerror = () => {
      nextTick(() => {
        handleAvatarLoad()
      })
    }
    img.src = newAvatar
  } else {
    // 沒有頭像時，直接設置為已載入
    isAvatarLoaded.value = true
  }
}, { immediate: true })
</script>
<style scoped lang="scss">
@use '../styles/rwd' as rwd;


.v-main {
  background-color: #fff;
}

.project-and-task-title {
  margin-left: 8px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 2px;
  color: #333;

}
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

@include rwd.sm {
  .project-and-task-title {
    font-size: 20px;
  }
}

@include rwd.md {
  .project-and-task-title {
    font-size: 24px;
  }
}

.cursor-pointer {
  cursor: pointer;
}

.project-item-container {
  position: relative;
  display: flex;
  align-items: center;
}

.project-list-item {
  flex: 1;
}

.color-button-container {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
}

/* 當 v-list-item 被選中時，讓按鈕容器也有相同的背景色 */
.project-item-container:has(.v-list-item--active) .color-button-container {
  background-color: rgba(var(--v-theme-on-surface), 0.01);
  border-radius: 4px;
  padding: 2px;
}

/* 覆蓋 Vuetify 預設的未選中狀態透明度，讓所有 v-list-item 保持正常顏色 */
.v-navigation-drawer .v-list-item:not(.v-list-item--active) {
  opacity: 1 !important;
}

.v-navigation-drawer .v-list-item:not(.v-list-item--active) .v-list-item-title {
  opacity: 1 !important;
  color: white !important;
}

.v-navigation-drawer .v-list-item:not(.v-list-item--active) .v-icon {
  opacity: 1 !important;
}

/* 確保選中的項目有明顯的視覺區別 */
.v-navigation-drawer .v-list-item--active {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.v-navigation-drawer .v-list-item--active .v-list-item-title {
  color: white !important;
  font-weight: 500;
}

/* 覆蓋 v-list-group activator 的 active 狀態，讓它們保持正常外觀 */
.v-navigation-drawer .v-list-group .v-list-item--active {
  background-color: transparent !important;
}

.v-navigation-drawer .v-list-group .v-list-item--active .v-list-item-title {
  color: white !important;
  font-weight: normal !important;
}

/* 可拖曳調整寬度的樣式 */
.resize-handle {
  position: absolute;
  top: 0;
  right: 0;
  width: 4px;
  height: 100%;
  cursor: ew-resize;
  background-color: transparent;
  z-index: 10;
  transition: background-color 0.2s ease;
  /* 優化拖曳性能 */
  will-change: background-color;
}

.resize-handle:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.resize-handle:active {
  background-color: rgba(255, 255, 255, 0.2);
}

/* 當正在調整大小時，防止文字選擇並優化性能 */
body.resizing {
  user-select: none;
  cursor: ew-resize !important;
}

/* 拖曳時禁用側邊欄的過渡動畫 */
.v-navigation-drawer.resizing {
  transition: none !important;
}

/* 優化拖曳時的渲染性能 */
.v-navigation-drawer {
  will-change: width;
}

/* 名片卡片樣式 */
.card-bg {
  background-size: cover;
  transition: opacity 0.3s ease;
  &::before{
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, rgba(0, 0, 0, 0.55) 10% , rgba(0, 0, 0, 0));
    z-index: -1;
  }
}
</style>
