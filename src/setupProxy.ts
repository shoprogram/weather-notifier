import { createProxyMiddleware } from "http-proxy-middleware";

module.exports = function (app: any) {
  // すべてのリクエストをログに出力
  // @ts-ignore
  app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
  });

  // プロキシミドルウェア
  app.use(
    "/api",
    createProxyMiddleware({
      target: "https://map.yahooapis.jp",
      changeOrigin: true,
      pathRewrite: {
        "^/api": "",
      },
      // @ts-ignore
      logLevel: "debug",
      // @ts-ignore
      onProxyReq: (proxyReq, req, res) => {
        console.log("Proxying request:", req.url);
      },
      // onProxyResのエラーメッセージを無視する
      // @ts-ignore
      onProxyRes: (proxyRes, req, res) => {
        console.log("Received response from target:", proxyRes.statusCode);
      },
    })
  );
};
