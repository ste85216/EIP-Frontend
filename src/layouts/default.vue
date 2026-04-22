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
      <!-- 員工評論提示按鈕 -->
      <EmployeeCommentNotificationButton
        v-if="user.isLogin"
        ref="employeeCommentButtonRef"
        button-color="red"
      />
      <!-- 收件匣按鈕（點擊員工評論通知會開啟員工評論對話框） -->
      <NotificationInbox
        v-if="user.isLogin"
        filter-type="non-task"
        button-color="#333"
        :outline-icon="true"
        @open-employee-comment="handleOpenEmployeeComment"
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
            v-if="visibleTabs.length > 0 && !isSearchMode"
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
          <!-- 搜尋模式 -->
          <template v-if="isSearchMode">
            <!-- 搜尋欄位 -->
            <div class="search-container-in-menu">
              <v-text-field
                ref="searchInputRef"
                v-model="searchQuery"
                density="compact"
                variant="outlined"
                placeholder="搜尋選單項目..."
                prepend-inner-icon="mdi-magnify"
                clearable
                hide-details
                class="search-input"
                autofocus
                @focus="isSearchMode = true"
                @click:clear="clearSearch"
                @blur="handleSearchBlur"
              />
            </div>
            <!-- 搜尋結果 -->
            <v-list-subheader v-if="searchResults.length > 0">
              搜尋結果
            </v-list-subheader>
            <template v-if="searchResults.length > 0">
              <v-list-item
                v-for="(result, index) in searchResults"
                :key="`search-${index}-${result.to}`"
                :to="result.to"
                color="grey-darken-3"
                @click="handleSearchResultClick"
              >
                <template #prepend>
                  <v-icon>{{ result.icon }}</v-icon>
                </template>
                <v-list-item-title>{{ result.text }}</v-list-item-title>
                <template #append>
                  <v-chip
                    size="x-small"
                    variant="text"
                    color="grey-darken-1"
                  >
                    {{ result.tabLabel }}
                  </v-chip>
                </template>
              </v-list-item>
            </template>
            <template v-else-if="searchQuery.trim() !== ''">
              <v-list-item>
                <v-list-item-title class="text-center text-grey">
                  找不到符合的項目
                </v-list-item-title>
              </v-list-item>
            </template>
            <template v-else>
              <v-list-item>
                <v-list-item-title class="sub-title-2 text-center text-grey">
                  輸入關鍵字開始搜尋...
                </v-list-item-title>
              </v-list-item>
            </template>
          </template>
          <!-- Tab 內容 -->
          <template v-else-if="!isSearchMode && (visibleTabs.length <= 1 || activeTab === 'common')">
            <!-- 常用 Tab -->
            <!-- 搜尋按鈕 -->
            <v-list-item
              v-if="visibleTabs.length > 0"
              color="grey-darken-3"
              @click="isSearchMode = true"
            >
              <template #prepend>
                <v-icon>mdi-magnify</v-icon>
              </template>
              <v-list-item-title>搜尋</v-list-item-title>
            </v-list-item>
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
            <!-- rail 收合時不顯示，hover 展開時才顯示 -->
            <div
              v-if="!rail || railHovering"
              class="w-100 d-flex justify-center mt-6"
            >
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLScdtVvDicUfA5kfZIPtWQ3V-etI-fTErauy_DfLPmikOcuckw/viewform?usp=publish-editor"
                target="_blank"
                rel="noopener noreferrer"
                class="quick-link"
              >
                <img
                  src="/src/assets/image/care-img.png"
                  alt=""
                  style="width: 18px; height: 18px;"
                >
                <span>同仁關懷與申訴</span>
              </a>
            </div>
          </template>

          <template v-else-if="!isSearchMode && activeTab === 'application'">
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

          <template v-else-if="!isSearchMode && activeTab === 'business'">
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
                        <v-list-item-title>
                          <span>{{ item.text }}</span>
                          <v-badge
                            v-if="item.text === '員工評論相關'"
                            :content="employeeCommentPendingReviewCount"
                            :model-value="employeeCommentPendingReviewCount > 0"
                            color="red-lighten-1"
                            dot
                            class="ms-6 pb-2"
                          />
                        </v-list-item-title>
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
                      <v-list-item-title>
                        <span>{{ item.text }}</span>
                        <v-badge
                          v-if="item.text === '員工評論相關'"
                          :content="employeeCommentPendingReviewCount"
                          :model-value="employeeCommentPendingReviewCount > 0"
                          color="red-lighten-1"
                          dot
                          class="ms-6 pb-2"
                        />
                      </v-list-item-title>
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

          <template v-else-if="!isSearchMode && activeTab === 'organization'">
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

          <template v-else-if="!isSearchMode && activeTab === 'system'">
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
          <!-- 搜尋模式（Mobile） -->
          <template v-if="isSearchMode">
            <!-- 搜尋欄位 -->
            <div class="search-container-in-menu">
              <v-text-field
                ref="searchInputRefMobile"
                v-model="searchQuery"
                density="compact"
                variant="outlined"
                placeholder="搜尋選單項目..."
                prepend-inner-icon="mdi-magnify"
                clearable
                hide-details
                class="search-input"
                autofocus
                @focus="isSearchMode = true"
                @click:clear="clearSearch"
                @blur="handleSearchBlur"
              />
            </div>
            <!-- 搜尋結果 -->
            <v-list-subheader v-if="searchResults.length > 0">
              搜尋結果
            </v-list-subheader>
            <template v-if="searchResults.length > 0">
              <v-list-item
                v-for="(result, index) in searchResults"
                :key="`search-mobile-${index}-${result.to}`"
                :to="result.to"
                color="grey-darken-3"
                @click="handleSearchResultClick"
              >
                <template #prepend>
                  <v-icon>{{ result.icon }}</v-icon>
                </template>
                <v-list-item-title>{{ result.text }}</v-list-item-title>
                <template #append>
                  <v-chip
                    size="x-small"
                    variant="text"
                    color="grey-darken-1"
                  >
                    {{ result.tabLabel }}
                  </v-chip>
                </template>
              </v-list-item>
            </template>
            <template v-else-if="searchQuery.trim() !== ''">
              <v-list-item>
                <v-list-item-title class="text-center text-grey">
                  找不到符合的項目
                </v-list-item-title>
              </v-list-item>
            </template>
            <template v-else>
              <v-list-item>
                <v-list-item-title class="sub-title-2 text-center text-grey">
                  輸入關鍵字開始搜尋...
                </v-list-item-title>
              </v-list-item>
            </template>
          </template>
          <!-- 常用 -->
          <template v-if="filteredCommonTabItems.length > 0">
            <v-list-subheader>常用</v-list-subheader>
            <!-- 搜尋按鈕 -->
            <v-list-item
              color="grey-darken-3"
              @click="isSearchMode = true"
            >
              <template #prepend>
                <v-icon>mdi-magnify</v-icon>
              </template>
              <v-list-item-title>搜尋</v-list-item-title>
            </v-list-item>
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
            <div class="w-100 d-flex justify-center mt-4 px-2 mb-3">
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLScdtVvDicUfA5kfZIPtWQ3V-etI-fTErauy_DfLPmikOcuckw/viewform?usp=publish-editor"
                target="_blank"
                rel="noopener noreferrer"
                class="quick-link"
              >
                <img
                  src="/src/assets/image/care-img.png"
                  alt=""
                  style="width: 18px; height: 18px;"
                >
                <span>同仁關懷與申訴</span>
              </a>
            </div>
          </template>

          <!-- 應用 -->
          <template v-if="!isSearchMode && filteredApplicationTabItems.length > 0">
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
          <template v-if="!isSearchMode && filteredBusinessTabItems.length > 0">
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
                    <v-list-item-title>
                      <span>{{ item.text }}</span>
                      <v-badge
                        v-if="item.text === '員工評論相關'"
                        :content="employeeCommentPendingReviewCount"
                        :model-value="employeeCommentPendingReviewCount > 0"
                        color="red-lighten-1"
                        dot
                        class="ms-6 pb-2"
                      />
                    </v-list-item-title>
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
          <template v-if="!isSearchMode && filteredOrganizationTabItems.length > 0">
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
          <template v-if="!isSearchMode && filteredSystemTabItems.length > 0 && user.isLogin">
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
    <v-main
      ref="mainRef"
      :style="{ '--marquee-height': `${marqueeHeight}px` }"
    >
      <div
        v-if="marqueeHeight > 0"
        class="marquee-spacer"
        :style="{ height: `${marqueeHeight}px` }"
        aria-hidden="true"
      />
      <MarqueeBar
        ref="marqueeRef"
        layout="default"
      />
      <EvaluationEditBar />
      <AttendanceFormEditBar />
      <EvaluationBatchDetailBar />
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, computed, nextTick } from 'vue'
import { useApi } from '@/composables/axios'
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'
import { useRouter, useRoute } from 'vue-router'
import { useSnackbar } from 'vuetify-use-dialog'
import { useDisplay } from 'vuetify'
import { roleNames } from '@/enums/UserRole'
import UserAvatar from '@/components/UserAvatar.vue'
import MarqueeBar from '@/components/MarqueeBar.vue'
import EvaluationEditBar from '@/components/EvaluationEditBar.vue'
import AttendanceFormEditBar from '@/components/AttendanceFormEditBar.vue'
import EvaluationBatchDetailBar from '@/components/EvaluationBatchDetailBar.vue'
import NotificationInbox from '@/components/NotificationInbox.vue'
import EmployeeCommentNotificationButton from '@/components/EmployeeCommentNotificationButton.vue'

