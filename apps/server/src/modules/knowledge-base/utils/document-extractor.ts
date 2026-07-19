import mammoth from "mammoth";
// @ts-ignore
import pdfParse from "pdf-parse-fork";

export class DocumentExtractor {
  static async extractText(
    fileBuffer: Buffer,
    type: "PDF" | "DOCX",
  ): Promise<string> {
    if (type === "PDF") {
      // pdf-parse-fork xuất ra hàm chuẩn tương thích hoàn toàn với ESM
      const data = await pdfParse(fileBuffer);
      return data.text;
    } else if (type === "DOCX") {
      const data = await mammoth.extractRawText({ buffer: fileBuffer });
      return data.value;
    }
    throw new Error("Định dạng file không được hỗ trợ");
  }

  static chunkText(
    text: string,
    chunkSize: number = 800,
    chunkOverlap: number = 100,
  ): string[] {
    const words = text.split(/\s+/);
    const chunks: string[] = [];
    let currentWordIndex = 0;

    while (currentWordIndex < words.length) {
      const chunkWords = words.slice(
        currentWordIndex,
        currentWordIndex + chunkSize,
      );
      if (chunkWords.length === 0) break;

      chunks.push(chunkWords.join(" "));
      currentWordIndex += chunkSize - chunkOverlap;
    }

    return chunks.filter((chunk) => chunk.trim().length > 10);
  }
}
