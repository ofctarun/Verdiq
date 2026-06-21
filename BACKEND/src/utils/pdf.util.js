import { PDFParse } from "pdf-parse";

export async function extractPdfText(buffer) {
    const parser = new PDFParse({ data: buffer });
    try {
        const result = await parser.getText();
        return result.pages.map((p) => p.text).join("\n\n").trim();
    } finally {
        await parser.destroy();
    }
}
