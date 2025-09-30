<template>
  <v-container fluid>
    <!-- 頂部橫幅 -->
    <v-row>
      <v-col cols="12">
        <v-card
          class="mb-4 rounded-lg"
          color="deep-orange-lighten-5"
          elevation="2"
        >
          <v-card-text class="d-flex align-center justify-space-between py-6">
            <div>
              <h2 class="text-h4 font-weight-bold text-deep-orange-darken-2">
                訂餐趣
              </h2>
              <p class="text-subtitle-1 text-grey-darken-1 mt-1">
                今天想吃什麼？讓我們一起訂餐吧！
              </p>
            </div>
            <v-btn
              v-if="isAdmin"
              color="deep-orange-darken-1"
              prepend-icon="mdi-store-cog"
              variant="flat"
              @click="openRestaurantManagement"
            >
              餐廳管理
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 主要內容區 -->
    <v-row>
      <!-- 左側選擇區 -->
      <v-col
        cols="12"
        md="3"
      >
        <v-card
          class="rounded-lg"
          elevation="2"
        >
          <v-card-text class="pa-4">
            <!-- 餐廳選擇 -->
            <v-select
              v-model="selectedRestaurant"
              :items="restaurants"
              label="選擇餐廳"
              item-title="name"
              item-value="_id"
              variant="outlined"
              density="comfortable"
              color="deep-orange-darken-2"
              class="mb-4"
              :loading="loadingRestaurants"
              clearable
              @update:model-value="handleRestaurantChange"
            >
              <template #prepend>
                <v-icon color="deep-orange-darken-2">
                  mdi-store
                </v-icon>
              </template>
            </v-select>

            <!-- 分類列表 -->
            <v-list
              v-if="selectedRestaurant"
              density="comfortable"
              nav
              class="rounded-lg categories-list"
            >
              <v-list-subheader class="text-grey-darken-2">
                餐點分類
              </v-list-subheader>
              <v-list-item
                v-for="category in categories"
                :key="category._id"
                :value="category._id"
                :active="selectedCategory === category._id"
                active-color="deep-orange-darken-2"
                rounded="lg"
                class="mb-1"
                @click="selectedCategory = category._id"
              >
                <template #prepend>
                  <v-icon
                    :icon="getCategoryIcon(category.name)"
                    :color="selectedCategory === category._id ? 'white' : 'deep-orange-darken-2'"
                  />
                </template>
                <v-list-item-title>{{ category.name }}</v-list-item-title>
                <template #append>
                  <v-chip
                    size="small"
                    :color="selectedCategory === category._id ? 'white' : 'deep-orange-lighten-4'"
                    :text-color="selectedCategory === category._id ? 'deep-orange-darken-2' : 'deep-orange-darken-3'"
                  >
                    {{ category.itemCount }}
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>

            <v-alert
              v-else
              type="info"
              variant="tonal"
              class="mt-4"
            >
              請先選擇餐廳
            </v-alert>
          </v-card-text>
        </v-card>

        <!-- 購物車 -->
        <v-card
          class="mt-4 rounded-lg"
          elevation="2"
        >
          <v-toolbar
            color="deep-orange-lighten-1"
            density="comfortable"
          >
            <v-toolbar-title class="text-white font-weight-medium">
              <v-icon
                icon="mdi-cart"
                class="me-2"
              />
              購物車
            </v-toolbar-title>
          </v-toolbar>

          <v-card-text class="pa-4">
            <template v-if="cartItems.length > 0">
              <v-list class="cart-list">
                <v-list-item
                  v-for="item in cartItems"
                  :key="item._id"
                  class="mb-2 rounded-lg"
                >
                  <template #prepend>
                    <v-btn
                      icon="mdi-minus"
                      variant="text"
                      size="small"
                      color="deep-orange-darken-2"
                      @click="decreaseQuantity(item)"
                    />
                  </template>

                  <v-list-item-title class="text-body-2">
                    {{ item.name }}
                  </v-list-item-title>
                  <v-list-item-subtitle
                    v-if="item.options"
                    class="text-caption text-grey-darken-1"
                  >
                    {{ formatOptions(item.options) }}
                  </v-list-item-subtitle>

                  <template #append>
                    <div class="d-flex align-center">
                      <span class="text-body-2 me-2">
                        × {{ item.quantity }}
                      </span>
                      <v-btn
                        icon="mdi-plus"
                        variant="text"
                        size="small"
                        color="deep-orange-darken-2"
                        @click="increaseQuantity(item)"
                      />
                    </div>
                  </template>
                </v-list-item>
              </v-list>

              <v-divider class="my-3" />

              <div class="d-flex justify-space-between align-center mb-4">
                <span class="text-subtitle-1 font-weight-medium">總計金額</span>
                <span class="text-h6 font-weight-bold text-deep-orange-darken-2">
                  NT$ {{ totalAmount }}
                </span>
              </div>

              <v-btn
                color="deep-orange-darken-2"
                block
                @click="submitOrder"
              >
                確認訂單
              </v-btn>
            </template>

            <v-alert
              v-else
              type="info"
              variant="tonal"
              class="mb-0"
            >
              購物車是空的
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 右側餐點列表 -->
      <v-col
        cols="12"
        md="9"
      >
        <v-card
          class="rounded-lg"
          elevation="2"
          min-height="700"
        >
          <v-card-text class="pa-6">
            <template v-if="selectedRestaurant">
              <div class="d-flex justify-space-between align-center mb-6">
                <h3 class="text-h5 font-weight-bold text-grey-darken-3">
                  {{ selectedRestaurantName }}
                </h3>
                <v-btn
                  v-if="selectedRestaurant"
                  color="deep-orange-lighten-1"
                  variant="text"
                  prepend-icon="mdi-image-multiple"
                  @click="showMenuImages"
                >
                  查看菜單圖片
                </v-btn>
              </div>

              <!-- 餐點列表 -->
              <v-row>
                <v-col
                  v-for="item in filteredItems"
                  :key="item._id"
                  cols="12"
                  sm="6"
                  lg="4"
                >
                  <v-card
                    class="rounded-lg food-item-card"
                    elevation="1"
                    @click="openItemDialog(item)"
                  >
                    <v-img
                      :src="item.image || '/images/default-food.jpg'"
                      height="200"
                      cover
                      class="rounded-t-lg"
                    >
                      <template #placeholder>
                        <v-row
                          class="fill-height ma-0"
                          align="center"
                          justify="center"
                        >
                          <v-progress-circular
                            indeterminate
                            color="deep-orange-lighten-3"
                          />
                        </v-row>
                      </template>
                    </v-img>

                    <v-card-text class="pa-4">
                      <div class="d-flex justify-space-between align-center mb-2">
                        <h3 class="text-h6 font-weight-bold text-grey-darken-2">
                          {{ item.name }}
                        </h3>
                        <span class="text-subtitle-1 font-weight-medium text-deep-orange-darken-2">
                          NT$ {{ item.price }}
                        </span>
                      </div>
                      <p
                        class="text-body-2 text-grey-darken-1"
                      >
                        {{ item.description || '暫無描述' }}
                      </p>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </template>

            <v-alert
              v-else
              type="info"
              variant="tonal"
              icon="mdi-information"
            >
              請先選擇餐廳來查看餐點
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 餐點詳情對話框 -->
    <v-dialog
      v-model="itemDialog.show"
      max-width="500"
    >
      <v-card class="rounded-lg">
        <v-img
          :src="itemDialog.item?.image || '/images/default-food.jpg'"
          height="250"
          cover
          class="rounded-t-lg"
        />

        <v-card-text class="pa-6">
          <div class="d-flex justify-space-between align-center mb-4">
            <h3 class="text-h5 font-weight-bold text-grey-darken-2">
              {{ itemDialog.item?.name }}
            </h3>
            <span class="text-h6 font-weight-medium text-deep-orange-darken-2">
              NT$ {{ itemDialog.item?.price }}
            </span>
          </div>

          <p class="text-body-1 text-grey-darken-1 mb-6">
            {{ itemDialog.item?.description || '暫無描述' }}
          </p>

          <!-- 客製化選項 -->
          <template v-if="itemDialog.item?.customizations?.length">
            <v-divider class="mb-4" />

            <div
              v-for="(customization, index) in itemDialog.item.customizations"
              :key="index"
              class="mb-4"
            >
              <h4 class="text-subtitle-1 font-weight-medium text-grey-darken-2 mb-2">
                {{ customization.name }}
              </h4>
              <v-radio-group
                v-if="customization.type === 'single'"
                v-model="itemDialog.options[customization.name]"
                density="comfortable"
                color="deep-orange-darken-2"
              >
                <v-radio
                  v-for="option in customization.options"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </v-radio-group>
              <v-checkbox-btn
                v-for="option in customization.options"
                v-else
                :key="option.value"
                v-model="itemDialog.options[customization.name]"
                :label="option.label"
                :value="option.value"
                density="comfortable"
                color="deep-orange-darken-2"
              />
            </div>
          </template>

          <!-- 備註 -->
          <v-text-field
            v-model="itemDialog.note"
            label="備註"
            variant="outlined"
            density="comfortable"
            color="deep-orange-darken-2"
            hide-details
            class="mb-4"
          />

          <!-- 數量選擇 -->
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-btn
                icon="mdi-minus"
                variant="outlined"
                color="deep-orange-darken-2"
                size="small"
                :disabled="itemDialog.quantity <= 1"
                @click="itemDialog.quantity--"
              />
              <span class="mx-4 text-h6">{{ itemDialog.quantity }}</span>
              <v-btn
                icon="mdi-plus"
                variant="outlined"
                color="deep-orange-darken-2"
                size="small"
                @click="itemDialog.quantity++"
              />
            </div>
            <v-btn
              color="deep-orange-darken-2"
              size="large"
              @click="addToCart"
            >
              加入購物車
              <span class="ms-2">
                NT$ {{ (itemDialog.item?.price || 0) * itemDialog.quantity }}
              </span>
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 菜單圖片對話框 -->
    <v-dialog
      v-model="menuDialog.show"
      max-width="800"
    >
      <v-card class="rounded-lg">
        <v-toolbar
          color="deep-orange-lighten-1"
          density="comfortable"
        >
          <v-toolbar-title class="text-white">
            {{ selectedRestaurantName }} - 菜單
          </v-toolbar-title>
          <template #append>
            <v-btn
              icon="mdi-close"
              variant="text"
              @click="menuDialog.show = false"
            />
          </template>
        </v-toolbar>

        <v-card-text class="pa-4">
          <v-carousel
            v-model="menuDialog.currentImage"
            show-arrows="hover"
            height="500"
          >
            <v-carousel-item
              v-for="(image, index) in menuImages"
              :key="index"
              :src="image"
              cover
            />
          </v-carousel>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 餐廳管理對話框 -->
    <v-dialog
      v-model="restaurantDialog.show"
      max-width="1000"
      scrollable
    >
      <v-card class="rounded-lg">
        <v-toolbar
          color="deep-orange-lighten-1"
          density="comfortable"
        >
          <v-toolbar-title class="text-white font-weight-medium">
            餐廳管理
          </v-toolbar-title>
          <template #append>
            <v-btn
              icon="mdi-plus"
              variant="text"
              class="me-2"
              @click="openAddRestaurantDialog"
            />
            <v-btn
              icon="mdi-close"
              variant="text"
              @click="restaurantDialog.show = false"
            />
          </template>
        </v-toolbar>

        <v-card-text class="pa-4">
          <v-row>
            <v-col
              v-for="restaurant in mockRestaurants"
              :key="restaurant._id"
              cols="12"
              sm="6"
              lg="4"
            >
              <v-card
                class="rounded-lg restaurant-card"
                elevation="1"
              >
                <v-img
                  :src="restaurant.image || '/images/default-restaurant.jpg'"
                  height="200"
                  cover
                  class="rounded-t-lg"
                >
                  <template #placeholder>
                    <v-row
                      class="fill-height ma-0"
                      align="center"
                      justify="center"
                    >
                      <v-progress-circular
                        indeterminate
                        color="deep-orange-lighten-3"
                      />
                    </v-row>
                  </template>
                </v-img>

                <v-card-text class="pa-4">
                  <div class="d-flex justify-space-between align-center mb-2">
                    <h3 class="text-h6 font-weight-bold text-grey-darken-2">
                      {{ restaurant.name }}
                    </h3>
                    <v-chip
                      :color="restaurant.active ? 'success' : 'grey'"
                      size="small"
                    >
                      {{ restaurant.active ? '營業中' : '已關閉' }}
                    </v-chip>
                  </div>
                  <p class="text-body-2 text-grey-darken-1 mb-4">
                    {{ restaurant.description }}
                  </p>
                  <div class="d-flex align-center text-grey-darken-1 mb-2">
                    <v-icon
                      size="small"
                      class="me-2"
                    >
                      mdi-phone
                    </v-icon>
                    <span class="text-body-2">{{ restaurant.phone }}</span>
                  </div>
                  <div class="d-flex align-center text-grey-darken-1">
                    <v-icon
                      size="small"
                      class="me-2"
                    >
                      mdi-map-marker
                    </v-icon>
                    <span class="text-body-2">{{ restaurant.address }}</span>
                  </div>
                </v-card-text>

                <v-divider />

                <v-card-actions class="pa-4">
                  <v-spacer />
                  <v-btn
                    color="deep-orange"
                    variant="text"
                    prepend-icon="mdi-food"
                    class="me-2"
                    @click="openMenuManagement(restaurant)"
                  >
                    餐點管理
                  </v-btn>
                  <v-btn
                    color="blue-grey"
                    variant="text"
                    prepend-icon="mdi-pencil"
                    @click="openEditRestaurantDialog(restaurant)"
                  >
                    編輯
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 新增/編輯餐廳對話框 -->
    <v-dialog
      v-model="editRestaurantDialog.show"
      max-width="600"
      persistent
    >
      <v-card class="rounded-lg">
        <v-toolbar
          color="deep-orange-lighten-1"
          density="comfortable"
        >
          <v-toolbar-title class="text-white font-weight-medium">
            {{ editRestaurantDialog.id ? '編輯餐廳' : '新增餐廳' }}
          </v-toolbar-title>
          <template #append>
            <v-btn
              icon="mdi-close"
              variant="text"
              @click="editRestaurantDialog.show = false"
            />
          </template>
        </v-toolbar>

        <v-card-text class="pa-6">
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="editRestaurantDialog.form.name"
                label="餐廳名稱"
                variant="outlined"
                density="comfortable"
                hide-details
                class="mb-4"
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="editRestaurantDialog.form.description"
                label="餐廳描述"
                variant="outlined"
                density="comfortable"
                hide-details
                class="mb-4"
                rows="3"
              />
            </v-col>

            <v-col
              cols="12"
              sm="6"
            >
              <v-text-field
                v-model="editRestaurantDialog.form.phone"
                label="聯絡電話"
                variant="outlined"
                density="comfortable"
                hide-details
                class="mb-4"
              />
            </v-col>

            <v-col
              cols="12"
              sm="6"
            >
              <v-switch
                v-model="editRestaurantDialog.form.active"
                label="是否營業"
                color="success"
                hide-details
                class="mb-4"
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="editRestaurantDialog.form.address"
                label="地址"
                variant="outlined"
                density="comfortable"
                hide-details
                class="mb-4"
              />
            </v-col>

            <v-col cols="12">
              <v-file-input
                v-model="editRestaurantDialog.form.image"
                label="餐廳圖片"
                variant="outlined"
                density="comfortable"
                hide-details
                accept="image/*"
                prepend-icon="mdi-camera"
                class="mb-4"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pa-6 pt-0">
          <v-spacer />
          <v-btn
            color="grey"
            variant="outlined"
            @click="editRestaurantDialog.show = false"
          >
            取消
          </v-btn>
          <v-btn
            color="deep-orange-darken-2"
            class="ms-2"
            @click="handleSaveRestaurant"
          >
            {{ editRestaurantDialog.id ? '儲存' : '新增' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 餐點管理對話框 -->
    <v-dialog
      v-model="menuManagementDialog.show"
      max-width="1200"
      scrollable
    >
      <v-card class="rounded-lg">
        <v-toolbar
          color="deep-orange-lighten-1"
          density="comfortable"
        >
          <v-toolbar-title class="text-white font-weight-medium">
            {{ menuManagementDialog.restaurant?.name }} - 餐點管理
          </v-toolbar-title>
          <template #append>
            <v-btn
              icon="mdi-plus"
              variant="text"
              class="me-2"
              @click="openAddMenuItem"
            />
            <v-btn
              icon="mdi-close"
              variant="text"
              @click="menuManagementDialog.show = false"
            />
          </template>
        </v-toolbar>

        <v-card-text class="pa-4">
          <!-- 分類管理 -->
          <v-expansion-panels class="mb-6">
            <v-expansion-panel>
              <v-expansion-panel-title>
                <div class="d-flex align-center">
                  <v-icon
                    icon="mdi-format-list-bulleted-type"
                    class="me-2"
                  />
                  分類管理
                </div>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-row>
                  <v-col
                    cols="12"
                    sm="6"
                    md="4"
                    lg="3"
                  >
                    <v-text-field
                      v-model="newCategory"
                      label="新增分類"
                      variant="outlined"
                      density="comfortable"
                      hide-details
                      class="mb-4"
                      append-inner-icon="mdi-plus"
                      @click:append-inner="addCategory"
                    />
                  </v-col>
                </v-row>
                <v-chip-group>
                  <v-chip
                    v-for="category in mockCategories"
                    :key="category._id"
                    closable
                    color="deep-orange-lighten-1"
                    @click:close="removeCategory(category)"
                  >
                    {{ category.name }}
                  </v-chip>
                </v-chip-group>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

          <!-- 餐點列表 -->
          <v-data-table
            :headers="menuHeaders"
            :items="mockMenuItems"
            hover
          >
            <template #image="{ item }">
              <v-avatar
                :image="item.raw.image || '/images/default-food.jpg'"
                size="40"
                class="rounded-lg"
              />
            </template>

            <template #price="{ item }">
              NT$ {{ item.raw.price }}
            </template>

            <template #active="{ item }">
              <v-chip
                :color="item.raw.active ? 'success' : 'grey'"
                size="small"
              >
                {{ item.raw.active ? '販售中' : '已下架' }}
              </v-chip>
            </template>

            <template #actions="{ item }">
              <v-btn
                icon="mdi-pencil"
                variant="text"
                size="small"
                color="blue-grey"
                class="me-2"
                @click="openEditMenuItem(item.raw)"
              />
              <v-btn
                icon="mdi-delete"
                variant="text"
                size="small"
                color="error"
                @click="deleteMenuItem(item.raw)"
              />
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import { definePage } from 'vue-router/auto'
import UserRole from '@/enums/UserRole'

// 頁面定義
definePage({
  meta: {
    title: '訂餐趣 | Ystravel',
    login: true
  }
})

// API 與工具初始化
const { apiAuth } = useApi()
const createSnackbar = useSnackbar()
const user = useUserStore()
const isAdmin = computed(() => user.role === UserRole.ADMIN)

// 餐廳相關
const loadingRestaurants = ref(false)
const restaurants = ref([])
const selectedRestaurant = ref(null)
const selectedRestaurantName = computed(() => {
  const restaurant = restaurants.value.find(r => r._id === selectedRestaurant.value)
  return restaurant?.name || ''
})

// 分類相關
const categories = ref([])
const selectedCategory = ref(null)

// 餐點相關
const items = ref([])
const filteredItems = computed(() => {
  if (!selectedCategory.value) return items.value
  return items.value.filter(item => item.category === selectedCategory.value)
})

// 購物車相關
const cartItems = ref([])
const totalAmount = computed(() => {
  return cartItems.value.reduce((total, item) => {
    return total + (item.price * item.quantity)
  }, 0)
})

// 對話框相關
const itemDialog = ref({
  show: false,
  item: null,
  quantity: 1,
  options: {},
  note: ''
})

const menuDialog = ref({
  show: false,
  currentImage: 0
})

// 餐廳菜單圖片
const menuImages = ref([])

// 假資料
const mockRestaurants = [
  {
    _id: '1',
    name: '好味餐廳',
    description: '提供美味的中式料理，平價實惠',
    phone: '02-2345-6789',
    address: '台北市中山區中山北路一段1號',
    image: 'https://picsum.photos/500/300?random=1',
    active: true
  },
  {
    _id: '2',
    name: '樂活素食',
    description: '健康蔬食料理，讓您吃得健康又美味',
    phone: '02-3456-7890',
    address: '台北市大安區信義路二段2號',
    image: 'https://picsum.photos/500/300?random=2',
    active: true
  },
  {
    _id: '3',
    name: '日式食堂',
    description: '道地日本料理，彷彿置身日本',
    phone: '02-4567-8901',
    address: '台北市松山區南京東路三段3號',
    image: 'https://picsum.photos/500/300?random=3',
    active: false
  }
]

const mockCategories = [
  { _id: '1', name: '主食' },
  { _id: '2', name: '飲料' },
  { _id: '3', name: '小菜' },
  { _id: '4', name: '湯品' }
]

const mockMenuItems = [
  {
    _id: '1',
    name: '炒飯',
    category: '主食',
    price: 80,
    description: '香噴噴的炒飯',
    image: 'https://picsum.photos/500/300?random=4',
    active: true
  },
  {
    _id: '2',
    name: '滷肉飯',
    category: '主食',
    price: 60,
    description: '傳統美味',
    image: 'https://picsum.photos/500/300?random=5',
    active: true
  },
  {
    _id: '3',
    name: '紅茶',
    category: '飲料',
    price: 30,
    description: '清香解膩',
    image: 'https://picsum.photos/500/300?random=6',
    active: true
  }
]

// 餐廳管理對話框
const restaurantDialog = ref({
  show: false
})

// 編輯餐廳對話框
const editRestaurantDialog = ref({
  show: false,
  id: null,
  form: {
    name: '',
    description: '',
    phone: '',
    address: '',
    image: null,
    active: true
  }
})

// 餐點管理對話框
const menuManagementDialog = ref({
  show: false,
  restaurant: null
})

// 新分類
const newCategory = ref('')

// 餐點表格標題
const menuHeaders = [
  { title: '圖片', key: 'image', sortable: false },
  { title: '名稱', key: 'name', sortable: true },
  { title: '分類', key: 'category', sortable: true },
  { title: '價格', key: 'price', sortable: true },
  { title: '描述', key: 'description', sortable: false },
  { title: '狀態', key: 'active', sortable: true },
  { title: '操作', key: 'actions', sortable: false, align: 'end' }
]

// 載入餐廳列表
const loadRestaurants = async () => {
  loadingRestaurants.value = true
  try {
    const { data } = await apiAuth.get('/restaurants')
    if (data.success) {
      restaurants.value = data.result
    }
  } catch (error) {
    console.error('載入餐廳列表失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '載入餐廳列表失敗',
      snackbarProps: { color: 'error' }
    })
  } finally {
    loadingRestaurants.value = false
  }
}

// 處理餐廳變更
const handleRestaurantChange = async (restaurantId) => {
  if (!restaurantId) {
    categories.value = []
    items.value = []
    selectedCategory.value = null
    return
  }

  try {
    const [categoriesResponse, itemsResponse] = await Promise.all([
      apiAuth.get(`/restaurants/${restaurantId}/categories`),
      apiAuth.get(`/restaurants/${restaurantId}/items`)
    ])

    if (categoriesResponse.data.success) {
      categories.value = categoriesResponse.data.result
    }

    if (itemsResponse.data.success) {
      items.value = itemsResponse.data.result
    }
  } catch (error) {
    console.error('載入餐廳資料失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '載入餐廳資料失敗',
      snackbarProps: { color: 'error' }
    })
  }
}

