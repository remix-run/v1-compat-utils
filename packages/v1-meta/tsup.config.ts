import { defineConfig } from "tsup";
import type { Options } from "tsup";

import pkgJSON from "./package.json";
let external = Object.keys(pkgJSON.dependencies || {});

export default defineConfig(() => {
  let sharedOptions: Options = {
    entry: ["src/index.ts"],
    sourcemap: true,
    external,
    tsconfig: "./tsconfig.json",
  };

  return [
    {
      ...sharedOptions,
      format: "cjs",
      dts: true,
    },
  ];
});
