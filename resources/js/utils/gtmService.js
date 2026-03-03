/**
 * Google Tag Manager (GTM) 服務
 * 提供統一的 GTM 事件推送功能
 */

/**
 * 確保 dataLayer 已初始化
 */
function ensureDataLayer() {
  if (typeof window === 'undefined') {
    return false;
  }
  
  if (!window.dataLayer) {
    window.dataLayer = [];
    if (window.endpoint?.debug) {
      console.log('🔧 GTM: 初始化 dataLayer');
    }
  }
  
  return true;
}

/**
 * 推送 GTM 事件
 * @param {string} eventName - 事件名稱
 * @param {Object} eventData - 事件數據（可選）
 */
export function pushEvent(eventName, eventData = {}) {
  try {
    if (!ensureDataLayer()) {
      console.warn('⚠️ GTM: window 物件不存在，無法推送事件');
      return;
    }
    
    const event = {
      event: eventName,
      ...eventData
    };
    
    window.dataLayer.push(event);
    
    if (window.endpoint?.debug) {
      console.log('📊 GTM 事件已推送:', event);
    }
  } catch (error) {
    // GTM 載入失敗時不影響應用正常運作
    console.warn('⚠️ GTM 事件推送失敗:', error);
  }
}

/**
 * 推送頁面瀏覽事件
 * @param {Object} options - 選項
 * @param {string} options.pagePath - 頁面路徑
 * @param {string} options.userMode - 用戶模式（'liff' 或 'email'）
 */
export function pushPageView({ pagePath = '/', userMode = null } = {}) {
  pushEvent('page_view', {
    page_path: pagePath,
    user_mode: userMode
  });
}

/**
 * 推送 CTA 按鈕點擊事件
 * @param {Object} options - 選項
 * @param {string} options.buttonText - 按鈕文字
 * @param {string} options.userMode - 用戶模式
 */
export function pushCTAClick({ buttonText = '開始抽籤', userMode = null } = {}) {
  pushEvent('cta_click', {
    button_text: buttonText,
    user_mode: userMode
  });
}

/**
 * 推送表單送出成功事件
 * @param {Object} options - 選項
 * @param {string} options.formType - 表單類型
 * @param {string} options.userMode - 用戶模式
 */
export function pushFormSubmitSuccess({ formType = 'email_registration', userMode = 'email' } = {}) {
  pushEvent('form_submit_success', {
    form_type: formType,
    user_mode: userMode
  });
}

/**
 * 推送圖片生成成功事件
 * @param {Object} options - 選項
 * @param {string} options.taskId - 任務 ID
 * @param {string} options.userMode - 用戶模式
 */
export function pushImageGenerationSuccess({ taskId = null, userMode = null } = {}) {
  pushEvent('image_generation_success', {
    task_id: taskId,
    user_mode: userMode
  });
}

export default {
  pushEvent,
  pushPageView,
  pushCTAClick,
  pushFormSubmitSuccess,
  pushImageGenerationSuccess
};
