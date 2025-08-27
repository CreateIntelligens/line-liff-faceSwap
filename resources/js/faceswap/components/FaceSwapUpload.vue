<template>
  <div
    class="relative mx-auto my-0 bg-[#333333] h-[774px] w-[375px] max-md:w-full max-md:max-w-screen-md max-sm:w-full max-sm:h-auto max-sm:min-h-[774px]"
  >
    <!-- Header -->
    <div
      class="flex gap-5 justify-center items-center px-5 py-6 font-bold border-b border-[#EBD8B2] min-h-20"
    >
      <div class="text-xl text-[#EBD8B2]">AI換臉</div>
      <UsageCounter :currentCount="userUsage" :maxLimit="10" />
    </div>
    <!-- 步驟 -->
    <div
      class="flex mt-8 max-w-full text-base font-bold text-center text-[#EBD8B2] whitespace-nowrap w-[202px] mx-auto"
    >
      <img
        :src="imageUrls.finish"
        class="w-6 h-6 object-contain"
        alt="Step 1"
      />
      <img
        :src="imageUrls.horizontal"
        class="object-contain shrink-0 my-auto aspect-[32.26] w-[65px]"
      />
      <img
        :src="imageUrls.step2_inprogress"
        class="w-6 h-6 object-contain"
        alt="Step 2"
      />
      <img
        :src="imageUrls.horizontal"
        class="object-contain shrink-0 my-auto aspect-[32.26] w-[65px]"
      />
      <img
        :src="imageUrls.step3_inactive"
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
        <div v-if="props.selectedTemplate" class="w-full h-[273px]">
          <img
            class="w-full h-full object-cover rounded-md"
            :src="getTemplateImage(props.selectedTemplate)"
            :alt="getTemplateName(props.selectedTemplate)"
          />
        </div>
        <div v-else class="w-full h-[273px] flex items-center justify-center bg-gray-700 rounded-md border-2 border-dashed border-[#EBD8B2]">
          <div class="text-center text-[#EBD8B2]">
            <div class="text-lg font-bold mb-2">請先選擇模板</div>
            <div class="text-sm">請回到上一步選擇您想要的換臉模板</div>
          </div>
        </div>
      </div>

      <!-- Character Selection -->
      <div v-if="props.selectedTemplate" class="mb-8">
        <h3 class="text-base font-bold text-center text-[#EBD8B2] mb-4">
          請選擇要換臉的人物
        </h3>
        <div class="flex justify-center gap-4">
          <button
            v-for="(character, index) in getTemplateCharacters()"
            :key="index"
            class="flex-1 h-11 px-3 py-3 justify-center items-center rounded-md cursor-pointer transition-all duration-300 text-base font-bold"
            :class="
              selectedCharacter === `character${index + 1}`
                ? 'bg-gradient-to-r from-[#EE95FF] via-[#F192FF] to-[#AFCBF7] shadow-lg text-gray-800'
                : 'bg-[#EBD8B2] text-[#333] hover:bg-[#d4c29a]'
            "
            @click="selectCharacter(`character${index + 1}`, index)"
          >
            {{ character }}
          </button>
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
                    :src="imageUrls.upload"
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
        <div v-else class="text-center text-[#EBD8B2] py-8">
          <div class="text-lg font-bold mb-4">無法進行換臉操作</div>
          <div class="text-sm mb-6">您需要先選擇一個模板才能繼續</div>
          <button
            class="px-6 py-3 bg-[#EBD8B2] text-[#333] rounded-md font-bold hover:bg-[#d4c29a] transition-colors"
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
  }
});

const emit = defineEmits(["back", "generate", "showHistory"]);

// 根據模板 ID 和角色選擇，返回正確的 face_index
const getFaceIndex = (templateId, characterId) => {
  if (templateId === 'play') {
    // 模板1 (綜藝玩很大)：吳宗憲在中間，face_index = 1
    // 0=左邊角色(不支援換臉), 1=中間吳宗憲(支援換臉), 2=右邊角色(不支援換臉)
    return 1;
  } else if (templateId === 'wife') {
    // 模板2 (犀利人妻)：3個人都支援換臉
    const wifeMapping = { 'character1': 0, 'character2': 1, 'character3': 2 };
    return wifeMapping[characterId] || 0;
  } else if (templateId === 'love') {
    // 模板3 (命中註定我愛你)：2個人都支援換臉
    const loveMapping = { 'character1': 0, 'character2': 1 };
    return loveMapping[characterId] || 0;
  } else if (templateId === 'super') {
    // 模板4 (超級夜總會)：3個人都支援換臉
    const superMapping = { 'character1': 0, 'character2': 1, 'character3': 2 };
    return superMapping[characterId] || 0;
  }
  
  // 預設值
  return 0;
};

