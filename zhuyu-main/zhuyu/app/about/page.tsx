import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import "highlight.js/styles/atom-one-dark.css";
import { siteConfig } from "@/siteConfig";
import FadeIn from "@/components/ui/FadeIn";
import AboutTabs from "@/components/AboutTabs";

export const revalidate = 0;

// 后端内网地址（Next.js 服务端 → FastAPI 8000）
const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

export default async function AboutPage() {
  let contentHtml = "博主很懒，还没有写自我介绍哦...";
  let coverImage = "/images/2.webp";

  try {
    // 优先拉取独立封面图 about_cover
    try {
      const coverRes = await fetch(`${BACKEND_URL}/api/site-config/about_cover`, {
        next: { revalidate: 0 },
      });
      if (coverRes.ok) {
        const coverData = await coverRes.json();
        let cover = "";
        if (typeof coverData === "string") {
          cover = coverData;
        } else if (coverData?.value !== undefined) {
          cover = typeof coverData.value === "string" ? coverData.value : "";
        }
        if (cover.trim()) {
          coverImage = cover;
        }
      }
    } catch {
      // about_cover 不存在，静默 fallback
    }

    // 拉取 about_content
    const res = await fetch(`${BACKEND_URL}/api/site-config/about_content`, {
      next: { revalidate: 0 },
    });

    if (res.ok) {
      const data = await res.json();
      let mdContent = "";
      if (typeof data === "string") {
        mdContent = data;
      } else if (data?.value !== undefined) {
        mdContent = typeof data.value === "string" ? data.value : JSON.stringify(data.value);
      }

      if (mdContent.trim()) {
        // 解析 frontmatter（如果 about_cover 没设置，fallback 到 frontmatter cover）
        const matter = (await import("gray-matter")).default;
        const { data: frontmatter, content: body } = matter(mdContent);
        if (!coverImage || coverImage === "/images/2.webp") {
          if (frontmatter.cover) coverImage = frontmatter.cover;
        }

        const processedContent = await unified()
          .use(remarkParse)
          .use(remarkRehype, { allowDangerousHtml: true })
          .use(rehypeHighlight)
          .use(rehypeStringify, { allowDangerousHtml: true })
          .process(body);

        contentHtml = processedContent.toString();
      }
    }
  } catch (e) {
    console.error("从API拉取about内容失败", e);
  }

  return (
    <FadeIn className="w-full max-w-4xl mx-auto py-6 md:py-12 px-4 sm:px-10 relative z-10">
      <AboutTabs contentHtml={contentHtml} coverImage={coverImage} />
    </FadeIn>
  );
}