// 取得分類圖示
const getCategoryIcon = (categoryName) => {
  const icons = {
    '主食': 'mdi-rice',
    '飲料': 'mdi-cup',
    '小菜': 'mdi-food-variant',
    '湯品': 'mdi-bowl-mix',
    '甜點': 'mdi-cake-variant',
    '其他': 'mdi-food'
  }
  return icons[categoryName] || 'mdi-food'
}

// 開啟餐點詳情
const openItemDialog = (item) => {
  itemDialog.value = {
    show: true,
    item,
    quantity: 1,
    options: {},
    note: ''
  }

  // 初始化客製化選項
  if (item.customizations) {
    item.customizations.forEach(customization => {
      if (customization.type === 'single') {
        itemDialog.value.options[customization.name] = customization.options[0]?.value
      } else {
        itemDialog.value.options[customization.name] = []
      }
    })
  }
}

// 加入購物車
const addToCart = () => {
  const { item, quantity, options, note } = itemDialog.value

  cartItems.value.push({
    _id: item._id,
    name: item.name,
    price: item.price,
    quantity,
    options,
    note
  })

  itemDialog.value.show = false
  createSnackbar({
    text: '已加入購物車',
    snackbarProps: { color: 'success' }
  })
}

// 調整購物車數量
const increaseQuantity = (item) => {
  item.quantity++
}

