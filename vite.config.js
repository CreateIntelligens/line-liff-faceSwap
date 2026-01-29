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
    publicDir: 'public',
    server: {
        host: '0.0.0.0',
        port: 5173,
        allowedHosts: [
            'localhost',
            '127.0.0.1',
            '069701b18b85.ngrok-free.app',
            '.ngrok-free.app',
        ],
    },
    build: {
        rollupOptions: {
            output: {
                entryFileNames: 'assets/[name].[hash].js',
                chunkFileNames: 'assets/[name].[hash].js',
                assetFileNames: (assetInfo) => {
                    // 字體文件放在 fonts 目錄，並加上 hash 以避免快取問題
                    if (/\.(otf|ttf|woff|woff2|eot)$/.test(assetInfo.name)) {
                        return 'fonts/[name].[hash][extname]'
                    }
                    // 圖片文件放在 images 目錄
                    if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(assetInfo.name)) {
                        return 'images/draw_lots_2026/[name].[hash][extname]'
                    }
                    return 'assets/[name].[hash][extname]'
                }
            }
        },
        assetsInlineLimit: 4096,
        copyPublicDir: true  // 啟用 public 目錄複製，確保字體文件可用
    }
});
