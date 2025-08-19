<template>
  <div class="w-full min-h-screen bg-primary relative overflow-x-hidden overflow-y-auto pb-[150px]">
    <!-- 背景裝飾線條 -->
    <div class="fixed inset-0 pointer-events-none">
      <img src="/images/vector-5.svg" class="absolute opacity-20" alt="">
      <img src="/images/vector-13.svg" class="absolute opacity-20" alt="">
      <img src="/images/vector-14.svg" class="absolute opacity-20" alt="">
    </div>
    
    <!-- 標題區域 -->
    <div class="relative mx-auto mt-3 w-[calc(100%-48px)] max-w-[382px] z-10 sm:w-[480px] sm:max-w-[90%] sm:mt-8">
      <div class="relative w-full">
        <img src="/images/group97.png" alt="標題背景" class="w-full block">
        <h1 class="absolute inset-0 flex items-center justify-center font-inter font-black text-4xl leading-tight text-center text-black m-0 p-0 sm:text-5xl">
          專屬人格照片
        </h1>
      </div>
    </div>
    
    <!-- 主要內容區域 -->
    <div class="relative mx-auto mt-3 w-[calc(100%-48px)] max-w-[372px] sm:w-[420px] sm:max-w-[90%] sm:mt-6">
      <!-- 上方內容框 -->
      <div class="relative w-full">
        <div class="relative w-full bg-white border-2 border-black rounded-lg">
          <!-- 頂部裝飾條 -->
          <div class="absolute left-0 top-0 w-full h-[18px] bg-accent rounded-t-lg border-2 border-black border-b-0"></div>
          
          <!-- 裝飾點點 -->
          <div class="absolute left-4 top-[5px] z-10 flex gap-1">
            <div class="w-[7.6px] h-[7.6px] bg-black rounded-full"></div>
            <div class="w-[7.6px] h-[7.6px] bg-black rounded-full"></div>
            <div class="w-[7.6px] h-[7.6px] bg-black rounded-full"></div>
          </div>

          <!-- 角色圖片 -->
          <div class="relative z-10 p-5 pt-8 text-center flex justify-center items-center w-full">
            <div v-if="isPolling" class="flex flex-col items-center gap-4">
              <div class="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              <p class="text-white text-lg font-inter font-bold">圖片生成中...</p>
            </div>
            <img v-else :src="localImageUrl || '/images/character-result.png'" alt="專屬人格角色" class="w-auto h-auto object-contain rounded-lg max-w-full aspect-[768/1024] sm:w-[360px] sm:h-[492px]" />
            <p v-if="pollingError" class="text-red-500 text-sm mt-2">圖片生成逾時，請稍後重試</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 分析結果區域 -->
    <div class="relative mx-auto mt-3 w-[calc(100%-48px)] max-w-[372px] sm:w-[420px] sm:max-w-[90%] sm:mt-6">
      <!-- 特質分析框 -->
      <div class="relative mb-5 sm:mb-4">
        <div class="relative w-full bg-white border-2 border-black rounded-lg">
          <!-- 頂部裝飾條 -->
          <div class="absolute left-0 top-0 w-full h-[18px] bg-accent rounded-t-lg border-2 border-black border-b-0"></div>
          
          <!-- 裝飾點點 -->
          <div class="absolute left-4 top-[5px] z-10 flex gap-1">
            <div class="w-[7.6px] h-[7.6px] bg-black rounded-full"></div>
            <div class="w-[7.6px] h-[7.6px] bg-black rounded-full"></div>
            <div class="w-[7.6px] h-[7.6px] bg-black rounded-full"></div>
          </div>

          <div class="relative z-10 px-5 pt-8 pb-5">
            <div class="flex mb-2">
              <span class="text-xs text-[#333333] mr-2 sm:text-sm">•</span>
              <p class="text-sm text-[#333333] leading-[1.4] sm:text-sm">您的MBTI類型：{{ personalityInfo ? personalityInfo.name : mbtiResult }}</p>
            </div>
            <div class="flex mb-2">
              <span class="text-xs text-[#333333] mr-2 sm:text-sm">•</span>
              <p class="text-sm text-[#333333] leading-[1.4] sm:text-sm">團隊角色：{{ personalityInfo ? personalityInfo.team_role : '等待分析中...' }}</p>
            </div>
            <div class="flex mb-2">
              <span class="text-xs text-[#333333] mr-2 sm:text-sm">•</span>
              <p class="text-sm text-[#333333] leading-[1.4] sm:text-sm">主要特質：{{ personalityInfo ? personalityInfo.traits : '等待分析中...' }}</p>
            </div>
            <div class="flex mb-2">
              <span class="text-xs text-[#333333] mr-2 sm:text-sm">•</span>
              <p class="text-sm text-[#333333] leading-[1.4] sm:text-sm">團隊貢獻：{{ personalityInfo ? personalityInfo.contribution : '等待分析中...' }}</p>
            </div>
            <div class="flex">
              <span class="text-xs text-[#333333] mr-2 sm:text-sm">•</span>
              <p class="text-sm text-[#333333] leading-[1.4] sm:text-sm">潛在挑戰：{{ personalityInfo ? personalityInfo.potential_challenges : '等待分析中...' }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 附加信息框 -->
      <div class="relative">
        <div class="relative w-full bg-white border-2 border-black rounded-lg">
          <!-- 頂部裝飾條 -->
          <div class="absolute left-0 top-0 w-full h-[18px] bg-accent rounded-t-lg border-2 border-black border-b-0"></div>
          
          <!-- 裝飾點點 -->
          <div class="absolute left-4 top-[5px] z-10 flex gap-1">
            <div class="w-[7.6px] h-[7.6px] bg-black rounded-full"></div>
            <div class="w-[7.6px] h-[7.6px] bg-black rounded-full"></div>
            <div class="w-[7.6px] h-[7.6px] bg-black rounded-full"></div>
          </div>

          <div class="relative z-10 px-5 pt-8 pb-4">
            <div class="flex mb-2">
              <p class="text-sm font-bold text-[#333333]">專屬編號：{{ localResultId }}</p>
            </div>
            <div class="flex">
              <p class="text-sm text-[#333333] leading-[1.3]">
                展覽過後將關閉服務，可點擊下載將照片傳至官方帳號！<br>
                如想列印留念請找現場工作人員協助！
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 下載按鈕區域 -->
      <div class="relative mt-6 mb-[50px] mx-auto w-[280px] sm:w-[320px] sm:mt-4">
        <div class="relative">
          <img src="/images/group78.png" alt="按鈕背景" class="w-full h-[60px]">
          <button 
            class="absolute inset-0 w-full h-full bg-transparent border-none font-poppins font-bold text-base text-[#333333] cursor-pointer hover:-translate-y-0.5 transition-transform duration-300"
            @click="downloadResult"
          >
            下載至官方帳號
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import personalityTypes from '../data/mbti-questions.json'

const props = defineProps({
  mbtiResult: {
    type: String,
    default: ''
  },
  userInfo: {
    type: Object,
    default: () => ({})
  },
  imageUrl: {
    type: String,
    default: ''
  },
  resultId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['download-requested', 'image-loaded'])

// 本地狀態
const localImageUrl = ref(props.imageUrl)
const isPolling = ref(!props.imageUrl && props.resultId)
const pollingError = ref(false)
const localResultId = ref(props.resultId || '---')
const personalityInfo = ref(null)

// 監聽 props 變化
watch(() => props.imageUrl, (newVal) => {
  if (newVal) {
    localImageUrl.value = newVal
    isPolling.value = false
  }
})

// 當組件掛載時，如果有 resultId 但沒有 imageUrl，則開始輪詢
onMounted(() => {
  if (props.resultId && !props.imageUrl) {
    pollStatus(props.resultId)
  }
})

async function pollStatus(taskId) {
  if (!taskId) return
  
  isPolling.value = true
  let retry = 0
  const maxRetry = 60 // 最多輪詢2分鐘
  
  while (retry < maxRetry && isPolling.value) {
    try {
      console.log(`結果頁輪詢第 ${retry + 1} 次...`)
      const res = await fetch(`https://f2d8-60-248-142-124.ngrok-free.app/api/mbti/status/${taskId}`, {
  headers: {
    'ngrok-skip-browser-warning': 'true'
  }
})
      if (res.ok) {
        const responseData = await res.json()
        console.log('輪詢響應:', responseData)
        const data = responseData.result;
        console.log('輪詢數據:', data)
        
        if (data?.state === 20) {
           // 失敗，返回updatescreen
          alert('圖片生成失敗，請稍後重試')
          isPolling.value = false;
          emit('image-loaded', { 
            task_id: taskId, 
            image_url: null,
            result_id: localResultId.value,
            personality_info: null
          });
          return;
        }

        // 更新專屬編號
        if (data && data.id) {
          localResultId.value = data.id;
          console.log('更新專屬編號:', localResultId.value);
        }
        
        // 處理性格類型數據
        if (data && data.resultType) {
          const mbtiType = data.resultType;
          console.log('獲取MBTI類型:', mbtiType);
          if (personalityTypes.personality_types && personalityTypes.personality_types[mbtiType]) {
            personalityInfo.value = personalityTypes.personality_types[mbtiType];
            console.log('獲取性格特質信息:', personalityInfo.value);
          }
        }
        
        // 支援 images 或 image_url
        let imageUrl = null
        if (data && data.images && data.images.length > 0) {
          imageUrl = data.images[0]
          console.log('從 data.images 獲取圖片 URL:', imageUrl)
        } else if (data && data.image_url) {
          imageUrl = data.image_url
          console.log('從 data.image_url 獲取圖片 URL:', imageUrl)
        }
        if (imageUrl) {
          console.log('成功獲取圖片:', imageUrl)
          localImageUrl.value = imageUrl
          // 通知父組件已獲取圖片
          emit('image-loaded', { 
            task_id: taskId, 
            image_url: imageUrl,
            result_id: localResultId.value,
            personality_info: personalityInfo.value
          })
          // 完全中斷輪詢
          console.log('圖片已獲取，停止輪詢')
          isPolling.value = false
          return
        }
      }
    } catch (e) {
      console.error('輪詢錯誤:', e)
    }
    
    // 等待
    await new Promise(resolve => setTimeout(resolve, 2000))
    retry++
  }
  
  // 如果到此，表示輪詢超時
  if (isPolling.value) {
    console.error('圖片生成逾時')
    pollingError.value = true
    isPolling.value = false
  }
}

function downloadResult() {
  emit('download-requested', {
    mbtiResult: props.mbtiResult,
    userInfo: props.userInfo,
    imageUrl: localImageUrl.value
  })
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Poppins:wght@700&display=swap');

.font-inter {
  font-family: 'Inter', sans-serif;
}

.font-poppins {
  font-family: 'Poppins', sans-serif;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
