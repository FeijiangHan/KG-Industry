const path = require('path')

module.exports = {
  // webpack 配置
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  //服务器代理
  devServer: {
    proxy: {
      "/api/": {
        target: 'http://127.0.0.1:8089',
        changeOrigin: true,
        secure: false,
      },
    },
  },

}
