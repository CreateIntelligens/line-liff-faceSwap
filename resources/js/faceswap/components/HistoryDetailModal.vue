<template>
  <div 
    v-if="isVisible" 
    class="relative mx-auto my-0 w-[375px] max-md:w-full max-md:max-w-screen-md max-sm:w-full flex flex-col overflow-y-auto"
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
            @click="closeModal"
          >
            <img 
              :src="imageUrls.back"
              alt="Back Arrow"
              class="w-[26px] h-[26px] object-contain"
            />
          </button>
          
          <!-- Title -->
          <div class="text-xl font-bold cp-font text-[#FFFFFF]">
            生成詳情
          </div>
        </div>

        <!-- Usage counter (only show 已抽籤，不可點擊) -->
        <UsageCounter :currentCount="props.userUsage" :showHistoryLabel="false" />
      </div>

      <!-- Modal Body -->
      <div class="flex-1">
          <!-- 載入狀態 -->
          <div v-if="isLoading" class="flex flex-col items-center justify-center h-60">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 mb-4" style="border-color: #E0BE91;"></div>
            <div class="text-center" style="color: #E0BE91;">
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
          <div v-else-if="historyDetail" class="space-y-6 px-4 pt-8">
            <!-- Result Image -->
            <template v-if="getHistoryImage(historyDetail)">
              <div class="mb-4">
                <img 
                  class="w-full object-contain rounded-md" 
                  :src="getHistoryImage(historyDetail)" 
                  alt="生成結果"
                  @error="handleResultImageError"
                  @load="handleImageLoad"
                />
                <div v-if="imageLoadErrors[getHistoryImage(historyDetail)]" class="text-center text-red-400 text-sm mt-2">
                  ⚠️ 圖片載入失敗，請檢查網路連線
                </div>
              </div>
            </template>
            <div v-else class="w-full h-60 bg-gray-700 rounded-md flex items-center justify-center">
              <div class="text-center" style="color: #E0BE91;">
                <div class="text-lg font-bold mb-2">無法載入圖片</div>
                <div class="text-xs mt-2">歷史項目: {{ historyDetail?.id || '無ID' }}</div>
                <div class="text-xs">圖片字段: {{ historyDetail?.image || historyDetail?.image_url || historyDetail?.result_image || '無' }}</div>
              </div>
            </div>
          </div>
      </div>

      <!-- Action Buttons -->
      <div class="px-4 pt-4 pb-8">
        <div class="flex gap-3 mb-8">
          <!-- 再抽一次 Button -->
          <button 
            class="flex-1 cursor-pointer transition-opacity hover:opacity-80"
            @click="regenerate"
          >
            <img
              :src="imageUrls.drawAgain"
              alt="再抽一次"
              class="w-full h-auto object-contain"
            />
          </button>
          
          <!-- 分享好友 Button -->
          <button 
            class="flex-1 cursor-pointer transition-opacity hover:opacity-80"
            :class="
              historyDetail && historyDetail.status === 'completed' && !isDownloading
                ? ''
                : 'opacity-50 cursor-not-allowed'
            "
            @click="downloadToOfficial"
            :disabled="!historyDetail || historyDetail.status !== 'completed' || isDownloading"
          >
            <img
              :src="imageUrls.share"
              alt="分享好友"
              class="w-full h-auto object-contain"
            />
          </button>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { roadshowService } from '../../services/roadshowService.js'
import { imageUrls } from '@/config/imageUrls'
import UsageCounter from './UsageCounter.vue'

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
const isDownloading = ref(false)

// 使用截圖 composable
// 顯示訊息函數
function showMessage(message, type = 'info') {
  if (type === 'success') {
    alert(message)
  } else if (type === 'error') {
    alert(message)
  } else {
    console.log(message)
  }
}

// 使用 Canvas 下載圖片（後備方案）
async function downloadImageViaCanvas(imageUrl, filename) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    // 嘗試設置 crossOrigin，但如果失敗則不設置（允許同源或已設置 CORS 的圖片）
    try {
      img.crossOrigin = 'anonymous'
    } catch (e) {
      console.warn('⚠️ 無法設置 crossOrigin:', e)
    }
    
    img.onload = function() {
      try {
        console.log('✅ 圖片載入成功，開始轉換為 Canvas')
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        console.log('✅ Canvas 繪製完成，尺寸:', canvas.width, 'x', canvas.height)
        
        canvas.toBlob((blob) => {
          if (!blob) {
            console.error('❌ Canvas 轉換為 Blob 失敗')
            reject(new Error('Canvas 轉換失敗'))
            return
          }
          
          console.log('✅ Blob 創建成功，大小:', blob.size, 'bytes')
          const blobUrl = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = blobUrl
          link.download = filename
          link.style.display = 'none'
          document.body.appendChild(link)
          link.click()
          console.log('✅ 下載連結已觸發')
          
          setTimeout(() => {
            document.body.removeChild(link)
            window.URL.revokeObjectURL(blobUrl)
          }, 100)
          
          resolve()
        }, 'image/jpeg', 0.95)
      } catch (error) {
        console.error('❌ Canvas 處理錯誤:', error)
        reject(error)
      }
    }
    
    img.onerror = function(event) {
      console.error('❌ 圖片載入失敗:', event)
      console.error('❌ 圖片 URL:', imageUrl)
      reject(new Error('圖片載入失敗，可能是 CORS 問題'))
    }
    
    console.log('🖼️ 開始載入圖片:', imageUrl)
    img.src = imageUrl
  })
}

