<template>
  <div class="flex justify-center items-center w-[114px] h-8 rounded-[50px]" style="background: linear-gradient(to bottom, #FD7BB9 0%, #FEAEC7 23%, #FFB3CD 77%, #FC7BBB 100%);">
    <div class="cp-font text-xs font-bold text-[#0E0E0E]">
      已生成：{{ currentCount }}/{{ maxLimit }}
    </div>
  </div>
</template>

<script setup>
import { watch } from 'vue'
import { appConfig } from '@/config/appConfig'

const props = defineProps({
  currentCount: {
    type: Number,
    default: 0
  },
  maxLimit: {
    type: Number,
    default: appConfig.maxUsageLimit
  }
})

// 監聽 currentCount 的變化，用於調試
watch(() => props.currentCount, (newCount, oldCount) => {
  if (oldCount !== newCount) {
    console.log('📊 使用量更新:', `${oldCount || 0} → ${newCount}`)
  }
}, { immediate: true })
</script>
