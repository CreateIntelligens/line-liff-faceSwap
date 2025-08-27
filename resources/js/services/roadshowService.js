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
     */
    async getTemplates() {
        try {
            const config = getApiConfig();
            const url = `${config.baseURL}/roadshow/templates`;
            
            console.log('🔍 發送請求到:', url);
            console.log('🔐 使用認證token:', config.authToken);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${config.authToken}`
                }
            });
            
            console.log('📡 響應狀態:', response.status, response.statusText);
            console.log('📡 響應頭:', Object.fromEntries(response.headers.entries()));
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            // 先讀取響應文本，看看實際返回了什麼
            const responseText = await response.text();
            console.log('📡 響應內容前200字符:', responseText.substring(0, 200));
            
            // 檢查是否為HTML響應
            if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
                console.error('❌ API返回HTML頁面，不是JSON數據');
                console.error('❌ 完整響應:', responseText);
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
            const url = `${config.baseURL}/roadshow/user/${userId}/avatars`;
            
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
            const url = `${config.baseURL}/roadshow`;
            
            console.log('🚀 發送生成頭像請求到:', url);
            console.log('🔐 使用認證token:', config.authToken);
            
            // 檢查 FormData 內容
            console.log('📋 FormData 內容:');
            for (let [key, value] of formData.entries()) {
                console.log(`  ${key}:`, value);
            }
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${config.authToken}`
                },
                body: formData
            });
            
            console.log('📡 響應狀態:', response.status, response.statusText);
            console.log('📡 響應頭:', Object.fromEntries(response.headers.entries()));
            
            if (!response.ok) {
                // 嘗試讀取錯誤響應
                let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                let errorData = null;
                
                try {
                    const errorText = await response.text();
                    console.log('📡 錯誤響應內容:', errorText);
                    if (errorText) {
                        try {
                            errorData = JSON.parse(errorText);
                            errorMessage = errorData.message || errorData.result?.message || errorMessage;
                        } catch (parseError) {
                            errorMessage += ` - ${errorText}`;
                        }
                    }
                } catch (e) {
                    console.log('📡 無法讀取錯誤響應內容');
                }
                
                // 創建結構化的錯誤對象
                const structuredError = new Error(errorMessage);
                structuredError.status = response.status;
                structuredError.data = errorData;
                throw structuredError;
            }
            
            const data = await response.json();
            console.log('✅ 生成頭像成功:', data);
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
            const url = `${config.baseURL}/roadshow/status/${taskId}`;
            
            console.log('🔍 檢查任務狀態:', url);
            console.log('🔐 使用認證token:', config.authToken);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${config.authToken}`
                }
            });
            
            console.log('📡 響應狀態:', response.status, response.statusText);
            console.log('📡 響應頭:', Object.fromEntries(response.headers.entries()));
            
            if (!response.ok) {
                // 嘗試讀取錯誤響應
                let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                try {
                    const errorData = await response.text();
                    console.log('📡 錯誤響應內容:', errorData);
                    if (errorData) {
                        errorMessage += ` - ${errorData}`;
                    }
                } catch (e) {
                    console.log('📡 無法讀取錯誤響應內容');
                }
                throw new Error(errorMessage);
            }
            
            const data = await response.json();
            console.log('✅ 任務狀態檢查成功:', data);
            return data;
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
    }
};
