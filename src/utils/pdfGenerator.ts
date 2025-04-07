import { toast } from 'sonner';
import { WorksheetView, WorksheetData } from '@/types/worksheet';

// PDF Dimensions & Constants
const PDF_CONFIG = {
  pageWidth: 210, // A4 width in mm
  pageHeight: 297, // A4 height in mm
  margin: 15, // Margin in mm
  scale: 2.0, // Higher scale for better quality
};

/**
 * Main function to generate PDF for student and teacher views
 */
export const generatePDF = async (
  studentContentRef: React.RefObject<HTMLDivElement>,
  teacherContentRef: React.RefObject<HTMLDivElement>,
  viewMode: WorksheetView,
  data: WorksheetData
) => {
  try {
    if (!studentContentRef.current && !teacherContentRef.current) {
      toast.error("Could not find content to download");
      return;
    }
    
    // Display processing message for specific view
    const viewName = viewMode === WorksheetView.STUDENT ? "STUDENT" : "TEACHER";
    toast.success(`Your ${viewName} worksheet is being prepared for download`);
    
    // Create a proper filename based on view mode
    const baseFilename = `worksheet-${data.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`;
    
    // Import required libraries
    const [html2canvasModule, jsPDFModule] = await importPDFLibraries();
    
    // Generate the current view PDF
    await generateSinglePDF(
      html2canvasModule.default,
      jsPDFModule.default,
      viewMode === WorksheetView.STUDENT ? studentContentRef : teacherContentRef,
      data,
      baseFilename,
      viewMode
    );
    
    // Generate the opposite view after a short delay
    setTimeout(() => {
      const otherView = viewMode === WorksheetView.STUDENT ? WorksheetView.TEACHER : WorksheetView.STUDENT;
      const otherContentRef = otherView === WorksheetView.STUDENT ? studentContentRef : teacherContentRef;
      
      downloadOtherView(
        html2canvasModule.default,
        jsPDFModule.default,
        otherContentRef,
        data,
        baseFilename,
        otherView
      );
    }, 1000);
  } catch (err) {
    console.error("Download error:", err);
    toast.error("Error downloading worksheet. Please try again.");
  }
};

/**
 * Import HTML2Canvas and jsPDF libraries
 */
const importPDFLibraries = async () => {
  return Promise.all([
    import('html2canvas'),
    import('jspdf')
  ]);
};

/**
 * Generate PDF for a specific view (student or teacher)
 */
const generateSinglePDF = async (
  html2canvas: any,
  jsPDF: any,
  contentRef: React.RefObject<HTMLDivElement>,
  data: WorksheetData,
  baseFilename: string,
  viewMode: WorksheetView
) => {
  if (!contentRef.current) return;
  
  // Apply styles before capturing
  const origStyles = prepareForCapture(contentRef.current);
  
  // Get positions of exercise elements for page break calculation
  const exercisePositions = getExercisePositions(contentRef.current);
  
  // Create canvas with higher density for better quality
  const canvas = await createCanvas(html2canvas, contentRef.current);
  
  // Create new PDF document
  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgData = canvas.toDataURL('image/png');
  
  // Generate the PDF content
  generatePDFContent(pdf, imgData, canvas, exercisePositions);
  
  // Add vocabulary if present
  if (data.vocabulary && data.vocabulary.length > 0) {
    addVocabularyPage(pdf, data);
  }
  
  // Restore original styles
  if (contentRef.current) {
    restoreOriginalStyles(contentRef.current, origStyles);
  }
  
  // Save with correct view mode in filename
  const viewSuffix = viewMode === WorksheetView.STUDENT ? "student" : "teacher";
  pdf.save(`${baseFilename}-${viewSuffix}.pdf`);
};

/**
 * Prepare the HTML element for PDF capture
 */
const prepareForCapture = (element: HTMLElement) => {
  // Force all elements to be visible
  const origStyles = {
    height: element.style.height,
    overflow: element.style.overflow,
    display: element.style.display
  };
  
  element.style.height = 'auto';
  element.style.overflow = 'visible';
  element.style.display = 'block';
  
  return origStyles;
};

/**
 * Get positions of exercise elements for better page breaks
 */
const getExercisePositions = (element: HTMLElement) => {
  const exerciseElements = element.querySelectorAll('[class*="border-b border-gray-200"]');
  return Array.from(exerciseElements).map(el => {
    const rect = el.getBoundingClientRect();
    return { 
      top: rect.top + window.scrollY,
      bottom: rect.bottom + window.scrollY
    };
  });
};

/**
 * Create canvas from HTML content
 */
const createCanvas = async (html2canvas: any, element: HTMLElement) => {
  return html2canvas(element, {
    scale: PDF_CONFIG.scale,
    useCORS: true,
    logging: false,
    width: element.offsetWidth,
    height: element.scrollHeight,
    allowTaint: true,
    onclone: (clonedDoc: Document) => {
      // Make sure all content is visible in the cloned document for capture
      const content = clonedDoc.querySelector('#worksheet-content');
      if (content instanceof HTMLElement) {
        content.style.height = 'auto';
        content.style.overflow = 'visible';
      }
    }
  });
};

/**
 * Generate the PDF content with proper page breaks
 */
