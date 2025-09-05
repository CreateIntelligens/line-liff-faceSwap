<template>
  <!-- Modal Overlay -->
  <div 
    v-if="isVisible" 
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click="closeModal"
  >
    <!-- Modal Content -->
    <div 
      class="bg-[#333333] w-full h-full overflow-y-auto flex flex-col"
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
          <div class="relative">
            <img 
              :src="imageUrls.header" 
              class="h-5 object-contain" 
              alt="標準字" 
            />
            <img 
              :src="imageUrls.crown" 
              class="absolute -right-2 -top-[2] w-12 h-12 object-contain transform -rotate-[10.809deg] z-10" 
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
import html2canvas from 'html2canvas'

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
    const canvas = await captureScreenshot()
    console.log('✅ 截圖完成')
    
    // 2. 轉換為 Blob
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
    const imageUrl = await uploadImage(blob)
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

// 本地測試：下載截圖到本機
function downloadToLocal(blob) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `history-detail-${Date.now()}.png`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  console.log('📥 截圖已下載到本機')
}

// 截圖功能
async function captureScreenshot() {
  if (!detailArea.value) {
    throw new Error('找不到截圖區域')
  }
  
  // 預載入並轉換跨域圖片
  const originalSrcs = await preloadAndConvertImages()
  
  // 使用後端範例的簡單配置
  const originalCanvas = await html2canvas(detailArea.value, {
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
  const images = detailArea.value.querySelectorAll('img')
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

// 上傳圖片到伺服器 - 使用後端範例的 FormData 方法
async function uploadImage(blob) {
  const formData = new FormData()
  formData.append('file', blob, 'history-detail.png') // 使用 PNG 格式
  formData.append('uid', 'abc') // 使用預設用戶 ID
  
  const response = await fetch(`${window.endpoint.baseURL}/roadshow/files` , {
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
  return data.result.path || data.path || data.data?.url
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
  }]).then(() => {
    //
  })
  .catch((err) => {
    throw new Error(`發送圖片失敗: ${err.message || err.toString()}`)
  });
  
  // 發送成功後關閉 LIFF
  // setTimeout(() => {
  //   liff.closeWindow()
  // }, 2000)
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

// 關閉彈窗
function closeModal() {
  emit('close')
}
</script>
