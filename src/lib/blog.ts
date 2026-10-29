import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { Marked } from "marked";

/** One Markdown file per post. Copy content/blog/_template.md to add a new one. */
const postsDir = path.join(process.cwd(), "content/blog");

export type Post = {
  slug: string;
  title: string;
  description: string;
  /** yyyy-mm-dd */
  date: string;
  updated?: string;
  tag: string;
  image: string;
  imageAlt: string;
  draft: boolean;
  faqs: { question: string; answer: string }[];
  readingMinutes: number;
  html: string;
  /** The post's ## headings, for the "In this guide" menu */
  headings: { id: string; text: string }[];
};

const required = ["title", "description", "date", "tag", "image"];

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// YAML turns an unquoted 2026-10-29 into a Date, so normalise both forms back to yyyy-mm-dd
const toIsoDate = (value: unknown) => new Date(value as string).toISOString().slice(0, 10);

function readPost(file: string): Post {
  const { data, content } = matter(fs.readFileSync(path.join(postsDir, file), "utf8"));
  for (const field of required) {
    if (!data[field]) throw new Error(`content/blog/${file} is missing "${field}" in its frontmatter`);
  }

  const headings: Post["headings"] = [];
  const marked = new Marked({
    renderer: {
      heading({ tokens, depth, text }) {
        const id = slugify(text);
        if (depth === 2) headings.push({ id, text: text.replace(/[*_`]/g, "") });
        return `<h${depth} id="${id}">${this.parser.parseInline(tokens)}</h${depth}>\n`;
      },
    },
  });
  // Wide tables scroll sideways on phones instead of stretching the page
  const html = marked
    .parse(content, { async: false })
    .replaceAll("<table>", '<div class="article-table"><table>')
    .replaceAll("</table>", "</table></div>");

  return {
    slug: file.replace(/\.md$/, ""),
    title: data.title,
    description: data.description,
    date: toIsoDate(data.date),
    updated: data.updated ? toIsoDate(data.updated) : undefined,
    tag: data.tag,
    image: data.image,
    imageAlt: data.imageAlt ?? "",
    draft: data.draft === true,
    faqs: data.faqs ?? [],
    readingMinutes: Math.max(1, Math.round(content.split(/\s+/).length / 200)),
    html,
    headings,
  };
}

/** Published posts, newest first. Files starting with "_" are skipped. */
export function getPosts(): Post[] {
  return fs
    .readdirSync(postsDir)
    .filter((file) => file.endsWith(".md") && !file.startsWith("_"))
    .map(readPost)
    .filter((post) => !post.draft)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export const getPost = (slug: string) => getPosts().find((post) => post.slug === slug);

export const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
