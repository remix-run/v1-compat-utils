import fs from "node:fs";
import path from "node:path";
import minimatch from "minimatch";
import type {
  RouteManifest,
  DefineRouteFunction,
  DefineRoutesFunction,
} from "@remix-run/dev/dist/config/routes";
import { createRouteId } from "@remix-run/dev/dist/config/routes";

let paramPrefixChar = "$" as const;
let escapeStart = "[" as const;
let escapeEnd = "]" as const;
let optionalStart = "(" as const;
let optionalEnd = ")" as const;

let routeModuleExts = [".js", ".jsx", ".ts", ".tsx", ".md", ".mdx"];

function isRouteModuleFile(filename: string): boolean {
  return routeModuleExts.includes(path.extname(filename));
}

export type CreateRoutesFromFoldersOptions = {
  /**
   * The directory where your app lives. Defaults to `app`.
   * @default "app"
   */
  appDirectory?: string;
  /**
   * A list of glob patterns to ignore when looking for route modules.
   * Defaults to `[]`.
   */
  ignoredFilePatterns?: string[];
  /**
   * The directory where your routes live. Defaults to `routes`.
   * This is relative to `appDirectory`.
   * @default "routes"
   */
  routesDirectory?: string;
};

/**
 * Defines routes using the filesystem convention in `app/routes`. The rules are:
 *
 * - Route paths are derived from the file path. A `.` in the filename indicates
 *   a `/` in the URL (a "nested" URL, but no route nesting). A `$` in the
 *   filename indicates a dynamic URL segment.
 * - Subdirectories are used for nested routes.
 *
 * For example, a file named `app/routes/gists/$username.tsx` creates a route
 * with a path of `gists/:username`.
 */
export function createRoutesFromFolders(
  defineRoutes: DefineRoutesFunction,
  options: CreateRoutesFromFoldersOptions = {}
): RouteManifest {
  let {
    appDirectory = "app",
    ignoredFilePatterns = [],
    routesDirectory = "routes",
  } = options;

  let appRoutesDirectory = path.join(appDirectory, routesDirectory);
  let files: { [routeId: string]: string } = {};

  // First, find all route modules in app/routes
  visitFiles(appRoutesDirectory, (file) => {
    if (
      ignoredFilePatterns.length > 0 &&
      ignoredFilePatterns.some((pattern) => minimatch(file, pattern))
    ) {
      return;
    }

    if (isRouteModuleFile(file)) {
      let relativePath = path.join(routesDirectory, file);
      let routeId = createRouteId(relativePath);
      files[routeId] = relativePath;
      return;
    }

    throw new Error(
      `Invalid route module file: ${path.join(appRoutesDirectory, file)}`
    );
  });

  let routeIds = Object.keys(files).sort(byLongestFirst);
  let parentRouteIds = getParentRouteIds(routeIds);
  let uniqueRoutes = new Map<string, string>();

  // Then, recurse through all routes using the public defineRoutes() API
  function defineNestedRoutes(
    defineRoute: DefineRouteFunction,
    parentId?: string
  ): void {
    let childRouteIds = routeIds.filter((id) => {
      return parentRouteIds[id] === parentId;
    });

    for (let routeId of childRouteIds) {
      let routePath: string | undefined = createRoutePath(
        routeId.slice((parentId || routesDirectory).length + 1)
      );

      let isIndexRoute = routeId.endsWith("/index");
      let fullPath = createRoutePath(routeId.slice(routesDirectory.length + 1));
      let uniqueRouteId = (fullPath || "") + (isIndexRoute ? "?index" : "");

      if (uniqueRouteId) {
        if (uniqueRoutes.has(uniqueRouteId)) {
          throw new Error(
            `Path ${JSON.stringify(fullPath)} defined by route ${JSON.stringify(
              routeId
            )} conflicts with route ${JSON.stringify(
              uniqueRoutes.get(uniqueRouteId)
            )}`
          );
        } else {
          uniqueRoutes.set(uniqueRouteId, routeId);
        }
      }

      if (isIndexRoute) {
        let invalidChildRoutes = routeIds.filter(
          (id) => parentRouteIds[id] === routeId
        );

        if (invalidChildRoutes.length > 0) {
          throw new Error(
            `Child routes are not allowed in index routes. Please remove child routes of ${routeId}`
          );
        }

        defineRoute(routePath, files[routeId], { index: true, id: routeId });
      } else {
        defineRoute(routePath, files[routeId], { id: routeId }, () => {
          defineNestedRoutes(defineRoute, routeId);
        });
      }
    }
  }

  return defineRoutes(defineNestedRoutes);
}

