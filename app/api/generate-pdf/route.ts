import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  childName: z.string(),
  title: z.string(),
  dedicationPageText: z.string(),
  pages: z.array(z.object({ pageNumber: z.number(), text: z.string() })),
  moral: z.string()
});

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;

function drawPageHeader(page: any, label: string) {
  page.drawRectangle({ x: 36, y: 730, width: 540, height: 36, color: rgb(0.95, 0.94, 1) });
  page.drawText(label, { x: 48, y: 742, size: 14, color: rgb(0.16, 0.16, 0.24) });
}

function drawWrappedText(page: any, text: string, font: any, startY: number, size = 16) {
  const words = text.split(" ");
  let line = "";
  let y = startY;
  const maxWidth = 500;

  words.forEach((word) => {
    const testLine = `${line}${word} `;
    const width = font.widthOfTextAtSize(testLine, size);
    if (width > maxWidth) {
      page.drawText(line, { x: 56, y, size, font, color: rgb(0.18, 0.18, 0.22) });
      line = `${word} `;
      y -= size + 8;
    } else {
      line = testLine;
    }
  });

  if (line.trim()) {
    page.drawText(line, { x: 56, y, size, font, color: rgb(0.18, 0.18, 0.22) });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const payload = requestSchema.parse(body);

    const pdfDoc = await PDFDocument.create();
    const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Page 1: Cover
    const cover = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    cover.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: rgb(0.98, 0.97, 1) });
    cover.drawText("Little Gem Books", { x: 56, y: 680, size: 20, font: titleFont, color: rgb(0.24, 0.2, 0.42) });
    drawWrappedText(cover, payload.title, titleFont, 600, 34);
    cover.drawText(`A personalized story for ${payload.childName}`, { x: 56, y: 530, size: 16, font: bodyFont });
    cover.drawRectangle({ x: 56, y: 120, width: 500, height: 320, color: rgb(0.92, 0.95, 1) });
    cover.drawText("Illustration Placeholder", { x: 210, y: 275, size: 16, font: bodyFont });

    // Page 2: Dedication
    const dedication = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    drawPageHeader(dedication, "Page 2 · Dedication");
    dedication.drawText(payload.title, { x: 56, y: 670, size: 28, font: titleFont });
    drawWrappedText(dedication, payload.dedicationPageText, bodyFont, 610, 18);

    // Pages 3-10
    payload.pages.slice(0, 8).forEach((storyPage, idx) => {
      const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      const pageNumber = idx + 3;
      drawPageHeader(page, `Page ${pageNumber}`);
      drawWrappedText(page, storyPage.text, bodyFont, 660, 17);
      page.drawRectangle({ x: 56, y: 120, width: 500, height: 250, color: rgb(0.95, 0.96, 1) });
      page.drawText("Illustration Placeholder", { x: 212, y: 240, size: 14, font: bodyFont });
    });

    // Page 11: Moral
    const moralPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    drawPageHeader(moralPage, "Page 11 · Lesson");
    moralPage.drawText("What we learned", { x: 56, y: 660, size: 30, font: titleFont });
    drawWrappedText(moralPage, payload.moral, bodyFont, 610, 18);

    // Page 12: Drawing page
    const drawingPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    drawPageHeader(drawingPage, "Page 12 · Draw Your Next Adventure");
    drawingPage.drawText("Draw what happens next!", { x: 56, y: 660, size: 24, font: titleFont });
    drawingPage.drawRectangle({ x: 56, y: 130, width: 500, height: 480, borderColor: rgb(0.3, 0.3, 0.3), borderWidth: 2 });

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="little-gem-${payload.childName.toLowerCase()}.pdf"`
      }
    });
  } catch (error) {
    console.error("generate-pdf error", error);
    return NextResponse.json({ error: "Unable to build PDF" }, { status: 500 });
  }
}