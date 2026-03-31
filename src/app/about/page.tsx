import fs from "fs";
import path from "path";
import { BlogPost } from "@/components/blog-post";

export default function About() {
  const markdown = fs.readFileSync(
    path.join(process.cwd(), "src", "content", "blog.md"),
    "utf-8"
  );

  return (
    <main style={{ "--space-page-margin": "40px" } as React.CSSProperties}>
      <BlogPost content={markdown} />
    </main>
  );
}
