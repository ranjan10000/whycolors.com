import blogs from "./blogs.json";

export type Blog = {
  slug: string;
  title: string;
  description?: string;
  tagLine?: string;
  date?: string;
  images?: string[];
  content: string;
  keywords?: string;
  tags?: string[];
  toolURL?: string;
};

export function getAllPosts(): Blog[] {
  return blogs as Blog[];
}

export function getPost(slug: string): Blog | null {
  return getAllPosts().find((b) => b.slug === slug) || null;
}

export async function generateStaticParams() {
  return getAllPosts().map((b) => ({ slug: b.slug }));
}

export function getRelatedPosts(currentPostSlug: string, limit: number = 3): Blog[] {
  const currentPost = getPost(currentPostSlug);

  if (!currentPost || !currentPost.tags?.length) {
    return [];
  }

  const currentPostTags = currentPost.tags.map(tag => tag.toLowerCase());

  const postsWithRelevance = getAllPosts()
    .filter(post => post.slug !== currentPostSlug)
    .map(post => {
      let relevance = 0;
      const postTags = post.tags || [];
      
      postTags.forEach(tag => {
        if (currentPostTags.includes(tag.toLowerCase())) {
          relevance++;
        }
      });
      
      return {
        ...post,
        relevance,
      };
    })
    .filter(post => post.relevance > 0)
    .map(post => post as Blog & { relevance: number });

  postsWithRelevance.sort((a, b) => {
    if (b.relevance !== a.relevance) {
      return b.relevance - a.relevance;
    }
    const dateA = new Date(a.date || 0).getTime();
    const dateB = new Date(b.date || 0).getTime();
    return dateB - dateA;
  });

  return postsWithRelevance.slice(0, limit);
}