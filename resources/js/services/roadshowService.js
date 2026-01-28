/**
 * Roadshow API 服務 
 */

// 從全局配置獲取 API 設定，如果沒有則使用默認值
const getApiConfig = () => {
    if (typeof window !== 'undefined' && window.endpoint) {
        return {
            baseURL: window.endpoint.baseURL || 'https://stg-line-crm.fanpokka.ai/api',
            authToken: window.endpoint.authToken || '123',
            timeout: window.endpoint.timeout || 30000
        };
    }
    
    // 默認配置
    return {
        baseURL: 'https://stg-line-crm.fanpokka.ai/api',
        authToken: '123',
        timeout: 30000
    };
};

export const roadshowService = {
    /**
     * 獲取模板列表
     * @deprecated 此方法已棄用。新 API (2026_draw_face_swap) 無對應的模板列表端點，且專案流程不需要模板選擇功能。
     * 保留此方法以避免破壞現有代碼（FaceSwapTemplateSelection.vue 中有調用）。
     */
    async getTemplates() {
        try {
            const config = getApiConfig();
            const url = `${config.baseURL}/fancy_frontier/templates`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${config.authToken}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const responseText = await response.text();
            
            if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
                console.error('❌ API返回HTML頁面，不是JSON數據');
                throw new Error('API返回HTML頁面，可能需要額外認證或端點錯誤');
            }
            
            const data = JSON.parse(responseText);
            return data;
        } catch (error) {
            console.error('❌ 獲取模板失敗:', error);
            return null;
        }
    },

    /**
     * 獲取用戶歷史圖片
     */
    async getUserHistory(userId) {
        try {
            const config = getApiConfig();
            const url = `${config.baseURL}/2026_draw_face_swap/user/${userId}/avatars`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${config.authToken}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('❌ 獲取用戶歷史失敗:', error);
            
            // 返回測試數據
            return {
                success: true,
                result: {
                    avatars: [
                        {
                            task_id: 'test_001',
                            result_image: 'https://api.builder.io/api/v1/image/assets/TEMP/c253dfe1e853fb5af2ff831c3b9c3bbbbfb128cb?width=240',
                            created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1小時前
                            template_id: 'wife',
                            status: 'completed'
                        },
                        {
                            task_id: 'test_002',
                            result_image: 'https://api.builder.io/api/v1/image/assets/TEMP/0864aa3462cae8e04607353cdec307e5671638af?width=240',
                            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2小時前
                            template_id: 'play',
                            status: 'completed'
                        },
                        {
                            task_id: 'test_003',
                            result_image: 'https://api.builder.io/api/v1/image/assets/TEMP/c253dfe1e853fb5af2ff831c3b9c3bbbbfb128cb?width=240',
                            created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3小時前
                            template_id: 'love',
                            status: 'completed'
                        }
                    ]
                }
            };
        }
    },

    /**
     * 上傳圖片生成頭像
     */
    async generateAvatar(formData) {
        try {
            const config = getApiConfig();
            const url = `${config.baseURL}/2026_draw_face_swap`;
            
            // 移除 dev_user_ 前綴（如果存在），因為新 API 只接受真實的 LINE userId
            const userId = formData.get('userId');
            if (userId && userId.startsWith('dev_user_')) {
                const originalUserId = userId.replace(/^dev_user_/, '');
                formData.set('userId', originalUserId);
                console.log('🔧 移除 dev_user_ 前綴，使用原始 userId:', originalUserId);
            }
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${config.authToken}`
                },
                body: formData
            });
            
            if (!response.ok) {
                let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                let errorData = null;
                
                try {
                    const errorText = await response.text();
                    if (errorText) {
                        try {
                            errorData = JSON.parse(errorText);
                            errorMessage = errorData.message || 
                                         errorData.detail || 
                                         errorData.error || 
                                         errorData.result?.message || 
                                         (typeof errorData === 'string' ? errorData : errorMessage);
                        } catch (parseError) {
                            errorMessage += ` - ${errorText}`;
                        }
                    }
                } catch (e) {
                    // 無法讀取錯誤響應
                }
                
                // 創建結構化的錯誤對象
                const structuredError = new Error(errorMessage);
                structuredError.status = response.status;
                structuredError.data = errorData;
                throw structuredError;
            }
            
            const data = await response.json();
            
            if (data.status === 'success' && data.result && data.result.task_id) {
                return {
                    success: true,
                    status: 'success',
                    result: {
                        task_id: data.result.task_id,
                        id: data.result.task_id // 向後兼容
                    }
                };
            }
            
            return data;
        } catch (error) {
            console.error('❌ 生成頭像失敗:', error);
            return {
                success: false,
                error: {
                    message: error.message,
                    status: error.status || (error.message.includes('500') ? 500 : 0),
                    data: error.data
                }
            };
        }
    },

    /**
     * 檢查任務狀態
     */
    async checkTaskStatus(taskId) {
        try {
            const config = getApiConfig();
            const url = `${config.baseURL}/2026_draw_face_swap/status/${taskId}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${config.authToken}`
                }
            });
            
            if (!response.ok) {
                let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                let errorData = null;
                
                try {
                    const errorText = await response.text();
                    if (errorText) {
                        try {
                            errorData = JSON.parse(errorText);
                            // 處理結構化的錯誤響應
                            errorMessage = errorData.message || 
                                         errorData.result?.message || 
                                         errorData.detail || 
                                         errorData.error || 
                                         (typeof errorData === 'string' ? errorData : errorMessage);
                        } catch (parseError) {
                            errorMessage += ` - ${errorText}`;
                        }
                    }
                } catch (e) {
                    // 無法讀取錯誤響應
                }
                
                // 創建結構化的錯誤對象
                const structuredError = new Error(errorMessage);
                structuredError.status = response.status;
                structuredError.data = errorData;
                throw structuredError;
            }
            
            const data = await response.json();
            
            let taskData = data;
            
            if (data.result && typeof data.result === 'object') {
                taskData = data.result;
            }
            
            // 返回標準化格式以保持向後兼容
            if (taskData.id && taskData.status !== undefined) {
                return {
                    success: true,
                    id: taskData.id,
                    status: taskData.status,
                    images: taskData.images || [],
                    template_id: taskData.template_id || '',
                    // 向後兼容字段
                    result: taskData,
                    // 保留原始響應
                    originalResponse: data
                };
            }
            
            return {
                success: true,
                ...taskData,
                originalResponse: data
            };
        } catch (error) {
            console.error('❌ 檢查任務狀態失敗:', error);
            return {
                success: false,
                error: {
                    message: error.message,
                    status: error.message.includes('500') ? 500 : 0
                }
            };
        }
    },

    /**
     * 獲取圖片資源
     * 將生成出來的圖片用參數的方式帶入
     */
    async getImageResource(imageUrl, options = {}) {
        try {
            // 使用正確的 API 端點
            const url = 'https://stg-api.fanpokka.ai/api/static-resource';
            
            // 構建查詢參數
            const queryParams = new URLSearchParams();
            queryParams.append('url', imageUrl);
            
            // 添加可選參數
            if (options.scale) queryParams.append('scale', options.scale);
            if (options.format) queryParams.append('format', options.format);
            if (options.quality) queryParams.append('quality', options.quality);
            if (options.width) queryParams.append('width', options.width);
            if (options.height) queryParams.append('height', options.height);
            
            const fullUrl = `${url}?${queryParams.toString()}`;
            
            const response = await fetch(fullUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'image/*,application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.startsWith('image/')) {
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);
                return {
                    success: true,
                    data: blobUrl,
                    type: 'image',
                    blob: blob,
                    originalUrl: imageUrl
                };
            } else {
                const data = await response.json();
                return {
                    success: true,
                    data: data,
                    type: 'json',
                    originalUrl: imageUrl
                };
            }
        } catch (error) {
            console.error('❌ 獲取圖片資源失敗:', error);
            return {
                success: false,
                error: {
                    message: error.message,
                    status: error.status || 0,
                    originalUrl: imageUrl
                }
            };
        }
    },

    /**
     * 處理生成後的圖片資源
     * 將生成出來的圖片用參數的方式帶入到新的 API
     */
    async processGeneratedImage(generatedImageUrl, processingOptions = {}) {
        try {
            const result = await this.getImageResource(generatedImageUrl, processingOptions);
            
            if (result.success) {
                return result;
            } else {
                console.error('❌ 圖片處理失敗:', result.error);
                throw new Error(result.error.message);
            }
        } catch (error) {
            console.error('❌ 處理生成圖片失敗:', error);
            return {
                success: false,
                error: {
                    message: error.message,
                    originalUrl: generatedImageUrl
                }
            };
        }
    }
};
