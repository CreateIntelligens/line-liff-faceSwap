<template>
  <!-- Modal Overlay -->
  <div 
    v-if="isVisible" 
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 max-sm:items-start max-sm:justify-start"
    @click="closeModal"
  >
    <!-- Modal Content -->
    <div 
      class="bg-[#333333] w-[375px] h-[774px] max-md:w-full max-md:max-w-screen-md max-sm:w-full max-sm:h-full max-sm:min-h-screen overflow-y-auto flex flex-col"
      @click.stop
    >
      <!-- Header -->
      <div class="flex justify-between items-center px-5 py-5 border-b border-[#EBD8B2]">
        <!-- Back arrow -->
        <button 
          class="w-[17px] h-[19px] cursor-pointer hover:opacity-80 transition-opacity"
          @click="closeModal"
        >
          <img 
            :src="imageUrls.back"
            alt="Back Arrow"
            class="w-[17px] h-[19px] object-contain"
          />
        </button>
        
        <!-- Title -->
        <div class="font-noto-sans-tc text-xl font-bold text-[#EBD8B2]">
          生成詳情
        </div>
        
        <!-- Usage counter -->
        <UsageCounter :currentCount="props.userUsage" :maxLimit="10" />
      </div>

      <!-- Modal Body -->
      <div class="flex-1 px-8 pb-8 pt-8 bg-[#E8E8E8]">
        <div class="bg-[#333333] p-6">
          <!-- 載入狀態 -->
          <div v-if="isLoading" class="flex flex-col items-center justify-center h-60">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EBD8B2] mb-4"></div>
            <div class="text-[#EBD8B2] text-center">
              <div class="text-lg font-bold mb-2">載入中...</div>
              <div class="text-sm">正在獲取生成詳情</div>
            </div>
          </div>

          <!-- 錯誤狀態 -->
          <div v-else-if="error" class="flex flex-col items-center justify-center h-60">
            <div class="text-red-400 text-center">
              <div class="text-lg font-bold mb-2">載入失敗</div>
              <div class="text-sm mb-4">{{ error }}</div>
              <button 
                @click="loadHistoryDetail"
                class="px-4 py-2 bg-[#EBD8B2] text-[#333] rounded-md hover:bg-[#d4c29a] transition-colors"
              >
                重試
              </button>
            </div>
          </div>

          <!-- 詳情內容 -->
          <div v-else-if="historyDetail" ref="detailArea" class="space-y-6">

          <!-- Header Logo and Crown -->
          <div class="relative flex justify-center">
            <img 
              :src="imageUrls.header" 
              class="h-6 object-contain mx-auto" 
              alt="標準字" 
            />
            <img 
              :src="imageUrls.crown" 
              class="absolute -right-0 top-5 w-12 h-12 object-contain transform -rotate-[14.809deg] z-50" 
              alt="皇冠" 
            />
          </div>

          <!-- Images Section -->
          <div class="space-y-6">
            <!-- Original Image with Star -->
            <div class="relative">
              <img 
                :src="getTemplateImage(historyDetail.template_id)" 
                :alt="`模板圖片 - ${getTemplateName(historyDetail.template_id)}`" 
                class="w-full object-cover rounded-md"
                @error="handleTemplateImageError"
              />
              <img 
                :src="imageUrls.star" 
                class="absolute -left-2 -bottom-9 w-12 h-12 object-contain" 
                alt="星" 
              />
            </div>

            <!-- Result Image -->
            <div v-if="getHistoryImage(historyDetail)">
              <div class="mb-4">
                <img 
                  class="w-full object-cover rounded-md" 
                  :src="getHistoryImage(historyDetail)" 
                  alt="生成結果"
                  @error="handleResultImageError"
                  @load="handleImageLoad"
                />
                <div v-if="imageLoadErrors[getHistoryImage(historyDetail)]" class="text-center text-red-400 text-sm mt-2">
                  ⚠️ 圖片載入失敗，請檢查網路連線
                </div>
              </div>
            </div>
            <div v-else class="w-full h-60 bg-gray-700 rounded-md flex items-center justify-center">
              <div class="text-[#EBD8B2] text-center">
                <div class="text-lg font-bold mb-2">生成中...</div>
                <div class="text-sm">請稍候，正在處理您的圖片</div>
              </div>
            </div>

            <!-- Bottom Logo -->
            <div class="flex justify-center">
              <img 
                :src="imageUrls.logo" 
                class="h-7 object-contain mx-auto" 
                alt="0815" 
              />
            </div>
          </div>


          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="bg-[#333333] px-12 py-8">
        <div class="flex gap-3 mb-8">
          <!-- Regenerate Button -->
          <button 
            class="flex-1 h-11 flex justify-center items-center rounded-md bg-[#EBD8B2] cursor-pointer hover:bg-[#d4c29a] transition-colors"
            @click="regenerate"
          >
            <div class="font-noto-sans-tc text-base font-bold text-[#333]">
              重新生成
            </div>
          </button>
          
          <!-- Download Button -->
          <button 
            class="flex-1 h-11 flex justify-center items-center rounded-md cursor-pointer transition-all duration-300"
            :class="
              historyDetail && historyDetail.status === 'completed' && !isDownloading
                ? 'bg-gradient-to-r from-[#EE95FF] via-[#B9B9FB] to-[#AFCBF7] hover:shadow-lg'
                : 'bg-[#C7C7C7] cursor-not-allowed'
            "
            @click="downloadToOfficial"
            :disabled="!historyDetail || historyDetail.status !== 'completed' || isDownloading"
          >
            <div v-if="isDownloading" class="flex items-center gap-2">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-[#333]"></div>
              <div class="font-noto-sans-tc text-base font-bold text-[#333]">
                處理中...
              </div>
            </div>
            <div v-else class="font-noto-sans-tc text-base font-bold text-[#333]">
              下載至官方帳號
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { roadshowService } from '../../services/roadshowService.js'
import { imageUrls } from '@/config/imageUrls'
import UsageCounter from './UsageCounter.vue'
import { useScreenshot } from '../../composables/useScreenshot.js'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  historyItem: {
    type: Object,
    default: null
  },
  userUsage: {
    type: Number,
    default: 0
  },
  userId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close', 'regenerate', 'download'])

const isLoading = ref(false)
const error = ref(null)
const historyDetail = ref(null)
const imageLoadErrors = ref({})

// 截圖相關狀態
const detailArea = ref(null)
const isDownloading = ref(false)

// 使用截圖 composable
const { captureScreenshot, compressImage, downloadToLocal, uploadImage, sendViaLiff, showMessage } = useScreenshot()

// 監聽彈窗顯示狀態
watch(() => props.isVisible, (newValue) => {
  if (newValue && props.historyItem) {
    console.log('🔄 HistoryDetailModal - 接收到歷史項目:', props.historyItem)
    loadHistoryDetail()
  }
})

// 載入歷史詳情
async function loadHistoryDetail() {
  if (!props.historyItem) {
    error.value = '沒有歷史項目數據'
    return
  }

  try {
    isLoading.value = true
    error.value = null
    
    console.log('📥 開始載入歷史詳情:', props.historyItem)
    
    // 直接使用傳入的歷史項目數據
    historyDetail.value = {
      ...props.historyItem,
      // 確保圖片URL正確
      image: getHistoryImage(props.historyItem)
    }
    
    console.log('✅ 歷史詳情載入完成:', historyDetail.value)
    
  } catch (err) {
    console.error('❌ 載入歷史詳情失敗:', err)
    error.value = `載入失敗: ${err.message}`
  } finally {
    isLoading.value = false
  }
}

// 獲取模板圖片URL
function getTemplateImage(templateId) {
  console.log('🎨 獲取模板圖片，templateId:', templateId)
  
  // 支持字符串和數字形式的 template_id
  const imageMap = {
    // 字符串形式
    'play': imageUrls.play,
    'wife': imageUrls.wife,
    'love': imageUrls.love,
    'super': imageUrls.super,
    // 數字形式 (根據 FaceSwapUpload.vue 中的映射)
    '1': imageUrls.play, // 綜藝玩很大
    '2': imageUrls.wife, // 犀利人妻
    '3': imageUrls.love, // 命中註定我愛你
    '4': imageUrls.super  // 超級夜總會
  }
  
  const imageUrl = imageMap[templateId] || imageUrls.play
  console.log('🎨 模板圖片URL:', imageUrl)
  return imageUrl
}

// 獲取模板名稱
function getTemplateName(templateId) {
  // 支持字符串和數字形式的 template_id
  const nameMap = {
    // 字符串形式
    'play': '綜藝玩很大',
    'wife': '犀利人妻',
    'love': '命中註定我愛你',
    'super': '超級夜總會',
    // 數字形式 (根據 FaceSwapUpload.vue 中的映射)
    '1': '綜藝玩很大',
    '2': '犀利人妻',
    '3': '命中註定我愛你',
    '4': '超級夜總會'
  }
  
  return nameMap[templateId] || '預設模板'
}

// 獲取歷史圖片URL，使用新的圖片處理 API
function getHistoryImage(item) {
  if (!item) {
    console.log('❌ 沒有歷史項目數據')
    return null
  }
  
  console.log('🖼️ 處理歷史圖片，原始數據:', item)
  
  // 嘗試多個可能的圖片字段
  const imageUrl = item.image || item.image_url || item.result_image || item.generated_image
  
  if (!imageUrl) {
    console.log('❌ 沒有找到圖片URL')
    return null
  }
  
  console.log('🖼️ 找到圖片URL:', imageUrl)
  
  let fullUrl = imageUrl;
  
  // 如果圖片URL是相對路徑，添加API基礎URL
  if (imageUrl.startsWith('/')) {
    fullUrl = `https://stg-line-crm.fanpokka.ai${imageUrl}`
    console.log('🖼️ 完整圖片URL:', fullUrl)
  }
  
  // 使用新的圖片處理 API 來優化歷史圖片
  try {
    console.log('🔄 使用新 API 處理歷史圖片:', fullUrl)
    
    // 從全局配置獲取圖片處理 API 設置
    const config = window.endpoint || {};
    const apiUrl = config.imageProcessApi || 'https://stg-api.fanpokka.ai/api/static-resource';
    const params = config.imageProcessParams || { scale: 1.5, format: 'jpg', quality: 85, width: 600, height: 450 };
    
    // 構建查詢參數
    const queryParams = new URLSearchParams();
    queryParams.append('url', fullUrl);
    if (params.scale) queryParams.append('scale', params.scale);
    if (params.format) queryParams.append('format', params.format);
    if (params.quality) queryParams.append('quality', params.quality);
    if (params.width) queryParams.append('width', params.width);
    if (params.height) queryParams.append('height', params.height);
    
    const processedImageUrl = `${apiUrl}?${queryParams.toString()}`;
    console.log('✅ 歷史圖片處理 API URL:', processedImageUrl);
    
    return processedImageUrl;
  } catch (error) {
    console.error('❌ 處理歷史圖片時發生錯誤:', error)
    // 如果處理失敗，返回原始圖片
    return fullUrl
  }
}

// 處理模板圖片載入錯誤
function handleTemplateImageError(event) {
  const imageUrl = event.target.src;
  console.warn('❌ 模板圖片載入失敗:', imageUrl)
  
  // 避免無限迴圈：檢查是否已經是預設圖片或錯誤圖片
  if (imageUrl.includes('default_template.png') || imageUrl.includes('data:image/svg+xml')) {
    console.log('🔄 已經是預設圖片，停止重試');
    return;
  }
  
  // 設置一個簡單的 SVG 預設圖片，避免網路請求
  const defaultSvg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMzMzMzMzIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7nq6DoioLlm77niYc8L3RleHQ+Cjwvc3ZnPgo=';
  event.target.src = defaultSvg;
  
  // 記錄錯誤，但不重試
  console.log('🔄 設置預設 SVG 圖片，避免無限迴圈');
}

// 處理圖片載入成功
function handleImageLoad(event) {
  const imageUrl = event.target.src;
  // 移除錯誤標記
  if (imageLoadErrors.value[imageUrl]) {
    delete imageLoadErrors.value[imageUrl];
  }
}

// 處理圖片載入錯誤
function handleImageError(event) {
  const imageUrl = event.target.src;
  console.warn('❌ 圖片載入失敗:', imageUrl);
  
  // 記錄錯誤
  imageLoadErrors.value[imageUrl] = true;
}

// 處理結果圖片載入錯誤
function handleResultImageError(event) {
  const imageUrl = event.target.src;
  console.warn('❌ 結果圖片載入失敗:', imageUrl)
  
  // 記錄錯誤
  imageLoadErrors.value[imageUrl] = true;
  
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

// 格式化日期
function formatDate(dateString) {
  if (!dateString) {
    return '未知時間'
  }
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return '未知時間'
    }
    
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    
    return `${year}/${month}/${day} ${hours}:${minutes}`
  } catch (error) {
    console.error('日期格式化錯誤:', error)
    return '未知時間'
  }
}

