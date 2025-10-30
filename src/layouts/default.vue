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
      <!-- <v-icon
        icon="mdi-email-outline"
        size="22"
        color="purple-darken-4"
        class="me-6"
      />
      <v-icon
        icon="mdi-bell-outline"
        size="22"
        color="purple-darken-4"
        class="me-8"
      /> -->
      <v-btn
        v-if="user.isLogin && mdAndUp"
        prepend-icon="mdi-account-arrow-right"
        variant="outlined"
        rounded="0"
        color="blue-grey-darken-2"
        class="me-6"
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
      class="position-fixed border-0"
    >
      <v-list
        v-model:opened="openedGroups"
        class="pt-0"
      >
        <div>
          <template v-if="!rail">
            <v-card
              v-tooltip="'個人資料管理'"
              elevation="0"
              rounded="0"
              height="172"
              width="260"
              class="pa-0 mb-2 card-bg position-relative"
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
          </template>
          <!-- 核心功能選單 -->
          <template
            v-for="coreItem in filteredCoreItems"
            :key="coreItem.text"
          >
            <!-- 有子選單的項目 -->
            <v-list-group
              v-if="coreItem.children"
              v-model="openedGroups"
              :value="coreItem.text"
              :persistent="true"
              fluid
            >
              <template #activator="{ props }">
                <v-list-item
                  v-bind="props"
                  color="grey-darken-3"
                >
                  <template #prepend>
                    <v-icon>{{ coreItem.icon }}</v-icon>
                  </template>
                  <v-list-item-title>{{ coreItem.text }}</v-list-item-title>
                </v-list-item>
              </template>

              <v-list-item
                v-for="child in coreItem.children"
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
              :to="coreItem.to"
              color="grey-darken-3"
            >
              <template #prepend>
                <v-icon>{{ coreItem.icon }}</v-icon>
              </template>
              <v-list-item-title>{{ coreItem.text }}</v-list-item-title>
            </v-list-item>
          </template>

          <!-- 共用選單 -->
          <v-divider
            v-if="filteredCommonItems.length > 0"
            color="grey-darken-3"
            opacity="0.3"
            class="my-2"
          />
          <template
            v-for="commonItem in filteredCommonItems"
            :key="commonItem.text"
          >
            <v-list-item
              :to="commonItem.to"
              color="grey-darken-3"
            >
              <template #prepend>
                <v-icon>{{ commonItem.icon }}</v-icon>
              </template>
              <v-list-item-title>{{ commonItem.text }}</v-list-item-title>
            </v-list-item>
          </template>

          <!-- 業務選單 -->
          <v-divider
            v-if="filteredBusinessItems.length > 0"
            color="grey-darken-3"
            opacity="0.3"
            class="my-2"
          />
          <template
            v-for="businessItem in filteredBusinessItems"
            :key="businessItem.text"
          >
            <!-- 有子選單的項目 -->
            <v-list-group
              v-if="businessItem.children"
              v-model="openedGroups"
              :value="businessItem.text"
              :persistent="true"
              fluid
            >
              <template #activator="{ props }">
                <v-list-item
                  v-bind="props"
                  color="grey-darken-3"
                >
                  <template #prepend>
                    <v-icon>{{ businessItem.icon }}</v-icon>
                  </template>
                  <v-list-item-title>{{ businessItem.text }}</v-list-item-title>
                </v-list-item>
              </template>

              <v-list-item
                v-for="child in businessItem.children"
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

            <!-- 沒有子選單的項目 -->
            <v-list-item
              v-else
              :to="businessItem.to"
              color="grey-darken-3"
            >
              <template #prepend>
                <v-icon>{{ businessItem.icon }}</v-icon>
              </template>
              <v-list-item-title>{{ businessItem.text }}</v-list-item-title>
            </v-list-item>
          </template>

          <!-- 行銷管理選單 -->
          <v-divider
            v-if="filteredMarketingItems.length > 0"
            color="grey-darken-3"
            opacity="0.3"
            class="my-2"
          />
          <template
            v-for="marketingItem in filteredMarketingItems"
            :key="marketingItem.text"
          >
            <!-- 有子選單的項目 -->
            <v-list-group
              v-if="marketingItem.children"
              v-model="openedGroups"
              :value="marketingItem.text"
              :persistent="true"
              fluid
            >
              <template #activator="{ props }">
                <v-list-item
                  v-bind="props"
                  color="grey-darken-3"
                >
                  <template #prepend>
                    <v-icon>{{ marketingItem.icon }}</v-icon>
                  </template>
                  <v-list-item-title>{{ marketingItem.text }}</v-list-item-title>
                </v-list-item>
              </template>

              <v-list-item
                v-for="child in marketingItem.children"
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

            <!-- 沒有子選單的項目 -->
            <v-list-item
              v-else
              :to="marketingItem.to"
              color="grey-darken-3"
            >
              <template #prepend>
                <v-icon>{{ marketingItem.icon }}</v-icon>
              </template>
              <v-list-item-title>{{ marketingItem.text }}</v-list-item-title>
            </v-list-item>
          </template>

          <!-- 人事管理選單 -->
          <v-divider
            v-if="filteredHrItems.length > 0"
            color="grey-darken-3"
            opacity="0.3"
            class="my-2"
          />
          <template
            v-for="hrItem in filteredHrItems"
            :key="hrItem.text"
          >
            <!-- 有子選單的項目 -->
            <v-list-group
              v-if="hrItem.children"
              v-model="openedGroups"
              :value="hrItem.text"
              :persistent="true"
              fluid
            >
              <template #activator="{ props }">
                <v-list-item
                  v-bind="props"
                  color="grey-darken-3"
                >
                  <template #prepend>
                    <v-icon>{{ hrItem.icon }}</v-icon>
                  </template>
                  <v-list-item-title>{{ hrItem.text }}</v-list-item-title>
                </v-list-item>
              </template>

              <v-list-item
                v-for="child in hrItem.children"
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
              :to="hrItem.to"
              color="grey-darken-3"
            >
              <template #prepend>
                <v-icon>{{ hrItem.icon }}</v-icon>
              </template>
              <v-list-item-title>{{ hrItem.text }}</v-list-item-title>
            </v-list-item>
          </template>

          <!-- 其他功能選單 -->
          <v-divider
            v-if="filteredOtherItems.length > 0"
            color="grey-darken-3"
            opacity="0.3"
            class="my-2"
          />
          <template
            v-for="otherItem in filteredOtherItems"
            :key="otherItem.text"
          >
            <!-- 有子選單的項目 -->
            <v-list-group
              v-if="otherItem.children"
              v-model="openedGroups"
              :value="otherItem.text"
              :persistent="true"
              fluid
            >
              <template #activator="{ props }">
                <v-list-item
                  v-bind="props"
                  color="grey-darken-3"
                >
                  <template #prepend>
                    <v-icon>{{ otherItem.icon }}</v-icon>
                  </template>
                  <v-list-item-title>{{ otherItem.text }}</v-list-item-title>
                </v-list-item>
              </template>

              <v-list-item
                v-for="child in otherItem.children"
                :key="child.to"
                :to="child.to"
                color="grey-darken-3"
                base-color="teal-darken-2"
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
              :to="otherItem.to"
              color="grey-darken-3"
            >
              <template #prepend>
                <v-icon>{{ otherItem.icon }}</v-icon>
              </template>
              <v-list-item-title>{{ otherItem.text }}</v-list-item-title>
            </v-list-item>
          </template>

          <!-- IT管理選單 -->
          <v-divider
            v-if="filteredItItems.length > 0"
            color="grey-darken-3"
            opacity="0.3"
            class="my-2"
          />
          <template
            v-for="itItem in filteredItItems"
            :key="itItem.text"
          >
            <!-- 有子選單的項目 -->
            <v-list-group
              v-if="itItem.children"
              v-model="openedGroups"
              :value="itItem.text"
              :persistent="true"
              fluid
            >
              <template #activator="{ props }">
                <v-list-item
                  v-bind="props"
                  color="grey-darken-3"
                >
                  <template #prepend>
                    <v-icon>{{ itItem.icon }}</v-icon>
                  </template>
                  <v-list-item-title>{{ itItem.text }}</v-list-item-title>
                </v-list-item>
              </template>

              <v-list-item
                v-for="child in itItem.children"
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
              :to="itItem.to"
              color="grey-darken-3"
            >
              <template #prepend>
                <v-icon>{{ itItem.icon }}</v-icon>
              </template>
              <v-list-item-title>{{ itItem.text }}</v-list-item-title>
            </v-list-item>
          </template>

          <!-- 系統設定選單 -->
          <v-divider
            v-if="user.isLogin && filteredSettingsItems.length > 0"
            color="grey-darken-3"
            opacity="0.3"
            class="my-2"
          />
          <template v-if="user.isLogin">
            <template
              v-for="settingsItem in filteredSettingsItems"
              :key="settingsItem.text"
            >
              <!-- 有子選單的項目 -->
              <v-list-group
                v-if="settingsItem.children"
                v-model="openedGroups"
                :value="settingsItem.text"
                :persistent="true"
                fluid
              >
                <template #activator="{ props }">
                  <v-list-item
                    v-bind="props"
                    color="grey-darken-3"
                  >
                    <template #prepend>
                      <v-icon>{{ settingsItem.icon }}</v-icon>
                    </template>
                    <v-list-item-title>{{ settingsItem.text }}</v-list-item-title>
                  </v-list-item>
                </template>

                <v-list-item
                  v-for="child in settingsItem.children"
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
                :to="settingsItem.to"
                color="grey-darken-3"
              >
                <template #prepend>
                  <v-icon>{{ settingsItem.icon }}</v-icon>
                </template>
                <v-list-item-title>{{ settingsItem.text }}</v-list-item-title>
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
      class=" rounded-be-xl position-fixed"
    >
      <v-list class="h-100 pa-0 overflow-auto">
        <div>
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
          <!-- 核心功能選單 -->
          <template
            v-for="coreItem in filteredCoreItems"
            :key="coreItem.text"
          >
            <!-- 有子選單的項目 -->
            <v-list-group
              v-if="coreItem.children"
              v-model="openedGroups"
              :value="coreItem.text"
              :persistent="true"
              fluid
            >
              <template #activator="{ props }">
                <v-list-item
                  v-bind="props"
                  color="grey-darken-3"
                >
                  <template #prepend>
                    <v-icon>{{ coreItem.icon }}</v-icon>
                  </template>
                  <v-list-item-title>{{ coreItem.text }}</v-list-item-title>
                </v-list-item>
              </template>

              <v-list-item
                v-for="child in coreItem.children"
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
              :to="coreItem.to"
              color="grey-darken-3"
            >
              <template #prepend>
                <v-icon>{{ coreItem.icon }}</v-icon>
              </template>
              <v-list-item-title>{{ coreItem.text }}</v-list-item-title>
            </v-list-item>
          </template>

          <!-- 共用選單 -->
          <v-divider
            v-if="filteredCommonItems.length > 0"
            color="grey-darken-3"
            opacity="0.3"
            class="my-2"
          />
          <template
            v-for="commonItem in filteredCommonItems"
            :key="commonItem.text"
          >
            <v-list-item
              :to="commonItem.to"
              color="grey-darken-3"
            >
              <template #prepend>
                <v-icon>{{ commonItem.icon }}</v-icon>
              </template>
              <v-list-item-title>{{ commonItem.text }}</v-list-item-title>
            </v-list-item>
          </template>

          <!-- 業務選單 -->
          <v-divider
            v-if="filteredBusinessItems.length > 0"
            color="grey-darken-3"
            opacity="0.3"
            class="my-2"
          />
          <template
            v-for="businessItem in filteredBusinessItems"
            :key="businessItem.text"
          >
            <!-- 有子選單的項目 -->
            <v-list-group
              v-if="businessItem.children"
              v-model="openedGroups"
              :value="businessItem.text"
              :persistent="true"
              fluid
            >
              <template #activator="{ props }">
                <v-list-item
                  v-bind="props"
                  color="grey-darken-3"
                >
                  <template #prepend>
                    <v-icon>{{ businessItem.icon }}</v-icon>
                  </template>
                  <v-list-item-title>{{ businessItem.text }}</v-list-item-title>
                </v-list-item>
              </template>

              <v-list-item
                v-for="child in businessItem.children"
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

            <!-- 沒有子選單的項目 -->
            <v-list-item
              v-else
              :to="businessItem.to"
              color="grey-darken-3"
            >
              <template #prepend>
                <v-icon>{{ businessItem.icon }}</v-icon>
              </template>
              <v-list-item-title>{{ businessItem.text }}</v-list-item-title>
            </v-list-item>
          </template>

          <!-- 行銷管理選單 -->
          <v-divider
            v-if="filteredMarketingItems.length > 0"
            color="grey-darken-3"
            opacity="0.3"
            class="my-2"
          />
          <template
            v-for="marketingItem in filteredMarketingItems"
            :key="marketingItem.text"
          >
            <!-- 有子選單的項目 -->
            <v-list-group
              v-if="marketingItem.children"
              v-model="openedGroups"
              :value="marketingItem.text"
              :persistent="true"
              fluid
            >
              <template #activator="{ props }">
                <v-list-item
                  v-bind="props"
                  color="grey-darken-3"
                >
                  <template #prepend>
                    <v-icon>{{ marketingItem.icon }}</v-icon>
                  </template>
                  <v-list-item-title>{{ marketingItem.text }}</v-list-item-title>
                </v-list-item>
              </template>

              <v-list-item
                v-for="child in marketingItem.children"
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

            <!-- 沒有子選單的項目 -->
            <v-list-item
              v-else
              :to="marketingItem.to"
              color="grey-darken-3"
            >
              <template #prepend>
                <v-icon>{{ marketingItem.icon }}</v-icon>
              </template>
              <v-list-item-title>{{ marketingItem.text }}</v-list-item-title>
            </v-list-item>
          </template>

          <!-- 人事管理選單 -->
          <v-divider
            v-if="filteredHrItems.length > 0"
            color="grey-darken-3"
            opacity="0.3"
            class="my-2"
          />
          <template
            v-for="hrItem in filteredHrItems"
            :key="hrItem.text"
          >
            <!-- 有子選單的項目 -->
            <v-list-group
              v-if="hrItem.children"
              v-model="openedGroups"
              :value="hrItem.text"
              :persistent="true"
              fluid
            >
              <template #activator="{ props }">
                <v-list-item
                  v-bind="props"
                  color="grey-darken-3"
                >
                  <template #prepend>
                    <v-icon>{{ hrItem.icon }}</v-icon>
                  </template>
                  <v-list-item-title>{{ hrItem.text }}</v-list-item-title>
                </v-list-item>
              </template>

              <v-list-item
                v-for="child in hrItem.children"
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
              :to="hrItem.to"
              color="grey-darken-3"
            >
              <template #prepend>
                <v-icon>{{ hrItem.icon }}</v-icon>
              </template>
              <v-list-item-title>{{ hrItem.text }}</v-list-item-title>
            </v-list-item>
          </template>

          <!-- 其他功能選單 -->
          <v-divider
            v-if="filteredOtherItems.length > 0"
            color="grey-darken-3"
            opacity="0.3"
            class="my-2"
          />
          <template
            v-for="otherItem in filteredOtherItems"
            :key="otherItem.text"
          >
            <!-- 有子選單的項目 -->
            <v-list-group
              v-if="otherItem.children"
              v-model="openedGroups"
              :value="otherItem.text"
              :persistent="true"
              fluid
            >
              <template #activator="{ props }">
                <v-list-item
                  v-bind="props"
                  color="grey-darken-3"
                >
                  <template #prepend>
                    <v-icon>{{ otherItem.icon }}</v-icon>
                  </template>
                  <v-list-item-title>{{ otherItem.text }}</v-list-item-title>
                </v-list-item>
              </template>

              <v-list-item
                v-for="child in otherItem.children"
                :key="child.to"
                :to="child.to"
                color="grey-darken-3"
                base-color="teal-darken-2"
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
              :to="otherItem.to"
              color="grey-darken-3"
            >
              <template #prepend>
                <v-icon>{{ otherItem.icon }}</v-icon>
              </template>
              <v-list-item-title>{{ otherItem.text }}</v-list-item-title>
            </v-list-item>
          </template>

          <!-- IT管理選單 -->
          <v-divider
            v-if="filteredItItems.length > 0"
            color="grey-darken-3"
            opacity="0.3"
            class="my-2"
          />
          <template
            v-for="itItem in filteredItItems"
            :key="itItem.text"
          >
            <!-- 有子選單的項目 -->
            <v-list-group
              v-if="itItem.children"
              v-model="openedGroups"
              :value="itItem.text"
              :persistent="true"
              fluid
            >
              <template #activator="{ props }">
                <v-list-item
                  v-bind="props"
                  color="grey-darken-3"
                >
                  <template #prepend>
                    <v-icon>{{ itItem.icon }}</v-icon>
                  </template>
                  <v-list-item-title>{{ itItem.text }}</v-list-item-title>
                </v-list-item>
              </template>

              <v-list-item
                v-for="child in itItem.children"
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
              :to="itItem.to"
              color="grey-darken-3"
            >
              <template #prepend>
                <v-icon>{{ itItem.icon }}</v-icon>
              </template>
              <v-list-item-title>{{ itItem.text }}</v-list-item-title>
            </v-list-item>
          </template>

          <!-- 系統設定選單 -->
          <v-divider
            v-if="user.isLogin && filteredSettingsItems.length > 0"
            color="grey-darken-3"
            opacity="0.3"
            class="my-2"
          />
          <template v-if="user.isLogin">
            <template
              v-for="settingsItem in filteredSettingsItems"
              :key="settingsItem.text"
            >
              <!-- 有子選單的項目 -->
              <v-list-group
                v-if="settingsItem.children"
                v-model="openedGroups"
                :value="settingsItem.text"
                :persistent="true"
                fluid
              >
                <template #activator="{ props }">
                  <v-list-item
                    v-bind="props"
                    color="grey-darken-3"
                  >
                    <template #prepend>
                      <v-icon>{{ settingsItem.icon }}</v-icon>
                    </template>
                    <v-list-item-title>{{ settingsItem.text }}</v-list-item-title>
                  </v-list-item>
                </template>

                <v-list-item
                  v-for="child in settingsItem.children"
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
                :to="settingsItem.to"
                color="grey-darken-3"
              >
                <template #prepend>
                  <v-icon>{{ settingsItem.icon }}</v-icon>
                </template>
                <v-list-item-title>{{ settingsItem.text }}</v-list-item-title>
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