const decreaseQuantity = (item) => {
  if (item.quantity > 1) {
    item.quantity--
  } else {
    const index = cartItems.value.findIndex(i => i._id === item._id)
    if (index > -1) {
      cartItems.value.splice(index, 1)
    }
  }
}

// 格式化選項
const formatOptions = (options) => {
  return Object.entries(options)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return `${key}: ${value.join(', ')}`
      }
      return `${key}: ${value}`
    })
    .join(' | ')
}

// 提交訂單
const submitOrder = async () => {
  try {
    const order = {
      restaurantId: selectedRestaurant.value,
      items: cartItems.value.map(item => ({
        itemId: item._id,
        quantity: item.quantity,
        options: item.options,
        note: item.note
      }))
    }

    const { data } = await apiAuth.post('/orders', order)
    if (data.success) {
      cartItems.value = []
      createSnackbar({
        text: '訂單已送出',
        snackbarProps: { color: 'success' }
      })
    }
  } catch (error) {
    console.error('送出訂單失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '送出訂單失敗',
      snackbarProps: { color: 'error' }
    })
  }
}

// 查看菜單圖片
const showMenuImages = async () => {
  try {
    const { data } = await apiAuth.get(`/restaurants/${selectedRestaurant.value}/menu-images`)
    if (data.success) {
      menuImages.value = data.result
      menuDialog.value.show = true
    }
  } catch (error) {
    console.error('載入菜單圖片失敗:', error)
    createSnackbar({
      text: error?.response?.data?.message || '載入菜單圖片失敗',
      snackbarProps: { color: 'error' }
    })
  }
}

