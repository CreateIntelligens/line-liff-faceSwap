<template>
  <div
    class="relative mx-auto my-0 bg-[#333333] h-[774px] w-[375px] max-md:w-full max-md:max-w-screen-md max-sm:w-full max-sm:h-auto max-sm:min-h-[774px]"
  >
    <!-- Face Swap History Page -->
    <FaceSwapHistory 
      v-if="showHistory" 
      :userId="props.userId || 'abc'"
      :userUsage="userUsage"
      @back="showHistory = false"
    />
    
    <!-- Main Result Page -->
    <div v-if="!showHistory" class="flex-1 flex flex-col">
      <!-- Header -->
      <div class="flex gap-5 justify-center items-center px-12 py-6 w-full font-bold border-b border-[#EBD8B2] min-h-20">
        <div class="text-xl text-[#EBD8B2]">
          AI換臉
        </div>
        <UsageCounter :currentCount="userUsage" :maxLimit="10" />
      </div>

     <!-- 步驟 -->
     <div
      class="flex mt-8 max-w-full text-base font-bold text-center text-[#EBD8B2] whitespace-nowrap w-[202px] mx-auto"
    >
      <img
        :src="imageUrls.finish"
        class="w-6 h-6 object-contain"
        alt="Step 1"
      />
      <img
        :src="imageUrls.horizontal"
        class="object-contain shrink-0 my-auto aspect-[32.26] w-[65px]"
      />
      <img
        :src="imageUrls.step2_inprogress"
        class="w-6 h-6 object-contain"
        alt="Step 2"
      />
      <img
        :src="imageUrls.horizontal"
        class="object-contain shrink-0 my-auto aspect-[32.26] w-[65px]"
      />
      <img
        :src="imageUrls.step3_inactive"
        class="w-6 h-6 object-contain"
        alt="Step 3"
      />
    </div>
    <!-- 步驟文字 -->
    <div
      class="flex gap-5 justify-between max-w-full text-sm text-center text-[#EBD8B2] w-[218px] mx-auto mb-8"
    >
      <div data-name="Step 1">Step 1</div>
      <div data-name="Step 2">Step 2</div>
      <div data-name="Step 3">Step 3</div>
    </div>

      
    <div class="flex justify-start items-center px-12 mb-4">
        <div class="flex items-center gap-3">
          <img 
            :src="imageUrls.step3_inprogress" 
            class="w-6 h-6 object-contain" 
            alt="Step 3"
          />
          <div class="text-base font-bold text-[#EBD8B2]">
            生成結果
          </div>
        </div>
      </div>
      <!-- Main Content -->
      <div class="flex-1 px-8 pb-8 pt-8 bg-[#E8E8E8]">
          <div class="bg-[#333333] p-6">
          <!-- 載入狀態 -->
          <div v-if="isLoading" class="flex flex-col items-center justify-center h-60">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EBD8B2] mb-4"></div>
            <div class="text-[#EBD8B2] text-center">
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
          <div v-else-if="taskResult" ref="resultArea" class="space-y-6">
            <!-- Header Logo and Crown -->
            <div class="relative">
              <img 
                :src="imageUrls.header" 
                class="h-5 object-contain" 
                alt="標準字" 
              />
              <img 
                :src="imageUrls.crown" 
                class="absolute -right-2 -top-[2] w-12 h-12 object-contain transform -rotate-[10.809deg] z-10 " 
                alt="皇冠" 
              />
            </div>

            <!-- Images Section -->
            <div class="space-y-6">
              <!-- Original Image with Star -->
              <div class="relative">
                <img 
                  :src="getTemplateImage(props.selectedTemplate)" 
                  :alt="`模板圖片 - ${getTemplateName(props.selectedTemplate)}`" 
                  class="w-full object-cover rounded-md"
                />
                <img 
                  :src="imageUrls.star" 
                  class="absolute -left-2 -bottom-9 w-12 h-12 object-contain" 
                  alt="星" 
                />
              </div>

              <!-- Result Image -->
              <div v-if="generatedImages.length > 0">
                <div v-for="(image, index) in generatedImages" :key="index" class="mb-4">
                  <img 
                    class="w-full object-cover rounded-md" 
                    :src="image" 
                    :alt="`生成結果 ${index + 1}`"
                    @error="handleImageError"
                    @load="handleImageLoad"
                  />
                  <div v-if="imageLoadErrors[image]" class="text-center text-red-400 text-sm mt-2">
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
                  class="h-6 object-contain" 
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
              taskResult && taskResult.status === 'completed' && !isDownloading
                ? 'bg-gradient-to-r from-[#EE95FF] via-[#F192FF] via-[#B9B9FB] to-[#AFCBF7] hover:shadow-lg'
                : 'bg-[#C7C7C7] cursor-not-allowed'
            "
            @click="downloadToOfficial"
            :disabled="!taskResult || taskResult.status !== 'completed' || isDownloading"
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

        <!-- Generation History Title -->
        <div 
          class="font-noto-sans-tc text-base font-bold text-[#EBD8B2] text-center cursor-pointer hover:text-[#d4c29a] transition-colors"
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
import html2canvas from 'html2canvas'

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
const imageLoadErrors = ref({})

