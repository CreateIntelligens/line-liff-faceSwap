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
const emit = defineEmits(['back'])

function goBack() {
  emit('back')
}
</script>

<style scoped>
/* 組件樣式 - 使用 Flexbox 和 Grid 佈局，無需額外的定位樣式 */
</style>
