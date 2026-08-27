import { notFound } from "next/navigation";
import { marked } from "marked";
import Link from "next/link";
import SocialShare from "../SocialShare";
import RelatedPostsScroll from "../RelatedPostsScroll";
import Image from "next/image";

import {
  getPost,
  generateStaticParams,
  getRelatedPosts,
  type Blog,
} from "../get-post";
import type { Metadata, Route } from "next";
import Breadcrumb from "../Breadcrumb";

// In Next.js 15, `params` is a Promise
interface PageProps {
  params: Promise<{ slug: string }>;
}

// Export static params for SSG
export { generateStaticParams };

// ------------------------------
// ✅ Generate Metadata for SEO
// ------------------------------
export async function generateMetadata(
  { params }: PageProps
): Promise<Metadata> {
  const { slug } = await params;
  const post: Blog | null = getPost(slug);

  if (!post) return {};

  const baseUrl = "https://www.whycolors.com";
  const canonicalUrl = `${baseUrl}/blog/${post.slug}`;
  const defaultOg = `${baseUrl}/default-og.png`;
  const ogImage =
    post.images && post.images.length > 0
      ? `${baseUrl}${post.images[0]}`
      : defaultOg;

  return {
    metadataBase: new URL(baseUrl),
    title: post.title,
    description: post.description ?? "Read guides and tips from whycolors.",
    keywords: post.keywords ?? "whycolors, Blog, Tools, Guides",
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: post.title,
      description: post.description,
      url: canonicalUrl,
      type: "article",
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [ogImage],
    },
  };
}

// ------------------------------
// ✅ Main Blog Page
// ------------------------------
export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post: Blog | null = getPost(slug);

  if (!post) return notFound();

  const relatedPosts: Blog[] = getRelatedPosts(slug, 10);
  const html: string = await marked.parse(post.content ?? "");

  const BASE_URL = "https://www.whycolors.com";

  const toolURL: string | null = post.toolURL
    ? (() => {
        let url = post.toolURL;
        // Fix missing colon: https// -> https://
        url = url.replace(/^https?\/\//, 'https://');
        // Remove domain if present
        url = url.replace(/^https?:\/\/[^\/]+/, '');
        // Ensure single leading slash
        url = '/' + url.replace(/^\/+/, '');
        return BASE_URL + url;
      })()
    : null;

  return (
    <>
      {/* -- MAIN CONTENT -- */}
      <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Progress Bar (handled client-side) */}
        <div
          className="fixed top-0 left-0 h-1 bg-blue-600 w-0"
          id="progressBar"
        />

        {/* -- BREADCRUMB -- */}
        <div className="mb-6">
          <Breadcrumb 
            items={[
              { label: 'Home', href: '/' },
              { label: 'Blog', href: '/blog' },
              { label: post.title, href: `/blog/${post.slug}`, isCurrent: true },
            ]}
          />
        </div>

        {/* -- HEADER -- */}
        <header className="mb-10 text-center">
          {post.tagLine && (
            <span className="inline-block bg-blue-100 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide dark:bg-blue-900/30 dark:text-blue-400">
              {post.tagLine}
            </span>
          )}

          <h1 className="text-3xl font-extrabold mt-4 leading-tight text-gray-900 dark:text-white">
            {post.title}
          </h1>

          <div className="flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-3">
            {post.date && (
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </time>
            )}
            <span>•</span>
            <span>5 min read</span>
          </div>

          {/* -- IMAGE (NO underline, NO hover effects) -- */}
          {post.images?.length ? (
            <div className="mt-8 flex justify-center">
              <div className="relative w-full sm:w-3/4 md:w-2/3 lg:w-3/5 overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
                {toolURL ? (
                  <Link
                    href={toolURL as Route}
                    className="block no-underline"
                  >
                    <Image
                      src={post.images[0]}
                      alt={post.title}
                      width={1200}
                      height={675}
                      priority
                      fetchPriority="high"
                      loading="eager"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 75vw, 60vw"
                      className="h-auto w-full object-cover"
                    />
                  </Link>
                ) : (
                  <Image
                    src={post.images[0]}
                    alt={post.title}
                    width={1200}
                    height={675}
                    priority
                    fetchPriority="high"
                    loading="eager"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 75vw, 60vw"
                    className="h-auto w-full object-cover"
                  />
                )}
              </div>
            </div>
          ) : null}
        </header>

        {/* -- ARTICLE BODY with Dark/Light Theme Support -- */}
        <article
          className="
            prose 
            prose-lg 
            max-w-none 
            mx-auto 
            text-gray-800 
            dark:text-gray-100
            [&_strong]:no-underline 
            [&_em]:no-underline 
            [&_b]:no-underline
            dark:prose-headings:text-white
            dark:prose-p:text-gray-100
            dark:prose-strong:text-white
            dark:prose-a:text-blue-400
            dark:prose-a:hover:text-blue-300
            dark:prose-blockquote:text-gray-200
            dark:prose-blockquote:bg-gray-800/50
            dark:prose-code:text-gray-200
            dark:prose-code:bg-gray-800
            dark:prose-pre:bg-gray-900
            dark:prose-pre:text-gray-200
            dark:prose-li:text-gray-100
            dark:prose-ol:text-gray-100
            dark:prose-ul:text-gray-100
            dark:prose-hr:border-gray-700
            dark:prose-table:border-gray-700
            dark:prose-table-th:bg-gray-800
            dark:prose-table-th:text-white
            dark:prose-table-td:text-gray-200
            dark:prose-table-tr:even:bg-gray-800/50
            dark:prose-table-tr:hover:bg-gray-800
          "
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </main>

      {/* -- RELATED POSTS -- */}
      {relatedPosts.length > 0 && (
        <RelatedPostsScroll relatedPosts={relatedPosts} />
      )}

      {/* -- SOCIAL SHARE -- */}
      <div className="my-6">
        <SocialShare title={post.title} />
      </div>
    </>
  );
}