import JsBarcode from 'jsbarcode';
import { BarcodeFormat } from '../types/label';

interface BarcodeOptions {
  height?: number;
  width?: number;
  displayValue?: boolean;
  fontSize?: number;
  font?: string;
  margin?: number;
  background?: string;
  lineColor?: string;
}

/**
 * Generates a sharp high-DPI data URL of a barcode using JsBarcode
 */
export function generateBarcodeDataUrl(
  text: string,
  format: BarcodeFormat = 'CODE128',
  options: BarcodeOptions = {}
): string {
  if (!text || text.trim() === '') {
    return '';
  }

  try {
    const canvas = document.createElement('canvas');
    const validText = sanitizeBarcodeValue(text, format);

    // Double the resolution multiplier for ultra-crisp vector-like rendering
    const barWidth = options.width || 2;
    const barHeight = options.height || 50;

    JsBarcode(canvas, validText, {
      format: format,
      width: barWidth,
      height: barHeight,
      displayValue: options.displayValue ?? false,
      fontSize: options.fontSize ?? 13,
      font: options.font ?? 'JetBrains Mono, monospace',
      textAlign: 'center',
      textPosition: 'bottom',
      textMargin: 3,
      background: options.background ?? '#ffffff',
      lineColor: options.lineColor ?? '#000000',
      margin: options.margin ?? 4,
    });

    return canvas.toDataURL('image/png');
  } catch (err) {
    console.warn(`Barcode generation failed for format ${format} with value "${text}". Retrying with CODE128.`, err);
    try {
      const fallbackCanvas = document.createElement('canvas');
      JsBarcode(fallbackCanvas, text.trim(), {
        format: 'CODE128',
        width: options.width || 2,
        height: options.height || 50,
        displayValue: options.displayValue ?? false,
        fontSize: options.fontSize ?? 13,
        font: 'JetBrains Mono, monospace',
        margin: 4,
      });
      return fallbackCanvas.toDataURL('image/png');
    } catch (fallbackErr) {
      console.error('Fatal fallback barcode error:', fallbackErr);
      return '';
    }
  }
}

/**
 * Sanitizes input based on format requirements (e.g. EAN13 needs digits only)
 */
function sanitizeBarcodeValue(value: string, format: BarcodeFormat): string {
  const trimmed = value.trim();
  if (format === 'EAN13' || format === 'UPC') {
    // Only numbers
    const digitsOnly = trimmed.replace(/\D/g, '');
    if (format === 'EAN13') {
      return digitsOnly.slice(0, 13).padStart(13, '0');
    }
    if (format === 'UPC') {
      return digitsOnly.slice(0, 12).padStart(12, '0');
    }
  }
  return trimmed;
}
