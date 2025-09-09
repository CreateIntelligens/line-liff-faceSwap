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
      @regenerate="handleHistoryRegenerate"
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
          <div v-else-if="taskResult" ref="resultArea" class="space-y-6 relative">
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
                  :src="getTemplateImage(props.selectedTemplate)" 
                  :alt="`模板圖片 - ${getTemplateName(props.selectedTemplate)}`" 
                  class="w-full object-cover rounded-md"
                />
                <img 
                  :src="imageUrls.star" 
                  class="absolute -left-2 -bottom-10 w-12 h-12 object-contain" 
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
import { useScreenshot } from '../../composables/useScreenshot.js'

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

// 使用截圖 composable
const { captureScreenshot, compressImage, downloadToLocal, uploadImage, sendViaLiff, showMessage } = useScreenshot()

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

// Handle regenerate from history
function handleHistoryRegenerate() {
  console.log('🔄 從歷史頁面重新生成')
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

  try {
    isDownloading.value = true
    console.log('📥 開始下載至官方帳號流程')
    
    // 更新載入狀態
    loadingMessage.value = '正在截圖...'
    loadingSubMessage.value = '請稍候'
    
    // 1. 截圖
    const canvas = await captureScreenshot(resultArea.value)
    console.log('✅ 截圖完成')
    
    // 2. 轉換為 Blob
    loadingMessage.value = '正在處理圖片...'
    const blob = await compressImage(canvas)
    console.log('✅ 圖片處理完成')
    
    // 本地測試：先下載到本機確認圖片
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('🧪 本地測試模式：下載截圖到本機')
      downloadToLocal(blob, 'faceswap-result')
      showMessage('截圖已下載到本機，請檢查圖片品質', 'success')
      return
    }
    
    // 3. 上傳到伺服器
    loadingMessage.value = '正在上傳圖片...'
    const imageUrl = await uploadImage(blob, props.userId || 'abc', 'faceswap-result')
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

