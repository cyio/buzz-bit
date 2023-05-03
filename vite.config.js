import { defineConfig } from 'vite';
import path from 'path';
import vue from '@vitejs/plugin-vue2'
import envCompatible from 'vite-plugin-env-compatible';
// import { createHtmlPlugin } from 'vite-plugin-html';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';
import inject from '@rollup/plugin-inject'
import nodeStdlibBrowser from 'node-stdlib-browser'
import { createStyleImportPlugin, VantResolve } from 'vite-plugin-style-import'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src'), ...nodeStdlibBrowser },
    extensions: [
      '.mjs',
      '.js',
      '.ts',
      '.jsx',
      '.tsx',
      '.json',
      '.vue'
    ]
  },
  plugins: [
    vue(),
    viteCommonjs(),
    envCompatible(),
    {
      ...inject({
          global: [require.resolve('node-stdlib-browser/helpers/esbuild/shim'), 'global'],
          process: [require.resolve('node-stdlib-browser/helpers/esbuild/shim'), 'process'],
          Buffer: [require.resolve('node-stdlib-browser/helpers/esbuild/shim'), 'Buffer'],
      }),
      enforce: 'post',
    },
    createStyleImportPlugin({ // 按需导入vant组件插件，解决vant按需导入样式丢失的问题
        resolves: [VantResolve()],
    }),
    VitePWA({ registerType: 'autoUpdate' })
    // createHtmlPlugin({
    //   // template: "./index.html",
    //   inject: {
    //     data: {
    //       title: 'buzz-bit'
    //     }
    //   }
    // })
  ],
  server: {
    port: 8080,
    // https: true,
    strictPort: false,
    proxy: {
      '/showMANDB': {
        target: 'https://api.showmoney.app',
        changeOrigin: true
      },
      '/metaaccess': {
        target: 'https://api.showmoney.app',
        changeOrigin: true
      },
      '/aggregation/v2/app/show/': {
        target: 'https://api.show3.io',
        changeOrigin: true
      },
      '/aggregation/v2/': {
        target: 'https://api.showmoney.app',
        changeOrigin: true
      },
      '/showpaycore/api/': {
        target: 'https://api.showmoney.app',
        changeOrigin: true
      },
      '/serviceapi/': {
        target: 'https://api.showmoney.app',
        changeOrigin: true
      },
      '/oauth2/': {
        target: 'https://www.showmoney.app',
        changeOrigin: true
      }
    }
  },
  build: {
    sourcemap: false
  }
})
