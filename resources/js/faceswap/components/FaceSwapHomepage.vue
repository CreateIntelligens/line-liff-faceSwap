<template>
  <div
    class="relative mx-auto my-0 bg-[#333333] h-[774px] w-[375px] max-md:w-full max-md:max-w-screen-md max-sm:w-full max-sm:h-auto max-sm:min-h-[774px]"
  >
    <!-- Header -->
    <div class="flex justify-center items-center p-5 h-20">
      <div class="text-xl font-bold text-[#EBD8B2]">
        AI換臉
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col items-center px-6 py-8">
      <!-- Hero Image -->
      <div class="mb-8">
        <img
          :src="imageUrls.Group13948"
          alt="Hero Image"
          class="w-[297px] h-[397px] object-contain max-sm:w-[250px] max-sm:h-[335px]"
        />
      </div>

      <!-- Decorative Bars -->
      <div class="relative w-full">
        <div class="absolute left-[-6%] top-1/2 transform -translate-y-[40px] w-52 h-2.5 bg-gradient-to-r from-[#F773AF] via-[#AC86EB] to-[#FAAC95] -rotate-90 origin-left"></div>
        <div class="absolute right-[-6%] top-1/2 transform -translate-y-[152px] w-52 h-2.5 bg-gradient-to-r from-[#F773AF] via-[#AC86EB] to-[#FAAC95] rotate-90 origin-right"></div>
      </div>

      <!-- Text Content -->
      <div class="text-center mb-8 max-w-md">
        <h1 class="text-2xl font-bold text-[#EBD8B2] mb-4 max-sm:text-xl">
          將你的照片打造成熱門IP！
        </h1>
        <p class="text-base text-[#EBD8B2] max-sm:text-sm leading-relaxed">
          三步驟快速換臉！選擇一張三立IP圖片<br />
          並上傳一張正面清晰的原始圖片<br />
          即可生成換臉效果
        </p>
      </div>

      <!-- CTA Button -->
      <button
        class="flex justify-center items-center px-20 py-3 h-11 bg-[#EBD8B2] rounded-md cursor-pointer hover:bg-[#d4c29a] transition-colors text-base font-bold text-[#333333] max-sm:px-5 max-sm:w-full"
        @click="enterFaceSwap"
      >
        進入IP換臉生成工具
      </button>
    </div>

    <!-- Footer -->
    <div class="text-center pb-8">
      <p class="text-xs text-[#EBD8B2]">
        此服務由 創造智能 提供技術支持
      </p>
    </div>
  </div>
</template>

<script setup>
import { imageUrls } from '@/config/imageUrls'

const emit = defineEmits(['enter-face-swap'])

function enterFaceSwap() {
  emit('enter-face-swap')
}
</script>
