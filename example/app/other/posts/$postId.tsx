import { Link, useParams } from "@remix-run/react";
import type { V2_MetaArgs } from "@remix-run/react";
import { metaV1 } from "@remix-run/v1-meta";

export function meta(args: V2_MetaArgs) {
  return metaV1(args, {
    title: `Post ${args.params.postId}`,
  });
}

export default function Post() {
  let params = useParams();
  return (
    <div>
      <h1>Post {params.postId}</h1>
      <Link to="../">Back to Posts</Link>
    </div>
  );
}
