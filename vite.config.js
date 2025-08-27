import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path';
import { readdirSync, copyFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';

// 自定義插件：處理 public 目錄下的圖片
function publicImagesPlugin() {
  return {
    name: 'public-images-plugin',
    generateBundle(options, bundle) {
      // 創建目標目錄
      const targetDir = 'images/face-swap';
      mkdirSync(join(options.dir, targetDir), { recursive: true });
      
      // 複製並重命名圖片檔案
      const publicImagesDir = join(__dirname, 'public/images');
      try {
        const files = readdirSync(publicImagesDir);
        files.forEach(file => {
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(file)) {
            const sourcePath = join(publicImagesDir, file);
            const fileName = file.replace(/\.[^/.]+$/, ''); // 移除副檔名
            const ext = file.match(/\.[^/.]+$/)[0]; // 取得副檔名
            const hash = Math.random().toString(36).substring(2, 8); // 生成雜湊
            const targetFileName = `${fileName}.${hash}${ext}`;
            const targetPath = join(options.dir, targetDir, targetFileName);
            
            copyFileSync(sourcePath, targetPath);
            console.log(`📁 圖片已處理: ${file} → ${targetDir}/${targetFileName}`);
          }
        });
        
        // 建置完成後，刪除重複的 images 目錄（只保留 face-swap 子目錄）
        const imagesDir = join(options.dir, 'images');
        const imageFiles = readdirSync(imagesDir);
        imageFiles.forEach(file => {
          if (file !== 'face-swap') {
            const filePath = join(imagesDir, file);
            rmSync(filePath, { recursive: true, force: true });
            console.log(`🗑️ 刪除重複檔案: ${file}`);
          }
        });
        
      } catch (error) {
        console.error('❌ 處理 public 圖片時發生錯誤:', error);
      }
    }
  };
}

export default defineConfig({
    plugins: [
        vue(),
        publicImagesPlugin(), // 添加自定義插件
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'resources/js'),
        },
    },
    // 恢復 public 目錄處理，讓 Vue 組件能正常引用圖片
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
                        // 圖片放到 images/face-swap/ 目錄，檔名帶雜湊
                        return 'images/face-swap/[name].[hash][extname]'
                    }
                    // 其他靜態資源（CSS、字體等）放 assets/ 目錄
                    return 'assets/[name].[hash][extname]'
                }
            }
        },
        // 處理 public 目錄下的圖片
        assetsInlineLimit: 0, // 不內聯小圖片
        // 自定義 public 目錄處理
        copyPublicDir: true
    }
});
