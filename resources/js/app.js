import './bootstrap';
import { createApp } from 'vue'
import MbtiQuiz from './mbti/App.vue'
// 如果還有其他 component 可以繼續 import
// import AnotherComponent from './pages/Another.vue'

const components = {
  MbtiQuiz,
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
