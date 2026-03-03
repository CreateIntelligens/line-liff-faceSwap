<template>
  <div
    class="relative mx-auto my-0 w-[375px] max-md:w-full max-md:max-w-screen-md max-sm:w-full"
    :style="{ 
      minHeight: '100dvh',
      backgroundImage: `url(${imageUrls.background1})`, 
      backgroundSize: '100% 100%', 
      backgroundPosition: 'center center', 
      backgroundRepeat: 'no-repeat'
    }"
  >
    <!-- Header -->
    <div
      class="flex gap-5 justify-center items-center self-stretch py-6 w-full font-bold whitespace-nowrap min-h-20"
    >
      <div
        class="self-stretch my-auto"
        data-name="AI換臉"
      >
        <img
          :src="imageUrls.header1"
          class="h-30 object-contain"
          alt="AI換臉"
        />
      </div>
    </div>

    <!-- Main Content Container -->
    <div class="flex-1 flex flex-col max-w-md mx-auto w-full px-5 pb-8">
      <!-- 步驟一：上傳部分 -->
      <div class="mb-8">
        <div class="mb-4">
          <img
            :src="imageUrls.step1"
            class="w-full h-auto object-contain"
            alt="【步驟1】求籤前準備：呈上正面清晰照片"
          />
        </div>

        <!-- Upload Area -->
        <div class="mb-4">
          <div
            class="flex h-[200px] flex-col items-center justify-center gap-5 gradient-border-dashed cursor-pointer transition-colors rounded-md bg-transparent"
            @click="triggerFileUpload"
            @dragover.prevent
            @drop.prevent="handleDrop"
          >
            <div v-if="!uploadedImage" class="flex flex-col items-center gap-3">
              <!-- Upload Icon -->
              <div class="w-[50px] h-[35px] relative">
                <img
                  :src="imageUrls.upload"
                  alt="Upload Icon"
                  class="w-[50px] h-[35px] object-contain"
                />
              </div>
              <div class="text-base font-medium cp-font text-center" style="color: #E0BE91;">
                點擊上傳
              </div>
              <div class="text-sm font-medium cp-font text-center" style="color: #E0BE91;">
                支援png、jpg、jpeg格式
              </div>
              <div class="text-sm font-medium cp-font text-center" style="color: #E0BE91;">
                檔案限制10M以下
              </div>
            </div>
            <div v-else class="w-full h-full">
              <!-- 圖片預覽 -->
              <img
                :src="uploadedImagePreview"
                :alt="uploadedImage.name"
                class="w-full h-full object-contain rounded-md"
              />
            </div>
          </div>
        </div>

        <!-- Upload Instructions -->
        <div class="mb-6">
          <h4 class="text-sm font-bold text-white mb-3 cp-font">求籤須知：</h4>
          <div class="text-[13px] font-normal text-white space-y-2 cp-font">
            <div>1.上傳照片僅用於海報生成,不會改作他用</div>
            <div>2.請上傳清晰、光線充足的照片以獲得最佳效果</div>
            <div>3.建議上傳正面或半側面照片</div>
            <div>4.活動期間生成的海報將保留於個人帳戶中</div>
            <div>5.Fanpokka 保留活動最終解釋權</div>
          </div>
        </div>
      </div>

      <!-- 步驟二：閉眼默念新年願望 -->
      <div class="mb-8">
        <div class="mb-4">
          <img
            :src="imageUrls.step2"
            class="w-full h-auto object-contain"
            alt="【步驟2】抽取你的2026年運勢籤"
          />
        </div>
        
        <!-- 步驟二說明文字圖片 -->
        <div class="mb-4 flex justify-center">
          <img
            :src="imageUrls.step2Instructions"
            alt="閉上眼睛，默念你的新年願望。點擊下一步抽出靈籤"
            class="w-[90%] h-auto object-contain"
          />
        </div>

        <!-- 求籤圖（可點擊觸發生成） -->
        <div class="flex justify-center items-center">
          <img
            :src="imageUrls.lots"
            alt="求籤"
            :class="[
              'max-w-full h-auto object-contain transition-all duration-300',
              canGenerate ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed opacity-60'
            ]"
            @click="handleLotsClick"
          />
        </div>
      </div>

      <!-- 使用量計數器（可點擊跳轉到歷史） -->
      <div class="mt-auto flex flex-col items-center gap-4">
        <UsageCounter 
          :currentCount="userUsage" 
          @click="emit('showHistory')"
        />
      </div>
    </div>

    <!-- Hidden File Input -->
    <input
      ref="fileInput"
      type="file"
      accept="image/jpeg,image/jpg,image/png"
      class="hidden"
      @change="handleFileSelect"
    />

    <!-- 生成中彈窗 -->
    <div
      v-if="isGenerating"
      class="fixed inset-0 flex items-center justify-center z-50"
      :class="showThirdDialog ? '' : 'bg-white bg-opacity-50'"
    >
      <div class="flex flex-col items-center justify-center gap-4">
        <!-- 第一個彈窗：上傳中 -->
        <div
          v-if="showFirstDialog"
          class="bg-white rounded-md p-6 w-[202px] h-[116px] flex flex-col items-center justify-center gap-4"
        >
          <div class="text-lg font-bold text-gray-800">上傳中...</div>
          <div class="text-sm text-gray-600 text-center">請勿關閉視窗</div>
        </div>

        <!-- 第二個彈窗：生產進行中 -->
        <div
          v-if="showSecondDialog"
          class="bg-white rounded-md p-6 w-[288px] h-[116px] flex flex-col items-center justify-center gap-4"
        >
          <div class="text-lg font-bold text-gray-800">生產正在進行中！</div>
          <div class="text-sm text-gray-600 text-center">
            如使用人數眾多可能會花費較多時間，可以稍後再回來查看唷！
          </div>
        </div>

        <!-- 第三個彈窗：求籤畫面 -->
        <div
          v-if="showThirdDialog"
          class="relative mx-auto my-0 w-[375px] max-md:w-full max-md:max-w-screen-md max-sm:w-full"
          :style="{ 
            minHeight: '100dvh',
            backgroundImage: `url(${imageUrls.drawlotsbg})`, 
            backgroundSize: '100% 100%', 
            backgroundPosition: 'center center', 
            backgroundRepeat: 'no-repeat'
          }"
        >
          <!-- Header -->
          <div
            class="flex gap-5 justify-center items-center self-stretch py-6 w-full font-bold whitespace-nowrap min-h-20"
          >
            <div
              class="self-stretch my-auto"
              data-name="AI換臉"
            >
              <img
                :src="imageUrls.header1"
                class="h-30 object-contain"
                alt="AI換臉"
              />
            </div>
          </div>

          <!-- Main Content Container -->
          <div class="flex-1 flex flex-col max-w-md mx-auto w-full px-5 pb-8">
            <!-- 文字（在 GIF 上方） -->
            <div class="flex justify-center items-center w-full mb-4">
              <div class="text-center cp-font" style="color: #FCE7B1; font-size: 1.2rem;">
                新春好運，正在為你揭曉 <span class="sparkle-emoji">🧨</span><span class="typing-dots"><span class="dot">.</span><span class="dot">.</span><span class="dot">.</span></span>
              </div>
            </div>

            <!-- 中間籤筒 GIF -->
            <div class="flex-1 flex items-center justify-center w-full">
              <img
                :src="imageUrls.drawlot"
                alt="求籤動畫"
                class="w-full max-w-[400px] h-auto object-contain"
              />
            </div>

            <!-- 底部使用量計數器 -->
            <div class="mt-auto flex flex-col items-center gap-4 pb-8">
              <UsageCounter 
                :currentCount="userUsage" 
                @click="emit('showHistory')"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 服務關閉警告模態框 -->
    <div
      v-if="showServiceClosedModal"
      class="fixed inset-0 flex items-center justify-center z-50 bg-white bg-opacity-50"
      @click.self="closeServiceClosedModal"
    >
      <div class="bg-white rounded-md p-6 w-[320px] max-w-[90%] flex flex-col items-center justify-center gap-4">
        <!-- 警告訊息內容 -->
        <div class="flex flex-col items-center gap-3 text-center">
          <div class="text-lg font-bold text-gray-800 cp-font">
            感謝大家熱烈支持~
          </div>
          <div class="text-base font-medium text-gray-800 cp-font">
            活動太受歡迎提前截止!
          </div>
          <div class="text-base font-medium text-gray-800 cp-font">
            歡迎關注<span class="font-bold">【Fanpokka 粉絲通行證】</span>
          </div>
          <div class="text-base font-medium text-gray-800 cp-font">
            獲取更多活動資訊,期待下次再相見!
          </div>
        </div>
        
        <!-- 取消按鈕 -->
        <button
          @click="closeServiceClosedModal"
          class="mt-2 px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800 font-medium transition-colors cp-font"
        >
          確定
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { onUnmounted } from "vue";
import { roadshowService } from "../../services/roadshowService.js";
import UsageCounter from "./UsageCounter.vue";
import { imageUrls } from '@/config/imageUrls'
import { appConfig } from '@/config/appConfig'

