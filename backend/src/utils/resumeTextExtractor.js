const fs = require("fs");
const mammoth = require("mammoth");

async function extractPdfText(filePath) {
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

  const data = new Uint8Array(fs.readFileSync(filePath));

  const pdf = await pdfjsLib.getDocument({
    data,
    disableWorker: true,
  }).promise;

  let text = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    const pageText = content.items
      .map((item) => item.str)
      .join(" ");

    text += pageText + "\n";
  }

  return text;
}

async function extractResumeText(filePath) {
  const lower = filePath.toLowerCase();

  if (lower.endsWith(".pdf")) {
    return extractPdfText(filePath);
  }

  if (lower.endsWith(".docx") || lower.endsWith(".doc")) {
    const result = await mammoth.extractRawText({
      path: filePath,
    });

    return result.value;
  }

  throw new Error("Unsupported file type");
}

module.exports = {
  extractResumeText,
};