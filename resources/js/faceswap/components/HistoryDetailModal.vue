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
                <!-- 如果任務還在處理中，顯示處理中狀態 -->
                <template v-if="historyDetail?.status === 'processing' || historyDetail?.status === 'pending'">
                  <div class="animate-spin rounded-full h-12 w-12 border-b-2 mb-4 mx-auto" style="border-color: #E0BE91;"></div>
                  <div class="text-lg font-bold mb-2">
                    {{ historyDetail?.status === 'pending' ? '任務等待中' : '正在處理中' }}
                  </div>
                  <div class="text-sm">
                    {{ historyDetail?.status === 'pending' ? '正在排隊處理...' : '請稍候，正在生成您的頭像...' }}
                  </div>
                </template>
                <!-- 如果任務已完成但沒有圖片，顯示無法載入 -->
                <template v-else>
                  <div class="text-lg font-bold mb-2">無法載入圖片</div>
                  <div class="text-xs mt-2">歷史項目: {{ historyDetail?.id || '無ID' }}</div>
                  <div class="text-xs">圖片字段: {{ historyDetail?.image || historyDetail?.image_url || historyDetail?.result_image || '無' }}</div>
                </template>
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
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue'
import { roadshowService } from '../../services/roadshowService.js'
import { modeService } from '../../services/modeService.js'
import { imageUrls } from '@/config/imageUrls'
import UsageCounter from './UsageCounter.vue'
import { appConfig } from '@/config/appConfig'

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

const emit = defineEmits(['close', 'regenerate', 'download', 'update'])

const isLoading = ref(false)
const error = ref(null)
const historyDetail = ref(null)
const imageLoadErrors = ref({})

// 截圖相關狀態
const isDownloading = ref(false)

// 任務狀態檢查定時器
const taskStatusCheckInterval = ref(null)
const isTaskCompleted = ref(false) // 標記任務是否已完成
const isLoadingDetail = ref(false) // 防止重複載入

