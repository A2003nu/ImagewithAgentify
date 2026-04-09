export const runtime = "nodejs";

import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc = "pdfjs-dist/legacy/build/pdf.worker.mjs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return Response.json({ error: "No file uploaded" }, { status: 400 });
    }

    console.log("📄 File received:", file.name);

    const arrayBuffer = await file.arrayBuffer();

    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    console.log("📘 Number of pages:", pdf.numPages);

    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();

      const pageText = content.items
        .map((item: any) => item.str)
        .join(" ");

      fullText += pageText + "\n";
    }

    console.log("✅ Extracted text length:", fullText.length);
    console.log("🧾 Preview:", fullText.substring(0, 300));

    if (!fullText || fullText.trim().length < 50) {
      return Response.json({
        error: "No readable text found in PDF"
      }, { status: 400 });
    }

    return Response.json({ text: fullText });

  } catch (error: any) {
    console.error("❌ PDF parsing error:", error);

    return Response.json({
      error: "Failed to parse PDF",
      details: error.message
    }, { status: 500 });
  }
}
