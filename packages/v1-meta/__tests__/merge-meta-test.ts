import type { V2_MetaArgs as MetaArgs } from "@remix-run/react";
import { mergeMeta as _mergeMeta } from "../src/index";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

let mergeMeta = _mergeMeta;
if (import.meta.env.TEST_BUILD) {
  try {
    mergeMeta = require("../dist/index").mergeMeta;
  } catch (_) {}
}

const DEFAULT_ARGS: MetaArgs = {
  data: { post: { title: "hello" } },
  matches: [
    {
      data: { user: { name: "joe" } },
      id: "root",
      meta: [{ name: "description", content: "pretty sick site bro" }],
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

describe("mergeMeta", () => {
  let warn = console.warn;
  beforeEach(() => {
    console.warn = vi.fn();
  });
  afterEach(() => {
    console.warn = warn;
  });

  it("appends new properties", () => {
    let meta = mergeMeta(
      [
        { name: "description", content: "pretty sick site bro" },
        { title: "my blog" },
        { property: "og:title", content: "welcome to my blog" },
      ],
      [{ name: "twitter:card", content: "summary" }]
    );
    expect(meta).toEqual([
      { name: "description", content: "pretty sick site bro" },
      { title: "my blog" },
      { property: "og:title", content: "welcome to my blog" },
      { name: "twitter:card", content: "summary" },
    ]);
  });

  it("overrides 'title' property", () => {
    let match = DEFAULT_ARGS.matches[2] as any;
    let meta = mergeMeta(
      [
        { title: "hello" },
        { name: "description", content: "pretty sick site bro" },
        { property: "og:title", content: "welcome to my blog" },
      ],
      [{ title: match.data.post.title }]
    );
    expect(meta).toEqual([
      { name: "description", content: "pretty sick site bro" },
      { property: "og:title", content: "welcome to my blog" },
      { title: "hello" },
    ]);
  });

  it("overrides 'description' property", () => {
    let meta = mergeMeta(
      [
        { title: "my blog" },
        { name: "description", content: "foo" },
        { property: "og:title", content: "welcome to my blog" },
      ],
      [{ name: "description", content: "bar" }]
    );
    expect(meta).toEqual([
      { title: "my blog" },
      { property: "og:title", content: "welcome to my blog" },
      { name: "description", content: "bar" },
    ]);
  });

  it("overrides 'og:*' property", () => {
    let match = DEFAULT_ARGS.matches[2] as any;
    let meta = mergeMeta(
      [
        { title: "my blog" },
        { property: "og:title", content: "my blog" },
        { name: "description", content: "pretty sick site bro" },
      ],
      [{ property: "og:title", content: match.data.post.title }]
    );
    expect(meta).toEqual([
      { title: "my blog" },
      { name: "description", content: "pretty sick site bro" },
      { property: "og:title", content: "hello" },
    ]);
  });

  it("does not dedupe multiple entries", () => {
    let meta = mergeMeta(
      [
        { title: "my blog" },
        { property: "og:title", content: "welcome to my blog" },
        { name: "description", content: "foo" },
      ],
      [
        { name: "description", content: "bar" },
        { name: "description", content: "baz" },
      ]
    );
    expect(meta).toEqual([
      { title: "my blog" },
      { property: "og:title", content: "welcome to my blog" },
      { name: "description", content: "bar" },
      { name: "description", content: "baz" },
    ]);
  });
});
