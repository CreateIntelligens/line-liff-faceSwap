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
      class="flex gap-5 justify-center items-center self-stretch px-5 py-6 w-full font-bold whitespace-nowrap gradient-border-bottom min-h-20"
    >
      <div
        class="self-stretch my-auto"
        data-name="AI換臉"
      >
        <img
          :src="imageUrls.header1"
          class="h-16 object-contain"
          alt="AI換臉"
        />
      </div>
      <UsageCounter :currentCount="userUsage" />
    </div>
    <!-- 步驟 -->
    <div
      class="flex items-center mt-8 max-w-full text-base font-bold text-center text-[#FC7BBB] whitespace-nowrap w-[202px] mx-auto"
    >
      <img
        :src="imageUrls.finish"
        class="w-6 h-6 object-contain"
        alt="Step 1"
      />
      <img
        :src="imageUrls.horizontal"
        class="shrink-0 w-[65px] h-6 object-cover translate-y-2.5"
        alt="分隔線"
      />
      <img
        :src="imageUrls.step2_inprogress"
        class="w-6 h-6 object-contain"
        alt="Step 2"
      />
      <img
        :src="imageUrls.horizontal"
        class="shrink-0 w-[65px] h-6 object-cover translate-y-2.5"
        alt="分隔線"
      />
      <img
        :src="imageUrls.step3_inactive"
        class="w-6 h-6 object-contain"
        alt="Step 3"
      />
    </div>
    <!-- 步驟文字 -->
    <div
      class="flex gap-5 justify-between max-w-full text-sm text-center w-[218px] mx-auto mb-4"
    >
      <div class="step-gradient-text" data-name="Step 1">Step 1</div>
      <div class="step-gradient-text" data-name="Step 2">Step 2</div>
      <div class="step-gradient-text" data-name="Step 3">Step 3</div>
    </div>

    <!-- Main Content Container -->
    <div class="flex-1 flex flex-col max-w-md mx-auto w-full px-5">
      <!-- Selected Template Image -->
      <div class="mb-8">
        <div v-if="props.selectedTemplate" class="w-full h-[400px]">
          <img
            class="w-full h-full object-contain rounded-md"
            :src="getTemplateImage(props.selectedTemplate)"
            :alt="getTemplateName(props.selectedTemplate)"
          />
        </div>
        <div v-else class="w-full h-[400px] flex items-center justify-center bg-gray-700 rounded-md border-2 border-dashed border-[#FC7BBB]">
          <div class="text-center text-[#FC7BBB]">
            <div class="text-lg font-bold mb-2">請先選擇模板</div>
            <div class="text-sm">請回到上一步選擇您想要的換臉模板</div>
          </div>
        </div>
      </div>

      <!-- Upload Section -->
      <div class="flex-1">
        <div v-if="props.selectedTemplate">
          <div class="flex items-center gap-3 mb-6">
            <img
              :src="imageUrls.step2_inprogress"
              class="w-[26px] h-[26px] object-contain"
              alt="Step 2 In Progress"
            />
            <h3 class="text-base font-bold step-gradient-text">
              請上傳一張正面清晰的原始圖片
            </h3>
          </div>

          <!-- Upload Area -->
          <div class="mb-6">
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
                <div class="text-base font-medium cp-font step-gradient-text text-center">
                  點擊上傳
                </div>
                <div class="text-sm font-medium cp-font step-gradient-text text-center">
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
          <div class="mb-8">
            <h4 class="text-sm font-bold text-white mb-3">上傳注意事項：</h4>
            <div class="text-[13px] font-normal text-white space-y-2">
              <div>1.請上傳單人清晰正面照，避免多人合照，以利準確辨識</div>
              <div>2.僅支援人像照片，請勿上傳風景、動物或其他非人物圖片</div>
              <div>3.請確保臉部五官完整可見，避免口罩、手部、頭髮等遮擋</div>
              <div>4.避免模糊、晃動或低解析度圖片，以免影響生成品質</div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3 mb-8">
            <button
              class="flex-1 h-11 px-3 py-3 flex justify-center items-center rounded-md cursor-pointer transition-colors text-base font-bold cp-font text-[#0E0E0E]"
              style="background-color: #FFF3AB;"
              @click="goBack"
            >
              重選範本
            </button>
            <button
              class="flex-1 h-11 px-3 py-3 flex justify-center items-center rounded-md cursor-pointer transition-all duration-300 text-base font-bold hover:shadow-lg"
              style="background: linear-gradient(to bottom, #FFC1DE 0%, #FD79B5 100%);"
              :class="canGenerate ? '' : 'opacity-50 cursor-not-allowed'"
              @click="generateFaceSwap"
              :disabled="!canGenerate"
            >
              <div class="flex items-center gap-2">
                <img
                  :src="imageUrls.generateIcon"
                  class="w-5 h-5 object-contain"
                  alt="生成圖標"
                />
                <span class="cp-font text-[#0E0E0E]">開始生成</span>
              </div>
            </button>
          </div>
        </div>
        <div v-else class="text-center text-[#FC7BBB] py-8">
          <div class="text-lg font-bold mb-4">無法進行換臉操作</div>
          <div class="text-sm mb-6">您需要先選擇一個模板才能繼續</div>
          <button
            class="px-6 py-3 bg-[#FC7BBB] text-[#333] rounded-md font-bold hover:opacity-80 transition-colors"
            @click="goBack"
          >
            返回選擇模板
          </button>
        </div>
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
      class="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50"
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
  selectedTemplate: {
    type: String,
    default: ''
  },
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
  }
});

