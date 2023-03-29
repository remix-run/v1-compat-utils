import type { V2_MetaArgs } from "@remix-run/react";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { metaV1 } from "@remix-run/v1-meta";

export function meta(args: V2_MetaArgs) {
  return metaV1(args, {
    charSet: "utf-8",
    viewport: "width=device-width,initial-scale=1",
    title: "Remix Example",
  });
}

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
