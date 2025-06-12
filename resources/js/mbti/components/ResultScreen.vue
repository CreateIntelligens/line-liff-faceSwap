<template>
  <div class="result-screen">
    <!-- 背景裝飾線條 -->
    <div class="background-lines group-77"></div>
    <div class="background-lines group-75"></div>
    
    <!-- 標題區域 -->
    <div class="title-section">
      <div class="title-container">
        <img src="/images/group97.png" alt="標題背景" class="title-background">
        <h1 class="title-text">專屬人格照片</h1>
      </div>
    </div>
    
    <!-- 主要內容區域 -->
    <div class="content-section">
      <!-- 上方內容框 -->
      <div class="content-box">
        <div class="content-bg">

          <!-- 角色圖片 -->
          <div class="character-image">
            <div v-if="isPolling" class="loading-indicator">
              <div class="loading-spinner"></div>
              <p>圖片生成中...</p>
            </div>
            <img v-else :src="localImageUrl || '/images/character-result.png'" alt="專屬人格角色" />
            <p v-if="pollingError" class="error-message">圖片生成逾時，請稍後重試</p>
          </div>

        </div>
        <div class="content-accent"></div>
        <div class="dots">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
      </div>
    </div>
    
    <!-- 分析結果區域 -->
    <div class="analysis-section">
      <!-- 特質分析框 -->
      <div class="analysis-box">
        <div class="analysis-bg">

          <div class="analysis-content">
            <p class="analysis-item">• 您的MBTI類型：{{ personalityInfo ? personalityInfo.name : mbtiResult }}</p>
            <p class="analysis-item">• 團隊角色：{{ personalityInfo ? personalityInfo.team_role : '等待分析中...' }}</p>
            <p class="analysis-item">• 主要特質：{{ personalityInfo ? personalityInfo.traits : '等待分析中...' }}</p>
            <p class="analysis-item">• 團隊貢獻：{{ personalityInfo ? personalityInfo.contribution : '等待分析中...' }}</p>
            <p class="analysis-item challenge">• 潛在挑戰：{{ personalityInfo ? personalityInfo.potential_challenges : '等待分析中...' }}</p>
          </div>

        </div>
        <div class="analysis-accent"></div>
        <div class="dots">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
      </div>
      
      <!-- 附加信息框 -->
      <div class="info-box">
        <div class="info-bg">

          <div class="info-content">
            <div class="user-code">專屬編號：{{ localResultId }}</div>
            <div class="service-notice">
              展覽過後將關閉服務，可點擊下載將照片傳至官方帳號！<br>
              如想列印留念請找現場工作人員協助！
            </div>
          </div>

        </div>
        <div class="info-accent"></div>
        <div class="dots">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>

      </div>

      <div class="download-section">
        <div class="button-container">
          <img src="/images/group78.png" alt="按鈕背景" class="button-background">
          <button class="btn-download" @click="downloadResult">下載至官方帳號</button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import personalityTypes from '../data/mbti-questions.json'

