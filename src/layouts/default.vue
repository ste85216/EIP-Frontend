<!-- default layout -->
<template>
  <v-app>
    <v-app-bar
      elevation="0"
      border="b-sm"
      height="100"
      class="position-fixed"
    >
      <v-app-bar-nav-icon
        class="ms-3 me-1"
        size="36"
        color="grey-darken-3"
        @click.stop="toggleDrawer"
      />
      <router-link
        to="/"
        class="d-flex align-center text-decoration-none text-grey-darken-4"
      >
        <v-img
          src="/src/assets/image/Ys_favicon.png"
          :width="smAndUp ? 44 : 36"
          style="margin-left: 2px;"
        />
        <span class="nav-title">永信生活旅遊事業</span>
      </router-link>
      <v-spacer />
      <!-- 收件匣按鈕 -->
      <NotificationInbox
        v-if="user.isLogin"
        filter-type="non-task"
        button-color="#333"
        :outline-icon="true"
      />
      <v-btn
        v-if="user.isLogin && mdAndUp"
        prepend-icon="mdi-account-arrow-right"
        variant="outlined"
        rounded="0"
        color="blue-grey-darken-2"
        class="me-6 ms-4"
        @click="logout"
      >
        登出
      </v-btn>
    </v-app-bar>

    <v-navigation-drawer
      v-if="mdAndUp"
      v-model="drawer"
      :rail="rail"
      permanent
      :expand-on-hover="rail"
      class="position-fixed border-0 drawer-wrapper"
      @mouseenter="railHovering = true"
      @mouseleave="railHovering = false"
    >
      <!-- 固定區域：名片和 Tab -->
      <div class="drawer-fixed-header">
        <template v-if="!rail">
          <v-card
            v-tooltip="'個人資料管理'"
            elevation="0"
            rounded="0"
            height="172"
            width="260"
            class="pa-0 card-bg position-relative"
            :class="{ 'loaded': isBackgroundLoaded }"
            :style="{ backgroundImage: `url(${getBackgroundImage()})` }"
            to="/profile"
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
                <v-avatar
                  size="48"
                  style="box-shadow: 0 0 10px rgba(255,255,255,1);"
                  :color="isAvatarLoaded && (!user.avatar || isDefaultAvatar(user.avatar)) ? getUserAvatarColor() : undefined"
                >
                  <v-skeleton-loader
                    v-if="!isAvatarLoaded"
                    type="avatar"
                  />
                  <v-img
                    v-show="isAvatarLoaded && user.avatar && !isDefaultAvatar(user.avatar)"
                    :src="user.avatar"
                    @load="handleAvatarLoad"
                  />
                  <span
                    v-show="isAvatarLoaded && (!user.avatar || isDefaultAvatar(user.avatar))"
                    class="text-white font-weight-bold"
                    style="font-size: 19px;"
                  >
                    {{ getUserInitials() }}
                  </span>
                </v-avatar>
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
          <!-- Tab 切換按鈕 -->
          <div
            v-if="visibleTabs.length > 0"
            class="custom-tabs"
          >
            <button
              v-for="tab in visibleTabs"
              :key="tab.id"
              :class="['tab-button', { active: activeTab === tab.id }]"
              @click="activeTab = tab.id"
            >
              {{ tab.label }}
            </button>
          </div>
        </template>
        <template v-else>
          <v-list-item
            to="/profile"
            color="grey-darken-3"
          >
            <template #prepend>
              <v-icon>mdi-account-circle-outline</v-icon>
            </template>
            <v-list-item-title>個人資料管理</v-list-item-title>
          </v-list-item>
          <!-- rail 展開時的 Tab 切換按鈕 -->
          <div
            v-if="railHovering"
            class="custom-tabs"
          >
            <button
              v-for="tab in visibleTabs"
              :key="tab.id"
              :class="['tab-button', { active: activeTab === tab.id }]"
              @click="activeTab = tab.id"
            >
              {{ tab.label }}
            </button>
          </div>
        </template>
      </div>
      <!-- 可滾動區域：選單項目 -->
      <v-list
        v-model:opened="openedGroups"
        class="drawer-scrollable-menu pt-0"
      >
        <div>
          <!-- Tab 內容 -->
          <template v-if="visibleTabs.length <= 1 || activeTab === 'common'">
            <!-- 常用 Tab -->
            <template
              v-for="item in filteredCommonTabItems"
              :key="item.text"
            >
              <!-- 有子選單的項目 -->
              <v-list-group
                v-if="item.children"
                v-model="openedGroups"
                :value="item.text"
                :persistent="true"
                fluid
              >
                <template #activator="{ props }">
                  <v-list-item
                    v-bind="props"
                    color="grey-darken-3"
                  >
                    <template #prepend>
                      <v-icon>{{ item.icon }}</v-icon>
                    </template>
                    <v-list-item-title>{{ item.text }}</v-list-item-title>
                  </v-list-item>
                </template>
                <v-list-item
                  v-for="child in item.children"
                  :key="child.to"
                  :to="child.to"
                  color="grey-darken-3"
                  base-color="orange-darken-4"
                >
                  <template #prepend>
                    <v-icon>{{ child.icon }}</v-icon>
                  </template>
                  <v-list-item-title>{{ child.text }}</v-list-item-title>
                </v-list-item>
              </v-list-group>
              <!-- 沒有子選單的項目 -->
              <v-list-item
                v-else
                :to="item.to"
                color="grey-darken-3"
              >
                <template #prepend>
                  <v-icon>{{ item.icon }}</v-icon>
                </template>
                <v-list-item-title>{{ item.text }}</v-list-item-title>
              </v-list-item>
            </template>
          </template>

          <template v-if="activeTab === 'application'">
            <!-- 應用 Tab -->
            <template
              v-for="item in filteredApplicationTabItems"
              :key="item.text"
            >
              <v-list-item
                :to="item.to"
                color="grey-darken-3"
              >
                <template #prepend>
                  <v-icon>{{ item.icon }}</v-icon>
                </template>
                <v-list-item-title>{{ item.text }}</v-list-item-title>
              </v-list-item>
            </template>
          </template>

          <template v-if="activeTab === 'business'">
            <!-- 非 rail：顯示小標分組 -->
            <template v-if="!rail">
              <template v-if="businessSalesItems.length > 0">
                <div class="sub-header ">
                  業務
                </div>
                <template
                  v-for="item in businessSalesItems"
                  :key="item.text"
                >
                  <v-list-item
                    v-if="!item.children"
                    :to="item.to"
                    color="grey-darken-3"
                  >
                    <template #prepend>
                      <v-icon>{{ item.icon }}</v-icon>
                    </template>
                    <v-list-item-title>{{ item.text }}</v-list-item-title>
                  </v-list-item>
                  <v-list-group
                    v-else
                    v-model="openedGroups"
                    :value="item.text"
                    :persistent="true"
                    fluid
                  >
                    <template #activator="{ props }">
                      <v-list-item
                        v-bind="props"
                        color="grey-darken-3"
                      >
                        <template #prepend>
                          <v-icon>{{ item.icon }}</v-icon>
                        </template>
                        <v-list-item-title>{{ item.text }}</v-list-item-title>
                      </v-list-item>
                    </template>
                    <v-list-item
                      v-for="child in item.children"
                      :key="child.to"
                      :to="child.to"
                      color="grey-darken-3"
                      base-color="purple-darken-2"
                    >
                      <template #prepend>
                        <v-icon>{{ child.icon }}</v-icon>
                      </template>
                      <v-list-item-title>{{ child.text }}</v-list-item-title>
                    </v-list-item>
                  </v-list-group>
                </template>
              </template>

              <template v-if="businessMarketingItems.length > 0">
                <div class="sub-header">
                  行銷美編
                </div>
                <template
                  v-for="item in businessMarketingItems"
                  :key="item.text"
                >
                  <v-list-item
                    v-if="!item.children"
                    :to="item.to"
                    color="grey-darken-3"
                  >
                    <template #prepend>
                      <v-icon>{{ item.icon }}</v-icon>
                    </template>
                    <v-list-item-title>{{ item.text }}</v-list-item-title>
                  </v-list-item>
                  <v-list-group
                    v-else
                    v-model="openedGroups"
                    :value="item.text"
                    :persistent="true"
                    fluid
                  >
                    <template #activator="{ props }">
                      <v-list-item
                        v-bind="props"
                        color="grey-darken-3"
                      >
                        <template #prepend>
                          <v-icon>{{ item.icon }}</v-icon>
                        </template>
                        <v-list-item-title>{{ item.text }}</v-list-item-title>
                      </v-list-item>
                    </template>
                    <v-list-item
                      v-for="child in item.children"
                      :key="child.to"
                      :to="child.to"
                      color="grey-darken-3"
                      base-color="purple-darken-2"
                    >
                      <template #prepend>
                        <v-icon>{{ child.icon }}</v-icon>
                      </template>
                      <v-list-item-title>{{ child.text }}</v-list-item-title>
                    </v-list-item>
                  </v-list-group>
                </template>
              </template>

              <template v-if="businessCommonItems.length > 0">
                <div class="sub-header">
                  共用
                </div>
                <template
                  v-for="item in businessCommonItems"
                  :key="item.text"
                >
                  <v-list-item
                    v-if="!item.children"
                    :to="item.to"
                    color="grey-darken-3"
                  >
                    <template #prepend>
                      <v-icon>{{ item.icon }}</v-icon>
                    </template>
                    <v-list-item-title>{{ item.text }}</v-list-item-title>
                  </v-list-item>
                  <v-list-group
                    v-else
                    v-model="openedGroups"
                    :value="item.text"
                    :persistent="true"
                    fluid
                  >
                    <template #activator="{ props }">
                      <v-list-item
                        v-bind="props"
                        color="grey-darken-3"
                      >
                        <template #prepend>
                          <v-icon>{{ item.icon }}</v-icon>
                        </template>
                        <v-list-item-title>{{ item.text }}</v-list-item-title>
                      </v-list-item>
                    </template>
                    <v-list-item
                      v-for="child in item.children"
                      :key="child.to"
                      :to="child.to"
                      color="grey-darken-3"
                      base-color="purple-darken-2"
                    >
                      <template #prepend>
                        <v-icon>{{ child.icon }}</v-icon>
                      </template>
                      <v-list-item-title>{{ child.text }}</v-list-item-title>
                    </v-list-item>
                  </v-list-group>
                </template>
              </template>
            </template>

            <!-- rail：回退為原本平鋪清單（無小標） -->
            <template v-else>
              <template
                v-for="item in filteredBusinessTabItems"
                :key="item.text"
              >
                <v-list-group
                  v-if="item.children"
                  v-model="openedGroups"
                  :value="item.text"
                  :persistent="true"
                  fluid
                >
                  <template #activator="{ props }">
                    <v-list-item
                      v-bind="props"
                      color="grey-darken-3"
                    >
                      <template #prepend>
                        <v-icon>{{ item.icon }}</v-icon>
                      </template>
                      <v-list-item-title>{{ item.text }}</v-list-item-title>
                    </v-list-item>
                  </template>
                  <v-list-item
                    v-for="child in item.children"
                    :key="child.to"
                    :to="child.to"
                    color="grey-darken-3"
                    base-color="purple-darken-2"
                  >
                    <template #prepend>
                      <v-icon>{{ child.icon }}</v-icon>
                    </template>
                    <v-list-item-title>{{ child.text }}</v-list-item-title>
                  </v-list-item>
                </v-list-group>
                <v-list-item
                  v-else
                  :to="item.to"
                  color="grey-darken-3"
                >
                  <template #prepend>
                    <v-icon>{{ item.icon }}</v-icon>
                  </template>
                  <v-list-item-title>{{ item.text }}</v-list-item-title>
                </v-list-item>
              </template>
            </template>
          </template>

          <template v-if="activeTab === 'organization'">
            <!-- 組織 Tab -->
            <template
              v-for="item in filteredOrganizationTabItems"
              :key="item.text"
            >
              <!-- 有子選單的項目 -->
              <v-list-group
                v-if="item.children"
                v-model="openedGroups"
                :value="item.text"
                :persistent="true"
                fluid
              >
                <template #activator="{ props }">
                  <v-list-item
                    v-bind="props"
                    color="grey-darken-3"
                  >
                    <template #prepend>
                      <v-icon>{{ item.icon }}</v-icon>
                    </template>
                    <v-list-item-title>{{ item.text }}</v-list-item-title>
                  </v-list-item>
                </template>
                <v-list-item
                  v-for="child in item.children"
                  :key="child.to"
                  :to="child.to"
                  color="grey-darken-3"
                  base-color="blue-darken-3"
                >
                  <template #prepend>
                    <v-icon>{{ child.icon }}</v-icon>
                  </template>
                  <v-list-item-title>{{ child.text }}</v-list-item-title>
                </v-list-item>
              </v-list-group>
              <!-- 沒有子選單的項目 -->
              <v-list-item
                v-else
                :to="item.to"
                color="grey-darken-3"
              >
                <template #prepend>
                  <v-icon>{{ item.icon }}</v-icon>
                </template>
                <v-list-item-title>{{ item.text }}</v-list-item-title>
              </v-list-item>
            </template>
          </template>

          <template v-if="activeTab === 'system'">
            <!-- 系統 Tab -->
            <template
              v-for="item in filteredSystemTabItems"
              :key="item.text"
            >
              <!-- 有子選單的項目 -->
              <v-list-group
                v-if="item.children"
                v-model="openedGroups"
                :value="item.text"
                :persistent="true"
                fluid
              >
                <template #activator="{ props }">
                  <v-list-item
                    v-bind="props"
                    color="grey-darken-3"
                  >
                    <template #prepend>
                      <v-icon>{{ item.icon }}</v-icon>
                    </template>
                    <v-list-item-title>{{ item.text }}</v-list-item-title>
                  </v-list-item>
                </template>
                <v-list-item
                  v-for="child in item.children"
                  :key="child.to"
                  :to="child.to"
                  color="grey-darken-3"
                  base-color="cyan-darken-3"
                >
                  <template #prepend>
                    <v-icon>{{ child.icon }}</v-icon>
                  </template>
                  <v-list-item-title>{{ child.text }}</v-list-item-title>
                </v-list-item>
              </v-list-group>
              <!-- 沒有子選單的項目 -->
              <v-list-item
                v-else
                :to="item.to"
                color="grey-darken-3"
              >
                <template #prepend>
                  <v-icon>{{ item.icon }}</v-icon>
                </template>
                <v-list-item-title>{{ item.text }}</v-list-item-title>
              </v-list-item>
            </template>
          </template>
        </div>
        <div>
          <v-list-item
            v-if="!user.isLogin"
            to="/login"
          >
            <template #prepend>
              <v-icon>mdi-account-arrow-left</v-icon>
            </template>
            <v-list-item-title>登入</v-list-item-title>
          </v-list-item>
        </div>
      </v-list>
    </v-navigation-drawer>
    <v-navigation-drawer
      v-if="!mdAndUp"
      v-model="mdDrawer"
      border="0"
      class="rounded-be-xl position-fixed drawer-wrapper-mobile"
    >
      <!-- 固定區域：名片 -->
      <div class="drawer-fixed-header-mobile">
        <v-card
          elevation="0"
          rounded="0"
          height="172"
          class="pa-0 card-bg"
          :class="{ 'loaded': isBackgroundLoaded }"
          :style="{ backgroundImage: `url(${getBackgroundImage()})` }"
          to="/profile"
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
      </div>
      <!-- 可滾動區域：選單項目 -->
      <v-list class="drawer-scrollable-menu-mobile pa-0">
        <div>
          <!-- 常用 -->
          <template v-if="filteredCommonTabItems.length > 0">
            <v-list-subheader>常用</v-list-subheader>
            <template
              v-for="item in filteredCommonTabItems"
              :key="item.text"
            >
              <v-list-group
                v-if="item.children"
                v-model="openedGroups"
                :value="item.text"
                :persistent="true"
                fluid
              >
                <template #activator="{ props }">
                  <v-list-item
                    v-bind="props"
                    color="grey-darken-3"
                  >
                    <template #prepend>
                      <v-icon>{{ item.icon }}</v-icon>
                    </template>
                    <v-list-item-title>{{ item.text }}</v-list-item-title>
                  </v-list-item>
                </template>
                <v-list-item
                  v-for="child in item.children"
                  :key="child.to"
                  :to="child.to"
                  color="grey-darken-3"
                  base-color="orange-darken-4"
                >
                  <template #prepend>
                    <v-icon>{{ child.icon }}</v-icon>
                  </template>
                  <v-list-item-title>{{ child.text }}</v-list-item-title>
                </v-list-item>
              </v-list-group>
              <v-list-item
                v-else
                :to="item.to"
                color="grey-darken-3"
              >
                <template #prepend>
                  <v-icon>{{ item.icon }}</v-icon>
                </template>
                <v-list-item-title>{{ item.text }}</v-list-item-title>
              </v-list-item>
            </template>
          </template>

          <!-- 應用 -->
          <template v-if="filteredApplicationTabItems.length > 0">
            <v-list-subheader>應用</v-list-subheader>
            <template
              v-for="item in filteredApplicationTabItems"
              :key="item.text"
            >
              <v-list-item
                :to="item.to"
                color="grey-darken-3"
              >
                <template #prepend>
                  <v-icon>{{ item.icon }}</v-icon>
                </template>
                <v-list-item-title>{{ item.text }}</v-list-item-title>
              </v-list-item>
            </template>
          </template>

          <!-- 業務 -->
          <template v-if="filteredBusinessTabItems.length > 0">
            <v-list-subheader>業務</v-list-subheader>
            <template
              v-for="item in filteredBusinessTabItems"
              :key="item.text"
            >
              <v-list-group
                v-if="item.children"
                v-model="openedGroups"
                :value="item.text"
                :persistent="true"
                fluid
              >
                <template #activator="{ props }">
                  <v-list-item
                    v-bind="props"
                    color="grey-darken-3"
                  >
                    <template #prepend>
                      <v-icon>{{ item.icon }}</v-icon>
                    </template>
                    <v-list-item-title>{{ item.text }}</v-list-item-title>
                  </v-list-item>
                </template>
                <v-list-item
                  v-for="child in item.children"
                  :key="child.to"
                  :to="child.to"
                  color="grey-darken-3"
                  base-color="green-darken-2"
                >
                  <template #prepend>
                    <v-icon>{{ child.icon }}</v-icon>
                  </template>
                  <v-list-item-title>{{ child.text }}</v-list-item-title>
                </v-list-item>
              </v-list-group>
              <v-list-item
                v-else
                :to="item.to"
                color="grey-darken-3"
              >
                <template #prepend>
                  <v-icon>{{ item.icon }}</v-icon>
                </template>
                <v-list-item-title>{{ item.text }}</v-list-item-title>
              </v-list-item>
            </template>
          </template>

          <!-- 組織 -->
          <template v-if="filteredOrganizationTabItems.length > 0">
            <v-list-subheader>組織</v-list-subheader>
            <template
              v-for="item in filteredOrganizationTabItems"
              :key="item.text"
            >
              <v-list-group
                v-if="item.children"
                v-model="openedGroups"
                :value="item.text"
                :persistent="true"
                fluid
              >
                <template #activator="{ props }">
                  <v-list-item
                    v-bind="props"
                    color="grey-darken-3"
                  >
                    <template #prepend>
                      <v-icon>{{ item.icon }}</v-icon>
                    </template>
                    <v-list-item-title>{{ item.text }}</v-list-item-title>
                  </v-list-item>
                </template>
                <v-list-item
                  v-for="child in item.children"
                  :key="child.to"
                  :to="child.to"
                  color="grey-darken-3"
                  base-color="blue-darken-3"
                >
                  <template #prepend>
                    <v-icon>{{ child.icon }}</v-icon>
                  </template>
                  <v-list-item-title>{{ child.text }}</v-list-item-title>
                </v-list-item>
              </v-list-group>
              <v-list-item
                v-else
                :to="item.to"
                color="grey-darken-3"
              >
                <template #prepend>
                  <v-icon>{{ item.icon }}</v-icon>
                </template>
                <v-list-item-title>{{ item.text }}</v-list-item-title>
              </v-list-item>
            </template>
          </template>

          <!-- 系統 -->
          <template v-if="filteredSystemTabItems.length > 0 && user.isLogin">
            <v-list-subheader>系統</v-list-subheader>
            <template
              v-for="item in filteredSystemTabItems"
              :key="item.text"
            >
              <v-list-group
                v-if="item.children"
                v-model="openedGroups"
                :value="item.text"
                :persistent="true"
                fluid
              >
                <template #activator="{ props }">
                  <v-list-item
                    v-bind="props"
                    color="grey-darken-3"
                  >
                    <template #prepend>
                      <v-icon>{{ item.icon }}</v-icon>
                    </template>
                    <v-list-item-title>{{ item.text }}</v-list-item-title>
                  </v-list-item>
                </template>
                <v-list-item
                  v-for="child in item.children"
                  :key="child.to"
                  :to="child.to"
                  color="grey-darken-3"
                  base-color="cyan-darken-3"
                >
                  <template #prepend>
                    <v-icon>{{ child.icon }}</v-icon>
                  </template>
                  <v-list-item-title>{{ child.text }}</v-list-item-title>
                </v-list-item>
              </v-list-group>
              <v-list-item
                v-else
                :to="item.to"
                color="grey-darken-3"
              >
                <template #prepend>
                  <v-icon>{{ item.icon }}</v-icon>
                </template>
                <v-list-item-title>{{ item.text }}</v-list-item-title>
              </v-list-item>
            </template>
          </template>
        </div>
        <div>
          <v-list-item
            v-if="!user.isLogin"
            to="/login"
          >
            <template #prepend>
              <v-icon>mdi-account-arrow-left</v-icon>
            </template>
            <v-list-item-title>登入</v-list-item-title>
          </v-list-item>
        </div>
        <v-divider
          v-if="mdAndUp"
          class="mt-4 mb-2"
          color="grey-darken-3"
          opacity="0.3"
        />
        <div>
          <v-list-item
            v-if="user.isLogin"
            class="mt-4"
            color="grey-darken-3"
            @click="logout"
          >
            <template #prepend>
              <v-icon>mdi-account-arrow-right</v-icon>
            </template>
            <v-list-item-title>登出</v-list-item-title>
          </v-list-item>
        </div>
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <MarqueeBar />
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, watch, onMounted, computed, nextTick } from 'vue'
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'
import { useRouter, useRoute } from 'vue-router'
import { useSnackbar } from 'vuetify-use-dialog'
import { useDisplay } from 'vuetify'
import { roleNames } from '@/enums/UserRole'
import UserAvatar from '@/components/UserAvatar.vue'
import MarqueeBar from '@/components/MarqueeBar.vue'
import NotificationInbox from '@/components/NotificationInbox.vue'