// 載入狀態訊息
const loadingMessage = ref('檢查任務狀態...')
const loadingSubMessage = ref('請稍候')

// 截圖相關狀態
const resultArea = ref(null)
const isDownloading = ref(false)

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
    console.warn('⚠️ 沒有taskId，無法檢查狀態')
    return
  }
  
  try {
    isLoading.value = true
    error.value = null
    loadingMessage.value = '檢查任務狀態...'
    loadingSubMessage.value = '請稍候'
    
    const result = await roadshowService.checkTaskStatus(props.taskId)
    
    if (result && (result.success || result.status === 'completed' || result.status === 'pending' || result.status === 'processing')) {
      // 根據 API 返回的數據結構處理
      const taskData = result.data || result.result || result;
      taskResult.value = taskData;
      
      // 根據狀態處理
      handleTaskStatus(taskData);
    } else {
      error.value = result?.error?.message || '檢查任務狀態失敗';
      console.error('❌ 檢查任務狀態失敗:', result?.error);
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
  console.log(`📊 任務狀態: ${status}`)
  
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
      // 使用新的 API 處理生成的圖片，將生成出來的圖片用參數的方式帶入
      if (data.images && data.images.length > 0) {
        console.log('🖼️ 原始生成的圖片:', data.images)
        
        // 使用新的 API 處理每張生成的圖片
        const processedImages = []
        for (const imageUrl of data.images) {
          try {
            // 從全局配置獲取圖片處理 API 設置
            const config = window.endpoint || {};
            const apiUrl = config.imageProcessApi || 'https://stg-api.fanpokka.ai/api/static-resource';
            const params = config.imageProcessParams || { scale: 2, format: 'jpg', quality: 90, width: 800, height: 600 };
            
            // 構建查詢參數
            const queryParams = new URLSearchParams();
            queryParams.append('url', imageUrl);
            if (params.scale) queryParams.append('scale', params.scale);
            if (params.format) queryParams.append('format', params.format);
            if (params.quality) queryParams.append('quality', params.quality);
            if (params.width) queryParams.append('width', params.width);
            if (params.height) queryParams.append('height', params.height);
            
            const processedImageUrl = `${apiUrl}?${queryParams.toString()}`;
            
            console.log('🔄 使用圖片處理 API:', processedImageUrl);
            console.log('⚙️ 使用配置參數:', params);
            processedImages.push(processedImageUrl);
            
          } catch (error) {
            console.error('❌ 處理圖片時發生錯誤:', error);
            // 如果處理失敗，使用原始圖片
            processedImages.push(imageUrl);
          }
        }
        
        // 更新生成的圖片為處理後的圖片
        generatedImages.value = processedImages
        console.log('🖼️ 處理後的圖片:', processedImages)
      }
      break
      
    case 'failed':
      error.value = '任務處理失敗，請重新生成'
      console.error('❌ 任務處理失敗')
      break
      
    default:
      error.value = '未知的任務狀態'
      console.warn('❓ 未知的任務狀態:', status)
  }
}

