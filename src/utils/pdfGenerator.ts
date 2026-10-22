import { jsPDF } from 'jspdf';
import { ExportFormat, LabelBorderStyle, SerializedConfig, InfoConfig } from '../types/label';
import { generateBarcodeDataUrl } from './barcodeHelper';

export interface LabelDrawData {
  id: string;
  topTitle: string;
  primaryCode: string;
  barcodeData: string;
  showBarcode: boolean;
  subtitle?: string;
  mode: 'serialized' | 'information';
  fields?: { label: string; value: string }[];
  thumbnailUrl?: string;
  notes?: string;
}

interface CommonPdfOptions {
  format: ExportFormat;
  borderStyle: LabelBorderStyle;
  fontFamily: string;
  titleSize: number;
  primarySize: number;
  subtitleSize: number;
  barcodeHeight: number;
  showBarcodeHumanReadable?: boolean;
}

/**
 * Maps standard CSS fonts to standard PDF fonts
 */
function getPdfFont(fontName: string): string {
  if (fontName.toLowerCase().includes('mono') || fontName.toLowerCase().includes('courier')) {
    return 'courier';
  }
  if (fontName.toLowerCase().includes('serif') || fontName.toLowerCase().includes('times') || fontName.toLowerCase().includes('playfair')) {
    return 'times';
  }
  return 'helvetica';
}

/**
 * Draws a single 4" x 2" label inside the specified bounding box (x, y, w=4, h=2) in inches
 */
function drawSingleLabel(
  doc: jsPDF,
  label: LabelDrawData,
  originX: number,
  originY: number,
  width: number,
  height: number,
  options: CommonPdfOptions
) {
  const fontName = getPdfFont(options.fontFamily);
  const centerX = originX + width / 2;
  
  // 1. Draw border / cut guide if enabled
  if (options.borderStyle === 'solid_border') {
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.015);
    doc.rect(originX + 0.05, originY + 0.05, width - 0.1, height - 0.1);
  } else if (options.borderStyle === 'subtle_guide') {
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.008);
    // Draw subtle dashed border guide
    doc.setLineDashPattern([0.05, 0.05], 0);
    doc.rect(originX + 0.02, originY + 0.02, width - 0.04, height - 0.04);
    doc.setLineDashPattern([], 0); // reset
  }

  // 2. Render content based on mode
  if (label.mode === 'serialized') {
    // Exactly matches the user's attached reference image:
    // TOP: COMPANY TITLE (centered)
    // MIDDLE: ########## (serial number, centered)
    // BOTTOM: Barcode (centered)
    
    // Header Company Title
    if (label.topTitle) {
      doc.setFont(fontName, 'bold');
      doc.setFontSize(options.titleSize);
      doc.setTextColor(15, 23, 42);
      doc.text(label.topTitle.toUpperCase(), centerX, originY + 0.42, { align: 'center' });
    }

    // Optional Subtitle
    if (label.subtitle) {
      doc.setFont(fontName, 'normal');
      doc.setFontSize(options.subtitleSize);
      doc.setTextColor(100, 116, 139);
      doc.text(label.subtitle, centerX, originY + 0.62, { align: 'center' });
    }

    // Primary Serial Code (centered)
    doc.setFont(fontName, 'bold');
    doc.setFontSize(options.primarySize);
    doc.setTextColor(0, 0, 0);
    const serialY = label.subtitle ? originY + 0.95 : originY + 0.88;
    doc.text(label.primaryCode, centerX, serialY, { align: 'center' });

    // Barcode (centered bottom)
    if (label.showBarcode && label.barcodeData) {
      const barcodeImg = generateBarcodeDataUrl(label.barcodeData, 'CODE128', {
        height: Math.round(options.barcodeHeight * 1.5),
        width: 2,
        displayValue: options.showBarcodeHumanReadable ?? false,
        fontSize: 10,
      });

      if (barcodeImg) {
        // Calculate barcode dimensions in inches
        const bcWidthInches = Math.min(width - 0.6, 2.8);
        const bcHeightInches = Math.max(0.4, Math.min(0.7, (options.barcodeHeight / 72) * 1.1));
        const bcX = centerX - bcWidthInches / 2;
        const bcY = originY + height - bcHeightInches - 0.15;
        try {
          doc.addImage(barcodeImg, 'PNG', bcX, bcY, bcWidthInches, bcHeightInches, undefined, 'FAST');
        } catch (e) {
          console.error('Failed to add barcode image to PDF', e);
        }
      }
    }
  } else {
    // Mode 2: Information Label
    // Image Name, Image Date, User's Name, plus optional notes/company/thumbnail
    const leftMargin = originX + 0.25;
    const contentWidth = width - 0.5;

    // Header / Company (if provided)
    let currentY = originY + 0.32;
    if (label.topTitle) {
      doc.setFont(fontName, 'bold');
      doc.setFontSize(options.titleSize);
      doc.setTextColor(71, 85, 105);
      doc.text(label.topTitle.toUpperCase(), leftMargin, currentY);
      currentY += 0.22;
    }

    // Image Name (Primary Title)
    doc.setFont(fontName, 'bold');
    doc.setFontSize(options.primarySize);
    doc.setTextColor(15, 23, 42);
    
    // Label header for Image Name
    doc.setFontSize(options.subtitleSize);
    doc.setFont(fontName, 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('IMAGE NAME', leftMargin, currentY);
    currentY += 0.18;

    doc.setFont(fontName, 'bold');
    doc.setFontSize(options.primarySize);
    doc.setTextColor(15, 23, 42);
    // Truncate or wrap if long
    const splitName = doc.splitTextToSize(label.primaryCode || 'Untitled', contentWidth - (label.thumbnailUrl ? 1.0 : 0));
    doc.text(splitName[0] || '', leftMargin, currentY);
    currentY += 0.28;

    // Ruled divider line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.01);
    doc.line(leftMargin, currentY - 0.08, originX + width - 0.25, currentY - 0.08);

    // Metadata Fields (Image Date, User's Name)
    if (label.fields && label.fields.length > 0) {
      const colWidth = (contentWidth - 0.2) / 2;
      
      label.fields.forEach((field, idx) => {
        const colX = leftMargin + (idx % 2) * colWidth;
        const rowY = currentY + Math.floor(idx / 2) * 0.38;

        // Field Label (small uppercase)
        doc.setFont(fontName, 'bold');
        doc.setFontSize(options.subtitleSize);
        doc.setTextColor(100, 116, 139);
        doc.text(field.label.toUpperCase(), colX, rowY);

        // Field Value
        doc.setFont(fontName, 'bold');
        doc.setFontSize(options.titleSize || 11);
        doc.setTextColor(15, 23, 42);
        doc.text(field.value, colX, rowY + 0.18);
      });
      currentY += 0.45;
    }

    // Optional thumbnail image preview if user provided one
    if (label.thumbnailUrl) {
      try {
        const thumbSize = 0.75;
        const thumbX = originX + width - thumbSize - 0.25;
        const thumbY = originY + 0.25;
        doc.addImage(label.thumbnailUrl, 'JPEG', thumbX, thumbY, thumbSize, thumbSize, undefined, 'FAST');
        doc.setDrawColor(203, 213, 225);
        doc.rect(thumbX, thumbY, thumbSize, thumbSize);
      } catch (e) {
        console.warn('Could not embed thumbnail into PDF', e);
      }
    }
  }
}

