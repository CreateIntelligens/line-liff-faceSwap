/**
 * Roadshow API 服務 - 純粹的API串接，不改變UI
 */

const API_BASE = 'https://d7445102946d.ngrok-free.app/api';
const AUTH_TOKEN = '123'; // 根據API文檔，使用 "123" 作為認證token

export const roadshowService = {
    /**
     * 獲取模板列表
     */
    async getTemplates() {
        try {
            console.log('🔍 發送請求到:', `${API_BASE}/roadshow/templates`);
            console.log('🔐 使用認證token:', AUTH_TOKEN);
            
            const response = await fetch(`${API_BASE}/roadshow/templates`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${AUTH_TOKEN}`
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
            const response = await fetch(`${API_BASE}/roadshow/user/${userId}/avatars`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${AUTH_TOKEN}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('獲取用戶歷史失敗:', error);
            return null;
        }
    },

    /**
     * 上傳圖片生成頭像
     */
    async generateAvatar(formData) {
        try {
            const response = await fetch(`${API_BASE}/roadshow`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${AUTH_TOKEN}`
                },
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('生成頭像失敗:', error);
            return null;
        }
    },

    /**
     * 檢查任務狀態
     */
    async checkTaskStatus(taskId) {
        try {
            const response = await fetch(`${API_BASE}/roadshow/status/${taskId}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${AUTH_TOKEN}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('檢查任務狀態失敗:', error);
            return null;
        }
    }
};
