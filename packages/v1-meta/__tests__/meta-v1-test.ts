import type { V2_MetaArgs as MetaArgs } from "@remix-run/react";
import { metaV1 as _metaV1 } from "../src/index";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

let metaV1 = _metaV1;
if (import.meta.env.TEST_BUILD) {
  try {
    metaV1 = require("../dist/index").mergeMeta;
  } catch (_) {}
}

const DEFAULT_ARGS: MetaArgs = {
  data: { post: { title: "hello" } },
  matches: [
    {
      data: { user: { name: "joe" } },
      id: "root",
      meta: [
        { tagName: "link", rel: "icon", href: "/favicon.ico" },
        { name: "description", content: "pretty sick site bro" },
      ],
      params: {},
      pathname: "/",
    },
    {
      data: {
        posts: [
          { id: 1, title: "hello" },
          { id: 2, title: "goodbye" },
        ],
      },
      id: "routes/blog",
      meta: [
        { title: "my blog" },
        {
          property: "og:title",
          content: "welcome to my blog",
        },
        {
          "script:ld+json": {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: "my blog",
          },
        },
      ],
      params: {},
      pathname: "/blog",
    },
    {
      data: { post: { id: 1, title: "hello" } },
      id: "routes/blog.$id",
      meta: [],
      params: {},
      pathname: "/blog/1",
    },
  ],
  params: {},
  location: {
    pathname: "/blog/hello",
    search: "",
    hash: "",
    state: {},
    key: "",
  },
};

describe("metaV1", () => {
  let warn = console.warn;
  beforeEach(() => {
    console.warn = vi.fn();
  });
  afterEach(() => {
    console.warn = warn;
  });

  it("appends new properties", () => {
    let meta = metaV1(DEFAULT_ARGS, {
      "twitter:card": "summary",
    });
    expect(meta).toEqual([
      { tagName: "link", rel: "icon", href: "/favicon.ico" },
      { name: "description", content: "pretty sick site bro" },
      { title: "my blog" },
      { property: "og:title", content: "welcome to my blog" },
      {
        "script:ld+json": {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: "my blog",
        },
      },
      { name: "twitter:card", content: "summary", key: expect.any(String) },
    ]);
  });

  it("overrides 'title' property", () => {
    let match = DEFAULT_ARGS.matches[2] as any;
    let meta = metaV1(DEFAULT_ARGS, {
      title: match.data.post.title,
    });
    expect(meta).toEqual([
      { tagName: "link", rel: "icon", href: "/favicon.ico" },
      { name: "description", content: "pretty sick site bro" },
      { title: "hello", key: expect.any(String) },
      { property: "og:title", content: "welcome to my blog" },
      {
        "script:ld+json": {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: "my blog",
        },
      },
    ]);
  });

  it("overrides 'description' property", () => {
    let meta = metaV1(DEFAULT_ARGS, {
      description: "foo",
    });
    expect(meta).toEqual([
      { tagName: "link", rel: "icon", href: "/favicon.ico" },
      { name: "description", content: "foo", key: expect.any(String) },
      { title: "my blog" },
      { property: "og:title", content: "welcome to my blog" },
      {
        "script:ld+json": {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: "my blog",
        },
      },
    ]);
  });

  it("overrides 'og:*' property", () => {
    let match = DEFAULT_ARGS.matches[2] as any;
    let meta = metaV1(DEFAULT_ARGS, {
      "og:title": match.data.post.title,
    });
    expect(meta).toEqual([
      { tagName: "link", rel: "icon", href: "/favicon.ico" },
      { name: "description", content: "pretty sick site bro" },
      { title: "my blog" },
      { property: "og:title", content: "hello", key: expect.any(String) },
      {
        "script:ld+json": {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: "my blog",
        },
      },
    ]);
  });
});
