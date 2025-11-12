import fs from 'fs';
import { marked } from 'marked';
import { jsPDF } from 'jspdf';

// Read README
const md = fs.readFileSync('README.md', 'utf-8');

// Configure marked to get tokens
const tokens = marked.lexer(md);

// PDF setup
const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
const page = { width: 210, height: 297, margin: 20 };
const contentWidth = page.width - page.margin * 2;
let y = page.margin;

// Helpers
function ensure(h = 0) {
  if (y + h > page.height - page.margin) {
    doc.addPage();
    y = page.margin;
  }
}

function textBlock(text, options = {}) {
  const {
    font = 'helvetica',
    style = 'normal',
    size = 11,
    color = [0, 0, 0],
    indent = 0,
    lineHeight = 5,
  } = options;
  if (!text || String(text).trim().length === 0) return;
  doc.setFont(font, style);
  doc.setFontSize(size);
  doc.setTextColor(...color);
  const lines = doc.splitTextToSize(String(text), contentWidth - indent);
  for (const ln of lines) {
    ensure(lineHeight);
    doc.text(ln, page.margin + indent, y);
    y += lineHeight;
  }
}

function hrule() {
  ensure(4);
  doc.setDrawColor(200);
  doc.setLineWidth(0.3);
  doc.line(page.margin, y, page.width - page.margin, y);
  y += 4;
}

function codeBlock(code, lang) {
  const padding = 2;
  const size = 9;
  const lineHeight = 4.5;
  doc.setFont('courier', 'normal');
  doc.setFontSize(size);
  const lines = String(code).replace(/\r\n?/g, '\n').split('\n');
  // background box height calculation
  let blockHeight = lines.length * lineHeight + padding * 2;
  ensure(blockHeight + 2);
  // background
  doc.setFillColor(245, 245, 245);
  doc.setDrawColor(230, 230, 230);
  doc.rect(page.margin - 1, y - 3, contentWidth + 2, blockHeight + 2, 'FD');
  y += padding;
  for (const ln of lines) {
    ensure(lineHeight + padding);
    doc.text(ln || ' ', page.margin, y + lineHeight);
    y += lineHeight;
  }
  y += padding;
}

function table(header, rows) {
  const cols = header.length;
  if (!cols) return;
  const colWidth = contentWidth / cols;
  const rowHeight = 6;

  // header
  ensure(rowHeight + 2);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  header.forEach((h, i) => {
    const tx = page.margin + i * colWidth + 1;
    doc.text(doc.splitTextToSize(String(h), colWidth - 2), tx, y);
  });
  y += rowHeight;
  doc.setDrawColor(180);
  doc.line(page.margin, y - 2, page.width - page.margin, y - 2);

  // rows
  doc.setFont('helvetica', 'normal');
  rows.forEach((r) => {
    ensure(rowHeight + 1);
    r.forEach((cell, i) => {
      const tx = page.margin + i * colWidth + 1;
      doc.text(doc.splitTextToSize(String(cell), colWidth - 2), tx, y);
    });
    y += rowHeight;
  });
}

// Very small inline cleaner for bold/italic/code/links
function inlineClean(t) {
  return String(t)
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1 ($2)');
}

function render(tokens) {
  for (const tok of tokens) {
    switch (tok.type) {
      case 'space':
        y += 2;
        break;
      case 'hr':
        hrule();
        break;
      case 'heading': {
        const sizes = { 1: 20, 2: 16, 3: 14, 4: 12, 5: 11, 6: 11 };
        const add = { 1: 8, 2: 6, 3: 5, 4: 4, 5: 3, 6: 3 };
        ensure(6);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(sizes[tok.depth] || 12);
        textBlock(inlineClean(tok.text), { style: 'bold', size: sizes[tok.depth] || 12 });
        y += add[tok.depth] || 4;
        break;
      }
      case 'paragraph': {
        textBlock(inlineClean(tok.text), { size: 11, lineHeight: 5 });
        y += 1;
        break;
      }
      case 'blockquote': {
        // left bar + gray text
        ensure(6);
        const startY = y;
        const beforeY = y;
        textBlock(inlineClean(tok.text), { color: [80, 80, 80], indent: 4, size: 11 });
        doc.setDrawColor(160, 160, 160);
        doc.setLineWidth(1);
        doc.line(page.margin, beforeY - 2, page.margin, y);
        y += 2;
        break;
      }
      case 'list': {
        const isOrdered = tok.ordered;
        let idx = tok.start || 1;
        for (const item of tok.items) {
          const bullet = isOrdered ? `${idx++}.` : '•';
          // bullet line
          textBlock(`${bullet} ${inlineClean(item.text)}`, { indent: 4, size: 11 });
          // nested items
          if (item.tokens) {
            // render nested tokens with more indent by temporarily increasing margin
            const savedMargin = page.margin;
            page.margin += 6;
            render(item.tokens);
            page.margin = savedMargin;
          }
        }
        y += 1;
        break;
      }
      case 'code': {
        codeBlock(tok.text, tok.lang);
        y += 1;
        break;
      }
      case 'table': {
        table(tok.header, tok.rows || tok.cells || []);
        y += 2;
        break;
      }
      case 'text': {
        // Fallback text lines (often inside lists)
        textBlock(inlineClean(tok.text), { size: 11 });
        break;
      }
      default:
        // ignore unsupported token types (html, image, etc.)
        break;
    }
  }
}

doc.setFont('helvetica', 'normal');
render(tokens);

const outName = 'MultiAI-Chat-Studio-README.pdf';
doc.save(outName);
console.log(`✅ PDF generated successfully: ${outName}`);
