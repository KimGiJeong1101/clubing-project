
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://api.vworld.kr',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '', // /api를 빈 문자열로 변환
      },
      onProxyReq: (proxyReq, req, res) => {
        console.log('Proxying request to:', proxyReq.url);
      },
    })
  );
};

