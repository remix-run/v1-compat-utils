import { Link, useParams } from "@remix-run/react";

export default function () {
  let params = useParams();
  return (
    <div>
      <h1>Post {params.postId}</h1>
      <Link to="../">Back to Posts</Link>
    </div>
  );
}