// 重試檢查狀態
function retryCheckStatus() {
  error.value = null
  checkTaskStatus()
}

// Handle regenerate button click
function regenerate() {
  console.log('🔄 重新生成')
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

  try {
    isDownloading.value = true
    console.log('📥 開始下載至官方帳號流程')
    
    // 更新載入狀態
    loadingMessage.value = '正在截圖...'
    loadingSubMessage.value = '請稍候'
    
    // 1. 截圖
    const canvas = await captureScreenshot()
    console.log('✅ 截圖完成')
    
    // 2. 轉換為 Blob
    loadingMessage.value = '正在處理圖片...'
    const blob = await compressImage(canvas)
    console.log('✅ 圖片處理完成')
    
    // 本地測試：先下載到本機確認圖片
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('🧪 本地測試模式：下載截圖到本機')
      downloadToLocal(blob)
      showMessage('截圖已下載到本機，請檢查圖片品質', 'success')
      return
    }
    
    // 3. 上傳到伺服器
    loadingMessage.value = '正在上傳圖片...'
    const imageUrl = await uploadImage(blob)
    console.log('✅ 圖片上傳完成:', imageUrl)
    
    // 5. 透過 LIFF 發送
    loadingMessage.value = '正在發送到官方帳號...'
    await sendViaLiff(imageUrl)
    console.log('✅ 發送完成')
    
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

// 本地測試：下載截圖到本機
function downloadToLocal(blob) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `faceswap-result-${Date.now()}.png` // 使用 PNG 格式
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  console.log('📥 截圖已下載到本機')
}

// 截圖功能
async function captureScreenshot() {
  if (!resultArea.value) {
    throw new Error('找不到截圖區域')
  }
  
  // 預載入並轉換跨域圖片
  const originalSrcs = await preloadAndConvertImages()
  
  // 使用後端範例的簡單配置
  const originalCanvas = await html2canvas(resultArea.value, {
    backgroundColor: '#333333',
    scale: 1,
    logging: false
  })
  
  // 恢復原始圖片 src
  restoreOriginalImages(originalSrcs)
  
  // 創建新的 Canvas 並添加邊距
  const padding = 20
  const newCanvas = document.createElement('canvas')
  const ctx = newCanvas.getContext('2d')
  
  // 設定新 Canvas 的尺寸（原尺寸 + 邊距）
  newCanvas.width = originalCanvas.width + (padding * 2)
  newCanvas.height = originalCanvas.height + (padding * 2)
  
  // 填充背景色
  ctx.fillStyle = '#333333'
  ctx.fillRect(0, 0, newCanvas.width, newCanvas.height)
  
  // 將原始 Canvas 繪製到新 Canvas 上，留出邊距
  ctx.drawImage(originalCanvas, padding, padding)
  
  return newCanvas
}

// 預載入並轉換跨域圖片為 base64
async function preloadAndConvertImages() {
  const images = resultArea.value.querySelectorAll('img')
  const originalSrcs = new Map() // 儲存原始 src
  
  const convertPromises = Array.from(images).map(async (img) => {
    // 儲存原始 src
    originalSrcs.set(img, img.src)
    
    // 如果是跨域圖片，嘗試轉換為 base64
    if (img.src.includes('stg-api.fanpokka.ai') || img.src.includes('voice.5gao.ai')) {
      try {
        console.log('🔄 正在轉換跨域圖片:', img.src)
        const base64 = await convertImageToBase64(img.src)
        img.src = base64
        console.log('✅ 跨域圖片已轉換為 base64')
      } catch (error) {
        console.warn('⚠️ 無法轉換跨域圖片，將使用佔位符:', error)
        // 使用佔位符
        const width = img.naturalWidth || img.width || 300
        const height = img.naturalHeight || img.height || 200
        img.src = createPlaceholderImage(width, height)
      }
    } else {
      // 確保本地圖片已載入
      if (!img.complete) {
        await new Promise((resolve) => {
          img.onload = resolve
          img.onerror = resolve
          setTimeout(resolve, 3000) // 3秒超時
        })
      }
    }
  })
  
  await Promise.all(convertPromises)
  console.log('🖼️ 圖片預處理完成')
  
  return originalSrcs
}

