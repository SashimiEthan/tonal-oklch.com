import fs from "fs";
import path from "path";
import { BlogPost } from "@/components/blog-post";

export default function Home() {
  const markdown = fs.readFileSync(
    path.join(process.cwd(), "..", "blog.md"),
    "utf-8"
  );

  return (
    <main className="min-h-screen bg-background">
      <article className="mx-auto max-w-2xl px-6 py-16">
        <BlogPost content={markdown} />
      </article>
    </main>
  );
}
