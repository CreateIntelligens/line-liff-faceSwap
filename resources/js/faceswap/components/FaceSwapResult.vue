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
      <div class="flex gap-5 justify-center items-center self-stretch py-6 w-full font-bold whitespace-nowrap min-h-20">
        <div
          class="self-stretch my-auto"
          data-name="AI換臉"
        >
          <img
            :src="imageUrls.header1"
            class="h-30 object-contain"
            alt="AI換臉"
          />
        </div>
      </div>

      <!-- Main Content -->
      <div class="flex-1">
          <!-- 載入狀態 -->
          <div v-if="isLoading" class="flex flex-col items-center justify-center h-60">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 mb-4" style="border-color: #E0BE91;"></div>
            <div class="text-center" style="color: #E0BE91;">
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
              <div class="text-center" style="color: #E0BE91;">
                <div class="text-lg font-bold mb-2">生成中...</div>
                <div class="text-sm">請稍候，正在處理您的圖片</div>
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
              taskResult && taskResult.status === 'completed' && !isDownloading
                ? ''
                : 'opacity-50 cursor-not-allowed'
            "
            @click="downloadToOfficial"
            :disabled="!taskResult || taskResult.status !== 'completed' || isDownloading"
          >
            <img
              :src="imageUrls.share"
              alt="分享好友"
              class="w-full h-auto object-contain"
            />
          </button>
        </div>

        <!-- Generation History Title -->
        <div 
          class="text-base font-bold step-gradient-text text-center cursor-pointer transition-colors mb-4"
          @click="showHistory = true"
        >
          抽籤紀錄
        </div>

        <!-- 底部使用量計數器 -->
        <div class="flex flex-col items-center gap-4">
          <UsageCounter 
            :currentCount="userUsage" 
            @click="showHistory = true"
          />
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

