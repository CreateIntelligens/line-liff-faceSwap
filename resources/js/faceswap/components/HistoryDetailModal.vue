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
      <div class="flex justify-between items-center px-5 py-5 gradient-border-bottom">
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
        
        <!-- Usage counter -->
        <UsageCounter :currentCount="props.userUsage" />
      </div>

      <!-- Modal Body -->
      <div class="flex-1 flex items-center justify-center">
          <!-- 載入狀態 -->
          <div v-if="isLoading" class="flex flex-col items-center justify-center h-60">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFC1DE] mb-4"></div>
            <div class="text-[#FFC1DE] text-center">
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
          <div v-else-if="historyDetail" class="w-full px-4 py-8">
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
              <div class="text-[#FFC1DE] text-center">
                <div class="text-lg font-bold mb-2">無法載入圖片</div>
                <div class="text-xs mt-2">歷史項目: {{ historyDetail?.id || '無ID' }}</div>
                <div class="text-xs">圖片字段: {{ historyDetail?.image || historyDetail?.image_url || historyDetail?.result_image || '無' }}</div>
              </div>
            </div>
          </div>
      </div>

      <!-- Action Buttons -->
      <div class="px-12 py-8">
        <div class="flex gap-3 mb-8">
          <!-- Regenerate Button -->
          <button 
            class="flex-1 h-11 flex justify-center items-center rounded-md cursor-pointer transition-colors text-base font-bold cp-font text-[#0E0E0E]"
            style="background-color: #FFF3AB;"
            @click="regenerate"
          >
            重新生成
          </button>
          
          <!-- Download Button -->
          <button 
            class="flex-1 h-11 flex justify-center items-center rounded-md cursor-pointer transition-all duration-300 text-base font-bold hover:shadow-lg"
            style="background: linear-gradient(to bottom, #FFC1DE 0%, #FD79B5 100%);"
            :class="
              historyDetail && historyDetail.status === 'completed' && !isDownloading
                ? ''
                : 'opacity-50 cursor-not-allowed'
            "
            @click="downloadToOfficial"
            :disabled="!historyDetail || historyDetail.status !== 'completed' || isDownloading"
          >
            <div v-if="isDownloading" class="flex items-center gap-2">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0E0E0E]"></div>
              <div class="cp-font text-[#0E0E0E]">
                處理中...
              </div>
            </div>
            <div v-else class="cp-font text-[#0E0E0E]">
              下載至官方帳號
            </div>
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

// 透過 LIFF 發送圖片
async function sendViaLiff(imageUrl) {
  try {
    if (typeof liff === 'undefined') {
      throw new Error('LIFF SDK 未載入，請確保在 LINE 環境中使用')
    }
    
    // 檢查是否已登入（這是必要條件）
    if (!liff.isLoggedIn()) {
      throw new Error('用戶未登入，無法發送訊息。請先登入 LINE 帳號。')
    }
    
    // 檢查是否在 LINE 應用內（在某些 LINE 版本中，即使 isInClient 為 false，只要已登入仍可發送）
    const isInClient = liff.isInClient()
    console.log('📱 LIFF 環境檢查:', {
      isInClient: isInClient,
      isLoggedIn: liff.isLoggedIn(),
      os: liff.getOS(),
      version: liff.getVersion()
    })
    
    // 如果不在 LINE 應用內，給出警告但仍嘗試發送（某些情況下仍可成功）
    if (!isInClient) {
      console.warn('⚠️ 檢測到不在 LINE 應用內，但仍嘗試發送訊息')
    }
    
    // 嘗試發送訊息
    await liff.sendMessages([
      {
        type: 'image',
        originalContentUrl: imageUrl,
        previewImageUrl: imageUrl
      }
    ])
    
    console.log('✅ 圖片發送成功')
  } catch (error) {
    console.error('❌ 發送訊息失敗:', error)
    
    // 如果是因為不在 LINE 應用內而失敗，給出更明確的錯誤訊息
    if (error.message && error.message.includes('isInClient')) {
      throw new Error('無法發送訊息。請確保在 LINE 應用內開啟此頁面。')
    }
    
    if (error.message) {
      throw error
    } else {
      throw new Error(`發送失敗: ${error.toString()}`)
    }
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

  // 獲取圖片 URL（顯示用的處理後 URL）
  const displayImageUrl = getHistoryImage(historyDetail.value)
  if (!displayImageUrl) {
    console.warn('⚠️ 沒有圖片，無法下載')
    showMessage('沒有圖片，無法下載', 'error')
    return
  }

  // 在本地測試時，使用原始圖片 URL（避免 CORS 問題）
  // 原始圖片 URL 來自 historyDetail.value.image
  const originalImageUrl = historyDetail.value?.image || displayImageUrl
  const downloadImageUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
    ? originalImageUrl 
    : displayImageUrl

  try {
    isDownloading.value = true
    console.log('📥 開始下載歷史項目至官方帳號流程')
    
    // 本地測試：先下載到本機確認圖片
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('🧪 本地測試模式：下載圖片到本機')
      console.log('📸 顯示用圖片 URL:', displayImageUrl)
      console.log('📸 下載用原始圖片 URL:', downloadImageUrl)
      
      try {
        // 方法1: 使用 XMLHttpRequest 下載圖片（更可靠，支持跨域）
        const blob = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest()
          xhr.open('GET', downloadImageUrl, true)
          xhr.responseType = 'blob'
          
          xhr.onload = function() {
            if (xhr.status === 200) {
              resolve(xhr.response)
            } else {
              reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`))
            }
          }
          
          xhr.onerror = function() {
            reject(new Error('網路錯誤，無法下載圖片'))
          }
          
          xhr.onabort = function() {
            reject(new Error('下載被取消'))
          }
          
          xhr.send()
        })
        
        // 創建 blob URL 並下載
        const blobUrl = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = blobUrl
        link.download = `history-detail-${Date.now()}.jpg`
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        
        // 延遲清理，確保下載開始
        setTimeout(() => {
          document.body.removeChild(link)
          window.URL.revokeObjectURL(blobUrl)
        }, 100)
        
        console.log('✅ 圖片已下載到本機')
        showMessage('圖片已下載到本機', 'success')
      } catch (downloadError) {
        console.error('❌ 下載圖片失敗:', downloadError)
        console.error('❌ 錯誤詳情:', {
          message: downloadError.message,
          stack: downloadError.stack,
          downloadImageUrl: downloadImageUrl,
          displayImageUrl: displayImageUrl
        })
        
        // 如果 XMLHttpRequest 也失敗，嘗試使用 canvas 方式
        try {
          await downloadImageViaCanvas(downloadImageUrl, 'history-detail.jpg')
          showMessage('圖片已下載到本機', 'success')
        } catch (canvasError) {
          console.error('❌ Canvas 下載也失敗:', canvasError)
          // 最後的後備方案：直接打開連結
          window.open(downloadImageUrl, '_blank')
          showMessage('下載失敗，已在新視窗打開圖片連結', 'error')
        }
      }
      return
    }
    
    // 生產環境：透過 LIFF 發送（使用顯示用的處理後 URL）
    await sendViaLiff(displayImageUrl)
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