const { smAndUp, mdAndUp, lgAndUp, name: breakpoint } = useDisplay()

const drawer = ref(true)
const mdDrawer = ref(false)
const rail = ref(false)
const user = useUserStore()
const permissionStore = usePermissionStore()
const createSnackbar = useSnackbar()
const router = useRouter()
const route = useRoute()
const { apiAuth } = useApi()

const openedGroups = ref([]) // 初始值改為空數組
const isBackgroundLoaded = ref(false)
const isAvatarLoaded = ref(false)
const userRbacRoles = ref([]) // 用戶的 RBAC 角色
const activeTab = ref('common') // 當前活躍的Tab
const railHovering = ref(false) // rail 模式下的展開狀態
const searchQuery = ref('') // 搜尋關鍵字
const isSearchMode = ref(false) // 是否處於搜尋模式
const searchInputRef = ref(null) // 搜尋輸入框的引用（桌面版）
const searchInputRefMobile = ref(null) // 搜尋輸入框的引用（手機版）
const employeeCommentButtonRef = ref(null)
const employeeCommentPendingReviewCount = ref(0)
const mainRef = ref(null)
const marqueeRef = ref(null)
const marqueeHeight = ref(0)
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

const fetchEmployeeCommentPendingReviewCount = async () => {
  if (!user.isLogin || !permissionStore.hasPermission('EMPLOYEE_COMMENT_SCHEDULE_MANAGEMENT_READ')) return
  try {
    const { data } = await apiAuth.get('/employee-comments/schedules', {
      params: { status: 'submitted', page: 1, itemsPerPage: 1 }
    })
    employeeCommentPendingReviewCount.value = data?.result?.totalItems ?? 0
  } catch {
    employeeCommentPendingReviewCount.value = 0
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
    to: '/video',
    text: '影片專區',
    icon: 'mdi-video-outline',
    permission: 'EDUCATION_TRAINING_VIDEO_PAGE_READ'
  },
  {
    to: '/employeeCommentSchedule',
    text: '評論排程表',
    icon: 'mdi-calendar-clock',
    permission: 'EMPLOYEE_COMMENT_SCHEDULE_READ'
  },
  {
    to: '/evaluationMyPending',
    text: '我的考核',
    icon: 'mdi-clipboard-edit-outline',
    permission: 'EVALUATION_MY_PENDING_READ'
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
    to: '/lectureEventStatistics',
    text: '講座活動統計表',
    icon: 'mdi-calendar-clock',
    permission: 'LECTURE_EVENT_STATISTICS_READ'
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
    text: '員工評論相關',
    icon: 'mdi-comment-account-outline',
    permission: ['EMPLOYEE_COMMENT_SCHEDULE_MANAGEMENT_READ', 'EMPLOYEE_COMMENT_CANDIDATE_MANAGEMENT_READ'],
    children: [
      {
        to: '/employeeCommentScheduleManagement',
        text: '評論排程管理',
        icon: 'mdi-calendar-clock',
        permission: 'EMPLOYEE_COMMENT_SCHEDULE_MANAGEMENT_READ'
      },
      {
        to: '/employeeCommentCandidateManagement',
        text: '評論名單管理',
        icon: 'mdi-account-group',
        permission: 'EMPLOYEE_COMMENT_CANDIDATE_MANAGEMENT_READ'
      }
    ]
  },
  {
    text: '需求申請相關',
    icon: 'mdi-form-select',
    permission: ['MARKETING_DESIGN_REQUEST_MANAGEMENT_READ', 'MARKETING_DESIGN_REQUEST_SETTING_MANAGE', 'CUSTOMER_COMMENT_MANAGEMENT_READ', 'LECTURE_EVENT_MANAGEMENT_READ'],
    children: [
      {
        to: '/marketingDesignRequestManagement',
        text: '行銷美編申請管理',
        icon: 'mdi-file-cog-outline',
        permission: 'MARKETING_DESIGN_REQUEST_MANAGEMENT_READ'
      },
      {
        to: '/customerCommentManagement',
        text: '客戶評論管理',
        icon: 'mdi-comment-text-multiple-outline',
        permission: 'CUSTOMER_COMMENT_MANAGEMENT_READ'
      },
      {
        to: '/lectureEventManagement',
        text: '講座活動管理',
        icon: 'mdi-presentation',
        permission: 'LECTURE_EVENT_MANAGEMENT_READ'
      },
      {
        to: '/marketingDesignRequestSettings',
        text: '行銷美編申請設定',
        icon: 'mdi-cog',
        permission: 'MARKETING_DESIGN_REQUEST_SETTINGS_READ'
      }
    ]
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
  },
  {
    to: '/selfAssessmentStatistics',
    text: '部門自評統計表',
    icon: 'mdi-chart-box-multiple-outline',
    permission: 'SELF_ASSESSMENT_STATISTICS_READ'
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
    text: '考核相關',
    icon: 'mdi-clipboard-list-outline',
    permission: ['EVALUATION_TEMPLATE_MANAGEMENT_READ', 'EVALUATION_MANAGEMENT_READ', 'EVALUATION_TEMPLATE_MANAGE', 'ATTENDANCE_FORM_TEMPLATE_MANAGEMENT_READ', 'ATTENDANCE_MANAGEMENT_READ', 'SELF_ASSESSMENT_MANAGEMENT_READ'],
    children: [
      {
        to: '/evaluationManagement',
        text: '考核管理',
        icon: 'mdi-clipboard-check-outline',
        permission: 'EVALUATION_MANAGEMENT_READ'
      },
      {
        to: '/attendanceManagement',
        text: '出勤管理',
        icon: 'mdi-calendar-check-outline',
        permission: 'ATTENDANCE_MANAGEMENT_READ'
      },
      {
        to: '/evaluationTemplateManagement',
        text: '考核表單管理',
        icon: 'mdi-clipboard-text-outline',
        permission: 'EVALUATION_TEMPLATE_MANAGEMENT_READ'
      },
      {
        to: '/attendanceFormTemplateManagement',
        text: '出勤表單管理',
        icon: 'mdi-calendar-clock',
        permission: 'ATTENDANCE_FORM_TEMPLATE_MANAGEMENT_READ'
      },
      {
        to: '/selfAssessmentManagement',
        text: '自評管理',
        icon: 'mdi-account-details-outline',
        permission: 'SELF_ASSESSMENT_MANAGEMENT_READ'
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
    to: '/taiwanHolidayManagement',
    text: '假日管理',
    icon: 'mdi-calendar-clock',
    permission: 'TAIWAN_HOLIDAY_MANAGEMENT_READ'
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
      },
      {
        to: '/videoManagement',
        text: '影片管理',
        icon: 'mdi-video-outline',
        permission: 'EDUCATION_TRAINING_VIDEO_MANAGEMENT_READ'
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
  return filteredBusinessTabItems.value.filter(item => item.text === '直客詢問統計表' || item.text === '講座活動統計表')
})

const businessMarketingItems = computed(() => {
  const marketingSet = new Set(['行銷費用分析', '行銷費用管理', '直客詢問管理', '員工評論相關', '需求申請相關', '客戶評論管理'])
  return filteredBusinessTabItems.value.filter(item => marketingSet.has(item.text))
})

const businessCommonItems = computed(() => {
  const commonSet = new Set(['表單產生器', '線別分類管理', '備品相關', '部門自評統計表'])
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

// 扁平化所有選單項目（用於搜尋）
const flattenMenuItems = (items, tabLabel) => {
  const results = []
  items.forEach(item => {
    if (item.children) {
      item.children.forEach(child => {
        if (child.to) {
          results.push({
            ...child,
            tabLabel,
            parentText: item.text
          })
        }
      })
    } else if (item.to) {
      results.push({
        ...item,
        tabLabel
      })
    }
  })
  return results
}

// 獲取所有可搜尋的選單項目
const allSearchableItems = computed(() => {
  const items = []
  if (hasVisibleItems(commonTabItems)) {
    items.push(...flattenMenuItems(filteredCommonTabItems.value, '常用'))
  }
  if (hasVisibleItems(applicationTabItems)) {
    items.push(...flattenMenuItems(filteredApplicationTabItems.value, '應用'))
  }
  if (hasVisibleItems(businessTabItems)) {
    items.push(...flattenMenuItems(filteredBusinessTabItems.value, '營運'))
  }
  if (hasVisibleItems(organizationTabItems)) {
    items.push(...flattenMenuItems(filteredOrganizationTabItems.value, '組織'))
  }
  if (hasVisibleItems(systemTabItems)) {
    items.push(...flattenMenuItems(filteredSystemTabItems.value, '系統'))
  }
  return items
})

// 搜尋結果
const searchResults = computed(() => {
  if (!searchQuery.value || searchQuery.value.trim() === '') {
    return []
  }
  const query = searchQuery.value.toLowerCase().trim()
  const filtered = allSearchableItems.value.filter(item => {
    return item.text.toLowerCase().includes(query) ||
           (item.parentText && item.parentText.toLowerCase().includes(query))
  })
  // 去重：基於 to 路徑，保留第一個出現的項目
  const seen = new Set()
  return filtered.filter(item => {
    if (seen.has(item.to)) {
      return false
    }
    seen.add(item.to)
    return true
  })
})

// 清空搜尋
const clearSearch = () => {
  searchQuery.value = ''
  isSearchMode.value = false
}

// 處理搜尋框失焦
const handleSearchBlur = () => {
  // 延遲檢查，以便點擊搜尋結果時能正常導航
  setTimeout(() => {
    if (searchQuery.value.trim() === '') {
      isSearchMode.value = false
    }
  }, 200)
}

// 處理搜尋結果點擊
const handleSearchResultClick = () => {
  clearSearch()
}

// 監聽 isSearchMode，當為 true 時自動聚焦搜尋框
watch(isSearchMode, (newValue) => {
  if (newValue) {
    nextTick(() => {
      if (searchInputRef.value) {
        searchInputRef.value.focus()
      } else if (searchInputRefMobile.value) {
        searchInputRefMobile.value.focus()
      }
    })
  }
})

// 處理 ESC 鍵退出搜尋模式
const handleKeydown = (event) => {
  if (event.key === 'Escape' && isSearchMode.value) {
    clearSearch()
  }
}

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

  // 影片專區頁面（常用Tab）
  if (newPath.includes('/video') && !newPath.includes('Management')) {
    activeTab.value = 'common'
  }

  // 我的考核（常用Tab）
  if (newPath.includes('/evaluationMyPending')) {
    activeTab.value = 'common'
  }

  // 專案與任務管理（應用Tab）
  if (newPath.includes('/projectAndTaskManagement')) {
    activeTab.value = 'application'
  }

  // 業務相關頁面（業務Tab）
  if (
    newPath.includes('/B2CStatistics') ||
    newPath.includes('/lectureEventStatistics') ||
    newPath.includes('/marketingAnalysis') ||
    newPath.includes('/marketingExpense') ||
    newPath.includes('/marketingBudget') ||
    newPath.includes('/marketingCategory') ||
    newPath.includes('/marketingDesignRequestManagement') ||
    newPath.includes('/marketingDesignRequestSettings') ||
    newPath.includes('/customerCommentManagement') ||
    newPath.includes('/lectureEventManagement') ||
    newPath.includes('/employeeCommentScheduleManagement') ||
    newPath.includes('/employeeCommentCandidateManagement') ||
    newPath.includes('/formGenerator') ||
    newPath.includes('/lineCategory') ||
    newPath.includes('/sparePart') ||
    newPath.includes('/selfAssessmentStatistics')
  ) {
    activeTab.value = 'business'
    // 展開行銷費用管理
    if (newPath.includes('/marketingExpense') || newPath.includes('/marketingBudget') || newPath.includes('/marketingCategory')) {
      if (!openedGroups.value.includes('行銷費用管理')) {
        openedGroups.value.push('行銷費用管理')
      }
    }
    // 展開需求申請相關
    if (newPath.includes('/marketingDesignRequestManagement') || newPath.includes('/marketingDesignRequestSettings') || newPath.includes('/customerCommentManagement') || newPath.includes('/lectureEventManagement')) {
      if (!openedGroups.value.includes('需求申請相關')) {
        openedGroups.value.push('需求申請相關')
      }
    }
    // 展開員工評論相關
    if (newPath.includes('/employeeCommentScheduleManagement') || newPath.includes('/employeeCommentCandidateManagement')) {
      if (!openedGroups.value.includes('員工評論相關')) {
        openedGroups.value.push('員工評論相關')
      }
    }
  }
  // 路由變更時刷新員工評論待審核數量（含進入/離開評論排程管理頁）
  fetchEmployeeCommentPendingReviewCount()

  // 組織相關頁面（組織Tab）
  if (
    newPath.includes('/employeeManagement') ||
    newPath.includes('/companyAndDepartment') ||
    newPath.includes('/evaluationTemplateManagement') ||
    newPath.includes('/attendanceFormTemplateManagement') ||
    newPath.includes('/attendanceManagement') ||
    newPath.includes('/evaluationManagement') ||
    newPath.includes('/selfAssessmentManagement') ||
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
    // 展開考核相關
    if (newPath.includes('/evaluationTemplateManagement') || newPath.includes('/attendanceFormTemplateManagement') || newPath.includes('/evaluationManagement') || newPath.includes('/selfAssessmentManagement')) {
      if (!openedGroups.value.includes('考核相關')) {
        openedGroups.value.push('考核相關')
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
    newPath.includes('/taiwanHolidayManagement') ||
    newPath.includes('/announcementManagement') ||
    newPath.includes('/carouselManagement') ||
    newPath.includes('/marqueeManagement') ||
    newPath.includes('/sharedResourceManagement') ||
    newPath.includes('/videoManagement') ||
    newPath.includes('/auditLog')
  ) {
    activeTab.value = 'system'
    // 展開網站設定
    if (
      newPath.includes('/announcementManagement') ||
      newPath.includes('/carouselManagement') ||
      newPath.includes('/marqueeManagement') ||
      newPath.includes('/sharedResourceManagement') ||
      newPath.includes('/educationTrainingVideoManagement')
    ) {
      if (!openedGroups.value.includes('網站設定')) {
        openedGroups.value.push('網站設定')
      }
    }
  }
}, { immediate: true })

// localStorage 的 key
const RAIL_STATE_KEY = 'navigation-drawer-rail-state'

// 從 localStorage 讀取 rail 狀態
const loadRailState = () => {
  if (typeof window === 'undefined') return null
  const saved = localStorage.getItem(RAIL_STATE_KEY)
  return saved !== null ? saved === 'true' : null
}

// 保存 rail 狀態到 localStorage
const saveRailState = (state) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(RAIL_STATE_KEY, String(state))
}

// 追蹤上一次的 breakpoint，用於判斷是否為尺寸變化
const previousBreakpoint = ref(null)
// 追蹤是否為用戶手動切換（避免 watch 觸發時誤保存）
const isManualToggle = ref(false)

// 監聽螢幕尺寸變化
watch(() => breakpoint.value, (newBreakpoint) => {
  if (!mdAndUp.value) {
    previousBreakpoint.value = newBreakpoint
    return // 小螢幕不處理 rail 狀態
  }

  const isLgAndUp = lgAndUp.value

  // 如果是初始狀態（previousBreakpoint 為 null），根據當前尺寸設定
  if (previousBreakpoint.value === null) {
    if (isLgAndUp) {
      // LG 以上，使用保存的狀態或展開
      const savedState = loadRailState()
      rail.value = savedState !== null ? savedState : false
    } else {
      // MD 到 LG 之間，強制收合
      rail.value = true
    }
    previousBreakpoint.value = newBreakpoint
    return
  }

  // 判斷是否為尺寸變化（從不同尺寸範圍切換）
  const wasLgAndUp = ['lg', 'xl', 'xxl'].includes(previousBreakpoint.value)

  // 如果從 LG 以上變到 LG 以下，強制收合
  if (wasLgAndUp && !isLgAndUp) {
    rail.value = true
    previousBreakpoint.value = newBreakpoint
    return
  }

  // 如果從 LG 以下變到 LG 以上，使用保存的狀態或展開
  if (!wasLgAndUp && isLgAndUp) {
    const savedState = loadRailState()
    rail.value = savedState !== null ? savedState : false
    previousBreakpoint.value = newBreakpoint
    return
  }

  // 如果是在相同尺寸範圍內（都是 LG 以上或都是 LG 以下），且不是手動切換
  // 則根據尺寸設定預設值
  if (!isManualToggle.value) {
    if (isLgAndUp) {
      // LG 以上，使用保存的狀態或展開
      const savedState = loadRailState()
      rail.value = savedState !== null ? savedState : false
    } else {
      // MD 到 LG 之間，強制收合
      rail.value = true
    }
  }

  // 重置手動切換標記
  isManualToggle.value = false
  previousBreakpoint.value = newBreakpoint
}, { immediate: true })

// 監聽 rail 狀態變化，保存到 localStorage（僅在 LG 以上且為手動切換時）
watch(rail, (newValue) => {
  // 只有在 LG 以上且為手動切換時才保存
  if (mdAndUp.value && lgAndUp.value && isManualToggle.value) {
    saveRailState(newValue)
    // 保存後立即重置標記
    isManualToggle.value = false
  }
})

// 控制抽屜展開的函數
// 改進的 toggleDrawer 函數
const toggleDrawer = () => {
  if (!mdAndUp.value) {
    // SM 以下，切換 mdDrawer
    mdDrawer.value = !mdDrawer.value
  } else {
    // SM 以上，標記為手動切換，然後切換 rail 狀態
    isManualToggle.value = true
    rail.value = !rail.value
  }
}

let marqueeResizeObserver = null
// 組件掛載時設置初始狀態
onMounted(async () => {
  // 初始化 previousBreakpoint
  previousBreakpoint.value = breakpoint.value

  // 載入用戶 RBAC 角色
  await loadUserRbacRoles()

  // 載入員工評論待審核數量
  await fetchEmployeeCommentPendingReviewCount()

  // 添加鍵盤事件監聽器
  window.addEventListener('keydown', handleKeydown)

  // 監聽員工評論審核完成事件，同步更新側邊欄 badge
  window.addEventListener('employee-comment-reviewed', fetchEmployeeCommentPendingReviewCount)

  // 監測 MarqueeBar 高度，供 EvaluationEditBar 定位
  marqueeResizeObserver = new ResizeObserver((entries) => {
    const entry = entries[0]
    if (entry) marqueeHeight.value = entry.contentRect.height
  })
  nextTick(() => {
    const el = marqueeRef.value?.$el
    if (el) marqueeResizeObserver.observe(el)
  })
})

// 組件卸載前移除事件監聽器
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('employee-comment-reviewed', fetchEmployeeCommentPendingReviewCount)
  marqueeResizeObserver?.disconnect()
})

const handleOpenEmployeeComment = (scheduleId) => {
  employeeCommentButtonRef.value?.openWithScheduleId(scheduleId)
}

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
    // font-size: 13.5px !important;

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

.search-container {
  padding: 8px 12px;
  background-color: #fff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.search-container-in-menu {
  padding: 8px 12px;
  background-color: #fff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.quick-link {
  width: 200px;
  min-width: 200px;
  height: 40px;
  border: 3px solid #EF9A9A;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.6);
  line-height: 1.5;
  gap: 8px;
  letter-spacing: 2px;
  font-family: 'Noto Sans TC', serif;
  transition: background-color 0.2s ease, color 0.2s ease;
  text-decoration: none;
  flex-shrink: 0;

  &:hover {
    background-color: #E57373;
    color: #fff;
    cursor: pointer;
  }
}

// .v-list-item i {
//   font-size: 20px !important;
// }

// .v-list-item-title  {
//   font-size: 14px !important;
// }

</style>
