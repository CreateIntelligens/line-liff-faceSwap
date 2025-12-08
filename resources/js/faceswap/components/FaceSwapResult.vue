<template>
  <div
    class="relative mx-auto my-0 w-[375px] max-md:w-full max-md:max-w-screen-md max-sm:w-full"
    :style="{ 
      minHeight: '100dvh',
      backgroundImage: `url(${imageUrls.background1})`, 
      backgroundSize: '100% 100%', 
      backgroundPosition: 'center center', 
      backgroundRepeat: 'no-repeat'
    }"
  >
    <!-- Face Swap History Page -->
    <FaceSwapHistory 
      v-if="showHistory" 
      :userId="props.userId || 'abc'"
      :userUsage="userUsage"
      @back="showHistory = false"
      @regenerate="handleHistoryRegenerate"
    />
    
    <!-- Main Result Page -->
    <div v-if="!showHistory" class="flex-1 flex flex-col">
      <!-- Header -->
      <div class="flex gap-5 justify-center items-center self-stretch px-5 py-6 w-full font-bold whitespace-nowrap gradient-border-bottom min-h-20">
        <div
          class="self-stretch my-auto"
          data-name="AI換臉"
        >
          <img
            :src="imageUrls.header1"
            class="h-16 object-contain"
            alt="AI換臉"
          />
        </div>
        <UsageCounter :currentCount="userUsage" />
      </div>

     <!-- 步驟 -->
     <div
      class="flex items-center mt-8 max-w-full text-base font-bold text-center text-[#EBD8B2] whitespace-nowrap w-[202px] mx-auto"
    >
      <img
        :src="imageUrls.finish"
        class="w-6 h-6 object-contain"
        alt="Step 1"
      />
      <img
        :src="imageUrls.horizontal"
        class="shrink-0 w-[65px] h-6 object-cover translate-y-2.5"
        alt="分隔線"
      />
      <img
        :src="imageUrls.step2_inprogress"
        class="w-6 h-6 object-contain"
        alt="Step 2"
      />
      <img
        :src="imageUrls.horizontal"
        class="shrink-0 w-[65px] h-6 object-cover translate-y-2.5"
        alt="分隔線"
      />
      <img
        :src="imageUrls.step3_inprogress"
        class="w-6 h-6 object-contain"
        alt="Step 3"
      />
    </div>
    <!-- 步驟文字 -->
    <div
      class="flex gap-5 justify-between max-w-full text-sm text-center w-[218px] mx-auto mb-8"
    >
      <div class="step-gradient-text" data-name="Step 1">Step 1</div>
      <div class="step-gradient-text" data-name="Step 2">Step 2</div>
      <div class="step-gradient-text" data-name="Step 3">Step 3</div>
    </div>

      
    <div class="flex justify-start items-center px-12 mb-4">
        <div class="flex items-center gap-3">
          <img 
            :src="imageUrls.step3_inprogress" 
            class="w-6 h-6 object-contain" 
            alt="Step 3"
          />
          <div class="text-base font-bold cp-font step-gradient-text">
            生成結果
          </div>
        </div>
      </div>
      <!-- Main Content -->
      <div class="flex-1">
          <!-- 載入狀態 -->
          <div v-if="isLoading" class="flex flex-col items-center justify-center h-60">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFC1DE] mb-4"></div>
            <div class="text-[#FFC1DE] text-center">
              <div class="text-lg font-bold mb-2">{{ loadingMessage }}</div>
              <div class="text-sm">{{ loadingSubMessage }}</div>
            </div>
          </div>
          
          <!-- 錯誤狀態 -->
          <div v-else-if="error" class="flex flex-col items-center justify-center h-60">
            <div class="text-red-400 text-center">
              <div class="text-lg font-bold mb-2">生成失敗</div>
              <div class="text-sm mb-4">{{ error }}</div>
              <button 
                @click="retryCheckStatus"
                class="px-4 py-2 bg-[#EBD8B2] text-[#333] rounded-md hover:bg-[#d4c29a] transition-colors"
              >
                重試
              </button>
            </div>
          </div>
          
          <!-- 結果內容 -->
          <div v-else-if="taskResult" class="space-y-6 px-4">
            <!-- Result Image -->
            <div v-if="generatedImages.length > 0">
              <div v-for="(image, index) in generatedImages" :key="index" class="mb-4">
                <div 
                  class="relative cursor-pointer"
                  @click="selectedImageIndex = index"
                >
                  <img 
                    class="w-full object-contain rounded-md" 
                    :src="image" 
                    :alt="`生成結果 ${index + 1}`"
                    @error="handleImageError"
                    @load="handleImageLoad"
                  />
                </div>
                <div v-if="imageLoadErrors[image]" class="text-center text-red-400 text-sm mt-2">
                  ⚠️ 圖片載入失敗，請檢查網路連線
                </div>
              </div>
            </div>
            <div v-else class="w-full h-60 bg-gray-700 rounded-md flex items-center justify-center">
              <div class="text-[#FFC1DE] text-center">
                <div class="text-lg font-bold mb-2">生成中...</div>
                <div class="text-sm">請稍候，正在處理您的圖片</div>
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
              taskResult && taskResult.status === 'completed' && !isDownloading
                ? ''
                : 'opacity-50 cursor-not-allowed'
            "
            @click="downloadToOfficial"
            :disabled="!taskResult || taskResult.status !== 'completed' || isDownloading"
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

        <!-- Generation History Title -->
        <div 
          class="text-base font-bold step-gradient-text text-center cursor-pointer transition-colors"
          @click="showHistory = true"
        >
          圖片生成紀錄
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import FaceSwapHistory from './FaceSwapHistory.vue'
import UsageCounter from './UsageCounter.vue'
import { roadshowService } from '../../services/roadshowService.js'
import { imageUrls } from '@/config/imageUrls'

