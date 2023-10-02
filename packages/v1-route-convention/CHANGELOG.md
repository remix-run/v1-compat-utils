# `@remix-run/v1-route-convention`

## 0.1.4

### Patch Changes

- Simplify build to only emit CJS files which allows this to be used in either an ESM or CJS Remix application without running into module format issues ([#25](https://github.com/remix-run/v1-compat-utils/pull/25))

## 0.1.3

### Patch Changes

- add remix v2 to peer dependencies ([#28](https://github.com/remix-run/v1-compat-utils/pull/28))

## 0.1.2

### Patch Changes

- Fix route ranking bug with pathless layout route next to a sibling index route ([#20](https://github.com/remix-run/v1-compat-utils/pull/20))
  - Under the hood this is done by removing the trailing slash from all generated `path` values since the number of slash-delimited segments counts towards route ranking so the trailing slash incorrectly increases the score for routes
- Support sibling pathless layout routes by removing pathless layout routes from the unique route path checks in conventional route generation since they inherently trigger duplicate paths ([#20](https://github.com/remix-run/v1-compat-utils/pull/20))

## 0.1.1

### Patch Changes

- Bump `devDependencies` for stable Remix release ([`e54e8c4`](https://github.com/remix-run/v1-compat-utils/commit/e54e8c48aa9d3d2d220ee35c2baa740d8d4d11d2))

## 0.1.0

### Minor Changes

- Initial release ([`e15dfbb`](https://github.com/remix-run/v1-compat-utils/commit/e15dfbbe9d5f59e9200a3aa52ece65c024b2109f))
