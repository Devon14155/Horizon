import jsPDF from 'jspdf';

export const exportToPDF = (title: string, content: string) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.text(title, 20, 20);
  
  // Content (Simplified text wrapping)
  doc.setFontSize(12);
  const splitText = doc.splitTextToSize(content.replace(/[#*]/g, ''), 170);
  
  let y = 30;
  splitText.forEach((line: string) => {
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, 20, y);
    y += 7;
  });

  doc.save(`${title.replace(/\s+/g, '_')}_Report.pdf`);
};

export const exportToMarkdown = (title: string, content: string) => {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download =(`${title.replace(/\s+/g, '_')}_Report.md`);
  a.click();
  URL.revokeObjectURL(url);
};