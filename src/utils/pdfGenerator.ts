import { toast } from 'sonner';
import { WorksheetView, WorksheetData } from '@/types/worksheet';

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
    if (viewMode === WorksheetView.STUDENT) {
      toast.success('Your STUDENT worksheet is being prepared for download');
    } else {
      toast.success('Your TEACHER worksheet is being prepared for download');
    }
    
    // Create a proper filename based on view mode
    const baseFilename = `worksheet-${data.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`;
    
    // Import required libraries
    const [html2canvasModule, jsPDFModule] = await Promise.all([
      import('html2canvas'),
      import('jspdf')
    ]);
    
    const html2canvas = html2canvasModule.default;
    const jsPDF = jsPDFModule.default;
    
    // Download current view (student or teacher)
    const contentRef = viewMode === WorksheetView.STUDENT ? studentContentRef : teacherContentRef;
    
    if (contentRef.current) {
      // Apply styles before capturing
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
      
      // Prepare the content for capture
      const origStyles = prepareForCapture(contentRef.current);
      
      // Get all exercise elements to properly calculate page breaks
      const exerciseElements = contentRef.current.querySelectorAll('[class*="border-b border-gray-200"]');
      const exercisePositions = Array.from(exerciseElements).map(el => {
        const rect = el.getBoundingClientRect();
        return { 
          top: rect.top + window.scrollY,
          bottom: rect.bottom + window.scrollY
        };
      });
      
      // Create canvas with higher density for better quality
      const canvas = await html2canvas(contentRef.current, {
        scale: 2.0, // Higher scale for better quality
        useCORS: true,
        logging: false,
        width: contentRef.current.offsetWidth,
        height: contentRef.current.scrollHeight,
        allowTaint: true,
        onclone: (clonedDoc) => {
          // Make sure all content is visible in the cloned document for capture
          const content = clonedDoc.querySelector('#worksheet-content');
          if (content instanceof HTMLElement) {
            content.style.height = 'auto';
            content.style.overflow = 'visible';
          }
        }
      });
      
      // Create new PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      // PDF dimensions
      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const margin = 15; // Margin in mm
      
      // Calculate content dimensions
      const contentWidth = pageWidth - (2 * margin);
      const contentHeight = (canvas.height * contentWidth) / canvas.width;
      
      // Calculate scaling for better page breaks
      const scaleFactor = canvas.width / contentWidth;
      const pageContentHeight = pageHeight - (2 * margin);
      
      // Function to add image to PDF with proper positioning
      const addImageToPdf = (pdf: any, imgData: string, startY: number, height: number) => {
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
        
        // Try to find good break points at exercise boundaries
        let breakPoint = y + heightOnThisPage;
        
        // Adjust breakpoint to avoid cutting in the middle of exercises
        for (const pos of exercisePositions) {
          if (pos.top > y && pos.top < breakPoint) {
            // Found an exercise starting in this page
            if (pos.top - y < heightOnThisPage * 0.7) {
              // If it's in the first 70% of the page, include it
              continue;
            } else {
              // Otherwise, break before this exercise
              breakPoint = pos.top;
              break;
            }
          }
        }
        
        // Add the content section to this page
        addImageToPdf(pdf, imgData, y, heightOnThisPage);
        
        // Update for next page
        y += (breakPoint - y);
        remainingHeight = contentHeight - y / scaleFactor;
        pageCount++;
      }
      
      // Add vocabulary on a separate page at the end
      if (data.vocabulary && data.vocabulary.length > 0) {
        pdf.addPage();
        
        // Add vocabulary title
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text("Vocabulary Sheet", margin, margin + 10);
        
        // Add vocabulary items
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        
        let yPos = margin + 20;
        const lineHeight = 8;
        
        data.vocabulary.forEach((item, index) => {
          // Add a new page if needed
          if (yPos > pageHeight - margin) {
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
            if (yPos > pageHeight - margin) {
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
      
      // Restore original styles
      if (contentRef.current) {
        contentRef.current.style.height = origStyles.height;
        contentRef.current.style.overflow = origStyles.overflow;
        contentRef.current.style.display = origStyles.display;
      }
      
      // Save with correct view mode in filename
      const viewSuffix = viewMode === WorksheetView.STUDENT ? "student" : "teacher";
      pdf.save(`${baseFilename}-${viewSuffix}.pdf`);
      
      // If we're in student view, also generate teacher view (and vice versa)
      setTimeout(() => {
        downloadOtherView(html2canvas, jsPDF, studentContentRef, teacherContentRef, viewMode, data, baseFilename);
      }, 1000);
    }
  } catch (err) {
    console.error("Download error:", err);
    toast.error("Error downloading worksheet. Please try again.");
  }
};

// Function to download the other view 
const downloadOtherView = async (
  html2canvas: any,
  jsPDF: any,
  studentContentRef: React.RefObject<HTMLDivElement>,
  teacherContentRef: React.RefObject<HTMLDivElement>,
  viewMode: WorksheetView,
  data: WorksheetData,
  baseFilename: string
) => {
  try {
    // Determine which view to download (opposite of current view)
    const otherView = viewMode === WorksheetView.STUDENT ? WorksheetView.TEACHER : WorksheetView.STUDENT;
    const otherContentRef = otherView === WorksheetView.STUDENT ? studentContentRef : teacherContentRef;
    
    if (!otherContentRef.current) {
      return;
    }
    
    // Display processing message for other view
    const viewName = otherView === WorksheetView.STUDENT ? "STUDENT" : "TEACHER";
    toast.success(`Your ${viewName} worksheet is also being prepared for download`);
    
    // Apply styles before capturing
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
    
    // Prepare the content for capture
    const origStyles = prepareForCapture(otherContentRef.current);
    
    // Get all exercise elements to properly calculate page breaks
    const exerciseElements = otherContentRef.current.querySelectorAll('[class*="border-b border-gray-200"]');
    const exercisePositions = Array.from(exerciseElements).map(el => {
      const rect = el.getBoundingClientRect();
      return { 
        top: rect.top + window.scrollY,
        bottom: rect.bottom + window.scrollY
      };
    });
    
    const canvas = await html2canvas(otherContentRef.current, {
      scale: 2.0,
      useCORS: true,
      logging: false,
      width: otherContentRef.current.offsetWidth,
      height: otherContentRef.current.scrollHeight,
      allowTaint: true,
      onclone: (clonedDoc) => {
        // Make sure all content is visible in the cloned document for capture
        const content = clonedDoc.querySelector('#worksheet-content');
        if (content instanceof HTMLElement) {
          content.style.height = 'auto';
          content.style.overflow = 'visible';
        }
      }
    });
    
    // Create new PDF document
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    
    // PDF dimensions
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const margin = 15; // Margin in mm
    
    // Calculate content dimensions
    const contentWidth = pageWidth - (2 * margin);
    const contentHeight = (canvas.height * contentWidth) / canvas.width;
    
    // Calculate scaling for better page breaks
    const scaleFactor = canvas.width / contentWidth;
    const pageContentHeight = pageHeight - (2 * margin);
    
    // Function to add image to PDF with proper positioning
    const addImageToPdf = (pdf: any, imgData: string, startY: number, height: number) => {
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
      
      // Try to find good break points at exercise boundaries
      let breakPoint = y + heightOnThisPage;
      
      // Adjust breakpoint to avoid cutting in the middle of exercises
      for (const pos of exercisePositions) {
        if (pos.top > y && pos.top < breakPoint) {
          // Found an exercise starting in this page
          if (pos.top - y < heightOnThisPage * 0.7) {
            // If it's in the first 70% of the page, include it
            continue;
          } else {
            // Otherwise, break before this exercise
            breakPoint = pos.top;
            break;
          }
        }
      }
      
      // Add the content section to this page
      addImageToPdf(pdf, imgData, y, heightOnThisPage);
      
      // Update for next page
      y += (breakPoint - y);
      remainingHeight = contentHeight - y / scaleFactor;
      pageCount++;
    }
    
    // Add vocabulary on a separate page at the end
    if (data.vocabulary && data.vocabulary.length > 0) {
      pdf.addPage();
      
      // Add vocabulary title
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text("Vocabulary Sheet", margin, margin + 10);
      
      // Add vocabulary items
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      let yPos = margin + 20;
      const lineHeight = 8;
      
      data.vocabulary.forEach((item, index) => {
        // Add a new page if needed
        if (yPos > pageHeight - margin) {
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
          if (yPos > pageHeight - margin) {
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
    
    // Restore original styles
    if (otherContentRef.current) {
      otherContentRef.current.style.height = origStyles.height;
      otherContentRef.current.style.overflow = origStyles.overflow;
      otherContentRef.current.style.display = origStyles.display;
    }
    
    // Save with correct view mode in filename
    const viewSuffix = otherView === WorksheetView.STUDENT ? "student" : "teacher";
    pdf.save(`${baseFilename}-${viewSuffix}.pdf`);
    
    toast.success('Both worksheets downloaded successfully!');
  } catch (err) {
    console.error("Download error for other view:", err);
  }
};
