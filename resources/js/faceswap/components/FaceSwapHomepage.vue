<template>
  <div
    class="relative mx-auto my-0 w-[375px] max-md:w-full max-md:max-w-screen-md max-sm:w-full cursor-pointer overflow-hidden flex items-center justify-center"
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
      class="max-w-full max-h-full w-auto h-auto object-contain"
    />
  </div>
</template>

<script setup>
import { imageUrls } from '@/config/imageUrls'

const emit = defineEmits(['enter-face-swap'])

function enterFaceSwap() {
  emit('enter-face-swap')
}
</script>
