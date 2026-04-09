// Server-side PDF parsing utility
// This file runs only on the server (Node.js)
import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const require = createRequire(import.meta.url);

export async function parsePdfFromBuffer(buffer: Buffer): Promise<string> {
  console.log("📄 [Server Utils] Starting PDF parsing...");
  console.log("📄 [Server Utils] Buffer size:", buffer.length);
  
  try {
    // Try to load the module
    let pdfParse: (buffer: Buffer, options?: any) => Promise<{ text: string }>;
    
    // Try direct require first (works in CJS)
    try {
      console.log("📄 [Server Utils] Trying require('pdf-parse')...");
      pdfParse = require("pdf-parse");
      console.log("📄 [Server Utils] require() succeeded, type:", typeof pdfParse);
    } catch (e1) {
      console.log("📄 [Server Utils] require failed:", e1);
      throw e1;
    }
    
    console.log("📄 [Server Utils] Calling parsePDF...");
    
    // pdf-parse expects a Buffer or Uint8Array
    const data = await pdfParse(buffer, { 
      // Custom page rendering to get text
      pagerender: async (pageData: any) => {
        return pageData.getTextContent().then((textContent: any) => {
          return textContent.items.map((item: any) => item.str).join(' ');
        });
      }
    });
    
    const text = data.text;
    
    console.log("📄 [Server Utils] Parsing complete, text length:", text?.length);
    return text;
    
  } catch (error) {
    console.error("📄 [Server Utils] PDF parsing failed:", error);
    throw error;
  }
}