const { smAndUp, mdAndUp, lgAndUp, name: breakpoint } = useDisplay()

const drawer = ref(true)
const mdDrawer = ref(false)
const rail = ref(false)
const user = useUserStore()
const permissionStore = usePermissionStore()
const createSnackbar = useSnackbar()
const router = useRouter()
const route = useRoute()

const openedGroups = ref([]) // 初始值改為空數組
const isBackgroundLoaded = ref(false)
const isAvatarLoaded = ref(false)
const userRbacRoles = ref([]) // 用戶的 RBAC 角色
const activeTab = ref('common') // 當前活躍的Tab
const railHovering = ref(false) // rail 模式下的展開狀態
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

// 檢查是否為預設頭像
const isDefaultAvatar = (avatarUrl) => {
  if (!avatarUrl) return true
  const lower = String(avatarUrl).toLowerCase()
  return (
    lower.includes('avatar_purple_robot') ||
    lower.includes('avatar_robot') ||
    lower.includes('orange_robot')
  )
}

// 獲取用戶頭像顏色
const getUserAvatarColor = () => {
  if (!user.name || !isAvatarLoaded.value) return 'grey'

  // 顏色列表
  const colors = [
    'red',
    'pink',
    'purple',
    'deep-purple',
    'indigo',
    'blue',
    'light-blue',
    'cyan',
    'teal',
    'green-darken-1',
    'amber-darken-1',
    'orange',
    'deep-orange',
    'brown',
    'blue-grey'
  ]

  // 根據姓名的字符碼總和來選擇顏色
  let hash = 0
  for (let i = 0; i < user.name.length; i++) {
    hash = user.name.charCodeAt(i) + ((hash << 5) - hash)
  }

  const colorIndex = Math.abs(hash) % colors.length
  return colors[colorIndex]
}