const props = defineProps({
  userUsage: {
    type: Number,
    default: 0
  },
  userId: {
    type: String,
    default: ''
  },
  userName: {
    type: String,
    default: ''
  },
  isFriend: {
    type: Boolean,
    default: true
  },
  userInfo: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(["back", "generate", "showHistory", "refreshUsage"]);

const uploadedImage = ref(null);
const uploadedImagePreview = ref(null);
const fileInput = ref(null);
const isGenerating = ref(false);
const showFirstDialog = ref(false);
const showSecondDialog = ref(false);
const showThirdDialog = ref(false);
const showServiceClosedModal = ref(false);

// GIF 動畫顯示時間追蹤
const gifStartTime = ref(null);
const minGifDuration = 7000; // 最少顯示 5 秒（毫秒）
const taskStatusCheckInterval = ref(null);
const currentTaskId = ref(null);
const hasShownFailedAlert = ref(false); // 防止重複顯示失敗訊息


// 檢查是否為 dev_user（不受限制）
const isDevUser = computed(() => {
  return props.userId && props.userId.startsWith('dev_user_')
})

const canGenerate = computed(() => {
  // 檢查是否已上傳圖片
  const hasImage = uploadedImage.value;
  // 檢查是否未達到使用量上限（dev_user 不受限制）
  const underLimit = isDevUser.value || props.userUsage < appConfig.maxUsageLimit;
  // 檢查是否正在生成中（防止重複點擊）
  const notGenerating = !isGenerating.value;
  
  return hasImage && underLimit && notGenerating;
});

// 計算是否已達上限（dev_user 不受限制）
const isAtLimit = computed(() => {
  return !isDevUser.value && props.userUsage >= appConfig.maxUsageLimit;
});

// 檢查服務是否已關閉
const isServiceClosed = computed(() => {
  if (typeof window === 'undefined' || !window.endpoint) {
    return false;
  }
  const isClosed = window.endpoint.isClosed;
  // 處理字串 'true'/'false' 或布林值
  if (typeof isClosed === 'string') {
    return isClosed === 'true';
  }
  return Boolean(isClosed);
});

// 檔案大小和格式限制
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

// 驗證檔案格式和大小
function validateFile(file) {
  // 檢查檔案格式
  if (!ALLOWED_TYPES.includes(file.type)) {
    alert('不支援的檔案格式，請上傳 png、jpg 或 jpeg 格式的圖片');
    return false;
  }
  
  // 檢查檔案大小
  if (file.size > MAX_FILE_SIZE) {
    alert('檔案大小超過10M，請選擇較小的檔案');
    return false;
  }
  
  return true;
}

function triggerFileUpload() {
  fileInput.value?.click();
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    // 驗證檔案格式和大小
    if (!validateFile(file)) {
      // 清除檔案輸入
      if (event.target) {
        event.target.value = '';
      }
      return;
    }
    uploadedImage.value = file;
    uploadedImagePreview.value = URL.createObjectURL(file);
  }
}

function handleDrop(event) {
  const files = event.dataTransfer.files;
  if (files.length > 0) {
    const file = files[0];
    // 驗證檔案格式和大小（明確檢查 png、jpg、jpeg）
    if (!validateFile(file)) {
      return;
    }
    uploadedImage.value = file;
    uploadedImagePreview.value = URL.createObjectURL(file);
  }
}

// 處理求籤圖點擊事件
function handleLotsClick() {
  // 優先檢查服務是否已關閉
  if (isServiceClosed.value) {
    showServiceClosedModal.value = true;
    return;
  }
  
  // 檢查是否可以生成
  if (!canGenerate.value) {
    // 如果已達限制，顯示提示訊息
    if (isAtLimit.value) {
      alert('已達個人生成上限，感謝您的參與')
    }
    return;
  }
  // 觸發生成流程
  generateFaceSwap();
}

// 關閉服務關閉警告模態框
function closeServiceClosedModal() {
  showServiceClosedModal.value = false;
}

function goBack() {
  if (uploadedImagePreview.value) {
    URL.revokeObjectURL(uploadedImagePreview.value);
    uploadedImagePreview.value = null;
  }
  uploadedImage.value = null;
  isGenerating.value = false;
  showFirstDialog.value = false;
  showSecondDialog.value = false;
  showThirdDialog.value = false;
  // 清理定時器
  if (taskStatusCheckInterval.value) {
    clearInterval(taskStatusCheckInterval.value);
    taskStatusCheckInterval.value = null;
  }
  gifStartTime.value = null;
  currentTaskId.value = null;
  hasShownFailedAlert.value = false;
  emit("back");
}

// 執行單次任務狀態檢查
async function performSingleStatusCheck() {
  if (!currentTaskId.value) {
    console.error('❌ 沒有 taskId，無法檢查任務狀態');
    return null;
  }
  
  try {
    const result = await roadshowService.checkTaskStatus(currentTaskId.value);
    
    // 檢查任務狀態是否為 failed
    const isFailed = result && (
      result.status === 'failed' || 
      result.result?.status === 'failed' ||
      (result.originalResponse && result.originalResponse.result?.status === 'failed')
    );
    
    // 如果任務失敗，立即停止
    if (isFailed) {
      console.error('❌ 任務狀態為 failed，停止生成流程');
      
      // 清除定時器
      if (taskStatusCheckInterval.value) {
        clearInterval(taskStatusCheckInterval.value);
        taskStatusCheckInterval.value = null;
      }
      
      // 重置狀態
      isGenerating.value = false;
      showFirstDialog.value = false;
      showSecondDialog.value = false;
      showThirdDialog.value = false;
      gifStartTime.value = null;
      currentTaskId.value = null;
      
      // 只顯示一次錯誤訊息
      if (!hasShownFailedAlert.value) {
        hasShownFailedAlert.value = true;
        alert('生成失敗：任務處理失敗，請稍後再試');
        // 延遲重置標記，確保不會重複顯示
        setTimeout(() => {
          hasShownFailedAlert.value = false;
        }, 1000);
      }
      
      return { shouldStop: true };
    }
    
    // 檢查任務是否完成
    const isCompleted = result && 
                        (result.success !== false) && 
                        result.status === 'completed';
    
    // 計算已顯示時間
    const elapsedTime = gifStartTime.value ? Date.now() - gifStartTime.value : 0;
    const hasMinDuration = elapsedTime >= minGifDuration;
    
    // 如果任務完成且已達到最少顯示時間，則跳轉
    if (isCompleted && hasMinDuration) {
      // 清除定時器
      if (taskStatusCheckInterval.value) {
        clearInterval(taskStatusCheckInterval.value);
        taskStatusCheckInterval.value = null;
      }
      
      // 任務真正完成後才刷新使用量
      emit('refreshUsage');
      
      // 跳轉到結果頁面
      emit("generate", {
        uploadedImage: uploadedImage.value,
        taskId: currentTaskId.value
      });
      
      // 重置狀態
      gifStartTime.value = null;
      currentTaskId.value = null;
      hasShownFailedAlert.value = false;
      return { shouldStop: true };
    } else if (isCompleted && !hasMinDuration) {
      // 任務已完成但還沒達到最少顯示時間，繼續等待
      const remainingTime = minGifDuration - elapsedTime;
      console.log(`⏳ 任務已完成，等待最少顯示時間（還需 ${Math.ceil(remainingTime / 1000)} 秒）`);
      return { shouldStop: false };
    } else if (result && result.error) {
      const errorStatus = result.error.status || 0;
      
      // 如果是 500 錯誤，可能是暫時的服務器問題，繼續輪詢
      if (errorStatus === 500) {
        console.warn('⚠️ 檢查任務狀態返回 500 錯誤，可能是暫時的服務器問題，繼續輪詢...');
        
        // 如果已經顯示了足夠長的時間（10 秒），即使檢查失敗也跳轉到結果頁面
        // 讓結果頁面自己處理（可能會從歷史紀錄中獲取）
        if (elapsedTime >= 10000) {
          console.log('⏰ 已顯示足夠時間，即使檢查失敗也跳轉到結果頁面');
          if (taskStatusCheckInterval.value) {
            clearInterval(taskStatusCheckInterval.value);
            taskStatusCheckInterval.value = null;
          }
          
          emit("generate", {
            uploadedImage: uploadedImage.value,
            taskId: currentTaskId.value
          });
          
          gifStartTime.value = null;
          currentTaskId.value = null;
          return { shouldStop: true };
        }
        // 否則繼續輪詢
        return { shouldStop: false };
      }
      
      // 其他錯誤（400, 404 等），可能是任務真的失敗了
      console.error('❌ 任務狀態檢查失敗:', result.error);
      if (taskStatusCheckInterval.value) {
        clearInterval(taskStatusCheckInterval.value);
        taskStatusCheckInterval.value = null;
      }
      
      // 重置狀態
      isGenerating.value = false;
      showFirstDialog.value = false;
      showSecondDialog.value = false;
      showThirdDialog.value = false;
      gifStartTime.value = null;
      currentTaskId.value = null;
      
      // 只顯示一次錯誤訊息
      if (!hasShownFailedAlert.value) {
        hasShownFailedAlert.value = true;
        alert(`生成失敗：${result.error.message || '任務處理失敗'}`);
        setTimeout(() => {
          hasShownFailedAlert.value = false;
        }, 1000);
      }
      
      return { shouldStop: true };
    }
    
    return { shouldStop: false };
  } catch (error) {
    console.error('❌ 檢查任務狀態時發生錯誤:', error);
    // 發生錯誤時不立即停止，繼續輪詢（可能是網路問題）
    return { shouldStop: false };
  }
}

// 在顯示 GIF 動畫時檢查任務狀態
async function checkTaskStatusWhileShowingGif() {
  if (!currentTaskId.value) {
    console.error('❌ 沒有 taskId，無法檢查任務狀態');
    return;
  }
  
  // 重置失敗標記（開始新的檢查流程）
  hasShownFailedAlert.value = false;
  
  // 清除之前的定時器（如果存在）
  if (taskStatusCheckInterval.value) {
    clearInterval(taskStatusCheckInterval.value);
  }
  
  // 立即執行一次檢查（不等待 2 秒）
  const firstCheckResult = await performSingleStatusCheck();
  if (firstCheckResult && firstCheckResult.shouldStop) {
    return; // 如果第一次檢查就完成了，不需要設置定時器
  }
  
  // 每 2 秒檢查一次任務狀態
  taskStatusCheckInterval.value = setInterval(async () => {
    const checkResult = await performSingleStatusCheck();
    if (checkResult && checkResult.shouldStop) {
      // 如果檢查結果要求停止，清除定時器
      if (taskStatusCheckInterval.value) {
        clearInterval(taskStatusCheckInterval.value);
        taskStatusCheckInterval.value = null;
      }
    }
  }, 2000); // 每 2 秒檢查一次
}

async function generateFaceSwap() {
  // 優先檢查服務是否已關閉（雙重保護）
  if (isServiceClosed.value) {
    showServiceClosedModal.value = true;
    return;
  }
  
  // 檢查是否已達上限（dev_user 不受限制）- 在函數開頭立即檢查
  if (isAtLimit.value) {
    alert('已達個人生成上限，感謝您的參與')
    return;
  }
  
  if (!canGenerate.value) {
    return;
  }
  
  // 立即設置生成狀態，防止重複點擊
  isGenerating.value = true;
  showFirstDialog.value = true;
  
  try {
      const formData = new FormData();
      formData.append('userId', props.userId || 'abc');
      const file = uploadedImage.value;
      if (file) {
        formData.append('file', file, file.name || 'upload.jpg');
      } else {
        throw new Error('請選擇要上傳的圖片');
      }
      
      // Email 模式：加入表單資料（name, company, phone）
      if (props.userInfo && props.userInfo.name && props.userInfo.company && props.userInfo.phone) {
        formData.append('name', props.userInfo.name);
        formData.append('company', props.userInfo.company);
        formData.append('phone', props.userInfo.phone);
        console.log('📧 Email 模式：已加入表單資料到 FormData:', {
          name: props.userInfo.name,
          company: props.userInfo.company,
          phone: props.userInfo.phone
        });
      } else if (props.userId && props.userId.includes('@')) {
        // Email 模式但沒有 userInfo，嘗試從 sessionStorage 讀取
        const savedUserInfo = sessionStorage.getItem('faceswap_userInfo');
        if (savedUserInfo) {
          try {
            const userInfo = JSON.parse(savedUserInfo);
            if (userInfo.name && userInfo.company && userInfo.phone) {
              formData.append('name', userInfo.name);
              formData.append('company', userInfo.company);
              formData.append('phone', userInfo.phone);
              console.log('📧 Email 模式：從 sessionStorage 讀取並加入表單資料:', userInfo);
            }
          } catch (e) {
            console.warn('⚠️ 無法解析 sessionStorage 中的用戶資訊:', e);
          }
        }
      }
      
      // 👉 除錯用：在手機上直接顯示目前要送到後端的參數
      try {
        const debugInfo = [
          `userId: ${formData.get('userId')}`,
          `hasFile: ${formData.has('file')}`,
          `name: ${formData.get('name') || '(無)'}`,
          `company: ${formData.get('company') || '(無)'}`,
          `phone: ${formData.get('phone') || '(無)'}`
        ].join('\n');
        alert(`即將送出的生成參數：\n${debugInfo}`);
      } catch (e) {
        // alert 失敗就忽略，不影響正常流程
      }
      
      const result = await roadshowService.generateAvatar(formData);
      
      if (result && (result.success || result.status === 'success')) {
        // 重置失敗標記
        hasShownFailedAlert.value = false;
        
        // 保存 taskId 用於狀態檢查
        // 注意：不在這裡刷新使用量，等任務真正完成（status === 'completed'）時才刷新
        currentTaskId.value = result.result?.task_id || result.result?.id || result.task_id;
        
        // 立即調用一次 check status API
        if (currentTaskId.value) {
          try {
            const statusResult = await roadshowService.checkTaskStatus(currentTaskId.value);
            console.log('📥 立即檢查任務狀態結果:', statusResult);
            
            // 如果任務已經完成，可以直接跳轉（但還是要顯示動畫）
            const isCompleted = statusResult && 
                                (statusResult.success !== false) && 
                                statusResult.status === 'completed';
            
            if (isCompleted) {
              console.log('✅ 任務已完成，將在顯示動畫後跳轉');
            }
          } catch (error) {
            console.warn('⚠️ 立即檢查任務狀態失敗，將繼續輪詢:', error);
          }
        }
        
        setTimeout(() => {
          showFirstDialog.value = false;
          showSecondDialog.value = true;
          setTimeout(() => {
            showSecondDialog.value = false;
            showThirdDialog.value = true;
            
            // 記錄 GIF 動畫開始顯示的時間
            gifStartTime.value = Date.now();
            
            // 開始輪詢檢查任務狀態
            checkTaskStatusWhileShowingGif();
          }, 1000);
        }, 1000);
      } else if (result && result.error) {
        const errorStatus = result.error.status;
        const errorMessage = result.error.message || '';
        
        if (errorStatus === 403) {
          // 當後端返回 403 時，強制刷新使用量以確保介面同步（處理併發場景）
          emit('refreshUsage');
          
          if (errorMessage.includes('生成限制') || errorMessage.includes('限制')) {
            throw new Error(`您已達到每人${appConfig.maxUsageLimit}張圖片的生成限制，無法繼續生成新圖片`);
          } else {
            throw new Error('權限不足，無法生成頭像');
          }
        } else if (errorStatus === 400) {
          if (errorMessage.includes('user id') || errorMessage.includes('用戶') || errorMessage.includes('無效')) {
            throw new Error(`用戶 ID 錯誤：${errorMessage}。請確保在 LINE 環境中使用真實的用戶 ID。`);
          } else if (errorMessage) {
            throw new Error(errorMessage);
          } else {
            throw new Error('請求格式錯誤，請檢查上傳的檔案');
          }
        } else if (errorStatus !== 200) {
          if (errorMessage) {
            throw new Error(errorMessage);
          } else {
            throw new Error('生成失敗，請重新上傳');
          }
        } else {
          throw new Error('生成失敗');
        }
      } else {
        throw new Error('生成失敗');
      }
    } catch (error) {
      console.error('❌ 生成頭像失敗:', error);
      isGenerating.value = false;
      showFirstDialog.value = false;
      showSecondDialog.value = false;
      showThirdDialog.value = false;
      
      // 清理定時器
      if (taskStatusCheckInterval.value) {
        clearInterval(taskStatusCheckInterval.value);
        taskStatusCheckInterval.value = null;
      }
      gifStartTime.value = null;
      currentTaskId.value = null;
      hasShownFailedAlert.value = false;
      
      if (error.message.includes('生成限制')) {
        // 再次刷新使用量以確保數據同步
        emit('refreshUsage');
        if (confirm(`${error.message}\n\n是否要查看您的生成歷史？`)) {
          emit('showHistory');
        }
      } else {
        alert(`生成失敗：${error.message}`);
      }
    }
}

onUnmounted(() => {
  if (uploadedImagePreview.value) {
    URL.revokeObjectURL(uploadedImagePreview.value);
  }
  
  // 清理定時器
  if (taskStatusCheckInterval.value) {
    clearInterval(taskStatusCheckInterval.value);
    taskStatusCheckInterval.value = null;
  }
  
  // 重置狀態
  gifStartTime.value = null;
  currentTaskId.value = null;
  hasShownFailedAlert.value = false;
});
</script>

<style scoped>
/* 鞭炮 emoji 動畫效果選項 */

/* 選項 1: 閃爍震動效果（當前使用） */
@keyframes sparkle-shake {
  0%, 100% {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
  10% {
    transform: translateX(-3px) scale(1.15);
    opacity: 0.9;
  }
  20% {
    transform: translateX(3px) scale(1.15);
    opacity: 1;
  }
  30% {
    transform: translateX(-2px) scale(1.1);
    opacity: 0.95;
  }
  40% {
    transform: translateX(2px) scale(1.1);
    opacity: 1;
  }
  50% {
    transform: translateX(0) scale(1.2);
    opacity: 1;
  }
  60% {
    transform: translateX(-2px) scale(1.1);
    opacity: 0.95;
  }
  70% {
    transform: translateX(2px) scale(1.1);
    opacity: 1;
  }
  80% {
    transform: translateX(-3px) scale(1.15);
    opacity: 0.9;
  }
  90% {
    transform: translateX(3px) scale(1.15);
    opacity: 1;
  }
}

/* 選項 2: 快速旋轉閃爍 */
@keyframes sparkle-spin {
  0% {
    transform: rotate(0deg) scale(1);
    opacity: 1;
  }
  25% {
    transform: rotate(90deg) scale(1.2);
    opacity: 0.8;
  }
  50% {
    transform: rotate(180deg) scale(1.3);
    opacity: 1;
  }
  75% {
    transform: rotate(270deg) scale(1.2);
    opacity: 0.8;
  }
  100% {
    transform: rotate(360deg) scale(1);
    opacity: 1;
  }
}

/* 選項 3: 脈衝放大效果 */
@keyframes sparkle-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  25% {
    transform: scale(1.3);
    opacity: 0.9;
  }
  50% {
    transform: scale(1.4);
    opacity: 1;
  }
  75% {
    transform: scale(1.3);
    opacity: 0.9;
  }
}

/* 選項 4: 單純縮放效果 */
@keyframes sparkle-bounce {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

/* 選項 5: 搖擺效果 */
@keyframes sparkle-swing {
  0%, 100% {
    transform: rotate(0deg) scale(1);
  }
  25% {
    transform: rotate(-15deg) scale(1.15);
  }
  50% {
    transform: rotate(0deg) scale(1.2);
  }
  75% {
    transform: rotate(15deg) scale(1.15);
  }
}

.sparkle-emoji {
  display: inline-block;
  /* 當前使用：上下跳動 + 閃爍 + 縮放 */
  animation: sparkle-bounce 0.8s infinite;
  
  /* 其他選項（註解掉，需要時取消註解）：
  animation: sparkle-shake 0.6s ease-in-out infinite;  // 閃爍震動效果
  animation: sparkle-spin 1s linear infinite;          // 快速旋轉閃爍
  animation: sparkle-pulse 1s ease-in-out infinite;    // 脈衝放大效果
  animation: sparkle-swing 1s ease-in-out infinite;   // 搖擺效果
  */
}

/* 省略號打字機動畫 - 從沒有點開始，逐個累積顯示：無點 → 一點 → 兩點 → 三點 → 循環 */
.typing-dots {
  display: inline-block;
  margin-left: 2px;
}

.typing-dots .dot {
  display: inline-block;
  opacity: 0;
}

/* 第一個點：0-25% 隱藏，25-100% 顯示，100% 重置 */
.typing-dots .dot:nth-child(1) {
  animation: typing-dot-1 1.5s infinite;
}

/* 第二個點：0-50% 隱藏，50-100% 顯示，100% 重置 */
.typing-dots .dot:nth-child(2) {
  animation: typing-dot-2 1.5s infinite;
}

/* 第三個點：0-75% 隱藏，75-100% 顯示，100% 重置 */
.typing-dots .dot:nth-child(3) {
  animation: typing-dot-3 1.5s infinite;
}

@keyframes typing-dot-1 {
  0% {
    opacity: 0;
  }
  25% {
    opacity: 0;
  }
  25.1% {
    opacity: 1;
  }
  99.9% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@keyframes typing-dot-2 {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 0;
  }
  50.1% {
    opacity: 1;
  }
  99.9% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@keyframes typing-dot-3 {
  0% {
    opacity: 0;
  }
  75% {
    opacity: 0;
  }
  75.1% {
    opacity: 1;
  }
  99.9% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>
