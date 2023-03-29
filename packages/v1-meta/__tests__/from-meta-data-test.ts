import { fromMetaData as _fromMetaData } from "../src/index";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

let fromMetaData = _fromMetaData;
if (import.meta.env.TEST_BUILD) {
  try {
    fromMetaData = require("../dist/index").fromMetaData;
  } catch (_) {}
}

describe("fromMetaData", () => {
  let warn = console.warn;
  beforeEach(() => {
    console.warn = vi.fn();
  });
  afterEach(() => {
    console.warn = warn;
  });

  it("does not create a descriptor from empty object", () => {
    let descriptors = fromMetaData({});
    expect(descriptors).toEqual([]);
  });

  it("does not create a descriptor from 'undefined' value", () => {
    let descriptors = fromMetaData({ "og:type": undefined });
    expect(descriptors).toEqual([]);
  });

  it("does not create a descriptor from 'null' value", () => {
    // @ts-expect-error
    let descriptors = fromMetaData({ title: null });
    expect(descriptors).toEqual([]);
  });

  it("creates multiple descriptors", () => {
    let descriptors = fromMetaData({
      title: "hiya | my website",
      "og:title": "hiya",
      description: "my website",
      "og:image": [
        "https://example.com/image1.jpg",
        "https://example.com/image2.jpg",
      ],
    });
    expect(descriptors).toEqual([
      { title: "hiya | my website", key: expect.any(String) },
      { property: "og:title", content: "hiya", key: expect.any(String) },
      { name: "description", content: "my website", key: expect.any(String) },
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

  describe("title tags", () => {
    it("creates a 'title' descriptor from 'title' property", () => {
      let descriptors = fromMetaData({ title: "hello world" });
      expect(descriptors[0]).toEqual({
        title: "hello world",
        key: "title",
      });
    });
  });

  describe("'charSet' meta tags", () => {
    it("creates a 'charSet' descriptor from 'charSet' property", () => {
      let descriptors = fromMetaData({ charSet: "utf-8" });
      expect(descriptors[0]).toEqual({
        charSet: "utf-8",
        key: "charSet",
      });
    });

    it("creates a 'charSet' descriptor from 'charset' property", () => {
      let descriptors = fromMetaData({ charset: "utf-8" });
      expect(descriptors[0]).toEqual({ charSet: "utf-8", key: "charSet" });
    });
  });

  describe("og:* meta tags", () => {
    it("creates an 'og:type' descriptor from 'og:type' property", () => {
      let descriptors = fromMetaData({ "og:type": "website" });
      expect(descriptors[0]).toEqual({
        property: "og:type",
        content: "website",
        key: expect.any(String),
      });
    });

    it("creates an 'og:title' descriptor from 'og:title' property", () => {
      let descriptors = fromMetaData({ "og:title": "hello world" });
      expect(descriptors[0]).toEqual({
        property: "og:title",
        content: "hello world",
        key: expect.any(String),
      });
    });

    it("creates an 'og:description' descriptor from 'og:description' property", () => {
      let descriptors = fromMetaData({ "og:description": "hello world" });
      expect(descriptors[0]).toEqual({
        property: "og:description",
        content: "hello world",
        key: expect.any(String),
      });
    });

    it("creates an 'og:url' descriptor from 'og:url' property", () => {
      let descriptors = fromMetaData({ "og:url": "https://example.com" });
      expect(descriptors[0]).toEqual({
        property: "og:url",
        content: "https://example.com",
        key: expect.any(String),
      });
    });

    it("creates multiple descriptors with array values", () => {
      let descriptors = fromMetaData({
        "og:image": [
          "https://example.com/image1.png",
          "https://example.com/image2.png",
        ],
      });
      expect(descriptors).toEqual([
        {
          property: "og:image",
          content: "https://example.com/image1.png",
          key: expect.any(String),
        },
        {
          property: "og:image",
          content: "https://example.com/image2.png",
          key: expect.any(String),
        },
      ]);
    });
  });

  describe("fb:* meta tags", () => {
    it("creates a 'fb:app_id' descriptor from 'fb:app_id' property", () => {
      let descriptors = fromMetaData({ "fb:app_id": "123" });
      expect(descriptors[0]).toEqual({
        property: "fb:app_id",
        content: "123",
        key: expect.any(String),
      });
    });
  });

  describe("twitter:* meta tags", () => {
    it("creates a 'twitter:card' descriptor from 'twitter:card' property", () => {
      let descriptors = fromMetaData({ "twitter:card": "summary" });
      expect(descriptors[0]).toEqual({
        name: "twitter:card",
        content: "summary",
        key: expect.any(String),
      });
    });

    it("creates a 'twitter:site' descriptor from 'twitter:site' property", () => {
      let descriptors = fromMetaData({ "twitter:site": "@example" });
      expect(descriptors[0]).toEqual({
        name: "twitter:site",
        content: "@example",
        key: expect.any(String),
      });
    });

    it("creates a 'twitter:title' descriptor from 'twitter:title' property", () => {
      let descriptors = fromMetaData({ "twitter:title": "hello world" });
      expect(descriptors[0]).toEqual({
        name: "twitter:title",
        content: "hello world",
        key: expect.any(String),
      });
    });
  });

  describe("standard meta tags", () => {
    it("creates a 'description' descriptor from 'description' property", () => {
      let descriptors = fromMetaData({ description: "hello world" });
      expect(descriptors[0]).toEqual({
        name: "description",
        content: "hello world",
        key: expect.any(String),
      });
    });

    it("creates a 'keywords' descriptor from 'keywords' property", () => {
      let descriptors = fromMetaData({ keywords: "hello,world" });
      expect(descriptors[0]).toEqual({
        name: "keywords",
        content: "hello,world",
        key: expect.any(String),
      });
    });

    it("creates a 'viewport' descriptor from 'viewport' property", () => {
      let descriptors = fromMetaData({
        viewport: "width=device-width, initial-scale=1",
      });
      expect(descriptors[0]).toEqual({
        name: "viewport",
        content: "width=device-width, initial-scale=1",
        key: expect.any(String),
      });
    });

    it("stringifies numeric value", () => {
      // @ts-expect-error
      let descriptors = fromMetaData({ description: 1 });
      expect(descriptors[0]).toEqual({
        name: "description",
        content: "1",
        key: expect.any(String),
      });
    });

    it("does not create a descriptor if value is 'falsey'", () => {
      // This includes any 'falsey' value, including numbers. Ideally those
      // would be stringified and work just fine since that's how React handles
      // rendering falsey numeric values, but that's not how it works in v1 so
      // it works the same way here.
      // @ts-expect-error
      let descriptors = fromMetaData({ description: 0 });
      expect(descriptors).toEqual([]);
    });
  });

  describe("arbitrary meta tags", () => {
    it("creates a descriptor from keys with object value", () => {
      let descriptors = fromMetaData({
        refresh: {
          httpEquiv: "refresh",
          content: "3;url=https://www.mozilla.org",
        },
      });
      expect(descriptors[0]).toEqual({
        httpEquiv: "refresh",
        content: "3;url=https://www.mozilla.org",
        key: expect.any(String),
      });
    });
  });
});