// 使用截圖 composable
// 顯示訊息函數
function showMessage(message, type = 'info') {
  if (type === 'success') {
    alert(message)
  } else if (type === 'error') {
    alert(message)
  } else if (type === 'info') {
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
    ? `${window.endpoint.domain}`
    : 'https://line-liff-face-swap-draw-lots-2026.vercel.app'
  const shareText = '面相指路，靈籤定運\n從五官看你馬年運勢，仙女下凡來解答！馬上點擊下方籤筒，即可得你的專屬幸運靈籤~\n開始測算：' + shareUrl
  
  // 檢查 shareTargetPicker 是否存在
  console.log('🔍 檢查 LIFF shareTargetPicker:', {
    hasLiff: typeof liff !== 'undefined',
    isInClient: liff.isInClient(),
    hasShareTargetPicker: !!liff.shareTargetPicker
  })
  
  if (!liff.shareTargetPicker) {
    throw new Error('目前裝置暫不支援好友分享功能')
  }
  
  // 呼叫 shareTargetPicker，讓使用者選好友／群組
  console.log('📤 準備呼叫 liff.shareTargetPicker...')
  const result = await liff.shareTargetPicker([
    {
      type: 'text',
      text: shareText
    }
  ])
  
  console.log('📥 shareTargetPicker 返回結果:', result)
  
  if (result === null) {
    throw new Error('已取消分享')
  }
}

// 透過 Web Share API 分享（Email 模式使用）
async function shareViaWeb() {
  if (!navigator.share) {
    throw new Error('目前裝置暫不支援分享功能')
  }

  const shareUrl = (window.endpoint && window.endpoint.domain) 
    ? `${window.endpoint.domain}`
    : 'https://line-liff-face-swap-draw-lots-2026.vercel.app'
  const shareText = '面相指路，靈籤定運\n從五官看你馬年運勢，仙女下凡來解答！馬上點擊下方籤筒，即可得你的專屬幸運靈籤~\n開始測算：' + shareUrl

  try {
    await navigator.share({
      title: '面相指路，靈籤定運',
      text: shareText,
      url: shareUrl
    })
  } catch (error) {
    // 如果用戶取消分享，navigator.share 會拋出 AbortError
    if (error.name === 'AbortError') {
      throw new Error('已取消分享')
    }
    throw error
  }
}

// 監聽彈窗顯示狀態和歷史項目變化
watch(() => props.isVisible, (newValue, oldValue) => {
  if (newValue && props.historyItem) {
    // 只有在從隱藏變為顯示時才載入（避免重複載入）
    if (oldValue === false || oldValue === undefined) {
      console.log('🔄 HistoryDetailModal - 彈窗顯示，接收到歷史項目:', props.historyItem)
      // 清除舊的定時器
      clearTaskStatusInterval()
      loadHistoryDetail()
    }
  } else if (!newValue) {
    // 彈窗關閉時，清除定時器
    clearTaskStatusInterval()
    isLoadingDetail.value = false // 重置載入標記
  }
}, { immediate: true })

watch(() => props.historyItem, (newItem, oldItem) => {
  if (props.isVisible && newItem) {
    // 如果歷史項目 ID 改變，清除舊的定時器並載入
    if (oldItem && oldItem.id !== newItem.id) {
      clearTaskStatusInterval()
      isTaskCompleted.value = false
      isLoadingDetail.value = false // 重置載入標記
      console.log('🔄 HistoryDetailModal - 歷史項目 ID 改變，載入新項目:', newItem)
      loadHistoryDetail()
    }
    // 如果 ID 相同但狀態改變（例如從 processing 變為 failed），不需要重新載入
    // 因為 checkHistoryTaskStatus 會更新狀態
  }
}, { immediate: true })

// 組件掛載時，如果已經有數據則載入
onMounted(() => {
  if (props.isVisible && props.historyItem) {
    console.log('🚀 HistoryDetailModal - 組件掛載，載入歷史詳情')
    loadHistoryDetail()
  }
  
  // 添加頁面可見性監聽器
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      // 頁面重新可見時，如果任務還在進行中，重新啟動輪詢
      if (historyDetail.value?.id && !isTaskCompleted.value && !taskStatusCheckInterval.value) {
        const taskStatus = historyDetail.value.status
        if (taskStatus === 'pending' || taskStatus === 'processing') {
          console.log('👁️ HistoryDetailModal - 頁面重新可見，重新啟動任務狀態檢查輪詢')
          const interval = taskStatus === 'pending' ? 3000 : 2000
          startTaskStatusPolling(interval)
          checkHistoryTaskStatus()
        }
      } else if (historyDetail.value?.id && !isTaskCompleted.value && taskStatusCheckInterval.value) {
        // 如果已經有輪詢在運行，確保它繼續運行
        console.log('👁️ HistoryDetailModal - 頁面重新可見，輪詢已在運行中')
      }
    } else {
      // 頁面隱藏時，輪詢將繼續在背景運行
      console.log('👁️ HistoryDetailModal - 頁面已隱藏，輪詢將繼續在背景運行')
    }
  }
  
  document.addEventListener('visibilitychange', handleVisibilityChange)
  
  // 保存清理函數以便在卸載時使用
  window._cleanupHistoryDetailVisibilityListener = () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }
})

// 組件卸載前清理
onBeforeUnmount(() => {
  // 清理任務狀態檢查定時器
  clearTaskStatusInterval()
  
  // 清理頁面可見性監聽器
  if (window._cleanupHistoryDetailVisibilityListener) {
    window._cleanupHistoryDetailVisibilityListener()
    delete window._cleanupHistoryDetailVisibilityListener
  }
})

// 清理任務狀態檢查定時器
function clearTaskStatusInterval() {
  if (taskStatusCheckInterval.value) {
    clearInterval(taskStatusCheckInterval.value)
    taskStatusCheckInterval.value = null
    console.log('🧹 HistoryDetailModal - 已清除任務狀態檢查定時器')
  }
}