// Define props
const props = defineProps({
  taskId: {
    type: String,
    default: ''
  },
  userId: {
    type: String,
    default: ''
  },
  selectedTemplate: {
    type: String,
    default: ''
  },
  userUsage: {
    type: Number,
    default: 0
  }
});

// Define emits for parent component communication
const emit = defineEmits(['back', 'regenerate', 'download'])

// State for showing history page
const showHistory = ref(false)

// 任務相關狀態
const isLoading = ref(false)
const error = ref(null)
const taskResult = ref(null)
const generatedImages = ref([])
const originalImages = ref([]) // 保存原始圖片 URL 用於下載
const imageLoadErrors = ref({})
const selectedImageIndex = ref(0)

// 載入狀態訊息
const loadingMessage = ref('檢查任務狀態...')
const loadingSubMessage = ref('請稍候')

// 下載相關狀態
const isDownloading = ref(false)

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
    img.crossOrigin = 'anonymous'
    
    img.onload = function() {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Canvas 轉換失敗'))
            return
          }
          
          const blobUrl = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = blobUrl
          link.download = filename
          link.style.display = 'none'
          document.body.appendChild(link)
          link.click()
          
          setTimeout(() => {
            document.body.removeChild(link)
            window.URL.revokeObjectURL(blobUrl)
          }, 100)
          
          resolve()
        }, 'image/jpeg', 0.95)
      } catch (error) {
        reject(error)
      }
    }
    
    img.onerror = function() {
      reject(new Error('圖片載入失敗'))
    }
    
    img.src = imageUrl
  })
}

