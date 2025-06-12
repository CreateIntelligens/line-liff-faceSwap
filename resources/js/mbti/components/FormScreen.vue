<template>
  <div class="form-screen">
    <!-- 背景裝飾線條 -->
    <div class="background-lines group-77"></div>
    <div class="background-lines group-75"></div>
    
    <!-- 標題區域 -->
    <div class="title-section">
      <div class="title-container">
        <img src="/images/group97.png" alt="標題背景" class="title-background">
        <h1 class="title-text">填寫個人資料</h1>
      </div>
    </div>
    
    <!-- 表單區域 -->
    <div class="form-section">
      <form class="user-form" @submit.prevent="submitForm">
        <!-- 姓名欄位 -->
        <div class="form-group">
          <label class="form-label">姓名</label>
          <div class="input-container">
            <div class="input-bg"></div>
            <input 
              type="text" 
              class="form-input" 
              placeholder="請填寫您的姓名" 
              v-model="formData.name"
              :class="{ error: formErrors.name }"
              @input="clearError('name')"
            />
          </div>
        </div>
        
        <!-- 電話欄位 -->
        <div class="form-group">
          <label class="form-label">電話</label>
          <div class="input-container">
            <div class="input-bg"></div>
            <input 
              type="tel" 
              class="form-input" 
              placeholder="請輸入您的聯絡電話" 
              v-model="formData.phone"
              :class="{ error: formErrors.phone }"
              @input="clearError('phone')"
            />
          </div>
        </div>
        
        <!-- 電子信箱欄位 -->
        <div class="form-group">
          <label class="form-label">電子信箱</label>
          <div class="input-container">
            <div class="input-bg"></div>
            <input 
              type="email" 
              class="form-input" 
              placeholder="請輸入您的e-mail" 
              v-model="formData.email"
              :class="{ error: formErrors.email }"
              @input="clearError('email')"
            />
          </div>
        </div>
        
        <!-- 公司欄位 -->
        <div class="form-group">
          <label class="form-label">公司</label>
          <div class="input-container">
            <div class="input-bg"></div>
            <input 
              type="text" 
              class="form-input" 
              placeholder="請輸入您的公司" 
              v-model="formData.company"
              :class="{ error: formErrors.company }"
              @input="clearError('company')"
            />
          </div>
        </div>
      </form>
    </div>
    
    <!-- 底部按鈕區域 -->
    <div class="button-section">
      <button class="btn-next" @click="submitForm">下一步 ></button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const emit = defineEmits(['form-submitted'])

const formData = reactive({
  name: '',
  phone: '',
  email: '',
  company: ''
})

const formErrors = reactive({
  name: false,
  phone: false,
  email: false,
  company: false
})

function clearError(field) {
  formErrors[field] = false
}

function submitForm() {
  // 重置錯誤狀態
  Object.keys(formErrors).forEach(key => {
    formErrors[key] = false
  })
  
  // 驗證表單
  let isValid = true
  Object.keys(formData).forEach(key => {
    if (!formData[key].trim()) {
      formErrors[key] = true
      isValid = false
    }
  })
  
  if (isValid) {
    emit('form-submitted', { ...formData })
  } else {
    alert('請填寫所有必填欄位')
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Poppins:wght@700&display=swap');

.form-screen {
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

/* 表單樣式 */
.form-section {
  position: absolute;
  left: 29px;
  top: 180px;
  width: 372px;
  height: 564px;
}

.form-group {
  margin-bottom: 25px;
}

.form-label {
  display: block;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 16px;
  color: #FFFFFF;
  margin-bottom: 8px;
  margin-left: 12px;
}

.input-container {
  position: relative;
}

.input-bg {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 50px;
  background: #FFFFFF;
  border: 2px solid #000000;
  border-radius: 8px;
}

.form-input {
  position: relative;
  width: 100%;
  height: 50px;
  padding: 12px 16px;
  background: transparent;
  border: none;
  font-family: 'Inter', sans-serif;
  font-size: 16px !important;
  z-index: 2;
}


.form-input.error {
  border: 2px solid #ff4444;
}

/* 底部按鈕區域 */
.button-section {
  position: absolute;
  left: 50%;
  top: 750px;
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

/* 響應式設計 */
@media (max-width: 430px) {
  .form-screen {
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
  
  .form-section {
    width: 90%;
    left: 5%;
  }
  
  .btn-next {
    max-width: 280px;
  }
}

@media (max-height: 932px) and (orientation: portrait) {
  .form-screen {
    height: 100vh;
    min-height: 800px;
  }
  
  .form-section {
    height: auto;
    top: 160px;
  }
  
  .button-section {
    bottom: 20px;
    top: auto;
    position: fixed;
  }
  
  .title-section {
    top: 20px;
    height: 90px;
  }
}

@media (max-height: 700px) and (orientation: portrait) {
  .title-text {
    font-size: 28px;
  }
  
  .title-section {
    height: 80px;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  .form-label {
    font-size: 14px;
  }
  
  .form-input {
    height: 45px;
    font-size: 13px;
  }
  
  .input-bg {
    height: 45px;
  }
}
</style>