// 獲取用戶姓名縮寫
const getUserInitials = () => {
  if (!user.name) return '??'
  // 移除空格並取前兩個字
  const cleanName = user.name.replace(/\s/g, '')
  return cleanName.substring(0, 2).toUpperCase()
}

const getBackgroundImage = () => {
  if (user.backgroundImage) {
    return user.backgroundImage
  }
  // 預設背景圖片
  return 'https://eip.ystravel.com.tw/uploads/card-bg/bg_profile_flame.png'
}

// Tab 定義
const tabs = [
  { id: 'common', label: '常用' },
  { id: 'application', label: '應用' },
  { id: 'business', label: '營運' },
  { id: 'organization', label: '組織' },
  { id: 'system', label: '系統' }
]

// 常用 Tab 選單
const commonTabItems = [
  {
    to: '/',
    text: '首頁',
    icon: 'mdi-home',
    permission: 'HOME_READ'
  },
  {
    to: '/extensionList',
    text: '分機表',
    icon: 'mdi-phone-outline',
    permission: 'EXTENSION_LIST_READ'
  },
  {
    to: '/announcement',
    text: '所有公告',
    icon: 'mdi-bullhorn',
    permission: 'ANNOUNCEMENT_PAGE_READ'
  },
  {
    text: '申請相關',
    icon: 'mdi-file-document-outline',
    permission: ['MARKETING_DESIGN_REQUEST_PAGE_READ'],
    children: [
      {
        to: '/marketingDesignRequest',
        text: '行銷美編需求申請',
        icon: 'mdi-form-select',
        permission: 'MARKETING_DESIGN_REQUEST_PAGE_READ'
      }
    ]
  }
]

