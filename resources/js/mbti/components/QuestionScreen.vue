<template>
  <div class="question-screen">
    <!-- 背景裝飾線條 -->
    <div class="background-lines group-77"></div>
    <div class="background-lines group-75"></div>
    
    <!-- 標題區域 -->
    <div class="title-section">
      <div class="title-container">
        <img src="/images/group97.png" alt="標題背景" class="title-background">
        <h1 class="title-text">MBTI測試</h1>
      </div>
    </div>
    
    <!-- 問題區域 -->
    <div class="question-section">
      <div class="question-box">
        <div class="question-bg"></div>
        <div class="question-accent"></div>
        <div class="dots">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
        <p class="question-text">{{ currentQuestion?.question }}</p>
      </div>
      
      <!-- 進度指示器 -->
      <div class="progress-indicator">({{ currentQuestionIndex + 1 }}/{{ totalQuestions }})</div>
    </div>
    
    <!-- 選項區域 -->
    <div class="options-section">
      <!-- 選項 A -->
      <div 
        class="option"
        :class="[
          selectedOption === currentQuestion?.options[0]?.value ? 'option-b selectedOption selected' : 'option-a',
        ]"
        @click="selectOption(currentQuestion?.options[0]?.value)"
      >
        <div class="option-content">
          <div class="option-letter">
            <span>A</span>
          </div>
          <span class="option-text">{{ currentQuestion?.options[0]?.text }}</span>
        </div>
        <div class="checkmark">✓</div>
      </div>
      
      <!-- 選項 B -->
      <div 
        class="option"
        :class="[
          selectedOption === currentQuestion?.options[1]?.value ? 'option-b selectedOption selected' : 'option-a',
        ]"
        @click="selectOption(currentQuestion?.options[1]?.value)"
      >
        <div class="option-content">
          <div class="option-letter">
            <span>B</span>
          </div>
          <span class="option-text">{{ currentQuestion?.options[1]?.text }}</span>
        </div>
        <div class="checkmark">✓</div>
      </div>
    </div>
    
    <!-- 底部按鈕區域 -->
    <div class="button-section">
      <button 
        class="btn-next" 
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

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Poppins:wght@700&display=swap');

.question-screen {
  width: 100vw;
  height: 1000px !important;
  min-height: 932px;
  background: #5E60FE;
  position: relative;
  overflow: hidden;
}

/* 背景裝飾線條 */
.background-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

/* 標題區域 */
.title-section {
  position: absolute;
  left: 24px;
  top: 36px;
  width: 382px;
}

.title-container {
  position: relative;
  width: 100%;
}

.title-background {
  width: 100%;
  display: block;
}

.title-text {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  font-family: 'Inter', sans-serif;
  font-weight: 900;
  font-size: 42px;
  line-height: 1.21;
  text-align: center;
  color: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
}

/* 問題區域 */
.question-section {
  position: absolute;
  left: 29px;
  top: 180px;
  width: 372px;
  height: 564px;
}

.question-box {
  position: relative;
  width: 372px;
  height: 145px;
  margin-bottom: 25px;
}

.question-bg {
  position: absolute;
  left: 0;
  top: 0;
  width: 372px;
  height: 564px;
  background: #FFFFFF;
  border: 1.9px solid #000000;
}

.question-accent {
  position: absolute;
  left: 0;
  top: 0;
  width: 372px;
  height: 18.0547px;
  background: #F5D34D;
  border: #000000 1.9px solid;
}

.dots {
  display: flex;
  gap: 4px;
  position: absolute;
  left: 16px;
  top: 5px;
  z-index: 2;
}

.dots .dot {
  width: 7.6px;
  height: 7.6px;
  background: #000;
  border-radius: 50%;
  display: inline-block;
}

.question-text {
  position: absolute;
  left: 32px;
  top: 53.47px;
  width: 308px;
  height: 72.64px;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 20px;
  line-height: 1.21;
  text-align: center;
  color: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-indicator {
  position: absolute;
  left: 168px;
  top: 33px;
  width: 29px;
  height: 15px;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 12px;
  line-height: 1.21;
  text-align: center;
  color: #000000;
}

/* 選項區域 */
.options-section {
  position: relative;
  left: 49px;
  top: 355px;
  width: 337px;
}

.option {
  width: 100%;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  border: 2px solid #000000;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  margin-bottom: 29px;
  margin-left: auto;
  margin-right: auto;
}

.option-a {
  background: #F5D34D;
}

.option-b {
  background: #5E60FE;
}

.option-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.option-letter {
  width: 26px;
  height: 26px;
  background: #FFFFFF;
  border: 1.58px solid #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 15.76px;
  color: #000000;
}

.option-text {
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 12px;
  line-height: 1.21;
  color: #000000;
}

.option-b .option-text {
  color: #FFFFFF;
}

.checkmark {
  width: 24px;
  height: 24px;
  color: #000000;
  font-size: 24px;
  font-weight: 300;
  display: none;
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
}

.option:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.option.selected .checkmark {
  display: block !important;
}

.option-b.selected .checkmark {
  color: #FFFFFF;
}

/* 底部按鈕區域 */
.button-section {
  position: absolute;
  left: 50%;
  top: 850px;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  align-items: center;
}

.btn-next {
  width: 280px;
  height: 60px;
  background: #F5D34D;
  border: 2px solid #000000;
  border-radius: 8px;
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 18px;
  line-height: 1.5;
  color: #333333;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 100;
}

.btn-next:hover {
  transform: translateY(-2px);
}

.btn-next:active {
  transform: translateY(0);
}

.btn-next:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 響應式設計 */
@media (max-width: 430px) {
  .question-screen {
    width: 100vw;
    height: 100vh;
    min-height: 932px;
  }
  
  .title-section {
    width: 90%;
    left: 5%;
  }
  
  .title-text {
    font-size: calc(24px + 2vw);
  }
  
  .question-section {
    width: 90%;
    left: 5%;
  }
  
  .question-box {
    width: 100%;
  }
  
  .question-bg, .question-accent {
    width: 100%;
  }
  
  .question-text {
    width: 85%;
    left: 7.5%;
  }
  
  .options-section {
    width: 90%;
    left: 5%;
  }
  
  .option {
    width: 90%;
  }
  
  .btn-next {
    max-width: 280px;
  }
}

@media (max-height: 932px) and (orientation: portrait) {
  .question-screen {
    height: 100vh;
    min-height: 800px;
  }
  
  .question-section {
    height: auto;
    top: 160px;
  }
  
  .options-section {
    top: 335px;
  }
  
  .button-section {
    bottom: unset;
    top: 750px;
    position: absolute;
  }
  
  .title-section {
    top: 20px;
    height: 90px;
  }
}

@media (max-height: 700px) and (orientation: portrait) {
  .question-text {
    font-size: 16px;
  }
  
  .title-text {
    font-size: 28px;
  }
  
  .title-section {
    height: 80px;
  }
  
  .question-box {
    height: 120px;
  }
  
  .question-bg {
    height: 110px;
  }
  
  .options-section {
    top: 310px;
  }
  
  .option {
    height: 45px;
    margin-bottom: 20px;
  }
  
  .option-text {
    font-size: 11px;
  }
  
  .option-letter {
    width: 22px;
    height: 22px;
    font-size: 13px;
  }
}
</style>
