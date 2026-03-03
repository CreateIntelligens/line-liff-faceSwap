<template>
  <!-- iphone15 -->
  <div class="app">
    <!-- Email 表單頁面（Email 模式專用） -->
    <EmailForm
      v-if="currentStep === 'email-form'"
      @submit="handleEmailSubmit"
    />

    <!-- Face Swap Homepage -->
    <FaceSwapHomepage
      v-if="currentStep === 'faceswap-home'"
      @enter-face-swap="enterFaceSwap"
    />

    <!-- Face Swap Upload -->
    <FaceSwapUpload
      v-if="currentStep === 'upload'"
      :userUsage="userUsage"
      :userId="userId"
      :userName="userName"
      :isFriend="isFriend"
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
      :userUsage="userUsage"
      :startWithHistory="startWithHistory"
      @back="goBack"
      @regenerate="handleRegenerate"
      @download="handleDownload"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeMount, onBeforeUnmount, nextTick } from 'vue'
import FaceSwapHomepage from './components/FaceSwapHomepage.vue'
import FaceSwapUpload from './components/FaceSwapUpload.vue'
import FaceSwapResult from './components/FaceSwapResult.vue'
import EmailForm from './components/EmailForm.vue'
import { roadshowService } from '../services/roadshowService.js'
import { liffService } from '../services/liffService.js'
import { modeService } from '../services/modeService.js'
import { API_CONFIG } from '../config/config.js'
import { pushPageView } from '../utils/gtmService.js'

// 狀態
const taskId = ref('')
const userId = ref('') // 改為空字串，等待 LIFF 初始化
const userName = ref('') // 用戶名稱
const currentStep = ref('faceswap-home') // 初始狀態設定為換臉首頁
const isInitialized = ref(false)
const userUsage = ref(0) // 用戶已生成的圖片數量
const isLiffInitialized = ref(false)
const isLiffInitializing = ref(false) // LIFF 初始化中狀態
const isFriend = ref(false) // 好友狀態，默認為 false，等待 LIFF 初始化後確認
const startWithHistory = ref(false) // 是否在結果頁直接顯示歷史紀錄
const isWaitingForFriend = ref(false) // 是否正在等待用戶加入好友
const friendCheckInterval = ref(null) // 好友狀態檢查定時器的引用
const currentMode = ref(null) // 當前模式：'liff' 或 'email'

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
  
  // 如果已經是 dev_user_ 開頭，直接返回（後端支援這個格式）
  if (userIdValue.startsWith('dev_user_')) {
    return userIdValue
  }
  
  // 在本地開發環境中，如果不是 dev_user_ 開頭，才加上前綴
  // 這樣可以方便在本地測試時繞過前端限制檢查，並讓後端識別測試用戶
  if (isLocalDev && !userIdValue.startsWith('dev_user_')) {
    const prefixedUserId = `dev_user_${userIdValue}`
    console.log('🔧 開發模式：為 userId 添加 dev_user_ 前綴（僅用於前端檢查）')
    console.log(`   原始: ${userIdValue}`)
    console.log(`   加上前綴: ${prefixedUserId}`)
    return prefixedUserId
  }
  
  return userIdValue
}

