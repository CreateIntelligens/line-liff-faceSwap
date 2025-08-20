<template>
  <div class="min-h-screen bg-[#333333] flex flex-col">
    <!-- Face Swap History Page -->
    <FaceSwapHistory 
      v-if="showHistory" 
      @back="showHistory = false"
    />
    
    <!-- Main Result Page -->
    <div v-if="!showHistory" class="flex-1 flex flex-col">
      <!-- Header -->
      <div class="flex gap-5 justify-center items-center px-5 py-6 w-full font-bold border-b border-[#EBD8B2] min-h-20">
        <div class="text-xl text-[#EBD8B2]">
          AI換臉
        </div>
        <div class="flex justify-center items-center w-[114px] h-8 rounded-[50px] bg-[#EBD8B2]">
          <div class="text-xs font-bold text-[#333]">
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

      
    <div class="flex justify-start items-center px-6 mb-4">
        <div class="flex items-center gap-3">
          <img 
            src="/images/step3_inprogress.png" 
            class="w-6 h-6 object-contain" 
            alt="Step 3"
          />
          <div class="text-base font-bold text-[#EBD8B2]">
            生成結果
          </div>
        </div>
      </div>
      <!-- Main Content -->
      <div class="flex-1 px-6 pb-8 pt-4 border border-[#EBD8B2]">
        <!-- Current Step Label -->
     
        <!-- Header Logo and Crown -->
        <div class="flex justify-between items-start">
          <img 
            class="h-5 object-contain" 
            src="https://api.builder.io/api/v1/image/assets/TEMP/de482b87c9c17cee473acb6454371b535acb8d1b?width=599" 
            alt="標準字" 
          />
          <img 
            class="w-12 h-12 object-contain transform -rotate-[10.809deg]" 
            src="https://api.builder.io/api/v1/image/assets/TEMP/2404d6238dca7a10ae577f3ba74faa4ec02d24e9?width=91" 
            alt="皇冠" 
          />
        </div>

        <!-- Images Section -->
        <div class="space-y-6">
          <!-- Original Image with Star -->
          <div class="relative">
            <img 
              class="w-full h-60 object-cover rounded-md" 
              src="https://api.builder.io/api/v1/image/assets/TEMP/7c6a9d35fa58d57ac3634da1c3cff5d948925fac?width=584" 
              alt="原圖" 
            />
            <img 
              class="absolute -left-2 -bottom-2 w-14 h-14 object-contain" 
              src="https://api.builder.io/api/v1/image/assets/TEMP/7b08a9934bfc575c52c100d8132b5f128780d934?width=106" 
              alt="星" 
            />
          </div>

          <!-- Result Image -->
          <div>
            <img 
              class="w-full h-60 object-cover rounded-md" 
              src="https://api.builder.io/api/v1/image/assets/TEMP/2f3fc83fb9651fb35607428f3bc56850dbfa0677?width=584" 
              alt="結果圖" 
            />
          </div>

          <!-- Bottom Logo -->
          <div class="flex justify-center">
            <img 
              class="h-8 object-contain" 
              src="https://api.builder.io/api/v1/image/assets/TEMP/3f99b54e280534e7c39a8d8bae3acd04680b9c57?width=425" 
              alt="0815" 
            />
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="bg-[#333333] px-6 py-8">
        <div class="flex gap-3 mb-8">
          <!-- Regenerate Button -->
          <button 
            class="flex-1 h-11 flex justify-center items-center rounded-md bg-[#EBD8B2] cursor-pointer hover:bg-[#d4c29a] transition-colors"
            @click="regenerate"
          >
            <div class="font-noto-sans-tc text-base font-bold text-[#333]">
              重新生成
            </div>
          </button>
          
          <!-- Download Button -->
          <button 
            class="flex-1 h-11 flex justify-center items-center rounded-md cursor-pointer transition-all duration-300 bg-gradient-to-r from-[#EE95FF] via-[#F192FF] via-[#B9B9FB] to-[#AFCBF7] hover:shadow-lg"
            @click="downloadToOfficial"
          >
            <div class="font-noto-sans-tc text-base font-bold text-[#333]">
              下載至官方帳號
            </div>
          </button>
        </div>

        <!-- Generation History Title -->
        <div 
          class="font-noto-sans-tc text-base font-bold text-[#EBD8B2] text-center cursor-pointer hover:text-[#d4c29a] transition-colors"
          @click="showHistory = true"
        >
          圖片生成紀錄
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import FaceSwapHistory from './FaceSwapHistory.vue'

// Define emits for parent component communication
const emit = defineEmits(['back', 'regenerate', 'download'])

// State for showing history page
const showHistory = ref(false)

// Handle regenerate button click
function regenerate() {
  emit('regenerate')
}

// Handle download to official account button click
function downloadToOfficial() {
  emit('download')
}
</script>

<style scoped>
/* 組件樣式 - 使用 Flexbox 佈局，無需額外的定位樣式 */
</style>
