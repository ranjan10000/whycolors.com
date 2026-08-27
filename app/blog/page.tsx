import Link from "next/link";
import { getAllPosts, type Blog } from "./get-post";

export default async function BlogIndexPage() {
  const posts: Blog[] = getAllPosts().sort((a, b) => {
    return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
  });

  return (
    <main className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      {/* Hero Section */}
      <section className="border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-black transition-colors duration-300">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-light tracking-tight text-gray-900 dark:text-white mb-4 transition-colors duration-300">
              Blog
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 font-light leading-relaxed transition-colors duration-300">
              Explore color palettes, shade guides, and perfect color combinations.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="bg-white dark:bg-black py-12 sm:py-16 transition-colors duration-300">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
                <article className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgba(255,255,255,0.05)] border border-gray-100 dark:border-gray-800">
                  {/* Image */}
                  {post.images?.[0] && (
                    <div className="relative aspect-[16/10] overflow-hidden bg-gray-50 dark:bg-gray-800">
                      <img
                        src={post.images[0]}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  )}
                  
                  {/* Content */}
                  <div className="flex flex-col flex-1 p-6 space-y-3">
                    <h2 className="text-xl font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300">
                      {post.title}
                    </h2>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed flex-1 transition-colors duration-300">
                      {post.description}
                    </p>
                    
                    <div className="pt-2 flex items-center justify-between">
                      <time className="text-xs text-gray-400 dark:text-gray-500 font-light tracking-wide uppercase transition-colors duration-300">
                        {new Date(post.date || "").toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </time>
                      <span className="text-xs font-medium text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300">
                        Read →
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}