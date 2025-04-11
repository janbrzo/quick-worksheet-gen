
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
    
    // Create PDF with single canvas approach (more reliable for complex layouts)
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Render the entire content as one image with optimized settings
    const canvas = await html2canvas(contentRef.current, {
      scale: 1.5, // Reduced from 2 to optimize file size
      useCORS: true,
      logging: false,
      allowTaint: true,
      backgroundColor: '#ffffff',
      imageTimeout: 0, // Increased timeout for complex layouts
      removeContainer: true, // Clean up temporary elements
      onclone: (clonedDoc) => {
        // Optional: optimize the clone - e.g., remove unnecessary elements
        const nonEssentialElements = clonedDoc.querySelectorAll('.no-print');
        nonEssentialElements.forEach((el) => el.remove());
      }
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
        
        // Add this slice to the PDF with compression
        const imgData = tempCanvas.toDataURL('image/jpeg', 0.85); // Use JPEG for smaller file size
        const sliceHeight = (sourceHeight * contentWidth) / canvas.width;
        
        pdf.addImage(
          imgData,
          'JPEG',
          margin, 
          margin,
          contentWidth, 
          sliceHeight
        );
      }
    }
    
    // We're not adding a separate vocabulary page to avoid duplication
    // since vocabulary is already included in the main content
    
    // Save PDF with compression options
    const pdfOptions = {
      compress: true,
      precision: 2,
      userUnit: 1.0
    };
    
    pdf.save(filename);
    return filename;
    
  } catch (err) {
    console.error("Download error:", err);
    toast.error("Error downloading worksheet. Please try again.");
    return null;
  }
}

/**
 * Function kept for compatibility but no longer used to avoid duplicate vocabulary
 */
function addVocabularyPage(pdf: jsPDF, vocabulary: any[]): void {
  // This function is kept for compatibility but is no longer used
  // to avoid duplicate vocabulary in the PDF
}
