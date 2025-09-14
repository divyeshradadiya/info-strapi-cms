import { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { ReadOnlyMarkdownViewer } from "@/components/ui/read-only-markdown-viewer";
import { StrapiImage } from "@/components/custom/strapi-image";
import { getBlogPostBySlug, getBlogPosts } from "@/data/loaders";
import { BlockRenderer } from "@/components/block-renderer";
import { MarkdownText } from "@/components/custom/markdown-text";
import { Card, CardContent } from "@/components/ui/card";
interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolveParams = await params;
  const slug = await resolveParams?.slug;
  const { isEnabled: isDraftMode } = await draftMode();
  const status = isDraftMode ? "draft" : "published";

  const data = await getBlogPostBySlug(slug, status);

  if (!data?.data?.[0]) {
    return {
      title: "Latest news Preview",
      description: "Latest news Preview",
    };
  }

  const post = data.data[0];

  return {
    title: post.title,
    description: post.description,
  };
}

export default async function SinglePost({ params }: PageProps) {
  const resolveParams = await params;
  const slug = await resolveParams?.slug;
  const { isEnabled: isDraftMode } = await draftMode();
  const status = isDraftMode ? "draft" : "published";
  const data = await getBlogPostBySlug(slug, status);
  const post = data?.data[0];

  if (!post) notFound();

  const blocks = post?.blocks || [];

  // Fetch related blogs from the same category
  const relatedBlogsData = await getBlogPosts(1, "", post.category?.text || "");
  const relatedBlogs = relatedBlogsData?.data?.filter((blog: any) => blog.slug !== slug).slice(0, 9) || [];

  console.log(blocks, "blocks");
  console.log(post, "post");

  return (
    <>
      <article className="mb-20 font-grotesk">
        <div>
          <header className="container mx-auto py-10">
            <h1 className="text-6xl font-bold tracking-tighter sm:text-5xl mb-4">
              {post.title}
            </h1>
            <p className="text-muted-foreground">
              Posted on {formatDate(post.publishedAt)} - {post.category.text}
            </p>
              {post.image?.url && (
              <StrapiImage
                src={post.image.url}
                alt={post.image?.alternativeText ? post.image.alternativeText : post.title}
                width={800}
                height={600}
                priority
                className="w-full rounded-lg mt-8"
              />
            )}
          </header>
        </div>

        {post.content && (
          <div className="container mx-auto max-w-4xl text-base leading-7">
            <MarkdownText content={post.content} />
          </div>
        )}

        {blocks && (
          <div className="container mx-auto max-w-4xl text-base leading-7">
            <BlockRenderer blocks={blocks} />
          </div>
        )}
      </article>

      {relatedBlogs.length > 0 && (
        <section className="container mx-auto py-10">
          <h2 className="text-3xl font-bold mb-8 text-center">Related Articles</h2>
          <div className="grid auto-rows-fr grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {relatedBlogs.map((blog: any) => (
              <Link href={`/blog/${blog.slug}`} key={blog.documentId}>
                <Card className="h-full shadow-lg border-none">
                  <CardContent className="flex h-full flex-col items-start gap-5 px-0">
                    {blog.image?.url ? (
                      <div className="relative h-52 w-full">
                        <StrapiImage
                          alt={
                            blog.image?.alternativeText
                              ? blog.image.alternativeText
                              : blog.title
                          }
                          src={blog.image.url}
                          fill
                          className="object-cover rounded-t-lg"
                        />
                      </div>
                    ) : (
                      <div
                        className="relative h-52 w-full flex items-center justify-center rounded-t-lg"
                        style={{
                          background: `linear-gradient(135deg, ${
                            ["#FDE68A", "#A7F3D0", "#BFDBFE", "#FCA5A5", "#C4B5FD", "#F9A8D4"][
                              blog.id % 6
                            ]
                          }, #e5e7eb 80%)`,
                        }}
                      >
                        <span className="text-primary font-semibold dark:text-black text-2xl">
                          {blog.category?.text ? `${blog.category.text} blog` : "Blog"}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-1 flex-col gap-4 px-5">
                      <h4 className="text-lg font-semibold">{blog.title}</h4>
                      <p className="mb-auto text-muted-foreground">
                        {blog.description}
                      </p>
                      <div className="flex items-center gap-3">
                        {blog.category?.text && (
                          <span className="rounded-full outline outline-primary text-primary px-3 py-0.5 text-sm">
                            {blog.category.text}
                          </span>
                        )}
                        <span className="text-sm text-muted-foreground">
                          {formatDate(blog.publishedAt)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/blog"
              className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Show More Articles
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