const emit = defineEmits(["back", "generate", "showHistory"]);

const uploadedImage = ref(null);
const uploadedImagePreview = ref(null);
const fileInput = ref(null);
const isGenerating = ref(false);
const showFirstDialog = ref(false);
const showSecondDialog = ref(false);


const canGenerate = computed(() => {
  return props.selectedTemplate && uploadedImage.value;
});

function getTemplateImage(templateKey) {
  const imageMap = {
    'a1art1': imageUrls.a1art1,
    'a1art2': imageUrls.a1art2,
    'a1art3': imageUrls.a1art3,
    'a1art4': imageUrls.a1art4
  };
  
  return imageMap[templateKey] || imageUrls.a1art1;
}

function getTemplateName(templateId) {
  return '';
}

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
  emit("back");
}

async function generateFaceSwap() {
  if (canGenerate.value) {
    isGenerating.value = true;
    showFirstDialog.value = true;
    
    try {
      const formData = new FormData();
      formData.append('userId', props.userId || 'abc');
      formData.append('userName', props.userName || props.userId || 'abc');
      const file = uploadedImage.value;
      if (file) {
        formData.append('file', file, file.name || 'upload.jpg');
      } else {
        throw new Error('請選擇要上傳的圖片');
      }
      
      const templateIdMap = {
        'a1art1': '0',
        'a1art2': '1',
        'a1art3': '2',
        'a1art4': '3'
      };
      const numericTemplateId = templateIdMap[props.selectedTemplate] || '0';
      formData.append('template_id', numericTemplateId);
      
      const result = await roadshowService.generateAvatar(formData);
      
      if (result && (result.success || result.status === 'success')) {
        setTimeout(() => {
          showFirstDialog.value = false;
          showSecondDialog.value = true;
          setTimeout(() => {
            emit("generate", {
              uploadedImage: uploadedImage.value,
              taskId: result.result?.task_id || result.result?.id || result.task_id,
              selectedTemplate: props.selectedTemplate
            });
          }, 1000);
        }, 1000);
      } else if (result && result.error) {
        const errorStatus = result.error.status;
        const errorMessage = result.error.message || '';
        
        if (errorStatus === 403) {
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
      
      if (error.message.includes('生成限制')) {
        if (confirm(`${error.message}\n\n是否要查看您的生成歷史？`)) {
          emit('showHistory');
        }
      } else {
        alert(`生成失敗：${error.message}`);
      }
    }
  }
}

onUnmounted(() => {
  if (uploadedImagePreview.value) {
    URL.revokeObjectURL(uploadedImagePreview.value);
  }
});
</script>
