
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
  skipVocabularyPage?: boolean;
  isExportMode?: boolean;
}

/**
 * Generates a PDF from the given content reference
 */
export async function generatePdf(options: PdfGenerationOptions): Promise<string | null> {
  const { title, contentRef, viewMode, vocabulary, skipVocabularyPage, isExportMode = false } = options;
  
  try {
    if (!contentRef.current) {
      toast.error("Could not find content to download");
      return null;
    }
    
    // Create a proper filename based on view mode
    const viewSuffix = viewMode === WorksheetView.STUDENT ? "student" : "teacher";
    const baseFilename = `worksheet-${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`;
    const filename = `${baseFilename}-${viewSuffix}.pdf`;
    
    // Create a clone of the content for export to avoid modifying the original DOM
    const contentClone = contentRef.current.cloneNode(true) as HTMLElement;
    
    // Clean up contentEditable and other interactive elements for export
    if (isExportMode) {
      cleanupForExport(contentClone);
    }
    
    // Create PDF with optimized settings
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // PDF dimensions (A4)
    const pdfWidth = 210;
    const pdfHeight = 297;
    const margin = 15;
    
    // Create canvas with optimized settings for better quality-to-size ratio
    const canvas = await html2canvas(contentClone, {
      scale: 1.5, // Lower scale for smaller file size while maintaining reasonable quality
      useCORS: true,
      logging: false,
      allowTaint: true,
      backgroundColor: '#ffffff',
      imageTimeout: 0,
      removeContainer: true,
      // Optimize images for better compression
      onclone: (document, element) => {
        const images = element.querySelectorAll('img');
        images.forEach(img => {
          img.style.maxWidth = '100%';
          img.style.height = 'auto';
        });
        return element;
      }
    });
    
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
        const imgData = tempCanvas.toDataURL('image/jpeg', 0.85); // Use JPEG with compression
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
    
    // Add vocabulary on a separate page if available and not skipped
    if (vocabulary && vocabulary.length > 0 && !skipVocabularyPage) {
      pdf.addPage();
      addVocabularyPage(pdf, vocabulary);
    }
    
    // Save PDF with optimized output
    pdf.save(filename);
    return filename;
    
  } catch (err) {
    console.error("Download error:", err);
    toast.error("Error downloading worksheet. Please try again.");
    return null;
  }
}

/**
 * Cleans up the content for export by removing contentEditable attributes
 * and converting interactive elements to static representations
 */
function cleanupForExport(element: HTMLElement): void {
  // Remove all contentEditable attributes
  const editableElements = element.querySelectorAll('[contenteditable]');
  editableElements.forEach(el => {
    el.removeAttribute('contenteditable');
    
    // Remove editing-related classes
    el.classList.remove(
      'border', 'border-amber-200', 'focus:border-amber-400', 
      'focus:ring-2', 'focus:ring-amber-200', 'hover:bg-amber-50/30',
      'editable-content'
    );
  });
  
  // Convert checkboxes to text representations
  const checkboxes = element.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    const isChecked = (checkbox as HTMLInputElement).checked;
    const textNode = document.createTextNode(isChecked ? '✓' : '☐');
    checkbox.parentNode?.replaceChild(textNode, checkbox);
  });
  
  // Remove any "edit mode" related elements
  const editModeElements = element.querySelectorAll('.editable-mode, .edit-controls');
  editModeElements.forEach(el => el.remove());
  
  // Remove any background colors specific to editing
  const editBackgrounds = element.querySelectorAll('.bg-amber-50\\/30');
  editBackgrounds.forEach(el => {
    el.classList.remove('bg-amber-50/30');
  });
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
