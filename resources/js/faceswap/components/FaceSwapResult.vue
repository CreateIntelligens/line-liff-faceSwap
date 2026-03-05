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
      @back="handleHistoryBack"
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

        <!-- 底部使用量計數器（點擊可查看抽籤紀錄） -->
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
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import FaceSwapHistory from './FaceSwapHistory.vue'
import UsageCounter from './UsageCounter.vue'
import { roadshowService } from '../../services/roadshowService.js'
import { modeService } from '../../services/modeService.js'
import { imageUrls } from '@/config/imageUrls'
import { appConfig } from '@/config/appConfig'
import { pushImageGenerationSuccess } from '@/utils/gtmService.js'

// 記錄是否已經嘗試從歷史紀錄中查找
const hasTriedHistoryFallback = ref(false)
// 記錄是否已經推送圖片生成成功事件（避免重複推送）
const hasPushedGenerationSuccess = ref(false)

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
  generationStartedAt: {
    type: Number,
    default: null
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

// 任務狀態檢查定時器
const taskStatusCheckInterval = ref(null)

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

// 透過 LIFF 分享文字和連結（僅使用 shareTargetPicker）
async function shareViaLiff() {
  if (typeof liff === 'undefined') {
    throw new Error('LIFF SDK 未載入，請確保在 LINE 環境中使用')
  }

  const shareUrl = (window.endpoint && window.endpoint.domain) 
    ? `${window.endpoint.domain}`
    : 'https://line-liff-face-swap-draw-lots-2026.vercel.app'
  const shareText = '面相指路，靈籤定運\n從五官看你馬年運勢，仙女下凡來解答！馬上點擊下方籤筒，即可得你的專屬幸運靈籤~\n開始測算：' + shareUrl

  if (!liff.shareTargetPicker) {
    throw new Error('目前裝置暫不支援好友分享功能')
  }

  // 呼叫 shareTargetPicker，讓使用者選好友／群組
  const result = await liff.shareTargetPicker([
    {
      type: 'text',
      text: shareText
    }
  ])

  // 根據官方文件，result 為 null 代表使用者取消
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

// 監聽taskId變化
watch(() => props.taskId, (newTaskId, oldTaskId) => {
  // 當 taskId 變化時，清除舊的定時器
  if (newTaskId !== oldTaskId) {
    clearTaskStatusInterval()
    isTaskCompleted.value = false
    generatedImages.value = []
    originalImages.value = []
    error.value = null
    hasPushedGenerationSuccess.value = false // 重置事件推送標記
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
    // 確保清除定時器
    clearTaskStatusInterval()
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
        
        const usedFallback = await useHistoryFallback({
          errorMessage,
          userId: props.userId,
          userUsage: props.userUsage,
          taskId: props.taskId,
          generationStartedAt: props.generationStartedAt
        });
        
        if (usedFallback) {
          return; // 已成功從歷史紀錄取得圖片
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

// 嘗試從歷史紀錄中取得圖片（500 錯誤時的 fallback）
async function useHistoryFallback({ errorMessage, userId, userUsage, taskId, generationStartedAt }) {
  try {
    if (hasTriedHistoryFallback.value || !userId) {
      return false;
    }
    
    hasTriedHistoryFallback.value = true;
    loadingMessage.value = '從歷史紀錄中查找圖片...';
    loadingSubMessage.value = '請稍候';
    
    const historyResult = await roadshowService.getUserHistory(userId);
    let avatars = [];
    
    if (Array.isArray(historyResult)) {
      avatars = historyResult;
    } else if (historyResult && typeof historyResult === 'object') {
      avatars = historyResult.result?.avatars || historyResult.data?.avatars || historyResult.avatars || [];
    }
    
    const serverUsageCount = avatars.length;
    
    // 條件 1：伺服器上的使用量必須與前端顯示一致，且至少有一筆紀錄（代表這次真的有新增）
    if (!serverUsageCount || serverUsageCount !== userUsage) {
      console.warn('⚠️ 使用量不一致或沒有紀錄，放棄歷史 fallback：', {
        serverUsageCount,
        frontUsage: userUsage
      });
      return false;
    }
    
    // 查找匹配的 taskId
    let matchedAvatar = avatars.find(avatar => {
      const avatarId = avatar.task_id || avatar.id;
      return avatarId === taskId;
    });
    
    const WINDOW_MS = 2 * 60 * 1000; // 2 分鐘時間窗
    const startedAt = generationStartedAt || 0;
    
    // 如果找不到完全匹配的 taskId，改用「最新一筆已完成的紀錄」作為 fallback
    if (!matchedAvatar && avatars.length > 0) {
      console.log('⚠️ 歷史紀錄中未找到匹配的 taskId，改找最新完成的紀錄');
      let completedAvatars = avatars.filter(avatar => avatar.status === 'completed');
      
      // 如果有時間視窗，先過濾出在時間窗內的紀錄
      if (startedAt && completedAvatars.length > 0) {
        const windowFiltered = completedAvatars.filter(avatar => {
          if (!avatar.created_at) return false;
          const createdTime = new Date(avatar.created_at).getTime();
          if (isNaN(createdTime)) return false;
          return Math.abs(createdTime - startedAt) <= WINDOW_MS;
        });
        
        if (windowFiltered.length > 0) {
          completedAvatars = windowFiltered;
        }
      }
      
      if (completedAvatars.length > 0) {
        // 如果有多筆完成紀錄，選擇 created_at 最新的一筆
        matchedAvatar = completedAvatars.reduce((latest, current) => {
          const latestTime = latest && latest.created_at ? new Date(latest.created_at).getTime() : 0;
          const currentTime = current && current.created_at ? new Date(current.created_at).getTime() : 0;
          return currentTime > latestTime ? current : latest;
        }, completedAvatars[0]);
      }
    }
    
    if (!matchedAvatar) {
      console.log('History fallback: no usable record found in avatars');
      return false;
    }
    
    console.log('✅ 從歷史紀錄中找到可用的任務圖片:', matchedAvatar);
    
    // 獲取圖片 URL
    const imageUrl = matchedAvatar.image_url || matchedAvatar.result_image || matchedAvatar.image || matchedAvatar.generated_image;
    
    if (!imageUrl) {
      return false;
    }
    
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
      
      // 推送圖片生成成功事件（只推送一次）
      if (!hasPushedGenerationSuccess.value) {
        pushImageGenerationSuccess({
          taskId: taskId || matchedAvatar.task_id || matchedAvatar.id,
          userMode: modeService.getMode()
        })
        hasPushedGenerationSuccess.value = true
      }
      
      // 清除定時器，因為任務已完成
      clearTaskStatusInterval();
      
      console.log('✅ 成功從歷史紀錄中獲取圖片，任務標記為完成');
      return true;
    } catch (processError) {
      console.error('❌ 處理歷史圖片時發生錯誤:', processError);
      return false;
    }
  } catch (historyError) {
    console.error('❌ 從歷史紀錄中查找失敗:', historyError);
    return false;
  }
}

// 清理任務狀態檢查定時器
function clearTaskStatusInterval() {
  if (taskStatusCheckInterval.value) {
    clearInterval(taskStatusCheckInterval.value)
    taskStatusCheckInterval.value = null
    console.log('🧹 已清除任務狀態檢查定時器')
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
  
  // 啟動新的輪詢
  taskStatusCheckInterval.value = setInterval(() => {
    // 如果任務已完成，停止輪詢
    if (isTaskCompleted.value && generatedImages.value.length > 0) {
      clearTaskStatusInterval()
      return
    }
    checkTaskStatus()
  }, interval)
  
  console.log(`🔄 已啟動任務狀態檢查輪詢（每 ${interval / 1000} 秒檢查一次）`)
}

// 處理任務狀態
async function handleTaskStatus(data) {
  const status = data.status
  
  switch (status) {
    case 'pending':
      loadingMessage.value = '任務等待中'
      loadingSubMessage.value = '正在排隊處理...'
      // 如果任務未完成，啟動持續輪詢
      if (!isTaskCompleted.value) {
        startTaskStatusPolling(3000)
      }
      break
      
    case 'processing':
      loadingMessage.value = '正在處理中'
      loadingSubMessage.value = '請稍候，正在生成您的頭像...'
      // 如果任務未完成，啟動持續輪詢
      if (!isTaskCompleted.value) {
        startTaskStatusPolling(2000)
      }
      break
      
    case 'completed':
      // 立即清除輪詢定時器
      clearTaskStatusInterval()
      
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
        
        // 推送圖片生成成功事件（只推送一次）
        if (!hasPushedGenerationSuccess.value) {
          pushImageGenerationSuccess({
            taskId: props.taskId || data.id || data.result?.id,
            userMode: modeService.getMode()
          })
          hasPushedGenerationSuccess.value = true
        }
      }
      break
      
    case 'failed':
      // 任務失敗時也清除輪詢
      clearTaskStatusInterval()
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

// 檢查是否為 dev_user（不受限制）
const isDevUser = computed(() => {
  return props.userId && props.userId.startsWith('dev_user_')
})

// 檢查是否已達生成限制
const isAtLimit = computed(() => {
  return !isDevUser.value && props.userUsage >= appConfig.maxUsageLimit
})

// Handle regenerate button click
function regenerate() {
  // 檢查是否已達生成限制
  if (isAtLimit.value) {
    alert('已達個人生成上限，感謝您的參與')
    return
  }
  
  emit('regenerate')
}

// 處理歷史頁面的返回行為
function handleHistoryBack() {
  // 如果有任務結果（代表是從生成結果進來看的歷史），就只關掉歷史列表
  if (taskResult.value || props.taskId) {
    showHistory.value = false
  } else {
    // 如果沒有任務結果（代表是從上傳頁直接點「抽籤紀錄」進來），就請父層返回上一頁（回到上傳頁）
    emit('back')
  }
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
    
    // 初始化模式服務（如果尚未初始化）
    if (!modeService.isInitialized) {
      modeService.initialize()
    }
    
    // 根據模式選擇分享方式
    const currentMode = modeService.getMode()
    loadingMessage.value = '正在分享...'
    
    console.log('📤 準備分享文字和連結，當前模式:', currentMode)
    
    if (currentMode === 'liff') {
      // LIFF 模式：使用 LIFF 分享
      await shareViaLiff()
      showMessage('已成功分享！', 'success')
    } else {
      // Email 模式：先判斷是否為桌機（PC）
      const isDesktop = window.innerWidth > 768 // 螢幕寬度大於 768px 視為桌機
      
      if (isDesktop) {
        // 桌機版本：顯示提示訊息，不執行分享
        showMessage('分享功能請在手機上操作', 'info')
        console.log('💻 桌機版本，不執行分享功能')
        return
      }
      
      // 手機版本：判斷是否在 LINE 環境內（點擊時才判斷）
      const enableLiff = window.endpoint?.enableLiff
      const isInLineClient = enableLiff && 
                             typeof liff !== 'undefined' && 
                             liff.isInClient() && 
                             liff.shareTargetPicker
      
      if (isInLineClient) {
        // 在 LINE 環境內，使用 LIFF 分享
        console.log('📱 偵測到 LINE 環境，使用 LIFF 分享')
        await shareViaLiff()
        showMessage('已成功分享！', 'success')
      } else {
        // 不在 LINE 環境內，使用 Web Share API
        try {
          await shareViaWeb()
          showMessage('已成功分享！', 'success')
        } catch (webShareError) {
          // Web Share API 不支援或失敗時，降級為顯示分享文字
          console.warn('⚠️ Web Share API 不可用，降級為顯示分享文字:', webShareError)
          const shareUrl = (window.endpoint && window.endpoint.domain) 
            ? `${window.endpoint.domain}`
            : 'https://line-liff-face-swap-draw-lots-2026.vercel.app'
          const shareText = '面相指路，靈籤定運\n從五官看你馬年運勢，仙女下凡來解答！馬上點擊下方籤筒，即可得你的專屬幸運靈籤~\n開始測算：' + shareUrl
          
          // 在手機瀏覽器上，嘗試複製到剪貼簿
          if (navigator.clipboard && navigator.clipboard.writeText) {
            try {
              await navigator.clipboard.writeText(shareText)
              showMessage('分享內容已複製到剪貼簿', 'success')
              console.log('📋 分享內容已複製到剪貼簿')
            } catch (clipboardError) {
              // 複製失敗，顯示 alert
              alert('分享內容：\n\n' + shareText)
              showMessage('分享內容已顯示', 'success')
            }
          } else {
            // 不支援剪貼簿，直接顯示 alert
            alert('分享內容：\n\n' + shareText)
            showMessage('分享內容已顯示', 'success')
          }
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


// 組件掛載時檢查狀態
onMounted(() => {
  // 重置完成標記
  isTaskCompleted.value = false
  if (props.taskId) {
    checkTaskStatus()
  }
  
  // 添加頁面可見性監聽器
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      // 頁面重新可見時，如果任務還在進行中，重新啟動輪詢
      if (props.taskId && !isTaskCompleted.value && !taskStatusCheckInterval.value) {
        console.log('👁️ 頁面重新可見，重新啟動任務狀態檢查輪詢')
        checkTaskStatus()
      } else if (props.taskId && !isTaskCompleted.value && taskStatusCheckInterval.value) {
        // 如果已經有輪詢在運行，確保它繼續運行
        console.log('👁️ 頁面重新可見，輪詢已在運行中')
      }
    } else {
      // 頁面隱藏時，可以選擇暫停輪詢（但不清除定時器，讓它繼續運行）
      console.log('👁️ 頁面已隱藏，輪詢將繼續在背景運行')
    }
  }
  
  document.addEventListener('visibilitychange', handleVisibilityChange)
  
  // 保存清理函數以便在卸載時使用
  window._cleanupTaskStatusVisibilityListener = () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }
})

// 組件卸載前清理
onBeforeUnmount(() => {
  // 清理任務狀態檢查定時器
  clearTaskStatusInterval()
  
  // 清理頁面可見性監聽器
  if (window._cleanupTaskStatusVisibilityListener) {
    window._cleanupTaskStatusVisibilityListener()
    delete window._cleanupTaskStatusVisibilityListener
  }
})
</script>

