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
  }

  /**
   * 初始化 LIFF
   * @param {string} liffId - LIFF ID
   * @returns {Promise<boolean>} 初始化是否成功
   */
  async initialize(liffId = null) {
    try {
      // 檢查是否在 LIFF 環境中
      if (typeof liff === 'undefined') {
        console.log('⚠️ 不在 LIFF 環境中')
        return false
      }

      const targetLiffId = liffId || API_CONFIG.liff?.liffId
      if (!targetLiffId || targetLiffId === 'YOUR_LIFF_ID') {
        console.warn('⚠️ LIFF ID 未設置，請在配置中設置正確的 LIFF ID')
        return false
      }

      console.log('🔧 開始初始化 LIFF...', targetLiffId)
      await liff.init({ liffId: targetLiffId })
      
      this.isInitialized = true
      console.log('✅ LIFF 初始化成功')
      
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
        console.warn('⚠️ LIFF 尚未初始化')
        return null
      }

      if (!this.isLoggedIn()) {
        console.log('⚠️ 用戶未登入')
        return null
      }

      const profile = await liff.getProfile()
      this.userProfile = profile
      this.userId = profile.userId
      
      console.log('👤 用戶資料已獲取:', profile)
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
   */
  login(redirectUri = null) {
    if (!this.isInitialized || typeof liff === 'undefined') {
      console.warn('⚠️ LIFF 尚未初始化')
      return
    }

    if (redirectUri) {
      liff.login({ redirectUri })
    } else {
      liff.login()
    }
  }

  /**
   * 登出
   */
  logout() {
    if (!this.isInitialized || typeof liff === 'undefined') {
      console.warn('⚠️ LIFF 尚未初始化')
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
}

// 創建單例實例
export const liffService = new LiffService()
export default liffService
