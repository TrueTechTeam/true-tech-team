import pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';

const PDF_MIME = 'application/pdf';
const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const DOC_MIME = 'application/msword';
const TXT_MIME = 'text/plain';

// Extracts plain text from an uploaded resume file so it can be handed to
// the fill agent as `uploadedText`. Branches on the browser-supplied MIME
// type from the multipart `file` field.
export async function extractTextFromUpload(buffer: Buffer, mimeType: string): Promise<string> {
  switch (mimeType) {
    case PDF_MIME: {
      const result = await pdfParse(buffer);
      return result.text;
    }
    case DOCX_MIME: {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }
    case DOC_MIME: {
      // Legacy .doc (pre-OOXML binary format) isn't supported by mammoth,
      // which only reads the .docx (OOXML) format. Surface a clear error so
      // the UI can ask the user to re-save as .docx/.pdf instead of silently
      // producing garbage text.
      throw new Error(
        'Legacy .doc files are not supported. Please save the file as .docx or .pdf and try again.'
      );
    }
    case TXT_MIME:
      return buffer.toString('utf-8');
    default:
      throw new Error(
        `Unsupported file type "${mimeType}". Please upload a PDF, DOCX, or plain text resume.`
      );
  }
}
