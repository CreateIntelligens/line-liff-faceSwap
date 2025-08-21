<template>
  <!-- iphone15 -->
  <div class="app">
    <!-- Face Swap Homepage -->
    <FaceSwapHomepage
      v-if="currentStep === 'faceswap-home'"
      @enter-face-swap="enterFaceSwap"
    />

    <!-- Face Swap Template Selection -->
    <FaceSwapTemplateSelection
      v-if="currentStep === 'template-selection'"
      @next-step="handleTemplateSelection"
      @back="goBack"
    />

    <!-- Face Swap Upload -->
    <FaceSwapUpload
      v-if="currentStep === 'upload'"
      @back="goBack"
      @generate="handleGenerate"
    />

    <!-- Face Swap Result -->
    <FaceSwapResult
      v-if="currentStep === 'result'"
      @back="goBack"
      @regenerate="handleRegenerate"
      @download="handleDownload"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeMount } from 'vue'
import FaceSwapHomepage from './components/FaceSwapHomepage.vue'
import FaceSwapTemplateSelection from './components/FaceSwapTemplateSelection.vue'
import FaceSwapUpload from './components/FaceSwapUpload.vue'
import FaceSwapResult from './components/FaceSwapResult.vue'

// 狀態
const taskId = ref('')
const userId = ref('') // 用戶 ID
const currentStep = ref('faceswap-home') // 初始狀態設定為換臉首頁
const selectedTemplate = ref('')
const isInitialized = ref(false)

// 主要初始化函數
async function initializeApp() {
  console.log('=== 換臉應用程序初始化開始 ===')

  try {
    // 檢查用戶 ID
    if (!userId.value) {
      console.log('用戶 ID 未設置，顯示臉部交換首頁')
      currentStep.value = 'faceswap-home'
      return
    }
    
    // 查詢歷史 avatars
    if (userId.value) {
      try {
        console.log(`查詢用戶 ${userId.value} 的歷史 avatars`)
        const data = await roadshowService.getUserHistory(userId.value)
        console.log('歷史 avatars 數據:', data)
        
        if (data.result && data.result.avatars && data.result.avatars.length > 0) {
          // 取第一筆
          taskId.value = data.result.avatars[0].task_id
          currentStep.value = 'result'
          console.log('找到歷史 avatar，設置 taskId:', taskId.value)
        } else {
          console.log('沒有找到歷史 avatars，顯示臉部交換首頁')
          currentStep.value = 'faceswap-home'
        }
      } catch (e) {
        console.error('查詢歷史 avatars 時發生錯誤:', e)
        currentStep.value = 'faceswap-home' // 錯誤時顯示臉部交換首頁
      }
    } else {
      currentStep.value = 'faceswap-home'
      console.log('無用戶 ID，顯示臉部交換首頁')
    }
  } catch (error) {
    console.error('初始化過程發生錯誤:', error)
    currentStep.value = 'faceswap-home' // 錯誤時顯示臉部交換首頁
  }
  
  isInitialized.value = true
  console.log('=== 換臉應用程序初始化完成 ===')
}

// 在掛載前執行初始化
onBeforeMount(async () => {
  await initializeApp()
})

// 組件掛載後的額外處理
onMounted(() => {
  console.log('Vue 組件已掛載，應用當前狀態:', {
    currentStep: currentStep.value,
    userId: userId.value,
    taskId: taskId.value
  })
})

// 進入臉部交換工具
function enterFaceSwap() {
  currentStep.value = 'template-selection'
}

// 處理模板選擇
function handleTemplateSelection(data) {
  selectedTemplate.value = data.selectedTemplate
  currentStep.value = 'upload'
}

// 處理生成請求
function handleGenerate(data) {
  console.log('開始生成換臉:', data)
  // 在這裡可以調用 API 或處理生成邏輯
  // 生成完成後導航到��果頁面
  currentStep.value = 'result'
}

// 處理重新生成
function handleRegenerate() {
  console.log('重新生成換臉')
  // 返回到模板選擇步驟重新開始
  currentStep.value = 'template-selection'
}

// 處理下載到官方帳號
function handleDownload() {
  console.log('下載至官方帳號')
  // 在這裡可以調用下載 API
}

// 返回上一步
function goBack() {
  if (currentStep.value === 'template-selection') {
    currentStep.value = 'faceswap-home'
  } else if (currentStep.value === 'upload') {
    currentStep.value = 'template-selection'
  } else if (currentStep.value === 'result') {
    currentStep.value = 'upload'
  }
}

</script>

<style scoped>
.app {
  font-family: 'Inter', sans-serif;
  overflow-x: hidden;
  background-color: #333333;
  min-height: 100vh;
}

.conversation-id-screen {
  width: 100vw;
  height: 100vh;
  min-height: 932px;
  background: #5E60FE;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}
</style>
