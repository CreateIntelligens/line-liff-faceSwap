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
      :userName="userName"
      @back="goBack"
      @generate="handleGenerate"
      @showHistory="handleShowHistory"
      @refreshUsage="refreshUserUsage"
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
const userName = ref('') // 用戶名稱
const currentStep = ref('faceswap-home') // 初始狀態設定為換臉首頁
const selectedTemplate = ref('')
const isInitialized = ref(false)
const userUsage = ref(0) // 用戶已生成的圖片數量
const isLiffInitialized = ref(false)

// 檢查是否為本地開發環境
function isLocalDevEnvironment() {
  if (typeof window === 'undefined') return false
  const hostname = window.location.hostname
  return hostname === 'localhost' || hostname === '127.0.0.1'
}

// 檢查是否為 LINE LIFF 真實用戶 ID（以 U 開頭）
function isLineUserId(userId) {
  return userId && userId.startsWith('U') && userId.length > 20
}

// 為 userId 添加開發模式前綴（如果適用）
function addDevPrefixIfNeeded(userIdValue) {
  if (!userIdValue) return userIdValue
  
  // 檢查是否為本地開發環境
  const isLocalDev = isLocalDevEnvironment()
  
  // 在本地開發環境中，無論是否為 LINE 用戶 ID，都加上前綴
  // 這樣可以方便在本地測試時繞過限制
  if (isLocalDev && !userIdValue.startsWith('dev_user_')) {
    const prefixedUserId = `dev_user_${userIdValue}`
    console.log('🔧 開發模式：為 userId 添加 dev_user_ 前綴')
    console.log(`   原始: ${userIdValue}`)
    console.log(`   加上前綴: ${prefixedUserId}`)
    return prefixedUserId
  }
  
  return userIdValue
}

// LIFF 初始化函數
async function initializeLiff() {
  try {
    console.log('🔧 開始初始化 LIFF...')
    
    // 使用完整的 LIFF 初始化流程
    const result = await liffService.initializeLiff()
    
    if (result.success) {
      if (result.isLoggedIn && result.userId) {
        // 用戶已登入，設置用戶 ID
        // 在本地開發環境中會自動加上 dev_user_ 前綴
        userId.value = addDevPrefixIfNeeded(result.userId)
        console.log('✅ LIFF 用戶 ID 已設置:', userId.value)
        console.log('👥 好友狀態:', result.isFriend ? '是好友' : '非好友')
        console.log('📋 如需在本地測試，請將此 userId 複製到 index.html 的 testUserId 配置中:')
        console.log(`   testUserId: '${result.userId}',`)
        
        // 嘗試獲取用戶名稱
        try {
          const profile = await liffService.getUserProfile()
          if (profile && profile.displayName) {
            userName.value = profile.displayName
            console.log('✅ 用戶名稱已獲取:', userName.value)
          } else {
            // 如果無法獲取，使用 userId 作為後備
            userName.value = userId.value
            console.log('⚠️ 無法獲取用戶名稱，使用 userId 作為後備:', userName.value)
          }
        } catch (profileError) {
          console.warn('⚠️ 獲取用戶資料失敗，使用 userId 作為後備:', profileError)
          userName.value = userId.value
        }
      } else if (!result.isLoggedIn) {
        // 用戶未登入，使用訪客 ID 或測試 ID
        const testUserId = window.endpoint?.testUserId
        if (testUserId && testUserId.trim() !== '') {
          console.log('⚠️ 用戶未登入 LIFF，使用配置的測試用戶 ID')
          userId.value = addDevPrefixIfNeeded(testUserId.trim())
        } else {
          console.log('⚠️ 用戶未登入 LIFF，使用訪客模式')
          userId.value = addDevPrefixIfNeeded('guest_' + Date.now())
        }
        userName.value = window.endpoint?.testUserName || userId.value
      }
    } else {
      // LIFF 初始化失敗，使用測試模式
      const testUserId = window.endpoint?.testUserId
      if (testUserId && testUserId.trim() !== '') {
        console.log('⚠️ LIFF 初始化失敗，使用配置的測試用戶 ID')
        userId.value = addDevPrefixIfNeeded(testUserId.trim())
        userName.value = window.endpoint?.testUserName || userId.value
      } else {
        console.log('⚠️ LIFF 初始化失敗，使用測試模式')
        userId.value = addDevPrefixIfNeeded('abc')
        userName.value = userId.value
      }
    }
    
    isLiffInitialized.value = true
    console.log('🔧 LIFF 初始化完成，userId:', userId.value, 'userName:', userName.value)
  } catch (error) {
    console.error('❌ LIFF 初始化過程發生錯誤:', error)
    // 錯誤時使用測試值或配置的測試 ID
    const testUserId = window.endpoint?.testUserId
    if (testUserId && testUserId.trim() !== '') {
      userId.value = addDevPrefixIfNeeded(testUserId.trim())
      userName.value = window.endpoint?.testUserName || userId.value
      console.log('🔧 使用配置的測試 userId:', userId.value, 'userName:', userName.value)
    } else {
      userId.value = addDevPrefixIfNeeded('abc')
      userName.value = userId.value
      console.log('🔧 使用後備 userId:', userId.value, 'userName:', userName.value)
    }
    isLiffInitialized.value = true
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
async function enterFaceSwap() {
  // 進入模板選擇頁面前，刷新使用量以確保數據準確
  if (userId.value) {
    try {
      await refreshUserUsage()
      console.log('✅ 進入模板選擇頁面，使用量已刷新:', userUsage.value)
    } catch (error) {
      console.error('❌ 刷新使用量失敗:', error)
    }
  }
  currentStep.value = 'template-selection'
}

// 處理模板選擇
function handleTemplateSelection(data) {
  selectedTemplate.value = data.selectedTemplate
  currentStep.value = 'upload'
}

// 處理生成請求
async function handleGenerate(data) {
  // 保存任務ID和模板信息
  taskId.value = data.taskId
  // 保存選擇的模板ID（從data中獲取）
  if (data.selectedTemplate) {
    selectedTemplate.value = data.selectedTemplate
  }
  
  // 在生成請求成功返回後立即從服務器刷新使用量
  // 確保顯示的數字與服務器數據一致
  try {
    await refreshUserUsage()
    console.log('✅ 生成請求成功後，使用量已刷新:', userUsage.value)
  } catch (error) {
    console.error('❌ 刷新使用量失敗:', error)
    // 即使刷新失敗，也繼續導航到結果頁面
  }
  
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
      userId.value = addDevPrefixIfNeeded('abc')
    }
  }
  
  // 跳轉到結果頁面，然後顯示歷史
  currentStep.value = 'result'
  // 設置一個標記，讓結果頁面知道要顯示歷史
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
