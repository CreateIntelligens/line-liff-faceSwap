/**
 * LIFF 服務模組
 * 處理 LINE LIFF 相關的操作
 */

import { API_CONFIG } from '../config/config.js'

class LiffService {
  constructor() {
    this.isInitialized = false
    this.userId = null
    this.userProfile = null
    this.liffId = null
    this.basicId = null
  }

  /**
   * 使用序列重試機制檢查好友狀態
   * @param {number} retries - 重試次數，預設為 5
   * @param {number} delay - 延遲時間（毫秒），預設為 300
   * @returns {Promise<boolean|undefined>} 好友狀態，true 為好友，false 為非好友，undefined 為檢查結果不確定
   */
  async getFriendshipWithRetry(retries = 5, delay = 300) {
    if (typeof liff === 'undefined' || !this.isInitialized) {
      console.warn('⚠️ LIFF 未初始化，無法檢查好友狀態')
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

  /**
   * 完整的 LIFF 初始化流程（包含登入驗證）
   * @param {Object} options - 配置選項
   * @param {string} options.userId - 用戶 ID 響應式變數
   * @returns {Promise<Object>} 初始化結果
   */
  async initializeLiff(options = {}) {
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname === '0.0.0.0'
    
    if (isLocalhost && window.endpoint?.enableLiff) {
      window.endpoint.enableLiff = false
    }
    
    if (!window.endpoint?.enableLiff || isLocalhost) {
      const testUserId = window.endpoint?.testUserId
      let userIdToUse
      
      if (testUserId && testUserId.trim() !== '') {
        userIdToUse = testUserId.trim()
      } else {
        userIdToUse = 'dev_user_' + Date.now()
      }
      
      // 設置用戶 ID
      this.userId = userIdToUse
      this.isInitialized = true
      
      if (options.userId) {
        options.userId.value = userIdToUse
      }
      
      return {
        success: true,
        isLoggedIn: true,
        isFriend: true,
        userId: userIdToUse,
        message: testUserId ? 'LIFF 功能已關閉，使用配置的測試用戶 ID' : 'LIFF 功能已關閉，使用模擬用戶（可能不被後端接受）'
      }
    }
    
    // 優先從 window.endpoint 獲取 LIFF ID 和 Basic ID
    let liffId = window.endpoint?.liffId
    let basicId = window.endpoint?.basicId
    
    // 備用方案：從全域變數獲取
    if (!liffId) liffId = window.LIFF_ID
    if (!basicId) basicId = window.LINE_BASIC_ID
    
    if (!liffId || !basicId) {
      try {
        const response = await fetch('/api/mbti/liff-id')
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const data = await response.json()
        if (data.status === 'success') {
          if (!liffId) {
            liffId = data.liff_id
          }
          if (!basicId) {
            basicId = data.basic_id
          }
        }
      } catch (error) {
        // 使用預設值
      }
    }
    
    if (!liffId) {
      liffId = API_CONFIG.liff?.liffId || '2006948092-pExnvWML'
    }

    // 保存到實例變數
    this.liffId = liffId
    this.basicId = basicId

    try {
      // 初始化 LIFF
      await liff.init({ liffId })
      
      if (!liff.isLoggedIn()) {
        const isInClient = liff.isInClient()
        const redirectUrl = window.location.origin + window.location.pathname
        
        if (isInClient) {
          // 在 LINE App 內使用 bot_prompt: "aggressive"
          // 若未加好友，登入後會跳出確認視窗詢問是否加好友
          liff.login({ 
            redirectUri: redirectUrl,
            bot_prompt: "aggressive"
          })
      return {
        success: false,
        isLoggedIn: false,
        isFriend: false,
        message: '用戶未登入，已重定向至登入頁面（含加好友提示）'
      }
        } else {
          // 在瀏覽器中也使用 bot_prompt
          liff.login({ 
            redirectUri: redirectUrl,
            bot_prompt: "aggressive"
          })
          
          return {
            success: false,
            isLoggedIn: false,
            isFriend: false,
            userId: null,
            message: '在瀏覽器中嘗試 LINE 登入，已跳轉到登入頁面（含加好友提示）'
          }
        }
      }
      
      // 獲取用戶 ID
      const context = liff.getContext()
      const decodedToken = liff.getDecodedIDToken()
      window.uid = context.userId || decodedToken.sub
      
      if (options.userId) {
        options.userId.value = window.uid
      }
      
      this.userId = window.uid
      this.isInitialized = true
      
      // 使用序列重試機制檢查好友狀態
      console.log('🔍 開始使用序列重試機制檢查好友狀態...')
      const friendStatus = await this.getFriendshipWithRetry(5, 300)
      
      if (friendStatus === true) {
        console.log('✅ 用戶是好友')
        return {
          success: true,
          isLoggedIn: true,
          isFriend: true,
          userId: this.userId,
          message: 'LIFF 初始化成功'
        }
      } else if (friendStatus === false) {
        console.log('❌ 用戶未加入好友或已封鎖')
        return {
          success: true,
          isLoggedIn: true,
          isFriend: false,
          userId: this.userId,
          message: '用戶已登入但未加入好友'
        }
      } else {
        // friendStatus === undefined，檢查結果不確定
        console.warn('⚠️ 好友狀態檢查結果不確定，可能是網路問題或 API 快取延遲')
        return {
          success: true,
          isLoggedIn: true,
          isFriend: undefined,
          userId: this.userId,
          message: '用戶已登入，但好友狀態檢查結果不確定'
        }
      }
      
    } catch (error) {
      console.error('❌ LIFF 初始化失敗:', error)
      return {
        success: false,
        isLoggedIn: false,
        isFriend: false,
        error: error.message,
        message: 'LIFF 初始化失敗'
      }
    }
  }

  /**
   * 初始化 LIFF（原有方法，保持向後兼容）
   * @param {string} liffId - LIFF ID
   * @returns {Promise<boolean>} 初始化是否成功
   */
  async initialize(liffId = null) {
    try {
      if (typeof liff === 'undefined') {
        return false
      }

      const targetLiffId = liffId || this.liffId || API_CONFIG.liff?.liffId
      if (!targetLiffId || targetLiffId === 'YOUR_LIFF_ID') {
        return false
      }

      await liff.init({ liffId: targetLiffId })
      
      this.isInitialized = true
      
      return true
    } catch (error) {
      console.error('❌ LIFF 初始化失敗:', error)
      return false
    }
  }

  /**
   * 檢查用戶是否已登入
   * @returns {boolean} 是否已登入
   */
  isLoggedIn() {
    if (!this.isInitialized || typeof liff === 'undefined') {
      return false
    }
    return liff.isLoggedIn()
  }

  /**
   * 獲取用戶資料
   * @returns {Promise<Object|null>} 用戶資料或 null
   */
  async getUserProfile() {
    try {
      if (!this.isInitialized) {
        return null
      }

      if (!this.isLoggedIn()) {
        return null
      }

      const profile = await liff.getProfile()
      this.userProfile = profile
      this.userId = profile.userId
      
      return profile
    } catch (error) {
      console.error('❌ 獲取用戶資料失敗:', error)
      return null
    }
  }

  /**
   * 獲取用戶 ID
   * @returns {string|null} 用戶 ID 或 null
   */
  getUserId() {
    return this.userId
  }

  /**
   * 登入
   * @param {string} redirectUri - 登入後重定向的 URI
   * @param {string} bot_prompt - 加好友提示模式："normal" 或 "aggressive"
   */
  login(redirectUri = null, bot_prompt = "aggressive") {
    if (!this.isInitialized || typeof liff === 'undefined') {
      return
    }

    if (redirectUri) {
      liff.login({ 
        redirectUri,
        bot_prompt: bot_prompt
      })
    } else {
      liff.login({ 
        bot_prompt: bot_prompt
      })
    }
  }

  /**
   * 登出
   */
  logout() {
    if (!this.isInitialized || typeof liff === 'undefined') {
      return
    }

    liff.logout()
  }

  /**
   * 獲取 LIFF 環境資訊
   * @returns {Object} LIFF 環境資訊
   */
  getEnvironment() {
    if (!this.isInitialized || typeof liff === 'undefined') {
      return null
    }

    return {
      os: liff.getOS(),
      language: liff.getLanguage(),
      version: liff.getVersion(),
      lineVersion: liff.getLineVersion(),
      isInClient: liff.isInClient(),
      isLoggedIn: liff.isLoggedIn()
    }
  }

  /**
   * 檢查是否在 LINE 應用內
   * @returns {boolean} 是否在 LINE 應用內
   */
  isInClient() {
    if (!this.isInitialized || typeof liff === 'undefined') {
      return false
    }
    return liff.isInClient()
  }

  /**
   * 獲取當前 LIFF 狀態
   * @returns {Object} LIFF 狀態
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      isLoggedIn: this.isLoggedIn(),
      userId: this.userId,
      userProfile: this.userProfile,
      environment: this.getEnvironment()
    }
  }

  /**
   * 瀏覽器測試輔助功能
   * @returns {Object} 測試信息
   */
  getBrowserTestInfo() {
    const isInClient = this.isInClient()
    const isLiffAvailable = typeof liff !== 'undefined'
    
    return {
      isInClient,
      isLiffAvailable,
      isBrowser: !isInClient,
      testMode: !isInClient,
      recommendations: {
        browser: '🌐 瀏覽器測試模式：使用訪客 ID 進行功能測試',
        line: '📱 LINE 應用測試：可測試真實登入和用戶資料',
        development: '🔧 開發建議：在瀏覽器中開發，在 LINE 中測試'
      }
    }
  }

  /**
   * 模擬登入（僅用於瀏覽器測試）
   * @param {string} mockUserId - 模擬用戶 ID
   * @returns {Object} 模擬結果
   */
  mockLogin(mockUserId = null) {
    if (this.isInClient()) {
      return null
    }

    const userId = mockUserId || 'mock_user_' + Date.now()
    this.userId = userId
    this.isInitialized = true
    
    return {
      success: true,
      isLoggedIn: true,
      isFriend: true,
      userId: userId,
      message: '模擬登入成功（僅用於瀏覽器測試）'
    }
  }
}

// 創建單例實例
export const liffService = new LiffService()
export default liffService
