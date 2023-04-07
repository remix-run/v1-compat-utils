# V1 Route Convention

Enables the [v1 route file convention](https://remix.run/docs/en/v1/file-conventions/routes-files) in Remix v2.

```js
// remix.config.js
const { createRoutesFromFolders } = require("@remix-run/v1-route-convention");

/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  // Tell Remix to ignore everything in the routes directory.
  // We'll let `createRoutesFromFolders` take care of that.
  ignoredRouteFiles: ["**/*"],
  routes: (defineRoutes) => {
    // `createRoutesFromFolders` will create routes for all files in the
    // routes directory using the same default conventions as Remix v1.
    return createRoutesFromFolders(defineRoutes, {
      // If you're already using `ignoredRouteFiles` in your Remix config,
      // you can move them to `ignoredFilePatterns` in the plugin's options.
      ignoredFilePatterns: ["**/.*", "**/*.css"],
    });
  },
};
```
