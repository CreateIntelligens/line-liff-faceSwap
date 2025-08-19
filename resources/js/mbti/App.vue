<template>
  <!-- iphone15 -->
  <div class="app">
    <!-- Face Swap Homepage -->
    <FaceSwapHomepage
      v-if="currentStep === 'faceswap-home'"
      @enter-face-swap="enterFaceSwap"
    />

    <!-- Upload Screen -->
    <UploadScreen 
      v-else-if="currentStep === 'upload'"
      :result="result.value"
      :task-id="taskId"
      @upload-processed="handleUploadProcessed"
      :error-message="uploadError"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeMount } from 'vue'
import UploadScreen from './components/UploadScreen.vue'
import FaceSwapHomepage from './components/FaceSwapHomepage.vue'

// 狀態
const result = ref('')
const taskId = ref('')
const currentStep = ref('faceswap-home') // 初始狀態設定為換臉首頁
const uploadError = ref('')
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
        const res = await fetch(`https://f2d8-60-248-142-124.ngrok-free.app/api/faceswap/user/${userId.value}/avatars`, {
          headers: {
            'ngrok-skip-browser-warning': 'true'
          }
        })
        const data = await res.json()
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
  currentStep.value = 'upload'
}

// 處理上傳完成
function handleUploadProcessed(uploadData) {
  console.log('接收到上傳數據:', uploadData)
  
  // 如果有task_id，記錄它
  if (uploadData && uploadData.task_id) {
    taskId.value = uploadData.task_id
    uploadError.value = ''
    
    // 可以根據需要跳轉到其他頁面
    console.log('上傳完成，taskId:', taskId.value)
  } else {
    // 處理錯誤情況
    uploadError.value = '上傳失敗，請稍後再試'
    currentStep.value = 'upload'
  }
}
</script>

<style scoped>
.app {
  font-family: 'Inter', sans-serif;
  overflow-x: hidden;
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
