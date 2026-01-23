<template>
      <!-- History Page -->
    <FaceSwapHistory 
      v-if="showHistoryPage" 
      :userId="props.userId"
      :userUsage="userUsage"
      @back="showHistoryPage = false"
    />
  
  <!-- Main Template Selection Page -->
  <div
    v-if="!showHistoryPage"
    class="relative mx-auto my-0 w-[375px] max-md:w-full max-md:max-w-screen-md max-sm:w-full flex flex-col overflow-y-auto"
    data-name="換臉_橫式範本"
    :style="{ 
      minHeight: '100dvh',
      backgroundImage: `url(${imageUrls.background1})`, 
      backgroundSize: '100% 100%', 
      backgroundPosition: 'center center', 
      backgroundRepeat: 'no-repeat'
    }"
  >
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
      class="flex items-center mt-8 max-w-full text-base font-bold text-center text-[#EBD8B2] whitespace-nowrap w-[202px] mx-auto"
    >
      <img
        :src="imageUrls.step1"
        class="w-6 h-6 object-contain"
        alt="Step 1"
      />
      <img
        :src="imageUrls.horizontal"
        class="shrink-0 w-[65px] h-6 object-cover translate-y-2.5"
        alt="分隔線"
      />
      <img
        :src="imageUrls.step2_inactive"
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
      class="flex gap-5 justify-between max-w-full text-sm text-center w-[218px] mx-auto"
    >
      <div class="step-gradient-text" data-name="Step 1">Step 1</div>
      <div class="step-gradient-text" data-name="Step 2">Step 2</div>
      <div class="step-gradient-text" data-name="Step 3">Step 3</div>
    </div>
    <div class="mt-6 w-full max-w-[338px] mx-auto flex-1 pb-8">
      <div class="flex flex-col w-full">
        <div class="flex flex-col w-full">
          <div
            class="flex gap-2.5 items-center justify-center font-bold text-center whitespace-nowrap"
          >
            <div
              class="self-stretch my-auto text-lg text-[#333333] w-6 h-6"
            >
              <img
                :src="imageUrls.step1"
                class="w-6 h-6 object-contain"
                alt="Step 1"
              />
            </div>
            <div
              class="self-stretch my-auto text-base step-gradient-text"
              data-name="請選擇以下IP圖片範本（請點擊圖片）"
            >
              請選擇以下IP圖片範本（請點擊圖片）
            </div>
          </div>
          <div class="mt-9 w-full">
            <div class="grid grid-cols-2 gap-3">
              <!-- 模板 1 -->
              <div
                class="cursor-pointer rounded-md transition-all duration-200 hover:scale-105 relative"
                :class="{
                  'gradient-ring': selectedTemplate === 'a1art1',
                }"
                @click="selectTemplate('a1art1')"
              >
                <img
                  :src="imageUrls.a1art1"
                  alt="模板 1"
                  class="w-full object-cover rounded-md"
                />
              </div>
              
              <!-- 模板 2 -->
              <div
                class="cursor-pointer rounded-md transition-all duration-200 hover:scale-105 relative"
                :class="{
                  'gradient-ring': selectedTemplate === 'a1art2',
                }"
                @click="selectTemplate('a1art2')"
              >
                <img
                  :src="imageUrls.a1art2"
                  alt="模板 2"
                  class="w-full object-cover rounded-md"
                />
              </div>
              
              <!-- 模板 3 -->
              <div
                class="cursor-pointer rounded-md transition-all duration-200 hover:scale-105 relative"
                :class="{
                  'gradient-ring': selectedTemplate === 'a1art3',
                }"
                @click="selectTemplate('a1art3')"
              >
                <img
                  :src="imageUrls.a1art3"
                  alt="模板 3"
                  class="w-full object-cover rounded-md"
                />
              </div>
              
              <!-- 模板 4 -->
              <div
                class="cursor-pointer rounded-md transition-all duration-200 hover:scale-105 relative"
                :class="{
                  'gradient-ring': selectedTemplate === 'a1art4',
                }"
                @click="selectTemplate('a1art4')"
              >
                <img
                  :src="imageUrls.a1art4"
                  alt="模板 4"
                  class="w-full object-cover rounded-md"
                />
              </div>
            </div>
          </div>
        </div>
        <div
          class="self-end mt-16 w-full text-base font-bold whitespace-nowrap rounded-md max-w-[336px]"
        >
          <div
            class="flex gap-5 justify-center items-center px-36 py-3.5 rounded-md min-h-11 cursor-pointer transition-all duration-300 hover:shadow-lg"
            :style="isAtLimit ? 'background-color: #666666;' : 'background: linear-gradient(to bottom, #FFC1DE 0%, #FD79B5 100%);'"
            :class="(selectedTemplate && !isAtLimit) ? '' : 'opacity-50 cursor-not-allowed'"
            @click="nextStep"
          >
            <div class="self-stretch my-auto cp-font text-[#0E0E0E]" data-name="下一步">
              {{ isAtLimit ? '已達使用上限' : '下一步' }}
            </div>
          </div>
        </div>
      </div>
      <div
        class="mt-9 text-base font-bold text-center step-gradient-text cursor-pointer transition-colors"
        data-name="圖片生成紀錄"
        @click="showHistory"
      >
        圖片生成紀錄
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { roadshowService } from "../../services/roadshowService.js";
import FaceSwapHistory from "./FaceSwapHistory.vue";
import UsageCounter from "./UsageCounter.vue";
import { imageUrls } from "@/config/imageUrls";
import { appConfig } from '@/config/appConfig'

const props = defineProps({
  userUsage: {
    type: Number,
    default: 0
  },
  userId: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(["next-step", "back"]);

const selectedTemplate = ref("");
const showHistoryPage = ref(false);
const templates = ref({});

// 檢查是否為 dev_user（不受限制）
const isDevUser = computed(() => {
  return props.userId && props.userId.startsWith('dev_user_')
})

// 計算是否已達使用量上限（dev_user 不受限制）
const isAtLimit = computed(() => {
  return !isDevUser.value && props.userUsage >= appConfig.maxUsageLimit;
});

// 在組件掛載時獲取模板列表
onMounted(async () => {
  try {
    console.log('🔍 嘗試獲取模板列表...');
    const result = await roadshowService.getTemplates();
    if (result && result.success) {
      console.log('✅ 模板列表獲取成功:', result.templates);
      templates.value = result.templates;
      // 使用 API 返回的真實模板數據
    } else {
      console.log('⚠️ API調用失敗，使用預設模板佈局');
    }
  } catch (error) {
    console.log('⚠️ 使用預設模板佈局，錯誤:', error.message);
  }
});

function selectTemplate(templateId) {
  selectedTemplate.value = templateId;
}

function nextStep() {
  // 檢查是否已選擇模板
  if (!selectedTemplate.value) {
    return;
  }
  
  // 檢查是否已達使用量上限（dev_user 不受限制）
  if (isAtLimit.value) {
    const message = `您已達到每人${appConfig.maxUsageLimit}張圖片的生成限制，無法繼續生成新圖片。\n\n是否要查看您的生成歷史？`;
    if (confirm(message)) {
      showHistoryPage.value = true;
    }
    return;
  }
  
  // 通過所有檢查，允許進入下一步
  emit("next-step", { selectedTemplate: selectedTemplate.value });
}

function showHistory() {
  showHistoryPage.value = true;
}
</script>

