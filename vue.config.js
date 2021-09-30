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
          }
        ]
      },
    },
    chainWebpack: (config)=>{
        config.resolve.alias
            .set('@$', resolve('src'))
    },
    devServer: {
      disableHostCheck: true,
      proxy: {
        '/showMANDB': {
          target: 'https://api.showmoney.app',
          changeOrigin: true,
          pathRewrite: {
            '^/showMANDB': '' // 重写接口
          }
        }      
      },
      historyApiFallback: false,
    },
}