
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';
import { WorksheetView } from '@/types/worksheet';

// Types
type RefType = React.RefObject<HTMLDivElement>;
interface PdfGenerationOptions {
  title: string;
  contentRef: RefType;
  viewMode: WorksheetView;
  vocabulary?: any[];
}

/**
 * Generates a PDF from the given content reference
 */
export async function generatePdf(options: PdfGenerationOptions): Promise<string | null> {
  const { title, contentRef, viewMode, vocabulary } = options;
  
  try {
    if (!contentRef.current) {
      toast.error("Could not find content to download");
      return null;
    }
    
    // Create a proper filename based on view mode
    const viewSuffix = viewMode === WorksheetView.STUDENT ? "student" : "teacher";
    const baseFilename = `worksheet-${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`;
    const filename = `${baseFilename}-${viewSuffix}.pdf`;
    
    // Create PDF
    const pdf = await createPdfFromElement(contentRef);
    
    // Add vocabulary on a separate page if available
    if (vocabulary && vocabulary.length > 0) {
      addVocabularyPage(pdf, vocabulary);
    }
    
    // Save PDF
    pdf.save(filename);
    return filename;
    
  } catch (err) {
    console.error("Download error:", err);
    toast.error("Error downloading worksheet. Please try again.");
    return null;
  }
}

/**
 * Creates a PDF from an HTML element
 */
async function createPdfFromElement(contentRef: RefType): Promise<jsPDF> {
  // Canvas configuration
  const canvas = await html2canvas(contentRef.current!, {
    scale: 2.0, // Higher scale for better quality
    useCORS: true,
    logging: false,
    windowWidth: 1100,
    windowHeight: 1600,
    allowTaint: true
  });
  
  // Create PDF with A4 dimensions
  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgData = canvas.toDataURL('image/png');
  
  // Calculate dimensions with wider margins
  const pageWidth = 210; // A4 width in mm
  const pageHeight = 297; // A4 height in mm
  const margin = 20; // Increased margin in mm
  
  const contentWidth = pageWidth - (2 * margin);
  const contentHeight = (canvas.height * contentWidth) / canvas.width;
  
  // Calculate how many pages we need
  const pageCount = Math.ceil(contentHeight / (pageHeight - (2 * margin)));
  
  // Calculate scaling for better page breaks
  const scaleFactor = canvas.width / contentWidth;
  const pageContentHeight = (pageHeight - (2 * margin)) * scaleFactor;
  
  // Add each page to the PDF
  addContentPages(pdf, imgData, pageCount, pageContentHeight, scaleFactor, margin, contentWidth, contentHeight);
  
  return pdf;
}

/**
 * Adds content pages to the PDF
 */
function addContentPages(
  pdf: jsPDF, 
  imgData: string, 
  pageCount: number, 
  pageContentHeight: number, 
  scaleFactor: number, 
  margin: number, 
  contentWidth: number, 
  contentHeight: number
): void {
  // Calculate optimal cut heights to avoid cutting in the middle of text
  const cutHeightOffset = 30; // Pixels to offset cuts to avoid cutting text
  
  // Process each page to avoid cutting in the middle of text
  for (let i = 0; i < pageCount; i++) {
    if (i > 0) {
      pdf.addPage();
    }
    
    // Find a good break point (try to avoid cutting in the middle of text)
    let y = i * pageContentHeight;
    
    // If not first page and not last page, try to find a better break point
    if (i > 0 && i < pageCount - 1) {
      // Look for a good spot to break by adjusting the y position
      y -= cutHeightOffset; // Move up more to avoid cutting text
    }
    
    // Add the image to the PDF with improved cropping
    pdf.addImage(
      imgData,
      'PNG',
      margin,
      margin,
      contentWidth,
      contentHeight,
      undefined,
      'FAST',
      -y / scaleFactor
    );
  }
}

/**
 * Adds a vocabulary section to the PDF
 */
function addVocabularyPage(pdf: jsPDF, vocabulary: any[]): void {
  pdf.addPage();
  
  // PDF settings
  const margin = 20;
  const lineHeight = 8;
  
  // Add vocabulary title
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text("Vocabulary Sheet", margin, margin + 10);
  
  // Add vocabulary items
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  
  let yPos = margin + 20;
  
  vocabulary.forEach((item, index) => {
    // Add a new page if needed
    if (yPos > 297 - margin) { // 297 is A4 height in mm
      pdf.addPage();
      yPos = margin + 10;
    }
    
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${index + 1}. ${item.term}`, margin, yPos);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`- ${item.definition}`, margin + 30, yPos);
    
    yPos += lineHeight;
    
    // Add example on next line if it exists
    if (item.example) {
      if (yPos > 297 - margin) {
        pdf.addPage();
        yPos = margin + 10;
      }
      
      pdf.setFont('helvetica', 'italic');
      pdf.text(`  Example: ${item.example}`, margin, yPos);
      pdf.setFont('helvetica', 'normal');
      
      yPos += lineHeight + 2; // Extra spacing after example
    } else {
      yPos += 2; // Just a bit of extra spacing between items
    }
  });
}