// 應用 Tab 選單
const applicationTabItems = [
  {
    to: '/projectAndTaskManagement',
    text: '專案與任務管理',
    icon: 'mdi-chart-box-outline',
    permission: 'PROJECT_AND_TASK_MANAGEMENT_READ'
  }
]

// 業務 Tab 選單
const businessTabItems = [
  {
    to: '/B2CStatistics',
    text: '直客詢問統計表',
    icon: 'mdi-account-question',
    permission: 'B2C_STATISTICS_READ'
  },
  {
    to: '/marketingAnalysis',
    text: '行銷費用分析',
    icon: 'mdi-chart-multiple',
    permission: 'MARKETING_ANALYSIS_READ'
  },
  {
    text: '行銷費用管理',
    icon: 'mdi-chart-bar',
    permission: ['MARKETING_EXPENSE_MANAGEMENT_READ', 'MARKETING_BUDGET_MANAGEMENT_READ', 'MARKETING_CATEGORY_MANAGEMENT_READ'],
    children: [
      {
        to: '/marketingExpenseManagement',
        text: '實際支出管理',
        icon: 'mdi-cash-100',
        permission: 'MARKETING_EXPENSE_MANAGEMENT_READ'
      },
      {
        to: '/marketingBudgetManagement',
        text: '行銷預算管理',
        icon: 'mdi-table-edit',
        permission: 'MARKETING_BUDGET_MANAGEMENT_READ'
      },
      {
        to: '/marketingCategoryManagement',
        text: '行銷分類管理',
        icon: 'mdi-shape-plus-outline',
        permission: 'MARKETING_CATEGORY_MANAGEMENT_READ'
      }
    ]
  },
  {
    to: '/B2CStatisticsManagement',
    text: '直客詢問管理',
    icon: 'mdi-account-question',
    permission: 'B2C_STATISTICS_MANAGEMENT_READ'
  },
  {
    to: '/marketingDesignRequestManagement',
    text: '行銷美編需求申請管理',
    icon: 'mdi-form-select',
    permission: 'MARKETING_DESIGN_REQUEST_MANAGEMENT_READ'
  },
  {
    to: '/formGenerator',
    text: '表單產生器',
    icon: 'mdi-list-box-outline',
    permission: 'FORM_GENERATOR_READ'
  },
  {
    to: '/lineCategoryManagement',
    text: '線別分類管理',
    icon: 'mdi-shape-plus-outline',
    permission: 'LINE_CATEGORY_MANAGEMENT_READ'
  },
  {
    text: '備品相關',
    icon: 'mdi-package-variant',
    permission: ['SPARE_PART_MANAGEMENT_READ', 'SPARE_PART_INVENTORY_MANAGEMENT_READ'],
    children: [
      {
        to: '/sparePartInventoryManagement',
        text: '備品庫存管理',
        icon: 'mdi-package-variant-closed-check',
        permission: 'SPARE_PART_INVENTORY_MANAGEMENT_READ'
      },
      {
        to: '/sparePartManagement',
        text: '備品管理',
        icon: 'mdi-package-variant-closed-plus',
        permission: 'SPARE_PART_MANAGEMENT_READ'
      }
    ]
  }
]