// 修改 openRestaurantManagement 函數
const openRestaurantManagement = () => {
  restaurantDialog.value.show = true
}

// 開啟新增餐廳對話框
const openAddRestaurantDialog = () => {
  editRestaurantDialog.value = {
    show: true,
    id: null,
    form: {
      name: '',
      description: '',
      phone: '',
      address: '',
      image: null,
      active: true
    }
  }
}

// 開啟編輯餐廳對話框
const openEditRestaurantDialog = (restaurant) => {
  editRestaurantDialog.value = {
    show: true,
    id: restaurant._id,
    form: {
      name: restaurant.name,
      description: restaurant.description,
      phone: restaurant.phone,
      address: restaurant.address,
      image: null,
      active: restaurant.active
    }
  }
}

// 儲存餐廳資料
const handleSaveRestaurant = () => {
  // 這裡之後會串接 API
  console.log('儲存餐廳資料:', editRestaurantDialog.value.form)
  editRestaurantDialog.value.show = false
  createSnackbar({
    text: editRestaurantDialog.value.id ? '餐廳資料已更新' : '餐廳已新增',
    snackbarProps: { color: 'success' }
  })
}

// 開啟餐點管理
const openMenuManagement = (restaurant) => {
  menuManagementDialog.value = {
    show: true,
    restaurant
  }
}

