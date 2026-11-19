import { NextRequest, NextResponse } from "next/server";

const REPO_OWNER = "icepackhockey";
const REPO_NAME = "website-";
const GITHUB_API = "https://api.github.com";
const DESK_PASSCODES = ["PACK2026", "ICEPACK"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { passcode, article } = body;

    if (!passcode || !DESK_PASSCODES.includes(passcode.trim().toUpperCase())) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid desk passcode." },
        { status: 401 }
      );
    }

    if (!article || !article.title || !article.title.trim()) {
      return NextResponse.json(
        { error: "Article title is required." },
        { status: 400 }
      );
    }

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      console.error("Missing GITHUB_TOKEN environment variable.");
      return NextResponse.json(
        { error: "Server configuration error: GITHUB_TOKEN is not set." },
        { status: 500 }
      );
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
      "User-Agent": "Icepack-Intern-Desk",
    };

    let finalImageUrl = article.image_url || "/frozen-finley.jpg";

    // 1. If an image file was uploaded as base64 data URL, upload it to GitHub public/news/
    if (article.image_url && article.image_url.startsWith("data:")) {
      try {
        const matches = article.image_url.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const mimeType = matches[1];
          const base64Content = matches[2];

          let ext = "jpg";
          if (mimeType.includes("png")) ext = "png";
          else if (mimeType.includes("webp")) ext = "webp";
          else if (mimeType.includes("gif")) ext = "gif";

          const slug = article.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")
            .slice(0, 30);
          const fileName = `article-${Date.now()}-${slug}.${ext}`;
          const filePath = `public/news/${fileName}`;

          const imgUploadRes = await fetch(
            `${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`,
            {
              method: "PUT",
              headers,
              body: JSON.stringify({
                message: `Upload cover image for: ${article.title} via Intern Desk`,
                content: base64Content,
                branch: "main",
              }),
            }
          );

          if (imgUploadRes.ok) {
            finalImageUrl = `/news/${fileName}`;
          } else {
            console.error("Image upload failed, falling back to default.", await imgUploadRes.text());
          }
        }
      } catch (imgErr) {
        console.error("Error processing image upload:", imgErr);
      }
    }

    // 2. Fetch current src/data/news.json from GitHub main branch
    const newsFileRes = await fetch(
      `${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}/contents/src/data/news.json?ref=main`,
      {
        headers,
        cache: "no-store",
      }
    );

    if (!newsFileRes.ok) {
      const errText = await newsFileRes.text();
      return NextResponse.json(
        { error: `Failed to fetch news.json from repository: ${errText}` },
        { status: 502 }
      );
    }

    const fileData = await newsFileRes.json();
    const currentSha = fileData.sha;
    const contentUtf8 = Buffer.from(fileData.content, "base64").toString("utf8");
    const currentArticles = JSON.parse(contentUtf8);

    // 3. Format paragraphs
    let paras: string[] = [];
    if (Array.isArray(article.paragraphs) && article.paragraphs.length > 0) {
      paras = article.paragraphs;
    } else if (article.paragraphsText) {
      paras = article.paragraphsText
        .split("\n\n")
        .map((p: string) => p.trim())
        .filter((p: string) => p.length > 0);
    }
    if (paras.length === 0 && article.summary) {
      paras = [article.summary];
    }

    const summaryText =
      article.summary || (paras[0] ? paras[0].slice(0, 160) + "..." : "");

    let updatedArticles: any[] = [];
    let savedArticle: any = null;

    if (article.id && currentArticles.some((a: any) => a.id === article.id)) {
      // Editing existing article
      updatedArticles = currentArticles.map((a: any) => {
        if (a.id === article.id) {
          savedArticle = {
            ...a,
            title: article.title.trim(),
            date: article.date || a.date,
            category: article.category || a.category || "Recap",
            author: article.author || a.author || "Icepack Staff",
            summary: summaryText,
            paragraphs: paras,
            image_url: finalImageUrl,
          };
          return savedArticle;
        }
        return a;
      });
    } else {
      // Creating new article
      savedArticle = {
        id: Date.now(),
        title: article.title.trim(),
        date: article.date || new Date().toLocaleDateString("en-US"),
        category: article.category || "Recap",
        author: article.author || "Icepack Staff",
        summary: summaryText,
        paragraphs: paras,
        image_url: finalImageUrl,
      };
      updatedArticles = [savedArticle, ...currentArticles];
    }

    // 4. Commit updated src/data/news.json to GitHub main branch
    const updatedContentBase64 = Buffer.from(
      JSON.stringify(updatedArticles, null, 2) + "\n"
    ).toString("base64");

    const commitRes = await fetch(
      `${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}/contents/src/data/news.json`,
      {
        method: "PUT",
        headers,
        body: JSON.stringify({
          message: `Publish article: "${savedArticle.title}" via Intern Desk`,
          content: updatedContentBase64,
          sha: currentSha,
          branch: "main",
        }),
      }
    );

    if (!commitRes.ok) {
      const commitErr = await commitRes.text();
      return NextResponse.json(
        { error: `Failed to commit updated news.json: ${commitErr}` },
        { status: 502 }
      );
    }

    const commitData = await commitRes.json();

    return NextResponse.json({
      success: true,
      message: "Article published successfully. Vercel build triggered.",
      article: savedArticle,
      commitSha: commitData.commit?.sha,
      commitUrl: commitData.commit?.html_url,
    });
  } catch (error: any) {
    console.error("Intern publish error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
