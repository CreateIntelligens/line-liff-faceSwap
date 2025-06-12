<template>
  <div class="upload-screen">
    <!-- LoadingScreen 模板 -->
    <div v-if="showLoading" class="loading-screen">
      <div class="loading-overlay">
        <div class="loading-content">
          <div class="loading-image">
            <img src="/images/character.png" alt="角色圖片" class="character-image">
          </div>
          <div class="loading-indicator">
            <div class="loading-dots">
              <div class="loading-dot"></div>
              <div class="loading-dot"></div>
              <div class="loading-dot"></div>
              <div class="loading-dot"></div>
              <div class="loading-dot"></div>
            </div>
            <div class="loading-text">Loading...</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 背景裝飾線條 -->
    <div class="background-lines group-77"></div>
    <div class="background-lines group-75"></div>
    
    <!-- 標題區域 -->
    <div class="title-section">
      <div class="title-container">
        <img src="/images/group97.png" alt="標題背景" class="title-background">
        <h1 class="title-text">上傳個人圖片</h1>
      </div>
    </div>
    
    <!-- 主要內容區域 -->
    <div class="content-section">
      <!-- 上傳區域 -->
      <div class="upload-section">
        <div class="upload-box">
          <div class="upload-bg"></div>
          <div class="upload-accent"></div>
          <div class="dots">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
          
          <!-- 上傳元件 -->
          <div class="upload-widget" v-if="!uploadedImage">
            <div class="upload-icon">
              <img src="/images/upload-icon.svg" alt="上傳圖標">
            </div>
            <button class="upload-btn" type="button" @click="triggerFileUpload">點擊上傳</button>
            <input 
              type="file" 
              ref="fileInput" 
              accept=".png,.jpg,.jpeg" 
              style="display: none;"
              @change="handleFileUpload"
            >
          </div>
          
          <!-- 預覽區域 -->
          <div class="upload-widget" v-else>
            <div class="preview-container">
              <img :src="uploadedImage" alt="預覽圖片" class="preview-image">
              <div class="preview-info">
                <p class="file-name">{{ uploadedFileName }}</p>
                <button type="button" class="change-btn" @click="changeImage">更換圖片</button>
              </div>
            </div>
          </div>
          
          <!-- 格式說明 -->
          <p class="format-note">* 僅支援PNG、JPG檔案格式</p>
        </div>
      </div>
      
      <!-- 注意事項區域 -->
      <div class="notice-section">
        <div class="notice-bg"></div>
        <div class="notice-accent"></div>
        <div class="dots">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
        
        <h3 class="notice-title">注意事項</h3>
        
        <div class="notice-content">
          <p class="notice-item">• 一人僅能生成一次圖片，使用時請保持網路暢通</p>
          <p class="notice-item">• 請上傳單人照片，避免多人合照，以利準確辨識</p>
          <p class="notice-item">• 僅支援人像，請勿上傳風景、動物等非人物圖片</p>
          <p class="notice-item multiline">• 照片人物請避免面部遮擋（如帶口罩、摀嘴等），<br>&nbsp;&nbsp;&nbsp;保持五官清楚以免影響生成結果</p>
        </div>
      </div>
    </div>
    
    <!-- 底部按鈕區域 -->
    <div class="button-section">
      <button 
        class="btn-next" 
        :disabled="!uploadedImage"
        @click="processUpload"
      >
        下一步 >
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
  return '';
}

const emit = defineEmits(['upload-processed'])

const uploadedImage = ref(null)
const uploadedFileName = ref('')
const fileInput = ref(null)
const isLoading = ref(false)
const generatedImage = ref(null)
const pollingTaskId = ref(null)
const showLoading = ref(false)

function triggerFileUpload() {
  fileInput.value.click()
}

function handleFileUpload(event) {
  const file = event.target.files[0]
  if (file) {
    // 檢查檔案類型
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      alert('請選擇PNG或JPG格式的圖片檔案')
      return
    }
    
    // 檢查檔案大小（限制為5MB）
    if (file.size > 5 * 1024 * 1024) {
      alert('檔案大小不能超過5MB')
      return
    }
    
    // 顯示預覽
    const reader = new FileReader()
    reader.onload = function(e) {
      uploadedImage.value = e.target.result
      uploadedFileName.value = file.name
    }
    reader.readAsDataURL(file)
  }
}

function changeImage() {
  uploadedImage.value = null
  uploadedFileName.value = ''
  triggerFileUpload()
}

