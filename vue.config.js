const path = require('path');
// const polyfillNode = require('rollup-plugin-polyfill-node')

function resolve (dir) {
    return path.join(__dirname, dir)
}
module.exports = {
    lintOnSave: true,
    configureWebpack: {
      module: {
        rules: [
          {
            test: /\.wasm/,
            use: [
              {
                loader: 'file-loader'
              }
            ]
          }
        ]
      },
    },
    chainWebpack: (config)=>{
        config.resolve.alias
            .set('@$', resolve('src'))
    },
    devServer: {
      historyApiFallback: true,
      disableHostCheck: true,
      port: 8080,
      proxy: {
        '/showMANDB': {
          target: 'https://api.showmoney.app',
          changeOrigin: true,
          pathRewrite: {
            '^/showMANDB': '' // 重写接口
          }
        },
        'aggregation/v2/app/search': {
          target: 'https://api.showmoney.app',
          changeOrigin: true,
          pathRewrite: {
            // '^/aggregation': '' // 重写接口
          }
        },
        '/api/aggregation': {
          target: 'https://www.showbuzz.app/',
          changeOrigin: true,
          pathRewrite: {
            // '^/aggregation': '' // 重写接口
          }
        },
        '/aggregation': {
          target: 'https://api.showmoney.app',
          changeOrigin: true,
          pathRewrite: {
            // '^/aggregation': '' // 重写接口
          }
        }
      },
    },
    productionSourceMap: process.env.NODE_ENV != 'production',
    pluginOptions: {
      vite: {
        /**
         * Plugin[]
         * @default []
         */
        plugins: [
          require('rollup-plugin-polyfill-node')()
          // polyfillNode()
        ], // other vite plugins list, will be merge into this plugin\'s underlying vite.config.ts
        /**
         * Vite UserConfig.optimizeDeps options
         * recommended set `include` for speedup page-loaded time, e.g. include: ['vue', 'vue-router', '@scope/xxx']
         * @default {}
         */
        optimizeDeps: {
          exclude: ['bsv']
        },
        /**
         * type-checker, recommended disabled for large-scale old project.
         * @default false
         */
        disabledTypeChecker: true,
        /**
         * lint code by eslint
         * @default false
         */
        disabledLint: true,
      }
    },
}