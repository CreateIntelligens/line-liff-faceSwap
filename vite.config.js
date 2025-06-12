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
    publicDir: 'public'
});
