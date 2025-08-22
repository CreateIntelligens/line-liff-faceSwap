<template>
  <div
    class="relative mx-auto my-0 bg-[#333333] h-[774px] w-[375px] max-md:w-full max-md:max-w-screen-md max-sm:w-full max-sm:h-auto max-sm:min-h-[774px]"
  >
    <!-- Face Swap History Page -->
    <FaceSwapHistory 
      v-if="showHistory" 
      :userId="props.userId || 'abc'"
      @back="showHistory = false"
    />
    
    <!-- Main Result Page -->
    <div v-if="!showHistory" class="flex-1 flex flex-col">
      <!-- Header -->
      <div class="flex gap-5 justify-center items-center px-5 py-6 w-full font-bold border-b border-[#EBD8B2] min-h-20">
        <div class="text-xl text-[#EBD8B2]">
          AI換臉
        </div>
        <div class="flex justify-center items-center w-[114px] h-8 rounded-[50px] bg-[#EBD8B2]">
          <div class="text-xs font-bold text-[#333]">
            剩餘次數：1/10
          </div>
        </div>
      </div>

     <!-- 步驟 -->
     <div
      class="flex mt-8 max-w-full text-base font-bold text-center text-[#EBD8B2] whitespace-nowrap w-[202px] mx-auto"
    >
      <img
        src="/images/finish.png"
        class="w-6 h-6 object-contain"
        alt="Step 1"
      />
      <img
        src="https://api.builder.io/api/v1/image/assets/TEMP/7f03c8a2d5652999b0cf2dc2c1710e475c7781ed?placeholderIfAbsent=true"
        class="object-contain shrink-0 my-auto aspect-[32.26] w-[65px]"
      />
      <img
        src="/images/step2_inprogress.png"
        class="w-6 h-6 object-contain"
        alt="Step 2"
      />
      <img
        src="https://api.builder.io/api/v1/image/assets/TEMP/7f03c8a2d5652999b0cf2dc2c1710e475c7781ed?placeholderIfAbsent=true"
        class="object-contain shrink-0 my-auto aspect-[32.26] w-[65px]"
      />
      <img
        src="/images/step3_inactive.png"
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

      
    <div class="flex justify-start items-center px-6 mb-4">
        <div class="flex items-center gap-3">
          <img 
            src="/images/step3_inprogress.png" 
            class="w-6 h-6 object-contain" 
            alt="Step 3"
          />
          <div class="text-base font-bold text-[#EBD8B2]">
            生成結果
          </div>
        </div>
      </div>
      <!-- Main Content -->
      <div class="flex-1 px-6 pb-8 pt-4 border border-[#EBD8B2]">
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
        <div v-else-if="taskResult" class="space-y-6">
          <!-- Header Logo and Crown -->
          <div class="flex justify-between items-start">
            <img 
              class="h-5 object-contain" 
              src="https://api.builder.io/api/v1/image/assets/TEMP/de482b87c9c17cee473acb6454371b535acb8d1b?width=599" 
              alt="標準字" 
            />
            <img 
              class="w-12 h-12 object-contain transform -rotate-[10.809deg]" 
              src="https://api.builder.io/api/v1/image/assets/TEMP/2404d6238dca7a10ae577f3ba74faa4ec02d24e9?width=91" 
              alt="皇冠" 
            />
          </div>

          <!-- Images Section -->
          <div class="space-y-6">
            <!-- Original Image with Star -->
            <div class="relative">
              <img 
                class="w-full h-60 object-cover rounded-md" 
                :src="getTemplateImage(props.selectedTemplate)" 
                :alt="`模板圖片 - ${getTemplateName(props.selectedTemplate)}`" 
              />
              <img 
                class="absolute -left-2 -bottom-2 w-14 h-14 object-contain" 
                src="https://api.builder.io/api/v1/image/assets/TEMP/7b08a9934bfc575c52c100d8132b5f128780d934?width=106" 
                alt="星" 
              />
            </div>

            <!-- Result Image -->
            <div v-if="generatedImages.length > 0">
              <img 
                v-for="(image, index) in generatedImages" 
                :key="index"
                class="w-full h-60 object-cover rounded-md mb-4" 
                :src="image" 
                :alt="`生成結果 ${index + 1}`" 
              />
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
                class="h-8 object-contain" 
                src="https://api.builder.io/api/v1/image/assets/TEMP/3f99b54e280534e7c39a8d8bae3acd04680b9c57?width=425" 
                alt="0815" 
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="bg-[#333333] px-6 py-8">
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
              taskResult && taskResult.status === 'completed'
                ? 'bg-gradient-to-r from-[#EE95FF] via-[#F192FF] via-[#B9B9FB] to-[#AFCBF7] hover:shadow-lg'
                : 'bg-[#C7C7C7] cursor-not-allowed'
            "
            @click="downloadToOfficial"
            :disabled="!taskResult || taskResult.status !== 'completed'"
          >
            <div class="font-noto-sans-tc text-base font-bold text-[#333]">
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
import { roadshowService } from '../../services/roadshowService.js'

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

