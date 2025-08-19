<template>
  <div class="fixed inset-0 w-full h-full bg-primary z-[1000]">
    <div class="fixed inset-0 w-full h-full bg-primary flex items-center justify-center z-[1000] overflow-hidden">
      <div class="flex flex-col items-center justify-center gap-10 w-full px-5 sm:gap-8">
        <div class="w-[200px] h-[200px] flex justify-center items-center overflow-visible sm:w-[140px] sm:h-[140px]">
          <img src="/images/character.png" alt="角色圖片" class="w-auto h-full object-contain max-w-full max-h-full aspect-[768/1024]">
        </div>
        <div class="text-center">
          <div class="flex gap-2 justify-center mb-5">
            <div v-for="i in 5" :key="i" 
              class="w-3 h-3 bg-accent rounded-full animate-bounce" 
              :style="{ animationDelay: `${(i-1) * 0.2}s` }"
            ></div>
          </div>
          <div class="text-white text-2xl font-inter font-bold sm:text-xl">Loading...</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

const emit = defineEmits(['loading-complete'])

onMounted(() => {
  // 模擬載入時間
  setTimeout(() => {
    emit('loading-complete')
  }, 3000)
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');

.font-inter {
  font-family: 'Inter', sans-serif;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.5;
  }
  40% {
    transform: scale(1.0);
    opacity: 1;
  }
}

.animate-bounce {
  animation: bounce 1.4s ease-in-out infinite both;
}
</style>