// 組織 Tab 選單
const organizationTabItems = [
{
    to: '/employeeList',
    text: '公司員工列表',
    icon: 'mdi-account-details',
    permission: 'EMPLOYEE_LIST_READ'
  },
  {
    text: '人事管理',
    icon: 'mdi-account-group',
    permission: ['EMPLOYEE_MANAGE_READ', 'COMPANY_AND_DEPARTMENT_MANAGEMENT_READ'],
    children: [
      {
        to: '/employeeManagement',
        text: '員工管理',
        icon: 'mdi-account-cog',
        permission: 'EMPLOYEE_MANAGEMENT_READ'
      },
      {
        to: '/companyAndDepartmentManagement',
        text: '公司部門管理',
        icon: 'mdi-office-building-cog',
        permission: 'COMPANY_AND_DEPARTMENT_MANAGEMENT_READ'
      }
    ]
  },
  {
    text: '硬體管理',
    icon: 'mdi-server-network-outline',
    permission: ['HARDWARE_DEVICE_MANAGEMENT_READ', 'HARDWARE_MAINTENANCE_RECORD_PAGE_READ', 'HARDWARE_CATEGORY_MANAGEMENT_READ'],
    children: [
      {
        to: '/hardwareDeviceManagement',
        text: '硬體設備管理',
        icon: 'mdi-server-outline',
        permission: 'HARDWARE_DEVICE_MANAGEMENT_READ'
      },
      {
        to: '/hardwareMaintenanceRecord',
        text: '硬體維修記錄',
        icon: 'mdi-wrench',
        permission: 'HARDWARE_MAINTENANCE_RECORD_PAGE_READ'
      },
      {
        to: '/hardwareCategoryManagement',
        text: '硬體類型管理',
        icon: 'mdi-shape-plus-outline',
        permission: 'HARDWARE_CATEGORY_MANAGEMENT_READ'
      }
    ]
  }
]

