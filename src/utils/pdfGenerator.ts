
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
      const canvas = await html2canvas(contentRef.current, {
        scale: 2.0, // Higher scale for better quality
        useCORS: true,
        logging: false,
        windowWidth: 1100,
        windowHeight: 1600,
        allowTaint: true,
        onclone: (clonedDoc) => {
          // Make sure all content is visible in the cloned document for capture
          const content = clonedDoc.querySelector('#worksheet-content');
          if (content) {
            content.style.height = 'auto';
            content.style.overflow = 'visible';
          }
        }
      });
      
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
      const fullHeight = canvas.height;
      const pageContentHeight = (pageHeight - (2 * margin)) * scaleFactor;
      
      // Process each page to avoid cutting text
      for (let i = 0; i < pageCount; i++) {
        if (i > 0) {
          pdf.addPage();
        }
        
        // Find a good break point (try to avoid cutting in the middle of text)
        let y = i * pageContentHeight;
        
        // If not first page and not last page, try to find a better break point
        if (i > 0 && i < pageCount - 1) {
          // Look for a good spot to break (e.g., by increasing y slightly to find a gap)
          // This is approximate but helps avoid cutting text
          y -= 50; // Move up more to avoid cutting text
        }
        
        // Add the image to the PDF with adjusted margins
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
    
    const canvas = await html2canvas(otherContentRef.current, {
      scale: 2.0,
      useCORS: true,
      logging: false,
      windowWidth: 1100,
      windowHeight: 1600,
      allowTaint: true,
      onclone: (clonedDoc) => {
        // Make sure all content is visible in the cloned document for capture
        const content = clonedDoc.querySelector('#worksheet-content');
        if (content) {
          content.style.height = 'auto';
          content.style.overflow = 'visible';
        }
      }
    });
    
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
    const fullHeight = canvas.height;
    const pageContentHeight = (pageHeight - (2 * margin)) * scaleFactor;
    
    // Process each page to avoid cutting text
    for (let i = 0; i < pageCount; i++) {
      if (i > 0) {
        pdf.addPage();
      }
      
      // Find a good break point
      let y = i * pageContentHeight;
      
      // If not first page and not last page, try to find a better break point
      if (i > 0 && i < pageCount - 1) {
        y -= 50; // Move up more to avoid cutting text
      }
      
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
    
    // Save with correct view mode in filename
    const viewSuffix = otherView === WorksheetView.STUDENT ? "student" : "teacher";
    pdf.save(`${baseFilename}-${viewSuffix}.pdf`);
    
    toast.success('Both worksheets downloaded successfully!');
  } catch (err) {
    console.error("Download error for other view:", err);
  }
};
