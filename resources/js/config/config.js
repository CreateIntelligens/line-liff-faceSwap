/**
 * 配置管理模組
 * 支援從 window.endpoint 讀取配置，並提供默認值
 */

// 默認配置
const DEFAULT_CONFIG = {
    baseURL: 'http://localhost:8000',
    version: 'v1',
    timeout: 30000,
    debug: false,
    // LIFF 配置（保留以支援現有代碼）
    liff: {
        liffId: '2006948092-pExnvWML', // 預設 LIFF ID
        basicId: '@299fvzdf' // 預設 Basic ID
    }
};

// 從 window.endpoint 讀取配置，如果沒有則使用默認值
const getConfig = () => {
    // 檢查是否存在全局配置
    if (typeof window !== 'undefined' && window.endpoint) {
        return {
            ...DEFAULT_CONFIG,
            ...window.endpoint
        };
    }
    
    // 如果沒有全局配置，返回默認值
    console.warn('⚠️ 未找到 window.endpoint 配置，使用默認配置');
    return DEFAULT_CONFIG;
};

// 獲取當前配置
export const API_CONFIG = getConfig();
// HTTP 狀態碼
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
};

// 錯誤訊息
export const ERROR_MESSAGES = {
    400: '請求格式錯誤',
    401: '未授權，請重新登入',
    403: '禁止訪問',
    404: '請求的資源不存在',
    500: '伺服器內部錯誤',
    503: '服務暫時不可用',
    default: '發生未知錯誤'
};

// 配置工具函數
export const configUtils = {
    /**
     * 獲取完整的 API URL
     * @param {string} endpoint - API 端點
     * @returns {string} 完整的 API URL
     */
    getFullUrl(endpoint) {
        const config = getConfig();
        const baseURL = config.baseURL.replace(/\/$/, ''); // 移除結尾的斜線
        const cleanEndpoint = endpoint.replace(/^\//, ''); // 移除開頭的斜線
        
        if (config.version) {
            return `${baseURL}/${config.version}/${cleanEndpoint}`;
        }
        
        return `${baseURL}/${cleanEndpoint}`;
    },
    
    /**
     * 獲取配置值
     * @param {string} key - 配置鍵
     * @param {*} defaultValue - 默認值
     * @returns {*} 配置值或默認值
     */
    get(key, defaultValue = null) {
        const config = getConfig();
        return config[key] !== undefined ? config[key] : defaultValue;
    },
    
    /**
     * 檢查是否為調試模式
     * @returns {boolean} 是否為調試模式
     */
    isDebug() {
        return this.get('debug', false);
    },
    
    /**
     * 輸出當前配置到控制台
     */
    logConfig() {
        if (this.isDebug()) {
            console.log('🔧 當前 API 配置:', getConfig());
        }
    }
};

// 導出默認配置（用於測試或其他用途）
export { DEFAULT_CONFIG };

