import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path';

export default defineConfig({
    plugins: [
        vue(),
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'resources/js'),
        },
    },
    // 确保 public 目录被正确处理
    publicDir: 'public',
    // 添加伺服器配置
    server: {
        host: '0.0.0.0',  // 監聽所有網路介面
        port: 5173,       // 默認端口
    }
});