// 恢復原始圖片 src
function restoreOriginalImages(originalSrcs) {
  originalSrcs.forEach((originalSrc, img) => {
    img.src = originalSrc
  })
  console.log('🔄 已恢復原始圖片 src')
}

// 將圖片轉換為 base64
async function convertImageToBase64(imageUrl) {
  return new Promise((resolve, reject) => {
    // 使用 Image 方法，設置 crossOrigin
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        canvas.width = img.naturalWidth || img.width
        canvas.height = img.naturalHeight || img.height
        
        ctx.drawImage(img, 0, 0)
        
        const base64 = canvas.toDataURL('image/jpeg', 0.9)
        resolve(base64)
      } catch (error) {
        console.warn('Canvas 轉換失敗，嘗試 fetch 方法:', error)
        // 如果 Canvas 方法失敗，嘗試 fetch
        fetchImageAsBase64(imageUrl).then(resolve).catch(reject)
      }
    }
    
    img.onerror = () => {
      console.warn('Image 載入失敗，嘗試 fetch 方法')
      // 如果 Image 方法失敗，嘗試 fetch
      fetchImageAsBase64(imageUrl).then(resolve).catch(reject)
    }
    
    // 設置超時
    setTimeout(() => {
      reject(new Error('圖片載入超時'))
    }, 10000)
    
    img.src = imageUrl
  })
}

// 使用 fetch 獲取圖片並轉換為 base64
async function fetchImageAsBase64(imageUrl) {
  try {
    const response = await fetch(imageUrl, {
      mode: 'cors',
      credentials: 'omit'
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const blob = await response.blob()
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(new Error('FileReader 錯誤'))
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    throw new Error(`Fetch 失敗: ${error.message}`)
  }
}

// 創建佔位符圖片
function createPlaceholderImage(width = 300, height = 200) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  canvas.width = width
  canvas.height = height
  
  // 繪製背景
  ctx.fillStyle = '#333333'
  ctx.fillRect(0, 0, width, height)
  
  // 繪製邊框
  ctx.strokeStyle = '#EBD8B2'
  ctx.lineWidth = 3
  ctx.strokeRect(15, 15, width - 30, height - 30)
  
  // 繪製內部背景
  ctx.fillStyle = '#2a2a2a'
  ctx.fillRect(20, 20, width - 40, height - 40)
  
  // 繪製圖標（簡單的相機圖標）
  const iconSize = Math.min(width, height) * 0.15
  const iconX = width / 2 - iconSize / 2
  const iconY = height / 2 - iconSize / 2 - 10
  
  ctx.strokeStyle = '#EBD8B2'
  ctx.lineWidth = 2
  ctx.strokeRect(iconX, iconY, iconSize, iconSize * 0.7)
  ctx.strokeRect(iconX + iconSize * 0.1, iconY - iconSize * 0.1, iconSize * 0.8, iconSize * 0.2)
  
  // 繪製文字
  ctx.fillStyle = '#EBD8B2'
  ctx.font = `${Math.max(12, width / 20)}px Arial`
  ctx.textAlign = 'center'
  ctx.fillText('AI 生成圖片', width / 2, height / 2 + 20)
  
  return canvas.toDataURL('image/jpeg', 0.9)
}

// 圖片壓縮功能 - 使用後端範例的簡單方法
async function compressImage(canvas) {
  return new Promise((resolve, reject) => {
    // 使用後端範例的方法：直接轉換為 PNG
    canvas.toBlob((blob) => {
      if (blob) {
        console.log('✅ Canvas 轉換為 Blob 成功，大小:', blob.size)
        resolve(blob)
      } else {
        reject(new Error('無法生成圖片 blob'))
      }
    }, 'image/png') // 使用 PNG 格式，如後端範例
  })
}

// 將 dataURL 轉換為 Blob
function dataURLToBlob(dataURL) {
  const arr = dataURL.split(',')
  const mime = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new Blob([u8arr], { type: mime })
}

// Blob 轉 Base64
async function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result.split(',')[1] // 移除 data:image/jpeg;base64, 前綴
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

// 上傳圖片到伺服器 - 使用後端範例的 FormData 方法
async function uploadImage(blob) {
  const formData = new FormData()
  formData.append('file', blob, 'faceswap-result.png') // 使用 PNG 格式
  formData.append('uid', props.userId || 'abc') // 使用用戶 ID
  
  const response = await fetch('https://feature-line-crm.aitago.tw/api/file_upload', {
    method: 'POST',
    headers: {
      'X-Requested-With': 'XMLHttpRequest'
    },
    body: formData
  })
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `上傳失敗: ${response.status}`)
  }
  
  const data = await response.json()
  return data.url || data.path || data.data?.url
}

