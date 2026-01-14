
import { FileData } from '../types';

declare const pdfjsLib: any;
declare const mammoth: any;

// Initialize PDF.js worker
if (typeof window !== 'undefined' && 'pdfjsLib' in window) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
}

export const parseFile = async (file: File): Promise<FileData> => {
  const fileType = file.name.split('.').pop()?.toLowerCase();
  const id = Math.random().toString(36).substr(2, 9);

  if (fileType === 'pdf') {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
    }

    return { id, name: file.name, text: fullText, type: 'pdf' };
  } else if (fileType === 'docx') {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return { id, name: file.name, text: result.value, type: 'docx' };
  } else if (fileType === 'txt') {
    const text = await file.text();
    return { id, name: file.name, text, type: 'txt' };
  }

  throw new Error(`不支援的檔案格式 (${fileType})，請上傳 PDF, DOCX 或 TXT。`);
};
