# V1 Meta

```tsx
import { metaV1 } from "@remix-run/v1-meta";

export function meta(args) {
  return metaV1(args, {
    title: "My App",
    description: "My App Description",
  });
  //   return [
  //     { charSet: "utf-8" }, // inherited!
  //     { title: "My App" },
  //     { name: "description", content: "My App Description" },
  //   ];
}
```
