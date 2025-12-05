import html2canvas from 'html2canvas'

export function useScreenshot() {
  // 預載入並轉換跨域圖片為 base64
  async function preloadAndConvertImages(container) {
    const images = container.querySelectorAll('img')
    const originalSrcs = new Map() // 儲存原始 src
    
    const convertPromises = Array.from(images).map(async (img) => {
      // 儲存原始 src
      originalSrcs.set(img, img.src)
      
      // 如果是跨域圖片，嘗試轉換為 base64
      if (img.src.includes('stg-api.fanpokka.ai') || img.src.includes('voice.5gao.ai')) {
        try {
          console.log('🔄 正在轉換跨域圖片:', img.src)
          const base64 = await convertImageToBase64(img.src)
          img.src = base64
          console.log('✅ 跨域圖片已轉換為 base64')
        } catch (error) {
          console.warn('⚠️ 無法轉換跨域圖片，將使用佔位符:', error)
          // 使用佔位符
          const width = img.naturalWidth || img.width || 300
          const height = img.naturalHeight || img.height || 200
          img.src = createPlaceholderImage(width, height)
        }
      } else {
        // 確保本地圖片已載入
        if (!img.complete) {
          await new Promise((resolve) => {
            img.onload = resolve
            img.onerror = resolve
            setTimeout(resolve, 3000) // 3秒超時
          })
        }
      }
    })
    
    await Promise.all(convertPromises)
    console.log('🖼️ 圖片預處理完成')
    
    return originalSrcs
  }

  // 恢復原始圖片 src
  function restoreOriginalImages(originalSrcs) {
    originalSrcs.forEach((originalSrc, img) => {
      img.src = originalSrc
    })
    console.log('🔄 已恢復原始圖片 src')
  }

  // 將圖片轉換為 base64
  async function convertImageToBase64(imageUrl) {
    return new Promise((resolve, reject) => {
      // 使用 Image 方法，設置 crossOrigin
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          canvas.width = img.naturalWidth || img.width
          canvas.height = img.naturalHeight || img.height
          
          ctx.drawImage(img, 0, 0)
          
          const base64 = canvas.toDataURL('image/jpeg', 0.9)
          resolve(base64)
        } catch (error) {
          console.warn('Canvas 轉換失敗，嘗試 fetch 方法:', error)
          // 如果 Canvas 方法失敗，嘗試 fetch
          fetchImageAsBase64(imageUrl).then(resolve).catch(reject)
        }
      }
      
      img.onerror = () => {
        console.warn('Image 載入失敗，嘗試 fetch 方法')
        // 如果 Image 方法失敗，嘗試 fetch
        fetchImageAsBase64(imageUrl).then(resolve).catch(reject)
      }
      
      // 設置超時
      setTimeout(() => {
        reject(new Error('圖片載入超時'))
      }, 10000)
      
      img.src = imageUrl
    })
  }

  // 使用 fetch 獲取圖片並轉換為 base64
  async function fetchImageAsBase64(imageUrl) {
    try {
      const response = await fetch(imageUrl, {
        mode: 'cors',
        credentials: 'omit'
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const blob = await response.blob()
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = () => reject(new Error('FileReader 錯誤'))
        reader.readAsDataURL(blob)
      })
    } catch (error) {
      throw new Error(`Fetch 失敗: ${error.message}`)
    }
  }

  // 創建佔位符圖片
  function createPlaceholderImage(width = 300, height = 200) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    canvas.width = width
    canvas.height = height
    
    // 繪製背景
    ctx.fillStyle = '#333333'
    ctx.fillRect(0, 0, width, height)
    
    // 繪製邊框
    ctx.strokeStyle = '#EBD8B2'
    ctx.lineWidth = 3
    ctx.strokeRect(15, 15, width - 30, height - 30)
    
    // 繪製內部背景
    ctx.fillStyle = '#2a2a2a'
    ctx.fillRect(20, 20, width - 40, height - 40)
    
    // 繪製圖標（簡單的相機圖標）
    const iconSize = Math.min(width, height) * 0.15
    const iconX = width / 2 - iconSize / 2
    const iconY = height / 2 - iconSize / 2 - 10
    
    ctx.strokeStyle = '#EBD8B2'
    ctx.lineWidth = 2
    ctx.strokeRect(iconX, iconY, iconSize, iconSize * 0.7)
    ctx.strokeRect(iconX + iconSize * 0.1, iconY - iconSize * 0.1, iconSize * 0.8, iconSize * 0.2)
    
    // 繪製文字
    ctx.fillStyle = '#EBD8B2'
    ctx.font = `${Math.max(12, width / 20)}px Arial`
    ctx.textAlign = 'center'
    ctx.fillText('AI 生成圖片', width / 2, height / 2 + 20)
    
    return canvas.toDataURL('image/jpeg', 0.9)
  }

  // 截圖功能
  async function captureScreenshot(container) {
    if (!container) {
      throw new Error('找不到截圖區域')
    }
    
    // 預載入並轉換跨域圖片
    const originalSrcs = await preloadAndConvertImages(container)
    
    // 使用高解析度配置
    const originalCanvas = await html2canvas(container, {
      backgroundColor: '#333333',
      scale: 2,        // 調整為 2 倍解析度，減少圖片寬度
      logging: false,
      useCORS: true,          // 啟用 CORS 支援
      allowTaint: false,      // 避免被視為汙染畫布
      foreignObjectRendering: false // 關閉，避免黑屏問題
    })
    
    // 恢復原始圖片 src
    restoreOriginalImages(originalSrcs)
    
    // 創建高品質 Canvas 並添加邊距，同時縮放圖片
    const padding = 40
    const scaleFactor = 0.8  // 縮放係數，0.8 = 80% 寬度
    const newCanvas = document.createElement('canvas')
    const ctx = newCanvas.getContext('2d')
    
    // 設定新 Canvas 的尺寸（縮放後的尺寸 + 邊距）
    newCanvas.width = (originalCanvas.width * scaleFactor) + (padding * 2)
    newCanvas.height = (originalCanvas.height * scaleFactor) + (padding * 2)
    
    // 設定高品質渲染
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    
    // 填充背景色
    ctx.fillStyle = '#333333'
    ctx.fillRect(0, 0, newCanvas.width, newCanvas.height)
    
    // 將原始 Canvas 縮放後繪製到新 Canvas 上，留出邊距
    ctx.drawImage(
      originalCanvas, 
      padding, 
      padding, 
      originalCanvas.width * scaleFactor, 
      originalCanvas.height * scaleFactor
    )
    
    return newCanvas
  }

  // 圖片壓縮功能 - 高品質 PNG 輸出
  async function compressImage(canvas) {
    return new Promise((resolve, reject) => {
      // 使用高品質 PNG 格式
      canvas.toBlob((blob) => {
        if (blob) {
          console.log('✅ Canvas 轉換為高品質 Blob 成功，大小:', blob.size)
          resolve(blob)
        } else {
          reject(new Error('無法生成圖片 blob'))
        }
      }, 'image/png', 1.0) // PNG 格式，100% 品質
    })
  }

  // 本地測試：下載截圖到本機
  function downloadToLocal(blob, filename = 'screenshot') {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}-${Date.now()}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    console.log('📥 截圖已下載到本機')
  }

  // 上傳圖片到伺服器
  async function uploadImage(blob, userId = 'abc', filename = 'screenshot') {
    const formData = new FormData()
    formData.append('file', blob, `${filename}.png`)
    formData.append('uid', userId)
    
    const response = await fetch(`${window.endpoint.baseURL}/image/fancy_frontier`, {
      method: 'POST',
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: formData
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `上傳失敗: ${response.status}`)
    }
    
    const data = await response.json()
    return data.result.path || data.path || data.data?.url
  }

  // 透過 LIFF 發送圖片
  async function sendViaLiff(imageUrl) {
    // 檢查 LIFF 是否可用
    if (typeof liff === 'undefined') {
      throw new Error('LIFF 不可用，無法發送圖片')
    }
    
    // 檢查是否在 LINE 應用內
    if (!liff.isInClient()) {
      throw new Error('請在 LINE 應用內使用此功能')
    }
    
    // 檢查是否已登入
    if (!liff.isLoggedIn()) {
      throw new Error('請先登入 LINE')
    }
    
    // 發送圖片
    await liff.sendMessages([{
      type: 'image',
      originalContentUrl: imageUrl,
      previewImageUrl: imageUrl
    }]).then(() => {
      //
    })
    .catch((err) => {
      throw new Error(`發送圖片失敗: ${err.message || err.toString()}`)
    });
  }

  // 顯示訊息提示
  function showMessage(message, type = 'info') {
    // 創建提示元素
    const messageEl = document.createElement('div')
    messageEl.className = `fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-md text-white text-sm font-medium transition-all duration-300`
    
    // 根據類型設置樣式
    switch (type) {
      case 'success':
        messageEl.className += ' bg-green-500'
        break
      case 'error':
        messageEl.className += ' bg-red-500'
        break
      case 'info':
      default:
        messageEl.className += ' bg-blue-500'
        break
    }
    
    messageEl.textContent = message
    document.body.appendChild(messageEl)
    
    // 3秒後移除提示
    setTimeout(() => {
      if (messageEl.parentNode) {
        messageEl.parentNode.removeChild(messageEl)
      }
    }, 3000)
  }

  return {
    captureScreenshot,
    compressImage,
    downloadToLocal,
    uploadImage,
    sendViaLiff,
    showMessage
  }
}
