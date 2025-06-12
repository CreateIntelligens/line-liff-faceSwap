<template>
  <div class="app">
    <!-- Welcome Screen -->
    <WelcomeScreen 
      v-if="currentStep === 'welcome'" 
      @start-quiz="startQuiz"
    />

    <!-- Question Screen -->
    <QuestionScreen 
      v-else-if="currentStep === 'questions'"
      :current-question="currentQuestion"
      :current-question-index="currentQuestionIndex"
      :total-questions="selectedQuestions.length"
      @answer-question="answerQuestion"
    />

    <!-- Form Screen -->
    <FormScreen 
      v-else-if="currentStep === 'form'"
      @form-submitted="handleFormSubmitted"
    />

    <!-- Upload Screen -->
    <UploadScreen 
      v-else-if="currentStep === 'upload'"
      :result="result.value"
      :task-id="taskId"
      @upload-processed="handleUploadProcessed"
      :error-message="uploadError"
    />

        <!-- Loading Screen -->
    <LoadingScreen 
      v-else-if="currentStep === 'loading'"
      @loading-complete="handleLoadingComplete"
    />

    <!-- Result Screen -->
    <ResultScreen 
      v-else-if="currentStep === 'result'"
      :mbti-result="result"
      :user-info="userInfo"
      :image-url="uploadedData.image_url"
      :result-id="taskId"
      @download-requested="handleDownloadRequested"
      @image-loaded="handleImageLoaded"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeMount } from 'vue'
import WelcomeScreen from './components/WelcomeScreen.vue'
import QuestionScreen from './components/QuestionScreen.vue'
import FormScreen from './components/FormScreen.vue'
import UploadScreen from './components/UploadScreen.vue'
import LoadingScreen from './components/LoadingScreen.vue'
import ResultScreen from './components/ResultScreen.vue'
import rawQuestions from './data/mbti-questions.json'

// 狀態
const mbtiType = ref(null)
const externalUserId = ref(null)
const result = ref('')
const userId = ref('ThisIsEmily')
const taskId = ref('')
const currentStep = ref('loading') // 初始狀態設定為loading
const selectedQuestions = ref([])
const answers = ref({})
const currentQuestionIndex = ref(0)
const userInfo = ref({})
const uploadedData = ref({})
const uploadError = ref('')
const isInitialized = ref(false)


// 主要初始化函數
async function initializeApp() {
  console.log('=== MBTI 應用程序初始化開始 ===')

  try {
    window.uid = userId.value; // 確保全局 uid 設置
    // 確保用戶 ID 已設置
    if (!userId.value) {
      console.log('用戶 ID 未設置，顯示歡迎頁面')
      currentStep.value = 'welcome'
      return
    }
    
    // 查詢歷史 avatars
    if (userId.value) {
      try {
        console.log(`查詢用戶 ${userId.value} 的歷史 avatars`)
        const res = await fetch(`https://f2d8-60-248-142-124.ngrok-free.app/api/mbti/user/${userId.value}/avatars`, {
  headers: {
    'ngrok-skip-browser-warning': 'true'
  }
})
        const data = await res.json()
        console.log('歷史 avatars 數據:', data)
        
        if (data.result && data.result.avatars && data.result.avatars.length > 0) {
          // 取第一筆
          taskId.value = data.result.avatars[0].task_id
          currentStep.value = 'result'
          console.log('找到歷史 avatar，設置 taskId:', taskId.value)
        } else {
          console.log('沒有找到歷史 avatars')
          // 檢查 URL 是否有 mbti_type
          const urlParams = new URLSearchParams(window.location.search)
          if (urlParams.has('mbti_type') && urlParams.has('user_id')) {
            mbtiType.value = urlParams.get('mbti_type')
            externalUserId.value = urlParams.get('user_id')
            result.value = mbtiType.value
            currentStep.value = 'form'
            console.log('找到 mbti_type:', mbtiType.value)
          } else {
            // 無歷史頭像和 mbti_type，顯示歡迎頁面
            currentStep.value = 'welcome'
            console.log('顯示歡迎頁面')
          }
        }
      } catch (e) {
        console.error('查詢歷史 avatars 時發生錯誤:', e)
        currentStep.value = 'welcome' // 錯誤時顯示歡迎頁面
      }
    } else {
      currentStep.value = 'welcome'
      console.log('無用戶 ID，顯示歡迎頁面')
    }
  } catch (error) {
    console.error('初始化過程發生錯誤:', error)
    currentStep.value = 'welcome' // 錯誤時顯示歡迎頁面
  }
  
  isInitialized.value = true
  console.log('=== MBTI 應用程序初始化完成 ===')
}

// // 在掛載前執行初始化
onBeforeMount(async () => {
  await initializeApp()
})

// 組件掛載後的額外處理
onMounted(() => {
  console.log('Vue 組件已掛載，應用當前狀態:', {
    currentStep: currentStep.value,
    userId: userId.value,
    taskId: taskId.value
  })
})