const props = defineProps({
  mbtiResult: {
    type: String,
    default: ''
  },
  userInfo: {
    type: Object,
    default: () => ({})
  },
  imageUrl: {
    type: String,
    default: ''
  },
  resultId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['download-requested', 'image-loaded'])

// 本地狀態
const localImageUrl = ref(props.imageUrl)
const isPolling = ref(!props.imageUrl && props.resultId)
const pollingError = ref(false)
const localResultId = ref(props.resultId || '---')
const personalityInfo = ref(null)

// 監聽 props 變化
watch(() => props.imageUrl, (newVal) => {
  if (newVal) {
    localImageUrl.value = newVal
    isPolling.value = false
  }
})

// 當組件掛載時，如果有 resultId 但沒有 imageUrl，則開始輪詢
onMounted(() => {
  if (props.resultId && !props.imageUrl) {
    pollStatus(props.resultId)
  }
})

async function pollStatus(taskId) {
  if (!taskId) return
  
  isPolling.value = true
  let retry = 0
  const maxRetry = 60 // 最多輪詢2分鐘
  
  while (retry < maxRetry && isPolling.value) {
    try {
      console.log(`結果頁輪詢第 ${retry + 1} 次...`)
      const res = await fetch(`https://f2d8-60-248-142-124.ngrok-free.app/api/mbti/status/${taskId}`, {
  headers: {
    'ngrok-skip-browser-warning': 'true'
  }
})
      if (res.ok) {
        const responseData = await res.json()
        console.log('輪詢響應:', responseData)
        const data = responseData.result;
        console.log('輪詢數據:', data)
        
        if (data?.state === 20) {
           // 失敗，返回updatescreen
          alert('圖片生成失敗，請稍後重試')
          isPolling.value = false;
          emit('image-loaded', { 
            task_id: taskId, 
            image_url: null,
            result_id: localResultId.value,
            personality_info: null
          });
          return;
        }

        // 更新專屬編號
        if (data && data.id) {
          localResultId.value = data.id;
          console.log('更新專屬編號:', localResultId.value);
        }
        
        // 處理性格類型數據
        if (data && data.resultType) {
          const mbtiType = data.resultType;
          console.log('獲取MBTI類型:', mbtiType);
          if (personalityTypes.personality_types && personalityTypes.personality_types[mbtiType]) {
            personalityInfo.value = personalityTypes.personality_types[mbtiType];
            console.log('獲取性格特質信息:', personalityInfo.value);
          }
        }
        
        // 支援 images 或 image_url
        let imageUrl = null
        if (data && data.images && data.images.length > 0) {
          imageUrl = data.images[0]
          console.log('從 data.images 獲取圖片 URL:', imageUrl)
        } else if (data && data.image_url) {
          imageUrl = data.image_url
          console.log('從 data.image_url 獲取圖片 URL:', imageUrl)
        }
        if (imageUrl) {
          console.log('成功獲取圖片:', imageUrl)
          localImageUrl.value = imageUrl
          // 通知父組件已獲取圖片
          emit('image-loaded', { 
            task_id: taskId, 
            image_url: imageUrl,
            result_id: localResultId.value,
            personality_info: personalityInfo.value
          })
          // 完全中斷輪詢
          console.log('圖片已獲取，停止輪詢')
          isPolling.value = false
          return
        }
      }
    } catch (e) {
      console.error('輪詢錯誤:', e)
    }
    
    // 等待
    await new Promise(resolve => setTimeout(resolve, 2000))
    retry++
  }
  
  // 如果到此，表示輪詢超時
  if (isPolling.value) {
    console.error('圖片生成逾時')
    pollingError.value = true
    isPolling.value = false
  }
}

function downloadResult() {
  emit('download-requested', {
    mbtiResult: props.mbtiResult,
    userInfo: props.userInfo,
    imageUrl: localImageUrl.value
  })
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Poppins:wght@700&display=swap');
.result-screen {
  width: 100vw;
  min-height: 100vh;
  background: #5E60FE;
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  padding-bottom: 150px; /* 確保底部有足夠空間 */
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
  position: relative;
  left: 24px;
  top: unset !important;
  margin-top: 12px;
  width: 382px;
  z-index: 10;
  height: fit-content !important;
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
/* 主要內容區域 */
.content-section {
  position: relative !important;
  margin-top: 12px !important;
  left: 29px;
  top: unset !important;
  width: 372px;
  height: 564px;
}
.content-box {
  position: relative;
  width: 100%;
  height: auto;
  min-height: unset !important
}
.content-bg {
  height: fit-content !important;
  min-height: auto !important;
  position: relative !important;
  left: 0;
  top: 0;
  width: 100%;
  background: #FFFFFF;
  border: 2px solid #000000;
  border-radius: 8px;
}
.content-accent {
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
.character-image {
  position: relative;
  z-index: 2;
  padding: 20px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}
.character-image img {
  width: auto;
  height: auto; /* 高度自動調整 */
  object-fit: contain;
  border-radius: 8px;
  max-width: 100%;
  aspect-ratio: 768 / 1024; /* 保持原始圖片比例 */
}
.analysis-section {
  position: relative !important;
  margin-top: 12px !important;
  left: 29px;
  top: 0 !important;
  width: 372px;
}
.analysis-box {
  height: auto !important;
  position: relative;
  margin-bottom: 20px;
}
.analysis-bg {
  position: relative !important;
  top: 0;
  width: 100%;
  height: fit-content !important;
  background: #FFFFFF;
  border: 2px solid #000000;
  border-radius: 8px;
}
.analysis-accent {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 18px;
  background: #F5D34D;
  border-radius: 6px 6px 0 0;
  border: #000000 2px solid;
}
.analysis-content {
  position: relative;
  z-index: 2;
  left: 10px !important;
  padding: 25px 20px 20px;
}
.analysis-item {
  font-size: 12px;
  color: #333333;
  margin-bottom: 6px;
  line-height: 1.4;
}
.analysis-item.challenge {
  color: #FF6B6B;
}
.info-box {
  position: relative;
  height: auto !important;
}
.info-bg {
  position: relative !important;
  left: 0;
  top: 0;
  width: 100%;
  height: fit-content !important;
  background: #FFFFFF;
  border: 2px solid #000000;
  border-radius: 8px;
}
.info-accent {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 18px;
  background: #F5D34D;
  border-radius: 6px 6px 0 0;
  border: #000000 2px solid;
}
.info-content {
  position: relative;
  z-index: 2;
  padding: 25px 20px 15px;
  left: 10px !important;
}
.user-code {
  font-size: 1rem !important;
  font-weight: 700;
  color: #333333;
  margin-bottom: 5px;
}
.service-notice {
  font-size: 1rem !important;
  color: #666666;
  line-height: 1.3;
}
.download-section {
  position: relative !important;
  margin-top: 25px !important;
  left: 50%;
  top: 0 !important;
  transform: translateX(-50%);
  margin-bottom: 50px; /* 確保底部有空間 */
  height: 200px;
  bottom: 0px;
}
.button-container {
  position: relative;
}
.button-background {
  width: 280px;
  height: 60px;
}
.btn-download {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  border: none;
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 16px;
  color: #333333;
  cursor: pointer;
  z-index: 10;
}
.btn-download:hover {
  transform: translateY(-2px);
}
/* 響應式設計 */
@media (max-width: 430px) {
  .result-screen {
    width: 100%;
    height: auto;
    min-height: 100vh;
    overflow-x: hidden;
    overflow-y: auto;
    padding-bottom: 200px;
  }
  .title-section {
    width: calc(100vw - 48px);
    left: 24px;
    top: 25px;
    height: 120px;
  }
  .title-text {
    font-size: clamp(18px, 5vw, 32px);
    line-height: 1.2;
    padding: 8px;
  }
  .content-section {
    width: calc(100vw - 58px);
    left: 29px;
    top: 180px;
    height: auto;
    min-height: 350px;
    position: absolute;
  }
  .content-box {
    width: 100%;
    height: auto;
    min-height: 503px; /* 調整為足夠容納圖片高度443px + 上下padding 30px + 額外空間 */
    margin-bottom: 20px;
  }
  .content-bg {
    width: 100%;
    height: 100%;
    min-height: 503px; /* 與content-box一致 */
  }
  .content-accent {
    width: 100%;
  }
  .character-image {
    width: 100%;
    height: auto;
    position: relative;
    padding: 30px 15px; /* 上下30px, 左右15px */
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .character-image img {
    width: 324px; /* 指定寬度為324px */
    height: 443px; /* 指定高度為443px */
    object-fit: contain;
    max-width: 100%;
    aspect-ratio: 768 / 1024;
  }
  .analysis-section {
    width: calc(100vw - 62px);
    left: 31px;
    top: 710px; /* 調整為符合新圖片大小 */
    height: auto;
    position: absolute;
  }
  .analysis-box {
    height: 190px;
    margin-bottom: 25px;
  }
  .analysis-bg {
    width: 100%;
    height: 190px;
    min-height: 190px;
  }
  .analysis-content {
    width: calc(100% - 42px);
    left: 25px;
    height: auto;
  }
  .analysis-item {
    font-size: 1rem !important;
    line-height: 1.4;
    margin-bottom: 6px;
  }
  .info-box {
    height: 140px;
  }
  .info-bg {
    width: 100%;
    height: 140px;
  }
  .info-content {
    width: calc(100% - 42px);
    left: 25px;
    gap: 8px;
  }
  .user-code {
    font-size: 14px;
  }
  .service-notice {
    font-size: 11px;
    line-height: 1.6;
  }
  .download-section {
    width: calc(100vw - 62px);
    left: 50%;
    top: 500%; /* 從200%調整為160%，往上移動 */
  }
  .button-background {
    width: 100%;
  }
  .btn-download {
    width: 100%;
  }
}
@media (max-height: 932px) and (orientation: portrait) {
  .result-screen {
    height: auto;
    min-height: 100vh;
    overflow-y: auto;
    padding-bottom: 280px; /* 增加底部空間 */
  }
  .title-section {
    top: 25px;
    height: 90px;
  }
  .content-section {
    height: auto;
    min-height: 400px;
    top: 150px;
  }
  .content-bg {
    height: 400px;
  }
  .character-image {
    height: auto;
    padding: 45px 10px 20px;
  }
  .analysis-section {
    height: auto;
    top: 660px; /* 從560px增加到660px，配合更大的圖片 */
  }
  .analysis-box {
    height: 180px;
    margin-bottom: 25px;
  }
  .analysis-bg {
    height: 180px;
    min-height: 180px;
  }
  .info-box {
    height: 120px;
    margin-bottom: 20px;
  }
  .info-bg {
    height: 120px;
  }
  .download-section {
    top: 1024px; /* 從120%調整為100%，往上移動 */
    left: 50%;
    transform: translateX(-50%);
  }
}
@media (max-height: 700px) and (orientation: portrait) {
  .title-text {
    font-size: 28px;
  }
  .title-section {
    height: 80px;
  }
  .content-section {
    height: auto;
    min-height: 320px;
    top: 120px;
    width: calc(100% - 40px);
    max-width: 340px;
    left: 20px;
  }
  .content-bg {
    height: 320px;
  }
  .character-image {
    height: auto;
    padding: 35px 10px 15px;
  }
  .character-image img {
    width: 288px; /* 調整為更適合此螢幕大小的寬度 */
    height: 394px; /* 保持原始比例 */
    aspect-ratio: 768 / 1024;
    max-width: 100%;
  }
  .analysis-section {
    top: 565px; /* 調整位置 */
    width: calc(100% - 40px);
    max-width: 340px;
    left: 20px;
  }
  .analysis-box {
    height: 160px;
    margin-bottom: 20px;
  }
  .analysis-bg {
    height: 160px;
  }
  .analysis-content {
    top: 25px;
    gap: 4px;
    padding: 25px 16px 16px;
  }
  .analysis-item {
    font-size: clamp(10px, 2.8vw, 12px);
    line-height: 1.3;
    margin-bottom: 4px;
    word-break: break-word;
  }
  .info-box {
    height: 120px;
  }
  .info-bg {
    height: 120px;
  }
  .download-section {
    top: 130%; /* 從120%調整為100%，往上移動 */
  }
}
/* 適配大型平板和桌面顯示器 */
@media (min-width: 768px) {
  .result-screen {
    padding-bottom: 60px;
  }
  .title-section {
    left: 50%;
    top: 60px;
    width: 480px;
    max-width: 90%;
    transform: translateX(-50%);
  }
  .title-text {
    font-size: 48px;
  }
  .content-section {
    width: 420px;
    max-width: 90%;
    left: 50%;
    top: 200px;
    transform: translateX(-50%);
  }
  .character-image img {
    width: 360px; /* 適合大螢幕的寬度 */
    height: 492px; /* 保持原始比例 */
    aspect-ratio: 768 / 1024;
    max-width: 100%;
  }
  .analysis-section {
    width: 420px;
    max-width: 90%;
    left: 50%;
    top: 680px; /* 調整位置 */
    transform: translateX(-50%);
  }
  .download-section {
    width: 320px;
    top: 100%; /* 從120%調整為100%，往上移動 */
  }
}
/* 橫屏模式優化 */
@media (orientation: landscape) and (max-height: 500px) {
  .result-screen {
    height: auto;
    min-height: 100vh;
    padding: 20px 0 150px; /* 增加底部空間 */
    overflow-y: auto;
  }
  .title-section {
    top: 10px;
  }
  .title-text {
    font-size: 28px;
  }
  .content-section {
    top: 80px;
    min-height: 280px;
  }
  .character-image {
    padding: 15px 10px;
  }
  .character-image img {
    width: 270px;
    height: 369px;
    aspect-ratio: 768 / 1024;
    max-width: 100%;
  }
  .analysis-section {
    top: 480px; /* 從380px增加到480px，配合更大的圖片 */
  }
  .analysis-box {
    height: 160px;
  }
  .download-section {
    top: 100%; /* 從120%調整為100%，往上移動 */
  }
}
/* 針對超高螢幕的優化 */
@media (min-height: 1200px) {
  .content-section {
    top: 250px;
  }
  .analysis-section {
    top: 600px;
  }
  .download-section {
    top: 95%; /* 從120%調整為95%，往上移動 */
  }
}
/* 特別針對超小屏幕的設備優化 */
@media (max-width: 360px) {
  .title-section {
    width: 90%;
    max-width: 300px;
    left: 5%;
    top: 15px;
  }
  .title-text {
    font-size: clamp(16px, 4.8vw, 24px);
  }
  .content-section {
    width: 90%;
    left: 5%;
    top: 120px;
  }
  .character-image {
    padding: 20px 5px;
  }
  .character-image img {
    width: 240px; /* 適合超小螢幕的寬度 */
    height: 328px; /* 保持原始比例 */
    aspect-ratio: 768 / 1024;
    max-width: 100%;
  }
  .analysis-section {
    width: 90%;
    left: 5%;
    top: 440px;
    position: absolute; /* 確保定位 */
  }
  .analysis-item {
    font-size: 10px;
    margin-bottom: 3px;
  }
  .download-section {
    width: 90%;
    max-width: 280px;
    left: 50%;
    top: 100%; /* 從120%調整為100%，往上移動 */
    transform: translateX(-50%);
  }
}
</style>
