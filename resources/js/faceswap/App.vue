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
      :userId="userId"
      @next-step="handleTemplateSelection"
      @back="goBack"
    />

    <!-- Face Swap Upload -->
    <FaceSwapUpload
      v-if="currentStep === 'upload'"
      :selectedTemplate="selectedTemplate"
      :userUsage="userUsage"
      :userId="userId"
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
import { liffService } from '../services/liffService.js'
import { API_CONFIG } from '../config/config.js'

// 狀態
const taskId = ref('')
const userId = ref('') // 改為空字串，等待 LIFF 初始化
const currentStep = ref('faceswap-home') // 初始狀態設定為換臉首頁
const selectedTemplate = ref('')
const isInitialized = ref(false)
const userUsage = ref(0) // 用戶已生成的圖片數量
const isLiffInitialized = ref(false)

// LIFF 初始化函數
async function initializeLiff() {
  try {
    console.log('🔧 開始初始化 LIFF...')
    
    // 使用完整的 LIFF 初始化流程
    const result = await liffService.initializeLiff()
    
    if (result.success) {
      if (result.isLoggedIn && result.userId) {
        // 用戶已登入，設置用戶 ID
        userId.value = result.userId
        console.log('✅ LIFF 用戶 ID 已設置:', userId.value)
        console.log('👥 好友狀態:', result.isFriend ? '是好友' : '非好友')
      } else if (!result.isLoggedIn) {
        // 用戶未登入，使用訪客 ID
        console.log('⚠️ 用戶未登入 LIFF，使用訪客模式')
        userId.value = 'guest_' + Date.now()
      }
    } else {
      // LIFF 初始化失敗，使用測試模式
      console.log('⚠️ LIFF 初始化失敗，使用測試模式')
      userId.value = 'abc'
    }
    
    isLiffInitialized.value = true
    console.log('🔧 LIFF 初始化完成，userId:', userId.value)
  } catch (error) {
    console.error('❌ LIFF 初始化過程發生錯誤:', error)
    // 錯誤時使用測試值
    userId.value = 'abc'
    isLiffInitialized.value = true
    console.log('🔧 使用後備 userId:', userId.value)
  }
}

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
    return avatars.length
  } catch (error) {
    console.error('❌ 刷新用戶使用量失敗:', error)
    return 0
  }
}

// 在掛載前執行初始化
onBeforeMount(async () => {
  await initializeLiff() // 先初始化 LIFF
  await initializeApp() // 再初始化應用程序
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
  // 保存任務ID和模板信息
  taskId.value = data.taskId
  // 保存選擇的模板ID（從data中獲取）
  if (data.selectedTemplate) {
    selectedTemplate.value = data.selectedTemplate
  }
  
  // 更新用戶使用量（生成新圖片後數量+1）
  userUsage.value += 1
  
  // 生成完成後，也從服務器刷新一次以確保數據準確
  setTimeout(async () => {
    await refreshUserUsage()
  }, 1000)
  
  // 生成完成後導航到結果頁面
  currentStep.value = 'result'
}

// 處理重新生成
function handleRegenerate() {
  // 返回到模板選擇步驟重新開始
  currentStep.value = 'template-selection'
}

// 處理下載到官方帳號
function handleDownload() {
  // 在這裡可以調用下載 API
}

// 處理顯示歷史頁面
async function handleShowHistory() {
  // 確保userId有值
  if (!userId.value) {
    await initializeLiff()
    if (!userId.value) {
      userId.value = 'abc'
    }
  }
  
  // 跳轉到結果頁面，然後顯示歷史
  currentStep.value = 'result'
  // 設置一個標記，讓結果頁面知道要顯示歷史
  // 我們可以通過修改selectedTemplate來傳遞這個信息
  selectedTemplate.value = 'show_history'
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
