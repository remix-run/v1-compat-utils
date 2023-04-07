# V1 Meta

Enables the [v1 route meta API](https://remix.run/docs/en/v1/route/meta) in Remix v2.

```tsx
import { metaV1, getMatchesData } from "@remix-run/v1-meta";

export const meta = (args) => {
  // In the v1 API, `meta` received a `parentsData` argument, which is an
  // object keyed by each parent route ID containing the data returned by
  // that route's `loader` function. This argument is removed from the
  // v2 API. `getMatchesData` will construct an object with the same
  // signature, allowing you to easily refactor your code.
  let matchesData = getMatchesData(args);
  let rootData = matchesData["root"];

  // This function will construct an array of `V2_MetaDescriptor` objects.
  // It will use the same heuristics as Remix v1 to merge the parent
  // route's meta values with the data you provide.
  return metaV1(args, {
    title: "My App",
    description: "My App Description",
  });

  // output:
  return [
    // This is inherited from the parent route!
    { charSet: "utf-8" },
    // If your parent has a title it will be overridden!
    { title: "My App" },
    { name: "description", content: "My App Description" },
  ];
};
```
