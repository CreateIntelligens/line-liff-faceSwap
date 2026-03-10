<template>
  <div
    class="relative mx-auto my-0 w-[375px] max-md:w-full max-md:max-w-screen-md max-sm:w-full cursor-pointer flex items-center justify-center"
    @click="enterFaceSwap"
    :style="{ 
      minHeight: '100vh',
      height: '100dvh',
      backgroundImage: `url(${imageUrls.background1})`, 
      backgroundSize: 'cover', 
      backgroundPosition: 'center', 
      backgroundRepeat: 'no-repeat' 
    }"
  >
    <img
      :src="imageUrls.homepage"
      alt="Homepage Content"
      class="w-full h-auto object-contain block"
    />
  </div>
</template>

<script setup>
import { imageUrls } from '@/config/imageUrls'
import { pushCTAClick } from '@/utils/gtmService.js'
import { modeService } from '@/services/modeService.js'

const emit = defineEmits(['enter-face-swap'])

function enterFaceSwap() {
  // 推送 CTA 按鈕點擊事件
  pushCTAClick({
    buttonText: '開始抽籤',
    userMode: modeService.getMode()
  })
  
  emit('enter-face-swap')
}
</script>
