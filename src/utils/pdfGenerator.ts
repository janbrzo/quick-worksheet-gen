
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
  skipVocabularyPage?: boolean; // Add this property to fix the type error
}

/**
 * Generates a PDF from the given content reference
 */
export async function generatePdf(options: PdfGenerationOptions): Promise<string | null> {
  const { title, contentRef, viewMode, vocabulary, skipVocabularyPage } = options;
  
  try {
    if (!contentRef.current) {
      toast.error("Could not find content to download");
      return null;
    }
    
    // Create a proper filename based on view mode
    const viewSuffix = viewMode === WorksheetView.STUDENT ? "student" : "teacher";
    const baseFilename = `worksheet-${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`;
    const filename = `${baseFilename}-${viewSuffix}.pdf`;
    
    // Create PDF with single canvas approach (more reliable for complex layouts)
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Render the entire content as one image
    const canvas = await html2canvas(contentRef.current, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      logging: false,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    // PDF dimensions (A4)
    const pdfWidth = 210;
    const pdfHeight = 297;
    const margin = 15;
    
    // Calculate content dimensions with margins
    const contentWidth = pdfWidth - (2 * margin);
    const contentHeight = (canvas.height * contentWidth) / canvas.width;
    
    // Calculate how many full pages we need
    const pageCount = Math.ceil(contentHeight / (pdfHeight - (2 * margin)));
    
    // Add content page by page
    for (let i = 0; i < pageCount; i++) {
      if (i > 0) {
        pdf.addPage();
      }
      
      // Calculate which portion of the canvas to use for this page
      const sourceY = i * ((pdfHeight - (2 * margin)) * canvas.width / contentWidth);
      const sourceHeight = Math.min(
        ((pdfHeight - (2 * margin)) * canvas.width / contentWidth),
        canvas.height - sourceY
      );
      
      // Only add page content if there's actual content to add
      if (sourceHeight > 0) {
        // Create a temporary canvas for this page slice
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = sourceHeight;
        
        // Draw the portion of the original canvas onto this temp canvas
        const ctx = tempCanvas.getContext('2d');
        ctx!.drawImage(
          canvas, 
          0, sourceY, canvas.width, sourceHeight,
          0, 0, canvas.width, sourceHeight
        );
        
        // Add this slice to the PDF
        const imgData = tempCanvas.toDataURL('image/png');
        const sliceHeight = (sourceHeight * contentWidth) / canvas.width;
        
        pdf.addImage(
          imgData,
          'PNG',
          margin, 
          margin,
          contentWidth, 
          sliceHeight
        );
      }
    }
    
    // Add vocabulary on a separate page if available and not skipped
    if (vocabulary && vocabulary.length > 0 && !skipVocabularyPage) {
      pdf.addPage();
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
 * Adds a vocabulary section to the PDF
 */
function addVocabularyPage(pdf: jsPDF, vocabulary: any[]): void {
  // PDF settings
  const margin = 20;
  const lineHeight = 8;
  
  // Add vocabulary title
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text("Vocabulary Reference Sheet", margin, margin + 10);
  
  // Add vocabulary items
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  
  let yPos = margin + 25;
  
  vocabulary.forEach((item, index) => {
    // Add a new page if needed
    if (yPos > 270) { // 297 (A4 height) - bottom margin
      pdf.addPage();
      
      // Add header on new page
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text("Vocabulary Reference Sheet (continued)", margin, margin + 10);
      
      // Reset position
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      yPos = margin + 25;
    }
    
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${index + 1}. ${item.term}`, margin, yPos);
    
    yPos += lineHeight;
    
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${item.definition}`, margin + 5, yPos);
    
    yPos += lineHeight;
    
    // Add example on next line if it exists
    if (item.example) {
      // Check if adding the example would exceed the page boundary
      if (yPos > 270) {
        pdf.addPage();
        
        // Add header on new page
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text("Vocabulary Reference Sheet (continued)", margin, margin + 10);
        
        // Reset position
        pdf.setFontSize(11);
        yPos = margin + 25;
      }
      
      pdf.setFont('helvetica', 'italic');
      pdf.text(`Example: "${item.example}"`, margin + 10, yPos);
      
      yPos += lineHeight + 4; // Extra spacing after example
    } else {
      yPos += 4; // Just add space between items
    }
  });
}
