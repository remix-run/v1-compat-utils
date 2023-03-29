import { Outlet } from "@remix-run/react";
import type { V2_MetaArgs } from "@remix-run/react";
import { metaV1 } from "@remix-run/v1-meta";

export function meta(args: V2_MetaArgs) {
  return metaV1(args, {
    title: "Posts",
  });
}

export default function Posts() {
  return (
    <div style={{ border: "2px solid red" }}>
      <Outlet />
    </div>
  );
}
