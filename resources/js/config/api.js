/**
 * API 配置文件
 * 集中管理所有API相關設定
 */

// API 基礎配置
export const API_CONFIG = {
    // 基礎URL - 從環境變數讀取，如果沒有則使用預設值
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://jsonplaceholder.typicode.com',
    
    // 請求超時時間 (毫秒)
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
    
    // API版本
    version: import.meta.env.VITE_API_VERSION || 'v1',
    
    // 預設請求頭
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    }
};

// API 端點定義
export const API_ENDPOINTS = {
    // JSONPlaceholder API 端點 (練習用)
    posts: '/posts',
    postsById: (id) => `/posts/${id}`,
    comments: '/comments',
    users: '/users',
    userById: (id) => `/users/${id}`,
    
    // 認證相關端點
    auth: {
        login: '/auth/login',
        register: '/auth/register',
        logout: '/auth/logout',
        refresh: '/auth/refresh'
    },
    
    // 用戶相關端點
    user: {
        profile: '/user/profile',
        updateProfile: '/user/profile/update',
        changePassword: '/user/password/change'
    }
};

// HTTP 狀態碼常數
export const HTTP_STATUS = {
    // 成功狀態
    OK: 200,                    // 請求成功
    CREATED: 201,               // 資源創建成功
    ACCEPTED: 202,              // 請求已接受
    NO_CONTENT: 204,            // 請求成功但無內容
    
    // 客戶端錯誤
    BAD_REQUEST: 400,           // 請求格式錯誤
    UNAUTHORIZED: 401,          // 未授權
    FORBIDDEN: 403,             // 禁止訪問
    NOT_FOUND: 404,             // 資源未找到
    METHOD_NOT_ALLOWED: 405,    // 方法不允許
    CONFLICT: 409,              // 衝突
    UNPROCESSABLE_ENTITY: 422,  // 無法處理的實體
    
    // 服務器錯誤
    INTERNAL_SERVER_ERROR: 500, // 內部服務器錯誤
    NOT_IMPLEMENTED: 501,       // 未實現
    BAD_GATEWAY: 502,           // 網關錯誤
    SERVICE_UNAVAILABLE: 503,   // 服務不可用
    GATEWAY_TIMEOUT: 504        // 網關超時
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

// 網路錯誤類型
export const NETWORK_ERRORS = {
    TIMEOUT: 'timeout',
    NETWORK_ERROR: 'network_error',
    CORS_ERROR: 'cors_error',
    PARSE_ERROR: 'parse_error'
};
