<template>
  <!-- History Page -->
  <FaceSwapHistory 
    v-if="showHistoryPage" 
    @back="showHistoryPage = false"
  />
  
  <!-- Main Template Selection Page -->
  <div
    v-if="!showHistoryPage"
    class="relative mx-auto my-0 bg-[#333333] h-[774px] w-[375px] max-md:w-full max-md:max-w-screen-md max-sm:w-full max-sm:h-auto max-sm:min-h-[774px]"
    data-name="換臉_橫式範本"
  >
    <div
      class="flex gap-5 justify-center items-center self-stretch px-5 py-6 w-full font-bold whitespace-nowrap border-b border-[#EBD8B2] min-h-20"
    >
      <div
        class="self-stretch my-auto text-xl text-[#EBD8B2]"
        data-name="AI換臉"
      >
        AI換臉
      </div>
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
        src="/images/step1.png"
        class="w-6 h-6 object-contain"
        alt="Step 1"
      />
      <img
        src="https://api.builder.io/api/v1/image/assets/TEMP/7f03c8a2d5652999b0cf2dc2c1710e475c7781ed?placeholderIfAbsent=true"
        class="object-contain shrink-0 my-auto aspect-[32.26] w-[65px]"
      />
      <img
        src="/images/step2_inactive.png"
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
      class="flex gap-5 justify-between max-w-full text-sm text-center text-[#EBD8B2] w-[218px] mx-auto"
    >
      <div data-name="Step 1">Step 1</div>
      <div data-name="Step 2">Step 2</div>
      <div data-name="Step 3">Step 3</div>
    </div>
    <div class="mt-14 w-full max-w-[338px] mx-auto">
      <div class="flex flex-col w-full">
        <div class="flex flex-col w-full">
          <div
            class="flex gap-2.5 items-center justify-center font-bold text-center whitespace-nowrap"
          >
            <div class="self-stretch my-auto text-lg text-[#333333] w-6 h-6">
              <img
                src="/images/step1.png"
                class="w-6 h-6 object-contain"
                alt="Step 1"
              />
            </div>
            <div
              class="self-stretch my-auto text-base text-[#EBD8B2]"
              data-name="請選擇以下IP圖片範本（請點擊圖片）"
            >
              請選擇以下IP圖片範本（請點擊圖片）
            </div>
          </div>
          <div class="mt-9 w-full">
            <div class="flex gap-3 items-center w-full">
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/dcd03673f19d2a7475c34d7c9d5287881199e237?placeholderIfAbsent=true"
                class="object-contain shrink-0 self-stretch my-auto aspect-[1.37] w-[164px] cursor-pointer rounded-md transition-all duration-200 hover:scale-105"
                :class="{
                  'ring-2 ring-[#EBD8B2]': selectedTemplate === 'template1',
                }"
                @click="selectTemplate('template1')"
              />
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/192f85df3857b6124af697783a00f8eb5ac3105a?placeholderIfAbsent=true"
                class="object-contain shrink-0 self-stretch my-auto w-40 aspect-[1.33] cursor-pointer rounded-md transition-all duration-200 hover:scale-105"
                :class="{
                  'ring-2 ring-[#EBD8B2]': selectedTemplate === 'template2',
                }"
                @click="selectTemplate('template2')"
              />
            </div>
            <div class="flex gap-3 items-center mt-3 w-full">
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/fbf730fb39608cf08e5554286a854a8280832fab?placeholderIfAbsent=true"
                class="object-contain shrink-0 self-stretch my-auto aspect-[1.37] w-[164px] cursor-pointer rounded-md transition-all duration-200 hover:scale-105"
                :class="{
                  'ring-2 ring-[#EBD8B2]': selectedTemplate === 'template3',
                }"
                @click="selectTemplate('template3')"
              />
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/20cf8a9eba96e42bb731ce0ef8be47c78b4dd270?placeholderIfAbsent=true"
                class="object-contain shrink-0 self-stretch my-auto w-40 aspect-[1.33] cursor-pointer rounded-md transition-all duration-200 hover:scale-105"
                :class="{
                  'ring-2 ring-[#EBD8B2]': selectedTemplate === 'template4',
                }"
                @click="selectTemplate('template4')"
              />
            </div>
          </div>
        </div>
        <div
          class="self-end mt-16 w-full text-base font-bold text-white whitespace-nowrap rounded-md max-w-[336px]"
        >
          <div
            class="flex gap-5 justify-center items-center px-36 py-3.5 rounded-md min-h-11 cursor-pointer transition-all duration-300"
            :class="
              selectedTemplate
                ? 'bg-gradient-to-r from-[#EE95FF] via-[#F192FF] via-[#B9B9FB] to-[#AFCBF7] hover:shadow-lg text-gray-800'
                : 'bg-[#EBD8B2] text-[#333333]'
            "
            @click="nextStep"
          >
            <div class="self-stretch my-auto" data-name="下一步">下一步</div>
          </div>
        </div>
      </div>
      <div
        class="mt-9 text-base font-bold text-center text-[#EBD8B2] cursor-pointer hover:text-[#d4c29a] transition-colors"
        data-name="圖片生成紀錄"
        @click="showHistory"
      >
        圖片生成紀錄
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { roadshowService } from "../../services/roadshowService.js";
import FaceSwapHistory from "./FaceSwapHistory.vue";

const emit = defineEmits(["next-step", "back"]);

const selectedTemplate = ref("");
const showHistoryPage = ref(false);

// 在組件掛載時獲取模板列表
onMounted(async () => {
  try {
    console.log('🔍 嘗試獲取模板列表...');
    const result = await roadshowService.getTemplates();
    if (result && result.success) {
      console.log('✅ 模板列表獲取成功:', result.templates);
      // 4個模板佈局保持不變：左上1、右上2、左下3、右下4
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
  if (selectedTemplate.value) {
    emit("next-step", { selectedTemplate: selectedTemplate.value });
  }
}

function showHistory() {
  showHistoryPage.value = true;
}
</script>

