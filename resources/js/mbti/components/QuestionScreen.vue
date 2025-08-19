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
        <div class="relative w-full">
          <img src="/images/group97.png" alt="標題背景" class="w-full block">
          <h1 class="absolute inset-0 flex items-center justify-center font-inter font-black text-4xl leading-tight text-center text-black m-0 p-0">
            MBTI測試
          </h1>
        </div>
      </div>
      
      <!-- 問題區域 -->
      <div class="w-full">
        <div class="relative w-full min-h-[145px] mb-6">
          <div class="w-full h-full bg-white border-[1.9px] border-black">
            <div class="w-full h-[18.06px] bg-accent border-[1.9px] border-black">
              <div class="px-4 pt-[5px] flex gap-1">
                <div class="w-[7.6px] h-[7.6px] bg-black rounded-full"></div>
                <div class="w-[7.6px] h-[7.6px] bg-black rounded-full"></div>
                <div class="w-[7.6px] h-[7.6px] bg-black rounded-full"></div>
              </div>
            </div>
            <div class="p-8 flex items-center justify-center">
              <p class="font-inter font-bold text-xl leading-tight text-center text-black">
                {{ currentQuestion?.question }}
              </p>
            </div>
          </div>
          
          <!-- 進度指示器 -->
          <div class="absolute left-1/2 -translate-x-1/2 top-[26px] font-inter font-bold text-xs leading-tight text-center text-black">
            ({{ currentQuestionIndex + 1 }}/{{ totalQuestions }})
          </div>
        </div>
      </div>
      
      <!-- 選項區域 -->
      <div class="w-full mt-8 px-4">
        <!-- 選項 A -->
        <div 
          class="w-full h-[50px] flex items-center justify-between px-6 py-3 border-2 border-black cursor-pointer transition-all duration-300 mb-[29px] mx-auto relative"
          :class="[
            selectedOption === currentQuestion?.options[0]?.value 
              ? 'bg-primary text-white' 
              : 'bg-accent text-black'
          ]"
          @click="selectOption(currentQuestion?.options[0]?.value)"
        >
          <div class="flex items-center gap-3">
            <div class="w-[26px] h-[26px] bg-white border-[1.58px] border-black flex items-center justify-center font-inter font-bold text-[15.76px] text-black">
              <span>A</span>
            </div>
            <span class="font-inter font-bold text-xs leading-tight">{{ currentQuestion?.options[0]?.text }}</span>
          </div>
          <div class="w-6 h-6 text-2xl font-light hidden absolute right-4 top-1/2 -translate-y-1/2" :class="{ '!block': selectedOption === currentQuestion?.options[0]?.value }">✓</div>
        </div>
        
        <!-- 選項 B -->
        <div 
          class="w-full h-[50px] flex items-center justify-between px-6 py-3 border-2 border-black cursor-pointer transition-all duration-300 mb-[29px] mx-auto relative"
          :class="[
            selectedOption === currentQuestion?.options[1]?.value 
              ? 'bg-primary text-white' 
              : 'bg-accent text-black'
          ]"
          @click="selectOption(currentQuestion?.options[1]?.value)"
        >
          <div class="flex items-center gap-3">
            <div class="w-[26px] h-[26px] bg-white border-[1.58px] border-black flex items-center justify-center font-inter font-bold text-[15.76px] text-black">
              <span>B</span>
            </div>
            <span class="font-inter font-bold text-xs leading-tight">{{ currentQuestion?.options[1]?.text }}</span>
          </div>
          <div class="w-6 h-6 text-2xl font-light hidden absolute right-4 top-1/2 -translate-y-1/2" :class="{ '!block': selectedOption === currentQuestion?.options[1]?.value }">✓</div>
        </div>
      </div>
    </div>

    <!-- 底部按鈕區域 - 移到白色框框外面 -->
    <div class="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-[390px] px-4 flex justify-center">
      <button 
        class="w-[280px] h-[60px] bg-accent border-2 border-black rounded-lg font-poppins font-bold text-lg leading-normal text-[#333333] cursor-pointer transition-all duration-300 ease-in-out hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed" 
        :disabled="!selectedOption"
        @click="answerQuestion"
      >
        下一步 >
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  currentQuestion: Object,
  currentQuestionIndex: Number,
  totalQuestions: Number
})

const emit = defineEmits(['answer-question'])

const selectedOption = ref(null)

function selectOption(value) {
  selectedOption.value = value
}

function answerQuestion() {
  if (!selectedOption.value) return
  
  emit('answer-question', selectedOption.value)
  selectedOption.value = null // 重置選擇
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Poppins:wght@700&display=swap');

.font-inter {
  font-family: 'Inter', sans-serif;
}

.font-poppins {
  font-family: 'Poppins', sans-serif;
}
</style>
