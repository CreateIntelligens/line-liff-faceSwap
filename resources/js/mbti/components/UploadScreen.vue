<template>
  <div class="min-h-screen bg-primary flex flex-col items-center">
    <!-- LoadingScreen 模板 -->
    <div v-if="showLoading" class="fixed inset-0 w-full h-full bg-primary z-[1000]">
      <div class="fixed inset-0 w-full h-full bg-primary flex items-center justify-center z-[1000] overflow-hidden">
        <div class="flex flex-col items-center justify-center gap-10 w-full px-5">
          <div class="w-[200px] h-[200px] flex justify-center items-center overflow-visible">
            <img src="/images/character.png" alt="角色圖片" class="w-auto h-full object-contain max-w-full max-h-full aspect-[768/1024]">
          </div>
          <div class="text-center">
            <div class="flex gap-2 justify-center mb-5">
              <div v-for="i in 5" :key="i" class="w-3 h-3 bg-white rounded-full opacity-20 animate-pulse" :style="{ animationDelay: `${(i-1) * 0.2}s` }"></div>
            </div>
            <div class="text-white text-lg font-inter font-bold">Loading...</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 背景裝飾線條 -->
    <div class="fixed inset-0 pointer-events-none">
      <img src="/images/vector-5.svg" class="absolute opacity-20" alt="">
      <img src="/images/vector-13.svg" class="absolute opacity-20" alt="">
      <img src="/images/vector-14.svg" class="absolute opacity-20" alt="">
    </div>
    
    <!-- 主要內容容器 -->
    <div class="w-full max-w-[390px] px-4 pt-6 flex flex-col gap-2">
      <!-- 標題區域 -->
      <div class="w-full">
        <div class="relative w-full">
          <img src="/images/group97.png" alt="標題背景" class="w-full block">
          <h1 class="absolute inset-0 flex items-center justify-center font-inter font-black text-4xl leading-tight text-center text-black m-0 p-0">
            上傳個人圖片
          </h1>
        </div>
      </div>
      
      <!-- 上傳區域 -->
      <div class="w-full">
        <div class="bg-white border-2 border-black rounded-lg overflow-hidden">
          <!-- 頂部裝飾條 -->
          <div class="h-[18px] bg-accent border-b-2 border-black flex items-center px-4">
            <div class="flex gap-1">
              <div class="w-[7.6px] h-[7.6px] bg-black rounded-full"></div>
              <div class="w-[7.6px] h-[7.6px] bg-black rounded-full"></div>
              <div class="w-[7.6px] h-[7.6px] bg-black rounded-full"></div>
            </div>
          </div>
          
          <!-- 上傳元件 -->
          <div class="p-5 pt-8 text-center" v-if="!uploadedImage">
            <div class="mb-3">
              <img src="/images/upload-icon.svg" alt="上傳圖標" class="w-12 h-12 mx-auto">
            </div>
            <button class="bg-primary text-white border-2 border-black rounded-lg px-5 py-2.5 font-inter font-bold cursor-pointer" type="button" @click="triggerFileUpload">點擊上傳</button>
            <input 
              type="file" 
              ref="fileInput" 
              accept=".png,.jpg,.jpeg" 
              class="hidden"
              @change="handleFileUpload"
            >
          </div>
          
          <!-- 預覽區域 -->
          <div class="p-5 pt-8 text-center" v-else>
            <div class="flex flex-col items-center gap-2 mb-2">
              <img :src="uploadedImage" alt="預覽圖片" class="w-[100px] h-[100px] object-cover rounded-lg border-2 border-black">
              <p class="text-sm text-[#333333]">{{ uploadedFileName }}</p>
              <button type="button" class="bg-accent border border-black rounded px-3 py-1.5 text-xs cursor-pointer" @click="changeImage">更換圖片</button>
            </div>
          </div>
          
          <!-- 格式說明 -->
          <p class="text-center text-xs text-[#333333] mt-2.5 pb-4">* 僅支援PNG、JPG檔案格式</p>
        </div>
      </div>
      
      <!-- 注意事項區域 -->
      <div class="w-full mb-5">
        <div class="bg-white border-2 border-black rounded-lg overflow-hidden">
          <!-- 頂部裝飾條 -->
          <div class="h-[18px] bg-accent border-b-2 border-black flex items-center px-4">
            <div class="flex gap-1">
              <div class="w-[7.6px] h-[7.6px] bg-black rounded-full"></div>
              <div class="w-[7.6px] h-[7.6px] bg-black rounded-full"></div>
              <div class="w-[7.6px] h-[7.6px] bg-black rounded-full"></div>
            </div>
          </div>
          
          <h3 class="px-5 pt-5 pb-2.5 font-inter font-bold text-base text-black m-0">注意事項</h3>
          
          <div class="px-5 pb-5">
            <div class="flex mb-2">
              <span class="text-sm text-[#333333] mr-2">•</span>
              <p class="text-sm text-[#333333] leading-[1.4]">一人僅能生成一次圖片，使用時請保持網路暢通</p>
            </div>
            <div class="flex mb-2">
              <span class="text-sm text-[#333333] mr-2">•</span>
              <p class="text-sm text-[#333333] leading-[1.4]">請上傳單人照片，避免多人合照，以利準確辨識</p>
            </div>
            <div class="flex mb-2">
              <span class="text-sm text-[#333333] mr-2">•</span>
              <p class="text-sm text-[#333333] leading-[1.4]">僅支援人像，請勿上傳風景、動物等非人物圖片</p>
            </div>
            <div class="flex">
              <span class="text-sm text-[#333333] mr-2">•</span>
              <p class="text-sm text-[#333333] leading-[1.4]">照片人物請避免面部遮擋（如帶口罩、摀嘴等），保持五官清楚以免影響生成結果</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部按鈕區域 -->
    <div class="w-full max-w-[390px] px-4 mt-auto mb-8 flex justify-center">
      <button 
        class="w-[280px] h-[60px] bg-accent border-2 border-black rounded-lg font-poppins font-bold text-lg leading-normal text-[#333333] cursor-pointer transition-all duration-300 ease-in-out hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed" 
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

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Poppins:wght@700&display=swap');

.font-inter {
  font-family: 'Inter', sans-serif;
}

.font-poppins {
  font-family: 'Poppins', sans-serif;
}

@keyframes pulse {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 1; }
}
</style>
