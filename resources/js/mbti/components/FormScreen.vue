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
      <div class="w-full mb-8">
        <div class="relative w-full">
          <img src="/images/group97.png" alt="標題背景" class="w-full block">
          <h1 class="absolute inset-0 flex items-center justify-center font-inter font-black text-4xl leading-tight text-center text-black m-0 p-0">
            填寫個人資料
          </h1>
        </div>
      </div>
      
      <!-- 表單區域 -->
      <div class="w-full">
        <form class="w-full" @submit.prevent="submitForm">
          <div 
            v-for="field in formFields" 
            :key="field.name" 
            class="mb-3"
          >
            <label class="block font-inter font-bold text-base text-white mb-2 ml-3">{{ field.label }}</label>
            <div class="relative">
              <div class="absolute inset-0 bg-white border-2 border-black rounded-lg"></div>
              <input 
                :type="field.type"
                class="relative w-full h-[50px] px-4 py-3 bg-transparent border-none font-inter text-base z-10 focus:outline-none"
                :class="{ 'border-2 border-red-500': formErrors[field.name] }"
                :placeholder="field.placeholder"
                v-model="formData[field.name]"
                @input="clearError(field.name)"
              />
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- 底部按鈕區域 -->
    <div class="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-[390px] px-4 flex justify-center">
      <button 
        class="w-[280px] h-[60px] bg-accent border-2 border-black rounded-lg font-poppins font-bold text-lg leading-normal text-[#333333] cursor-pointer transition-all duration-300 ease-in-out hover:-translate-y-0.5 active:translate-y-0" 
        @click="submitForm"
      >
        下一步 >
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const emit = defineEmits(['form-submitted'])

const formFields = [
  {
    name: 'name',
    label: '姓名',
    type: 'text',
    placeholder: '請填寫您的姓名'
  },
  {
    name: 'phone',
    label: '電話',
    type: 'tel',
    placeholder: '請輸入您的聯絡電話'
  },
  {
    name: 'email',
    label: '電子信箱',
    type: 'email',
    placeholder: '請輸入您的e-mail'
  },
  {
    name: 'company',
    label: '公司',
    type: 'text',
    placeholder: '請輸入您的公司'
  }
]

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

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Poppins:wght@700&display=swap');

.font-inter {
  font-family: 'Inter', sans-serif;
}

.font-poppins {
  font-family: 'Poppins', sans-serif;
}
</style>