// 系統 Tab 選單
const systemTabItems = [
  {
    to: '/user',
    text: '用戶管理',
    icon: 'mdi-account-cog',
    permission: 'USER_MANAGEMENT_READ'
  },
  {
    to: '/permissionManagement',
    text: '權限管理',
    icon: 'mdi-shield-account',
    permission: 'PERMISSION_MANAGEMENT_READ'
  },
  {
    text: '網站設定',
    icon: 'mdi-cog-outline',
    permission: ['CAROUSEL_READ', 'ANNOUNCEMENT_READ', 'MARQUEE_MANAGEMENT_READ', 'SHARED_RESOURCE_MANAGEMENT_READ'],
    children: [
      {
        to: '/announcementManagement',
        text: '公告管理',
        icon: 'mdi-bullhorn',
        permission: 'ANNOUNCEMENT_READ'
      },
      {
        to: '/marqueeManagement',
        text: '跑馬燈管理',
        icon: 'mdi-bullhorn-outline',
        permission: 'MARQUEE_MANAGEMENT_READ'
      },
      {
        to: '/carouselManagement',
        text: '輪播圖管理',
        icon: 'mdi-image-multiple',
        permission: 'CAROUSEL_READ'
      },
      {
        to: '/sharedResourceManagement',
        text: '共享資源管理',
        icon: 'mdi-share-all',
        permission: 'SHARED_RESOURCE_MANAGEMENT_READ'
      }
    ]
  },
  {
    to: '/auditLog',
    text: '異動紀錄',
    icon: 'mdi-history',
    permission: 'AUDIT_LOG_PAGE_READ'
  }
]
// 通用的選單過濾函數
const filterMenuItems = (items) => {
  return items.filter(item => {
    // 有子項目：只要任一子項目可見，就顯示父項
    if (item.children) {
      item.children = item.children.filter(child => {
        return Array.isArray(child.permission)
          ? permissionStore.hasAnyPermission(child.permission)
          : permissionStore.hasPermission(child.permission)
      })
      return item.children.length > 0
    }

    // 沒有子項目：檢查自身權限
    return Array.isArray(item.permission)
      ? permissionStore.hasAnyPermission(item.permission)
      : permissionStore.hasPermission(item.permission)
  })
}