// 透過 LIFF 發送圖片
async function sendViaLiff(imageUrl) {
  try {
    if (typeof liff === 'undefined') {
      throw new Error('LIFF SDK 未載入，請確保在 LINE 環境中使用')
    }
    
    // 檢查是否已登入
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

// 監聽taskId變化
watch(() => props.taskId, (newTaskId) => {
  if (newTaskId) {
    checkTaskStatus()
  }
}, { immediate: true })

// 監聽selectedTemplate變化，處理顯示歷史的請求
watch(() => props.selectedTemplate, (newTemplate) => {
  if (newTemplate === 'show_history') {
    // 設置顯示歷史
    showHistory.value = true
  }
}, { immediate: true })

// 監聽 userUsage 變化
watch(() => props.userUsage, (newUsage, oldUsage) => {
  // 用戶使用量變化時的處理邏輯
}, { immediate: true })

// 檢查任務狀態
async function checkTaskStatus() {
  if (!props.taskId) {
    return
  }
  
  try {
    isLoading.value = true
    error.value = null
    loadingMessage.value = '檢查任務狀態...'
    loadingSubMessage.value = '請稍候'
    
    const result = await roadshowService.checkTaskStatus(props.taskId)
    
    // 新 API 響應格式: { success: true, id, status, images, template_id, result }
    if (result && (result.success || result.status === 'completed' || result.status === 'pending' || result.status === 'processing')) {
      taskResult.value = result;
      
      // 根據狀態處理
      handleTaskStatus(result);
    } else if (result && result.error) {
      error.value = result.error.message || '檢查任務狀態失敗';
      console.error('❌ 檢查任務狀態失敗:', result.error);
    } else {
      error.value = '檢查任務狀態失敗';
      console.error('❌ 檢查任務狀態失敗: 未知錯誤');
    }
  } catch (err) {
    error.value = '網路錯誤，請檢查連線'
    console.error('❌ 檢查任務狀態時發生錯誤:', err)
  } finally {
    isLoading.value = false
  }
}

// 處理任務狀態
async function handleTaskStatus(data) {
  const status = data.status
  
  switch (status) {
    case 'pending':
      loadingMessage.value = '任務等待中'
      loadingSubMessage.value = '正在排隊處理...'
      // 延遲後再次檢查
      setTimeout(checkTaskStatus, 3000)
      break
      
    case 'processing':
      loadingMessage.value = '正在處理中'
      loadingSubMessage.value = '請稍候，正在生成您的頭像...'
      // 延遲後再次檢查
      setTimeout(checkTaskStatus, 2000)
      break
      
    case 'completed':
      loadingMessage.value = '生成完成！'
      loadingSubMessage.value = ''
      const images = data.images || data.result?.images || []
      
      if (images && Array.isArray(images) && images.length > 0) {
        // 保存原始圖片 URL
        originalImages.value = images
        
        const processedImages = []
        for (const imageUrl of images) {
          try {
            const config = window.endpoint || {};
            const apiUrl = config.imageProcessApi || 'https://stg-api.fanpokka.ai/api/static-resource';
            const params = config.imageProcessParams || { scale: 2, format: 'jpg', quality: 90, width: 800, height: 600 };
            
            const queryParams = new URLSearchParams();
            queryParams.append('url', imageUrl);
            if (params.scale) queryParams.append('scale', params.scale);
            if (params.format) queryParams.append('format', params.format);
            if (params.quality) queryParams.append('quality', params.quality);
            if (params.width) queryParams.append('width', params.width);
            if (params.height) queryParams.append('height', params.height);
            
            const processedImageUrl = `${apiUrl}?${queryParams.toString()}`;
            processedImages.push(processedImageUrl);
            
          } catch (error) {
            console.error('❌ 處理圖片時發生錯誤:', error);
            processedImages.push(imageUrl);
          }
        }
        
        generatedImages.value = processedImages
      }
      break
      
    case 'failed':
      error.value = '任務處理失敗，請重新生成'
      console.error('❌ 任務處理失敗')
      break
      
    default:
      error.value = '未知的任務狀態'
  }
}

// 重試檢查狀態
function retryCheckStatus() {
  error.value = null
  checkTaskStatus()
}

// Handle regenerate button click
function regenerate() {
  emit('regenerate')
}

// Handle regenerate from history
function handleHistoryRegenerate() {
  // 關閉歷史頁面
  showHistory.value = false
  // 發送重新生成事件到父組件
  emit('regenerate')
}

// Handle download to official account button click
async function downloadToOfficial() {
  if (!taskResult.value || taskResult.value.status !== 'completed') {
    console.warn('⚠️ 任務尚未完成，無法下載')
    showMessage('任務尚未完成，無法下載', 'error')
    return
  }

  if (isDownloading.value) {
    console.log('⏳ 正在處理中，請稍候...')
    return
  }

  if (!generatedImages.value || generatedImages.value.length === 0) {
    showMessage('沒有生成的圖片，無法下載', 'error')
    return
  }

  try {
    isDownloading.value = true
    
    const imageIndex = selectedImageIndex.value >= 0 && selectedImageIndex.value < generatedImages.value.length 
      ? selectedImageIndex.value 
      : 0
    
    // 本地測試：使用原始圖片 URL 下載（避免 CORS 問題）
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      const originalImageUrl = originalImages.value[imageIndex] || generatedImages.value[imageIndex]
      
      try {
        const blob = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest()
          xhr.open('GET', originalImageUrl, true)
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
        
        const blobUrl = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = blobUrl
        link.download = `faceswap-result-${imageIndex + 1}-${Date.now()}.jpg`
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        
        setTimeout(() => {
          document.body.removeChild(link)
          window.URL.revokeObjectURL(blobUrl)
        }, 100)
        
        showMessage('圖片已下載到本機', 'success')
      } catch (downloadError) {
        console.error('❌ 下載圖片失敗:', downloadError)
        try {
          await downloadImageViaCanvas(originalImageUrl, `faceswap-result-${imageIndex + 1}.jpg`)
          showMessage('圖片已下載到本機', 'success')
        } catch (canvasError) {
          console.error('❌ Canvas 下載也失敗:', canvasError)
          window.open(originalImageUrl, '_blank')
          showMessage('下載失敗，已在新視窗打開圖片連結', 'error')
        }
      }
      return
    }
    
    // 生產環境：透過 LIFF 發送
    loadingMessage.value = '正在發送到官方帳號...'
    
    // 獲取要發送的圖片 URL（使用原始圖片 URL，因為 LIFF 需要完整的 URL）
    const imageUrlToSend = originalImages.value[imageIndex] || generatedImages.value[imageIndex]
    
    if (!imageUrlToSend) {
      showMessage('無法獲取圖片 URL，無法下載', 'error')
      return
    }
    
    console.log('📤 準備發送圖片:', imageUrlToSend)
    await sendViaLiff(imageUrlToSend)
    showMessage('圖片已成功發送到官方帳號！', 'success')
    
  } catch (error) {
    console.error('❌ 下載流程失敗:', error)
    showMessage(`下載失敗: ${error.message}`, 'error')
  } finally {
    isDownloading.value = false
    loadingMessage.value = '檢查任務狀態...'
    loadingSubMessage.value = '請稍候'
  }
}


// 處理圖片載入錯誤
function handleImageError(event) {
  const imageUrl = event.target.src;
  console.error('❌ 圖片載入失敗:', imageUrl);
  imageLoadErrors.value[imageUrl] = true;
}

// 處理圖片載入成功
function handleImageLoad(event) {
  const imageUrl = event.target.src;
  if (imageLoadErrors.value[imageUrl]) {
    delete imageLoadErrors.value[imageUrl];
  }
}

function getTemplateImage(templateId) {
  const imageMap = {
    'a1art1': imageUrls.a1art1,
    'a1art2': imageUrls.a1art2,
    'a1art3': imageUrls.a1art3,
    'a1art4': imageUrls.a1art4
  };
  
  return imageMap[templateId] || imageUrls.a1art1;
}

function getTemplateName(templateId) {
  return '預設模板';
}

// 組件掛載時檢查狀態
onMounted(() => {
  if (props.taskId) {
    checkTaskStatus()
  }
})
</script>

