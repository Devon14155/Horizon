import jsPDF from 'jspdf';

export const exportToPDF = (title: string, content: string) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - (margin * 2);
  
  let y = 20;

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(title, margin, y);
  y += 15;
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  const lines = content.split('\n');

  lines.forEach((line) => {
    // Check for page break
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    const trimmed = line.trim();
    
    if (trimmed.startsWith('## ')) {
        y += 5;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text(trimmed.replace(/^#+\s*/, ''), margin, y);
        y += 8;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
    } else if (trimmed.startsWith('# ')) {
        y += 8;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text(trimmed.replace(/^#+\s*/, ''), margin, y);
        y += 10;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
    } else if (trimmed.startsWith('### ')) {
        y += 4;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.text(trimmed.replace(/^#+\s*/, ''), margin, y);
        y += 7;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
    } else if (trimmed.length === 0) {
        y += 4;
    } else {
        const splitText = doc.splitTextToSize(trimmed.replace(/\*\*/g, ''), maxWidth);
        doc.text(splitText, margin, y);
        y += (splitText.length * 5);
    }
  });

  doc.save(`${title.replace(/[^a-z0-9]/gi, '_').substring(0, 30)}_Report.pdf`);
};

export const exportToMarkdown = (title: string, content: string) => {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download =(`${title.replace(/[^a-z0-9]/gi, '_').substring(0, 30)}_Report.md`);
  a.click();
  URL.revokeObjectURL(url);
};