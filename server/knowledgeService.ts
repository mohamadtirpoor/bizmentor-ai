import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// pdf-parse is a CommonJS module
let pdfParse: any = null;
try {
  const pdfParseModule = require('pdf-parse');
  // pdf-parse exports a default function
  pdfParse = pdfParseModule.default || pdfParseModule;
  console.log('✅ pdf-parse loaded successfully');
} catch (error) {
  console.error('❌ Failed to load pdf-parse:', error);
}

// Map expert IDs to folder names
const EXPERT_FOLDERS: Record<string, string> = {
  product: 'product',
  marketing: 'Marketing',
  sales: 'Seles',
  finance: 'Finance',
  hr: 'HR'
};

/**
 * Read all PDF files from a specific expert's folder
 */
export async function loadExpertKnowledge(expertId: string): Promise<string> {
  // Check if pdf-parse is available
  if (!pdfParse) {
    console.warn('⚠️ pdf-parse module not available, RAG disabled');
    return '';
  }

  const folderName = EXPERT_FOLDERS[expertId];
  if (!folderName) {
    return '';
  }

  const sourcePath = path.join(process.cwd(), 'Sorce', folderName);
  
  // Check if folder exists
  if (!fs.existsSync(sourcePath)) {
    console.warn(`Knowledge folder not found: ${sourcePath}`);
    return '';
  }

  try {
    const files = fs.readdirSync(sourcePath);
    const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));
    
    if (pdfFiles.length === 0) {
      console.warn(`No PDF files found in: ${sourcePath}`);
      return '';
    }

    console.log(`📚 Loading ${pdfFiles.length} PDF files for expert: ${expertId}`);
    const knowledgeTexts: string[] = [];

    // Limit to first 3 PDFs to avoid token limits
    const limitedPdfFiles = pdfFiles.slice(0, 3);

    for (const file of limitedPdfFiles) {
      try {
        const filePath = path.join(sourcePath, file);
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        
        // Extract text and clean it
        const text = data.text
          .replace(/\s+/g, ' ') // Replace multiple spaces with single space
          .trim();
        
        if (text.length > 0) {
          // Limit to 10k chars per file to avoid overwhelming the context
          knowledgeTexts.push(`\n\n### 📖 منبع: ${file}\n${text.substring(0, 10000)}`);
          console.log(`✅ Loaded: ${file} (${text.length} chars, truncated to 10k)`);
        }
      } catch (fileError) {
        console.error(`❌ Error reading PDF ${file}:`, fileError);
      }
    }

    if (knowledgeTexts.length === 0) {
      return '';
    }

    console.log(`✅ Successfully loaded ${knowledgeTexts.length} PDF files for ${expertId}`);

    return `

---

## 📚 منابع دانش تخصصی (Knowledge Base)

شما به منابع زیر دسترسی دارید. از این منابع برای پاسخ‌دهی دقیق‌تر استفاده کنید:

${knowledgeTexts.join('\n\n---\n')}

---

**نکته مهم:** در پاسخ‌های خود، حتماً به این منابع ارجاع دهید و از اطلاعات آنها استفاده کنید.
`;
  } catch (error) {
    console.error(`Error loading knowledge for ${expertId}:`, error);
    return '';
  }
}
