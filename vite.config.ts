import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // 讓 loadEnv 也能讀取系統層級的變數 (Netlify 的變數)
    const env = loadEnv(mode, process.cwd(), '');
    
    return {
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      define: {
        // 關鍵修正: 確保即使沒有 key 也不會變成 undefined，而是空字串
        // 這樣可以避免 'process is not defined' 錯誤
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || ""),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || "")
      }
    };
});