// 核心功能選單
const coreItems = [
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

// 共用選單
const commonItems = [
  {
    to: '/projectAndTaskManagement',
    text: '專案與任務管理',
    icon: 'mdi-chart-box-outline',
    permission: 'PROJECT_AND_TASK_MANAGEMENT_READ'
  }
]

// 業務選單
const businessItems = [
  {
    to: '/B2CStatistics',
    text: '直客詢問統計表',
    icon: 'mdi-account-question',
    permission: 'B2C_STATISTICS_READ'
  }
]

// 行銷管理選單
const marketingItems = [
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
    text: '其他業務管理',
    icon: 'mdi-clipboard-list-outline',
    permission: ['B2C_STATISTICS_MANAGEMENT_READ', 'MARKETING_DESIGN_REQUEST_MANAGEMENT_READ'],
    children: [
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
      }
    ]
  }
]

// 人事管理選單
const hrItems = [
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
  }
]

// 其他功能選單
const otherItems = [
  {
    text: '其他功能',
    icon: 'mdi-cog',
    permission: ['FORM_GENERATOR_READ', 'LINE_CATEGORY_MANAGEMENT_READ'],
    children: [
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
      }
    ]
  }
]

// IT管理選單
const itItems = [
  {
    to: '/employeeList',
    text: '公司員工列表',
    icon: 'mdi-account-details',
    permission: 'EMPLOYEE_LIST_READ'
  },
  {
    text: '公司硬體管理',
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

// 系統設定選單
const settingsItems = [
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
    text: '系統管理',
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
// 核心功能選單過濾
const filteredCoreItems = computed(() => {
  return coreItems.filter(item => {
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
})

// 共用選單過濾
const filteredCommonItems = computed(() => {
  return commonItems.filter(item => {
    return Array.isArray(item.permission)
      ? permissionStore.hasAnyPermission(item.permission)
      : permissionStore.hasPermission(item.permission)
  })
})

// 業務選單過濾
const filteredBusinessItems = computed(() => {
  return businessItems.filter(item => {
    return Array.isArray(item.permission)
      ? permissionStore.hasAnyPermission(item.permission)
      : permissionStore.hasPermission(item.permission)
  })
})

// 行銷管理選單過濾
const filteredMarketingItems = computed(() => {
  return marketingItems.filter(item => {
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
})

// 人事管理選單過濾
const filteredHrItems = computed(() => {
  return hrItems.filter(item => {
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
})


// 其他功能選單過濾
const filteredOtherItems = computed(() => {
  return otherItems.filter(item => {
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
})

// IT管理選單過濾
const filteredItItems = computed(() => {
  return itItems.filter(item => {
    const hasPermission = Array.isArray(item.permission)
      ? permissionStore.hasAnyPermission(item.permission)
      : permissionStore.hasPermission(item.permission)

    // 如果有子項目，也需要檢查子項目的權限
    if (item.children) {
      item.children = item.children.filter(child => {
        return Array.isArray(child.permission)
          ? permissionStore.hasAnyPermission(child.permission)
          : permissionStore.hasPermission(child.permission)
      })
      // 只有當子項目不為空時才顯示父項目
      return hasPermission && item.children.length > 0
    }

    return hasPermission
  })
})

// 系統設定選單過濾
const filteredSettingsItems = computed(() => {
  return settingsItems.filter(item => {
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
})

// 修改 watch 函數
watch(() => route.path, (newPath) => {
  // 申請相關頁面展開申請相關選單
  if (newPath.includes('/marketingDesignRequest')) {
    if (!openedGroups.value.includes('申請相關')) {
      openedGroups.value.push('申請相關')
    }
  }

  // 業務相關頁面展開業務選單
  if (newPath.includes('/B2CStatistics')) {
    // 業務選單沒有子選單，所以不需要展開邏輯
  }

  // 行銷相關頁面展開行銷費用管理
  if (
    newPath.includes('/marketing') &&
    newPath !== '/marketingDesignRequestManagement'
  ) {
    if (!openedGroups.value.includes('行銷費用管理')) {
      openedGroups.value.push('行銷費用管理')
    }
  }

  // 其他業務管理相關頁面展開其他業務管理
  if (newPath.includes('/B2CStatisticsManagement') || newPath.includes('/marketingDesignRequestManagement')) {
    if (!openedGroups.value.includes('其他業務管理')) {
      openedGroups.value.push('其他業務管理')
    }
  }

  // 人事相關頁面展開人事管理
  if (newPath.includes('/employee') || newPath.includes('/companyAndDepartment')) {
    if (!openedGroups.value.includes('人事管理')) {
      openedGroups.value.push('人事管理')
    }
  }

  // 其他功能相關頁面展開其他功能
  if (newPath.includes('/formGenerator') || newPath.includes('/lineCategoryManagement')) {
    if (!openedGroups.value.includes('其他功能')) {
      openedGroups.value.push('其他功能')
    }
  }

  // 硬體相關頁面展開公司硬體管理
  if (newPath.includes('/hardware')) {
    if (!openedGroups.value.includes('公司硬體管理')) {
      openedGroups.value.push('公司硬體管理')
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

</style>
