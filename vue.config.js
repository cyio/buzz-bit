const path = require('path');
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
          },
          {
            test:/\.mjs$/,
            include: /node_modules/,
            type: "javascript/auto"  
          },
          // not work?
          // {
          //   test: /\.less$/,
          //   use: [
          //     {
          //       loader: 'less-loader',
          //       options: {
          //         lessOptions: {
          //           modifyVars: {
          //             '@button-default-background-color': 'red',
          //             '@tabs-bottom-bar-color': 'red'
          //           },
          //         },
          //       },
          //     },
          //   ],
          // },
        ]
      },
    },
    chainWebpack: (config)=>{
        config.resolve.alias
            .set('@$', resolve('src'))
    },
    // css: {
    //   loaderOptions: {
    //     postcss: {
    //       plugins: [require('tailwindcss'), require('autoprefixer')]
    //     }
    //   }
    // },
    devServer: {
      historyApiFallback: true,
      disableHostCheck: true,
      proxy: {
        '/showMANDB': {
          target: 'https://api.showmoney.app',
          changeOrigin: true,
          pathRewrite: {
            // '^/showMANDB': '' // 重写接口
          }
        },
        '/metaaccess': {
          target: 'https://api.showmoney.app',
          changeOrigin: true,
          pathRewrite: {
            // '^/showMANDB': '' // 重写接口
          }
        },
        '/aggregation/v2/': {
          target: 'https://api.showmoney.app',
          changeOrigin: true,
          pathRewrite: {
            // '^/aggregation': '' // 重写接口
          }
        },
        '/showpaycore/api/': {
          target: 'https://api.showmoney.app',
          changeOrigin: true,
          pathRewrite: {
            // '^/aggregation': '' // 重写接口
          }
        },
        '/serviceapi/': {
          target: 'https://api.showmoney.app',
          changeOrigin: true,
          pathRewrite: {
            // '^/aggregation': '' // 重写接口
          }
        },
        '/oauth2/': {
          target: 'https://www.showmoney.app',
          changeOrigin: true,
          pathRewrite: {
            // '^/aggregation': '' // 重写接口
          }
        },
        // '/api/aggregation': {
        //   target: 'https://www.showbuzz.app/',
        //   changeOrigin: true,
        //   pathRewrite: {
        //     // '^/aggregation': '' // 重写接口
        //   }
        // },
      },
    },
    pwa: {
      iconPaths: {
        favicon32: 'favicon.png',
        favicon16: 'favicon.png',
        appleTouchIcon: 'favicon.png',
        maskIcon: 'favicon.png',
        msTileImage: 'favicon.png'
      }
    },
    productionSourceMap: process.env.NODE_ENV != 'production'
}