// 模板對應的角色選項 - 只保留需要的 4 個模板
const templateCharacters = {
  'play': ['吳宗憲'],                    // 模板 10 (綜藝玩很大)：1個人
  'wife': ['朱芯儀', '溫昇豪', '隋棠'],  // 模板 8 (犀利人妻)：3個人
  'love': ['陳喬恩', '阮經天'],          // 模板 9 (命中註定我愛你)：2個人
  'super': ['許效舜', '苗可麗', '澎恰恰'] // 模板 11 (超級夜總會)：3個人
};

const selectedCharacter = ref("");
const uploadedImage = ref(null);
const uploadedImagePreview = ref(null);
const fileInput = ref(null);
const isGenerating = ref(false);
const showFirstDialog = ref(false);
const showSecondDialog = ref(false);


const canGenerate = computed(() => {
  return props.selectedTemplate && selectedCharacter.value && uploadedImage.value;
});

function selectCharacter(characterId, index) {
  selectedCharacter.value = characterId;
  console.log('👤 選擇角色:', characterId, '索引:', index);
}

function getTemplateCharacters() {
  const templateId = props.selectedTemplate;
  
  if (templateId && templateCharacters[templateId]) {
    return templateCharacters[templateId];
  }
  
  // 當沒有選擇模板時返回空陣列
  return [];
}

function getTemplateImage(templateKey) {
  const imageMap = {
    'play': imageUrls.play,   // 綜藝玩很大
    'wife': imageUrls.wife,   // 犀利人妻
    'love': imageUrls.love,   // 命中註定我愛你
    'super': imageUrls.super  // 超級夜總會
  };
  
  return imageMap[templateKey] || imageUrls.play;
}

function getTemplateName(templateId) {
  // 根據模板 ID 返回對應的名稱
  const nameMap = {
    'play': '綜藝玩很大',
    'wife': '犀利人妻',
    'love': '命中註定我愛你',
    'super': '超級夜總會'
  };
  
  return nameMap[templateId] || '';
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
      // 使用新的 getFaceIndex 函數獲取正確的 face_index
      const targetFaceIndex = getFaceIndex(props.selectedTemplate, selectedCharacter.value)
      
      // 準備FormData - 純粹的API調用，不改變UI
      const formData = new FormData();
              formData.append('userId', props.userId || 'abc'); // 使用傳入的用戶ID或後備值
      formData.append('file', uploadedImage.value);
      
      // 將字符串模板ID轉換為對應的數字ID (1,2,3,4)
      const templateIdMap = {
        'play': '1',     // 綜藝玩很大 → 模板 1
        'wife': '2',     // 犀利人妻 → 模板 2
        'love': '3',     // 命中註定我愛你 → 模板 3
        'super': '4'     // 超級夜總會 → 模板 4
      };
      const numericTemplateId = templateIdMap[props.selectedTemplate] || '1';
      formData.append('template_id', numericTemplateId);
      
      formData.append('target_face_index', targetFaceIndex); // 使用新的 getFaceIndex 函數獲取正確的 face_index
      formData.append('userInfo', `選擇的角色: ${selectedCharacter.value}`);
      
      // 調用API生成頭像
      const result = await roadshowService.generateAvatar(formData);
      
      if (result && (result.success || result.status === 'success')) {
        // 延遲一下再發送事件，讓用戶看到彈窗
        setTimeout(() => {
          showFirstDialog.value = false;
          showSecondDialog.value = true;
          setTimeout(() => {
            emit("generate", {
              selectedCharacter: selectedCharacter.value,
              uploadedImage: uploadedImage.value,
              taskId: result.result?.task_id || result.result?.id,
              selectedTemplate: props.selectedTemplate  // 添加選擇的模板ID
            });
          }, 1000);
        }, 1000);
      } else if (result && result.error) {
        // 處理特定錯誤狀態
        if (result.error.status === 403) {
          // 檢查是否是達到生成限制的錯誤
          const errorMessage = result.error.message || '';
          if (errorMessage.includes('生成限制') || errorMessage.includes('限制')) {
            throw new Error('您已達到每人10張圖片的生成限制，無法繼續生成新圖片');
          } else {
            throw new Error('權限不足，無法生成頭像');
          }
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
      
              // 檢查是否是達到生成限制的錯誤
        if (error.message.includes('生成限制')) {
          // 顯示達到限制的錯誤訊息，並提供查看歷史的選項
          if (confirm(`${error.message}\n\n是否要查看您的生成歷史？`)) {
            // 可以發送一個事件來顯示歷史
            emit('showHistory');
          }
        } else {
          // 其他錯誤使用alert
          alert(`生成失敗：${error.message}`);
        }
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
