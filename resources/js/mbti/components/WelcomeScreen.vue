<template>
  <div class="w-full h-screen min-h-[932px] bg-primary relative overflow-hidden flex items-start justify-center pt-8">
    <!-- 背景裝飾線條 -->
    <div class="absolute top-0 left-0 w-full h-full pointer-events-none">
      <img src="/images/vector-5.svg" class="absolute opacity-20" alt="">
      <img src="/images/vector-13.svg" class="absolute opacity-20" alt="">
      <img src="/images/vector-14.svg" class="absolute opacity-20" alt="">
    </div>
    
    <!-- 主要內容容器 -->
    <div class="relative w-full max-w-[390px] px-4">
      <!-- 標題區域 -->
      <div class="w-full mb-4">
        <div class="w-full bg-[url('/images/group97.png')] bg-cover bg-center aspect-[390/120] flex items-center justify-center">
          <h1 class="font-inter font-black text-4xl leading-tight text-center text-black m-0 p-0">
            開啟你的MBTI測試
          </h1>
        </div>
      </div>
      
      <!-- 角色和對話區域 -->
      <div class="w-full">
        <div class="relative w-full h-[550px] bg-white border-[1.9px] border-black">
          <div class="w-full h-[18.06px] bg-accent border-b-[1.9px] border-black">
            <div class="flex gap-1 p-1">
              <div class="w-[7.6px] h-[7.6px] bg-black rounded-full"></div>
              <div class="w-[7.6px] h-[7.6px] bg-black rounded-full"></div>
              <div class="w-[7.6px] h-[7.6px] bg-black rounded-full"></div>
            </div>
          </div>
          <div class="p-4">
            <p class="font-inter font-bold text-xl leading-tight text-center text-black mb-2">
              我們一起玩個小測驗吧！
            </p>
            <p class="font-inter font-bold text-xl leading-tight text-center text-black">
              準備好了嗎？那我們就開始吧！
            </p>
          </div>
          
          <!-- 角色圖片 -->
          <div class="w-full flex justify-center mt-4">
            <img src="/images/character.png" alt="角色" class="w-[266.67px] h-auto object-cover">
          </div>
        </div>
        
        <!-- 底部按鈕區域 -->
        <div class="w-full mt-4 flex justify-center">
          <button 
            class="w-[280px] h-[60px] bg-accent border-2 border-black rounded-lg font-poppins font-bold text-lg leading-normal text-[#333333] cursor-pointer transition-all duration-300 ease-in-out hover:-translate-y-0.5 active:translate-y-0" 
            @click="$emit('start-quiz')"
          >
            開始測驗！
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineEmits(['start-quiz'])
</script>