// 啟動任務狀態檢查輪詢
function startTaskStatusPolling(interval = 2000) {
  // 先清除舊的定時器（如果存在）
  clearTaskStatusInterval()
  
  // 如果任務已完成，不啟動輪詢
  if (isTaskCompleted.value) {
    return
  }
  
  // 如果沒有任務 ID，無法輪詢
  if (!historyDetail.value?.id) {
    return
  }
  
  // 如果任務狀態是 completed 且有圖片，不啟動輪詢
  if (historyDetail.value.status === 'completed') {
    const imageUrl = getHistoryImage(historyDetail.value)
    if (imageUrl) {
      isTaskCompleted.value = true
      console.log('✅ HistoryDetailModal - 任務已完成且有圖片，不啟動輪詢')
      return
    }
  }
  
  // 啟動新的輪詢
  taskStatusCheckInterval.value = setInterval(() => {
    // 如果任務已完成，停止輪詢
    if (isTaskCompleted.value) {
      clearTaskStatusInterval()
      return
    }
    checkHistoryTaskStatus()
  }, interval)
  
  console.log(`🔄 HistoryDetailModal - 已啟動任務狀態檢查輪詢（每 ${interval / 1000} 秒檢查一次）`)
}

// 檢查歷史任務狀態
async function checkHistoryTaskStatus() {
  if (!historyDetail.value?.id) {
    return
  }
  
  // 如果任務已完成且有圖片，不再檢查
  if (isTaskCompleted.value) {
    clearTaskStatusInterval()
    return
  }
  
  // 如果任務狀態是 completed 且有圖片，標記為完成並停止輪詢
  if (historyDetail.value.status === 'completed') {
    const imageUrl = getHistoryImage(historyDetail.value)
    if (imageUrl) {
      isTaskCompleted.value = true
      clearTaskStatusInterval()
      console.log('✅ HistoryDetailModal - 任務已完成且有圖片，停止輪詢')
      return
    }
  }
  
  try {
    console.log('🔍 HistoryDetailModal - 開始檢查任務狀態，taskId:', historyDetail.value.id)
    const result = await roadshowService.checkTaskStatus(historyDetail.value.id)
    console.log('📥 HistoryDetailModal - 任務狀態檢查結果:', result)
    
    // 檢查是否有錯誤
    if (result && result.error) {
      const errorStatus = result.error.status
      
      // 如果任務已經完成且有圖片，即使 API 返回錯誤也停止輪詢
      // （可能是因為後端不再提供已完成任務的狀態檢查）
      if (historyDetail.value.status === 'completed') {
        const imageUrl = getHistoryImage(historyDetail.value)
        if (imageUrl) {
          isTaskCompleted.value = true
          clearTaskStatusInterval()
          console.log('✅ HistoryDetailModal - 任務已完成且有圖片，即使 API 返回錯誤也停止輪詢')
          return
        }
      }
      
      // 如果是 500 錯誤，可能是暫時的服務器問題，繼續輪詢
      if (errorStatus === 500) {
        console.warn('⚠️ HistoryDetailModal - 檢查任務狀態返回 500 錯誤，繼續輪詢...')
        return
      }
      // 其他錯誤也繼續輪詢（可能是網路問題）
      console.warn('⚠️ HistoryDetailModal - 檢查任務狀態失敗，繼續輪詢:', result.error)
      return
    }
    
    // 更新歷史詳情
    if (result && (result.success !== false) && result.status) {
      // 更新歷史詳情數據
      historyDetail.value = {
        ...historyDetail.value,
        status: result.status,
        image: result.images?.[0] || result.image || historyDetail.value.image,
        image_url: result.images?.[0] || result.image || historyDetail.value.image_url,
        result_image: result.images?.[0] || result.image || historyDetail.value.result_image,
        generated_image: result.images?.[0] || result.image || historyDetail.value.generated_image
      }
      
      console.log('✅ HistoryDetailModal - 歷史詳情已更新:', historyDetail.value)
      
      // 根據狀態處理
      if (result.status === 'completed') {
        // 任務完成，清除輪詢
        isTaskCompleted.value = true
        clearTaskStatusInterval()
        console.log('✅ HistoryDetailModal - 任務已完成，停止輪詢')
      } else if (result.status === 'pending' || result.status === 'processing') {
        // 任務還在進行中，繼續輪詢（定時器已在運行）
        console.log(`🔄 HistoryDetailModal - 任務狀態: ${result.status}，繼續輪詢`)
      } else if (result.status === 'failed') {
        // 任務失敗，停止輪詢
        isTaskCompleted.value = true
        clearTaskStatusInterval()
        error.value = '任務處理失敗，請重新生成'
        console.error('❌ HistoryDetailModal - 任務處理失敗')
        // 確保 isLoading 為 false，以便顯示錯誤訊息
        isLoading.value = false
      }
    }
  } catch (err) {
    console.error('❌ HistoryDetailModal - 檢查任務狀態時發生錯誤:', err)
    // 發生錯誤時繼續輪詢（可能是網路問題）
  }
}

