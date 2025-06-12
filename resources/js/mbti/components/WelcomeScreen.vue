<template>
  <div class="welcome-screen">
    <!-- 背景裝飾線條 -->
    <div class="background-lines group-77">
      <img src="/images/vector-5.svg" class="vector-line" alt="">
      <img src="/images/vector-13.svg" class="vector-line" alt="">
      <img src="/images/vector-14.svg" class="vector-line" alt="">
    </div>
    
    <div class="background-lines group-75">
    </div>
    
    <!-- 標題區域 -->
    <div class="title-section">
      <div class="title-container">
        <img src="/images/group97.png" alt="標題背景" class="title-background">
        <h1 class="title-text">開啟你的MBTI測試</h1>
      </div>
    </div>
    
    <!-- 角色和對話區域 -->
    <div class="character-section">
      <div class="dialog-box">
        <div class="dialog-bg"></div>
        <div class="dialog-accent"></div>
        <div class="dots">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
        <p class="dialog-text-1">我們一起玩個小測驗吧！</p>
        <p class="dialog-text-2">準備好了嗎？那我們就開始吧！</p>
      </div>
      <div class="character">
        <img src="/images/character.png" alt="角色" class="character-image">
        <!-- 底部按鈕區域 -->
        <div class="button-section">
          <button class="btn-start" @click="$emit('start-quiz')">開始測驗！</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineEmits(['start-quiz'])
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Poppins:wght@700&display=swap');

.welcome-screen {
  width: 100vw;
  height: 100vh;
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

.vector-line {
  position: absolute;
  opacity: 0.2;
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

/* 角色和對話區域 */
.character-section {
  position: absolute;
  left: 26px;
  top: 186px;
  width: 372px;
  height: 559px;
}

.dialog-box {
  position: relative;
  width: 372px;
  height: 115px;
  margin-bottom: 25px;
}

.dialog-bg,
.dialog-accent {
  position: absolute;
  left: 0;
  top: 0;
  width: 372px;
  border: #000000 1.9px solid;
}

.dialog-bg {
  height: 559px;
  width: 372px;
  background: #FFFFFF;
  border: 1.9px solid #000000;
}

.dialog-accent {
  height: 18.06px;
  background: #F5D34D;
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

.dialog-text-1 {
  position: absolute;
  left: 76px;
  top: 49px;
  width: 220px;
  height: 24px;
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

.dialog-text-2 {
  position: absolute;
  left: 46px;
  top: 85px;
  width: 280px;
  height: 24px;
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

.character {
  position: absolute;
  left: 53px;
  top: 140px;
  width: 266.67px;
  height: fit-content !important;
}

.character-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 底部按鈕區域 */
.button-section {
  position: relative !important;
  margin-top: 1rem !important;
  left: 50%;
  top: 850px;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  align-items: center;
}

.btn-start {
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

.btn-start:hover {
  transform: translateY(-2px);
}

.btn-start:active {
  transform: translateY(0);
}

@media (max-width: 430px) {
  .welcome-screen {
    width: 100%;
    height: 100%;
    min-height: 932px;
  }
  
  .title-section {
    width: 90% !important;
    left: 5%;
  }
  
  .character-section {
    width: 90%;
    left: 5%;
  }
  
  .dialog-box {
    width: 100%;
  }
  
  .dialog-bg,
  .dialog-accent {
    width: 100%;
    left: 0;
  }
  
  .dialog-text-1, .dialog-text-2 {
    width: 90%;
    left: 5%;
  }
  
  .character {
    left: 50%;
    transform: translateX(-50%);
  }
  
  .btn-start {
    max-width: 280px;
  }
  
  .title-text {
    font-size: calc(30px + 2vw);
  }
}

@media (max-height: 932px) and (orientation: portrait) {
  .welcome-screen {
    height: 100vh;
    min-height: 800px;
  }
  
  .character-section {
    height: auto;
    top: 160px;
  }
  
  .character {
    height: calc(40vh + 100px);
    max-height: 400px;
    min-height: 280px;
    object-fit: contain;
  }
  
  .button-section {
    bottom: 20px;
    top: auto;
    position: fixed;
  }
  
  .title-section {
    top: 20px;
  }
}

@media (max-height: 700px) and (orientation: portrait) {
  .character {
    height: 40vh;
    min-height: 200px;
  }
  
  .dialog-text-1, .dialog-text-2 {
    font-size: 16px;
  }
  
  .title-text {
    font-size: 28px;
  }
  
  .title-section {
    height: 90px;
  }
  
  .dialog-box {
    height: 100px;
  }
}
</style>
