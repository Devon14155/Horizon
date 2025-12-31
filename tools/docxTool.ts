import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";

export const exportToDOCX = async (title: string, content: string) => {
  // Simple markdown-ish parser to DOCX paragraphs
  const lines = content.split('\n');
  const docChildren = [];

  // Title
  docChildren.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.TITLE,
      spacing: { after: 200 }
    })
  );

  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('# ')) {
       docChildren.push(new Paragraph({ 
         text: trimmed.replace('# ', ''), 
         heading: HeadingLevel.HEADING_1,
         spacing: { before: 200, after: 100 }
       }));
    } else if (trimmed.startsWith('## ')) {
       docChildren.push(new Paragraph({ 
         text: trimmed.replace('## ', ''), 
         heading: HeadingLevel.HEADING_2,
         spacing: { before: 150, after: 100 }
       }));
    } else if (trimmed.startsWith('### ')) {
       docChildren.push(new Paragraph({ 
         text: trimmed.replace('### ', ''), 
         heading: HeadingLevel.HEADING_3,
         spacing: { before: 100, after: 100 }
       }));
    } else if (trimmed.startsWith('- ')) {
       docChildren.push(new Paragraph({ 
         text: trimmed.replace('- ', ''), 
         bullet: { level: 0 } 
       }));
    } else if (trimmed.length > 0) {
       docChildren.push(new Paragraph({ 
         children: [ new TextRun(trimmed) ],
         spacing: { after: 100 }
       }));
    }
  });

  const doc = new Document({
    sections: [{
      properties: {},
      children: docChildren,
    }],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/\s+/g, '_')}_Report.docx`;
  a.click();
  URL.revokeObjectURL(url);
};