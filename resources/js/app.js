import './bootstrap';
import '../css/app.css';  // 引入 Tailwind CSS
import { createApp } from 'vue'
import FaceSwapApp from './faceswap/App.vue'
import { imageUrls } from './config/imageUrls.js'

// 將 imageUrls 暴露到 window，讓 index.html 可以讀取 OG 圖片路徑（包含 hash）
window.imageUrls = imageUrls

const components = {
  FaceSwapApp,
  // AnotherComponent,
}

const el = document.getElementById('vue-root')

if (el) {
  const componentName = el.dataset.component
  const Component = components[componentName]

  if (Component) {
    createApp(Component).mount(el)
  } else {
    console.warn(`Vue component "${componentName}" not found.`)
  }
}

