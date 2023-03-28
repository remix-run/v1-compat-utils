import path from "node:path";
import { RouteManifest, defineRoutes } from "@remix-run/dev/dist/config/routes";
import { describe, it, expect } from "vitest";

import { createRoutePath, createRoutesFromFolders } from "../src/lib";

describe("createRoutePath", () => {
  describe("creates proper route paths", () => {
    let tests: [string, string | undefined][] = [
      ["routes/$", "routes/*"],
      ["routes/sub/$", "routes/sub/*"],
      ["routes.sub/$", "routes/sub/*"],
      ["routes/$slug", "routes/:slug"],
      ["routes/sub/$slug", "routes/sub/:slug"],
      ["routes.sub/$slug", "routes/sub/:slug"],
      ["$", "*"],
      ["nested/$", "nested/*"],
      ["flat.$", "flat/*"],
      ["$slug", ":slug"],
      ["nested/$slug", "nested/:slug"],
      ["flat.$slug", "flat/:slug"],
      ["flat.sub", "flat/sub"],
      ["nested/index", "nested"],
      ["flat.index", "flat"],
      ["index", undefined],
      ["__layout/index", undefined],
      ["__layout/test", "test"],
      ["__layout.test", "test"],
      ["__layout/$slug", ":slug"],
      ["nested/__layout/$slug", "nested/:slug"],
      ["$slug[.]json", ":slug.json"],
      ["sub/[sitemap.xml]", "sub/sitemap.xml"],
      ["posts/$slug/[image.jpg]", "posts/:slug/image.jpg"],
      ["$[$dollabills].[.]lol[/]what/[$].$", ":$dollabills/.lol/what/$/*"],
      ["sub.[[]", "sub/["],
      ["sub.]", "sub/]"],
      ["sub.[[]]", "sub/[]"],
      ["sub.[[]", "sub/["],
      ["beef]", "beef]"],
      ["[index]", "index"],
      ["test/inde[x]", "test/index"],
      ["[i]ndex/[[].[[]]", "index/[/[]"],

      // Optional segment routes
      ["(routes)/$", "routes?/*"],
      ["(routes)/(sub)/$", "routes?/sub?/*"],
      ["(routes).(sub)/$", "routes?/sub?/*"],
      ["(routes)/($slug)", "routes?/:slug?"],
      ["(routes)/sub/($slug)", "routes?/sub/:slug?"],
      ["(routes).sub/($slug)", "routes?/sub/:slug?"],
      ["(nested)/$", "nested?/*"],
      ["(flat).$", "flat?/*"],
      ["($slug)", ":slug?"],
      ["(nested)/($slug)", "nested?/:slug?"],
      ["(flat).($slug)", "flat?/:slug?"],
      ["flat.(sub)", "flat/sub?"],
      ["__layout/(test)", "test?"],
      ["__layout.(test)", "test?"],
      ["__layout/($slug)", ":slug?"],
      ["(nested)/__layout/($slug)", "nested?/:slug?"],
      ["($slug[.]json)", ":slug.json?"],
      ["(sub)/([sitemap.xml])", "sub?/sitemap.xml?"],
      ["(sub)/[(sitemap.xml)]", "sub?/(sitemap.xml)"],
      ["(posts)/($slug)/([image.jpg])", "posts?/:slug?/image.jpg?"],
      [
        "($[$dollabills]).([.]lol)[/](what)/([$]).$",
        ":$dollabills?/.lol)/(what?/$?/*",
      ],
      [
        "($[$dollabills]).([.]lol)/(what)/([$]).($up)",
        ":$dollabills?/.lol?/what?/$?/:up?",
      ],
      ["(sub).([[])", "sub?/[?"],
      ["(sub).(])", "sub?/]?"],
      ["(sub).([[]])", "sub?/[]?"],
      ["(sub).([[])", "sub?/[?"],
      ["(beef])", "beef]?"],
      ["([index])", "index?"],
      ["(test)/(inde[x])", "test?/index?"],
      ["([i]ndex)/([[]).([[]])", "index?/[?/[]?"],
    ];

    for (let [input, expected] of tests) {
      it(`"${input}" -> "${expected}"`, () => {
        expect(createRoutePath(input)).toBe(expected);
      });
    }

    describe("optional segments", () => {
      it("will only work when starting and ending a segment with parenthesis", () => {
        let [input, expected] = ["(routes.sub)/$", "(routes/sub)/*"];
        expect(createRoutePath(input)).toBe(expected);
      });

      it("throws error on optional to splat routes", () => {
        expect(() => createRoutePath("(routes)/($)")).toThrow("Splat");
        expect(() => createRoutePath("($)")).toThrow("Splat");
      });

      it("throws errors on optional index without brackets routes", () => {
        expect(() => createRoutePath("(nested)/(index)")).toThrow("index");
        expect(() => createRoutePath("(flat).(index)")).toThrow("index");
        expect(() => createRoutePath("(index)")).toThrow("index");
      });
    });
  });
});

describe("defineConventionalRoutes", () => {
  it("creates a route manifest from the routes directory", () => {
    let routes = createRoutesFromFolders(defineRoutes, {
      appDirectory: path.join(__dirname, "..", "..", "..", "example", "app"),
      routesDirectory: "other",
    });

    let expected: RouteManifest = {
      "other/index": {
        caseSensitive: undefined,
        file: path.join("other", "index.tsx"),
        id: "other/index",
        index: true,
        parentId: "root",
        path: undefined,
      },
      "other/posts": {
        caseSensitive: undefined,
        file: path.join("other", "posts.tsx"),
        id: "other/posts",
        index: undefined,
        parentId: "root",
        path: "posts",
      },
      "other/posts/$postId": {
        caseSensitive: undefined,
        file: path.join("other", "posts", "$postId.tsx"),
        id: "other/posts/$postId",
        index: undefined,
        parentId: "other/posts",
        path: ":postId",
      },
      "other/posts/index": {
        caseSensitive: undefined,
        file: path.join("other", "posts", "index.tsx"),
        id: "other/posts/index",
        index: true,
        parentId: "other/posts",
        path: undefined,
      },
    };

    expect(routes).toMatchObject(expected);
  });
});
