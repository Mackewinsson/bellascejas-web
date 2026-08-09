import fs from "fs";
import path from "path";
import matter from "gray-matter";

const CONTENT_ROOT = path.join(process.cwd(), "content");

export type ContentDoc = {
  title: string;
  sourceUrl?: string;
  localeHint?: string;
  body: string;
  images: string[];
};

function extractImages(markdown: string): string[] {
  const urls: string[] = [];
  const re = /!\[[^\]]*\]\(([^)]+)\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(markdown)) !== null) {
    urls.push(m[1]);
  }
  return urls;
}

export function readContent(relativePath: string): ContentDoc {
  const full = path.join(CONTENT_ROOT, relativePath);
  const raw = fs.readFileSync(full, "utf8");
  const { data, content } = matter(raw);
  const body = content.trim();
  return {
    title: String(data.title ?? relativePath),
    sourceUrl: data.source_url ? String(data.source_url) : undefined,
    localeHint: data.locale_hint ? String(data.locale_hint) : "es",
    body,
    images: extractImages(body),
  };
}

export function contentExists(relativePath: string): boolean {
  return fs.existsSync(path.join(CONTENT_ROOT, relativePath));
}
