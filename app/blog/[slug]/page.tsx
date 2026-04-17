import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import prisma from '@/lib/prisma';

export const revalidate = 60;

// Generate static params for known slugs at build time
export async function generateStaticParams() {
  const posts = await prisma.blogPost.findMany({ select: { slug: true, id: true } });
  return posts.map((p) => ({ slug: p.slug ?? p.id }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Find by slug first, then fall back to id
  const post = await prisma.blogPost.findFirst({
    where: { OR: [{ slug }, { id: slug }] },
  });

  if (!post) notFound();

  const imgSrc = post.image
    ? `https://images.unsplash.com/photo-${post.image}?auto=format&fit=crop&q=80&w=1200`
    : null;

  // Related posts (same tag, excluding current)
  const related = await prisma.blogPost.findMany({
    where: { tag: post.tag, id: { not: post.id } },
    take: 3,
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Navbar theme="light" />

      {/* Hero image */}
      <div className="relative w-full h-[420px] sm:h-[520px] lg:h-[600px] mt-16 shrink-0">
        {imgSrc ? (
          <Image src={imgSrc} alt={post.title} fill className="object-cover" priority />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100" />
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />

        {/* Tag pill */}
        {post.tag && (
          <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-indigo-600 shadow-lg border border-white/50">
            {post.tag}
          </div>
        )}
      </div>

      {/* Article */}
      <article className="max-w-[760px] mx-auto w-full px-4 sm:px-6 -mt-24 relative z-10 pb-24">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> All Articles
        </Link>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-bold uppercase tracking-widest mb-6">
          {post.author && (
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> {post.author}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(post.createdAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
          {post.tag && (
            <span className="flex items-center gap-1.5 text-indigo-500">
              <Tag className="w-3.5 h-3.5" /> {post.tag}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 leading-[1.1] tracking-tight mb-8">
          {post.title}
        </h1>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-xl text-slate-500 font-medium leading-relaxed mb-10 border-l-4 border-indigo-400 pl-6">
            {post.excerpt}
          </p>
        )}

        {/* Body */}
        <div className="prose prose-lg prose-slate max-w-none prose-headings:font-black prose-a:text-indigo-600 prose-img:rounded-2xl">
          {post.content.split('\n').map((paragraph, i) =>
            paragraph.trim() ? (
              <p key={i} className="text-slate-700 leading-relaxed text-lg mb-5">
                {paragraph}
              </p>
            ) : (
              <br key={i} />
            )
          )}
        </div>
      </article>

      {/* Related posts */}
      {related.length > 0 && (
        <section className="bg-slate-50 py-20 px-4 sm:px-6">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="text-2xl font-black text-slate-900 mb-8">Related Articles</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/blog/${r.slug ?? r.id}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all"
                >
                  <div className="relative h-44 w-full overflow-hidden">
                    {r.image ? (
                      <Image
                        src={`https://images.unsplash.com/photo-${r.image}?auto=format&fit=crop&q=80&w=600`}
                        alt={r.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-purple-50" />
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-slate-400 font-bold mb-2">
                      {r.author} · {new Date(r.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                    </p>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {r.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
