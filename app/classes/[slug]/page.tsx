import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Nav } from "@/components/Nav";
import { StoryRocket } from "@/components/StoryRocket";
import { ClassPage } from "@/components/ClassPage";
import { Footer } from "@/components/Sections";
import { classes, getClass } from "@/lib/classes";

type Props = { params: Promise<{ slug: string }> };

// One static page per class, generated at build time for the static export.
export function generateStaticParams() {
  return classes.map((c) => ({ slug: c.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = getClass(slug);
  if (!c) return {};
  return { title: `${c.name} | 1% Daily Healthy Wealthy`, description: c.summary };
}

export default async function ClassRoute({ params }: Props) {
  const { slug } = await params;
  if (!getClass(slug)) notFound();
  return (
    <>
      <Nav />
      <StoryRocket />
      <main>
        <ClassPage slug={slug} />
      </main>
      <Footer />
    </>
  );
}
