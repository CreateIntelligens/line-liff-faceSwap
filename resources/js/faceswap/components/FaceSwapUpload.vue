<template>
  <div
    class="relative mx-auto my-0 bg-[#333333] h-[774px] w-[375px] max-md:w-full max-md:max-w-screen-md max-sm:w-full max-sm:h-auto max-sm:min-h-[774px]"
  >
    <!-- Header -->
    <div
      class="flex gap-5 justify-center items-center px-5 py-6 font-bold border-b border-[#EBD8B2] min-h-20"
    >
      <div class="text-xl text-[#EBD8B2]">AI換臉</div>
      <div
        class="flex justify-center items-center w-[114px] h-8 rounded-[50px] bg-[#EBD8B2]"
      >
        <div class="font-noto-sans-tc text-xs font-bold text-[#333]">
          剩餘次數：1/10
        </div>
      </div>
    </div>
    <!-- 步驟 -->
    <div
      class="flex mt-8 max-w-full text-base font-bold text-center text-[#EBD8B2] whitespace-nowrap w-[202px] mx-auto"
    >
      <img
        src="/images/finish.png"
        class="w-6 h-6 object-contain"
        alt="Step 1"
      />
      <img
        src="https://api.builder.io/api/v1/image/assets/TEMP/7f03c8a2d5652999b0cf2dc2c1710e475c7781ed?placeholderIfAbsent=true"
        class="object-contain shrink-0 my-auto aspect-[32.26] w-[65px]"
      />
      <img
        src="/images/step2_inprogress.png"
        class="w-6 h-6 object-contain"
        alt="Step 2"
      />
      <img
        src="https://api.builder.io/api/v1/image/assets/TEMP/7f03c8a2d5652999b0cf2dc2c1710e475c7781ed?placeholderIfAbsent=true"
        class="object-contain shrink-0 my-auto aspect-[32.26] w-[65px]"
      />
      <img
        src="/images/step3_inactive.png"
        class="w-6 h-6 object-contain"
        alt="Step 3"
      />
    </div>
    <!-- 步驟文字 -->
    <div
      class="flex gap-5 justify-between max-w-full text-sm text-center text-[#EBD8B2] w-[218px] mx-auto mb-8"
    >
      <div data-name="Step 1">Step 1</div>
      <div data-name="Step 2">Step 2</div>
      <div data-name="Step 3">Step 3</div>
    </div>

    <!-- Main Content Container -->
    <div class="flex-1 flex flex-col max-w-md mx-auto w-full px-5">
      <!-- Selected Template Image -->
      <div class="mb-8">
        <img
          class="w-full h-[273px] object-cover rounded-md"
          src="https://api.builder.io/api/v1/image/assets/TEMP/72a4ba69c4a69506758097a8499f30a9a6ccd914?width=666"
          alt="Selected template"
        />
      </div>

      <!-- Character Selection -->
      <div class="mb-8">
        <h3 class="text-base font-bold text-center text-[#EBD8B2] mb-4">
          請選擇要換臉的人物
        </h3>
        <div class="flex justify-center gap-4">
          <button
            class="flex-1 h-11 px-3 py-3 justify-center items-center rounded-md cursor-pointer transition-all duration-300 text-base font-bold"
            :class="
              selectedCharacter === 'character1'
                ? 'bg-gradient-to-r from-[#EE95FF] via-[#F192FF] to-[#AFCBF7] shadow-lg text-gray-800'
                : 'bg-[#EBD8B2] text-[#333] hover:bg-[#d4c29a]'
            "
            @click="selectCharacter('character1')"
          >
            朱芯儀
          </button>
          <button
            class="flex-1 h-11 px-3 py-3 justify-center items-center rounded-md cursor-pointer transition-all duration-300 text-base font-bold"
            :class="
              selectedCharacter === 'character2'
                ? 'bg-gradient-to-r from-[#EE95FF] via-[#F192FF] to-[#AFCBF7] shadow-lg text-gray-800'
                : 'bg-[#EBD8B2] text-[#333] hover:bg-[#d4c29a]'
            "
            @click="selectCharacter('character2')"
          >
            溫昇豪
          </button>
          <button
            class="flex-1 h-11 px-3 py-3 justify-center items-center rounded-md cursor-pointer transition-all duration-300 text-base font-bold"
            :class="
              selectedCharacter === 'character3'
                ? 'bg-gradient-to-r from-[#EE95FF] via-[#F192FF] to-[#AFCBF7] shadow-lg text-gray-800'
                : 'bg-[#EBD8B2] text-[#333] hover:bg-[#d4c29a]'
            "
            @click="selectCharacter('character3')"
          >
            隋棠
          </button>
        </div>
      </div>

      <!-- Upload Section -->
      <div class="flex-1">
        <div class="flex items-center gap-3 mb-6">
          <img
            src="/images/step2_inprogress.png"
            class="w-[26px] h-[26px] object-contain"
            alt="Step 2 In Progress"
          />
          <h3 class="text-base font-bold text-[#EBD8B2]">
            請上傳一張正面清晰的原始圖片
          </h3>
        </div>

        <!-- Upload Area -->
        <div class="mb-6">
          <div
            class="flex h-[200px] flex-col items-center justify-center gap-5 border-2 border-dashed border-[#EBD8B2] bg-[#969696] cursor-pointer hover:bg-[#a0a0a0] transition-colors rounded-md"
            @click="triggerFileUpload"
            @dragover.prevent
            @drop.prevent="handleDrop"
          >
            <div v-if="!uploadedImage" class="flex flex-col items-center gap-3">
              <!-- Upload Icon -->
              <div class="w-[50px] h-[35px] relative">
                <img
                  src="/images/upload.png"
                  alt="Upload Icon"
                  class="w-[50px] h-[35px] object-contain"
                />
              </div>
              <div class="text-base font-medium text-[#333] text-center">
                點擊上傳
              </div>
              <div class="text-sm font-medium text-[#333] text-center">
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
            class="flex-1 h-11 px-3 py-3 justify-center items-center rounded-md bg-[#EBD8B2] cursor-pointer hover:bg-[#d4c29a] transition-colors text-base font-bold text-[#333]"
            @click="goBack"
          >
            重選範本
          </button>
          <button
            class="flex-1 h-11 px-3 py-3 justify-center items-center rounded-md cursor-pointer transition-all duration-300 text-base font-bold"
            :class="
              canGenerate
                ? 'bg-gradient-to-r from-[#EE95FF] via-[#F192FF] via-[#B9B9FB] to-[#AFCBF7] hover:shadow-lg text-gray-800'
                : 'bg-[#C7C7C7] text-white'
            "
            @click="generateFaceSwap"
            :disabled="!canGenerate"
          >
            開始生成
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

