<template>
  <div 
    :class="[
      'text-sm font-medium cp-font',
      showHistoryLabel ? 'cursor-pointer transition-opacity hover:opacity-80' : ''
    ]"
    style="color: #E0BE91;"
    @click="handleClick"
  >
    <template v-if="showHistoryLabel">
      <span class="underline inline-block transition-transform duration-200 hover:scale-105 active:scale-105">
        抽籤紀錄
      </span>
      <span>
        &nbsp;/ 已抽籤 : {{ currentCount }}/{{ maxLimit }}
      </span>
    </template>
    <template v-else>
      已抽籤 : {{ currentCount }}/{{ maxLimit }}
    </template>
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
  },
  showHistoryLabel: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['click'])

function handleClick() {
  if (!props.showHistoryLabel) return
  emit('click')
}

// 監聽 currentCount 的變化，用於調試
watch(() => props.currentCount, (newCount, oldCount) => {
  if (oldCount !== newCount) {
    console.log('📊 使用量更新:', `${oldCount || 0} → ${newCount}`)
  }
}, { immediate: true })
</script>
