<template>
  <div class="min-h-screen bg-[#333333] flex flex-col">
    <!-- Header -->
    <div class="flex justify-between items-center px-5 py-5 border-b border-[#EBD8B2]">
      <!-- Back arrow -->
      <button 
        class="w-[17px] h-[19px] cursor-pointer hover:opacity-80 transition-opacity"
        @click="goBack"
      >
        <img 
          src="/images/back.png"
          alt="Back Arrow"
          class="w-[17px] h-[19px] object-contain"
        />
      </button>
      
      <!-- Title -->
      <div class="font-noto-sans-tc text-xl font-bold text-[#EBD8B2]">
        圖片生成紀錄
      </div>
      
      <!-- Usage counter -->
      <UsageCounter :currentCount="userUsage" :maxLimit="10" />
    </div>


    <div class="flex-1 px-6 py-8">
      <!-- Loading state -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EBD8B2] mb-4"></div>
        <div class="text-[#EBD8B2] text-center">
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
            class="px-4 py-2 bg-[#EBD8B2] text-[#333] rounded-md hover:bg-[#d4c29a] transition-colors"
          >
            重試
          </button>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="!historyData || historyData.length === 0" class="flex flex-col items-center justify-center py-12">
        <div class="text-[#EBD8B2] text-center">
          <div class="text-lg font-bold mb-2">尚無生成紀錄</div>
          <div class="text-sm">您還沒有生成過任何圖片</div>
        </div>
      </div>

      <!-- History grid -->
      <div v-else class="grid grid-cols-2 gap-3 max-w-md mx-auto">
        <div 
          v-for="(item, index) in historyData" 
          :key="item.id || index"
          class="flex w-full h-40 p-4 items-center gap-3 bg-[#6A6A6A] rounded-[5px] cursor-pointer hover:bg-[#7A7A7A] transition-colors"
          @click="viewHistoryItem(item)"
        >
          <div class="flex w-full flex-col items-start gap-3">
            <img 
              :src="getHistoryImage(item)" 
              :alt="`生成圖片 ${index + 1}`" 
              class="h-24 w-full object-cover rounded"
              @error="handleImageError"
            />
            <div class="text-white font-normal text-xs">
              {{ formatDate(item.created_at || item.date || item.timestamp) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- History Detail Modal -->
    <HistoryDetailModal 
      :isVisible="showDetailModal"
      :historyItem="selectedHistoryItem"
      @close="closeDetailModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { roadshowService } from '../../services/roadshowService.js'
import UsageCounter from './UsageCounter.vue'
import HistoryDetailModal from './HistoryDetailModal.vue'

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

const emit = defineEmits(['back'])

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
      console.log('✅ 歷史數據載入成功，共', avatars.length, '張圖片');
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



// 獲取歷史圖片URL
function getHistoryImage(item) {
  if (!item || !item.image) {
    return '/images/default_history.png'; // 預設圖片
  }
  
  // 如果圖片URL是相對路徑，添加API基礎URL
  if (item.image.startsWith('/')) {
    return `https://stg-line-crm.fanpokka.ai${item.image}`;
  }
  
  return item.image;
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
  console.warn('圖片載入失敗:', event.target.src);
  // 設置預設圖片
  event.target.src = '/images/default_history.png';
}

// 查看歷史項目詳情
function viewHistoryItem(item) {
  console.log('查看歷史項目:', item)
  selectedHistoryItem.value = item
  showDetailModal.value = true
}

// 關閉詳情彈窗
function closeDetailModal() {
  showDetailModal.value = false
  selectedHistoryItem.value = null
}

function goBack() {
  emit('back')
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
