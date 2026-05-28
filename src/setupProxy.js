const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function setupProxy(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: process.env.DATA_API_PROXY || 'http://localhost:3001',
      changeOrigin: true,
    })
  );
};