const props = defineProps({
  selectedTemplate: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(["back", "generate"]);

// 人物選擇對應到 target_face_index
const characterToFaceIndex = {
  'character1': 0, // 朱芯儀
  'character2': 1, // 溫昇豪  
  'character3': 2  // 隋棠
};

const selectedCharacter = ref("");
const uploadedImage = ref(null);
const uploadedImagePreview = ref(null);
const fileInput = ref(null);
const isGenerating = ref(false);
const showFirstDialog = ref(false);
const showSecondDialog = ref(false);

const canGenerate = computed(() => {
  return selectedCharacter.value && uploadedImage.value;
});

function selectCharacter(characterId) {
  selectedCharacter.value = characterId;
}

function triggerFileUpload() {
  fileInput.value?.click();
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    uploadedImage.value = file;
    // 創建預覽URL
    uploadedImagePreview.value = URL.createObjectURL(file);
  }
}

function handleDrop(event) {
  const files = event.dataTransfer.files;
  if (files.length > 0) {
    const file = files[0];
    if (file.type.startsWith("image/")) {
      uploadedImage.value = file;
      // 創建預覽URL
      uploadedImagePreview.value = URL.createObjectURL(file);
    }
  }
}

function goBack() {
  // 清理預覽URL以避免內存洩漏
  if (uploadedImagePreview.value) {
    URL.revokeObjectURL(uploadedImagePreview.value);
    uploadedImagePreview.value = null;
  }
  uploadedImage.value = null;
  // 重置彈窗狀態
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
      console.log('🚀 開始生成頭像...');
      console.log('📋 選擇的模板:', props.selectedTemplate);
      console.log('👤 選擇的角色:', selectedCharacter.value);
      console.log('🎯 target_face_index:', characterToFaceIndex[selectedCharacter.value]);
      
      // 準備FormData - 純粹的API調用，不改變UI
      const formData = new FormData();
      formData.append('userId', 'abc'); // 使用你設定的用戶ID
      formData.append('file', uploadedImage.value);
      formData.append('template_id', props.selectedTemplate || 'template1'); // 使用選擇的模板ID
      formData.append('target_face_index', characterToFaceIndex[selectedCharacter.value] || 0); // 根據選擇的人物對應到face_index
      formData.append('userInfo', `選擇的角色: ${selectedCharacter.value}`);
      
      console.log('📤 發送API請求，FormData內容:');
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value);
      }
      
      // 調用API生成頭像
      const result = await roadshowService.generateAvatar(formData);
      
      if (result && result.success) {
        console.log('✅ 頭像生成任務已創建:', result);
        // 延遲一下再發送事件，讓用戶看到彈窗
        setTimeout(() => {
          showFirstDialog.value = false;
          showSecondDialog.value = true;
          setTimeout(() => {
            emit("generate", {
              selectedCharacter: selectedCharacter.value,
              uploadedImage: uploadedImage.value,
              taskId: result.result?.task_id
            });
          }, 1000);
        }, 1000);
      } else if (result && result.error) {
        // 處理特定錯誤狀態
        if (result.error.status === 403) {
          throw new Error('權限不足，無法生成頭像');
        } else if (result.error.status === 400) {
          throw new Error('請求格式錯誤，請檢查上傳的檔案');
        } else if (result.error.status !== 200) {
          throw new Error('生成失敗，請重新上傳');
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
      alert('生成失敗，請稍後再試');
    }
  }
}

// 組件卸載時清理預覽URL
onUnmounted(() => {
  if (uploadedImagePreview.value) {
    URL.revokeObjectURL(uploadedImagePreview.value);
  }
});
</script>

<style scoped>
/* 組件樣式 - 使用 Flexbox 佈局，無需額外的定位樣式 */
</style>