// 透過 LIFF 發送圖片
async function sendViaLiff(imageUrl) {
  // 檢查 LIFF 是否可用
  if (typeof liff === 'undefined') {
    throw new Error('LIFF 不可用，無法發送圖片')
  }
  
  // 檢查是否在 LINE 應用內
  if (!liff.isInClient()) {
    throw new Error('請在 LINE 應用內使用此功能')
  }
  
  // 檢查是否已登入
  if (!liff.isLoggedIn()) {
    throw new Error('請先登入 LINE')
  }
  
  // 發送圖片
  await liff.sendMessages([{
    type: 'image',
    originalContentUrl: imageUrl,
    previewImageUrl: imageUrl
  }])
  
  // 發送成功後關閉 LIFF
  setTimeout(() => {
    liff.closeWindow()
  }, 2000)
}

// 顯示訊息提示
function showMessage(message, type = 'info') {
  // 創建提示元素
  const messageEl = document.createElement('div')
  messageEl.className = `fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-md text-white text-sm font-medium transition-all duration-300`
  
  // 根據類型設置樣式
  switch (type) {
    case 'success':
      messageEl.className += ' bg-green-500'
      break
    case 'error':
      messageEl.className += ' bg-red-500'
      break
    case 'info':
    default:
      messageEl.className += ' bg-blue-500'
      break
  }
  
  messageEl.textContent = message
  document.body.appendChild(messageEl)
  
  // 3秒後移除提示
  setTimeout(() => {
    if (messageEl.parentNode) {
      messageEl.parentNode.removeChild(messageEl)
    }
  }, 3000)
}

// 組件掛載時檢查狀態
onMounted(() => {
  if (props.taskId) {
    console.log('🚀 組件掛載，開始檢查任務狀態:', props.taskId)
    checkTaskStatus()
  }
})

// 獲取模板圖片URL
function getTemplateImage(templateId) {
  // 根據模板 ID 返回對應的圖片
  const imageMap = {
    'play': imageUrls.play,   // 綜藝玩很大
    'wife': imageUrls.wife,   // 犀利人妻
    'love': imageUrls.love,   // 命中註定我愛你
    'super': imageUrls.super  // 超級夜總會
  };
  
  return imageMap[templateId] || imageUrls.play;
}

// 獲取模板名稱
function getTemplateName(templateId) {
  const nameMap = {
    'play': '綜藝玩很大',
    'wife': '犀利人妻',
    'love': '命中註定我愛你',
    'super': '超級夜總會'
  };
  
  return nameMap[templateId] || '預設模板';
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
  console.log('✅ 圖片載入成功:', imageUrl);
  if (imageLoadErrors.value[imageUrl]) {
    delete imageLoadErrors.value[imageUrl];
  }
}

// 組件掛載時的調試
onMounted(() => {
  console.log('🚀 FaceSwapResult 組件已掛載')
})
</script>

