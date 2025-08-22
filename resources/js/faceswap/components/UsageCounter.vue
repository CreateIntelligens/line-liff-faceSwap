<template>
  <div class="flex justify-center items-center w-[114px] h-8 rounded-[50px] bg-[#EBD8B2]">
    <div class="font-noto-sans-tc text-xs font-bold text-[#333]">
      已生成：{{ currentCount }}/{{ maxLimit }}
    </div>
  </div>
</template>

<script setup>
import { watch } from 'vue'

const props = defineProps({
  currentCount: {
    type: Number,
    default: 0
  },
  maxLimit: {
    type: Number,
    default: 10
  }
})

// 監聽 currentCount 的變化，用於調試
watch(() => props.currentCount, (newCount, oldCount) => {
  if (oldCount !== newCount) {
    console.log('📊 使用量更新:', `${oldCount || 0} → ${newCount}`)
  }
}, { immediate: true })
</script>
