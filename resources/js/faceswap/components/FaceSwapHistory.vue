<template>
  <div class="min-h-screen bg-[#333333] flex flex-col">
    <!-- Header -->
    <div class="flex justify-between items-center px-5 py-5 border-b border-[#EBD8B2]">
      <!-- Back arrow -->
      <button 
        class="w-[17px] h-[19px] cursor-pointer hover:opacity-80 transition-opacity"
        @click="goBack"
      >
        <img 
          src="/images/back.png"
          alt="Back Arrow"
          class="w-[17px] h-[19px] object-contain"
        />
      </button>
      
      <!-- Title -->
      <div class="font-noto-sans-tc text-xl font-bold text-[#EBD8B2]">
        圖片生成紀錄
      </div>
      
      <!-- Usage counter -->
      <div class="flex justify-center items-center w-[114px] h-8 rounded-[50px] bg-[#EBD8B2]">
        <div class="font-noto-sans-tc text-xs font-bold text-[#333]">
          剩餘次數：1/10
        </div>
      </div>
    </div>

    <!-- Grid of history items -->
    <div class="flex-1 px-6 py-8">
      <div class="grid grid-cols-2 gap-3 max-w-md mx-auto">
        <!-- History Item 1 -->
        <div class="flex w-full h-40 p-4 items-center gap-3 bg-[#6A6A6A] rounded-[5px]">
          <div class="flex w-full flex-col items-start gap-3">
            <img 
              src="https://api.builder.io/api/v1/image/assets/TEMP/c253dfe1e853fb5af2ff831c3b9c3bbbbfb128cb?width=240" 
              alt="Generated face swap image" 
              class="h-24 w-full object-cover rounded"
            />
            <div class="text-white font-normal text-xs">
              2025/8/12 14:02
            </div>
          </div>
        </div>
        
        <!-- History Item 2 -->
        <div class="flex w-full h-40 p-4 items-center gap-3 bg-[#6A6A6A] rounded-[5px]">
          <div class="flex w-full flex-col items-start gap-3">
            <img 
              src="https://api.builder.io/api/v1/image/assets/TEMP/0864aa3462cae8e04607353cdec307e5671638af?width=240" 
              alt="Generated face swap image" 
              class="h-24 w-full object-cover rounded"
            />
            <div class="text-white font-normal text-xs">
              2025/8/12 14:02
            </div>
          </div>
        </div>

        <!-- History Item 3 -->
        <div class="flex w-full h-40 p-4 items-center gap-3 bg-[#6A6A6A] rounded-[5px]">
          <div class="flex w-full flex-col items-start gap-3">
            <img 
              src="https://api.builder.io/api/v1/image/assets/TEMP/c253dfe1e853fb5af2ff831c3b9c3bbbbfb128cb?width=240" 
              alt="Generated face swap image" 
              class="h-24 w-full object-cover rounded"
            />
            <div class="text-white font-normal text-xs">
              2025/8/12 14:02
            </div>
          </div>
        </div>
        
        <!-- History Item 4 -->
        <div class="flex w-full h-40 p-4 items-center gap-3 bg-[#6A6A6A] rounded-[5px]">
          <div class="flex w-full flex-col items-start gap-3">
            <img 
              src="https://api.builder.io/api/v1/image/assets/TEMP/c253dfe1e853fb5af2ff831c3b9c3bbbbfb128cb?width=240" 
              alt="Generated face swap image" 
              class="h-24 w-full object-cover rounded"
            />
            <div class="text-white font-normal text-xs">
              2025/8/12 14:02
            </div>
          </div>
        </div>

        <!-- History Item 5 -->
        <div class="flex w-full h-40 p-4 items-center gap-3 bg-[#6A6A6A] rounded-[5px]">
          <div class="flex w-full flex-col items-start gap-3">
            <img 
              src="https://api.builder.io/api/v1/image/assets/TEMP/c253dfe1e853fb5af2ff831c3b9c3bbbbfb128cb?width=240" 
              alt="Generated face swap image" 
              class="h-24 w-full object-cover rounded"
            />
            <div class="text-white font-normal text-xs">
              2025/8/12 14:02
            </div>
          </div>
        </div>
        
        <!-- History Item 6 -->
        <div class="flex w-full h-40 p-4 items-center gap-3 bg-[#6A6A6A] rounded-[5px]">
          <div class="flex w-full flex-col items-start gap-3">
            <img 
              src="https://api.builder.io/api/v1/image/assets/TEMP/c253dfe1e853fb5af2ff831c3b9c3bbbbfb128cb?width=240" 
              alt="Generated face swap image" 
              class="h-24 w-full object-cover rounded"
            />
            <div class="text-white font-normal text-xs">
              2025/8/12 14:02
            </div>
          </div>
        </div>

        <!-- History Item 7 -->
        <div class="flex w-full h-40 p-4 items-center gap-3 bg-[#6A6A6A] rounded-[5px]">
          <div class="flex w-full flex-col items-start gap-3">
            <img 
              src="https://api.builder.io/api/v1/image/assets/TEMP/c253dfe1e853fb5af2ff831c3b9c3bbbbfb128cb?width=240" 
              alt="Generated face swap image" 
              class="h-24 w-full object-cover rounded"
            />
            <div class="text-white font-normal text-xs">
              2025/8/12 14:02
            </div>
          </div>
        </div>
        
        <!-- History Item 8 -->
        <div class="flex w-full h-40 p-4 items-center gap-3 bg-[#6A6A6A] rounded-[5px]">
          <div class="flex w-full flex-col items-start gap-3">
            <img 
              src="https://api.builder.io/api/v1/image/assets/TEMP/c253dfe1e853fb5af2ff831c3b9c3bbbbfb128cb?width=240" 
              alt="Generated face swap image" 
              class="h-24 w-full object-cover rounded"
            />
            <div class="text-white font-normal text-xs">
              2025/8/12 14:02
            </div>
          </div>
        </div>

        <!-- History Item 9 -->
        <div class="flex w-full h-40 p-4 items-center gap-3 bg-[#6A6A6A] rounded-[5px]">
          <div class="flex w-full flex-col items-start gap-3">
            <img 
              src="https://api.builder.io/api/v1/image/assets/TEMP/c253dfe1e853fb5af2ff831c3b9c3bbbbfb128cb?width=240" 
              alt="Generated face swap image" 
              class="h-24 w-full object-cover rounded"
            />
            <div class="text-white font-normal text-xs">
              2025/8/12 14:02
            </div>
          </div>
        </div>
        
        <!-- History Item 10 -->
        <div class="flex w-full h-40 p-4 items-center gap-3 bg-[#6A6A6A] rounded-[5px]">
          <div class="flex w-full flex-col items-start gap-3">
            <img 
              src="https://api.builder.io/api/v1/image/assets/TEMP/c253dfe1e853fb5af2ff831c3b9c3bbbbfb128cb?width=240" 
              alt="Generated face swap image" 
              class="h-24 w-full object-cover rounded"
            />
            <div class="text-white font-normal text-xs">
              2025/8/12 14:02
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { roadshowService } from '../../services/roadshowService.js'

