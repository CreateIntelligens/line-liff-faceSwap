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
            class="flex h-[200px] flex-col items-center justify-center gap-5 gradient-border-dashed cursor-pointer transition-colors rounded-md"
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
                支援 JPG, PNG 格式
              </div>
            </div>
            <div v-else class="w-full h-full">
              <!-- 圖片預覽 -->
              <img
                :src="uploadedImagePreview"
                :alt="uploadedImage.name"
                class="w-full h-full object-contain rounded-md bg-gray-800"
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

        <!-- 求籤圖 -->
        <div class="flex justify-center items-center">
          <img
            :src="imageUrls.lots"
            alt="求籤"
            class="max-w-full h-auto object-contain"
          />
        </div>
      </div>

      <!-- 下一步按鈕 -->
      <div class="mt-auto flex flex-col items-center gap-4">
        <button
          class="cursor-pointer transition-all duration-300 hover:opacity-80"
          :class="canGenerate ? '' : 'opacity-50 cursor-not-allowed'"
          @click="generateFaceSwap"
          :disabled="!canGenerate"
        >
          <img
            :src="imageUrls.next"
            alt="下一步"
            class="w-full h-auto object-contain"
          />
        </button>
        <!-- 使用量計數器（可點擊跳轉到歷史） -->
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
            <!-- 文字圖片（在 GIF 上方） -->
            <div class="flex justify-center items-center w-full mb-4">
              <img
                :src="imageUrls.drawlotText"
                alt="新春好運，正在為你揭曉"
                class="w-full max-w-[90%] h-auto object-contain"
              />
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

// GIF 動畫顯示時間追蹤
const gifStartTime = ref(null);
const minGifDuration = 5000; // 最少顯示 5 秒（毫秒）
const taskStatusCheckInterval = ref(null);
const currentTaskId = ref(null);


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


function triggerFileUpload() {
  fileInput.value?.click();
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    uploadedImage.value = file;
    uploadedImagePreview.value = URL.createObjectURL(file);
  }
}

function handleDrop(event) {
  const files = event.dataTransfer.files;
  if (files.length > 0) {
    const file = files[0];
    if (file.type.startsWith("image/")) {
      uploadedImage.value = file;
      uploadedImagePreview.value = URL.createObjectURL(file);
    }
  }
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
  emit("back");
}

// 在顯示 GIF 動畫時檢查任務狀態
async function checkTaskStatusWhileShowingGif() {
  if (!currentTaskId.value) {
    console.error('❌ 沒有 taskId，無法檢查任務狀態');
    return;
  }
  
  // 清除之前的定時器（如果存在）
  if (taskStatusCheckInterval.value) {
    clearInterval(taskStatusCheckInterval.value);
  }
  
  // 每 2 秒檢查一次任務狀態
  taskStatusCheckInterval.value = setInterval(async () => {
    try {
      const result = await roadshowService.checkTaskStatus(currentTaskId.value);
      
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
        
        // 跳轉到結果頁面
        emit("generate", {
          uploadedImage: uploadedImage.value,
          taskId: currentTaskId.value
        });
        
        // 重置狀態
        gifStartTime.value = null;
        currentTaskId.value = null;
      } else if (isCompleted && !hasMinDuration) {
        // 任務已完成但還沒達到最少顯示時間，繼續等待
        const remainingTime = minGifDuration - elapsedTime;
        console.log(`⏳ 任務已完成，等待最少顯示時間（還需 ${Math.ceil(remainingTime / 1000)} 秒）`);
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
          }
          // 否則繼續輪詢
          return;
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
        
        alert(`生成失敗：${result.error.message || '任務處理失敗'}`);
      }
    } catch (error) {
      console.error('❌ 檢查任務狀態時發生錯誤:', error);
      // 發生錯誤時不立即停止，繼續輪詢（可能是網路問題）
    }
  }, 2000); // 每 2 秒檢查一次
}

async function generateFaceSwap() {
  // 檢查是否已加入好友（後端要求）
  if (!props.isFriend) {
    alert('請先加入官方帳號為好友，才能使用此功能。');
    return;
  }
  
  // 檢查是否已達上限（dev_user 不受限制）
  if (isAtLimit.value) {
    alert(`您已達到每人${appConfig.maxUsageLimit}張圖片的生成限制，無法繼續生成新圖片。\n\n是否要查看您的生成歷史？`);
    emit('showHistory');
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
      
      const result = await roadshowService.generateAvatar(formData);
      
      if (result && (result.success || result.status === 'success')) {
        // 生成請求成功後，立即通知父組件刷新使用量
        // 確保使用量數字及時更新，與服務器數據一致
        emit('refreshUsage');
        
        setTimeout(() => {
          showFirstDialog.value = false;
          showSecondDialog.value = true;
          setTimeout(() => {
            showSecondDialog.value = false;
            showThirdDialog.value = true;
            
            // 記錄 GIF 動畫開始顯示的時間
            gifStartTime.value = Date.now();
            // 保存 taskId 用於狀態檢查
            currentTaskId.value = result.result?.task_id || result.result?.id || result.task_id;
            
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
});
</script>
