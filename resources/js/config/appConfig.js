// 應用程式配置
import testMockImage from '../../images/test.jpg'
const endpoint =
  typeof window !== 'undefined' && window.endpoint ? window.endpoint : {}

// 解析布林值（支援字串 'true'/'false'）
function parseBoolean(value, defaultValue = false) {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    const lower = value.toLowerCase()
    if (lower === 'true') return true
    if (lower === 'false') return false
  }
  if (typeof value === 'number') {
    return value !== 0
  }
  return defaultValue
}

export const appConfig = {
  // 每個用戶的最大生成數量限制
  maxUsageLimit: 3,

  // 是否在前端使用固定測試圖片，而不實際呼叫生成 API
  // 可由 index.html 的 window.endpoint.useMockGeneratedImage 控制
  useMockGeneratedImage: parseBoolean(endpoint.useMockGeneratedImage, false),

  // 固定測試圖片路徑
  // 之後一律由前端控制，後端只負責切換 useMockGeneratedImage true/false
  // 減少部署時因路徑錯誤造成 404 的風險
  mockGeneratedImagePath: testMockImage
}

