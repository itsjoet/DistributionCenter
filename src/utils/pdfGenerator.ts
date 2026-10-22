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
  fieldValueSize?: number;
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
    // Mode 2: Information Label (Balanced across full 4" x 2" area, matching preview)
    const leftMargin = originX + 0.28;
    const rightMargin = originX + width - 0.28;
    const contentWidth = width - 0.56;

    // Check if thumbnail is present
    const hasThumb = Boolean(label.thumbnailUrl);
    const thumbSize = 0.90;
    const textWidth = hasThumb ? contentWidth - thumbSize - 0.20 : contentWidth;

    if (hasThumb && label.thumbnailUrl) {
      try {
        const thumbX = rightMargin - thumbSize;
        const thumbY = originY + 0.22;
        doc.addImage(label.thumbnailUrl, 'JPEG', thumbX, thumbY, thumbSize, thumbSize, undefined, 'FAST');
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.01);
        doc.rect(thumbX, thumbY, thumbSize, thumbSize);
      } catch (e) {
        console.warn('Could not embed thumbnail into PDF', e);
      }
    }

    let dividerY = originY + 1.05;

    // Upper Section: Organization header (optional) & Image Name
    if (label.topTitle) {
      doc.setFont(fontName, 'bold');
      doc.setFontSize(options.titleSize || 11);
      doc.setTextColor(71, 85, 105);
      doc.text(label.topTitle.toUpperCase(), leftMargin, originY + 0.30);

      // Field Label for Image Name
      doc.setFont(fontName, 'bold');
      doc.setFontSize(options.subtitleSize || 9);
      doc.setTextColor(148, 163, 184);
      doc.text('IMAGE NAME', leftMargin, originY + 0.52);

      // Image Name primary value
      doc.setFont(fontName, 'bold');
      doc.setFontSize(options.primarySize || 16);
      doc.setTextColor(15, 23, 42);
      const splitName = doc.splitTextToSize(label.primaryCode || 'Untitled_Image.jpg', textWidth);
      doc.text(splitName[0] || '', leftMargin, originY + 0.80);
      dividerY = originY + 1.08;
    } else {
      // Standard: No company header - allocate generous vertical space to Image Name
      doc.setFont(fontName, 'bold');
      doc.setFontSize(options.subtitleSize || 9);
      doc.setTextColor(148, 163, 184);
      doc.text('IMAGE NAME', leftMargin, originY + 0.38);

      doc.setFont(fontName, 'bold');
      doc.setFontSize(options.primarySize || 18);
      doc.setTextColor(15, 23, 42);
      const splitName = doc.splitTextToSize(label.primaryCode || 'Untitled_Image.jpg', textWidth);
      doc.text(splitName[0] || '', leftMargin, originY + 0.72);
      dividerY = originY + 1.04;
    }

    // Ruled divider line across the center of the 4" x 2" label
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.012);
    doc.line(leftMargin, dividerY, rightMargin, dividerY);

    // Lower Section: 2 Columns for Image Date & User's Name
    const col1X = leftMargin;
    const col2X = leftMargin + (contentWidth / 2) + 0.08;
    const fieldLabelY = dividerY + 0.28;
    const fieldValueY = fieldLabelY + 0.26;

    // Find date and user values from fields
    const dateVal = label.fields?.find((f) => f.label.toLowerCase().includes('date'))?.value || '';
    const userVal = label.fields?.find((f) => f.label.toLowerCase().includes('user'))?.value || 'Unassigned';

    // Column 1: Image Date
    doc.setFont(fontName, 'bold');
    doc.setFontSize(options.subtitleSize || 9);
    doc.setTextColor(148, 163, 184);
    doc.text('IMAGE DATE', col1X, fieldLabelY);

    doc.setFont(fontName, 'bold');
    doc.setFontSize(options.fieldValueSize || 13);
    doc.setTextColor(15, 23, 42);
    doc.text(dateVal, col1X, fieldValueY);

    // Column 2: User's Name
    doc.setFont(fontName, 'bold');
    doc.setFontSize(options.subtitleSize || 9);
    doc.setTextColor(148, 163, 184);
    doc.text("USER'S NAME", col2X, fieldLabelY);

    doc.setFont(fontName, 'bold');
    doc.setFontSize(options.fieldValueSize || 13);
    doc.setTextColor(15, 23, 42);
    const splitUser = doc.splitTextToSize(userVal, (contentWidth / 2) - 0.1);
    doc.text(splitUser[0] || '', col2X, fieldValueY);
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
    // Single 4" x 2" page per label (standard for direct thermal roll printers: 4" width x 2" height)
    doc = new jsPDF({
      orientation: 'landscape',
      unit: 'in',
      format: [4, 2],
    });

    labels.forEach((label, index) => {
      if (index > 0) {
        doc.addPage([4, 2], 'landscape');
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