// 載入狀態訊息
const loadingMessage = ref('檢查任務狀態...')
const loadingSubMessage = ref('請稍候')

// 監聽taskId變化
watch(() => props.taskId, (newTaskId) => {
  if (newTaskId) {
    console.log('🔄 檢測到新的taskId:', newTaskId)
    checkTaskStatus()
  }
}, { immediate: true })

// 監聽selectedTemplate變化，處理顯示歷史的請求
watch(() => props.selectedTemplate, (newTemplate) => {
  if (newTemplate === 'show_history') {
    console.log('🔄 檢測到顯示歷史請求')
    console.log('🔍 FaceSwapResult - 當前props.userId:', props.userId)
    console.log('🔍 FaceSwapResult - userId類型:', typeof props.userId)
    showHistory.value = true
  }
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
    
    console.log(`🔍 檢查任務狀態: ${props.taskId}`)
    const result = await roadshowService.checkTaskStatus(props.taskId)
    
    if (result && (result.success || result.status === 'completed' || result.status === 'pending' || result.status === 'processing')) {
      // 根據 API 返回的數據結構處理
      const taskData = result.data || result.result || result;
      taskResult.value = taskData;
      console.log('✅ 任務狀態獲取成功:', taskData);
      
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
function handleTaskStatus(data) {
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
      // 處理生成的圖片
      if (data.images && data.images.length > 0) {
        generatedImages.value = data.images
        console.log('🖼️ 生成的圖片:', data.images)
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
function downloadToOfficial() {
  if (taskResult.value && taskResult.value.status === 'completed') {
    console.log('📥 下載至官方帳號')
    emit('download')
  } else {
    console.warn('⚠️ 任務尚未完成，無法下載')
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
    'play': 'https://api.builder.io/api/v1/image/assets/TEMP/dcd03673f19d2a7475c34d7c9d5287881199e237?placeholderIfAbsent=true',   // 綜藝玩很大
    'wife': 'https://api.builder.io/api/v1/image/assets/TEMP/192f85df3857b6124af697783a00f8eb5ac3105a?placeholderIfAbsent=true',   // 犀利人妻
    'love': 'https://api.builder.io/api/v1/image/assets/TEMP/fbf730fb39608cf08e5554286a854a8280832fab?placeholderIfAbsent=true',   // 命中註定我愛你
    'super': 'https://api.builder.io/api/v1/image/assets/TEMP/20cf8a9eba96e42bb731ce0ef8be47c78b4dd270?placeholderIfAbsent=true'  // 超級夜總會
  };
  
  return imageMap[templateId] || 'https://api.builder.io/api/v1/image/assets/TEMP/dcd03673f19d2a7475c34d7c9d5287881199e237?placeholderIfAbsent=true';
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

// 組件掛載時的調試
onMounted(() => {
  console.log('🚀 FaceSwapResult 組件已掛載')
  console.log('🔍 掛載時props.userId:', props.userId)
  console.log('🔍 掛載時props.taskId:', props.taskId)
  console.log('🔍 掛載時props.selectedTemplate:', props.selectedTemplate)
})
</script>

<style scoped>
/* 組件樣式 - 使用 Flexbox 佈局，無需額外的定位樣式 */
</style>