// LIFF 初始化函數
async function initializeLiff() {
  try {
    isLiffInitializing.value = true
    console.log('🔧 開始初始化 LIFF...')
    
    // 使用完整的 LIFF 初始化流程
    const result = await liffService.initializeLiff()
    
    if (result.success) {
      if (result.isLoggedIn && result.userId) {
        // 用戶已登入，設置用戶 ID
        // 在本地開發環境中會自動加上 dev_user_ 前綴
        userId.value = addDevPrefixIfNeeded(result.userId)
        // 確保好友狀態從結果中正確獲取，如果結果中沒有明確設置，則根據實際情況判斷
        console.log('🔍 result 完整物件:', result)
        console.log('🔍 result.isFriend 原始值:', result.isFriend)
        console.log('🔍 result.isFriend 類型:', typeof result.isFriend)
        
        // 改進好友狀態處理邏輯：
        // - 如果明確為 true，設置為 true
        // - 如果明確為 false，設置為 false
        // - 如果是 undefined（檢查結果不確定），不立即設置為 false，等待後續檢查
        if (result.isFriend === true) {
          isFriend.value = true
          console.log('✅ LIFF 用戶 ID 已設置:', userId.value)
          console.log('👥 好友狀態: 是好友（初始化時確認）')
        } else if (result.isFriend === false) {
          isFriend.value = false
          console.log('✅ LIFF 用戶 ID 已設置:', userId.value)
          console.log('👥 好友狀態: 非好友（初始化時確認）')
        } else {
          // result.isFriend === undefined，檢查結果不確定
          // 不立即設置 isFriend.value，保持為初始值（false），等待後續檢查
          console.log('✅ LIFF 用戶 ID 已設置:', userId.value)
          console.log('👥 好友狀態: 檢查結果不確定，等待後續檢查')
          console.log('🔍 isFriend.value 保持為:', isFriend.value)
        }
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
        // 用戶未登入時，無法檢查好友狀態，設置為 false
        isFriend.value = false
        console.log('👥 好友狀態: 未登入，無法檢查')
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
      // LIFF 初始化失敗時，無法檢查好友狀態，設置為 false
      isFriend.value = false
      console.log('👥 好友狀態: LIFF 初始化失敗，無法檢查')
    }
    
    isLiffInitialized.value = true
    isLiffInitializing.value = false
    console.log('🔧 LIFF 初始化完成，userId:', userId.value, 'userName:', userName.value)
    
    // 初始化完成後，根據好友狀態決定是否需要檢查
    if (isLiffInitialized.value && userId.value) {
      // 如果初始化時好友狀態不確定（undefined），才調用 checkAndHandleFriendStatus()
      // 如果初始化時已確認是好友（true），跳過檢查
      // 如果初始化時已確認非好友（false），也需要檢查（可能是快取延遲）
      if (isFriend.value === undefined || isFriend.value === false) {
        console.log('🔄 初始化時好友狀態不確定或為非好友，執行後續檢查')
        await checkAndHandleFriendStatus()
      } else {
        console.log('✅ 初始化時已確認是好友，跳過後續檢查')
      }
    }
  } catch (error) {
    console.error('❌ LIFF 初始化過程發生錯誤:', error)
    isLiffInitializing.value = false
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
    // 發生錯誤時，無法檢查好友狀態，設置為 false
    isFriend.value = false
    console.log('👥 好友狀態: 初始化錯誤，無法檢查')
    isLiffInitialized.value = true
    isLiffInitializing.value = false
  }
}

// 主要初始化函數
async function initializeApp() {
  console.log('=== 換臉應用程序初始化開始 ===')

  try {
    // 重置所有狀態，確保重整後是乾淨的狀態
    currentStep.value = 'faceswap-home'
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
    // ⚠️ 臨時方案：Email 模式使用 localStorage 追蹤每個 email 的使用量
    // 由於後端目前只接受 dev_user_ 格式，無法區分不同 email，所以在前端追蹤
    // TODO: 當後端 API 支援 email 作為 userId 後，可以改為從後端獲取使用量，移除此 localStorage 邏輯
    if (currentMode.value === 'email' && userId.value && userId.value.includes('@')) {
      const storageKey = `email_usage_${userId.value}`;
      const storedUsage = localStorage.getItem(storageKey);
      const usageCount = storedUsage ? parseInt(storedUsage, 10) : 0;
      userUsage.value = usageCount;
      console.log('📧 Email 模式：從 localStorage 讀取使用量:', usageCount);
      return usageCount;
    }
    
    // LIFF 模式：從後端獲取使用量
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

// ⚠️ 臨時方案：Email 模式增加使用量（在生成成功後調用）
// 由於後端目前只接受 dev_user_ 格式，無法區分不同 email，所以在前端追蹤
// TODO: 當後端 API 支援 email 作為 userId 後，可以移除此函數，改為從後端獲取使用量
function incrementEmailUsage() {
  if (currentMode.value === 'email' && userId.value && userId.value.includes('@')) {
    const storageKey = `email_usage_${userId.value}`;
    const currentUsage = userUsage.value || 0;
    const newUsage = currentUsage + 1;
    localStorage.setItem(storageKey, newUsage.toString());
    userUsage.value = newUsage;
    console.log('📧 Email 模式：使用量已增加:', newUsage);
  }
}

// 使用序列重試機制檢查好友狀態
async function checkFriendshipWithRetry(retries = 5, delay = 300) {
  // 檢查是否在 LIFF 環境中
  const isLocalhost = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname === '0.0.0.0'
  const isLiffEnabled = window.endpoint?.enableLiff && !isLocalhost
  
  if (!isLiffEnabled || !isLiffInitialized.value || typeof liff === 'undefined') {
    console.warn('⚠️ LIFF 環境不可用，無法檢查好友狀態')
    return undefined
  }

  if (!liff.isLoggedIn()) {
    console.warn('⚠️ 用戶未登入，無法檢查好友狀態')
    return undefined
  }

  let hasError = false

  for (let i = 0; i < retries; i++) {
    try {
      const friendship = await liff.getFriendship()
      console.log(`🔍 好友狀態檢查 (${i + 1}/${retries}):`, friendship?.friendFlag)
      
      // 如果檢查到是好友，立即返回 true
      if (friendship && friendship.friendFlag === true) {
        console.log(`✅ 在第 ${i + 1} 次檢查時確認是好友`)
        return true
      }
      
      // 如果檢查到明確為 false，記錄但繼續重試（可能是快取延遲）
      if (friendship && friendship.friendFlag === false) {
        console.log(`⚠️ 第 ${i + 1} 次檢查返回 false，繼續重試...`)
      }
    } catch (error) {
      console.error(`❌ 第 ${i + 1} 次好友狀態檢查失敗:`, error)
      hasError = true
      // 發生錯誤時繼續重試，不中斷
    }
    
    // 如果不是最後一次嘗試，等待一段時間再重試
    if (i < retries - 1) {
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  // 所有嘗試都完成
  if (hasError) {
    // 如果過程中發生錯誤，返回 undefined 表示檢查結果不確定
    console.warn('⚠️ 好友狀態檢查過程中發生錯誤，結果不確定')
    return undefined
  }

  // 所有檢查都返回 false，明確為非好友
  console.log('❌ 所有檢查都返回 false，確認非好友狀態')
  return false
}

// 檢查好友狀態並處理（進入網址時立即檢查）
async function checkAndHandleFriendStatus() {
  console.log('🔍 進入網址時立即檢查好友狀態...')
  
  // 如果初始化時已經檢查過是好友，跳過重複檢查
  if (isFriend.value === true) {
    console.log('✅ 初始化時已確認是好友，跳過重複檢查')
    return
  }
  
  // 檢查是否在 LIFF 環境中
  const isLocalhost = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname === '0.0.0.0'
  const isLiffEnabled = window.endpoint?.enableLiff && !isLocalhost
  
  if (!isLiffEnabled || !isLiffInitialized.value || typeof liff === 'undefined') {
    console.log('⚠️ LIFF 環境不可用，跳過好友狀態檢查')
    return
  }
  
  try {
    if (!liff.isLoggedIn()) {
      console.log('⚠️ 用戶未登入，跳過好友狀態檢查')
      return
    }
    
    // 防重複導向機制：檢查是否在短時間內已經導向過
    // 但只有在明確檢查到非好友狀態時才設置冷卻時間
    const lastRedirectTime = sessionStorage.getItem('lastFriendRedirectTime')
    const now = Date.now()
    const REDIRECT_COOLDOWN = 5000 // 5 秒冷卻時間
    
    if (lastRedirectTime) {
      const timeSinceLastRedirect = now - parseInt(lastRedirectTime, 10)
      if (timeSinceLastRedirect < REDIRECT_COOLDOWN) {
        console.log(`⏳ 距離上次導向僅 ${Math.round(timeSinceLastRedirect / 1000)} 秒，跳過導向（冷卻時間：${REDIRECT_COOLDOWN / 1000} 秒）`)
        return
      }
    }
    
    // 使用序列重試機制檢查好友狀態
    console.log('🔍 開始使用序列重試機制檢查好友狀態...')
    const currentFriendStatus = await checkFriendshipWithRetry(5, 300)
    
    console.log('🔍 進入網址時檢查結果:', currentFriendStatus)
    
    // 根據檢查結果處理
    if (currentFriendStatus === true) {
      // 檢查到是好友
      console.log('✅ 用戶是好友，可以正常使用')
      isFriend.value = true
      // 清除導向時間記錄（因為已經是好友了）
      sessionStorage.removeItem('lastFriendRedirectTime')
    } else if (currentFriendStatus === false) {
      // 明確檢查到非好友狀態
      console.log('❌ 檢測到非好友狀態，立即導向官方帳號')
      isFriend.value = false
      // 記錄導向時間（只有在明確非好友時才設置）
      sessionStorage.setItem('lastFriendRedirectTime', now.toString())
      openOfficialAccount()
      alert('請先加入官方帳號為好友，才能使用此功能。')
    } else {
      // currentFriendStatus === undefined，檢查結果不確定
      console.warn('⚠️ 好友狀態檢查結果不確定，可能是網路問題或 API 快取延遲，不設置冷卻時間')
      // 不更新 isFriend.value，保持當前狀態
      // 不設置冷卻時間，允許立即重新檢查
      // 不導向官方帳號，避免誤判
    }
  } catch (error) {
    console.error('❌ 檢查好友狀態時發生錯誤:', error)
    // 發生錯誤時不設置冷卻時間，允許重新檢查
  }
}

// 打開官方帳號連結
function openOfficialAccount() {
  const basicId = window.endpoint?.basicId || '@299fvzdf'
  
  // 檢查是否在 LINE App 內
  const isInClient = typeof liff !== 'undefined' && liff.isInClient()
  
  let accountUrl
  if (isInClient) {
    // 在 LINE App 內使用深度連結
    accountUrl = `line://ti/p/${basicId}`
  } else {
    // 在瀏覽器中使用網頁版連結
    accountUrl = `https://line.me/R/ti/p/${basicId}`
  }
  
  console.log('🔗 打開官方帳號連結:', accountUrl)
  console.log('📱 環境:', isInClient ? 'LINE App 內' : '瀏覽器')
  
  try {
    if (isInClient && typeof liff !== 'undefined' && liff.openWindow) {
      // 在 LINE App 內使用 liff.openWindow
      liff.openWindow({ url: accountUrl, external: true })
    } else {
      // 在瀏覽器中使用 window.open
      window.open(accountUrl, '_blank')
    }
  } catch (error) {
    console.error('❌ 打開官方帳號連結失敗:', error)
    // 降級處理：直接使用 window.open
    window.open(accountUrl, '_blank')
  }
}

// 定期檢查好友狀態，直到加入好友或超時
async function checkFriendStatusWithPolling(timeout = 30000, interval = 2000) {
  return new Promise((resolve) => {
    const startTime = Date.now()
    let checkInterval = null
    let isResolved = false
    
    const cleanup = () => {
      if (checkInterval) {
        clearInterval(checkInterval)
        checkInterval = null
        friendCheckInterval.value = null
      }
    }
    
    const checkStatus = async () => {
      // 檢查是否超時
      if (Date.now() - startTime >= timeout) {
        cleanup()
        if (!isResolved) {
          isResolved = true
          console.log('⏰ 檢查好友狀態超時')
          resolve(false)
        }
        return
      }
      
      // 檢查是否在 LIFF 環境中
      const isLocalhost = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1' ||
                         window.location.hostname === '0.0.0.0'
      const isLiffEnabled = window.endpoint?.enableLiff && !isLocalhost
      
      if (!isLiffEnabled || !isLiffInitialized.value || typeof liff === 'undefined') {
        console.log('⚠️ LIFF 環境不可用，停止檢查')
        cleanup()
        if (!isResolved) {
          isResolved = true
          resolve(false)
        }
        return
      }
      
      try {
        if (!liff.isLoggedIn()) {
          console.log('⚠️ 用戶未登入，停止檢查')
          cleanup()
          if (!isResolved) {
            isResolved = true
            resolve(false)
          }
          return
        }
        
        // 檢查好友狀態
        const friendship = await liff.getFriendship()
        console.log('🔍 檢查好友狀態:', friendship?.friendFlag)
        
        if (friendship && friendship.friendFlag === true) {
          console.log('✅ 檢測到已加入好友！')
          cleanup()
          // 更新好友狀態
          isFriend.value = true
          isWaitingForFriend.value = false
          if (!isResolved) {
            isResolved = true
            resolve(true)
          }
        }
      } catch (error) {
        console.error('❌ 檢查好友狀態時發生錯誤:', error)
        // 發生錯誤時繼續檢查，不中斷
      }
    }
    
    // 立即執行第一次檢查
    checkStatus()
    
    // 設置定期檢查
    checkInterval = setInterval(checkStatus, interval)
    friendCheckInterval.value = checkInterval
    
    console.log(`🔄 開始定期檢查好友狀態（每 ${interval / 1000} 秒檢查一次，超時時間：${timeout / 1000} 秒）`)
  })
}

// 當頁面重新可見時檢查好友狀態
async function checkFriendStatusOnReturn() {
  if (!isWaitingForFriend.value) {
    return // 如果不在等待好友狀態，直接返回
  }
  
  console.log('👁️ 頁面重新可見，檢查好友狀態...')
  
  // 檢查是否在 LIFF 環境中
  const isLocalhost = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname === '0.0.0.0'
  const isLiffEnabled = window.endpoint?.enableLiff && !isLocalhost
  
  if (!isLiffEnabled || !isLiffInitialized.value || typeof liff === 'undefined') {
    console.log('⚠️ LIFF 環境不可用，無法檢查')
    return
  }
  
  try {
    if (!liff.isLoggedIn()) {
      console.log('⚠️ 用戶未登入，無法檢查')
      return
    }
    
    // 強制重新檢查好友狀態
    const checks = []
    for (let i = 0; i < 3; i++) {
      checks.push(liff.getFriendship())
    }
    const results = await Promise.all(checks)
    
    // 檢查所有結果是否都為 true
    const allTrue = results.every(r => r && r.friendFlag === true)
    const hasFalse = results.some(r => !r || r.friendFlag !== true)
    const currentFriendStatus = !hasFalse && allTrue
    
    console.log('🔍 頁面可見性檢查結果:', currentFriendStatus)
    console.log('🔍 檢查結果詳情:', results.map((r, i) => `檢查${i+1}: ${r?.friendFlag}`))
    
    if (currentFriendStatus) {
      console.log('✅ 檢測到已加入好友！自動進入上傳頁面')
      
      // 更新好友狀態
      isFriend.value = true
      isWaitingForFriend.value = false
      
      // 停止定期檢查
      if (friendCheckInterval.value) {
        clearInterval(friendCheckInterval.value)
        friendCheckInterval.value = null
      }
      
      // 刷新使用量
      if (userId.value) {
        try {
          await refreshUserUsage()
          console.log('✅ 進入上傳頁面，使用量已刷新:', userUsage.value)
        } catch (error) {
          console.error('❌ 刷新使用量失敗:', error)
        }
      }
      
      // 進入上傳頁面
      currentStep.value = 'upload'
    }
  } catch (error) {
    console.error('❌ 檢查好友狀態時發生錯誤:', error)
  }
}

// 模式初始化函數
function initializeMode() {
  console.log('🔧 開始初始化模式服務...')
  const result = modeService.initialize()
  if (result.success) {
    currentMode.value = result.mode
    console.log('✅ 模式服務初始化完成，當前模式:', currentMode.value)
    
    // Email 模式：不需要 LIFF 初始化，但保持首頁狀態
    if (currentMode.value === 'email') {
      console.log('📧 Email 模式：從首頁開始')
      return true // 返回 true 表示不需要繼續 LIFF 初始化
    }
    
    // LIFF 模式：繼續原有流程
    console.log('📱 LIFF 模式：繼續原有流程')
    return false // 返回 false 表示需要繼續 LIFF 初始化
  }
  return false
}

// 在掛載前執行初始化
onBeforeMount(async () => {
  // 先初始化模式服務
  const skipLiff = initializeMode()
  
  if (!skipLiff) {
    // LIFF 模式：初始化 LIFF
    await initializeLiff()
  } else {
    // Email 模式：不需要 LIFF 初始化，但需要設置 userId（從 sessionStorage 讀取或等待表單提交）
    const savedEmail = sessionStorage.getItem('faceswap_email')
    if (savedEmail) {
      userId.value = savedEmail
      console.log('📧 從 sessionStorage 讀取 email:', savedEmail)
      // 如果有保存的 email，查詢使用量
      await refreshUserUsage()
    }
  }
  
  // 初始化應用程序（Email 模式時會跳過，因為 currentStep 已經是 'email-form'）
  if (currentStep.value !== 'email-form') {
    await initializeApp()
  }
})

// 組件掛載後的額外處理
onMounted(async () => {
  console.log('Vue 組件已掛載，應用當前狀態:', {
    currentStep: currentStep.value,
    userId: userId.value,
    taskId: taskId.value,
    userUsage: userUsage.value
  })
  
  // 推送頁面瀏覽事件
  const pagePath = window.location.pathname || '/'
  pushPageView({
    pagePath: pagePath,
    userMode: currentMode.value
  })
  
  // 組件掛載後，再次刷新用戶使用量以確保數據準確
  if (userId.value && isInitialized.value) {
    await refreshUserUsage()
  }
  
  // 添加頁面可見性監聽器
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible' && isWaitingForFriend.value) {
      console.log('👁️ 頁面從隱藏變為可見，檢查好友狀態')
      // 延遲一點時間再檢查，確保 LIFF 環境已準備好
      setTimeout(() => {
        checkFriendStatusOnReturn()
      }, 500)
    }
  }
  
  document.addEventListener('visibilitychange', handleVisibilityChange)
  
  // 保存清理函數以便在卸載時使用
  window._cleanupVisibilityListener = () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }
})

// 組件卸載前的清理
onBeforeUnmount(() => {
  // 清理頁面可見性監聽器
  if (window._cleanupVisibilityListener) {
    window._cleanupVisibilityListener()
    delete window._cleanupVisibilityListener
  }
  
  // 清理好友狀態檢查定時器
  if (friendCheckInterval.value) {
    clearInterval(friendCheckInterval.value)
    friendCheckInterval.value = null
  }
  
  // 重置等待狀態
  isWaitingForFriend.value = false
})

// 進入臉部交換工具
async function enterFaceSwap() {
  console.log('🔍 enterFaceSwap 被調用')
  
  // Email 模式：直接進入表單頁面
  if (currentMode.value === 'email') {
    console.log('📧 Email 模式：進入表單頁面')
    currentStep.value = 'email-form'
    return
  }
  
  // LIFF 模式：繼續原有流程（檢查好友狀態等）
  console.log('🔍 當前 isFriend.value:', isFriend.value)
  console.log('🔍 isFriend.value === false:', isFriend.value === false)
  console.log('🔍 typeof isFriend.value:', typeof isFriend.value)
  
  // 如果 LIFF 還在初始化中，等待初始化完成
  if (isLiffInitializing.value) {
    console.log('⏳ LIFF 正在初始化中，等待初始化完成...')
    // 輪詢等待初始化完成，最多等待 10 秒
    const maxWaitTime = 10000 // 10 秒
    const checkInterval = 100 // 每 100ms 檢查一次
    const startTime = Date.now()
    
    while (isLiffInitializing.value && (Date.now() - startTime) < maxWaitTime) {
      await new Promise(resolve => setTimeout(resolve, checkInterval))
    }
    
    if (isLiffInitializing.value) {
      console.warn('⚠️ 等待初始化超時，繼續執行')
    } else {
      console.log('✅ LIFF 初始化已完成，繼續執行')
    }
  }
  
  // 強制重新檢查好友狀態（不依賴快取）
  // 只在 LIFF 已啟用且已初始化的情況下才重新檢查
  let currentFriendStatus = isFriend.value // 先使用當前值作為初始值
  const isLocalhost = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname === '0.0.0.0'
  const isLiffEnabled = window.endpoint?.enableLiff && !isLocalhost
  
  if (isLiffEnabled && isLiffInitialized.value && typeof liff !== 'undefined') {
    try {
      // 檢查是否已登入（需要先初始化 LIFF）
      if (!liff.isLoggedIn()) {
        console.log('🔍 用戶未登入，使用之前的好友狀態')
        currentFriendStatus = isFriend.value
      } else {
        console.log('🔍 強制重新檢查好友狀態...')
        // 多次檢查以確保準確性（避免快取問題）
        const checks = []
        for (let i = 0; i < 3; i++) {
          checks.push(liff.getFriendship())
        }
        const results = await Promise.all(checks)
        console.log('🔍 多次檢查的結果:', results)
        console.log('🔍 每次檢查的 friendFlag:', results.map(r => r?.friendFlag))
        
        // 取最後一次檢查的結果（最可能反映最新狀態）
        const lastResult = results[results.length - 1]
        console.log('🔍 最後一次檢查的好友狀態物件:', lastResult)
        console.log('🔍 最後一次檢查的 friendFlag:', lastResult?.friendFlag)
        
        // 改進檢查邏輯：只要有一次檢查返回 true，就認為是好友（適應 API 快取延遲）
        const hasTrue = results.some(r => r && typeof r.friendFlag === 'boolean' && r.friendFlag === true)
        console.log('🔍 是否有任何檢查返回 true:', hasTrue)
        console.log('🔍 檢查結果詳情:', results.map((r, i) => `檢查${i+1}: friendFlag=${r?.friendFlag}, 類型=${typeof r?.friendFlag}`))
        
        currentFriendStatus = hasTrue
        // 更新 isFriend.value 以便後續使用（確保狀態同步）
        isFriend.value = currentFriendStatus
        console.log('🔍 檢查結果（只要有一次為 true 就通過）:', hasTrue)
        console.log('🔍 更新後的 isFriend.value:', isFriend.value)
        console.log('🔍 更新後的 currentFriendStatus:', currentFriendStatus)
        console.log('🔍 currentFriendStatus === false:', currentFriendStatus === false)
      }
    } catch (error) {
      console.error('❌ 重新檢查好友狀態失敗:', error)
      // 檢查失敗時，採用保守策略：一律視為非好友
      // 因為每次點擊都會重新檢查，如果真的是好友，下次檢查成功就可以進入
      currentFriendStatus = false
      isFriend.value = false
      console.log('⚠️ 檢查失敗，採用保守策略：視為非好友')
    }
  } else {
    // 如果 LIFF 未啟用或未初始化（本地開發環境），使用之前的值
    console.log('🔍 LIFF 未啟用或未初始化，使用之前的好友狀態')
    currentFriendStatus = isFriend.value
  }
  
  // 在進入上傳頁面之前檢查好友狀態（使用檢查後的值）
  // 重要：使用嚴格等於 false 來檢查，確保只有明確為 false 時才阻止
  console.log('🔍 最終檢查 currentFriendStatus:', currentFriendStatus)
  console.log('🔍 currentFriendStatus === false:', currentFriendStatus === false)
  console.log('🔍 !currentFriendStatus:', !currentFriendStatus)
  
  // 只有明確為 true 時才允許進入
  // 使用檢查後的最新狀態來判斷
  if (currentFriendStatus !== true) {
    console.log('❌ 檢測到非好友狀態，導向官方帳號並啟動檢查機制')
    console.log('❌ currentFriendStatus 值:', currentFriendStatus)
    console.log('❌ currentFriendStatus 類型:', typeof currentFriendStatus)
    // 確保 isFriend.value 也被更新為 false，避免下次點擊時使用錯誤的值
    isFriend.value = false
    
    // 根據 currentFriendStatus 顯示不同的處理方式
    if (currentFriendStatus === false) {
      // 明確檢查到非好友狀態，導向官方帳號
      console.log('🔗 打開官方帳號頁面...')
      
      // 設置等待好友狀態
      isWaitingForFriend.value = true
      
      // 打開官方帳號頁面
      openOfficialAccount()
      
      // 啟動定期檢查機制
      console.log('🔄 啟動好友狀態檢查機制（定期檢查 + 頁面可見性檢查）...')
      checkFriendStatusWithPolling(30000, 2000).then((isFriendNow) => {
        if (isFriendNow) {
          console.log('✅ 用戶已加入好友，自動進入上傳頁面')
          // 重置等待狀態
          isWaitingForFriend.value = false
          // 刷新使用量
          if (userId.value) {
            refreshUserUsage().then(() => {
              console.log('✅ 進入上傳頁面，使用量已刷新:', userUsage.value)
            }).catch((error) => {
              console.error('❌ 刷新使用量失敗:', error)
            })
          }
          // 進入上傳頁面
          currentStep.value = 'upload'
        } else {
          console.log('⏰ 檢查超時或失敗，顯示提示訊息')
          // 重置等待狀態
          isWaitingForFriend.value = false
          alert('請先加入官方帳號為好友，才能使用此功能。如果已加入好友，請重新點擊進入。')
        }
      }).catch((error) => {
        console.error('❌ 檢查好友狀態過程發生錯誤:', error)
        // 重置等待狀態
        isWaitingForFriend.value = false
        alert('無法檢查好友狀態，請稍後再試。如果已加入好友，請重新點擊進入。')
      })
    } else {
      // 檢查失敗的情況（可能是網路問題）
      alert('無法檢查好友狀態，請稍後再試。如果已加入好友，請重新點擊進入。')
    }
    return // 阻止進入上傳頁面
  }
  
  console.log('✅ 好友狀態檢查通過，允許進入上傳頁面')
  
  // 直接進入上傳頁面，刷新使用量以確保數據準確
  if (userId.value) {
    try {
      await refreshUserUsage()
      console.log('✅ 進入上傳頁面，使用量已刷新:', userUsage.value)
    } catch (error) {
      console.error('❌ 刷新使用量失敗:', error)
    }
  }
  currentStep.value = 'upload'
}

// 處理生成請求
async function handleGenerate(data) {
  // 保存任務ID
  taskId.value = data.taskId
  // 從上傳流程進入結果頁，不預設顯示歷史
  startWithHistory.value = false
  
  // Email 模式：增加本地使用量
  if (currentMode.value === 'email') {
    incrementEmailUsage()
  } else {
    // LIFF 模式：從服務器刷新使用量
    try {
      await refreshUserUsage()
      console.log('✅ 生成請求成功後，使用量已刷新:', userUsage.value)
    } catch (error) {
      console.error('❌ 刷新使用量失敗:', error)
      // 即使刷新失敗，也繼續導航到結果頁面
    }
  }
  
  // 生成完成後導航到結果頁面
  currentStep.value = 'result'
}

// 處理重新生成
function handleRegenerate() {
  // 返回到上傳步驟重新開始
  currentStep.value = 'upload'
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
  
  // 跳轉到結果頁面，並在結果頁直接顯示歷史紀錄
  startWithHistory.value = true
  currentStep.value = 'result'
}

// 處理 Email 表單提交
async function handleEmailSubmit(data) {
  console.log('📧 Email 表單已提交:', data)
  
  // 設置 userId 為 email
  userId.value = data.userId
  userName.value = data.userInfo.name || data.userId
  
  // 查詢用戶使用量
  try {
    await refreshUserUsage()
    console.log('✅ 用戶使用量已更新:', userUsage.value)
  } catch (error) {
    console.error('❌ 查詢用戶使用量失敗:', error)
  }
  
  // 進入上傳頁面
  currentStep.value = 'upload'
}

// 返回上一步
function goBack() {
  if (currentStep.value === 'upload') {
    // Email 模式：返回表單頁面；LIFF 模式：返回首頁
    if (currentMode.value === 'email') {
      currentStep.value = 'email-form'
    } else {
      currentStep.value = 'faceswap-home'
    }
  } else if (currentStep.value === 'result') {
    currentStep.value = 'upload'
  }
}

</script>

<style scoped>
.app {
  font-family: 'Inter', sans-serif;
  overflow-x: hidden;
  /* 統一使用白色背景，避免看到灰黑底色 */
  background-color: #ffffff;
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
