import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// 自动导入组件和工具
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig(({ mode }) => {
  // 根据当前工作目录中的 `mode` 加载 .env 文件
  // 设置第三个参数为 '' 来加载所有环境变量，而不管是否有 `VITE_` 前缀。
  const env = loadEnv(mode, process.cwd(), '')

  return {
    // 开发服务器配置
    server: {
      host: '0.0.0.0',
      port: 5173,
      open: true,
      cors: true,
      proxy: {
        // API代理配置
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:8080',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },

    // 构建配置
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      minify: 'terser',
      rollupOptions: {
        output: {
          // 分包配置
          manualChunks: {
            vendor: ['vue', 'vue-router', 'pinia'],
            element: ['element-plus'],
            echarts: ['echarts'],
            utils: ['axios', 'lodash-es', 'dayjs']
          }
        }
      },
      terserOptions: {
        compress: {
          drop_console: env.NODE_ENV === 'production',
          drop_debugger: true
        }
      }
    },

    // 路径别名配置
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@components': resolve(__dirname, 'src/components'),
        '@views': resolve(__dirname, 'src/views'),
        '@api': resolve(__dirname, 'src/api'),
        '@utils': resolve(__dirname, 'src/utils'),
        '@store': resolve(__dirname, 'src/store'),
        '@types': resolve(__dirname, 'src/types')
      }
    },

    // CSS配置
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/styles/variables.scss";`
        }
      }
    },

    // 插件配置
    plugins: [
      vue(),
      
      // 自动导入配置
      AutoImport({
        resolvers: [ElementPlusResolver()],
        imports: [
          'vue',
          'vue-router',
          'pinia',
          'vue-i18n',
          '@vueuse/core'
        ],
        dts: true, // 生成 .d.ts 文件
        dtsDir: 'src/types/auto'
      }),

      // 自动组件导入
      Components({
        resolvers: [ElementPlusResolver()],
        dts: true
      })
    ],

    // 开发环境配置
    define: {
      __VUE_PROD_DEVTOOLS__: false
    }
  }
})