// 透過 LIFF 分享文字和連結（僅使用 shareTargetPicker）
async function shareViaLiff() {
  if (typeof liff === 'undefined') {
    throw new Error('LIFF SDK 未載入，請確保在 LINE 環境中使用')
  }
  
  const shareUrl = (window.endpoint && window.endpoint.domain) 
    ? `${window.endpoint.domain}/`
    : 'https://line-liff-face-swap-draw-lots-2026.vercel.app/'
  const shareText = '面相指路，靈籤定運\n從五官看你馬年運勢，仙女下凡來解答！馬上點擊下方籤筒，即可得你的專屬幸運靈籤~\n開始測算：' + shareUrl
  
  if (!liff.shareTargetPicker) {
    throw new Error('目前裝置暫不支援好友分享功能')
  }
  
  const result = await liff.shareTargetPicker([
    {
      type: 'text',
      text: shareText
    }
  ])
  
  if (result === null) {
    throw new Error('已取消分享')
  }
}

// 監聽彈窗顯示狀態和歷史項目變化
watch(() => props.isVisible, (newValue) => {
  if (newValue && props.historyItem) {
    console.log('🔄 HistoryDetailModal - 彈窗顯示，接收到歷史項目:', props.historyItem)
    loadHistoryDetail()
  }
}, { immediate: true })

watch(() => props.historyItem, (newItem) => {
  if (props.isVisible && newItem) {
    console.log('🔄 HistoryDetailModal - 歷史項目更新:', newItem)
    loadHistoryDetail()
  }
}, { immediate: true })

// 組件掛載時，如果已經有數據則載入
onMounted(() => {
  if (props.isVisible && props.historyItem) {
    console.log('🚀 HistoryDetailModal - 組件掛載，載入歷史詳情')
    loadHistoryDetail()
  }
})

// 載入歷史詳情
async function loadHistoryDetail() {
  if (!props.historyItem) {
    error.value = '沒有歷史項目數據'
    console.error('❌ 沒有歷史項目數據')
    return
  }

  try {
    isLoading.value = true
    error.value = null
    
    console.log('📥 開始載入歷史詳情:', props.historyItem)
    console.log('📋 歷史項目完整數據:', JSON.stringify(props.historyItem, null, 2))
    
    // 直接使用傳入的歷史項目數據
    historyDetail.value = {
      ...props.historyItem
    }
    
    // 檢查圖片 URL
    const imageUrl = getHistoryImage(historyDetail.value)
    console.log('🖼️ 獲取到的圖片 URL:', imageUrl)
    
    if (!imageUrl) {
      console.warn('⚠️ 無法獲取圖片 URL，歷史項目數據:', historyDetail.value)
    }
    
    console.log('✅ 歷史詳情載入完成:', historyDetail.value)
    
  } catch (err) {
    console.error('❌ 載入歷史詳情失敗:', err)
    error.value = `載入失敗: ${err.message}`
  } finally {
    isLoading.value = false
  }
}

function getTemplateImage(templateId) {
  const imageMap = {
    'a1art1': imageUrls.a1art1,
    'a1art2': imageUrls.a1art2,
    'a1art3': imageUrls.a1art3,
    'a1art4': imageUrls.a1art4,
    '0': imageUrls.a1art1,
    '1': imageUrls.a1art2,
    '2': imageUrls.a1art3,
    '3': imageUrls.a1art4
  }
  
  return imageMap[templateId] || imageUrls.a1art1
}

function getTemplateName(templateId) {
  const nameMap = {
    'a1art1': '動漫展-90年代漫畫顛',
    'a1art2': '動漫展-90年代漫畫顛',
    'a1art3': '動漫展-90年代漫畫顛',
    'a1art4': '動漫展-90年代漫畫顛',
    '0': '動漫展-90年代漫畫顛',
    '1': '動漫展-90年代漫畫顛',
    '2': '動漫展-90年代漫畫顛',
    '3': '動漫展-90年代漫畫顛'
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

// 分享文字與連結
async function downloadToOfficial() {
  if (!historyDetail.value || historyDetail.value.status !== 'completed') {
    console.warn('⚠️ 歷史項目尚未完成，無法分享')
    showMessage('歷史項目尚未完成，無法分享', 'error')
    return
  }

  if (isDownloading.value) {
    console.log('⏳ 正在處理中，請稍候...')
    return
  }

  try {
    isDownloading.value = true
    
    // 本地測試：顯示分享文字
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      const shareUrl = (window.endpoint && window.endpoint.domain) 
        ? `${window.endpoint.domain}/`
        : 'https://line-liff-face-swap-draw-lots-2026.vercel.app/'
      const shareText = '面相指路，靈籤定運\\n從五官看你馬年運勢，仙女下凡來解答！馬上點擊下方籤筒，即可得你的專屬幸運靈籤~\\n開始測算：' + shareUrl
      console.log('📤 分享內容:', shareText)
      alert('分享內容：\\n\\n' + shareText)
      showMessage('分享內容已顯示（本地測試模式）', 'success')
      return
    }
    
    // 生產環境：透過 LIFF 分享
    console.log('📤 準備分享文字和連結')
    await shareViaLiff()
    console.log('✅ 分享完成')
    
    showMessage('已成功分享！', 'success')
    
  } catch (error) {
    console.error('❌ 分享流程失敗:', error)
    showMessage(`分享失敗: ${error.message}`, 'error')
  } finally {
    isDownloading.value = false
    // 不更動其他載入訊息，保持原本狀態
  }
}


// 關閉彈窗
function closeModal() {
  emit('close')
}
</script>

