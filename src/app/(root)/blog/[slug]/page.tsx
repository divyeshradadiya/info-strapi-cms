import { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { MarkdownText } from "@/components/custom/markdown-text";
import { StrapiImage } from "@/components/custom/strapi-image";
import { getBlogPostBySlug } from "@/data/loaders";
import { BlockRenderer } from "@/components/block-renderer";
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

  console.log(blocks, "blocks");

  return (
    <article>
      <div>
        <header className="container mx-auto py-10">
          <h1 className="text-6xl font-bold tracking-tighter sm:text-5xl mb-4">
            {post.title}
          </h1>
          <p className="text-muted-foreground">
            Posted on {formatDate(post.publishedAt)} - {post.category.text}
          </p>
          <StrapiImage
            src={post.image.url}
            alt={post.image.alternativeText}
            width={800}
            height={600}
            priority
            className="w-full rounded-lg mt-8"
          />
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
  );
}
