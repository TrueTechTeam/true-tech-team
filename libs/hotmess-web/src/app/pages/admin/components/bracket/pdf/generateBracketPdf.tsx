import { pdf } from '@react-pdf/renderer';
import { BracketPdfDocument, type BracketPdfDocumentProps } from './BracketPdfDocument';

export type PdfGenerationInput = BracketPdfDocumentProps;

export async function generateBracketPdf(input: PdfGenerationInput): Promise<void> {
  const doc = <BracketPdfDocument {...input} />;
  const blob = await pdf(doc).toBlob();

  // Trigger browser download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${input.seasonName}-brackets.pdf`.replace(/\s+/g, '-').toLowerCase();
  a.click();
  URL.revokeObjectURL(url);
}