// 記錄是否已經嘗試從歷史紀錄中查找
const hasTriedHistoryFallback = ref(false)

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
  userUsage: {
    type: Number,
    default: 0
  },
  // 是否在載入時直接顯示歷史紀錄（從上傳頁點「抽籤紀錄」進來）
  startWithHistory: {
    type: Boolean,
    default: false
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
const isTaskCompleted = ref(false) // 標記任務是否已完成（防止後續錯誤覆蓋成功結果）
const retryCount = ref(0) // 重試次數
const maxRetries = 3 // 最大重試次數

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

// 透過 LIFF 分享文字和連結
async function shareViaLiff() {
  try {
    if (typeof liff === 'undefined') {
      throw new Error('LIFF SDK 未載入，請確保在 LINE 環境中使用')
    }

    const shareUrl = 'https://line-liff-face-swap-draw-lots-2026.vercel.app/'
    const shareText = '面相指路，靈籤定運\n從五官看你馬年運勢，仙女下凡來解答！馬上點擊下方籤筒，即可得你的專屬幸運靈籤~\n開始測算：' + shareUrl

    // 如果不在 LINE App 內，改為直接開啟分享連結（不再拋錯）
    if (!liff.isInClient()) {
      console.warn('⚠️ 不在 LINE 應用內，改為直接開啟分享連結')
      window.location.href = shareUrl
      return
    }

    if (!liff.isLoggedIn()) {
      throw new Error('用戶未登入，無法分享。請先登入 LINE 帳號。')
    }

    // 使用 shareTargetPicker 分享 URL（會自動觸發 OG meta tags）
    if (liff.shareTargetPicker) {
      try {
        await liff.shareTargetPicker([
          {
            type: 'text',
            text: shareText
          }
        ])
        return
      } catch (shareError) {
        console.warn('⚠️ shareTargetPicker 失敗，改用 sendMessages:', shareError)
      }
    }

    // 後備方案：使用 sendMessages 發送文字訊息
    await liff.sendMessages([
      {
        type: 'text',
        text: shareText
      }
    ])
  } catch (error) {
    console.error('❌ 分享失敗:', error)
    if (error.message) {
      throw error
    } else {
      throw new Error(`分享失敗: ${error.toString()}`)
    }
  }
}

// 監聽taskId變化
watch(() => props.taskId, (newTaskId, oldTaskId) => {
  // 當 taskId 變化時，重置完成標記
  if (newTaskId !== oldTaskId) {
    isTaskCompleted.value = false
    generatedImages.value = []
    originalImages.value = []
    error.value = null
    hasTriedHistoryFallback.value = false // 重置歷史紀錄查找標記
    retryCount.value = 0 // 重置重試次數
  }
  if (newTaskId) {
    checkTaskStatus()
  }
}, { immediate: true })

// 監聽 userUsage 變化
watch(() => props.userUsage, (newUsage, oldUsage) => {
  // 用戶使用量變化時的處理邏輯
}, { immediate: true })

// 監聽是否要直接顯示歷史紀錄
watch(
  () => props.startWithHistory,
  (value) => {
    if (value) {
      showHistory.value = true
    }
  },
  { immediate: true }
)

// 檢查任務狀態
async function checkTaskStatus() {
  if (!props.taskId) {
    return
  }
  
  // 如果任務已經完成且有圖片，不再檢查（防止後續錯誤覆蓋成功結果）
  if (isTaskCompleted.value && generatedImages.value.length > 0) {
    console.log('✅ 任務已完成，跳過後續檢查')
    return
  }
  
  try {
    isLoading.value = true
    // 只有在任務未完成時才清除錯誤（避免覆蓋成功結果）
    if (!isTaskCompleted.value) {
      error.value = null
    }
    loadingMessage.value = '檢查任務狀態...'
    loadingSubMessage.value = '請稍候'
    
    console.log('🔍 開始檢查任務狀態，taskId:', props.taskId)
    const result = await roadshowService.checkTaskStatus(props.taskId)
    console.log('📥 任務狀態檢查結果:', result)
    
    // 檢查是否有錯誤
    if (result && result.error) {
      const errorStatus = result.error.status;
      const errorMessage = result.error.message || '檢查任務狀態失敗';
      
      // 如果任務已經完成，忽略後續錯誤
      if (isTaskCompleted.value && generatedImages.value.length > 0) {
        console.log('✅ 任務已完成，忽略後續錯誤')
        return
      }
      
      // 如果是 500 錯誤，先重試幾次，如果都失敗再嘗試從歷史紀錄中獲取
      if (errorStatus === 500) {
        retryCount.value += 1;
        
        if (retryCount.value < maxRetries) {
          console.warn(`⚠️ 檢查任務狀態返回 500 錯誤，重試中 (${retryCount.value}/${maxRetries})...`);
          loadingMessage.value = '伺服器暫時無法回應，重試中...';
          loadingSubMessage.value = `第 ${retryCount.value} 次重試`
          // 延遲後重試
          setTimeout(() => {
            checkTaskStatus();
          }, 2000);
          return;
        }
        
        // 重試次數用完，嘗試從歷史紀錄中獲取圖片
        console.warn('⚠️ 重試次數已用完，嘗試從歷史紀錄中查找圖片...');
        
        if (!hasTriedHistoryFallback.value && props.userId) {
          hasTriedHistoryFallback.value = true;
          loadingMessage.value = '從歷史紀錄中查找圖片...';
          loadingSubMessage.value = '請稍候';
          
          try {
            const historyResult = await roadshowService.getUserHistory(props.userId);
            let avatars = [];
            
            if (Array.isArray(historyResult)) {
              avatars = historyResult;
            } else if (historyResult && typeof historyResult === 'object') {
              avatars = historyResult.result?.avatars || historyResult.data?.avatars || historyResult.avatars || [];
            }
            
            // 查找匹配的 taskId
            const matchedAvatar = avatars.find(avatar => {
              const avatarId = avatar.task_id || avatar.id;
              return avatarId === props.taskId;
            });
            
            if (matchedAvatar) {
              console.log('✅ 從歷史紀錄中找到任務圖片:', matchedAvatar);
              
              // 獲取圖片 URL
              const imageUrl = matchedAvatar.image_url || matchedAvatar.result_image || matchedAvatar.image || matchedAvatar.generated_image;
              
              if (imageUrl) {
                // 處理圖片 URL（使用圖片處理 API）
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
                  
                  // 設置圖片和任務結果
                  originalImages.value = [imageUrl];
                  generatedImages.value = [processedImageUrl];
                  taskResult.value = {
                    success: true,
                    id: matchedAvatar.task_id || matchedAvatar.id,
                    status: 'completed',
                    images: [imageUrl]
                  };
                  isTaskCompleted.value = true;
                  error.value = null;
                  
                  console.log('✅ 成功從歷史紀錄中獲取圖片，任務標記為完成');
                  return; // 成功獲取，不再顯示錯誤
                } catch (processError) {
                  console.error('❌ 處理歷史圖片時發生錯誤:', processError);
                }
              }
            } else {
              console.log('⚠️ 歷史紀錄中未找到匹配的任務');
            }
          } catch (historyError) {
            console.error('❌ 從歷史紀錄中查找失敗:', historyError);
          }
        }
        
        // 如果從歷史紀錄中找不到，才顯示錯誤
        error.value = `伺服器錯誤：${errorMessage}。請稍後再試或聯繫客服。`;
        console.error('❌ 檢查任務狀態失敗 (500):', result.error);
        return; // 停止重試
      }
      
      // 其他錯誤也停止重試
      error.value = errorMessage;
      console.error('❌ 檢查任務狀態失敗:', result.error);
      return; // 停止重試
    }
    
    // 新 API 響應格式: { success: true, id, status, images, template_id, result }
    // 或者直接返回: { id, status, images/image, template_id, coupon_code }
    if (result && (result.success !== false) && result.status) {
      // 如果有 status 字段，就認為是有效的響應
      console.log('✅ 任務狀態有效，status:', result.status)
      taskResult.value = result;
      
      // 根據狀態處理
      handleTaskStatus(result);
    } else if (result && result.id && result.status) {
      // 即使沒有 success 字段，只要有 id 和 status 就處理
      console.log('✅ 任務狀態有效（無 success 字段），status:', result.status)
      taskResult.value = result;
      handleTaskStatus(result);
    } else {
      error.value = '檢查任務狀態失敗：未知錯誤';
      console.error('❌ 檢查任務狀態失敗: 未知錯誤', result);
      console.error('❌ 結果詳情:', {
        hasResult: !!result,
        hasSuccess: result?.success,
        hasStatus: result?.status,
        hasId: result?.id,
        resultKeys: result ? Object.keys(result) : []
      });
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
      // 如果任務未完成，延遲後再次檢查
      if (!isTaskCompleted.value) {
        setTimeout(checkTaskStatus, 3000)
      }
      break
      
    case 'processing':
      loadingMessage.value = '正在處理中'
      loadingSubMessage.value = '請稍候，正在生成您的頭像...'
      // 如果任務未完成，延遲後再次檢查
      if (!isTaskCompleted.value) {
        setTimeout(checkTaskStatus, 2000)
      }
      break
      
    case 'completed':
      loadingMessage.value = '生成完成！'
      loadingSubMessage.value = ''
      // 新 API 可能返回 image（單數）或 images（複數）
      let images = [];
      if (data.images && Array.isArray(data.images)) {
        images = data.images;
      } else if (data.image) {
        // 如果是單數 image，轉換為陣列
        images = Array.isArray(data.image) ? data.image : [data.image];
      } else if (data.result?.images && Array.isArray(data.result.images)) {
        images = data.result.images;
      } else if (data.result?.image) {
        images = Array.isArray(data.result.image) ? data.result.image : [data.result.image];
      }
      
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
        // 標記任務已完成，防止後續錯誤覆蓋成功結果
        isTaskCompleted.value = true
        error.value = null // 清除任何之前的錯誤
        console.log('✅ 任務已完成，已設置完成標記')
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

  try {
    isDownloading.value = true
    
    // 本地測試：顯示分享文字
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      const shareUrl = 'https://line-liff-face-swap-draw-lots-2026.vercel.app/'
      const shareText = '面相指路，靈籤定運\n從五官看你馬年運勢，仙女下凡來解答！馬上點擊下方籤筒，即可得你的專屬幸運靈籤~\n開始測算：' + shareUrl
      console.log('📤 分享內容:', shareText)
      alert('分享內容：\n\n' + shareText)
      showMessage('分享內容已顯示（本地測試模式）', 'success')
      return
    }
    
    // 生產環境：透過 LIFF 分享
    loadingMessage.value = '正在分享...'
    
    console.log('📤 準備分享文字和連結')
    await shareViaLiff()
    showMessage('已成功分享！', 'success')
    
  } catch (error) {
    console.error('❌ 分享流程失敗:', error)
    showMessage(`分享失敗: ${error.message}`, 'error')
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
  // 重置完成標記
  isTaskCompleted.value = false
  if (props.taskId) {
    checkTaskStatus()
  }
})
</script>

