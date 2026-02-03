<template>
  <!-- History Detail Page -->
  <HistoryDetailModal 
    v-if="showDetailModal"
    :isVisible="showDetailModal"
    :historyItem="selectedHistoryItem"
    :userUsage="props.userUsage"
    :userId="props.userId"
    @close="closeDetailModal"
    @regenerate="handleRegenerate"
    @update="handleHistoryUpdate"
  />

  <!-- History List Page -->
  <div 
    v-else
    class="relative mx-auto my-0 w-[375px] max-md:w-full max-md:max-w-screen-md max-sm:w-full min-h-screen flex flex-col overflow-y-auto"
    :style="{ 
      minHeight: '100dvh',
      backgroundImage: `url(${imageUrls.background1})`, 
      backgroundSize: '100% 100%', 
      backgroundPosition: 'center center', 
      backgroundRepeat: 'no-repeat'
    }"
  >
    <!-- Header -->
    <div class="flex justify-between items-center px-5 py-5">
      <!-- Left side: Back button and Title -->
      <div class="flex items-center gap-3">
        <button 
          class="cursor-pointer hover:opacity-80 transition-opacity"
          @click="goBack"
        >
          <img 
            :src="imageUrls.back"
            alt="Back Arrow"
            class="w-[26px] h-[26px] object-contain"
          />
        </button>
        
        <!-- Title -->
        <div class="text-xl font-bold cp-font text-[#FFFFFF]">
          抽籤紀錄
        </div>
      </div>
      
      <!-- Usage counter (only show 已抽籤，不可點擊) -->
      <UsageCounter :currentCount="userUsage" :showHistoryLabel="false" />
    </div>


    <div class="flex-1 px-6 py-8">
      <!-- Loading state -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 mb-4" style="border-color: #E0BE91;"></div>
        <div class="text-center" style="color: #E0BE91;">
          <div class="text-lg font-bold mb-2">載入中...</div>
          <div class="text-sm">正在獲取您的生成紀錄</div>
        </div>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="flex flex-col items-center justify-center py-12">
        <div class="text-red-400 text-center">
          <div class="text-lg font-bold mb-2">載入失敗</div>
          <div class="text-sm mb-4">{{ error }}</div>
          <button 
            @click="loadUserHistory"
            class="px-4 py-2 text-[#333] rounded-md hover:opacity-80 transition-colors"
            style="background-color: #E0BE91;"
          >
            重試
          </button>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="!historyData || historyData.length === 0" class="flex flex-col items-center justify-center py-12">
        <div class="text-center">
          <div class="text-lg font-bold mb-2 cp-font step-gradient-text">尚無生成紀錄</div>
          <div class="text-sm cp-font step-gradient-text">您還沒有生成過任何圖片</div>
        </div>
      </div>

      <!-- History grid -->
      <div v-else class="grid grid-cols-2 gap-3 max-w-md mx-auto">
        <div 
          v-for="(item, index) in historyData" 
          :key="item.id || index"
          class="flex w-full h-56 p-4 items-center gap-3 bg-[#9B8A6D] rounded-[5px] cursor-pointer hover:bg-[#AB9A7D] transition-colors"
          @click="viewHistoryItem(item)"
        >
          <div class="flex w-full flex-col items-start gap-2">
            <img 
              v-if="getHistoryImage(item)"
              :src="getHistoryImage(item)" 
              :alt="`生成圖片 ${index + 1}`" 
              class="h-40 w-full object-contain rounded"
              @error="handleImageError"
            />
            <div v-else class="h-40 w-full bg-[#444444] rounded flex items-center justify-center">
              <span class="text-[#999999] text-xs">無圖片</span>
            </div>
            <div class="text-white font-normal text-xs">
              {{ formatDate(item.created_at || item.date || item.timestamp) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { roadshowService } from '../../services/roadshowService.js'
import HistoryDetailModal from './HistoryDetailModal.vue'
import UsageCounter from './UsageCounter.vue'
import { imageUrls } from '@/config/imageUrls'

const props = defineProps({
  userId: {
    type: String,
    default: ''
  },
  userUsage: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['back', 'regenerate'])

const historyData = ref([])
const isLoading = ref(false)
const error = ref(null)

// 彈窗相關狀態
const showDetailModal = ref(false)
const selectedHistoryItem = ref(null)

// 獲取用戶歷史圖片
async function loadUserHistory() {
  if (!props.userId) {
    error.value = '沒有用戶ID，無法載入歷史';
    return;
  }
  
  try {
    isLoading.value = true;
    error.value = null;
    
    const result = await roadshowService.getUserHistory(props.userId);
    
    // 檢查API返回的數據格式
    let avatars = [];
    
    if (Array.isArray(result)) {
      // 直接返回陣列格式：[{...}, {...}, ...]
      avatars = result;
    } else if (result && result.success) {
      // 標準格式：{ success: true, result: { avatars: [...] } }
      avatars = result.result?.avatars || result.data?.avatars || result.avatars || [];
    } else if (result && typeof result === 'object') {
      // 其他物件格式
      avatars = result.result?.avatars || result.data?.avatars || result.avatars || [];
    }
    
    if (avatars.length > 0) {
      historyData.value = avatars.map(avatar => ({
        id: avatar.task_id || avatar.id,
        image: avatar.image_url || avatar.result_image || avatar.image || avatar.generated_image,
        created_at: avatar.created_at || avatar.created_date || avatar.timestamp,
        template_id: avatar.metadata?.template_id || avatar.template_id,
        status: avatar.status
      }));
    } else {
      historyData.value = [];
    }
  } catch (err) {
    console.error('❌ 載入歷史失敗:', err);
    error.value = `載入歷史失敗: ${err.message}`;
    // 錯誤時顯示空狀態
    historyData.value = [];
  } finally {
    isLoading.value = false;
  }
}



// 獲取歷史圖片URL，使用新的圖片處理 API
function getHistoryImage(item) {
  if (!item || !item.image) {
    return null; // 沒有圖片時返回 null
  }
  
  let imageUrl = item.image;
  
  // 如果圖片URL是相對路徑，添加API基礎URL
  if (imageUrl.startsWith('/')) {
    imageUrl = `https://stg-line-crm.fanpokka.ai${imageUrl}`;
  }
  
  // 使用新的圖片處理 API 來處理歷史圖片
  try {
    const config = window.endpoint || {};
    const apiUrl = config.imageProcessApi || 'https://stg-api.fanpokka.ai/api/static-resource';
    const params = config.imageProcessParams || { scale: 1.5, format: 'jpg', quality: 85, width: 600, height: 450 };
    
    // 構建查詢參數
    const queryParams = new URLSearchParams();
    queryParams.append('url', imageUrl);
    if (params.scale) queryParams.append('scale', params.scale);
    if (params.format) queryParams.append('format', params.format);
    if (params.quality) queryParams.append('quality', params.quality);
    if (params.width) queryParams.append('width', params.width);
    if (params.height) queryParams.append('height', params.height);
    
    const processedImageUrl = `${apiUrl}?${queryParams.toString()}`;
    console.log('🔄 歷史圖片使用處理 API:', processedImageUrl);
    
    return processedImageUrl;
  } catch (error) {
    console.error('❌ 處理歷史圖片時發生錯誤:', error);
    // 如果處理失敗，返回原始圖片
    return imageUrl;
  }
}

// 格式化日期
function formatDate(dateString) {
  if (!dateString) {
    return '未知時間';
  }
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return '未知時間';
    }
    
    // 格式化為 YYYY/M/D HH:mm 格式
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${year}/${month}/${day} ${hours}:${minutes}`;
  } catch (error) {
    console.error('日期格式化錯誤:', error);
    return '未知時間';
  }
}

// 處理圖片載入錯誤
function handleImageError(event) {
  const imageUrl = event.target.src;
  console.warn('❌ 圖片載入失敗:', imageUrl);
  
  // 避免無限迴圈：檢查是否已經是預設圖片或錯誤圖片
  if (imageUrl.includes('default_history.png') || imageUrl.includes('data:image/svg+xml')) {
    console.log('🔄 已經是預設圖片，停止重試');
    return;
  }
  
  // 設置一個簡單的 SVG 預設圖片，避免網路請求
  const defaultSvg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMzMzMzMzIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7lm77niYfliqDovb3lpLHotKU8L3RleHQ+Cjwvc3ZnPgo=';
  event.target.src = defaultSvg;
  
  // 記錄錯誤，但不重試
  console.log('🔄 設置預設 SVG 圖片，避免無限迴圈');
}

// 查看歷史項目詳情
function viewHistoryItem(item) {
  console.log('查看歷史項目:', item)
  selectedHistoryItem.value = item
  showDetailModal.value = true
}

// 處理歷史項目更新
function handleHistoryUpdate(updatedItem) {
  if (!updatedItem || !updatedItem.id) {
    return
  }
  
  // 在 historyData 中找到對應的項目並更新
  const index = historyData.value.findIndex(item => item.id === updatedItem.id)
  if (index !== -1) {
    // 更新對應項目的數據
    historyData.value[index] = {
      ...historyData.value[index],
      image: updatedItem.image || historyData.value[index].image,
      status: updatedItem.status || historyData.value[index].status,
      created_at: updatedItem.created_at || historyData.value[index].created_at,
      template_id: updatedItem.template_id || historyData.value[index].template_id
    }
    console.log('✅ 歷史列表項目已更新:', historyData.value[index])
  } else {
    console.warn('⚠️ 未找到要更新的歷史項目，ID:', updatedItem.id)
  }
}

// 關閉詳情彈窗
function closeDetailModal() {
  showDetailModal.value = false
  selectedHistoryItem.value = null
}

function goBack() {
  emit('back')
}

// 處理重新生成
function handleRegenerate(historyItem) {
  console.log('🔄 從歷史詳情重新生成:', historyItem)
  // 關閉詳情彈窗
  closeDetailModal()
  // 發送重新生成事件到父組件
  emit('regenerate')
}

// 監視 userId 變化
watch(() => props.userId, (newUserId, oldUserId) => {
  if (newUserId && newUserId !== oldUserId && newUserId !== '') {
    loadUserHistory();
  }
}, { immediate: false }); // 改為 false，避免無限迴圈

// 組件掛載時載入歷史
onMounted(() => {
  if (props.userId && props.userId !== '') {
    loadUserHistory();
  } else {
    error.value = '沒有用戶ID，無法載入歷史';
  }
});
</script>