// TODO: Cleanup and write some tests for this function
export function createRoutePath(partialRouteId: string): string | undefined {
  let result = "";
  let rawSegmentBuffer = "";

  let inEscapeSequence = 0;
  let inOptionalSegment = 0;
  let optionalSegmentIndex = null;
  let skipSegment = false;
  for (let i = 0; i < partialRouteId.length; i++) {
    let char = partialRouteId.charAt(i);
    let prevChar = i > 0 ? partialRouteId.charAt(i - 1) : undefined;
    let nextChar =
      i < partialRouteId.length - 1 ? partialRouteId.charAt(i + 1) : undefined;

    function isNewEscapeSequence() {
      return (
        !inEscapeSequence && char === escapeStart && prevChar !== escapeStart
      );
    }

    function isCloseEscapeSequence() {
      return inEscapeSequence && char === escapeEnd && nextChar !== escapeEnd;
    }

    function isStartOfLayoutSegment() {
      return char === "_" && nextChar === "_" && !rawSegmentBuffer;
    }

    function isNewOptionalSegment() {
      return (
        char === optionalStart &&
        prevChar !== optionalStart &&
        (isSegmentSeparator(prevChar) || prevChar === undefined) &&
        !inOptionalSegment &&
        !inEscapeSequence
      );
    }

    function isCloseOptionalSegment() {
      return (
        char === optionalEnd &&
        nextChar !== optionalEnd &&
        (isSegmentSeparator(nextChar) || nextChar === undefined) &&
        inOptionalSegment &&
        !inEscapeSequence
      );
    }

    if (skipSegment) {
      if (isSegmentSeparator(char)) {
        skipSegment = false;
      }
      continue;
    }

    if (isNewEscapeSequence()) {
      inEscapeSequence++;
      continue;
    }

    if (isCloseEscapeSequence()) {
      inEscapeSequence--;
      continue;
    }

    if (isNewOptionalSegment()) {
      inOptionalSegment++;
      optionalSegmentIndex = result.length;
      result += optionalStart;
      continue;
    }

    if (isCloseOptionalSegment()) {
      if (optionalSegmentIndex !== null) {
        result =
          result.slice(0, optionalSegmentIndex) +
          result.slice(optionalSegmentIndex + 1);
      }
      optionalSegmentIndex = null;
      inOptionalSegment--;
      result += "?";
      continue;
    }

    if (inEscapeSequence) {
      result += char;
      continue;
    }

    if (isSegmentSeparator(char)) {
      if (rawSegmentBuffer === "index" && result.endsWith("index")) {
        result = result.replace(/\/?index$/, "");
      } else {
        result += "/";
      }

      rawSegmentBuffer = "";
      inOptionalSegment = 0;
      optionalSegmentIndex = null;
      continue;
    }

    if (isStartOfLayoutSegment()) {
      skipSegment = true;
      continue;
    }

    rawSegmentBuffer += char;

    if (char === paramPrefixChar) {
      if (nextChar === optionalEnd) {
        throw new Error(
          `Invalid route path: ${partialRouteId}. Splat route $ is already optional`
        );
      }
      result += typeof nextChar === "undefined" ? "*" : ":";
      continue;
    }

    result += char;
  }

  if (rawSegmentBuffer === "index" && result.endsWith("index")) {
    result = result.replace(/\/?index$/, "");
  }

  if (rawSegmentBuffer === "index" && result.endsWith("index?")) {
    throw new Error(
      `Invalid route path: ${partialRouteId}. Make index route optional by using (index)`
    );
  }

  return result || undefined;
}

function isSegmentSeparator(checkChar: string | undefined) {
  if (!checkChar) return false;
  return ["/", ".", path.win32.sep].includes(checkChar);
}

function getParentRouteIds(
  routeIds: string[]
): Record<string, string | undefined> {
  return routeIds.reduce<Record<string, string | undefined>>(
    (parentRouteIds, childRouteId) => ({
      ...parentRouteIds,
      [childRouteId]: routeIds.find((id) => childRouteId.startsWith(`${id}/`)),
    }),
    {}
  );
}

function byLongestFirst(a: string, b: string): number {
  return b.length - a.length;
}

function visitFiles(
  dir: string,
  visitor: (file: string) => void,
  baseDir = dir
): void {
  for (let filename of fs.readdirSync(dir)) {
    let file = path.resolve(dir, filename);
    let stat = fs.lstatSync(file);

    if (stat.isDirectory()) {
      visitFiles(file, visitor, baseDir);
    } else if (stat.isFile()) {
      visitor(path.relative(baseDir, file));
    }
  }
}

/*
eslint
  no-loop-func: "off",
*/
