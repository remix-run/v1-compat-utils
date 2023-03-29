import type {
  V2_MetaArgs as MetaArgs,
  V2_MetaDescriptor as MetaDescriptor,
} from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/server-runtime";

function metaV1<
  Loader extends LoaderFunction | unknown = unknown,
  MatchLoaders extends Record<string, unknown> = Record<string, unknown>
>(
  args: MetaArgs<Loader, MatchLoaders>,
  metaData: V1_MetaDescriptor
): MetaDescriptor[] {
  return mergeMeta(args, fromMetaData(metaData));
}

function mergeMeta<
  Loader extends LoaderFunction | unknown = unknown,
  MatchLoaders extends Record<string, unknown> = Record<string, unknown>
>(
  args: MetaArgs<Loader, MatchLoaders>,
  routeMeta: MetaDescriptor[]
): MetaDescriptor[] {
  let matches = [...args.matches];
  let parentMeta = matches.flatMap((match) => match.meta);
  return dedupeMetaDescriptors([...parentMeta, ...routeMeta]);
}

function fromMetaData(metaData: V1_MetaDescriptor): MetaDescriptor[] {
  let meta = Object.entries(metaData)
    .flatMap<MetaDescriptor | null>(([name, value]) => {
      if (!value) {
        return null;
      }

      if (["charset", "charSet"].includes(name)) {
        return { key: "charSet", charSet: String(value) };
      }

      if (name === "title") {
        return { key: "title", title: String(value) };
      }

      return [value].flat().map<MetaDescriptor | null>((content) => {
        // Open Graph tags use the `property` attribute, while other meta tags
        // use `name`.
        if (isOpenGraphTag(name)) {
          content = String(content);
          return {
            property: name,
            content,
            key: name + content,
          };
        }

        if (isPlainObject(content)) {
          let key = content.key ?? name + JSON.stringify(content);
          return {
            key,
            ...content,
          };
        }

        content = String(content);
        return {
          name,
          content,
          key: name + content,
        };
      });
    })
    .filter(isTruthy);
  return meta;
}

function getMetaKey(metaDescriptor: MetaDescriptor) {
  if ("title" in metaDescriptor && metaDescriptor.title != null) {
    return "title";
  }

  if (
    ("charSet" in metaDescriptor && metaDescriptor.charSet != null) ||
    ("charset" in metaDescriptor && metaDescriptor.charset != null)
  ) {
    return "charSet";
  }

  if (
    "property" in metaDescriptor &&
    typeof metaDescriptor.property === "string"
  ) {
    return metaDescriptor.property;
  }

  if ("name" in metaDescriptor && typeof metaDescriptor.name === "string") {
    return metaDescriptor.name;
  }
  return null;
}

/**
 * Namespaced attributes:
 * - https://ogp.me/#type_music
 * - https://ogp.me/#type_video
 * - https://ogp.me/#type_article
 * - https://ogp.me/#type_book
 * - https://ogp.me/#type_profile
 *
 * @see https://ogp.me/
 *
 * Facebook specific tags are not technically Open Graph tags but follow the
 * same rules, so we'll include those in the check.
 *
 * Twitter specific tags begin with `twitter:` but they use `name`, so they are
 * excluded.
 */
function isOpenGraphTag(tagName: string) {
  return /^(og|music|video|article|book|profile|fb):.+$/.test(tagName);
}

function isPlainObject(value: unknown): value is Record<keyof any, unknown> {
  return Object.prototype.toString.call(value) === "[object Object]";
}

function isTruthy<V>(value: V | null | undefined): value is V {
  return value != null;
}

function dedupeMetaDescriptors(arr: MetaDescriptor[]) {
  let uniques: Record<string, MetaDescriptor> = {};
  let i = 0;
  for (let item of arr) {
    let key = getMetaKey(item);
    if (key === null) key = `__null__${i}`;
    uniques[key] = item;
    i++;
  }
  return Object.values(uniques);
}

interface V1_MetaDescriptor {
  charSet?: "utf-8";
  title?: string;
  [name: string]:
    | null
    | string
    | undefined
    | Record<string, string>
    | Array<Record<string, string> | string>;
}

export { fromMetaData, metaV1, mergeMeta };
export type { V1_MetaDescriptor };