// 各 Tab 選單過濾
const filteredCommonTabItems = computed(() => filterMenuItems(commonTabItems))
const filteredApplicationTabItems = computed(() => filterMenuItems(applicationTabItems))
const filteredBusinessTabItems = computed(() => filterMenuItems(businessTabItems))
const filteredOrganizationTabItems = computed(() => filterMenuItems(organizationTabItems))
const filteredSystemTabItems = computed(() => filterMenuItems(systemTabItems))

// 業務 Tab 小標分組（大螢幕使用）
const businessSalesItems = computed(() => {
  return filteredBusinessTabItems.value.filter(item => item.text === '直客詢問統計表')
})

const businessMarketingItems = computed(() => {
  const marketingSet = new Set(['行銷費用分析', '行銷費用管理', '直客詢問管理', '行銷美編需求申請管理'])
  return filteredBusinessTabItems.value.filter(item => marketingSet.has(item.text))
})

const businessCommonItems = computed(() => {
  const commonSet = new Set(['表單產生器', '線別分類管理', '備品相關'])
  return filteredBusinessTabItems.value.filter(item => commonSet.has(item.text))
})

// 檢查 Tab 是否有可見項目
const hasVisibleItems = (items) => {
  return items.some(item => {
    if (item.children) {
      return item.children.some(child => {
        return Array.isArray(child.permission)
          ? permissionStore.hasAnyPermission(child.permission)
          : permissionStore.hasPermission(child.permission)
      })
    }
    return Array.isArray(item.permission)
      ? permissionStore.hasAnyPermission(item.permission)
      : permissionStore.hasPermission(item.permission)
  })
}

// 可見的 Tab 列表（只有當 Tab 下有至少一個項目有權限時才顯示）
const visibleTabs = computed(() => {
  return tabs.filter(tab => {
    switch (tab.id) {
      case 'common':
        return hasVisibleItems(commonTabItems)
      case 'application':
        return hasVisibleItems(applicationTabItems)
      case 'business':
        return hasVisibleItems(businessTabItems)
      case 'organization':
        return hasVisibleItems(organizationTabItems)
      case 'system':
        return hasVisibleItems(systemTabItems)
      default:
        return false
    }
  })
})

// 設置預設 Tab（當只有一個 Tab 可見時，自動選擇它）
watch(visibleTabs, (newTabs) => {
  if (newTabs.length === 1) {
    activeTab.value = newTabs[0].id
  } else if (newTabs.length > 1 && !newTabs.find(tab => tab.id === activeTab.value)) {
    activeTab.value = newTabs[0].id
  }
}, { immediate: true })

// 根據路由自動切換 Tab 並展開對應選單
watch(() => route.path, (newPath) => {
  // 申請相關頁面（常用Tab）
  if (newPath.includes('/marketingDesignRequest') && !newPath.includes('Management')) {
    activeTab.value = 'common'
    if (!openedGroups.value.includes('申請相關')) {
      openedGroups.value.push('申請相關')
    }
  }

  // 專案與任務管理（應用Tab）
  if (newPath.includes('/projectAndTaskManagement')) {
    activeTab.value = 'application'
  }

  // 業務相關頁面（業務Tab）
  if (
    newPath.includes('/B2CStatistics') ||
    newPath.includes('/marketingAnalysis') ||
    newPath.includes('/marketingExpense') ||
    newPath.includes('/marketingBudget') ||
    newPath.includes('/marketingCategory') ||
    newPath.includes('/marketingDesignRequestManagement') ||
    newPath.includes('/formGenerator') ||
    newPath.includes('/lineCategory') ||
    newPath.includes('/sparePart')
  ) {
    activeTab.value = 'business'
    // 展開行銷費用管理
    if (newPath.includes('/marketingExpense') || newPath.includes('/marketingBudget') || newPath.includes('/marketingCategory')) {
      if (!openedGroups.value.includes('行銷費用管理')) {
        openedGroups.value.push('行銷費用管理')
      }
    }
  }

  // 組織相關頁面（組織Tab）
  if (
    newPath.includes('/employeeManagement') ||
    newPath.includes('/companyAndDepartment') ||
    newPath.includes('/employeeList') ||
    newPath.includes('/hardware')
  ) {
    activeTab.value = 'organization'
    // 展開人事管理
    if (newPath.includes('/employeeManagement') || newPath.includes('/companyAndDepartment')) {
      if (!openedGroups.value.includes('人事管理')) {
        openedGroups.value.push('人事管理')
      }
    }
    // 展開硬體管理
    if (newPath.includes('/hardware')) {
      if (!openedGroups.value.includes('硬體管理')) {
        openedGroups.value.push('硬體管理')
      }
    }
  }

  // 系統相關頁面（系統Tab）
  if (
    newPath.includes('/user') ||
    newPath.includes('/permissionManagement') ||
    newPath.includes('/announcementManagement') ||
    newPath.includes('/carouselManagement') ||
    newPath.includes('/marqueeManagement') ||
    newPath.includes('/sharedResourceManagement') ||
    newPath.includes('/auditLog')
  ) {
    activeTab.value = 'system'
    // 展開網站設定
    if (
      newPath.includes('/announcementManagement') ||
      newPath.includes('/carouselManagement') ||
      newPath.includes('/marqueeManagement') ||
      newPath.includes('/sharedResourceManagement')
    ) {
      if (!openedGroups.value.includes('網站設定')) {
        openedGroups.value.push('網站設定')
      }
    }
  }
}, { immediate: true })

