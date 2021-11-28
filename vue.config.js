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
    devServer: {
      historyApiFallback: true,
      disableHostCheck: true,
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
    productionSourceMap: process.env.NODE_ENV != 'production'
}