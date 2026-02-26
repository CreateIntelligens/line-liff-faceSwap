/**
 * 模式服務模組
 * 處理 LIFF 模式和 Email 模式的偵測和切換
 * 參考 deviceService.js 的架構
 */

class ModeService {
  constructor() {
    this.mode = null
    this.isInitialized = false
  }

  /**
   * 偵測當前模式
   * 優先順序：配置 > URL 參數 > 自動偵測
   * @returns {'liff' | 'email'} 模式
   */
  detectMode() {
    // 1. 檢查配置中是否強制指定模式
    const configMode = window.endpoint?.mode
    if (configMode === 'liff') {
      console.log('📱 模式: liff (配置強制)')
      return 'liff'
    }
    if (configMode === 'email') {
      console.log('📱 模式: email (配置強制)')
      return 'email'
    }

    // 2. 檢查 URL 參數
    const urlParams = new URLSearchParams(window.location.search)
    const urlMode = urlParams.get('mode')
    if (urlMode === 'liff') {
      console.log('📱 模式: liff (URL 參數)')
      return 'liff'
    }
    if (urlMode === 'email') {
      console.log('📱 模式: email (URL 參數)')
      return 'email'
    }

    // 3. 自動偵測：檢查是否在 LIFF 環境
    const enableLiff = window.endpoint?.enableLiff
    if (enableLiff && typeof liff !== 'undefined') {
      try {
        // 檢查是否在 LINE 客戶端內
        if (liff.isInClient()) {
          console.log('📱 模式: liff (自動偵測 - LIFF 環境)')
          return 'liff'
        }
      } catch (error) {
        console.warn('⚠️ LIFF 檢查失敗:', error)
      }
    }

    // 4. 其他所有情況使用 email 模式
    console.log('📱 模式: email (自動偵測 - 一般瀏覽器)')
    return 'email'
  }

  /**
   * 初始化模式服務
   * @param {Object} options - 配置選項
   * @returns {Object} 初始化結果
   */
  initialize(options = {}) {
    console.log('=== 模式服務初始化開始 ===')

    // 偵測模式
    this.mode = this.detectMode()

    this.isInitialized = true

    console.log('✅ 模式服務初始化完成')
    console.log('  - 模式:', this.mode)

    return {
      success: true,
      mode: this.mode,
      isLiff: this.mode === 'liff',
      isEmail: this.mode === 'email'
    }
  }

  /**
   * 獲取當前模式
   * @returns {'liff' | 'email' | null}
   */
  getMode() {
    return this.mode
  }

  /**
   * 檢查是否為 LIFF 模式
   * @returns {boolean}
   */
  isLiffMode() {
    return this.mode === 'liff'
  }

  /**
   * 檢查是否為 Email 模式
   * @returns {boolean}
   */
  isEmailMode() {
    return this.mode === 'email'
  }

  /**
   * 獲取模式狀態
   * @returns {Object}
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      mode: this.mode,
      isLiff: this.isLiffMode(),
      isEmail: this.isEmailMode()
    }
  }
}

// 創建單例實例
export const modeService = new ModeService()
export default modeService