// 新增分類
const addCategory = () => {
  if (!newCategory.value) return
  mockCategories.push({
    _id: String(mockCategories.length + 1),
    name: newCategory.value
  })
  newCategory.value = ''
}

// 移除分類
const removeCategory = (category) => {
  const index = mockCategories.findIndex(c => c._id === category._id)
  if (index > -1) {
    mockCategories.splice(index, 1)
  }
}

// 開啟新增餐點
const openAddMenuItem = () => {
  // 之後實作
  createSnackbar({
    text: '此功能開發中',
    snackbarProps: { color: 'info' }
  })
}

// 開啟編輯餐點
const openEditMenuItem = (item) => {
  // 之後實作
  console.log('編輯餐點:', item)
  createSnackbar({
    text: '此功能開發中',
    snackbarProps: { color: 'info' }
  })
}

// 刪除餐點
const deleteMenuItem = (item) => {
  // 之後實作
  console.log('刪除餐點:', item)
  createSnackbar({
    text: '此功能開發中',
    snackbarProps: { color: 'info' }
  })
}

// 初始化
onMounted(async () => {
  await loadRestaurants()
})
</script>

<style lang="scss" scoped>
.categories-list {
  border: 1px solid rgba(0, 0, 0, 0.12);

  :deep(.v-list-item--active) {
    .v-list-item-title {
      color: white;
    }
  }
}

.cart-list {
  max-height: 300px;
  overflow-y: auto;
}

.food-item-card {
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12) !important;
  }
}

.restaurant-card {
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12) !important;
  }
}
</style>
