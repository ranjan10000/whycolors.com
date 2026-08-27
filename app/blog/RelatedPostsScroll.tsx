import Link from "next/link";
import { Blog } from "./get-post";

export default function RelatedPostsScroll({ relatedPosts }: { relatedPosts: Blog[] }) {
  if (!relatedPosts.length) return null;

  return (
    <section className="bg-gray-50 dark:bg-black py-12 px-4 transition-colors duration-300">
      <div className="max-w-8xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center text-black dark:text-white transition-colors duration-300">
          Related Articles
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {relatedPosts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md dark:shadow-gray-800/30 overflow-hidden hover:shadow-lg dark:hover:shadow-gray-700/50 transition-all duration-300 h-full border border-gray-100 dark:border-gray-800">
                {post.images?.[0] && (
                  <div className="relative w-full h-40 overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img
                      src={post.images[0]}
                      alt={post.title}
                      className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 dark:text-white line-clamp-2 transition-colors duration-300 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">
                    {post.description?.slice(0, 80)}...
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}