/**
 * API 服務 - 小專案版本
 * 包含axios配置、攔截器和基礎API方法
 */

import axios from 'axios';
import { API_CONFIG, HTTP_STATUS, ERROR_MESSAGES } from './config.js';

// 建立 axios 實例
const apiClient = axios.create({
    baseURL: API_CONFIG.baseURL,
    timeout: API_CONFIG.timeout,
    headers: API_CONFIG.headers
});

// ===== 請求攔截器 =====
apiClient.interceptors.request.use(
    (config) => {
        console.log('🚀 發送請求:', {
            method: config.method?.toUpperCase(),
            url: config.url
        });

        // 添加認證 Token (如果存在)
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        console.error('❌ 請求攔截器錯誤:', error);
        return Promise.reject(error);
    }
);

// ===== 響應攔截器 =====
apiClient.interceptors.response.use(
    (response) => {
        console.log('✅ 收到響應:', {
            status: response.status,
            url: response.config.url
        });
        return response;
    },
    (error) => {
        console.error('❌ 響應攔截器錯誤:', error);

        // 處理認證錯誤
        if (error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
            localStorage.removeItem('auth_token');
            // 可以重定向到登入頁面
        }

        return Promise.reject(error);
    }
);

// ===== 基礎API方法 =====

/**
 * 處理API響應
 * @param {Promise} apiCall - API調用Promise
 * @returns {Promise} 處理後的結果
 */
const handleApiCall = async (apiCall) => {
    try {
        const response = await apiCall;
        return {
            success: true,
            data: response.data,
            status: response.status
        };
    } catch (error) {
        console.error('API調用失敗:', error);
        
        let errorMessage = ERROR_MESSAGES.default;
        let errorStatus = null;
        
        if (error.response) {
            errorStatus = error.response.status;
            errorMessage = ERROR_MESSAGES[errorStatus] || ERROR_MESSAGES.default;
        } else if (error.code === 'ECONNABORTED') {
            errorMessage = '請求超時，請稍後再試';
        } else if (error.message.includes('Network Error')) {
            errorMessage = '網路連接失敗，請檢查網路設定';
        }
        
        return {
            success: false,
            error: {
                message: errorMessage,
                status: errorStatus,
                original: error
            }
        };
    }
};

// ===== 導出的API服務 =====

export const apiService = {
    /**
     * GET 請求
     * @param {string} endpoint - API端點
     * @param {Object} params - 查詢參數
     * @returns {Promise} 響應結果
     */
    async get(endpoint, params = {}) {
        return handleApiCall(apiClient.get(endpoint, { params }));
    },

    /**
     * POST 請求
     * @param {string} endpoint - API端點
     * @param {Object} data - 請求數據
     * @returns {Promise} 響應結果
     */
    async post(endpoint, data = {}) {
        return handleApiCall(apiClient.post(endpoint, data));
    },

    /**
     * PUT 請求
     * @param {string} endpoint - API端點
     * @param {Object} data - 請求數據
     * @returns {Promise} 響應結果
     */
    async put(endpoint, data = {}) {
        return handleApiCall(apiClient.put(endpoint, data));
    },

    /**
     * DELETE 請求
     * @param {string} endpoint - API端點
     * @returns {Promise} 響應結果
     */
    async delete(endpoint) {
        return handleApiCall(apiClient.delete(endpoint));
    },

    /**
     * PATCH 請求
     * @param {string} endpoint - API端點
     * @param {Object} data - 請求數據
     * @returns {Promise} 響應結果
     */
    async patch(endpoint, data = {}) {
        return handleApiCall(apiClient.patch(endpoint, data));
    }
};

// ===== 認證相關方法 =====

export const authService = {
    /**
     * 設置認證Token
     * @param {string} token - 認證Token
     */
    setToken(token) {
        if (token) {
            localStorage.setItem('auth_token', token);
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    },

    /**
     * 獲取認證Token
     * @returns {string|null} Token或null
     */
    getToken() {
        return localStorage.getItem('auth_token');
    },

    /**
     * 清除認證Token
     */
    clearToken() {
        localStorage.removeItem('auth_token');
        delete apiClient.defaults.headers.common['Authorization'];
    },

    /**
     * 檢查是否已認證
     * @returns {boolean} 是否已認證
     */
    isAuthenticated() {
        return !!this.getToken();
    }
};

// 導出axios實例（如果需要直接使用）
export default apiClient;