// 載入歷史詳情
async function loadHistoryDetail() {
  if (!props.historyItem) {
    error.value = '沒有歷史項目數據'
    console.error('❌ 沒有歷史項目數據')
    return
  }

  // 防止重複載入
  if (isLoadingDetail.value) {
    console.log('⏳ HistoryDetailModal - 正在載入中，跳過重複調用')
    return
  }

  try {
    isLoadingDetail.value = true
    isLoading.value = true
    error.value = null
    
    console.log('📥 開始載入歷史詳情:', props.historyItem)
    console.log('📋 歷史項目完整數據:', JSON.stringify(props.historyItem, null, 2))
    
    // 重置完成標記
    isTaskCompleted.value = false
    
    // 直接使用傳入的歷史項目數據
    historyDetail.value = {
      ...props.historyItem
    }
    
    // 檢查任務狀態
    const taskStatus = historyDetail.value.status
    
    // 檢查圖片 URL
    const imageUrl = getHistoryImage(historyDetail.value)
    console.log('🖼️ 獲取到的圖片 URL:', imageUrl)
    
    // 如果任務已完成且有圖片，標記為完成並清除定時器
    if (taskStatus === 'completed' && imageUrl) {
      isTaskCompleted.value = true
      clearTaskStatusInterval() // 確保清除任何可能存在的定時器
      console.log('✅ 歷史詳情載入完成（任務已完成，停止輪詢）:', historyDetail.value)
    } else if (taskStatus === 'pending' || taskStatus === 'processing') {
      // 任務還在進行中，啟動輪詢檢查
      console.log(`🔄 任務狀態為 ${taskStatus}，啟動輪詢檢查`)
      const interval = taskStatus === 'pending' ? 3000 : 2000
      startTaskStatusPolling(interval)
      // 立即執行一次檢查
      checkHistoryTaskStatus()
    } else if (taskStatus === 'completed' && !imageUrl) {
      // 任務已完成但沒有圖片，可能是數據還沒同步，嘗試輪詢幾次
      console.log('⚠️ 任務已完成但沒有圖片，嘗試輪詢獲取')
      startTaskStatusPolling(2000)
      checkHistoryTaskStatus()
    } else if (!imageUrl) {
      console.warn('⚠️ 無法獲取圖片 URL，歷史項目數據:', historyDetail.value)
    }
    
    console.log('✅ 歷史詳情載入完成:', historyDetail.value)
    
  } catch (err) {
    console.error('❌ 載入歷史詳情失敗:', err)
    error.value = `載入失敗: ${err.message}`
  } finally {
    isLoading.value = false
    isLoadingDetail.value = false
  }
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

// 檢查是否為 dev_user（不受限制）
const isDevUser = computed(() => {
  return props.userId && props.userId.startsWith('dev_user_')
})

// 檢查是否已達生成限制
const isAtLimit = computed(() => {
  return !isDevUser.value && props.userUsage >= appConfig.maxUsageLimit
})

// 重新生成
function regenerate() {
  // 檢查是否已達生成限制
  if (isAtLimit.value) {
    alert('已達個人生成上限，感謝您的參與')
    return
  }
  
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
    
    // 初始化模式服務（如果尚未初始化）
    if (!modeService.isInitialized) {
      modeService.initialize()
    }
    
    // 根據模式選擇分享方式
    const currentMode = modeService.getMode()
    console.log('📤 準備分享文字和連結，當前模式:', currentMode)
    
    if (currentMode === 'liff') {
      // LIFF 模式：使用 LIFF 分享
      await shareViaLiff()
      console.log('✅ 分享完成')
      showMessage('已成功分享！', 'success')
    } else {
      // Email 模式：先判斷是否為桌機（PC）
      // 判斷方式：檢查是否為觸控裝置，如果不是觸控裝置，視為桌機
      // 即使有 Web Share API（如 Mac Chrome），也不在桌機上執行分享
      const isTouchDevice = 'ontouchstart' in window || 
                           (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) ||
                           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      
      if (!isTouchDevice) {
        // 桌機版本：顯示提示訊息，不執行分享
        showMessage('分享功能請在手機上操作', 'info')
        console.log('💻 桌機版本，不執行分享功能')
        return
      }
      
      // 手機版本：判斷是否在 LINE 環境內（點擊時才判斷）
      const enableLiff = window.endpoint?.enableLiff
      const hasLiff = typeof liff !== 'undefined'
      const isInLineClient = enableLiff && hasLiff && liff.isInClient()
      
      if (isInLineClient) {
        // 在 LINE 環境內，優先使用 LIFF 分享
        console.log('📱 偵測到 LINE 環境，嘗試使用 LIFF 分享', {
          enableLiff,
          hasLiff,
          isInClient: liff.isInClient(),
          hasShareTargetPicker: liff.shareTargetPicker ? true : false
        })
        try {
          await shareViaLiff()
          console.log('✅ 分享完成')
          showMessage('已成功分享！', 'success')
        } catch (liffError) {
          // LIFF 分享失敗（可能是 shareTargetPicker 不存在或其他原因）
          console.warn('⚠️ LIFF 分享失敗，降級為 Web Share API:', liffError)
          console.warn('⚠️ 錯誤詳情:', {
            message: liffError.message,
            name: liffError.name,
            stack: liffError.stack
          })
          // 降級為 Web Share API
          try {
            console.log('🔄 嘗試使用 Web Share API 作為降級方案...')
            await shareViaWeb()
            console.log('✅ 分享完成')
            showMessage('已成功分享！', 'success')
          } catch (webShareError) {
            // Web Share API 也失敗，顯示錯誤訊息
            console.error('❌ Web Share API 也失敗:', webShareError)
            console.error('❌ Web Share API 錯誤詳情:', {
              message: webShareError.message,
              name: webShareError.name
            })
            if (webShareError.message !== '已取消分享') {
              showMessage('分享功能暫時無法使用，請稍後再試', 'error')
            }
          }
        }
      } else {
        // 不在 LINE 環境內，使用 Web Share API
        try {
          await shareViaWeb()
          console.log('✅ 分享完成')
          showMessage('已成功分享！', 'success')
        } catch (webShareError) {
          // Web Share API 失敗時，不顯示任何提示（包括 alert）
          // 只記錄到 console，不干擾用戶
          console.warn('⚠️ Web Share API 失敗:', webShareError)
          // 不執行任何降級處理，靜默失敗
        }
      }
    }
    
  } catch (error) {
    console.error('❌ 分享流程失敗:', error)
    
    if (error.message !== '已取消分享') {
      showMessage(`分享失敗: ${error.message}`, 'error')
    }
  } finally {
    isDownloading.value = false
    // 不更動其他載入訊息，保持原本狀態
  }
}


// 關閉彈窗
function closeModal() {
  // 清除定時器
  clearTaskStatusInterval()
  
  // 如果 historyDetail 有更新，emit update 事件傳遞更新後的數據
  if (historyDetail.value) {
    emit('update', {
      id: historyDetail.value.id,
      image: historyDetail.value.image || historyDetail.value.image_url || historyDetail.value.result_image || historyDetail.value.generated_image,
      status: historyDetail.value.status,
      created_at: historyDetail.value.created_at,
      template_id: historyDetail.value.template_id
    })
  }
  
  emit('close')
}
</script>

