import { Outlet } from "@remix-run/react";
import type { V2_MetaArgs } from "@remix-run/react";
import { metaV1 } from "@remix-run/v1-meta";

export function meta(args: V2_MetaArgs) {
  return metaV1(args, {
    title: "Posts",
    description: "All the posts",
    "og:image": ["https://remix.run/logo.png", "https://remix.run/logo2.png"],
  });
}

export default function Posts() {
  return (
    <div style={{ border: "2px solid red" }}>
      <Outlet />
    </div>
  );
}