/**
 * Generates the full PDF and returns it as a Blob or triggers a download
 */
export async function generateLabelsPdf(
  labels: LabelDrawData[],
  format: ExportFormat,
  options: CommonPdfOptions,
  action: 'download' | 'blob' | 'open' = 'download',
  filename: string = '4x2_labels.pdf'
): Promise<Blob> {
  if (labels.length === 0) {
    throw new Error('No labels to generate');
  }

  const labelWidth = 4.0;  // 4 inches
  const labelHeight = 2.0; // 2 inches

  let doc: jsPDF;

  if (format === 'single_roll') {
    // Single 4" x 2" page per label (standard for direct thermal roll printers)
    // In jsPDF, [height, width] = [2, 4] with landscape orientation yields 4" wide x 2" tall
    doc = new jsPDF({
      orientation: 'landscape',
      unit: 'in',
      format: [2, 4],
    });

    labels.forEach((label, index) => {
      if (index > 0) {
        doc.addPage([2, 4], 'landscape');
      }
      drawSingleLabel(doc, label, 0, 0, labelWidth, labelHeight, options);
    });
  } else {
    // Avery 5163 / 5963 (8.5" x 11" Letter sheet with 10 labels per page)
    doc = new jsPDF({
      orientation: 'portrait',
      unit: 'in',
      format: 'letter',
    });

    const labelsPerPage = 10;
    const cols = 2;
    const rows = 5;
    const leftMargin = 0.156;    // 5/32"
    const topMargin = 0.500;     // 1/2"
    const colSpacing = 0.1875;   // 3/16" gap between column 0 and column 1
    const rowSpacing = 0.0;      // 0 vertical gap between labels (touching)

    labels.forEach((label, index) => {
      const pageIndex = Math.floor(index / labelsPerPage);
      const positionOnPage = index % labelsPerPage;

      if (index > 0 && positionOnPage === 0) {
        doc.addPage('letter', 'portrait');
      }

      const col = positionOnPage % cols;
      const row = Math.floor(positionOnPage / cols);

      const x = leftMargin + col * (labelWidth + colSpacing);
      const y = topMargin + row * (labelHeight + rowSpacing);

      drawSingleLabel(doc, label, x, y, labelWidth, labelHeight, options);
    });
  }

  if (action === 'download') {
    doc.save(filename);
  } else if (action === 'open') {
    const url = doc.output('bloburl');
    window.open(url, '_blank');
  }

  return doc.output('blob');
}