const props = defineProps({
  userId: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['back'])

const historyData = ref([])
const isLoading = ref(false)
const error = ref(null)

// 獲取用戶歷史圖片
async function loadUserHistory() {
  if (!props.userId) {
    console.log('⚠️ 沒有用戶ID，無法載入歷史');
    return;
  }
  
  try {
    isLoading.value = true;
    error.value = null;
    
    console.log('🔍 載入用戶歷史:', props.userId);
    const result = await roadshowService.getUserHistory(props.userId);
    
    if (result && result.success) {
      historyData.value = result.data || [];
      console.log('✅ 歷史數據載入成功:', historyData.value);
    } else {
      console.log('⚠️ 使用預設歷史數據');
      // 使用預設數據
      historyData.value = [
        { id: 1, image: 'https://api.builder.io/api/v1/image/assets/TEMP/c253dfe1e853fb5af2ff831c3b9c3bbbbfb128cb?width=240', date: '2025/8/12 14:02' },
        { id: 2, image: 'https://api.builder.io/api/v1/image/assets/TEMP/0864aa3462cae8e04607353cdec307e5671638af?width=240', date: '2025/8/12 14:02' },
        { id: 3, image: 'https://api.builder.io/api/v1/image/assets/TEMP/c253dfe1e853fb5af2ff831c3b9c3bbbbfb128cb?width=240', date: '2025/8/12 14:02' },
        { id: 4, image: 'https://api.builder.io/api/v1/image/assets/TEMP/c253dfe1e853fb5af2ff831c3b9c3bbbbfb128cb?width=240', date: '2025/8/12 14:02' }
      ];
    }
  } catch (error) {
    console.error('❌ 載入歷史失敗:', error);
    // 使用預設數據
    historyData.value = [
      { id: 1, image: 'https://api.builder.io/api/v1/image/assets/TEMP/c253dfe1e853fb5af2ff831c3b9c3bbbbfb128cb?width=240', date: '2025/8/12 14:02' },
      { id: 2, image: 'https://api.builder.io/api/v1/image/assets/TEMP/0864aa3462cae8e04607353cdec307e5671638af?width=240', date: '2025/8/12 14:02' },
      { id: 3, image: 'https://api.builder.io/api/v1/image/assets/TEMP/c253dfe1e853fb5af2ff831c3b9c3bbbbfb128cb?width=240', date: '2025/8/12 14:02' },
      { id: 4, image: 'https://api.builder.io/api/v1/image/assets/TEMP/c253dfe1e853fb5af2ff831c3b9c3bbbbfb128cb?width=240', date: '2025/8/12 14:02' }
    ];
  } finally {
    isLoading.value = false;
  }
}

function goBack() {
  emit('back')
}

// 組件掛載時載入歷史
onMounted(() => {
  loadUserHistory();
});
</script>