async function processUpload() {
  if (!uploadedImage.value || isLoading.value) return;

  isLoading.value = true
  // 直接顯示 loading 畫面
  showLoading.value = true

  // 將 base64 轉成 Blob
  function dataURLtoBlob(dataurl) {
    const arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
      u8arr[i] = bstr.charCodeAt(i);
    }
    return new Blob([u8arr], { type: mime });
  }

  const resultType = getCookie('mbti_result_type');
  const userInfoJson = getCookie('mbti_user_info');
  const formData = new FormData();
  formData.append('file', dataURLtoBlob(uploadedImage.value), uploadedFileName.value);
  formData.append('resultType', resultType);
  formData.append('userId', window.uid);
  if (userInfoJson) {
    formData.append('userInfo', userInfoJson);
  }
  console.log('上傳資料:', {
    resultType,
    userId: window.uid,
    userInfo: userInfoJson
  })
  try {
    const response = await fetch('https://f2d8-60-248-142-124.ngrok-free.app/api/mbti', {
      method: 'POST',
      headers: {
        'ngrok-skip-browser-warning': 'true'
      },
      body: formData
    });

    const data = await response.json();
    if (!response.ok) throw new Error(`上傳失敗: ${data.message || '請稍後再試'}`);

    if (data.task_id || (data.result && data.result.task_id)) {
      const tid = data.task_id || (data.result && data.result.task_id)
      pollingTaskId.value = tid

      // 在顯示 loading 的狀態下等待一秒，確保用戶看到 loading 畫面
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 通知父組件，直接跳轉至結果頁面，由結果頁面來處理輪詢
      emit('upload-processed', { task_id: tid })

    } else {
      throw new Error('未取得任務ID')
    }
  } catch (e) {
    showLoading.value = false
    alert(e.message || '上傳失敗，請稍後再試')
    isLoading.value = false
  }
}

// pollStatus 已移到 ResultScreen 組件中實現
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Poppins:wght@700&display=swap');

.upload-screen {
  width: 100vw;
  height: 100vh;
  min-height: 932px;
  background: #5E60FE;
  position: relative;
  overflow: hidden;
}

/* LoadingScreen 樣式 */
.loading-screen {
  width: 100vw;
  height: 100vh;
  background: #5E60FE;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #5E60FE;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  overflow: hidden;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 40px;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}

.loading-image {
  width: 200px;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: visible;
  position: relative;
}

.loading-image .character-image {
  width: auto;
  height: 100%;
  object-fit: contain;
  max-width: 100%;
  max-height: 100%;
  aspect-ratio: 768 / 1024;
}

.loading-indicator {
  text-align: center;
}

.loading-dots {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 20px;
}

.loading-dot {
  width: 12px;
  height: 12px;
  background-color: #FFF;
  border-radius: 50%;
  opacity: 0.2;
  animation: pulse 1.2s infinite ease-in-out;
}

.loading-dot:nth-child(1) { animation-delay: 0s; }
.loading-dot:nth-child(2) { animation-delay: 0.2s; }
.loading-dot:nth-child(3) { animation-delay: 0.4s; }
.loading-dot:nth-child(4) { animation-delay: 0.6s; }
.loading-dot:nth-child(5) { animation-delay: 0.8s; }

@keyframes pulse {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 1; }
}

.loading-text {
  color: #FFF;
  font-size: 18px;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
}

