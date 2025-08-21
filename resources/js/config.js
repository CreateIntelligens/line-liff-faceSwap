/**
 * API 配置文件 - 小專案版本
 * 集中管理API相關設定
 */

// API 基礎配置
export const API_CONFIG = {
    // 基礎URL - 從環境變數讀取，如果沒有則使用預設值
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://d7445102946d.ngrok-free.app/api',
    
    // 請求超時時間 (毫秒)
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
    
    // 預設請求頭
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    }
};

// API 端點定義
export const API_ENDPOINTS = {
    // 您的4隻API端點
    roadshow: '/roadshow',
    roadshow_status: (taskId) => `/roadshow/status/${taskId}`,
    roadshow_user_avatars: (userId) => `/roadshow/user/${userId}/avatars`,
    roadshow_templates: '/roadshow/templates',
    
    // 認證相關端點（如果需要）
    auth: {
        login: '/auth/login',
        logout: '/auth/logout'
    }
};

// HTTP 狀態碼常數
export const HTTP_STATUS = {
    // 成功狀態
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    
    // 客戶端錯誤
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    
    // 服務器錯誤
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
};

// 錯誤訊息對應
export const ERROR_MESSAGES = {
    [HTTP_STATUS.BAD_REQUEST]: '請求格式錯誤，請檢查輸入資料',
    [HTTP_STATUS.UNAUTHORIZED]: '請先登入或檢查認證資訊',
    [HTTP_STATUS.FORBIDDEN]: '權限不足，無法訪問此資源',
    [HTTP_STATUS.NOT_FOUND]: '請求的資源不存在',
    [HTTP_STATUS.INTERNAL_SERVER_ERROR]: '服務器內部錯誤，請稍後再試',
    [HTTP_STATUS.SERVICE_UNAVAILABLE]: '服務暫時不可用，請稍後再試',
    default: '發生未知錯誤，請稍後再試'
};