const generatePDFContent = (pdf: any, imgData: string, canvas: HTMLCanvasElement, exercisePositions: {top: number, bottom: number}[]) => {
  // Calculate content dimensions
  const contentWidth = PDF_CONFIG.pageWidth - (2 * PDF_CONFIG.margin);
  const contentHeight = (canvas.height * contentWidth) / canvas.width;
  
  // Calculate scaling for better page breaks
  const scaleFactor = canvas.width / contentWidth;
  const pageContentHeight = PDF_CONFIG.pageHeight - (2 * PDF_CONFIG.margin);
  
  // Split the content into chunks that fit on a page
  let y = 0;
  let remainingHeight = contentHeight;
  let pageCount = 0;
  
  while (remainingHeight > 0) {
    if (pageCount > 0) {
      pdf.addPage();
    }
    
    // Calculate how much content can fit on this page
    const pageContentInPoints = pageContentHeight * scaleFactor;
    const heightOnThisPage = Math.min(pageContentInPoints, remainingHeight);
    
    // Find optimal page break point
    const breakPoint = findOptimalBreakPoint(y, heightOnThisPage, exercisePositions);
    
    // Add the content section to this page
    addImageToPdf(pdf, imgData, y, contentWidth, contentHeight, PDF_CONFIG.margin, scaleFactor);
    
    // Update for next page
    y += (breakPoint - y);
    remainingHeight = contentHeight - y / scaleFactor;
    pageCount++;
  }
};

/**
 * Find the optimal break point for a page
 */
const findOptimalBreakPoint = (
  startY: number, 
  heightOnThisPage: number, 
  exercisePositions: {top: number, bottom: number}[]
) => {
  let breakPoint = startY + heightOnThisPage;
  
  // Adjust breakpoint to avoid cutting in the middle of exercises
  for (const pos of exercisePositions) {
    if (pos.top > startY && pos.top < breakPoint) {
      // Found an exercise starting in this page
      if (pos.top - startY < heightOnThisPage * 0.7) {
        // If it's in the first 70% of the page, include it
        continue;
      } else {
        // Otherwise, break before this exercise
        breakPoint = pos.top;
        break;
      }
    }
  }
  
  return breakPoint;
};

/**
 * Add image to PDF with proper positioning
 */
const addImageToPdf = (
  pdf: any, 
  imgData: string, 
  startY: number, 
  contentWidth: number, 
  contentHeight: number, 
  margin: number, 
  scaleFactor: number
) => {
  pdf.addImage(
    imgData,
    'PNG',
    margin, // x position
    margin, // y position
    contentWidth, // width
    contentHeight, // total height
    undefined, // alias
    'FAST', // compression
    0, // rotation
    -startY / scaleFactor // crop start position
  );
};

/**
 * Restore original styles to the HTML element
 */
const restoreOriginalStyles = (element: HTMLElement, origStyles: {height: string, overflow: string, display: string}) => {
  element.style.height = origStyles.height;
  element.style.overflow = origStyles.overflow;
  element.style.display = origStyles.display;
};

/**
 * Add vocabulary page to the PDF
 */
const addVocabularyPage = (pdf: any, data: WorksheetData) => {
  pdf.addPage();
  
  // Add vocabulary title
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text("Vocabulary Sheet", PDF_CONFIG.margin, PDF_CONFIG.margin + 10);
  
  // Add vocabulary items
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  
  let yPos = PDF_CONFIG.margin + 20;
  const lineHeight = 8;
  
  data.vocabulary!.forEach((item, index) => {
    // Add a new page if needed
    if (yPos > PDF_CONFIG.pageHeight - PDF_CONFIG.margin) {
      pdf.addPage();
      yPos = PDF_CONFIG.margin + 10;
    }
    
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${index + 1}. ${item.term}`, PDF_CONFIG.margin, yPos);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`- ${item.definition}`, PDF_CONFIG.margin + 30, yPos);
    
    yPos += lineHeight;
    
    // Add example on next line if it exists
    if (item.example) {
      if (yPos > PDF_CONFIG.pageHeight - PDF_CONFIG.margin) {
        pdf.addPage();
        yPos = PDF_CONFIG.margin + 10;
      }
      
      pdf.setFont('helvetica', 'italic');
      pdf.text(`  Example: ${item.example}`, PDF_CONFIG.margin, yPos);
      pdf.setFont('helvetica', 'normal');
      
      yPos += lineHeight + 2; // Extra spacing after example
    } else {
      yPos += 2; // Just a bit of extra spacing between items
    }
  });
};

/**
 * Download the other view (student or teacher)
 */
const downloadOtherView = async (
  html2canvas: any,
  jsPDF: any,
  otherContentRef: React.RefObject<HTMLDivElement>,
  data: WorksheetData,
  baseFilename: string,
  otherView: WorksheetView
) => {
  try {
    if (!otherContentRef.current) {
      return;
    }
    
    // Display processing message for other view
    const viewName = otherView === WorksheetView.STUDENT ? "STUDENT" : "TEACHER";
    toast.success(`Your ${viewName} worksheet is also being prepared for download`);
    
    // Generate the other view PDF
    await generateSinglePDF(
      html2canvas,
      jsPDF,
      otherContentRef,
      data,
      baseFilename,
      otherView
    );
    
    toast.success('Both worksheets downloaded successfully!');
  } catch (err) {
    console.error("Download error for other view:", err);
  }
};