// 獲取狀態文字
function getStatusText(status) {
  const statusMap = {
    'completed': '已完成',
    'pending': '等待中',
    'processing': '處理中',
    'failed': '失敗'
  }
  
  return statusMap[status] || status || '未知'
}

// 重新生成
function regenerate() {
  console.log('🔄 重新生成歷史項目')
  emit('regenerate', historyDetail.value)
}

// 下載至官方帳號
async function downloadToOfficial() {
  if (!historyDetail.value || historyDetail.value.status !== 'completed') {
    console.warn('⚠️ 歷史項目尚未完成，無法下載')
    showMessage('歷史項目尚未完成，無法下載', 'error')
    return
  }

  if (isDownloading.value) {
    console.log('⏳ 正在處理中，請稍候...')
    return
  }

  try {
    isDownloading.value = true
    console.log('📥 開始下載歷史項目至官方帳號流程')
    
    // 1. 截圖
    const canvas = await captureScreenshot(detailArea.value)
    console.log('✅ 截圖完成')
    
    // 2. 轉換為 Blob
    const blob = await compressImage(canvas)
    console.log('✅ 圖片處理完成')
    
    // 本地測試：先下載到本機確認圖片
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('🧪 本地測試模式：下載截圖到本機')
      downloadToLocal(blob, 'history-detail')
      showMessage('截圖已下載到本機，請檢查圖片品質', 'success')
      return
    }
    
    // 3. 上傳到伺服器
    const imageUrl = await uploadImage(blob, props.userId || 'abc', 'history-detail')
    console.log('✅ 圖片上傳完成:', imageUrl)
    
    // 4. 透過 LIFF 發送
    await sendViaLiff(imageUrl)
    console.log('✅ 發送完成')
    
    showMessage('圖片已成功發送到官方帳號！', 'success')
    
  } catch (error) {
    console.error('❌ 下載流程失敗:', error)
    showMessage(`下載失敗: ${error.message}`, 'error')
  } finally {
    isDownloading.value = false
  }
}


// 關閉彈窗
function closeModal() {
  emit('close')
}
</script>
