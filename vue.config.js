module.exports = {
  // 配置跨域代理
  devServer: {
    // Paths
    host: 'localhost',
    port: '8080',
    https: false,
    open: true,
    proxy: {
      '/api': {
        target: 'http://backend-api-02.newbee.ltd/manage-api/v1', // 代理目标的基础路径
        changeOrigin: true, // 支持跨域
        pathRewrite: {
          '^\\/api': ''
        }
      }
    }
  }
}
