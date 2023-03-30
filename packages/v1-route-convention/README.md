# V1 Route Convention

```js
// remix.config.js
const { createRoutesFromFolders } = require("@remix-run/v1-route-convention");

// tell Remix to ignore everything in the routes directory 
// we'll let `createRoutesFromFolders` take care of that
// if you're using `ignoredRouteFiles` already, you move your current list
// to createRoutesFromFolders(defineRoutes, { ignoredFilePatterns });
exports.ignoredRouteFiles = ["**/*"];
exports.routes = (defineRoutes) => createRoutesFromFolders(defineRoutes);
```
