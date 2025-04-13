
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
    
    try {
      // Create canvas with better settings for PDF quality
      const canvas = await html2canvas(contentClone, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff',
        removeContainer: true
      });
      
      // Calculate content dimensions with margins
      const contentWidth = pdfWidth - (2 * margin);
      const canvasAspectRatio = canvas.height / canvas.width;
      const contentHeight = contentWidth * canvasAspectRatio;
      
      // If content fits on one page
      if (contentHeight <= pdfHeight - (2 * margin)) {
        // Add the entire canvas as a single image
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        pdf.addImage(
          imgData,
          'JPEG',
          margin,
          margin,
          contentWidth,
          contentHeight
        );
      } else {
        // Content needs multiple pages - split it
        let remainingHeight = canvas.height;
        let sourceY = 0;
        
        while (remainingHeight > 0) {
          // Calculate height for this page in pixels
          const pageHeightPx = Math.min(
            remainingHeight,
            (pdfHeight - (2 * margin)) / contentWidth * canvas.width
          );
          
          // Create a temporary canvas for this page slice
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = canvas.width;
          tempCanvas.height = pageHeightPx;
          
          // Draw the specific portion of the original canvas
          const ctx = tempCanvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(
              canvas, 
              0, sourceY, canvas.width, pageHeightPx,
              0, 0, canvas.width, pageHeightPx
            );
            
            // Add this slice to the PDF
            const imgData = tempCanvas.toDataURL('image/jpeg', 0.92);
            const sliceHeight = (pageHeightPx / canvas.width) * contentWidth;
            
            if (sourceY > 0) {
              pdf.addPage();
            }
            
            pdf.addImage(
              imgData,
              'JPEG',
              margin, 
              margin,
              contentWidth, 
              sliceHeight
            );
            
            // Update for next iteration
            sourceY += pageHeightPx;
            remainingHeight -= pageHeightPx;
          }
        }
      }
      
      // Add vocabulary on a separate page if available and not skipped
      if (vocabulary && vocabulary.length > 0 && !skipVocabularyPage) {
        pdf.addPage();
        addVocabularyPage(pdf, vocabulary);
      }
      
      // Save PDF file
      pdf.save(filename);
      return filename;
    } catch (canvasError) {
      console.error("Canvas error:", canvasError);
      
      // Fallback to simplified PDF generation if canvas approach fails
      const simpleClone = contentClone.cloneNode(true) as HTMLElement;
      // Remove complex elements that might cause errors
      const complexElements = simpleClone.querySelectorAll('canvas, svg, img');
      complexElements.forEach(el => {
        const replacement = document.createElement('div');
        replacement.textContent = '[Image content]';
        el.parentNode?.replaceChild(replacement, el);
      });
      
      const simpleCanvas = await html2canvas(simpleClone, {
        scale: 1.5,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = simpleCanvas.toDataURL('image/jpeg', 0.9);
      const contentWidth = pdfWidth - (2 * margin);
      const contentHeight = contentWidth * (simpleCanvas.height / simpleCanvas.width);
      
      pdf.addImage(
        imgData,
        'JPEG',
        margin,
        margin,
        contentWidth,
        contentHeight
      );
      
      pdf.save(filename);
      return filename;
    }
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
  
  // Remove any buttons or interactive controls
  const buttons = element.querySelectorAll('button');
  buttons.forEach(button => button.remove());
  
  // Ensure all inputs are converted to static text
  const inputs = element.querySelectorAll('input:not([type="checkbox"])');
  inputs.forEach(input => {
    const value = (input as HTMLInputElement).value || "";
    const textNode = document.createTextNode(value);
    input.parentNode?.replaceChild(textNode, input);
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
