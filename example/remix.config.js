const { createRoutesFromFolders } = require("@remix-run/route-convention");

/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  appDirectory: "app",
  assetsBuildDirectory: "public/build",
  serverBuildPath: "build/index.js",
  publicPath: "/build/",
  future: { v2_routeConvention: true },
  ignoredRouteFiles: ["**/*"],
  routes(defineRoutes) {
    return createRoutesFromFolders(defineRoutes, "app/routes");
  },
};