// 步驟控制函數
function startQuiz() {
  currentStep.value = 'questions'
  selectedQuestions.value = generateFiveQuestions(rawQuestions.dimensions)
}

// 顯示當前題目
const currentQuestion = computed(() => selectedQuestions.value[currentQuestionIndex.value])

// 回答問題
function answerQuestion(selectedValue) {
  const dim = currentQuestion.value.dimension
  answers.value[dim] = selectedValue
  currentQuestionIndex.value++

  // 每次答題都更新 result
  result.value = ['EI', 'SN', 'TF', 'JP'].map(dim => answers.value[dim] || '').join('')

  // 如果所有問題都回答完了，進入表單頁面
  if (currentQuestionIndex.value >= selectedQuestions.value.length) {
    currentStep.value = 'form'
  }
}

// 處理表單提交
function handleFormSubmitted(formData) {
  userInfo.value = formData
  // 若有 mbtiType，result 取 mbtiType，否則取 MBTI 結果
  if (mbtiType.value) {
    result.value = mbtiType.value
  } else {
    result.value = ['EI', 'SN', 'TF', 'JP'].map(dim => answers.value[dim] || '').join('')
  }
  // 寫入 mbti_result_type
  document.cookie = `mbti_result_type=${encodeURIComponent(result.value)}; path=/; max-age=600`
  // 寫入 mbti_user_info
  formData.user_id = externalUserId.value || '';
  document.cookie = `mbti_user_info=${encodeURIComponent(JSON.stringify(formData))}; path=/; max-age=600`
  currentStep.value = 'upload'
}

// 處理上傳完成
function handleUploadProcessed(uploadData) {
  console.log('接收到上傳數據:', uploadData)
  uploadedData.value = uploadData
  
  // 如果有task_id，記錄它
  if (uploadData && uploadData.task_id) {
    taskId.value = uploadData.task_id
    uploadError.value = ''
    
    // 直接跳轉到結果頁面，由結果頁面來處理輪詢
    console.log('跳轉到結果頁面處理輪詢')
    currentStep.value = 'result'
  } else {
    // 處理錯誤情況
    uploadError.value = '上傳失敗，請稍後再試'
    currentStep.value = 'upload'
  }
}

// 出題邏輯
function generateFiveQuestions(dimensions) {
  const selected = []
  const usedQuestionIds = new Set()

  // 先從每個 dimension 隨機選一題
  for (const dim of dimensions) {
    const question = randomFrom(dim.questions, usedQuestionIds)
    if (question) {
      selected.push({ ...question, dimension: dim.name })
      usedQuestionIds.add(question.id)
    }
  }

  // 剩下所有未選過的題目
  const remaining = dimensions.flatMap(dim => 
    dim.questions
      .filter(q => !usedQuestionIds.has(q.id))
      .map(q => ({ ...q, dimension: dim.name }))
  )

  // 再隨機選一題
  const extra = randomFrom(remaining)
  if (extra) {
    selected.push(extra)
  }

  return selected
}

// 工具：從陣列中隨機取一個
function randomFrom(array, excludeSet = null) {
  const pool = excludeSet ? array.filter(q => !excludeSet.has(q.id)) : array
  if (pool.length === 0) return null
  return pool[Math.floor(Math.random() * pool.length)]
}

// 處理 Loading 完成
function handleLoadingComplete() {
  if (taskId.value) {
    // Loading完成後跳轉到結果頁面
    currentStep.value = 'result'
  } else {
    // 如果沒有任務ID，回到上傳頁面
    currentStep.value = 'upload'
  }
}

// 處理圖片加載完成
function handleImageLoaded(imageData) {
  console.log('結果頁獲取到圖片:', imageData)
  if (imageData && imageData.image_url) {
    uploadedData.value = {
      ...uploadedData.value,
      image_url: imageData.image_url
    }
    
    // 如果有獲取到 result_id，更新 taskId
    if (imageData.result_id) {
      console.log('更新專屬編號:', imageData.result_id)
      taskId.value = imageData.result_id
    }
    
    // 如果有獲取到性格信息，可以處理進一步的邏輯
    if (imageData.personality_info) {
      console.log('獲取到性格信息:', imageData.personality_info)
    }
  } else {
    currentStep.value = 'upload'
  }
}

// 處理下載請求
function handleDownloadRequested(downloadData) {
  liff.sendMessages([{
    type: 'image',
    originalContentUrl: downloadData.imageUrl,
    previewImageUrl: downloadData.imageUrl,
  }]);
  alert('圖片已發送到 LINE！');
}
</script>

<style scoped>
.app {
  font-family: 'Inter', sans-serif;
  overflow-x: hidden;
}

.conversation-id-screen {
  width: 100vw;
  height: 100vh;
  min-height: 932px;
  background: #5E60FE;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}
</style>
