const { createRoutesFromFolders } = require("@remix-run/v1-route-convention");

/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: "build/index.js",
  // publicPath: "/build/",
  future: { v2_routeConvention: true },
  routes(defineRoutes) {
    return createRoutesFromFolders(defineRoutes, { routesDirectory: "other" });
  },
};
