<template>
  <div class="loading-screen">
    <div class="loading-overlay">
      <div class="loading-content">
        <div class="loading-image">
          <img src="/images/character.png" alt="角色圖片" class="character-image">
        </div>
        <div class="loading-indicator">
          <div class="loading-dots">
            <div class="loading-dot"></div>
            <div class="loading-dot"></div>
            <div class="loading-dot"></div>
            <div class="loading-dot"></div>
            <div class="loading-dot"></div>
          </div>
          <div class="loading-text">Loading...</div>
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

<style scoped>
.loading-screen {
  width: 100vw;
  height: 100vh;
  background: #5E60FE;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #5E60FE;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  overflow: hidden;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 40px;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}

.loading-image {
  width: 200px;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: visible;
  position: relative;
}

.character-image {
  width: auto;
  height: 100%;
  object-fit: contain;
  max-width: 100%;
  max-height: 100%;
  aspect-ratio: 768 / 1024; /* 原始圖片比例 */
}

.loading-indicator {
  text-align: center;
}

.loading-dots {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 20px;
}

.loading-dot {
  width: 12px;
  height: 12px;
  background: #F5D34D;
  border-radius: 50%;
  animation: loading-bounce 1.4s ease-in-out infinite both;
}

.loading-dot:nth-child(1) { animation-delay: -0.32s; }
.loading-dot:nth-child(2) { animation-delay: -0.16s; }
.loading-dot:nth-child(3) { animation-delay: 0s; }
.loading-dot:nth-child(4) { animation-delay: 0.16s; }
.loading-dot:nth-child(5) { animation-delay: 0.32s; }

@keyframes loading-bounce {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.5;
  }
  40% {
    transform: scale(1.0);
    opacity: 1;
  }
}

.loading-text {
  font-family: 'Inter', sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: #FFFFFF;
}

/* 響應式設計 */
@media (max-width: 430px) {
  .loading-screen {
    width: 100vw;
    height: 100vh;
  }
  
  .loading-content {
    gap: 30px;
    width: 90%;
    max-width: 320px;
  }
  
  .loading-image {
    width: 140px;
    height: 140px;
    margin: 0 auto;
    padding: 0;
    position: relative;
  }
  
  .character-image {
    position: relative;
    width: auto;
    height: 100%;
    aspect-ratio: 768 / 1024;
    max-height: 140px;
  }
  
  .loading-text {
    font-size: 20px;
  }
}

@media (max-height: 700px) and (orientation: portrait) {
  .loading-content {
    gap: 20px;
    width: 85%;
  }
  
  .loading-image {
    width: 110px;
    height: 110px;
    overflow: visible;
  }
  
  .character-image {
    width: auto;
    height: 100%;
    aspect-ratio: 768 / 1024;
    max-height: 110px;
  }
  
  .loading-text {
    font-size: 18px;
  }
  
  .loading-dots {
    gap: 6px;
    margin-bottom: 15px;
  }
  
  .loading-dot {
    width: 10px;
    height: 10px;
  }
}

/* iPhone SE 和其他小屏幕手機 */
@media (max-width: 375px) {
  .loading-content {
    gap: 15px;
    width: 85%;
  }
  
  .loading-image {
    width: 100px;
    height: 100px;
  }
  
  .character-image {
    width: auto;
    height: 100%;
    aspect-ratio: 768 / 1024;
    max-height: 100px;
  }
}
</style>
