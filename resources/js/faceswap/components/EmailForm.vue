<template>
  <div
    class="relative mx-auto my-0 w-[375px] max-md:w-full max-md:max-w-screen-md max-sm:w-full"
    :style="{ 
      minHeight: '100dvh',
      backgroundImage: `url(${imageUrls.background1})`, 
      backgroundSize: 'cover', 
      backgroundPosition: 'center', 
      backgroundRepeat: 'no-repeat'
    }"
  >
    <!-- 主標題區域 -->
    <div class="px-4 pb-4">
      <!-- Header -->
      <div class="flex gap-5 justify-center items-center self-stretch py-6 w-full font-bold whitespace-nowrap min-h-20">
        <div
          class="self-stretch my-auto"
          data-name="AI換臉"
        >
          <img
            :src="imageUrls.header1"
            class="h-30 object-contain"
            alt="面相指路 靈籤定運"
          />
        </div>
      </div>


      <!-- 範例圖片展示 -->
      <div class="mb-6">
        <img
          :src="imageUrls.enterpriseImage"
          alt="範例圖片"
          class="w-full h-auto object-contain rounded-lg"
        />
      </div>
    </div>

    <!-- 表單區域 -->
    <div class="px-4 pb-8">
      <div class="space-y-4">
        <!-- 姓名 -->
        <div>
          <label class="block text-sm mb-2 text-white font-bold">
            <span class="text-red-500">*</span>姓名
          </label>
          <input
            v-model="formData.name"
            type="text"
            placeholder="請填寫您的真實姓名"
            class="w-full"
            :class="errors.name ? 'border-2 border-red-500' : 'border-0'"
            :style="errors.name 
              ? 'color: white; background-color: rgba(239, 68, 68, 0.15); border: 2px solid #EF4444; border-radius: 8px; padding: 12px 16px;' 
              : 'color: white; background-color: rgba(140, 140, 140, 0.2); border: 0.8px solid #FFFFFF; border-radius: 8px; padding: 12px 16px;'"
            @input="validateField('name')"
          />
          <p v-if="errors.name" class="text-red-400 text-sm font-semibold mt-2 flex items-center gap-1">
            <span>⚠️</span>
            <span>{{ errors.name }}</span>
          </p>
        </div>

        <!-- 電子郵件 -->
        <div>
          <label class="block text-sm mb-2 text-white font-bold">
            <span class="text-red-500">*</span>電子郵件
          </label>
          <input
            v-model="formData.email"
            type="email"
            placeholder="請填寫常用的電子郵件地址"
            class="w-full"
            :class="errors.email ? 'border-2 border-red-500' : 'border-0'"
            :style="errors.email 
              ? 'color: white; background-color: rgba(239, 68, 68, 0.15); border: 2px solid #EF4444; border-radius: 8px; padding: 12px 16px;' 
              : 'color: white; background-color: rgba(140, 140, 140, 0.2); border: 0.8px solid #FFFFFF; border-radius: 8px; padding: 12px 16px;'"
            @input="validateField('email')"
          />
          <p v-if="errors.email" class="text-red-400 text-sm font-semibold mt-2 flex items-center gap-1">
            <span>⚠️</span>
            <span>{{ errors.email }}</span>
          </p>
        </div>

        <!-- 公司名稱 -->
        <div>
          <label class="block text-sm mb-2 text-white font-bold">
            <span class="text-red-500">*</span>公司名稱
          </label>
          <input
            v-model="formData.company"
            type="text"
            placeholder="請填寫您的公司名稱"
            class="w-full"
            :class="errors.company ? 'border-2 border-red-500' : 'border-0'"
            :style="errors.company 
              ? 'color: white; background-color: rgba(239, 68, 68, 0.15); border: 2px solid #EF4444; border-radius: 8px; padding: 12px 16px;' 
              : 'color: white; background-color: rgba(140, 140, 140, 0.2); border: 0.8px solid #FFFFFF; border-radius: 8px; padding: 12px 16px;'"
            @input="validateField('company')"
          />
          <p v-if="errors.company" class="text-red-400 text-sm font-semibold mt-2 flex items-center gap-1">
            <span>⚠️</span>
            <span>{{ errors.company }}</span>
          </p>
        </div>

        <!-- 聯絡電話 -->
        <div>
          <label class="block text-sm mb-2 text-white font-bold">
            <span class="text-red-500">*</span>聯絡電話
          </label>
          <input
            v-model="formData.phone"
            type="tel"
            placeholder="請提供可聯絡到您的手機號碼"
            class="w-full"
            :class="errors.phone ? 'border-2 border-red-500' : 'border-0'"
            :style="errors.phone 
              ? 'color: white; background-color: rgba(239, 68, 68, 0.15); border: 2px solid #EF4444; border-radius: 8px; padding: 12px 16px;' 
              : 'color: white; background-color: rgba(140, 140, 140, 0.2); border: 0.8px solid #FFFFFF; border-radius: 8px; padding: 12px 16px;'"
            @input="validateField('phone')"
          />
          <p v-if="errors.phone" class="text-red-400 text-sm font-semibold mt-2 flex items-center gap-1">
            <span>⚠️</span>
            <span>{{ errors.phone }}</span>
          </p>
        </div>
      </div>

      <!-- 提交按鈕（獨立出來，增加上方間距） -->
      <div class="mt-8">
        <button
          type="button"
          @click="handleSubmit"
          :disabled="!isFormValid || isSubmitting"
          class="w-full h-auto relative"
          :class="isFormValid && !isSubmitting 
            ? 'cursor-pointer' 
            : 'cursor-not-allowed'"
        >
          <img
            :src="isFormValid && !isSubmitting ? imageUrls.enterpriseButtonClay : imageUrls.enterpriseButtonGray"
            alt="獲得抽籤資格"
            class="w-full h-auto object-contain"
          />
        </button>

        <!-- 錯誤訊息 -->
        <div v-if="submitError" class="text-red-400 text-sm text-center mt-2">
          {{ submitError }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { imageUrls } from '@/config/imageUrls'

const emit = defineEmits(['submit'])

// 表單數據
const formData = ref({
  name: '',
  email: '',
  company: '',
  phone: ''
})

// 驗證錯誤
const errors = ref({
  name: '',
  email: '',
  company: '',
  phone: ''
})

// UI 狀態
const isSubmitting = ref(false)
const submitError = ref('')

// Email 格式驗證
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// 電話號碼驗證（台灣手機或市話：0 開頭，8-10 位數）
// 手機：09開頭10位數（例如：0912345678）
// 市話：0開頭8-10位數（例如：02-12345678, 04-1234567）
const phoneRegex = /^0\d{7,9}$/

// 表單驗證
const isFormValid = computed(() => {
  const nameValid = formData.value.name.trim() !== ''
  const emailValid = formData.value.email.trim() !== '' && emailRegex.test(formData.value.email)
  const companyValid = formData.value.company.trim() !== ''
  
  // 電話號碼：移除特殊字符後驗證
  const phoneValue = formData.value.phone.replace(/[-\s()]/g, '').trim()
  const phoneValid = phoneValue !== '' && phoneRegex.test(phoneValue)
  
  return nameValid && emailValid && companyValid && phoneValid
})

// 驗證單個欄位（即時驗證）
function validateField(fieldName) {
  let value = formData.value[fieldName]
  
  // 電話號碼：移除橫線、空格等字符後再驗證
  if (fieldName === 'phone') {
    value = value.replace(/[-\s()]/g, '') // 移除橫線、空格、括號
    formData.value[fieldName] = value // 更新表單值（移除特殊字符）
  }
  
  value = value.trim()
  
  switch (fieldName) {
    case 'name':
      if (value === '') {
        errors.value.name = '請填寫姓名'
      } else {
        errors.value.name = ''
      }
      break
    case 'email':
      if (value === '') {
        errors.value.email = '請填寫電子郵件'
      } else if (!emailRegex.test(value)) {
        errors.value.email = '請填寫有效的電子郵件格式'
      } else {
        errors.value.email = ''
      }
      break
    case 'company':
      if (value === '') {
        errors.value.company = '請填寫公司名稱'
      } else {
        errors.value.company = ''
      }
      break
    case 'phone':
      if (value === '') {
        errors.value.phone = '請填寫聯絡電話'
      } else if (!phoneRegex.test(value)) {
        // 根據長度給出不同的提示
        if (value.length < 8) {
          errors.value.phone = '電話號碼長度不足'
        } else if (value.length > 10) {
          errors.value.phone = '電話號碼長度過長'
        } else if (!value.startsWith('0')) {
          errors.value.phone = '電話號碼應以 0 開頭'
        } else {
          errors.value.phone = '請填寫有效的電話號碼'
        }
      } else {
        errors.value.phone = ''
      }
      break
  }
  
  // 清除提交錯誤（當用戶開始修正時）
  if (submitError.value) {
    submitError.value = ''
  }
}

// 處理表單提交
async function handleSubmit() {
  if (!isFormValid.value || isSubmitting.value) return

  // 驗證所有欄位
  validateField('name')
  validateField('email')
  validateField('company')
  validateField('phone')

  // 如果有錯誤，不提交
  if (errors.value.name || errors.value.email || errors.value.company || errors.value.phone) {
    submitError.value = '請填寫所有必填欄位'
    return
  }

  try {
    isSubmitting.value = true
    submitError.value = ''

    // 將 email 儲存到 sessionStorage，作為 userId 使用
    const email = formData.value.email.trim()
    sessionStorage.setItem('faceswap_email', email)
    sessionStorage.setItem('faceswap_userInfo', JSON.stringify({
      name: formData.value.name.trim(),
      email: email,
      company: formData.value.company.trim(),
      phone: formData.value.phone.trim()
    }))

    console.log('✅ 表單資料已儲存:', {
      email: email,
      userInfo: {
        name: formData.value.name.trim(),
        email: email,
        company: formData.value.company.trim(),
        phone: formData.value.phone.trim()
      }
    })

    // 觸發提交事件，將 email 作為 userId 傳遞
    emit('submit', {
      userId: email,
      userInfo: {
        name: formData.value.name.trim(),
        email: email,
        company: formData.value.company.trim(),
        phone: formData.value.phone.trim()
      }
    })

  } catch (error) {
    console.error('❌ 表單提交失敗:', error)
    submitError.value = '提交失敗，請稍後再試'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
/* 確保輸入框的 placeholder 顏色正確顯示 */
input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus {
  -webkit-text-fill-color: white;
  -webkit-box-shadow: 0 0 0px 1000px rgba(140, 140, 140, 0.2) inset;
  transition: background-color 5000s ease-in-out 0s;
}
</style>