/* Loading Mask */
.loading-mask {
  position: fixed;
  z-index: 9999;
  left: 0; top: 0; width: 100vw; height: 100vh;
  background: rgba(0,0,0,0.4);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.loading-spinner {
  border: 8px solid #f3f3f3;
  border-top: 8px solid #5E60FE;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}
@keyframes spin {
  0% { transform: rotate(0deg);}
  100% { transform: rotate(360deg);}
}
.loading-text {
  color: #fff;
  font-size: 20px;
  font-weight: bold;
  text-align: center;
}

/* 背景裝飾線條 */
.background-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

/* 標題區域 */
.title-section {
  position: absolute;
  left: 24px;
  top: 36px;
  width: 382px;
}

.title-container {
  position: relative;
  width: 100%;
}

.title-background {
  width: 100%;
  display: block;
}

.title-text {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  font-family: 'Inter', sans-serif;
  font-weight: 900;
  font-size: 42px;
  line-height: 1.21;
  text-align: center;
  color: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
}

/* Upload Screen 樣式 */
.content-section {
  position: absolute;
  left: 29px;
  top: 180px;
  width: 372px;
  height: 564px;
}

.upload-section {
  position: relative;
  margin-bottom: 25px;
}

.upload-box {
  position: relative;
  width: 372px;
  height: 220px;
  margin-bottom: 20px;
}

.upload-bg {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: #FFFFFF;
  border: 2px solid #000000;
  border-radius: 8px;
}

.upload-accent {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 18px;
  background: #F5D34D;
  border-radius: 6px 6px 0 0;
  border: #000000 2px solid;
}

.dots {
  display: flex;
  gap: 4px;
  position: absolute;
  left: 16px;
  top: 5px;
  z-index: 2;
}

.dots .dot {
  width: 7.6px;
  height: 7.6px;
  background: #000;
  border-radius: 50%;
  display: inline-block;
}

.upload-widget {
  position: relative;
  z-index: 2;
  padding: 20px;
  text-align: center;
  padding-top: 30px;
}

.upload-icon img {
  width: 48px;
  height: 48px;
  margin-bottom: 12px;
}

.upload-btn {
  background: #5E60FE;
  color: white;
  border: 2px solid #000000;
  border-radius: 6px;
  padding: 10px 20px;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  cursor: pointer;
}

.preview-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.preview-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #000000;
}

.file-name {
  font-size: 14px;
  color: #333333;
}

.change-btn {
  background: #F5D34D;
  border: 1px solid #000000;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
}

.format-note {
  position: relative;
  z-index: 2;
  text-align: center;
  font-size: 12px;
  color: #333333;
  margin-top: 10px;
  padding-bottom: 15px;
}

.notice-section {
  position: relative;
  margin-top: 30px;
}

.notice-bg {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 200px;
  background: #FFFFFF;
  border: 2px solid #000000;
  border-radius: 8px;
}

.notice-accent {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 18px;
  background: #F5D34D;
  border-radius: 6px 6px 0 0;
  border: #000000 2px solid;
}

.notice-title {
  position: relative;
  z-index: 2;
  padding: 20px 20px 10px;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 16px;
  color: #000000;
  margin: 0;
}

.notice-content {
  position: relative;
  z-index: 2;
  padding: 0 20px 20px;
}

.notice-item {
  font-size: 12px;
  color: #333333;
  margin-bottom: 8px;
  line-height: 1.4;
}

/* 底部按鈕區域 */
.button-section {
  position: absolute;
  left: 50%;
  top: 850px;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  align-items: center;
}

.btn-next {
  width: 280px;
  height: 60px;
  background: #F5D34D;
  border: 2px solid #000000;
  border-radius: 8px;
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 18px;
  line-height: 1.5;
  color: #333333;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 100;
}

.btn-next:hover {
  transform: translateY(-2px);
}

.btn-next:active {
  transform: translateY(0);
}

.btn-next:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 響應式設計 */
@media (max-width: 430px) {
  .upload-screen {
    width: 100vw;
    height: 100vh;
    min-height: 932px;
  }
  
  .title-section {
    width: 90%;
    left: 5%;
  }
  
  .title-text {
    font-size: calc(24px + 2vw);
  }
  
  .content-section {
    width: 90%;
    left: 5%;
  }
  
  .upload-section {
    width: 100%;
  }
  
  .upload-box {
    width: 100%;
  }
  
  .notice-section {
    width: 100%;
  }
  
  .btn-next {
    max-width: 280px;
  }
}

@media (max-height: 932px) and (orientation: portrait) {
  .upload-screen {
    height: 100vh;
    min-height: 800px;
  }
  
  .content-section {
    height: auto;
    top: 160px;
  }
  
  .button-section {
    bottom: 20px;
    top: auto;
    position: fixed;
  }
  
  .title-section {
    top: 20px;
    height: 90px;
  }
}

@media (max-height: 700px) and (orientation: portrait) {
  .title-text {
    font-size: 28px;
  }
  
  .title-section {
    height: 80px;
  }
  
  .upload-section {
    margin-bottom: 20px;
  }
  
  .upload-box {
    height: 100px;
    margin-bottom: 15px;
  }
  
  .notice-section {
    margin-top: 20px;
  }
  
  .notice-bg {
    height: 150px;
  }
  
  .notice-title {
    font-size: 14px;
    padding: 15px 15px 8px;
  }
  
  .notice-content {
    padding: 0 15px 15px;
  }
  
  .notice-item {
    font-size: 11px;
    margin-bottom: 6px;
  }
}
</style>