// 監聽螢幕尺寸變化
watch(() => breakpoint.value, () => {
  if (lgAndUp.value) {
    // LG 以上，預設展開
    rail.value = false
  } else if (mdAndUp.value) {
    // MD 到 LG 之間，預設收合（只顯示圖示）
    rail.value = true
  }
}, { immediate: true })

// 控制抽屜展開的函數
// 改進的 toggleDrawer 函數
const toggleDrawer = () => {
  if (!mdAndUp.value) {
    // SM 以下，切換 mdDrawer
    mdDrawer.value = !mdDrawer.value
  } else {
    // SM 以上，切換 rail 狀態
    rail.value = !rail.value
  }
}

// 組件掛載時設置初始狀態
onMounted(async () => {
  if (lgAndUp.value) {
    rail.value = false // LG 以上，預設展開
  } else if (mdAndUp.value) {
    rail.value = true // MD 到 LG 之間，預設收合
  }

  // 載入用戶 RBAC 角色
  await loadUserRbacRoles()
})

const logout = async () => {
  await user.logout()
  createSnackbar({
    text: '登出成功',
    snackbarProps: {
      color: 'teal-lighten-1'
    }
  })

  router.push('/login')
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

<style lang="scss" scoped>
@use '@/styles/_rwd' as *;

// 側邊欄容器：使用 flexbox 垂直佈局
.drawer-wrapper {
  display: flex !important;
  flex-direction: column !important;
  height: calc(100vh - 100px) !important;
  overflow: hidden !important;
}

// 覆蓋 Vuetify 的預設樣式
:deep(.v-navigation-drawer__content) {
  display: flex !important;
  flex-direction: column !important;
  height: 100% !important;
  overflow: hidden !important;
}

// 固定區域：名片和 Tab
.drawer-fixed-header {
  flex-shrink: 0;
  z-index: 1;
  background-color: #fff;
}

// 可滾動區域：選單項目
.drawer-scrollable-menu {
  flex: 1;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  min-height: 0;
  max-height: 100%;
}

// 小螢幕側邊欄容器：使用 flexbox 垂直佈局
.drawer-wrapper-mobile {
  display: flex !important;
  flex-direction: column !important;
  height: calc(100vh - 100px) !important;
  overflow: hidden !important;
}

// 覆蓋 Vuetify 的預設樣式（小螢幕）
:deep(.drawer-wrapper-mobile .v-navigation-drawer__content) {
  display: flex !important;
  flex-direction: column !important;
  height: 100% !important;
  overflow: hidden !important;
}

// 固定區域：名片（小螢幕）
.drawer-fixed-header-mobile {
  flex-shrink: 0;
  z-index: 1;
  background-color: #fff;
}

// 可滾動區域：選單項目（小螢幕）
.drawer-scrollable-menu-mobile {
  flex: 1;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  min-height: 0;
  max-height: 100%;
}

.nav-title {
  font-size: 22px;
  font-weight: 600;
  margin-left: 4px;
  letter-spacing: 1px;
  color: #333;
  @include sm {
    margin-left: 6px;
    font-size: 24px;
    letter-spacing: 1.5px;
  }
}

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
    background: linear-gradient(90deg, rgba(0, 0, 0, 0.55) 10%, rgba(0, 0, 0, 0));
    z-index: -1;
  }
}

.custom-tabs {
  display: flex;
  background-color: #fff;
  width: 256px;
  position: relative;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);

  .tab-button {
    width: 20%;
    padding: 6px 8px;
    background: transparent;
    cursor: pointer;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.6);
    transition: all 0.2s ease;
    position: relative;
    line-height: 1.5;
    box-sizing: border-box;
    min-height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;

    &::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      width: 100%;
      height: 2px;
      background: transparent;
      transition: all 0.2s ease;
    }

    &:hover {
      color: rgba(0, 0, 0, 0.87);
      background-color: rgba(0, 0, 0, 0.04);
    }

    &.active {
      color: #0097A7;
      font-weight: 500;

      &::after {
        background: #0097A7;
      }
    }
  }
}

.sub-header {
  height: 32px;
  font-size: 14px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.6);
  line-height: 32px;
  padding-left: 16px;
}
</style>
