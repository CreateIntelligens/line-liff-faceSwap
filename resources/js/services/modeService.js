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
   * 優先順序：
   * 1. URL 參數 mode=email（僅用於從 LIFF 版切換到 Email 版）
   * 2. 配置 window.endpoint.mode（'liff' | 'email' | 'auto'）
   * 3. 自動偵測（enableLiff + liff.isInClient）
   * 4. 預設 email
   * @returns {'liff' | 'email'} 模式
   */
  detectMode() {
    let mode = null

    // 1. URL 參數：目前僅支援 mode=email，用於在 LIFF 版中手動切換到 Email 版
    try {
      const urlParams = new URLSearchParams(window.location.search)
      const urlMode = urlParams.get('mode')
      if (urlMode === 'email') {
        console.log('📱 模式: email (URL 參數覆蓋)')
        mode = 'email'
      }
    } catch (e) {
      console.warn('⚠️ 解析 URL 參數失敗:', e)
    }

    // 2. 配置：若尚未被 URL 覆蓋，依照 endpoint.mode 決定預設模式
    if (!mode) {
      const configMode = window.endpoint?.mode
      if (configMode === 'liff') {
        console.log('📱 模式: liff (配置強制)')
        mode = 'liff'
      } else if (configMode === 'email') {
        console.log('📱 模式: email (配置強制)')
        mode = 'email'
      }
    }

    // 3. 自動偵測：僅在尚未決定 mode 時，依據 LIFF 環境判斷
    if (!mode) {
      const enableLiff = window.endpoint?.enableLiff
      if (enableLiff && typeof liff !== 'undefined') {
        try {
          // 檢查是否在 LINE 客戶端內
          if (liff.isInClient()) {
            console.log('📱 模式: liff (自動偵測 - LIFF 環境)')
            mode = 'liff'
          }
        } catch (error) {
          console.warn('⚠️ LIFF 檢查失敗:', error)
        }
      }
    }

    // 4. 預設為 email（一般瀏覽器）
    if (!mode) {
      console.log('📱 模式: email (自動偵測 - 一般瀏覽器)')
      mode = 'email'
    }

    return mode
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
