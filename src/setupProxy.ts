import { createProxyMiddleware } from "http-proxy-middleware";

module.exports = function (app: any) {
  app.use(
    "/api",
    createProxyMiddleware(
      {
      target: "https://map.yahooapis.jp/",
      secure: false,
      changeOrigin: true,
      autoRewrite: true,
      pathRewrite: {
        "^/api": "",
      },
    })
  );
};
