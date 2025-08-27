<template>
  <!-- Modal Overlay -->
  <div 
    v-if="isVisible" 
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click="closeModal"
  >
    <!-- Modal Content -->
    <div 
      class="bg-[#333333] rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto"
      @click.stop
    >

      <!-- Modal Body -->
      <div class="px-6 py-4">
        <!-- 載入狀態 -->
        <div v-if="isLoading" class="flex flex-col items-center justify-center py-8">
          <div class="animate-spin rounded-full h-12 w-12 mb-4"></div>
          <div class="text-[#EBD8B2] text-center">
            <div class="text-lg font-bold mb-2">載入中...</div>
            <div class="text-sm">正在獲取生成詳情</div>
          </div>
        </div>

        <!-- 錯誤狀態 -->
        <div v-else-if="error" class="flex flex-col items-center justify-center py-8">
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
        <div v-else-if="historyDetail" class="space-y-6">

          <!-- Header Logo and Crown -->
          <div class="relative">
            <img 
              class="h-5 object-contain" 
              src="/images/header.png" 
              alt="標準字" 
            />
            <img 
              class="absolute -right-2 -top-[2] w-12 h-12 object-contain transform -rotate-[10.809deg] z-10" 
              src="/images/crown.png" 
              alt="皇冠" 
            />
          </div>

          <!-- Images Section -->
          <div class="space-y-6">
            <!-- Original Template Image with Star -->
            <div class="relative">
              <img 
                class="w-full h-48 object-cover rounded-md" 
                :src="getTemplateImage(historyDetail.template_id)" 
                :alt="`模板圖片 - ${getTemplateName(historyDetail.template_id)}`" 
                @error="handleTemplateImageError"
              />
              <img 
                class="absolute -left-2 -bottom-9 w-12 h-12 object-contain" 
                src="/images/star.png" 
                alt="星" 
              />
            </div>

            <!-- Generated Result Image -->
            <div v-if="getHistoryImage(historyDetail)" class="relative">
              <img 
                class="w-full h-48 object-cover rounded-md" 
                :src="getHistoryImage(historyDetail)" 
                alt="生成結果" 
                @error="handleResultImageError"
              />
            </div>
            <div v-else class="w-full h-48 bg-gray-700 rounded-md flex items-center justify-center">
              <div class="text-[#EBD8B2] text-center">
                <div class="text-sm">無生成結果</div>
                <div class="text-xs text-gray-400 mt-1">圖片URL: {{ historyDetail.image || '無' }}</div>
              </div>
            </div>

            <!-- Bottom Logo -->
            <div class="flex justify-center">
              <img 
                class="h-6 object-contain" 
                src="/images/logo.png" 
                alt="0815" 
              />
            </div>
          </div>


        </div>
      </div>

      <!-- Modal Footer -->
      <div class="px-6 py-4">
        <button 
          @click="closeModal"
          class="w-full px-4 py-2 bg-[#EBD8B2] text-[#333] rounded-md hover:bg-[#d4c29a] transition-colors font-bold"
        >
          關閉
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { roadshowService } from '../../services/roadshowService.js'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  historyItem: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close'])

const isLoading = ref(false)
const error = ref(null)
const historyDetail = ref(null)

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
    'play': '/images/play.png',
    'wife': '/images/wife.png',
    'love': '/images/love.png',
    'super': '/images/super.png',
    // 數字形式 (根據 FaceSwapUpload.vue 中的映射)
    '1': '/images/play.png', // 綜藝玩很大
    '2': '/images/wife.png', // 犀利人妻
    '3': '/images/love.png', // 命中註定我愛你
    '4': '/images/super.png'  // 超級夜總會
  }
  
  const imageUrl = imageMap[templateId] || imageMap['play']
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
async function getHistoryImage(item) {
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
    
    const result = await roadshowService.processGeneratedImage(fullUrl, {
      scale: 1.5,      // 適中的縮放比例
      format: 'jpg',   // 使用 JPG 格式
      quality: 85,     // 適中的品質
      width: 600,      // 適中的寬度
      height: 450      // 適中的高度
    })
    
    if (result.success) {
      console.log('✅ 歷史圖片處理成功:', result.data)
      return result.data
    } else {
      console.warn('⚠️ 歷史圖片處理失敗，使用原始圖片:', fullUrl)
      return fullUrl
    }
  } catch (error) {
    console.error('❌ 處理歷史圖片時發生錯誤:', error)
    // 如果處理失敗，返回原始圖片
    return fullUrl
  }
}

// 處理模板圖片載入錯誤
function handleTemplateImageError(event) {
  console.warn('❌ 模板圖片載入失敗:', event.target.src)
  event.target.src = '/images/default_template.png'
}

// 處理結果圖片載入錯誤
function handleResultImageError(event) {
  console.warn('❌ 結果圖片載入失敗:', event.target.src)
  event.target.src = '/images/default_history.png'
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

// 關閉彈窗
function closeModal() {
  emit('close')
}
</script>
