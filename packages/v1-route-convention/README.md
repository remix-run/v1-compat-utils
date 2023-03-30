# V1 Route Convention

```js
// remix.config.js
const { createRoutesFromFolders } = require("@remix-run/v1-route-convention");

// tell Remix to ignore everything in the routes directory 
// we'll let `createRoutesFromFolders` take care of that
exports.ignoredRouteFiles = ["**/*"];
exports.routes = (defineRoutes) => createRoutesFromFolders(defineRoutes);
```

> **Note**
> If you're already using `ignoredRouteFiles` you can move that to the plugin to keep using it

```diff
// remix.config.js
const { createRoutesFromFolders } = require("@remix-run/v1-route-convention");

- exports.ignoredRouteFiles = ["**/.*"];
+ exports.ignoredRouteFiles = ["**/*"];
+ exports.routes = (defineRoutes) => createRoutesFromFolders(defineRoutes, { 
+   ignoredFilePatterns: ["**/.*"] 
+ });
```
