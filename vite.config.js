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
        allowedHosts: [
            'localhost',
            '127.0.0.1',
            '069701b18b85.ngrok-free.app',  // 允許 ngrok 域名
            '.ngrok-free.app',  // 允許所有 ngrok 免費域名
        ],
    },
    // 建置配置 - 圖片檔案名稱帶雜湊並放到自定義目錄
    build: {
        rollupOptions: {
            output: {
                // JS/CSS 檔案放 assets/ 目錄
                entryFileNames: 'assets/[name].[hash].js',
                chunkFileNames: 'assets/[name].[hash].js',
                assetFileNames: (assetInfo) => {
                    // 判斷是不是圖片檔案
                    if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(assetInfo.name)) {
                        // 圖片放到 images/mbti-project/ 目錄，檔名帶雜湊
                        return 'images/faceswap/[name].[hash][extname]'
                    }
                    // 其他靜態資源（CSS、字體等）放 assets/ 目錄
                    return 'assets/[name].[hash][extname]'
                }
            }
        }
    }
});
