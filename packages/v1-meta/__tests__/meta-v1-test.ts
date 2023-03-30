import type { V2_MetaArgs as MetaArgs } from "@remix-run/react";
import { metaV1 as _metaV1 } from "../src/index";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

let metaV1 = _metaV1;
if (import.meta.env.TEST_BUILD) {
  try {
    metaV1 = require("../dist/index").mergeMeta;
  } catch (_) {}
}

describe("metaV1", () => {
  let warn = console.warn;
  beforeEach(() => {
    console.warn = vi.fn();
  });
  afterEach(() => {
    console.warn = warn;
  });

  it("appends new properties", () => {
    let args = mockArgs([
      {
        id: "root",
        meta: [
          { tagName: "link", rel: "icon", href: "/favicon.ico" },
          { title: "my blog" },
          { name: "description", content: "pretty sick site bro" },
        ],
      },
      { id: "leaf", meta: [] },
    ]);
    let meta = metaV1(args, { "twitter:card": "summary" });
    expect(meta).toEqual([
      { tagName: "link", rel: "icon", href: "/favicon.ico" },
      { title: "my blog" },
      { name: "description", content: "pretty sick site bro" },
      { name: "twitter:card", content: "summary", key: "twitter:cardsummary" },
    ]);
  });

  it("only merges with direct parent meta", () => {
    let args = mockArgs([
      {
        id: "root",
        meta: [
          { tagName: "link", rel: "icon", href: "/favicon.ico" },
          { title: "my site" },
          { name: "description", content: "pretty sick site bro" },
        ],
      },
      {
        id: "blog",
        meta: [{ title: "my blog" }],
      },
      { id: "leaf", meta: [] },
    ]);
    let meta = metaV1(args, { "twitter:card": "summary" });
    expect(meta).toEqual([
      { title: "my blog" },
      { name: "twitter:card", content: "summary", key: "twitter:cardsummary" },
    ]);
  });

  it("overrides 'title' property", () => {
    let args = mockArgs([
      {
        id: "root",
        meta: [
          { tagName: "link", rel: "icon", href: "/favicon.ico" },
          { title: "my site" },
          { name: "description", content: "pretty sick site bro" },
        ],
      },
      { id: "leaf", meta: [] },
    ]);

    let meta = metaV1(args, {
      title: "my blog",
    });
    expect(meta).toEqual([
      { tagName: "link", rel: "icon", href: "/favicon.ico" },
      { name: "description", content: "pretty sick site bro" },
      { title: "my blog", key: expect.any(String) },
    ]);
  });

  it("overrides 'description' property", () => {
    let args = mockArgs([
      {
        id: "root",
        meta: [
          { tagName: "link", rel: "icon", href: "/favicon.ico" },
          { title: "my site" },
          { name: "description", content: "pretty sick site bro" },
        ],
      },
      { id: "leaf", meta: [] },
    ]);
    let meta = metaV1(args, {
      description: "pretty sick page bro",
    });
    expect(meta).toEqual([
      { tagName: "link", rel: "icon", href: "/favicon.ico" },
      { title: "my site" },
      {
        name: "description",
        content: "pretty sick page bro",
        key: expect.any(String),
      },
    ]);
  });

  it("overrides 'og:*' property", () => {
    let args = mockArgs([
      {
        id: "root",
        meta: [
          { tagName: "link", rel: "icon", href: "/favicon.ico" },
          { title: "my site" },
          { property: "og:title", content: "my site" },
          { name: "description", content: "pretty sick site bro" },
        ],
      },
      { id: "leaf", meta: [] },
    ]);
    let meta = metaV1(args, {
      title: "my page | my site",
      "og:title": "my page",
    });
    expect(meta).toEqual([
      { tagName: "link", rel: "icon", href: "/favicon.ico" },
      { name: "description", content: "pretty sick site bro" },
      { title: "my page | my site", key: expect.any(String) },
      { property: "og:title", content: "my page", key: expect.any(String) },
    ]);
  });

  it("supports array properties", () => {
    let args = mockArgs([
      {
        id: "root",
        meta: [{ title: "my site" }],
      },
      { id: "leaf", meta: [] },
    ]);
    let meta = metaV1(args, {
      "og:image": [
        "https://example.com/image1.jpg",
        "https://example.com/image2.jpg",
      ],
    });
    expect(meta).toEqual([
      { title: "my site" },
      {
        property: "og:image",
        content: "https://example.com/image1.jpg",
        key: expect.any(String),
      },
      {
        property: "og:image",
        content: "https://example.com/image2.jpg",
        key: expect.any(String),
      },
    ]);
  });

  it("overrides with array properties", () => {
    let args = mockArgs([
      {
        id: "root",
        meta: [
          { property: "og:image", content: "https://example.com/image0.jpg" },
        ],
      },
      { id: "leaf", meta: [] },
    ]);
    let meta = metaV1(args, {
      "og:image": [
        "https://example.com/image1.jpg",
        "https://example.com/image2.jpg",
      ],
    });
    expect(meta).toEqual([
      {
        property: "og:image",
        content: "https://example.com/image1.jpg",
        key: expect.any(String),
      },
      {
        property: "og:image",
        content: "https://example.com/image2.jpg",
        key: expect.any(String),
      },
    ]);
  });
});

function mockArgs(
  items: Array<{
    id: string;
    meta: MetaArgs["matches"][number]["meta"];
    data?: any;
    params?: Record<string, string>;
    pathname?: string;
  }>
): MetaArgs {
  let matches = items.map(
    ({ id, meta, data = null, params = {}, pathname = "/" }) => {
      return {
        id,
        meta,
        data,
        params,
        pathname,
      } as MetaArgs<any, any>["matches"][number];
    }
  );
  let leafMatch = matches[matches.length - 1];
  return {
    matches,
    data: leafMatch.data,
    params: leafMatch.params,
    location: { pathname: "/", hash: "", search: "", key: "", state: {} },
  };
}
