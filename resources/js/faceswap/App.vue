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
      :userUsage="userUsage"
      @next-step="handleTemplateSelection"
      @back="goBack"
    />

    <!-- Face Swap Upload -->
    <FaceSwapUpload
      v-if="currentStep === 'upload'"
      :selectedTemplate="selectedTemplate"
      :userUsage="userUsage"
      @back="goBack"
      @generate="handleGenerate"
      @showHistory="handleShowHistory"
    />

    <!-- Face Swap Result -->
    <FaceSwapResult
      v-if="currentStep === 'result'"
      :taskId="taskId"
      :userId="userId"
      :selectedTemplate="selectedTemplate"
      :userUsage="userUsage"
      @back="goBack"
      @regenerate="handleRegenerate"
      @download="handleDownload"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeMount, nextTick } from 'vue'
import FaceSwapHomepage from './components/FaceSwapHomepage.vue'
import FaceSwapTemplateSelection from './components/FaceSwapTemplateSelection.vue'
import FaceSwapUpload from './components/FaceSwapUpload.vue'
import FaceSwapResult from './components/FaceSwapResult.vue'
import { roadshowService } from '../services/roadshowService.js'

// 狀態
const taskId = ref('')
const userId = ref('abc') // 用戶 ID - 設置為測試值
const currentStep = ref('faceswap-home') // 初始狀態設定為換臉首頁
const selectedTemplate = ref('')
const isInitialized = ref(false)
const userUsage = ref(0) // 用戶已生成的圖片數量

// 主要初始化函數
async function initializeApp() {
  console.log('=== 換臉應用程序初始化開始 ===')

  try {
    // 重置所有狀態，確保重整後是乾淨的狀態
    currentStep.value = 'faceswap-home'
    selectedTemplate.value = ''
    taskId.value = ''
    
    // 檢查用戶 ID
    if (!userId.value) {
      console.log('用戶 ID 未設置，顯示臉部交換首頁')
      return
    }
    
    // 查詢歷史 avatars（僅用於更新用戶使用量，不改變頁面狀態）
    if (userId.value) {
      try {
        console.log(`查詢用戶 ${userId.value} 的歷史 avatars`)
        const data = await roadshowService.getUserHistory(userId.value)
        
        // 使用與FaceSwapHistory相同的相容性檢查
        let avatars = [];
        
        if (Array.isArray(data)) {
          // 如果直接返回陣列
          avatars = data;
        } else if (data && typeof data === 'object') {
          // 如果是物件格式
          avatars = data.result?.avatars || data.data?.avatars || data.avatars || [];
        }
        
        // 更新用戶使用量
        userUsage.value = avatars.length
        console.log('📊 用戶使用量已更新:', userUsage.value)
        
        // 重整後總是回到首頁，不自動跳轉到結果頁面
        console.log('重整後回到首頁')
      } catch (e) {
        console.error('查詢歷史 avatars 時發生錯誤:', e)
        // 錯誤時保持首頁狀態
      }
    }
  } catch (error) {
    console.error('初始化過程發生錯誤:', error)
    // 錯誤時保持首頁狀態
  }
  
  isInitialized.value = true
  console.log('=== 換臉應用程序初始化完成 ===')
}

// 添加一個單獨的函數來刷新用戶使用量
async function refreshUserUsage() {
  try {
    const data = await roadshowService.getUserHistory(userId.value)
    
    // 使用與FaceSwapHistory相同的相容性檢查
    let avatars = [];
    
    if (Array.isArray(data)) {
      // 如果直接返回陣列
      avatars = data;
    } else if (data && typeof data === 'object') {
      // 如果是物件格式
      avatars = data.result?.avatars || data.data?.avatars || data.avatars || [];
    }
    
    // 更新用戶使用量
    userUsage.value = avatars.length
    console.log('📊 用戶使用量已刷新:', userUsage.value)
    
    return avatars.length
  } catch (error) {
    console.error('❌ 刷新用戶使用量失敗:', error)
    return 0
  }
}

// 在掛載前執行初始化
onBeforeMount(async () => {
  await initializeApp()
})

// 組件掛載後的額外處理
onMounted(async () => {
  console.log('Vue 組件已掛載，應用當前狀態:', {
    currentStep: currentStep.value,
    userId: userId.value,
    taskId: taskId.value,
    userUsage: userUsage.value
  })
  
  // 組件掛載後，再次刷新用戶使用量以確保數據準確
  if (userId.value && isInitialized.value) {
    await refreshUserUsage()
  }
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
  console.log('📊 更新前的用戶使用量:', userUsage.value)
  
  // 保存任務ID和模板信息
  taskId.value = data.taskId
  // 保存選擇的模板ID（從data中獲取）
  if (data.selectedTemplate) {
    selectedTemplate.value = data.selectedTemplate
  }
  
  // 更新用戶使用量（生成新圖片後數量+1）
  userUsage.value += 1
  console.log('📊 生成新圖片後，更新用戶使用量:', userUsage.value)
  
  // 強制觸發響應式更新
  nextTick(() => {
    console.log('📊 nextTick後的用戶使用量:', userUsage.value)
  })
  
  // 生成完成後，也從服務器刷新一次以確保數據準確
  setTimeout(async () => {
    await refreshUserUsage()
  }, 1000)
  
  // 生成完成後導航到結果頁面
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

// 處理顯示歷史頁面
function handleShowHistory() {
  console.log('顯示歷史頁面')
  console.log('🔍 App.vue - 當前userId:', userId.value)
  console.log('🔍 App.vue - 當前currentStep:', currentStep.value)
  console.log('🔍 App.vue - 當前taskId:', taskId.value)
  
  // 確保userId有值
  if (!userId.value) {
    userId.value = 'abc'
    console.log('🔧 App.vue - 重新設置userId為:', userId.value)
  }
  
  // 跳轉到結果頁面，然後顯示歷史
  currentStep.value = 'result'
  // 設置一個標記，讓結果頁面知道要顯示歷史
  // 我們可以通過修改selectedTemplate來傳遞這個信息
  selectedTemplate.value = 'show_history'
  console.log('🔍 App.vue - 設置後currentStep:', currentStep.value)
  console.log('🔍 App.vue - 設置後selectedTemplate:', selectedTemplate.value)
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
